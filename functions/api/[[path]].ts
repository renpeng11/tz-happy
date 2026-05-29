type Env = {
  DB: D1Database;
};

export const onRequest: PagesFunction<Env> = async (context) => {
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
    return new Response(JSON.stringify({
      error: "Database not configured",
      env_keys: Object.keys(env || {}),
      has_db: !!env?.DB
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // GET /api/votes - 获取投票统计
    if (method === 'GET' && path === '/api/votes') {
      const { results } = await db.prepare(
        "SELECT route_id, COUNT(*) as count FROM votes GROUP BY route_id ORDER BY route_id",
      ).all();

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
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /api/auth/login - 指纹登录
    if (method === 'POST' && path === '/api/auth/login') {
      const { fingerprint } = await request.json();

      if (!fingerprint) {
        return new Response(JSON.stringify({ error: "Fingerprint required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const existingUser = await db.prepare(
        "SELECT * FROM users WHERE openid = ?",
      )
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

        const result = await db.prepare(
          "INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)",
        )
          .bind(fingerprint, defaultNickname, avatar)
          .run();
        userId = result.meta.last_row_id as number;
        userNickname = defaultNickname;
        userAvatar = avatar;
      }

      const voted = await db.prepare(
        "SELECT * FROM votes WHERE user_id = ?",
      )
        .bind(userId)
        .first();

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userId,
          nickname: userNickname,
          avatar: userAvatar,
          hasVoted: !!voted,
          votedRoute: voted ? (voted as any).route_id : null,
        },
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /api/votes - 提交投票
    if (method === 'POST' && path === '/api/votes') {
      const { routeId, userId } = await request.json();

      if (!routeId || routeId < 1 || routeId > 7) {
        return new Response(JSON.stringify({ error: "Invalid routeId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      const existingVote = await db.prepare(
        "SELECT * FROM votes WHERE user_id = ?",
      )
        .bind(userId)
        .first();

      if (existingVote) {
        return new Response(JSON.stringify({ error: "Already voted" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      await db.prepare("INSERT INTO votes (route_id, user_id) VALUES (?, ?)")
        .bind(routeId, userId)
        .run();

      const { results } = await db.prepare(
        "SELECT route_id, COUNT(*) as count FROM votes GROUP BY route_id ORDER BY route_id",
      ).all();

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
        headers: { "Content-Type": "application/json" }
      });
    }

    // GET /api/votes/details - 获取投票详情
    if (method === 'GET' && path === '/api/votes/details') {
      const { results } = await db.prepare(
        "SELECT v.*, u.nickname, u.avatar FROM votes v LEFT JOIN users u ON v.user_id = u.id ORDER BY v.created_at DESC LIMIT 50",
      ).all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /api/votes/reset - 重置投票
    if (method === 'POST' && path === '/api/votes/reset') {
      const { userId, routeId } = await request.json();

      if (!userId) {
        return new Response(JSON.stringify({ error: "User not logged in" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (!routeId || routeId < 1 || routeId > 7) {
        return new Response(JSON.stringify({ error: "Invalid routeId" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      await db.prepare("DELETE FROM votes WHERE user_id = ? AND route_id = ?")
        .bind(userId, routeId)
        .run();

      const { results } = await db.prepare(
        "SELECT route_id, COUNT(*) as count FROM votes GROUP BY route_id ORDER BY route_id",
      ).all();

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
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST /api/votes/clear - 清空所有投票
    if (method === 'POST' && path === '/api/votes/clear') {
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
        headers: { "Content-Type": "application/json" }
      });
    }

    // 404 Not Found
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
