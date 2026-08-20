/* Service Worker — هوش گیاهی
   وظیفه: امکان نصب PWA + نمایش نوتیفیکیشن واقعی در نوار اعلان سیستم
   (از طریق self.registration.showNotification، نه new Notification()). */

const CACHE_NAME = "hoosh-giah-v2";
const APP_SHELL = [
  "./plant-app.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((e) => console.warn("SW precache failed:", e))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});

// پیام از صفحه اصلی: درخواست نمایش نوتیفیکیشن واقعی در نوار اعلان سیستم گوشی
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_NOTIF") {
    const { title, body, tag } = data.payload || {};
    self.registration.showNotification(title || "🌱 هوش گیاهی", {
      body: body || "",
      tag: tag || undefined,
      renotify: !!tag,
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-96.png",
      vibrate: [120, 60, 120],
      dir: "rtl",
      lang: "fa",
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const existing = clientsArr.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return self.clients.openWindow("./plant-app.html");
    })
  );
});
