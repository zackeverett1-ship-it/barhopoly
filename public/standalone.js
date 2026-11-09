// BarHopoly standalone adapter.
// The game page was first built to run inside Claude, where it saves through `window.claude.use("db")`
// and learns who's playing through `window.claude.use("user")`. This file provides those same two
// things on our own Cloudflare site, so the game code itself doesn't need to change:
//   db   -> documents stored in Cloudflare Durable Objects, synced live over WebSockets
//   user -> an anonymous player id saved on this phone (no accounts, no sign-in)
(() => {
  if (window.claude) return;

  // ---------- who is this phone ----------
  let uid = null;
  try { uid = localStorage.getItem("barhopolyId"); } catch {}
  if (!uid) {
    uid = "u_" + Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, "0")).join("");
    try { localStorage.setItem("barhopolyId", uid); } catch {}
  }
  const user = {
    id: async () => uid,
    me: async () => ({ id: uid, name: "" }),
    isOwner: async () => false,
    canEdit: async () => true,          // lets the hidden #edit page open; saving boards still needs the admin key
    can: async () => true,
    profiles: async () => ({}),
  };

  // ---------- one live connection per room ----------
  // "boards" holds every board; each hosted game is its own room, "games/<CODE>".
  const roomOf = (path) => { const s = path.split("/"); return s[0] === "games" && s[1] ? "games/" + s[1] : "boards"; };
  const conns = {};

  function conn(room) {
    if (conns[room]) return conns[room];
    const c = conns[room] = { room, ws: null, open: false, seq: 0, retry: 0, pending: new Map(), queue: [], docSubs: new Map(), colSubs: new Map() };
    connect(c);
    return c;
  }
  function connect(c) {
    const ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/api/room?name=" + encodeURIComponent(c.room));
    c.ws = ws;
    ws.onopen = () => {
      c.open = true; c.retry = 0;
      c.queue.splice(0).forEach(s => ws.send(s));
      refreshAll(c);                       // catch up on anything missed while disconnected
    };
    ws.onmessage = (e) => { let m; try { m = JSON.parse(e.data); } catch { return; } handle(c, m); };
    ws.onclose = () => {
      c.open = false;
      c.pending.forEach(p => p.reject({ code: "unavailable", message: "Connection lost" }));
      c.pending.clear();
      c.retry++;
      setTimeout(() => connect(c), Math.min(8000, 400 * 2 ** c.retry));
    };
  }
  function send(c, msg) {
    return new Promise((resolve, reject) => {
      const id = ++c.seq; msg.id = id;
      c.pending.set(id, { resolve, reject });
      const s = JSON.stringify(msg);
      if (c.open) c.ws.send(s); else c.queue.push(s);
    });
  }
  function handle(c, m) {
    if (m.id && c.pending.has(m.id)) {
      const p = c.pending.get(m.id); c.pending.delete(m.id);
      if (m.error) p.reject({ code: m.error, message: m.error }); else p.resolve(m.result);
      return;
    }
    if (m.type === "change") {
      const key = m.key, value = m.value;
      const subs = c.docSubs.get(key);
      if (subs) subs.forEach(fn => fn(value));
      const parent = key.slice(0, key.lastIndexOf("/"));
      const col = c.colSubs.get(parent);
      if (col) {
        const id = key.slice(parent.length + 1);
        if (value == null) col.data.delete(id); else col.data.set(id, value);
        col.fns.forEach(fn => fn());
      }
    }
  }
  function refreshAll(c) {
    c.docSubs.forEach((fns, key) => send(c, { op: "get", key }).then(v => fns.forEach(fn => fn(v))).catch(() => {}));
    c.colSubs.forEach((col, prefix) => send(c, { op: "list", key: prefix }).then(obj => {
      col.data = new Map(Object.entries(obj || {})); col.fns.forEach(fn => fn());
    }).catch(() => {}));
  }

  // ---------- snapshots shaped like the Claude db's ----------
  const meta = { fromCache: false, hasPendingWrites: false };
  const lastSeg = (p) => p.slice(p.lastIndexOf("/") + 1);
  const docSnap = (path, v) => ({ id: lastSeg(path), exists: v != null, data: () => (v == null ? undefined : v), metadata: meta });
  const colSnap = (prefix, map) => {
    const docs = [...map.keys()].sort().map(id => docSnap(prefix + "/" + id, map.get(id)));
    return { docs, size: docs.length, empty: docs.length === 0, metadata: meta, docChanges: () => [] };
  };

  // Saving boards needs the admin key (set as ADMIN_KEY in Cloudflare). Asked once, then remembered here.
  function adminKey() {
    let k = null;
    try { k = localStorage.getItem("barhopolyAdminKey"); } catch {}
    if (!k) {
      k = window.prompt("Enter the BarHopoly admin key to save board changes:") || "";
      if (k) try { localStorage.setItem("barhopolyAdminKey", k); } catch {}
    }
    return k;
  }
  const authFor = (path) => (roomOf(path) === "boards" ? adminKey() : undefined);
  const forgetBadKey = (path, e) => {
    if (roomOf(path) === "boards" && e && e.code === "invalid_argument") { try { localStorage.removeItem("barhopolyAdminKey"); } catch {} }
    throw e;
  };

  function doc(path) {
    const c = () => conn(roomOf(path));
    return {
      id: lastSeg(path), path,
      get: () => send(c(), { op: "get", key: path }).then(v => docSnap(path, v)),
      set: (data) => send(c(), { op: "set", key: path, value: JSON.parse(JSON.stringify(data)), auth: authFor(path) }).catch(e => forgetBadKey(path, e)),
      update: async (data) => {
        const cur = await send(c(), { op: "get", key: path });
        if (cur == null) throw { code: "invalid_argument", message: "Document does not exist" };
        return send(c(), { op: "set", key: path, value: { ...cur, ...JSON.parse(JSON.stringify(data)) }, auth: authFor(path) }).catch(e => forgetBadKey(path, e));
      },
      delete: () => send(c(), { op: "delete", key: path, auth: authFor(path) }).catch(e => forgetBadKey(path, e)),
      acquire: (opts = {}) => send(c(), { op: "acquire", key: path, holder: opts.holder || uid, ttl: opts.ttlMs || 30000 }),
      onSnapshot(next, error) {
        const cn = c();
        let alive = true;
        const fn = (v) => { if (alive) next(docSnap(path, v)); };
        if (!cn.docSubs.has(path)) cn.docSubs.set(path, new Set());
        cn.docSubs.get(path).add(fn);
        send(cn, { op: "get", key: path }).then(fn).catch(e => { if (alive && error && e.code !== "unavailable") error(e); });
        return () => { alive = false; cn.docSubs.get(path)?.delete(fn); };
      },
      collection: (sub) => collection(path + "/" + sub),
    };
  }

  function collection(path) {
    const c = () => conn(roomOf(path));
    const api = {
      path,
      doc: (id) => doc(path + "/" + (id || Math.random().toString(36).slice(2, 12))),
      add: async (data) => { const d = api.doc(); await d.set(data); return d; },
      get: () => send(c(), { op: "list", key: path }).then(obj => colSnap(path, new Map(Object.entries(obj || {})))),
      where: () => api, orderBy: () => api, limit: () => api,   // the game doesn't filter; kept for shape
      onSnapshot(next, error) {
        const cn = c();
        let alive = true;
        let col = cn.colSubs.get(path);
        if (!col) { col = { data: new Map(), fns: new Set() }; cn.colSubs.set(path, col); }
        const fn = () => { if (alive) next(colSnap(path, col.data)); };
        col.fns.add(fn);
        send(cn, { op: "list", key: path }).then(obj => { col.data = new Map(Object.entries(obj || {})); fn(); })
          .catch(e => { if (alive && error && e.code !== "unavailable") error(e); });
        return () => { alive = false; col.fns.delete(fn); };
      },
    };
    return api;
  }

  const db = { doc, collection };
  window.claude = { use: async (name) => (name === "db" ? db : name === "user" ? user : null) };
})();
