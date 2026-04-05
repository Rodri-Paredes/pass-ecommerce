// Service Worker for PASS CLOTHING – caches Supabase Storage images & static assets
const CACHE_NAME = 'pass-cache-v1';
const IMAGE_CACHE_NAME = 'pass-images-v1';
const MAX_IMAGE_CACHE_ITEMS = 200;

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== IMAGE_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Helpers ──────────────────────────────────────────────
function isSupabaseImage(url) {
  return url.includes('supabase.co/storage');
}

function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot|svg|ico)(\?|$)/.test(url);
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Remove oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map((req) => cache.delete(req)));
  }
}

// ── Fetch strategies ─────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests over http(s) – ignore chrome-extension:// and other schemes
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  const url = request.url;

  // Strategy: Cache-first for Supabase Storage images
  if (isSupabaseImage(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
            // Fire-and-forget trim
            trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_ITEMS);
          }
          return response;
        } catch {
          // Offline fallback: return a transparent 1x1 pixel
          return new Response(
            Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0)),
            { headers: { 'Content-Type': 'image/gif' } }
          );
        }
      })
    );
    return;
  }

  // Strategy: Stale-while-revalidate for static assets
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Strategy: Network-first for Supabase REST API (data queries)
  if (url.includes('supabase.co/rest')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response('{"error":"offline"}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }
});
