// Local-first application shell. Never caches credentials or private API responses.
const CACHE='pcvr-radar-standalone-v071';
const SHELL=['./','./index.html','./assets/app.css','./assets/app.js','./data/seed.json','./data/metadata.json','./data/announcements.json','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if((url.pathname.endsWith('/data/feed.json')||url.pathname.endsWith('/data/announcements.json'))){e.respondWith(fetch(req).catch(()=>caches.match(req)));return}
 e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})))
});
