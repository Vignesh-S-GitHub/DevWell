const CACHE = 'devwell-shell-v3.4.0';
const ROOT = new URL('./', self.location).pathname;
const FILES = ['./','./index.html','./styles.css?v=3.4.0','./model.js?v=3.4.0','./app.js?v=3.4.0','./haptics.js?v=3.4.0','./timer.js?v=3.4.0','./notifications.js?v=3.4.0','./views.js?v=3.4.0','./icons.js?v=3.4.0','./motion.js?v=3.4.0','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./pulse.js?v=3.4.0','./assets/art/pulse.webp','./assets/fonts/space-grotesk.ttf'];
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
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const page=['Today','Routine','Food','Move','Insights'].includes(event.notification.data?.page)?event.notification.data.page:'Today';
 const target=new URL('./',self.location);target.hash=page.toLowerCase();
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{
  const existing=clients.find(client=>{const url=new URL(client.url);return url.origin===target.origin&&url.pathname.startsWith(ROOT)});
  if(existing){existing.postMessage({type:'DEVWELL_NOTIFICATION_OPEN',page});return existing.focus()}
  return self.clients.openWindow(target.href);
 }));
});
