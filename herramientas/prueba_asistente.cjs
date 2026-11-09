/* Prueba del asistente (29/10/2026): a cada caballo le hace 12 tipos de pregunta y una con error de tipeo, y avisa si alguna respuesta
   no lo nombra, no la entiende, tira error o muestra 'undefined'. Uso: NODE_PATH=/opt/node-tools/node_modules:$(npm root -g) node herramientas/prueba_asistente.cjs <carpeta con app.json>. Sin datos en el repo. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const S=process.argv[2],APP='/home/user/CL/app';
const rows=JSON.parse(fs.readFileSync(S+'/app.json'));const D={};for(const r of rows)(D[r.coleccion]=D[r.coleccion]||{})[r.id]=r.data;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='app.local')return r.abort();
 let f=u.pathname==='/'?'/index.html':u.pathname;if(f==='/config.js')return r.fulfill({body:'window.DC_CONFIG={url:"https://x.supabase.co",anonKey:"stub"};',contentType:'text/javascript'});
 if(f==='/supabase.js')return r.fulfill({body:'const nunca=()=>new Promise(()=>{});const px=()=>new Proxy(function(){},{get:(t,k)=>k==="then"?undefined:px(),apply:()=>px()});window.supabase={createClient:()=>({auth:{getSession:nunca,signOut:nunca,signInWithPassword:nunca},from:()=>px(),rpc:nunca,storage:{from:()=>px()}})};',contentType:'text/javascript'});
 if(f==='/sw.js')return r.fulfill({status:404,body:''});
 try{r.fulfill({body:fs.readFileSync(path.join(APP,f)),contentType:{'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/json','.ico':'image/x-icon'}[path.extname(f)]||'application/octet-stream'})}catch(e){r.fulfill({status:404,body:''})}});
await p.addInitScript(d=>{localStorage.setItem('dc-nube-datos',d);window.DC_NUBE_LISTA=true;addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent='#dc-estado{display:none!important}';document.head.appendChild(st)});document.addEventListener('error',e=>{if(e.target.tagName==='IMG')e.target.style.display='none'},true);localStorage.setItem('dc-nube-yo',JSON.stringify({id:'u',email:'t@x',nombre:'Tomás'}))},JSON.stringify(D));
p.on('pageerror',e=>console.log('ERR',e.message));
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://app.local/');await p.waitForTimeout(1500);await p.evaluate(()=>render());await p.waitForTimeout(2500);
const res=await p.evaluate(()=>{const out={total:0,malos:[],tipeo:{ok:0,mal:[]}};
  const T=['hijos de {n}','padres de {n}','hermanos de {n}','edad de {n}','donde esta {n}','eventos de {n}','que le toca a {n}','{n}','la {n}','abuelos de {n}','esta preñada {n}?','chip de {n}','sanidad de {n}','que numero tiene {n}','todo de {n}'];
  const raro=/undefined|null|NaN|\[object|\$\{/;
  for(const c of S.caballos){const n=c.nombre.toLowerCase();
    for(const t of T){const q=t.replace('{n}',n);out.total++;ASIS.ultimo=null;let r;
      try{r=responder(q)}catch(e){out.malos.push(q+' → EXCEPCIÓN '+e.message);continue}
      const txt=r.txt||'';
      if(raro.test(txt)||(r.meta&&Object.values(r.meta).some(v=>raro.test(String(v)))))out.malos.push(q+' → RARO: '+txt.slice(0,120));
      else if(/No te entend|De qué caballo/.test(txt))out.malos.push(q+' → NO ENTENDIÓ');
      else if(!txt.includes(c.nombre)&&!/Hay \d+ caballos con el/.test(txt))out.malos.push(q+' → OTRO: '+txt.slice(0,100))}
    // con un error de tipeo (saco una letra del medio) en nombres de 6+ letras sin números
    if(/^[A-ZÁÉÍÓÚÑ ]{6,}$/.test(c.nombre)&&!c.nombre.includes(' ')){const i=Math.floor(c.nombre.length/2);const t=(c.nombre.slice(0,i)+c.nombre.slice(i+1)).toLowerCase();ASIS.ultimo=null;
      const r=responder('hijos de '+t);if(r.txt.includes(c.nombre))out.tipeo.ok++;else out.tipeo.mal.push(t+' → '+r.txt.slice(0,80))}}
  return out});
console.log('Preguntas:',res.total,'| con problema:',res.malos.length);console.log(res.malos.slice(0,60).join('\n'));
console.log('Tipeo en nombres: bien',res.tipeo.ok,'| mal',res.tipeo.mal.length);console.log(res.tipeo.mal.join('\n'));
console.log('Errores JS:',errs.join(' / ')||'ninguno');await b.close()})();
