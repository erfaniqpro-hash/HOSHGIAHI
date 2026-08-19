/* Service Worker — هوش گیاهی
   وظیفه: امکان نصب PWA + نمایش نوتیفیکیشن واقعی در نوار اعلان سیستم
   (از طریق self.registration.showNotification، نه new Notification()).
   بدون سرور بک‌اند: این SW پیام Push واقعی از شبکه دریافت نمی‌کند،
   فقط پیام‌هایی را نمایش می‌دهد که خودِ صفحه (وقتی باز/زنده است) به آن می‌فرستد. */

const CACHE_NAME = "hoosh-giah-v1";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
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

// پیام از صفحه اصلی: درخواست نمایش نوتیفیکیشن واقعی در نوار اعلان سیستم
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_NOTIF") {
    const { title, body, tag } = data.payload || {};
    self.registration.showNotification(title || "🌱 هوش گیاهی", {
      body: body || "",
      tag: tag || undefined,
      icon: "https://em-content.zobj.net/source/apple/354/seedling_1f331.png",
      badge: "https://em-content.zobj.net/source/apple/354/seedling_1f331.png",
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
      return self.clients.openWindow("./");
    })
  );
});
