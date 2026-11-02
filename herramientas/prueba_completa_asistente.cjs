/* Prueba completa del asistente (29/10/2026): a cada caballo, categoría, padrillo y lugar le hace preguntas y controla que el dato de la
   respuesta sea el cargado (hijos, hermanos, edad, lugar, chip, pelaje, RP, eventos, cantidades). Deja todas las preguntas y respuestas en <carpeta>/todo.json.
   Uso: NODE_PATH=/opt/node-tools/node_modules:$(npm root -g) node herramientas/prueba_completa_asistente.cjs <carpeta con app.json>. */
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
const filas=await p.evaluate(()=>{const out=[];const raro=/undefined|null|NaN|\[object|\$\{/;
  const preg=(tipo,suj,q,chk)=>{ASIS.ultimo=null;let r,ok=true,mot='';try{r=responder(q)}catch(e){out.push([tipo,suj,q,'ERROR: '+e.message,'MAL','excepción']);return}
    const t=r.txt||'';const extra=(r.lista||[]).join(' | ');
    if(raro.test(t)){ok=false;mot='texto raro'}else if(/No te entend|De qué caballo/.test(t)){ok=false;mot='no entendió'}else{const m=chk?chk(t,r):'';if(m){ok=false;mot=m}}
    out.push([tipo,suj,q,t+(extra?' → '+extra:'')+((r.cards||[]).length?` [${r.cards.length} tarjetas]`:''),ok?'OK':'MAL',mot])};
  const nums=n=>{const c=S.caballos.filter(x=>String(x.rp||'')===n||norm(x.nombre)===n||limpio(x.nombre).endsWith(' '+n+' '));return c.filter(x=>x.estado==='Activo').length>1||(!c.some(x=>x.estado==='Activo')&&c.length>1)};
  const amb=(c)=>/^\d+$/.test(norm(c.nombre))&&nums(norm(c.nombre));
  const ok1=(c,f)=>(t,r)=>{if(amb(c)&&/caballos con el/.test(t))return '';if(!t.includes(c.nombre)&&!(c.apodo&&t.includes(c.apodo)))return 'no nombra al caballo';return f?f(t,r):''};
  for(const c of S.caballos){const n=c.nombre.toLowerCase(),viv=c.estado==='Activo';
    preg('Caballo',c.nombre,n,ok1(c));
    preg('Caballo',c.nombre,'quien es '+n,ok1(c));
    preg('Caballo',c.nombre,'padres de '+n,ok1(c,t=>(c.padre&&!t.includes(c.padre))||(c.madre&&!t.includes(c.madre))?'faltan los padres':''));
    preg('Caballo',c.nombre,'hijos de '+n,ok1(c,t=>{const h=hijosDe(c.nombre),v=h.filter(x=>x.estado==='Activo').length;return h.length===0?(/no tiene hijos/.test(t)?'':'debería decir que no tiene'):v>0&&!t.includes(`tiene ${v} hijo`)?`debería decir ${v} vivos`:''}));
    preg('Caballo',c.nombre,'hermanos de '+n,ok1(c,t=>{const h=S.caballos.filter(x=>x.id!==c.id&&c.madre&&norm(x.madre)===norm(c.madre)).length;return h?(t.includes(`tiene ${h} herman`)?'':`debería decir ${h} hermanos`):(/no tiene hermanos/.test(t)?'':'debería decir que no tiene')}));
    preg('Caballo',c.nombre,'edad de '+n,ok1(c,t=>c.nac?(t.includes(fmt(c.nac))?'':'falta la fecha de nacimiento'):''));
    preg('Caballo',c.nombre,'abuelos de '+n,ok1(c));
    if(viv)preg('Caballo',c.nombre,'donde esta '+n,ok1(c,t=>c.lugar&&!t.includes(c.lugar)?'falta el lugar':''));
    preg('Caballo',c.nombre,'chip de '+n,ok1(c,t=>c.chip?(t.includes(String(c.chip))?'':'falta el chip'):''));
    preg('Caballo',c.nombre,'pelaje de '+n,ok1(c,t=>c.pelaje?(t.includes(c.pelaje)?'':'falta el pelaje'):''));
    preg('Caballo',c.nombre,'eventos de '+n,ok1(c,t=>{const e=S.eventos.filter(x=>x.caballoId===c.id).length;return e?(t.includes(`tiene ${e} evento`)?'':`debería decir ${e} eventos`):(/no tiene eventos/.test(t)?'':'')}));
    if(viv)preg('Caballo',c.nombre,'sanidad de '+n,ok1(c));
    if(viv)preg('Caballo',c.nombre,'que le toca a '+n,ok1(c));
    preg('Caballo',c.nombre,'que numero tiene '+n,ok1(c,t=>c.rp&&c.rp!=='—'&&!t.includes('RP '+c.rp)?'falta el RP':''));
    preg('Caballo',c.nombre,'todo de '+n,ok1(c));
    if(c.sexo==='Hembra'&&viv)preg('Caballo',c.nombre,'esta preñada '+n+'?',ok1(c));
    if(viv&&['Jugadores','Descanso','Hechura'].includes(c.categoria))preg('Caballo',c.nombre,'esta suelta o agarrada '+n+'?',ok1(c));
    if(/^[A-ZÁÉÍÓÚÑ]{6,}$/.test(c.nombre)){const i=Math.floor(c.nombre.length/2);preg('Caballo (con error de tipeo)',c.nombre,'hijos de '+(c.nombre.slice(0,i)+c.nombre.slice(i+1)).toLowerCase(),ok1(c))}}
  const act=activos().filter(x=>!fuera(x));
  for(const k of CATS){const nl=act.filter(x=>x.categoria===k).length,kl=k.toLowerCase();const chk=t=>nl?(t.includes(String(nl))?'':`debería decir ${nl}`):(/ningun/i.test(t)?'':'debería decir que no hay');
    for(const q of [`cuantos hay en ${kl}`,`cuantos ${kl} hay`,kl,`lista de ${kl}`,`quienes estan en ${kl}`,`donde estan los ${kl}`])preg('Categoría',k,q,chk);
    preg('Categoría',k,`sanidad de ${kl}`,t=>nl&&k!=='Doma'&&!t.includes(k)?'no nombra la categoría':'');}
  for(const pd of listaPadrillos()){const nm=pd.nombre.toLowerCase(),v=pd.vivos.length;
    preg('Padrillo',pd.nombre,'hijos de '+nm,t=>!t.includes(pd.nombre)?'no nombra al padrillo':v&&!t.includes(`tiene ${v} hijo`)?`debería decir ${v} vivos`:'');
    preg('Padrillo',pd.nombre,'quien es '+nm,t=>!t.includes(pd.nombre)?'no nombra al padrillo':'');
    if(!pd.manada)preg('Padrillo',pd.nombre,'padres de '+nm,t=>!t.includes(pd.nombre)?'no nombra al padrillo':'');
    if(pd.porNacer.length)preg('Padrillo',pd.nombre,'preñadas de '+nm,t=>t.includes(String(pd.porNacer.length))?'':'cantidad mal');}
  for(const l of [...new Set(act.map(x=>x.lugar).filter(Boolean))]){const nl=act.filter(x=>x.lugar===l).length;for(const q of [`quienes estan en ${l.toLowerCase()}`,`cuantos hay en ${l.toLowerCase()}`])preg('Lugar',l,q,t=>t.includes(String(nl))?'':`debería decir ${nl}`)}
  const G=['¿Quiénes están preñadas?','¿Qué hay que hacer esta semana?','¿Cuántos caballos hay?','Cual fue el último nacimiento?','De esta temporada cuáles parieron?','Que caballos están agarrados?','quienes estan sueltos','cuanto gane con las ventas','quien murio','que vendi este año','quien esta por parir','quienes paren en diciembre','cuanto gaste en herrero','quien es el mas viejo','quien es el mas joven','que paso el 21 de octubre','que paso esta semana','ayuda','resumen','como esta la sanidad','quienes estan vencidos','quienes estan al dia','que significan los puntitos','cada cuantos dias se desparasita','cada cuanto se hierra','vacunas pendientes','que caballos hay que desparasitar','quien tiene que hacerse muelas','ultimo desvase de los potrillos','quienes no tienen padre cargado','que significa la numeracion de los potrillos','padrillos','cual padrillo tiene mas hijos','a la venta','cuantas yeguas hay','cuantos machos hay','camada 2024','camada 2025','camada 2026','promedio de edad','todos los caballos','notas','abortos','nacieron muertos','vacias','quien es el domador','castrados','anemias','novedades','hola','gracias'];
  for(const q of G)preg('General','—',q);
  return out});
fs.writeFileSync(S+'/todo.json',JSON.stringify(filas));
const mal=filas.filter(f=>f[4]==='MAL');const por={};for(const f of filas)por[f[0]]=(por[f[0]]||0)+1;
console.log('Total:',filas.length,JSON.stringify(por),'| MAL:',mal.length);console.log(mal.slice(0,80).map(f=>f[0]+' | '+f[2]+' → '+f[5]+' :: '+f[3].slice(0,110)).join('\n'));
console.log('Errores JS:',errs.join(' / ')||'ninguno');await b.close()})();
