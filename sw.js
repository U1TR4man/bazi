/* 八字排盤 Service Worker。保守策略，只做「離線可用」與「有新版時提示」兩件事。
 *
 * 路徑一律相對（./）。網站在 https://u1tr4man.github.io/bazi/ 這種子目錄下，
 * 寫成 /index.html 會指到 GitHub Pages 根目錄，裝起來就是別人的網站。
 *
 * 快取策略刻意不一致，因為兩類資源的風險相反：
 *   HTML → network-first：曆法算錯過一次就會長期給錯答案，寧可慢一點也要拿最新的。
 *   圖示／manifest → cache-first：內容不會變，每次上網拿只是浪費。
 * 單檔自含的副作用是這裡沒有字型或 JS 要快取——它們全都在 index.html 裡面。
 */
const CACHE = 'bazi-app-v2.1.1';   // 2.1.1：未來交運年依所選流月／流日即時切換交運柱
const CORE = ['./', './index.html', './manifest.webmanifest',
              './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  // 不呼叫 skipWaiting()：規格要求由使用者主動按「重新載入」，
  // 排盤排到一半被強制刷新、輸入的生日全沒了，比舊版嚴重得多。
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // 只刪自己的舊版，不動同網域下別的 cache（GitHub Pages 上可能有別的專案）
    await Promise.all(keys.filter(k => k.startsWith('bazi-app-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    // 到這裡才等於「必要檔案真的都在了」，才通知頁面可以顯示離線完成提示
    const cache = await caches.open(CACHE);
    const ok = (await Promise.all(CORE.map(u => cache.match(u)))).every(Boolean);
    (await self.clients.matchAll({ includeUncontrolled: true }))
      .forEach(c => c.postMessage({ type: ok ? 'READY' : 'INCOMPLETE', cache: CACHE }));
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // 不快取跨來源資源
  // 帶查詢字串的請求一律不碰快取。目前程式不會把生日放進網址，
  // 但這條是防線不是描述——日後有人加了分享連結，出生資料就不會被寫進磁碟。
  if (url.search) return;

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {                                          // network-first
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) (await caches.open(CACHE)).put('./index.html', res.clone());
        return res;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async () => {                           // cache-first
    const hit = await caches.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res && res.ok && res.type === 'basic') (await caches.open(CACHE)).put(req, res.clone());
    return res;
  })());
});
