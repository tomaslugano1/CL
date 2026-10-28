/* Prueba de los 14 grupos nuevos del asistente (29/10/2026): seguimiento "¿y la X?", dictado por voz y números en letras,
   cómo se hace algo en la app, sí/no, filtros, comparar, períodos, movimientos, nietos y sangre, plata, embriones, negaciones
   y dos preguntas en un mensaje. Arma las preguntas con los caballos de los datos (no lleva nombres en el repo).
   Uso: node herramientas/prueba_asistente_grupos.cjs <carpeta con app.json> */
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
const casos=await p.evaluate(()=>{const A=activos().filter(x=>!fuera(x)),m=A.filter(x=>x.categoria==='Madres'),pre=m.find(x=>S.servicios.some(s=>norm(s.madre)===norm(x.nombre)&&s.estado==='Preñada')),
  pre2=m.filter(x=>S.servicios.some(s=>norm(s.madre)===norm(x.nombre)&&s.estado==='Preñada'))[1],j=A.filter(x=>x.categoria==='Jugadores'),con=A.find(x=>hijosDe(x.nombre).length),n=x=>x.nombre.toLowerCase();
  const C=[];const q=(g,t,re)=>C.push([g,t,re]);const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  q('Seguimiento','cuando pare la '+n(pre),'PRENADA|PARE|PARTO');q('Seguimiento','y la '+n(pre2)+'?',esc(norm(pre2.nombre)));
  q('Seguimiento','hijos de '+n(con),'HIJ');q('Seguimiento','y de la '+n(pre2),esc(norm(pre2.nombre)));
  q('Voz','que edad tiene la '+n(pre).replace(/v/g,'b').replace(/^gu/,'hu'),esc(norm(pre.nombre)));
  const num=A.find(x=>/\b40\b/.test(x.nombre))||A.find(x=>/\b2\d\b/.test(x.nombre));const nn=+num.nombre.match(/\b(\d\d)\b/)[1];
  const L={20:'veinte',21:'veintiuno',22:'veintidos',23:'veintitres',24:'veinticuatro',25:'veinticinco',26:'veintiseis',27:'veintisiete',28:'veintiocho',40:'cuarenta'};
  if(L[nn])q('Voz','donde esta el '+L[nn],String(nn));
  for(const t of ['como cargo un parto','como doy de baja un caballo','como agrego una foto','como cambio de categoria','como hago para cargar el herrero','como cargo un servicio','como cargo una desparasitacion','como sumo una practica','como anoto algo','como cambio el nombre'])q('Cómo se hace',t,'TOCA|ENTRA|EN LA FICHA|INICIO');
  for(const t of ['esta a la venta?','tiene chip?','tiene foto?','es macho?','esta viva?','esta en madres?'])q('Sí / no','la '+n(pre)+' '+t,'^(SI|NO)\\b|ES (HEMBRA|MACHO)');
  q('Sí / no','la '+n(j[0])+' esta en polo?','^(SI|NO)\\b');
  for(const t of ['alazanes','yeguas alazanas','mayores de 5 anos','menores de 2 anos','los 5 mas viejos','los 3 mas jovenes','ordenados por edad','tordillos'])q('Filtros',t,'ENCONTRE|MAS VIEJOS|MAS JOVENES|POR EDAD|NO HAY');
  q('Comparar','quien jugo mas la '+n(j[0])+' o la '+n(j[1]),'JUGO MAS|IGUAL');q('Comparar','quien tiene mas hijos la '+n(con)+' o la '+n(pre2),'MAS CRIAS|MISMAS');
  q('Comparar','quien es mas vieja la '+n(j[0])+' o la '+n(j[1]),'MAS VIEJ|MAS JOVEN|NO PUEDO COMPARAR|MISMO DIA');
  for(const t of ['que se hizo en septiembre','eventos de este mes','que paso el mes pasado','que toca la semana que viene','que hay para noviembre','bajas de octubre'])q('Períodos',t,'^EN |^PARA ');
  q('Movimientos','movimientos de la '+n(j[0]),'MOVIMIENTO');q('Movimientos','quien se movio este mes','EVENTO');
  q('Genealogía','nietos de '+n(con),'NIETO');q('Genealogía','descendientes de '+n(con),'DESCENDIENTES');
  const pd=S.caballos.find(x=>x.padre)?.padre;if(pd)q('Genealogía','que caballos tienen sangre de '+pd.toLowerCase(),'SANGRE');
  q('Plata','cuanto se gasto en herrero de la '+n(j[0]),'HERRERO DE');q('Plata','precio promedio de venta','PROMEDIO|NO HAY VENTAS');
  q('Embriones','embriones','EMBRION');q('Embriones','receptoras','RECEPTORA');
  for(const t of ['yeguas no preñadas','potrillos sin castrar','sin desparasitar','no estan herrados','no estan a la venta'])q('Negaciones',t,'NO ESTAN|SIN |DE LOS QUE SE HIERRAN|DESPARASITAD');
  q('Dos en una','hijos de '+n(con)+' y cuando pare la '+n(pre),'HIJ[\\s\\S]*\\n\\n[\\s\\S]*'+esc(norm(pre.nombre)));
  q('Dos en una','sanidad de la '+n(pre)+' y cuando pare','SANIDAD[\\s\\S]*\\n\\n[\\s\\S]*(PRENADA|PARE|PARTO)');
  q('Dos en una','cuantas preñadas hay? y cuantos potrillos','PRENADAS[\\s\\S]*\\n\\n');
  // ronda 6
  const chico=A.find(x=>x.nac&&diff(hoy(),x.nac)<700),tor=A.find(x=>S.eventos.some(e=>e.caballoId===x.id&&e.tipo==='Torneo'))||j[0],ab=s=>s.replace(/a/,'');
  q('WhatsApp','q edad tiene la '+n(j[0]),esc(norm(j[0].nombre)));q('WhatsApp','cdo pare la '+n(pre),'PRENADA|PARE|PARTO');q('WhatsApp','dnd esta la '+n(j[1]),'ESTA EN');q('WhatsApp','hnos de la '+n(j[0]),'HERMAN');
  q('WhatsApp','cuants hijos tiene la '+n(con),'HIJ');q('WhatsApp','xq la '+n(j[0])+' esta en rojo',esc(norm(j[0].nombre)));
  for(const t of ['carga que pario la '+n(pre),'anotame una desparasitacion a la '+n(j[0]),'dale de baja a la '+n(j[1]),'podes cargar un servicio a la '+n(pre),'borra la nota','pasala a descanso a la '+n(j[0]),'ponele chip a la '+n(j[1])])q('Cargar',t,'SOLO LEO');
  for(const t of ['que se hizo entre marzo y junio','eventos desde agosto','que se hizo en 2025','bajas en 2026','herrero hasta junio','desparasitaciones entre agosto y octubre'])q('Rangos',t,'^(ENTRE|DESDE|EN 20|HERRERO|DE ENERO)');
  for(const t of ['cuantos nacieron en 2025 contra 2026','se gasto mas en herrero este año o el pasado','ventas 2025 vs 2026','torneos 2025 2026','muertes 2025 contra 2026'])q('Comparar años',t,'^20\\d\\d: .* · 20\\d\\d: ');
  for(const t of ['porcentaje de preñez','machos y hembras por camada','cuantos machos y hembras nacieron en 2026','promedio de potrillos por madre','promedio de herrero por mes'])q('Porcentajes',t,'%|CAMADA|MACHO|PROMEDIO|NO HAY');
  for(const t of ['quien jugo mas este mes','quien jugo mas en septiembre','en que caballo se gasto mas herrero','en que caballo se gasto mas herrero este año','gasto de herrero por mes'])q('Rankings',t,'JUGO MAS|GASTO DE HERRERO|POR MES|NO HAY');
  q('Polo','en que torneos jugo la '+n(tor),'TORNEO');q('Polo','cuando jugo por ultima vez la '+n(tor),'ULTIMA');q('Polo','cuando fue el ultimo torneo de la '+n(tor),'ULTIMO TORNEO|NO TIENE');
  if(chico){q('Meses','cuantos meses tiene el '+n(chico),'MES|DIA');q('Meses','edad del '+n(chico),'MES|DIA|ANO')}
  q('Notas','que anote de la '+n(j[0]),'NOTA');q('Notas','notas sobre herrero','NOTA');
  for(const t of ['que significa el punto rojo','que significa atrasado','que es la ventana de parto','que significan los colores','que quiere decir agarrada','que es hechura','que es desvasar','que significa fpp'])q('Qué significa',t,'[A-Z]{3,}');
  q('Afuera','quienes estan afuera','AFUERA');q('Afuera','cuantos hay a la venta afuera','AFUERA');
  q('Largas','edad de la '+n(j[0])+'. donde esta la '+n(j[1])+'. hijos de la '+n(con)+'. cuando pare la '+n(pre),'\\n\\n[\\s\\S]*\\n\\n[\\s\\S]*\\n\\n');
  // refinar la respuesta anterior (van en orden: cada una usa la lista de la anterior)
  q('Refinar','quienes estan en jugadores','JUGADORES');q('Refinar','de esas cuales son alazanas','^DE ESOS \\d+, ');q('Refinar','ordenalas por edad','^LOS MISMOS');
  q('Refinar','caballos a la venta','VENTA');q('Refinar','de esos solo las hembras','^DE ESOS');q('Refinar','saca las de jugadores','SIN LOS');
  q('Refinar','hijos de '+n(con),'HIJ');q('Refinar','de esos cuantos estan vivos','VIVOS');q('Refinar','ordenalos por nombre','ORDENADOS POR NOMBRE');
  q('Refinar','hijos de la '+n(con),'HIJ');q('Refinar','no, la otra','CUAL|NO HAY OTRO|'+esc(norm(con.nombre).split(' ')[0]));
  // edades (sin que el número se confunda con un caballo)
  for(const t of ['Cuántos yeguas de 3 años hay ? Y cuales ?','3 años','2 años','Edad de dos años','caballos de dos años','cuantos tienen 1 año','machos de 2 años','caballos de 15 años','potrillos de 10 meses'])q('Edades',t,'^(HAY|ENCONTRE|NO HAY) ');
  q('Edades','la '+n(j[0])+' tiene 3 años?','^(SI|NO),|NO SE SABE');
  q('Edades','caballos con dos años','CUENTO POR CAMADA');q('Edades','1 año','CUENTO POR CAMADA');
  // señas de las observaciones
  for(const t of ['cara blanca','todos los cara blanca','quienes tienen la cara blanca','machos cara blanca','yeguas cara blanca','potrillos con cara blanca','carablanca','malacara',
    'estrella en la frente','los que tienen estrella','patas blancas','cuatro patas blancas','una pata blanca','que caballos tienen 3 patas blancas'])q('Señas',t,'^CON |^NO HAY');
  q('Señas','la '+n(j[0])+' tiene cara blanca?','^SI,|NO FIGURA');
  q('Observaciones','observaciones de la '+n(pre),'OBSERVACIONES DE|NO TIENE OBSERVACIONES');q('Observaciones','que dice la ficha de la '+n(j[0]),'OBSERVACIONES DE|NO TIENE OBSERVACIONES');
  q('Observaciones','quien tiene anotado vacunacion preñadas','EN LAS OBSERVACIONES|NO ENCONTRE');q('Observaciones','quien tiene anotado xyzw','NO ENCONTRE');
  return C});
let mal=0;const por={};for(const [g,t,re] of casos){const r=await p.evaluate(q=>{try{return responder(q).txt}catch(e){return 'ERROR '+e.message}},t);
  const ok=new RegExp(re).test(r.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase())&&!/NO TE ENTENDI|UNDEFINED|^ERROR /.test(r.toUpperCase());por[g]=(por[g]||0)+1;
  if(!ok){mal++;console.log('MAL',g,'|',t,'::',r.slice(0,200))}}
// cada caballo: sí/no, seguimiento, movimientos, nietos, herrero
const todos=await p.evaluate(()=>activos().filter(x=>!fuera(x)).map(x=>x.nombre.toLowerCase()));const [b1,b2]=await p.evaluate(()=>{const A=activos();return [A.find(x=>x.categoria==='Jugadores').nombre.toLowerCase(),A.find(x=>hijosDe(x.nombre).length).nombre.toLowerCase()]});let n2=0;
for(const nom of todos){const qs=['observaciones de la '+nom,'la '+nom+' tiene cara blanca?','el '+nom+' tiene estrella en la frente?','xq la '+nom+' esta en rojo','q edad tiene la '+nom,'cuando jugo por ultima vez la '+nom,'notas de la '+nom,'cargale un evento a la '+nom,'la '+nom+' esta a la venta?','la '+nom+' tiene chip?','la '+nom+' es macho?','la '+nom+' esta en doma?','movimientos de '+nom,'nietos de '+nom,'cuanto se gasto en herrero de '+nom,'edad de la '+b1,'y la '+nom+'?','hijos de la '+b2,'y de '+nom];
  for(const t of qs){n2++;const r=await p.evaluate(q=>{try{return responder(q).txt}catch(e){return 'ERROR '+e.message}},t);const R=r.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
    const debe=t.includes(b1)&&!t.includes(nom)||t.includes(b2)&&!t.includes(nom)?null:nom.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
    if(/NO TE ENTENDI|UNDEFINED|^ERROR |NULL/.test(R)||(debe&&!R.includes(debe)&&!/^(SI|NO)\b/.test(R))){mal++;console.log('MAL caballo |',t,'::',r.slice(0,200))}}}
console.log('Por caballo:',n2,'preguntas');
console.log('Preguntas:',casos.length,JSON.stringify(por),'| MAL:',mal);console.log('Errores JS:',errs.length?errs.join(' / '):'ninguno');await b.close()})();
