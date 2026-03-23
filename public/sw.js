const CACHE = "3xmedia-v2";
const STATIC = ["/", "/index.html"];

// ── Установка: кэшировать оболочку ──────────────────────────────────────
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// ── Активация: удалить старые кэши ──────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first для API, cache-first для статики ────────────────
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API — только сеть, без кэша
  if (url.pathname.startsWith("/api/")) return;

  // Навигация → всегда index.html (SPA)
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Остальное — cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok && e.request.method === "GET") {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

// ── Push-уведомления ─────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "3X Media", body: "Новое уведомление" };
  try { data = e.data.json(); } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.type || "general",
      data: { ref_type: data.ref_type, ref_id: data.ref_id },
      vibrate: [200, 100, 200],
    })
  );
});

// ── Клик по уведомлению — открыть приложение ────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      const app = cs.find((c) => c.url.includes(self.location.origin));
      return app ? app.focus() : clients.openWindow("/");
    })
  );
});
