const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const fail = (error, status = 400) => json({ error }, status);
const enc = new TextEncoder();
const dec = new TextDecoder();
function b64(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
function unb64(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(s + "=".repeat((4 - s.length % 4) % 4)); return Uint8Array.from(raw, c => c.charCodeAt(0)); }
async function key(secret) { return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
async function makeToken(payload, secret) { const body = b64(enc.encode(JSON.stringify(payload))); const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(body)); return body + "." + b64(new Uint8Array(sig)); }
async function readToken(token, secret) { try { const p = token.split("."); if (p.length !== 2 || !secret) return null; if (!await crypto.subtle.verify("HMAC", await key(secret), unb64(p[1]), enc.encode(p[0]))) return null; const payload = JSON.parse(dec.decode(unb64(p[0]))); return payload.exp > Date.now() / 1000 ? payload : null; } catch { return null; } }
async function hashPassword(password, salt) { const material = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt || crypto.getRandomValues(new Uint8Array(16)), iterations: 210000, hash: "SHA-256" }, material, 256); return { salt: b64(salt || new Uint8Array([])), hash: b64(new Uint8Array(bits)) }; }
async function passwordRecord(password, salt) { const saltBytes = salt || crypto.getRandomValues(new Uint8Array(16)); const material = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: 210000, hash: "SHA-256" }, material, 256); return { salt: b64(saltBytes), hash: b64(new Uint8Array(bits)) }; }
async function matches(password, salt, expected) { const actual = await passwordRecord(password, unb64(salt)); const a = unb64(actual.hash), b = unb64(expected); if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]; return diff === 0; }
function bearer(request) { const h = request.headers.get("authorization") || ""; return h.startsWith("Bearer ") ? h.slice(7) : new URL(request.url).searchParams.get("token") || ""; }
async function auth(request, env) { const claims = await readToken(bearer(request), env.JWT_SECRET); if (!claims || !claims.sub) return null; return await env.DB.prepare("SELECT id, username, avatar_json, created_at FROM users WHERE id = ?").bind(claims.sub).first(); }
function safeUser(u) { return { id: u.id, username: u.username, avatar: JSON.parse(u.avatar_json || "{}"), createdAt: u.created_at }; }
async function body(request) { try { return await request.json(); } catch { return null; } }

export class RoomHub {
  constructor(state) { this.state = state; this.sockets = new Map(); }
  async fetch(request) {
    if (request.headers.get("upgrade") !== "websocket") return fail("WebSocket upgrade required", 426);
    const player = { id: request.headers.get("x-qaz-player-id") || "", username: request.headers.get("x-qaz-player-name") || "Игрок" };
    if (!player.id) return fail("Unauthorized", 401);
    const pair = new WebSocketPair(); const client = pair[0], server = pair[1]; server.accept();
    this.sockets.set(server, player); server.send(JSON.stringify({ type: "welcome", playerId: player.id }));
    this.broadcast({ type: "presence", players: Array.from(this.sockets.values()) }, server);
    const close = () => { this.sockets.delete(server); this.broadcast({ type: "presence", players: Array.from(this.sockets.values()) }); };
    server.addEventListener("close", close); server.addEventListener("error", close);
    server.addEventListener("message", event => { try { const m = JSON.parse(event.data); if (m.type === "move" && Number.isFinite(Number(m.x)) && Number.isFinite(Number(m.z)) && Math.abs(Number(m.x)) <= 30 && Math.abs(Number(m.z)) <= 30) this.broadcast({ type: "player-moved", playerId: player.id, x: Number(m.x), z: Number(m.z) }); if (m.type === "chat" && typeof m.text === "string") { const text = m.text.trim().slice(0, 240); if (text) this.broadcast({ type: "chat", playerId: player.id, username: player.username, text, at: Date.now() }); } } catch {} });
    return new Response(null, { status: 101, webSocket: client });
  }
  broadcast(message, except) { const data = JSON.stringify(message); for (const socket of this.sockets.keys()) { if (socket === except) continue; try { socket.send(data); } catch { this.sockets.delete(socket); } } }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url); const path = url.pathname.replace(/\/+$/, "") || "/";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "access-control-allow-origin": url.origin, "access-control-allow-methods": "GET,POST,PUT,OPTIONS", "access-control-allow-headers": "content-type,authorization" } });
    try {
      if (path === "/api/health") return json({ ok: true, service: "qazworld-api", version: 2 });
      if (!path.startsWith("/api/")) return env.ASSETS ? env.ASSETS.fetch(request) : fail("Static assets binding ASSETS is missing.", 503);
      if (!env.DB || !env.JWT_SECRET) return fail("Server is not configured: add D1 binding DB and JWT_SECRET secret.", 503);
      if (path === "/api/auth/register" && request.method === "POST") {
        const b = await body(request), email = String(b && b.email || "").trim().toLowerCase(), password = String(b && b.password || ""), username = String(b && b.username || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190) return fail("Укажи корректный email.");
        if (password.length < 8 || password.length > 128) return fail("Пароль должен содержать от 8 до 128 символов.");
        if (!/^[\p{L}\p{N}_ -]{2,18}$/u.test(username)) return fail("Имя игрока: 2–18 символов, буквы, цифры, пробел, дефис или _.");
        const exists = await env.DB.prepare("SELECT id FROM users WHERE email = ? OR username = ? COLLATE NOCASE").bind(email, username).first();
        if (exists) return fail("Этот email или ник уже занят.", 409);
        const id = crypto.randomUUID(), pass = await passwordRecord(password), now = new Date().toISOString();
        const avatar = { outfit: "#7256d8", skin: "#d99a72", hair: "#392a2b", style: "casual" };
        await env.DB.prepare("INSERT INTO users (id,email,username,password_hash,password_salt,avatar_json,created_at) VALUES (?,?,?,?,?,?,?)").bind(id,email,username,pass.hash,pass.salt,JSON.stringify(avatar),now).run();
        await env.DB.prepare("INSERT INTO player_progress (user_id, coins, inventory_json, house_json, updated_at) VALUES (?,350,'[\"hoodie\"]','[]',?)").bind(id,now).run();
        const token = await makeToken({ sub: id, exp: Math.floor(Date.now()/1000) + 1209600 }, env.JWT_SECRET);
        return json({ token, user: { id, username, avatar } }, 201);
      }
      if (path === "/api/auth/login" && request.method === "POST") {
        const b = await body(request), email = String(b && b.email || "").trim().toLowerCase(), password = String(b && b.password || "");
        const u = await env.DB.prepare("SELECT id,username,password_hash,password_salt,avatar_json,created_at FROM users WHERE email = ?").bind(email).first();
        if (!u || !(await matches(password,u.password_salt,u.password_hash))) return fail("Неверный email или пароль.", 401);
        const token = await makeToken({ sub: u.id, exp: Math.floor(Date.now()/1000) + 1209600 }, env.JWT_SECRET);
        return json({ token, user: safeUser(u) });
      }
      if (path === "/api/me" && request.method === "GET") { const u = await auth(request,env); return u ? json({ user: safeUser(u) }) : fail("Нужен вход в аккаунт.",401); }
      if (path === "/api/progress" && request.method === "GET") {
        const u = await auth(request,env); if (!u) return fail("Нужен вход в аккаунт.",401);
        const p = await env.DB.prepare("SELECT coins,inventory_json,house_json,updated_at FROM player_progress WHERE user_id = ?").bind(u.id).first();
        return json({ coins: p ? p.coins : 350, inventory: JSON.parse(p ? p.inventory_json : '["hoodie"]'), house: JSON.parse(p ? p.house_json : "[]"), updatedAt: p && p.updated_at, avatar: JSON.parse(u.avatar_json || "{}") });
      }
      if (path === "/api/progress" && request.method === "PUT") {
        const u = await auth(request,env); if (!u) return fail("Нужен вход в аккаунт.",401);
        const b = await body(request), coins = Number(b && b.coins), inventory = b && b.inventory, house = b && b.house, avatar = b && b.avatar;
        if (!Number.isSafeInteger(coins) || coins < 0 || coins > 100000000) return fail("Некорректный баланс.");
        if (!Array.isArray(inventory) || inventory.length > 200 || !Array.isArray(house) || house.length > 100) return fail("Некорректные данные инвентаря или дома.");
        if (!avatar || typeof avatar !== "object" || JSON.stringify(avatar).length > 4000) return fail("Некорректный аватар.");
        const now = new Date().toISOString();
        await env.DB.batch([env.DB.prepare("UPDATE player_progress SET coins=?,inventory_json=?,house_json=?,updated_at=? WHERE user_id=?").bind(coins,JSON.stringify(inventory),JSON.stringify(house),now,u.id),env.DB.prepare("UPDATE users SET avatar_json=? WHERE id=?").bind(JSON.stringify(avatar),u.id)]);
        return json({ ok: true, updatedAt: now });
      }
      const roomMatch = path.match(/^\/api\/rooms\/([a-zA-Z0-9_-]{1,40})\/ws$/);
      if (roomMatch && request.headers.get("upgrade") === "websocket") {
        const u = await auth(request,env); if (!u) return fail("Нужен вход в аккаунт.",401);
        const id = env.ROOMS.idFromName(roomMatch[1]), room = env.ROOMS.get(id), headers = new Headers(request.headers);
        headers.set("x-qaz-player-id",u.id); headers.set("x-qaz-player-name",u.username);
        return room.fetch(new Request(request,{headers}));
      }
      return fail("Маршрут не найден.",404);
    } catch (error) { console.error("QazWorld API error",error); return fail("Внутренняя ошибка сервера.",500); }
  }
};