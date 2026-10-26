const API_BASE = import.meta.env.VITE_API_BASE || "";
export function getToken() { return localStorage.getItem("qazworld-token") || ""; }
export function setToken(token) { if (token) localStorage.setItem("qazworld-token", token); else localStorage.removeItem("qazworld-token"); }
export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {}); headers.set("content-type","application/json");
  const token = getToken(); if (token) headers.set("authorization","Bearer " + token);
  const response = await fetch(API_BASE + path,{...options,headers}); const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Ошибка сервера (" + response.status + ")");
  return data;
}
export async function register(credentials) { const r = await api("/api/auth/register",{method:"POST",body:JSON.stringify(credentials)}); setToken(r.token); return r.user; }
export async function login(credentials) { const r = await api("/api/auth/login",{method:"POST",body:JSON.stringify(credentials)}); setToken(r.token); return r.user; }
export function loadProgress() { return api("/api/progress"); }
export function saveProgress(progress) { return api("/api/progress",{method:"PUT",body:JSON.stringify(progress)}); }
export function connectRoom(roomName, handlers = {}) {
  const token = getToken(); if (!token) throw new Error("Сначала войди в аккаунт.");
  const url = new URL("/api/rooms/" + encodeURIComponent(roomName) + "/ws",API_BASE || window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"; url.searchParams.set("token",token);
  const socket = new WebSocket(url);
  socket.addEventListener("message",e => { try { handlers.onMessage && handlers.onMessage(JSON.parse(e.data)); } catch {} });
  socket.addEventListener("open",() => handlers.onOpen && handlers.onOpen());
  socket.addEventListener("close",() => handlers.onClose && handlers.onClose());
  socket.addEventListener("error",() => handlers.onError && handlers.onError());
  return socket;
}