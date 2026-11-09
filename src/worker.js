// BarHopoly on Cloudflare.
//
// Static files in /public are served as-is. Everything live goes through /api/room?name=<room>,
// a WebSocket to one Durable Object per room:
//   "boards"        – the board layouts (bars, sets, prices). Writes need the ADMIN_KEY secret.
//   "games/<CODE>"  – one hosted game: its state doc and its players. Anyone with the code can play.
//
// Each room is a tiny document store: documents live at slash paths ("games/ABCD/players/u_123"),
// and every change is pushed to everyone connected to that room, so all phones stay in sync.

import { DurableObject } from "cloudflare:workers";
import { SEED_BOARDS } from "./seed.js";

const ROOM_RE = /^(boards|games\/[A-Z]{4})$/;
const MAX_DOC = 200_000; // bytes of JSON per document

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/room") {
      const name = url.searchParams.get("name") || "";
      if (!ROOM_RE.test(name)) return new Response("Unknown room", { status: 400 });
      if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
      const stub = env.ROOMS.get(env.ROOMS.idFromName(name));
      return stub.fetch(request);
    }
    return env.ASSETS.fetch(request);
  },
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.leases = new Map(); // key -> { holder, until }: short "one move at a time" locks
  }

  async fetch(request) {
    const name = new URL(request.url).searchParams.get("name");
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);                 // hibernation-friendly socket
    server.serializeAttachment({ room: name });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    const reply = (o) => { try { ws.send(JSON.stringify({ id: m.id, ...o })); } catch {} };
    const room = ws.deserializeAttachment()?.room;
    const key = String(m.key || "");
    // a room only ever touches its own documents
    const inRoom = room === "boards" ? (key === "boards" || key.startsWith("boards/")) : (key === room || key.startsWith(room + "/"));
    if (!room || !inRoom || key.length > 300) return reply({ error: "invalid_argument" });

    try {
      if (room === "boards") await this.seed();
      const isBoardWrite = room === "boards" && (m.op === "set" || m.op === "delete");
      if (isBoardWrite && !(this.env.ADMIN_KEY && m.auth === this.env.ADMIN_KEY)) return reply({ error: "invalid_argument" });

      switch (m.op) {
        case "get":
          return reply({ ok: true, result: (await this.ctx.storage.get("d:" + key)) ?? null });

        case "list": {
          // direct children of a collection path, as { id: data }
          const prefix = key + "/";
          const found = await this.ctx.storage.list({ prefix: "d:" + prefix });
          const out = {};
          for (const [k, v] of found) {
            const rest = k.slice(2 + prefix.length);
            if (rest && !rest.includes("/")) out[rest] = v;
          }
          return reply({ ok: true, result: out });
        }

        case "set": {
          const value = m.value;
          if (!value || typeof value !== "object" || Array.isArray(value)) return reply({ error: "invalid_argument" });
          if (JSON.stringify(value).length > MAX_DOC) return reply({ error: "invalid_argument" });
          await this.ctx.storage.put("d:" + key, value);
          this.broadcast(key, value);
          return reply({ ok: true, result: null });
        }

        case "delete":
          await this.ctx.storage.delete("d:" + key);
          this.broadcast(key, null);
          return reply({ ok: true, result: null });

        case "acquire": {
          const now = Date.now();
          const held = this.leases.get(key);
          if (held && held.until > now && held.holder !== m.holder) return reply({ ok: true, result: { acquired: false } });
          const ttl = Math.min(Math.max(Number(m.ttl) || 5000, 1000), 60_000);
          this.leases.set(key, { holder: String(m.holder || ""), until: now + ttl });
          return reply({ ok: true, result: { acquired: true } });
        }

        default:
          return reply({ error: "invalid_argument" });
      }
    } catch (e) {
      return reply({ error: "unavailable" });
    }
  }

  webSocketClose(ws, code, reason) {
    try { ws.close(code, reason); } catch {}
  }

  broadcast(key, value) {
    const msg = JSON.stringify({ type: "change", key, value });
    for (const ws of this.ctx.getWebSockets()) { try { ws.send(msg); } catch {} }
  }

  // First time the boards room is used, load the built-in boards.
  async seed() {
    if (this.seeded) return;
    const existing = await this.ctx.storage.list({ prefix: "d:boards/", limit: 1 });
    if (existing.size === 0) {
      for (const [id, board] of Object.entries(SEED_BOARDS)) await this.ctx.storage.put("d:boards/" + id, board);
    }
    this.seeded = true;
  }
}
