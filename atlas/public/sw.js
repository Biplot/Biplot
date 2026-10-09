// Atlas como app (PWA): guarda la página y a Atlas en 3D para que abra al tiro, también con mala señal.
// Lo de la bóveda (/api/) nunca se guarda: siempre va al servidor.
const VERSION = 'atlas-1';
const BASE = ['/', '/estilos.css', '/js/app.js', '/js/voz.js', '/js/sonidos.js', '/js/markdown.js', '/manifest.webmanifest',
  '/avatares3d/avatar3d.js', '/avatares3d/kit3d.js', '/avatares3d/atlas3d.js', '/avatares3d/plotty3d.js', '/avatares3d/atlas.svg',
  '/avatares3d/three/three.module.min.js', '/avatares3d/three/three.core.min.js', '/iconos/icono-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  // Three.js y Atlas: primero lo guardado (no cambian seguido). Lo demás: primero la red, para ver lo último
  if (url.pathname.startsWith('/avatares3d/')) {
    e.respondWith(caches.match(e.request).then((r) => r ?? fetch(e.request)));
    return;
  }
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
