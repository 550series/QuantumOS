/* QuantumOS PWA Service Worker */
const CACHE_NAME = 'quantumos-v1';
const APP_SHELL = ['/', '/icon.svg', '/manifest.webmanifest', '/og-image.svg'];

// 安装时预缓存应用外壳
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 请求处理策略：静态资源优先缓存、动态请求走网络
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const isApi = event.request.url.includes('/api/');
  const isPage = requestUrl.pathname === '/' || requestUrl.pathname.endsWith('/');

  if (event.request.method !== 'GET' || isApi) {
    return; // 非 GET 或 API 请求交给浏览器/网络
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // 离线时回退到首页
          if (isPage) return caches.match('/');
          return new Response('Offline', { status: 503 });
        });
    })
  );
});