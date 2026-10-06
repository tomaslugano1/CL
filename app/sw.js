/* Guarda la app en el celular para que abra aunque no haya señal.
   Muestra lo guardado al instante y, si hay señal, se actualiza para la próxima vez.
   Al cambiar archivos de la app, subir el número de VERSION. */
const VERSION='dc-v21';
const ARCHIVOS=['./','index.html','nube.js','supabase.js','config.js','logo.jpg','icono-192.png','icono-512.png','apple-touch-icon.png','favicon.ico','manifest.webmanifest','extras.js','xlsx.mini.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const propio=u.origin===location.origin,fuentes=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname),fotos=/\/storage\/v1\/object\/public\/fotos\//.test(u.pathname);
  if(!propio&&!fuentes&&!fotos)return; // los datos van directo a Supabase
  e.respondWith(caches.open(VERSION).then(async c=>{
    const guardado=await c.match(r,{ignoreSearch:propio});
    const red=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>guardado);
    return guardado||red}));
});

/* Notificaciones: llegan aunque la app esté cerrada */
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(x){d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Doña Cecilia',{body:d.body||'',icon:'icono-192.png',badge:'icono-192.png',tag:d.tag||'dc-aviso',renotify:true,data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs)if('focus' in c)return c.focus();return clients.openWindow(e.notification.data&&e.notification.data.url||'./')}))});
