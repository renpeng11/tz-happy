import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { createAgent, tool, toolStrategy } from "langchain";

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

const validDurations: Record<string, number> = {
  "1h": 60 * 60 * 1000,
  "3h": 3 * 60 * 60 * 1000,
  "5h": 5 * 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
};

const voteSchema = z.object({
  title: z.string().describe("投票标题，简洁明了"),
  description: z.string().describe("投票简介，80字以内"),
  options: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe("投票选项列表，2到5个"),
});

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const db = env?.DB || env?.db || env?.database;

  if (!db) {
    return jsonResponse({ error: "Database not configured" }, { status: 500 });
  }

  const { userInput, userId, duration, messages: chatHistory } =
    await request.json();

  if (!userInput || !userInput.trim()) {
    return jsonResponse({ error: "请输入投票描述内容" }, { status: 400 });
  }

  if (!userId) {
    return jsonResponse({ error: "User not logged in" }, { status: 401 });
  }

  const apiKey = env.DASHSCOPE_API_KEY;
  const llmBaseURL =
    env.LLM_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const llmModel = env.LLM_MODEL || "qwen-plus";
  const tavilyApiKey = env.TAVILY_API_KEY;

  if (!apiKey) {
    return jsonResponse({ error: "AI service not configured" }, { status: 500 });
  }

  const webSearchTool = tool(
    async ({ query }: { query: string }) => {
      if (!tavilyApiKey) {
        return "联网搜索功能未配置，跳过搜索。";
      }

      try {
        const resp = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query,
            max_results: 5,
            search_depth: "basic",
          }),
        });
        const data = (await resp.json()) as any;
        if (!data.results || data.results.length === 0) {
          return "未找到相关结果。";
        }
        return data.results
          .map(
            (r: any) =>
              `标题：${r.title}\n摘要：${r.content}\n链接：${r.url}`,
          )
          .join("\n\n");
      } catch (err: any) {
        return `搜索失败：${err.message}`;
      }
    },
    {
      name: "web_search",
      description:
        "联网搜索景点、餐厅、天气、路线、旅游攻略等当前信息，用来丰富投票选项。",
      schema: z.object({
        query: z.string().describe("搜索关键词，应为中文或英文"),
      }),
    },
  );

  const queryDatabaseTool = tool(
    async ({ sql, params }: { sql: string; params?: string[] }) => {
      const trimmedSql = sql.trim();
      const normalizedSql = trimmedSql.toUpperCase();

      if (!normalizedSql.startsWith("SELECT")) {
        return "错误：只允许执行 SELECT 查询。";
      }
      if (trimmedSql.includes(";") || /--|\/\*/.test(trimmedSql)) {
        return "错误：SQL 中不能包含分号或注释。";
      }

      try {
        const safeSql = /\bLIMIT\b/i.test(trimmedSql)
          ? trimmedSql
          : `${trimmedSql} LIMIT 20`;
        let stmt = db.prepare(safeSql);
        if (params && params.length > 0) {
          stmt = stmt.bind(...params);
        }
        const { results } = await stmt.all();
        if (!results || results.length === 0) {
          return "查询无结果。";
        }
        return JSON.stringify(results, null, 2);
      } catch (err: any) {
        return `数据库查询失败：${err.message}`;
      }
    },
    {
      name: "query_database",
      description: `查询当前应用的投票数据库。可用的表和字段：
- decisions: id, title, description, created_by, created_at, expires_at, is_active, duration
- decision_options: id, decision_id, text, votes
- decision_votes: id, decision_id, option_id, user_id, voted_at
- votes: id, route_id, user_id, created_at
- users: id, openid, nickname, avatar
- expenses: id, route_id, day, name, amount, category, time, user_id, user_name
- checklist: id, name, created_at
只允许 SELECT 查询。`,
      schema: z.object({
        sql: z.string().describe("SQL SELECT 语句"),
        params: z
          .array(z.string())
          .optional()
          .describe("参数化查询的参数列表，对应 SQL 中的 ? 占位符"),
      }),
    },
  );

  const llm = new ChatOpenAI({
    model: llmModel,
    openAIApiKey: apiKey,
    configuration: { baseURL: llmBaseURL },
    temperature: 0.7,
  });

  const agent = createAgent({
    model: llm,
    tools: [webSearchTool, queryDatabaseTool],
    systemPrompt:
      "你是一个台州自驾游内容运营助手。你的任务是根据用户输入创建一个可直接发起的小组投票。\n\n" +
      "你可以主动使用工具：\n" +
      "1. 当用户需要景点、餐厅、天气、路线、攻略或当前信息时，使用 web_search 联网搜索。\n" +
      "2. 当需要避免重复投票、参考历史投票、查看费用或已有路线偏好时，使用 query_database 查询应用数据。\n" +
      "3. 如果用户输入已经足够明确，可以不搜索，直接生成投票。\n\n" +
      "生成规则：标题简洁；简介不超过 80 个中文字符；选项必须具体、互斥、适合投票，数量 2 到 5 个。",
    responseFormat: toolStrategy(voteSchema) as any,
  });

  const inputMessages = [
    ...(Array.isArray(chatHistory)
      ? chatHistory.map((m: any) =>
          m.role === "user"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content),
        )
      : []),
    new HumanMessage(userInput.trim()),
  ];

  let agentResult: any;
  try {
    agentResult = await agent.invoke({ messages: inputMessages });
  } catch (aiError: any) {
    console.error("Agent invocation failed:", aiError);
    return jsonResponse(
      {
        error: "AI Agent 调用失败",
        details: aiError?.message || "Unknown error",
      },
      { status: 502 },
    );
  }

  const parsed = voteSchema.safeParse(agentResult.structuredResponse);
  if (!parsed.success) {
    return jsonResponse(
      {
        error: "AI 生成内容不完整",
        details: parsed.error.flatten(),
      },
      { status: 500 },
    );
  }

  const { title, description, options } = parsed.data;
  const validOptions = Array.from(
    new Set(options.map((o: string) => o.trim()).filter(Boolean)),
  ).slice(0, 5);

  if (!title.trim() || validOptions.length < 2) {
    return jsonResponse(
      { error: "AI 生成的标题或有效选项不足" },
      { status: 500 },
    );
  }

  const finalDuration = duration || "1d";
  const durationMs = validDurations[finalDuration] || validDurations["1d"];
  const expiresAt = new Date(Date.now() + durationMs);

  const decisionResult = await db
    .prepare(
      "INSERT INTO decisions (title, description, created_by, expires_at, duration) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(
      title.trim(),
      (description || "").trim(),
      userId,
      expiresAt.toISOString(),
      finalDuration,
    )
    .run();

  const decisionId = decisionResult.meta.last_row_id as number;

  await db
    .prepare("UPDATE decisions SET created_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), decisionId)
    .run();

  for (const optionText of validOptions) {
    await db
      .prepare("INSERT INTO decision_options (decision_id, text) VALUES (?, ?)")
      .bind(decisionId, optionText)
      .run();
  }

  return jsonResponse({
    success: true,
    decisionId,
    generated: { title, description, options: validOptions },
  });
};

