/* Prueba de cambios (pedido de Tomás el 25/10/2026): renombra madres y potrillos, deja sin preñadas, parto atrasado, muere una madre,
   alta casi vacía, cambio de categoría y de temporada, y mira que la app siga entera (recuadros del Inicio que se tocan, servicios e hijos).
   Uso: NODE_PATH=/opt/node-tools/node_modules:$(npm root -g) node herramientas/prueba_cambios.cjs <carpeta con app.json>. Sin datos en el repo. */
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
p.on('pageerror',e=>console.log('  ERROR JS:',e.message));
const abrir=async()=>{await p.goto('http://app.local/');await p.waitForTimeout(1200);await p.evaluate(()=>render());await p.waitForTimeout(1800)};
const editar=async(id,campos)=>{await p.evaluate(id=>caballoForm(byId(id)),id);await p.waitForTimeout(300);
  for(const[k,v]of Object.entries(campos))await p.fill('#f-'+k,v);await p.click('#f button[type=submit]');await p.waitForTimeout(1200)};
const foto=async()=>p.evaluate(()=>{
  const tiles=[...document.querySelectorAll('.tile')].map(t=>t.querySelector('span')?.textContent.trim()+(t.classList.contains('toca')?' [toca]':' [NO SE TOCA]'));
  const m=n=>{const c=findByName(n);return c?{servicios:S.servicios.filter(s=>norm(s.madre)===norm(c.nombre)).length,hijos:S.caballos.filter(x=>norm(x.madre)===norm(c.nombre)).length}:'no existe'};
  return {tiles,BAYA:m('BAYA'),LABAYA:m('LA BAYA'),MARTINA:m('MARTINA'),MARTINA2:m('MARTINA II')}});
const esc=[];
const caso=async(t,fn)=>{console.log('\n### '+t);await abrir();try{await fn()}catch(e){console.log('  FALLÓ LA PRUEBA:',e.message.split('\n')[0])}};

await caso('0. Normal (como queda el 29)',async()=>console.log(JSON.stringify(await foto())));
await caso('1. Cambiar el nombre de una madre: BAYA -> LA BAYA',async()=>{const id=await p.evaluate(()=>findByName('BAYA').id);await editar(id,{nombre:'LA BAYA'});
  console.log(JSON.stringify(await foto()));
  console.log('  potrillo DC S/N BAYA 26, madre =',await p.evaluate(()=>findByName('DC S/N BAYA 26')?.madre));
  await p.evaluate(()=>{UI.ficha=findByName('LA BAYA').id;renderFicha()});await p.waitForTimeout(400);
  console.log('  ficha LA BAYA tiene Progenie:',await p.evaluate(()=>/Progenie/.test(document.querySelector('#modal').innerText)),'| Servicios con datos:',await p.evaluate(()=>/IRENITA/.test(document.querySelector('#modal').innerText)))});
await caso('2. Cambiar el nombre de una preñada: MARTINA -> MARTINA II',async()=>{const id=await p.evaluate(()=>findByName('MARTINA').id);await editar(id,{nombre:'MARTINA II'});
  await p.evaluate(()=>{closeModal();UI.ficha=null;UI.tab='inicio';render()});await p.waitForTimeout(300);console.log(JSON.stringify(await foto()));
  console.log('  Inicio Próximo parto dice:',await p.evaluate(()=>[...document.querySelectorAll('.tile')].find(t=>/Próximo parto/.test(t.textContent))?.textContent.replace(/\n/g,' ')));
  console.log('  Preñadas:',await p.evaluate(()=>[...document.querySelectorAll('.tile')].find(t=>/Preñadas/.test(t.textContent))?.textContent.replace(/\n/g,' ')))});
await caso('2b. Ponerle a un caballo el nombre de otro que ya existe: CHINA -> MORIA',async()=>{const id=await p.evaluate(()=>findByName('CHINA').id);await editar(id,{nombre:'MORIA'});
  console.log('  quedan CHINA:',await p.evaluate(()=>!!findByName('CHINA')),'| MORIAs:',await p.evaluate(()=>S.caballos.filter(c=>norm(c.nombre)==='MORIA').length),'| aviso:',await p.evaluate(()=>document.querySelector('#toast').textContent))});
await caso('3. Ponerle nombre a un potrillo: DC S/N BAYA 26 -> LUNA',async()=>{const id=await p.evaluate(()=>findByName('DC S/N BAYA 26').id);await editar(id,{nombre:'LUNA'});
  await p.evaluate(()=>{UI.ficha=findByName('BAYA').id;renderFicha()});await p.waitForTimeout(400);
  console.log('  ficha BAYA: servicio dice "Nació: LUNA":',await p.evaluate(()=>/Nació:\s*LUNA/.test(document.querySelector('#modal').innerText)),'| Progenie muestra LUNA:',await p.evaluate(()=>/LUNA/.test(document.querySelector('#modal').innerText)));
  await p.evaluate(()=>{UI.tab='camadas';render()});console.log('  Camadas muestra LUNA:',await p.evaluate(()=>/LUNA/.test(document.querySelector('main').innerText)))});
await caso('4. Sin ninguna preñada (todas vacías)',async()=>{await p.evaluate(async()=>{for(const s of S.servicios.filter(s=>s.estado==='Preñada'))await db.collection('servicios').doc(s.id).update({estado:'Vacía'})});await p.waitForTimeout(800);
  await p.evaluate(()=>{UI.tab='inicio';render()});console.log(JSON.stringify((await foto()).tiles))});
await caso('5. Parto atrasado (fpp de MARTINA hace 10 días)',async()=>{await p.evaluate(async()=>{const s=S.servicios.find(s=>norm(s.madre)==='MARTINA'&&s.estado==='Preñada');await db.collection('servicios').doc(s.id).update({fpp:addDays(hoy(),-10)})});await p.waitForTimeout(800);
  await p.evaluate(()=>{UI.tab='inicio';render()});const f=await foto();console.log(JSON.stringify(f.tiles));
  await p.evaluate(()=>EXTRA_ACTS.iniParto());await p.waitForTimeout(400);console.log('  tocar Próximo parto abre:',await p.evaluate(()=>document.querySelector('#modal h2')?.textContent))});
await caso('6. Nada para hacer y nada para revisar',async()=>{await p.evaluate(()=>{vencidos=()=>[];tareasSemana=()=>({grupos:[],sinDato:0});S.notas=[];UI.tab='inicio';render()});await p.waitForTimeout(400);console.log(JSON.stringify((await foto()).tiles))});
await caso('7. Muere una madre con hijos (BAYA, baja Muerto)',async()=>{await p.evaluate(async()=>{const c=findByName('BAYA');await db.collection('caballos').doc(c.id).update({estado:'Muerto',bajaFecha:hoy()})});await p.waitForTimeout(800);
  await p.evaluate(()=>{UI.ficha=findByName('BAYA').id;renderFicha()});await p.waitForTimeout(400);
  console.log('  ficha abre y tiene Progenie:',await p.evaluate(()=>/Progenie/.test(document.querySelector('#modal').innerText)));
  await p.evaluate(()=>{UI.ficha=findByName('DC S/N BAYA 26').id;renderFicha()});await p.waitForTimeout(400);console.log('  ficha del potrillo abre:',await p.evaluate(()=>!!document.querySelector('#modal h2')))});
await caso('8. Caballo con casi todo vacío (alta nueva solo con nombre)',async()=>{await p.evaluate(async()=>{await db.collection('caballos').doc('x-vacio').set({nombre:'PRUEBA',estado:'Activo',categoria:'Jugadores'})});await p.waitForTimeout(800);
  for(const t of ['inicio','caballos','sanidad','camadas','padrillos','madres','notas']){await p.evaluate(t=>{UI.tab=t;render()},t);await p.waitForTimeout(200)}
  await p.evaluate(()=>{UI.ficha='x-vacio';renderFicha()});await p.waitForTimeout(300);await p.evaluate(()=>EXTRA_ACTS.diaFotos());await p.waitForTimeout(300);
  console.log('  recorrió todas las pantallas; día de fotos lo muestra:',await p.evaluate(()=>/PRUEBA/.test(document.querySelector('#modal').innerText)));
  await p.evaluate(()=>{UI.tab='caballos';UI.q='prueba';render()});console.log('  búsqueda lo encuentra:',await p.evaluate(()=>/PRUEBA/.test(document.querySelector('main').innerText)))});
await caso('9. Alegra pasa a Descanso',async()=>{const id=await p.evaluate(()=>findByName('ALEGRA').id);await p.evaluate(id=>caballoForm(byId(id)),id);await p.waitForTimeout(300);await p.selectOption('#f-categoria','Descanso');await p.click('#f button[type=submit]');await p.waitForTimeout(1500);
  await p.evaluate(()=>{const b=document.querySelector('#modal button[type=submit]');b&&b.click()});await p.waitForTimeout(800);
  console.log('  línea:',await p.evaluate(()=>trabajoLinea(findByName('ALEGRA'))||'(vacía)'))});
await caso('10. Cambiar la temporada a 2027 en la configuración',async()=>{await p.evaluate(()=>{S.config.temporada=2027;UI.tab='inicio';render()});console.log(JSON.stringify((await foto()).tiles))});
await caso('11. Renombrar un padrillo: IRENITA PORRON -> I. PORRON (desde Padrillos)',async()=>{
  const r=await p.evaluate(async()=>{const p=S.padrillos.find(x=>/IRENITA/.test(x.nombre));if(!p)return 'no está como padrillo cargado';padForm(p);return 'ok'});await p.waitForTimeout(300);
  if(r==='ok'){await p.fill('#f-nombre','I. PORRON');await p.click('#f button[type=submit]');await p.waitForTimeout(1500)}
  console.log('  ',r,'| hijos con padre nuevo:',await p.evaluate(()=>S.caballos.filter(c=>norm(c.padre)==='I. PORRON').length),'| con el viejo:',await p.evaluate(()=>S.caballos.filter(c=>norm(c.padre)==='IRENITA PORRON').length));
  await p.evaluate(()=>{UI.tab='padrillos';render()});console.log('   tarjetas de padrillo con PORRON:',await p.evaluate(()=>[...document.querySelectorAll('.pcard .pc-nom')].filter(x=>/PORRON/.test(x.textContent)).map(x=>x.textContent)))});
await b.close()})();
