/* ATLAS PWA offline shell. Scope-local: works at workers.dev root and /ATLAS/. */
const CACHE="atlas-shell-v09-20261011";
const ASSETS=[
 "./","./index.html","./style.css","./app.js","./practice.js","./pwa.js",
 "./manifest.webmanifest","./favicon.svg","./icon-192.png","./icon-512.png",
 "./data/demo-content.js","./data/block1.js",
 "./assets/office.svg","./assets/nora-vale.svg","./assets/investigator.svg",
 "./assets/props.svg","./assets/expressions.svg"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key.startsWith("atlas-shell-")&&key!==CACHE).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 if(event.request.method!=="GET"||new URL(event.request.url).origin!==self.location.origin)return;
 const url=new URL(event.request.url);
 if(!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(event.request.mode==="navigate"){
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const clone=response.clone();caches.open(CACHE).then(c=>c.put("./index.html",clone)).catch(()=>{});}
    return response;
  }).catch(()=>caches.match("./index.html")));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>{
  if(cached)return cached;
  return fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}
    return response;
  });
 }));
});
