const CACHE_PREFIX = 'rmctf-'
const CACHE_VERSION = 2 // NOTE: bump this version every update
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION

self.addEventListener('install', (event) => {
  self.skipWaiting()

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/flag/',
        '/iFZeBssXUJ.css',
        '/favicon.png',
        '/manifest.json',
      ])
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) {
            return caches.delete(name)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      if (event.request.mode === 'navigate') {
        const response = await caches.match('/flag/')
        const text = await response.text()

        const message = `
<p>Impressive... You've seen right through me. The flag reveals itself only to those who defy probability.</p>
<p><strong>Flag:</strong> <code>%</code></p>`

        const prize = 'WEcfEB9OHhsSHk8ZExweGh8eEktJSE5MH04cSRoaEkgZHxMY'
        const seed = Math.floor(Math.random() * 100)
        const modified = text
          .replace(/<p>.+<\/p>/, message)
          .replace(/<img.*/, '')
          .replace('%', atob(prize)
            .split('')
            .map((c) => String.fromCharCode(c.charCodeAt(0) ^ seed))
            .join(''))

        return new Response(modified, {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        })
      }

      // Return other cached assets.
      return await caches.match(event.request)
    })
  )
})
