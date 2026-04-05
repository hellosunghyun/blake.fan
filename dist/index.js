var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}
__name(json, "json");
async function hashIP(ip) {
  const data = new TextEncoder().encode(ip + "_blake_fan_salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash).slice(0, 8)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashIP, "hashIP");
async function getEntries(env, url) {
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const { results } = await env.DB.prepare(
    "SELECT id, nickname, emoji, message, created_at FROM guestbook ORDER BY created_at DESC LIMIT ? OFFSET ?"
  ).bind(limit, offset).all();
  return json(results);
}
__name(getEntries, "getEntries");
async function createEntry(request, env) {
  const body = await request.json();
  const nickname = (body.nickname || "").trim();
  const message = (body.message || "").trim();
  const emoji = body.emoji || "\u{1F496}";
  if (!nickname || !message) {
    return json({ error: "\uB2C9\uB124\uC784\uACFC \uBA54\uC2DC\uC9C0\uB97C \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694." }, 400);
  }
  if (nickname.length > 20) {
    return json({ error: "\uB2C9\uB124\uC784\uC740 20\uC790 \uC774\uD558\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694." }, 400);
  }
  if (message.length > 500) {
    return json({ error: "\uBA54\uC2DC\uC9C0\uB294 500\uC790 \uC774\uD558\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694." }, 400);
  }
  const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
  const ipHash = await hashIP(clientIP);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) as cnt FROM guestbook WHERE ip_hash = ? AND created_at > datetime('now', '-30 seconds')"
  ).bind(ipHash).first();
  if (recent && recent.cnt > 0) {
    return json({ error: "\uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694." }, 429);
  }
  await env.DB.prepare("INSERT INTO guestbook (nickname, emoji, message, ip_hash) VALUES (?, ?, ?, ?)").bind(nickname, emoji, message, ipHash).run();
  return json({ success: true }, 201);
}
__name(createEntry, "createEntry");
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (url.pathname === "/api/guestbook") {
      try {
        if (request.method === "GET") return await getEntries(env, url);
        if (request.method === "POST") return await createEntry(request, env);
        return json({ error: "Method not allowed" }, 405);
      } catch (e) {
        console.error(e);
        return json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
