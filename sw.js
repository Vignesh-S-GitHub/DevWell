const CACHE = 'devwell-shell-v2.0.0';
const ROOT = new URL('./', self.location).pathname;
const FILES = ['./','./index.html','./styles.css?v=2.0.0','./model.js?v=2.0.0','./app.js?v=2.0.0','./views.js?v=2.0.0','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/art/recharge.webp','./assets/art/breakfast.webp','./assets/fonts/outfit-variable.ttf'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES).then(()=>self.skipWaiting()))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('devwell-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(ROOT))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match(new URL('./index.html',self.location).href)));
    return;
  }
  // Only versioned shell assets are cached; personal data never enters the cache.
  if(FILES.some(file=>new URL(file,self.location).pathname===url.pathname))event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{const existing=clients.find(client=>new URL(client.url).pathname.startsWith(ROOT));return existing?existing.focus():self.clients.openWindow(ROOT)}))});
