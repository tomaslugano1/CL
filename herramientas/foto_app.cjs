/* Foto de la app (29/10/2026): guarda en un JSON todo lo que muestra la app con los datos de <carpeta>/app.json
   (pantallas, categorías, cada ficha, formularios, sanidad, preñez, tareas, genealogía) y las respuestas del asistente
   a las preguntas de <carpeta>/todas_preguntas.json (si no está, usa las de <carpeta>/todo.json de prueba_completa_asistente).
   Sirve para ordenar código sin cambiar nada: foto antes, foto después, y comparar con comparar_fotos.py.
   Uso: node herramientas/foto_app.cjs <carpeta> <salida.json> */
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
const out=await p.evaluate(()=>{const O={};const html=()=>($('#modal')?.innerHTML||'')+'|'+($('#main')?.innerHTML||'');
  const T=(k,f)=>{try{O[k]=f()}catch(e){O[k]='ERR '+e.message}};
  for(const tab of ['inicio','caballos','madres','camadas','sanidad','padrillos','notas']){UI.tab=tab;UI.ficha=null;T('tab:'+tab,()=>{render();return html()})}
  for(const cat of ['','Potrillos','Doma','Hechura','Jugadores','Descanso','Madres','__venta','__bajas']){UI.tab='caballos';UI.cat=cat;T('cat:'+cat,()=>{render();return $('#main').innerHTML})}UI.cat='';
  for(const san of ['','Madres','Potrillos','Jugadores']){UI.tab='sanidad';UI.sanCat=san;T('san:'+san,()=>{render();return $('#main').innerHTML})}UI.sanCat='';
  UI.tab='inicio';render();
  for(const c of S.caballos){UI.ficha=c.id;T('ficha:'+c.id,()=>{renderFicha();return $('#modal').innerHTML});
    for(const t of ['Desparasitación','Desvasada','Herrada','Muelas','Anemia','Vacuna'])T('san:'+c.id+'|'+t,()=>JSON.stringify(estadoSan(c,t))+'|'+intervalo(c,t));
    T('misc:'+c.id,()=>[grupoInt(c),typeof textoDescanso==='function'?textoDescanso(c):'',typeof botonesEtapa==='function'?botonesEtapa(c):'',JSON.stringify(padresDe(c.nombre))].join('|'));
    T('evf:'+c.id,()=>{closeModal();eventoForm([c.id]);return $('#modal').innerHTML});
    T('baja:'+c.id,()=>{closeModal();bajaForm(c);return $('#modal').innerHTML});
    T('edit:'+c.id,()=>{closeModal();caballoForm(c);return $('#modal').innerHTML});closeModal()}
  for(const sv of S.servicios){T('rep:'+sv.madre+sv.fecha,()=>{const st=estadoRepro(sv);return JSON.stringify(st)+'|'+barraGest(st)});
    T('parto:'+sv.madre+sv.fecha,()=>{closeModal();formNacimiento(sv);return $('#modal').innerHTML});closeModal()}
  T('tareas',()=>JSON.stringify(tareasSemana()));T('tareas14',()=>JSON.stringify(tareasSemana(14)));
  T('evf-multi',()=>{closeModal();eventoForm(S.caballos.slice(0,5).map(x=>x.id),'Herrada');return $('#modal').innerHTML});closeModal();
  for(const pd of [null,...S.padrillos])T('padForm:'+(pd?.nombre||'nuevo'),()=>{closeModal();padForm(pd);return $('#modal').innerHTML});closeModal();
  T('nav',()=>{renderNav();return $('#nav').innerHTML});
  T('padNames',()=>JSON.stringify([...new Set(S.caballos.flatMap(x=>[x.padre,x.madre,x.abueloP,x.abuelaM]).filter(Boolean))].map(n=>padresDe(n))));
  T('datalists',()=>typeof datalists==='function'?datalists():'');T('idx',()=>JSON.stringify([...indiceGenealogia().entries?.()||[]].slice(0,50)));
  const M=new Map();for(const c of S.caballos)M.set(c.id,'C<'+c.nombre+'>');for(const x of S.servicios)M.set(x.id,'S<'+x.madre+x.fecha+'>');S.eventos.forEach(e=>{if(!M.has(e.id))M.set(e.id,'E<'+e.caballoId+e.tipo+e.fecha+'>')});
  const fix=v=>typeof v==='string'?v.replace(/\b[cseno]-mv[a-z0-9]{8,}\b/g,m=>M.has(m)?(M.get(m).startsWith('E<')?M.get(m).replace(/c-mv[a-z0-9]+/,x=>M.get(x)||x):M.get(m)):'ID?'):v;
  const O2={};for(const k in O)O2[fix(k)]=fix(O[k]);window.__fix=fix;return O2});
const preg=fs.existsSync(S+'/todas_preguntas.json')?JSON.parse(fs.readFileSync(S+'/todas_preguntas.json')):fs.existsSync(S+'/todo.json')?JSON.parse(fs.readFileSync(S+'/todo.json')).map(r=>r[2]):[];const asis={};for(const q of preg){asis[q]=await p.evaluate(q=>{try{const r=responder(q);return window.__fix(r.txt+'|'+(r.cards||[]).map(c=>c.id).join(',')+'|'+(r.lista||[]).join('/'))}catch(e){return 'ERR '+e.message}},q)}
fs.writeFileSync(process.argv[3],JSON.stringify({out,asis,errs},null,1));console.log('claves',Object.keys(out).length,'preguntas',preg.length,'errs',errs.length);await b.close()})();
