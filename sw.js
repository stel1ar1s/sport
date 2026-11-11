// The build puts the version and the list of files in here (vite.config.ts → serviceWorker).
// Everything is served from the phone's cache, so the app starts instantly and works without internet.
// A new deploy changes this file: the phone downloads the new version in the background and uses it from the next launch.
const VERSION = 'e833c1259d6b'
const FILES = ["./","./assets/IoskeleyMono-Medium-CxAtvJWK.woff2","./assets/IoskeleyMono-Regular-B-gbVJuZ.woff2","./assets/IoskeleyMono-SemiBold-r2Pved_Q.woff2","./assets/index-C9j7fb-B.css","./assets/index-yQtESiKA.js","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest"]
const CACHE = `sport-${VERSION}`

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('sport-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true })
      if (hit) return hit
      if (req.mode === 'navigate') {
        const page = await cache.match('./')
        if (page) return page
      }
      const res = await fetch(req)
      if (res.ok) void cache.put(req, res.clone())
      return res
    })
  )
})
