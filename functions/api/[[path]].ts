export const onRequest = async (context: any) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  console.log(`Request: ${method} ${path}`);
  console.log(`env type: ${typeof env}`);
  console.log(`env keys: ${Object.keys(env || {})}`);
  console.log(`DB binding exists: ${!!env?.DB}`);

  // 尝试从不同位置获取 DB
  const db = env?.DB || (env as any)?.db || (env as any)?.database;
  console.log(`Final DB: ${!!db}`);

  if (!db) {
    return new Response(
      JSON.stringify({
        error: "Database not configured",
        env_keys: Object.keys(env || {}),
        has_db: !!env?.DB,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // GET /api/votes - 获取投票统计
    if (method === "GET" && path === "/api/votes") {
      const { results } = await db
        .prepare(
          "SELECT route_id, COUNT(*) as count FROM votes GROUP BY route_id ORDER BY route_id",
        )
        .all();

      const votes: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };
      results.forEach((row: any) => {
        votes[row.route_id] = row.count;
      });

      return new Response(JSON.stringify(votes), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/auth/login - 指纹登录
    if (method === "POST" && path === "/api/auth/login") {
      const { fingerprint } = await request.json();

      if (!fingerprint) {
        return new Response(JSON.stringify({ error: "Fingerprint required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const existingUser = await db
        .prepare("SELECT * FROM users WHERE openid = ?")
        .bind(fingerprint)
        .first();

      let userId: number;
      let userNickname: string;
      let userAvatar: string;

      if (existingUser) {
        userId = (existingUser as any).id;
        userNickname = (existingUser as any).nickname;
        userAvatar = (existingUser as any).avatar;
      } else {
        const defaultNickname = "游客" + Math.floor(Math.random() * 10000);
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fingerprint}`;

        const result = await db
          .prepare(
            "INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)",
          )
          .bind(fingerprint, defaultNickname, avatar)
          .run();
        userId = result.meta.last_row_id as number;
        userNickname = defaultNickname;
        userAvatar = avatar;
      }

      const voted = await db
        .prepare("SELECT * FROM votes WHERE user_id = ?")
        .bind(userId)
        .first();

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: userId,
            nickname: userNickname,
            avatar: userAvatar,
            hasVoted: !!voted,
            votedRoute: voted ? (voted as any).route_id : null,
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // POST /api/votes - 提交投票
    if (method === "POST" && path === "/api/votes") {
      const { routeId, userId } = await request.json();

      if (!routeId || routeId < 1 || routeId > 7) {
        return new Response(JSON.stringify({ error: "Invalid routeId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const existingVote = await db
        .prepare("SELECT * FROM votes WHERE user_id = ?")
        .bind(userId)
        .first();

      if (existingVote) {
        return new Response(JSON.stringify({ error: "Already voted" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .prepare("INSERT INTO votes (route_id, user_id) VALUES (?, ?)")
        .bind(routeId, userId)
        .run();

      const { results } = await db
        .prepare(
          "SELECT route_id, COUNT(*) as count FROM votes GROUP BY route_id ORDER BY route_id",
        )
        .all();

      const votes: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };
      results.forEach((row: any) => {
        votes[row.route_id] = row.count;
      });

      return new Response(JSON.stringify({ success: true, votes }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/votes/details - 获取投票详情
    if (method === "GET" && path === "/api/votes/details") {
      const { results } = await db
        .prepare(
          "SELECT v.*, u.nickname, u.avatar FROM votes v LEFT JOIN users u ON v.user_id = u.id ORDER BY v.created_at DESC LIMIT 50",
        )
        .all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/votes/reset - 重置投票
    if (method === "POST" && path === "/api/votes/reset") {
      const { userId, routeId } = await request.json();

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!routeId || routeId < 1 || routeId > 7) {
        return new Response(JSON.stringify({ error: "Invalid routeId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .prepare("DELETE FROM votes WHERE user_id = ? AND route_id = ?")
        .bind(userId, routeId)
        .run();

      const { results } = await db
        .prepare(
          "SELECT route_id, COUNT(*) as count FROM votes GROUP BY route_id ORDER BY route_id",
        )
        .all();

      const votes: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };
      results.forEach((row: any) => {
        votes[row.route_id] = row.count;
      });

      return new Response(JSON.stringify({ success: true, votes }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/votes/clear - 清空所有投票
    if (method === "POST" && path === "/api/votes/clear") {
      await db.prepare("DELETE FROM votes").run();

      const votes: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };

      return new Response(JSON.stringify({ success: true, votes }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/expenses - 获取花销列表
    if (method === "GET" && path === "/api/expenses") {
      const routeId = parseInt(url.searchParams.get("routeId") || "1");

      const { results } = await db
        .prepare(
          "SELECT * FROM expenses WHERE route_id = ? ORDER BY day, created_at",
        )
        .bind(routeId)
        .all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/expenses - 添加花销
    if (method === "POST" && path === "/api/expenses") {
      const {
        routeId,
        day,
        name,
        amount,
        category,
        time,
        userId,
        userName,
        userAvatar,
      } = await request.json();

      if (!routeId || !day || !name || !amount || !category) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const result = await db
        .prepare(
          "INSERT INTO expenses (route_id, day, name, amount, category, time, user_id, user_name, user_avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          routeId,
          day,
          name,
          amount,
          category,
          time,
          userId,
          userName,
          userAvatar,
        )
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          id: result.meta.last_row_id,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // DELETE /api/expenses/:id - 删除单条花销
    if (method === "DELETE" && path.match(/^\/api\/expenses\/\d+$/)) {
      const expenseId = parseInt(path.split("/").pop() || "0");

      if (!expenseId) {
        return new Response(JSON.stringify({ error: "Invalid expense ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .prepare("DELETE FROM expenses WHERE id = ?")
        .bind(expenseId)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE /api/expenses/all - 清空所有花销
    if (method === "DELETE" && path === "/api/expenses/all") {
      const routeId = parseInt(url.searchParams.get("routeId") || "1");

      await db
        .prepare("DELETE FROM expenses WHERE route_id = ?")
        .bind(routeId)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/decisions - 创建决策投票
    if (method === "POST" && path === "/api/decisions") {
      const { title, description, options, userId, duration } =
        await request.json();

      if (!options || !Array.isArray(options) || options.length < 2) {
        return new Response(JSON.stringify({ error: "至少需要2个选项" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const validOptions = options.filter(
        (o: string) => typeof o === "string" && o.trim(),
      );
      if (validOptions.length < 2) {
        return new Response(JSON.stringify({ error: "至少需要2个有效选项" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const validDurations: Record<string, number> = {
        "1h": 60 * 60 * 1000,
        "3h": 3 * 60 * 60 * 1000,
        "5h": 5 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
      };

      const finalDuration = duration || "1d";
      const durationMs =
        validDurations[finalDuration] || validDurations["1d"];
      const expiresAt = new Date(Date.now() + durationMs);

      const decisionResult = await db
        .prepare(
          "INSERT INTO decisions (title, description, created_by, expires_at, duration) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(
          title || "",
          description || "",
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
          .prepare(
            "INSERT INTO decision_options (decision_id, text) VALUES (?, ?)",
          )
          .bind(decisionId, optionText.trim())
          .run();
      }

      return new Response(JSON.stringify({ success: true, decisionId }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/decisions - 获取所有决策列表
    if (method === "GET" && path === "/api/decisions") {
      const { results } = await db
        .prepare(
          "SELECT d.*, COUNT(o.id) as option_count, SUM(o.votes) as total_votes FROM decisions d LEFT JOIN decision_options o ON d.id = o.decision_id WHERE d.is_active = 1 GROUP BY d.id ORDER BY d.created_at DESC",
        )
        .all();

      const formattedResults = results.map((row: any) => ({
        ...row,
        created_at: new Date(row.created_at).toISOString(),
        expires_at: row.expires_at
          ? new Date(row.expires_at).toISOString()
          : null,
      }));

      return new Response(JSON.stringify(formattedResults), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/decisions/:id - 获取单个决策详情
    if (method === "GET" && path.match(/^\/api\/decisions\/\d+$/)) {
      const decisionId = parseInt(path.split("/").pop() || "0");

      if (!decisionId) {
        return new Response(JSON.stringify({ error: "Invalid decision ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const decision = await db
        .prepare("SELECT * FROM decisions WHERE id = ? AND is_active = 1")
        .bind(decisionId)
        .first();

      if (!decision) {
        return new Response(JSON.stringify({ error: "Decision not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { results } = await db
        .prepare(
          "SELECT * FROM decision_options WHERE decision_id = ? ORDER BY id",
        )
        .bind(decisionId)
        .all();

      return new Response(
        JSON.stringify({
          decision,
          options: results,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // POST /api/decisions/:id/vote - 为决策投票
    if (method === "POST" && path.match(/^\/api\/decisions\/\d+\/vote$/)) {
      const parts = path.split("/");
      const decisionId = parseInt(parts[parts.length - 2] || "0");
      const { optionId, userId } = await request.json();

      if (!decisionId || !optionId) {
        return new Response(
          JSON.stringify({ error: "Invalid decision or option ID" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const userIdStr = String(userId);

      const decision = await db
        .prepare(
          "SELECT expires_at FROM decisions WHERE id = ? AND is_active = 1",
        )
        .bind(decisionId)
        .first();

      if (!decision) {
        return new Response(JSON.stringify({ error: "Decision not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const expiresAt = (decision as any).expires_at;
      if (expiresAt && new Date(expiresAt) < new Date()) {
        return new Response(JSON.stringify({ error: "Decision has expired" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const existingVote = await db
        .prepare(
          "SELECT * FROM decision_votes WHERE decision_id = ? AND user_id = ?",
        )
        .bind(decisionId, userIdStr)
        .first();

      if (existingVote) {
        return new Response(JSON.stringify({ error: "Already voted" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .prepare(
          "INSERT INTO decision_votes (decision_id, option_id, user_id) VALUES (?, ?, ?)",
        )
        .bind(decisionId, optionId, userIdStr)
        .run();

      await db
        .prepare("UPDATE decision_options SET votes = votes + 1 WHERE id = ?")
        .bind(optionId)
        .run();

      const { results } = await db
        .prepare(
          "SELECT * FROM decision_options WHERE decision_id = ? ORDER BY id",
        )
        .bind(decisionId)
        .all();

      return new Response(JSON.stringify({ success: true, options: results }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE /api/decisions/:id - 删除决策
    if (method === "DELETE" && path.match(/^\/api\/decisions\/\d+$/)) {
      const decisionId = parseInt(path.split("/").pop() || "0");

      if (!decisionId) {
        return new Response(JSON.stringify({ error: "Invalid decision ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .prepare("UPDATE decisions SET is_active = 0 WHERE id = ?")
        .bind(decisionId)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/checklist - 获取清单列表
    if (method === "GET" && path === "/api/checklist") {
      const userId = url.searchParams.get("userId");

      // 获取所有清单项目
      const { results: checklistItems } = await db
        .prepare("SELECT * FROM checklist ORDER BY created_at DESC")
        .all();

      // 如果有用户ID，获取该用户的勾选状态
      let userChecklist: any[] = [];
      if (userId) {
        const { results } = await db
          .prepare(
            "SELECT checklist_id, is_checked FROM checklist_user WHERE user_id = ?",
          )
          .bind(userId)
          .all();
        userChecklist = results;
      }

      // 合并数据
      const resultItems = (checklistItems as any[]).map((item) => {
        const userItem = userChecklist.find((u) => u.checklist_id === item.id);
        return {
          ...item,
          is_checked: userItem ? userItem.is_checked : 0,
        };
      });

      // 按勾选状态排序
      resultItems.sort((a, b) => {
        if (a.is_checked !== b.is_checked) {
          return a.is_checked - b.is_checked;
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      return new Response(JSON.stringify(resultItems), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/checklist - 添加清单项目
    if (method === "POST" && path === "/api/checklist") {
      const { name } = await request.json();

      if (!name || !name.trim()) {
        return new Response(JSON.stringify({ error: "Name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await db
        .prepare("INSERT INTO checklist (name) VALUES (?)")
        .bind(name.trim())
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          id: result.meta.last_row_id,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // PUT /api/checklist/:id/toggle - 切换清单项目的选中状态
    if (method === "PUT" && path.match(/^\/api\/checklist\/\d+\/toggle$/)) {
      const checklistId = parseInt(path.split("/")[3] || "0");
      const { userId } = await request.json();

      if (!checklistId) {
        return new Response(JSON.stringify({ error: "Invalid checklist ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User ID is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 检查清单项目是否存在
      const checklistItem = await db
        .prepare("SELECT id FROM checklist WHERE id = ?")
        .bind(checklistId)
        .first();

      if (!checklistItem) {
        return new Response(
          JSON.stringify({ error: "Checklist item not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // 查找用户的记录
      const existingRecord = await db
        .prepare(
          "SELECT id, is_checked FROM checklist_user WHERE checklist_id = ? AND user_id = ?",
        )
        .bind(checklistId, userId)
        .first();

      let newCheckedStatus: number;
      if (existingRecord) {
        // 更新现有记录
        newCheckedStatus = (existingRecord as any).is_checked === 1 ? 0 : 1;
        await db
          .prepare("UPDATE checklist_user SET is_checked = ? WHERE id = ?")
          .bind(newCheckedStatus, (existingRecord as any).id)
          .run();
      } else {
        // 创建新记录
        newCheckedStatus = 1;
        await db
          .prepare(
            "INSERT INTO checklist_user (checklist_id, user_id, is_checked) VALUES (?, ?, ?)",
          )
          .bind(checklistId, userId, newCheckedStatus)
          .run();
      }

      return new Response(
        JSON.stringify({ success: true, is_checked: newCheckedStatus }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // DELETE /api/checklist/:id - 删除清单项目
    if (method === "DELETE" && path.match(/^\/api\/checklist\/\d+$/)) {
      const checklistId = parseInt(path.split("/").pop() || "0");

      if (!checklistId) {
        return new Response(JSON.stringify({ error: "Invalid checklist ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await db
        .prepare("DELETE FROM checklist WHERE id = ?")
        .bind(checklistId)
        .run();

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /api/decisions/:id/user-vote - 检查用户是否已投票
    if (method === "GET" && path.match(/^\/api\/decisions\/\d+\/user-vote$/)) {
      const parts = path.split("/");
      const decisionId = parseInt(parts[parts.length - 2] || "0");
      const userId = url.searchParams.get("userId");

      if (!decisionId || !userId) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const vote = await db
        .prepare(
          "SELECT option_id FROM decision_votes WHERE decision_id = ? AND user_id = ?",
        )
        .bind(decisionId, userId)
        .first();

      return new Response(
        JSON.stringify({
          hasVoted: !!vote,
          votedOptionId: vote ? (vote as any).option_id : null,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // POST /api/decisions/:id/reopen - 重新开启已结束的投票
    if (method === "POST" && path.match(/^\/api\/decisions\/\d+\/reopen$/)) {
      const parts = path.split("/");
      const decisionId = parseInt(parts[parts.length - 2] || "0");
      const { userId, duration } = await request.json();

      if (!decisionId) {
        return new Response(JSON.stringify({ error: "Invalid decision ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 获取原投票信息
      const originalDecision = await db
        .prepare("SELECT * FROM decisions WHERE id = ?")
        .bind(decisionId)
        .first();

      if (!originalDecision) {
        return new Response(JSON.stringify({ error: "Decision not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 获取原投票选项
      const { results: originalOptions } = await db
        .prepare(
          "SELECT text FROM decision_options WHERE decision_id = ? ORDER BY id",
        )
        .bind(decisionId)
        .all();

      const validDurations: Record<string, number> = {
        "1h": 60 * 60 * 1000,
        "3h": 3 * 60 * 60 * 1000,
        "5h": 5 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
      };

      // 复用原来的 duration，如果没有则使用默认的 1d
      const originalDuration = (originalDecision as any).duration;
      const finalDuration = duration || originalDuration || "1d";
      const durationMs =
        validDurations[finalDuration] || validDurations["1d"];
      const expiresAt = new Date(Date.now() + durationMs);

      // 创建新投票
      const decisionResult = await db
        .prepare(
          "INSERT INTO decisions (title, description, created_by, expires_at, duration) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(
          (originalDecision as any).title || "",
          (originalDecision as any).description || "",
          userId,
          expiresAt.toISOString(),
          finalDuration
        )
        .run();

      const newDecisionId = decisionResult.meta.last_row_id as number;

      // 更新新投票的创建时间
      await db
        .prepare("UPDATE decisions SET created_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), newDecisionId)
        .run();

      // 复制原投票的所有选项
      for (const optionRow of originalOptions as any[]) {
        await db
          .prepare(
            "INSERT INTO decision_options (decision_id, text) VALUES (?, ?)",
          )
          .bind(newDecisionId, optionRow.text)
          .run();
      }

      return new Response(
        JSON.stringify({ success: true, decisionId: newDecisionId }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // POST /api/decisions/:id/recreate-from-tie - 基于平票创建新投票
    if (
      method === "POST" &&
      path.match(/^\/api\/decisions\/\d+\/recreate-from-tie$/)
    ) {
      const parts = path.split("/");
      const decisionId = parseInt(parts[parts.length - 2] || "0");
      const { userId, duration, optionTexts } = await request.json();

      if (!decisionId) {
        return new Response(JSON.stringify({ error: "Invalid decision ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (
        !optionTexts ||
        !Array.isArray(optionTexts) ||
        optionTexts.length < 2
      ) {
        return new Response(JSON.stringify({ error: "至少需要2个选项" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 获取原投票信息
      const originalDecision = await db
        .prepare("SELECT * FROM decisions WHERE id = ?")
        .bind(decisionId)
        .first();

      if (!originalDecision) {
        return new Response(JSON.stringify({ error: "Decision not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const validDurations: Record<string, number> = {
        "1h": 60 * 60 * 1000,
        "3h": 3 * 60 * 60 * 1000,
        "5h": 5 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
      };

      // 复用原来的 duration，如果没有则使用默认的 1d
      const originalDuration = (originalDecision as any).duration;
      const finalDuration = duration || originalDuration || "1d";
      const durationMs =
        validDurations[finalDuration] || validDurations["1d"];
      const expiresAt = new Date(Date.now() + durationMs);

      // 创建新投票
      const decisionResult = await db
        .prepare(
          "INSERT INTO decisions (title, description, created_by, expires_at, duration) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(
          (originalDecision as any).title || "",
          (originalDecision as any).description || "",
          userId,
          expiresAt.toISOString(),
          finalDuration
        )
        .run();

      const newDecisionId = decisionResult.meta.last_row_id as number;

      // 更新新投票的创建时间
      await db
        .prepare("UPDATE decisions SET created_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), newDecisionId)
        .run();

      // 只添加平票的选项
      for (const optionText of optionTexts) {
        if (optionText && optionText.trim()) {
          await db
            .prepare(
              "INSERT INTO decision_options (decision_id, text) VALUES (?, ?)",
            )
            .bind(newDecisionId, optionText.trim())
            .run();
        }
      }

      return new Response(
        JSON.stringify({ success: true, decisionId: newDecisionId }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 404 Not Found
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
