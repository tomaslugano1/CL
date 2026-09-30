/* Doña Cecilia — funciones agregadas después de la versión inicial:
   1) Descargar todo a Excel  2) Para hacer esta semana  3) Nombres parecidos
   4) Genealogía de 3 generaciones  7) Compartir ficha de venta  8) Recordatorios en el calendario.
   Usa las funciones y el estado (S, UI, db…) del script principal de index.html. */

window.EXTRA_ACTS={};

/* ================= 1) Excel ================= */
function cargarXLSX(){if(window.XLSX)return Promise.resolve();return new Promise((ok,no)=>{const s=document.createElement('script');s.src='xlsx.mini.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
const fx=d=>d?fmt(d):'';
function hoja(filas){const ws=XLSX.utils.json_to_sheet(filas.length?filas:[{'(vacío)':''}]);
  const cols=Object.keys(filas[0]||{'(vacío)':''});ws['!cols']=cols.map(k=>({wch:Math.min(50,Math.max(k.length,...filas.map(f=>String(f[k]??'').length))+2)}));return ws}
async function exportarExcel(){
  try{await cargarXLSX()}catch(e){toast('No se pudo preparar el Excel. Probá de nuevo con señal.');return}
  const porIds=[...new Set(S.eventos.map(e=>e.por).filter(Boolean))];let quien={};
  try{quien=await user?.profiles?.(porIds)||{}}catch(e){}
  const wb=XLSX.utils.book_new();
  const cab=[...S.caballos].sort((a,b)=>(a.estado==='Activo'?0:1)-(b.estado==='Activo'?0:1)||sortCab(a,b)).map(c=>({
    'Nombre':c.nombre,'Estado':c.estado,'Categoría':c.categoria,'Lugar':c.lugar,'Sexo':c.sexo,'Pelaje':c.pelaje,
    'Nacimiento':fx(c.nac),'Camada':c.camada??'','RP':c.rp,'N° chip':c.chip,'Padre':c.padre,'Madre':c.madre,
    'Abuelo paterno':c.abueloP,'Abuela paterna':c.abuelaP,'Abuelo materno':c.abueloM,'Abuela materna':c.abuelaM,
    'Domador':c.domador,'Entrada a doma':fx(c.ingresoDoma),'Alzada':c.alzada,'Prácticas':practicas(c),'Torneos':torneos(c),
    'Última desparasitación':fx(ultimo(c.id,'Desparasitación')),'Última desvasada':fx(ultimo(c.id,'Desvasada')),'Última herrada':fx(ultimo(c.id,'Herrada')),
    'A la venta':c.venta?'Sí':'','Precio':c.precio||'','Fecha de baja':fx(c.bajaFecha),'Detalle de baja':c.bajaObs||'','Observaciones':c.obs}));
  XLSX.utils.book_append_sheet(wb,hoja(cab),'Caballos');
  const ev=[...S.eventos].sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(e=>({'Fecha':fx(e.fecha),'Caballo':byId(e.caballoId)?.nombre||e.caballo,'Tipo':e.tipo,'Detalle':e.detalle,'Observación':e.obs,'Cargó':e.por?(quien[e.por]?.name||''):''}));
  XLSX.utils.book_append_sheet(wb,hoja(ev),'Eventos');
  const sv=[...S.servicios].sort((a,b)=>b.temporada-a.temporada||String(a.madre).localeCompare(b.madre)).map(s=>({'Temporada':s.temporada,'Madre':s.madre,'Padrillo':s.padrillo,'Fecha de servicio':fx(s.fecha),'Parto probable (FPP)':fx(s.fpp),'Estado':s.estado,'Observación':s.obs}));
  XLSX.utils.book_append_sheet(wb,hoja(sv),'Servicios');
  XLSX.utils.book_append_sheet(wb,hoja(S.padrillos.map(p=>({'Nombre':p.nombre,'Tipo':p.tipo,'Padre':p.padre,'Madre':p.madre,'Observación':p.obs}))),'Padrillos');
  XLSX.utils.book_append_sheet(wb,hoja([...S.notas].sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(n=>({'Fecha':fx(n.fecha),'Tema':n.titulo,'Qué pasa':n.texto,'Estado':n.estado}))),'Notas');
  const blob=new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  try{await downloads.save({filename:'Doña Cecilia '+hoy()+'.xlsx',data:blob});try{localStorage.setItem('dc-ultima-copia',hoy())}catch(e){}toast('Excel descargado');render()}
  catch(e){toast('No se pudo descargar el Excel.')}}
EXTRA_ACTS.excel=exportarExcel;
function diasSinCopia(){let u=null;try{u=localStorage.getItem('dc-ultima-copia')}catch(e){}return u?diff(hoy(),u):null}

/* ================= 2) Para hacer esta semana ================= */
const VERBO={'Desparasitación':'Desparasitar','Desvasada':'Desvasar','Herrada':'Herrar'};
let TAREAS=[];
/* Mismas reglas que Sanidad: caballos activos que no están en Doma. Herrar solo a los que ya se herraron alguna vez. */
function tareasSemana(dias=7){const lim=addDays(hoy(),dias),g={};let sinDato=0;
  for(const c of activos().filter(enCampo))for(const t of ['Desparasitación','Desvasada','Herrada']){
    if(t==='Herrada'&&!ultimo(c.id,'Herrada'))continue;
    const s=estadoSan(c,t);if(!s.p){if(t==='Desparasitación')sinDato++;continue}
    if(s.p>lim)continue;const lugar=c.lugar||'Sin lugar';const k=lugar+'|'+t;(g[k]=g[k]||{lugar,t,items:[]}).items.push({c,s})}
  const grupos=Object.values(g).sort((a,b)=>a.lugar.localeCompare(b.lugar)||a.t.localeCompare(b.t));
  grupos.forEach(x=>x.items.sort((a,b)=>a.s.d-b.s.d));return{grupos,sinDato}}
function partosCerca(dias=14){const lim=addDays(hoy(),dias);return S.servicios.filter(s=>s.estado==='Preñada'&&s.fpp&&s.fpp<=lim).sort((a,b)=>a.fpp.localeCompare(b.fpp))}
function panelTareas(){const {grupos,sinDato}=tareasSemana();TAREAS=grupos;const partos=partosCerca();const notas=S.notas.filter(n=>n.estado!=='Listo').length;
  const nom=gruposNombres().length;const sc=diasSinCopia();
  const porLugar=[...new Set(grupos.map(x=>x.lugar))];
  const bloque=porLugar.map(l=>`<div class="t-lugar"><h4>${esc(l)}</h4>${grupos.map((x,i)=>x.lugar!==l?'':(()=>{const v=x.items.filter(y=>y.s.d<0).length;
    return `<details class="tarea"><summary><span class="grow"><b>${VERBO[x.t]}</b> · ${x.items.length} caballo${x.items.length>1?'s':''}</span>${v?`<span class="pill p-bad">${v} vencido${v>1?'s':''}</span>`:'<span class="pill p-warn">esta semana</span>'}<span class="go">›</span></summary>
      <div class="list">${x.items.map(y=>`<div class="li"><span class="a" data-open="${y.c.id}">${esc(y.c.nombre)}</span><span class="small ${y.s.d<0?'':'muted'}">${y.s.d<0?'vencido hace '+(-y.s.d)+' d':y.s.d===0?'vence hoy':'vence '+fmt(y.s.p)}</span></div>`).join('')}</div>
      ${canWrite?`<button class="btn pri" data-act="tarea" data-k="${i}">Hecho: cargar a ${x.items.length>1?'los '+x.items.length:'este'}</button>`:''}</details>`})()).join('')}</div>`).join('');
  const extras=[
    partos.length?`<div class="t-lugar"><h4>Partos a vigilar</h4>${partos.map(s=>{const d=diff(s.fpp,hoy());return `<div class="li"><div><span class="a" data-open-name="${esc(s.madre)}">${esc(s.madre)}</span><div class="sub">${esc(s.padrillo||'—')} · FPP ${fmt(s.fpp)}</div></div><span class="pill ${d<0?'p-bad':'p-warn'}">${d<0?'pasó hace '+(-d)+' d':d===0?'hoy':'faltan '+d+' d'}</span></div>`}).join('')}${canWrite?'':''}</div>`:'',
    notas?`<div class="li"><span>${notas} nota${notas>1?'s':''} para revisar</span><button class="btn sm" data-tab="notas">Ver</button></div>`:'',
    nom?`<div class="li"><span>${nom} nombre${nom>1?'s':''} escrito${nom>1?'s':''} de distinta forma</span><button class="btn sm" data-act="nombres">Revisar</button></div>`:'',
    sinDato?`<div class="li"><span class="muted">${sinDato} caballo${sinDato>1?'s':''} sin dato de desparasitación</span><button class="btn sm" data-tab="sanidad">Ver</button></div>`:'',
    sc===null||sc>=30?`<div class="li"><span>${sc===null?'Nunca bajaste una copia de los datos en este aparato':'Hace '+sc+' días que no bajás una copia de los datos'}</span><button class="btn sm" data-act="excel">Bajar Excel</button></div>`:''].filter(Boolean).join('');
  try{navigator.setAppBadge&&(grupos.length?navigator.setAppBadge(grupos.reduce((n,x)=>n+x.items.length,0)):navigator.clearAppBadge())}catch(e){}
  return `<div class="panel tareas"><div class="head" style="margin-bottom:8px"><h3 style="margin:0">Para hacer esta semana</h3><span class="small muted">hasta el ${fmt(addDays(hoy(),7))}</span></div>
    ${bloque||'<div class="muted small" style="padding:6px 0 10px">Nada de sanidad para esta semana.</div>'}${extras?`<div class="list" style="margin-top:6px">${extras}</div>`:''}</div>`}
EXTRA_ACTS.tarea=d=>{const g=TAREAS[+d.k];if(g)eventoForm(g.items.map(x=>x.c.id),g.t)};
function contarTareas(){const {grupos}=tareasSemana();let n=0,v=0;for(const g of grupos)for(const i of g.items){n++;if(i.s.d<0)v++}return{n,v}}

/* ================= 3) Nombres parecidos ================= */
const ABREV={STA:'SANTA',STO:'SANTO',SN:'SAN',STGO:'SANTIAGO'};
function canon(n){return norm(n).replace(/[.,'"()\-_/]/g,' ').split(/\s+/).filter(Boolean).map(w=>ABREV[w]||w).join(' ')}
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;let p=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){const q=[i];for(let j=1;j<=n;j++)q[j]=Math.min(p[j]+1,q[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=q}return p[n]}
const CAMPOS_NOMBRE=['padre','madre','abueloP','abuelaP','abueloM','abuelaM'];
function nombresConocidos(){const m=new Map();const add=(n,peso)=>{n=String(n||'').trim();if(!n)return;const k=norm(n);const e=m.get(k)||{n,usos:0};e.usos+=peso;m.set(k,e)};
  for(const c of S.caballos){add(c.nombre,1);CAMPOS_NOMBRE.forEach(f=>add(c[f],1))}
  for(const p of S.padrillos){add(p.nombre,1);add(p.padre,1);add(p.madre,1)}
  for(const s of S.servicios){add(s.padrillo,1);add(s.madre,1)}
  return [...m.values()]}
/* Dos nombres parecen el mismo caballo: iguales salvo puntos/abreviaturas, una o dos letras de diferencia,
   o uno es el final del otro con el prefijo del haras (HULK / DOLFINA HULK). */
function parecidos(a,b){const x=canon(a),y=canon(b);if(!x||!y||norm(a)===norm(b))return false;if(x===y)return true;
  // números distintos = caballos distintos (Cría 2021 / Cría 2023, DC 28 / DC 35)
  if((x.match(/\d+/g)||[]).join(' ')!==(y.match(/\d+/g)||[]).join(' '))return false;
  // macho / hembra del mismo nombre (PULPERO / PULPERA) son caballos distintos
  const sx=w=>w.replace(/[AO]\b/g,'*');if(sx(x)===sx(y))return false;
  const L=Math.max(x.length,y.length);if(L>=6&&lev(x,y)<=(L>=12?2:1))return true;
  // uno es el otro con el prefijo del haras adelante (HULK / DOLFINA HULK)
  const [corto,largo]=x.length<y.length?[x,y]:[y,x];const lo=x.length<y.length?b:a;
  if(/[()]/.test(lo)||/\d/.test(largo)||corto.length<4||!largo.endsWith(' '+corto))return false;
  return largo.slice(0,-corto.length-1).split(' ').length===1}
function nombresOk(){return new Set(S.config.nombresOk||[])}
function gruposNombres(){const ks=nombresConocidos();const n=ks.length,par=ks.map((_,i)=>i);const f=i=>par[i]===i?i:(par[i]=f(par[i]));
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(parecidos(ks[i].n,ks[j].n))par[f(i)]=f(j);
  const g={};ks.forEach((k,i)=>{(g[f(i)]=g[f(i)]||[]).push(k)});const ok=nombresOk();
  return Object.values(g).filter(x=>x.length>1).map(x=>x.sort((a,b)=>b.usos-a.usos)).filter(x=>!ok.has(firma(x)))}
const firma=g=>g.map(x=>norm(x.n)).sort().join('|');
/* Aviso "¿Es …?" debajo de Padre, Madre y abuelos al escribir */
function conectarSugerencias(){for(const k of CAMPOS_NOMBRE){const el=document.getElementById('f-'+k);if(!el)continue;
  const lab=el.closest('label');const hint=document.createElement('div');hint.className='sug';hint.hidden=true;lab.after(hint);
  const ver=()=>{const v=el.value.trim();hint.hidden=true;if(!v)return;const ks=nombresConocidos();const mio=ks.find(x=>norm(x.n)===norm(v));
    const c=ks.filter(x=>parecidos(v,x.n)&&x.usos>=(mio?.usos||0)).sort((a,b)=>b.usos-a.usos)[0];if(!c)return;
    hint.innerHTML=`¿Es <b>${esc(c.n)}</b>? <span class="muted">(aparece ${c.usos} ${c.usos>1?'veces':'vez'})</span> <button type="button" class="btn sm">Usar ese</button>`;hint.hidden=false;
    hint.querySelector('button').onclick=()=>{el.value=c.n;hint.hidden=true;el.dispatchEvent(new Event('change'))}};
  el.addEventListener('change',ver);el.addEventListener('blur',ver);ver()}}
function revisarNombres(){const gs=gruposNombres();UI.ficha=null;
  $('#modal').innerHTML=`<div class="ov" data-close-ov><div class="sheet narrow"><div class="sheet-h"><h2>Nombres parecidos</h2><button class="x" data-act="close" aria-label="Cerrar">×</button></div>
   <div class="sheet-b">${gs.length?`<p class="note" style="margin:0">Estos nombres parecen ser el mismo caballo escrito de distinta forma. Elegí cómo queda y tocá “Unificar”: se corrige en padres, madres, abuelos, servicios y padrillos. El nombre propio de cada ficha no se toca. Si son caballos distintos, tocá “Son distintos” y no vuelve a aparecer.</p>
   ${gs.map((g,i)=>`<div class="panel ngrupo">${g.map((x,j)=>`<label class="nopt"><input type="radio" name="ng${i}" value="${j}" ${j?'':'checked'}><span class="grow">${esc(x.n)}</span><span class="small muted">${x.usos} ${x.usos>1?'veces':'vez'}</span></label>`).join('')}
     <div class="row" style="margin-top:10px"><button class="btn" data-act="nombresDistintos" data-k="${i}">Son distintos</button><button class="btn pri" data-act="unificar" data-k="${i}">Unificar</button></div></div>`).join('')}`
   :'<div class="empty">No hay nombres parecidos para revisar. 👌</div>'}</div></div></div>`;
  revisarNombres.gs=gs}
EXTRA_ACTS.nombres=revisarNombres;
EXTRA_ACTS.nombresDistintos=async d=>{const g=revisarNombres.gs[+d.k];await db.doc('config/app').set({...S.config,nombresOk:[...(S.config.nombresOk||[]),firma(g)]});S.config.nombresOk=[...(S.config.nombresOk||[]),firma(g)];toast('Listo, quedan como distintos');revisarNombres()};
EXTRA_ACTS.unificar=async d=>{const g=revisarNombres.gs[+d.k];const j=+(document.querySelector(`input[name=ng${d.k}]:checked`)?.value||0);const bueno=g[j].n;
  const malos=new Set(g.filter((_,i)=>i!==j).map(x=>norm(x.n)));const fix=v=>v&&malos.has(norm(v));let n=0;
  for(const c of S.caballos){const u={};for(const f of CAMPOS_NOMBRE)if(fix(c[f]))u[f]=bueno;if(Object.keys(u).length){await db.collection('caballos').doc(c.id).update(u);n++}}
  for(const s of S.servicios){const u={};if(fix(s.padrillo))u.padrillo=bueno;if(fix(s.madre))u.madre=bueno;if(Object.keys(u).length){await db.collection('servicios').doc(s.id).update(u);n++}}
  for(const p of S.padrillos){const u={};for(const f of ['nombre','padre','madre'])if(fix(p[f]))u[f]=bueno;if(Object.keys(u).length){await db.collection('padrillos').doc(p.id).update(u);n++}}
  toast(`Unificado como ${bueno} (${n} registro${n===1?'':'s'})`);setTimeout(revisarNombres,300)};

/* ================= 4) Genealogía de 3 generaciones ================= */
function padresDeNombre(n){return n?(padresDe(n)||{}):{}}
function arbol4(c,padre,madre){
  const gp=padre||padresDeNombre(c.padre),gm=madre||padresDeNombre(c.madre);
  const a=[c.abueloP||gp.padre||'',c.abuelaP||gp.madre||'',c.abueloM||gm.padre||'',c.abuelaM||gm.madre||''];
  const b=a.flatMap(n=>{const x=padresDeNombre(n);return[x.padre||'',x.madre||'']});
  const box=(cls,rol,n,sx,ext)=>{const o=n&&findByName(n),p=!o&&n&&S.padrillos.find(x=>norm(x.nombre)===norm(n));
    const act=o?`data-open="${o.id}"`:p?`data-pad="${p.id}"`:'';
    return `<${act?'button type="button"':'div'} class="n ${cls} ${n?sx:'unk'}" ${act}><span>${rol}</span><b>${n?esc(n):'Desconocido'}</b>${act?'<i>ver ficha →</i>':''}</${act?'button':'div'}>`};
  const rolA=['Abuelo paterno','Abuela paterna','Abuelo materno','Abuela materna'];
  return `<div class="tree4"><div class="n me ${c.sexo==='Macho'?'M':c.sexo==='Hembra'?'H':''}"><span>Este caballo</span><b>${esc(c.nombre)}</b></div>`
   +box('p1','Padre',c.padre,'M')+box('p2','Madre',c.madre,'H')
   +a.map((n,i)=>box('a'+(i+1),rolA[i],n,i%2?'H':'M')).join('')
   +b.map((n,i)=>box('b'+(i+1),i%2?'Bisabuela':'Bisabuelo',n,i%2?'H':'M')).join('')+'</div>'}

/* ================= 7) Ficha de venta: compartir directo ================= */
function puedeCompartirArchivos(){try{return !!navigator.canShare&&navigator.canShare({files:[new File([''],'x.png',{type:'image/png'})]})}catch(e){return false}}
EXTRA_ACTS.vshare=async d=>{const c=byId(d.id);toast('Preparando la imagen…');
  try{const b=await dibujarVenta(c);const f=new File([b],'Ficha de venta '+c.nombre.replace(/[\\/:*?"<>|]/g,'')+'.png',{type:'image/png'});
    await navigator.share({files:[f],text:ventaTexto(c)})}catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir. Probá “Descargar imagen”.')}};

/* ================= 8) Recordatorios en el calendario ================= */
async function panelRecordatorios(){UI.ficha=null;
  $('#modal').innerHTML=`<div class="ov" data-close-ov><div class="sheet narrow"><div class="sheet-h"><h2>Recordatorios</h2><button class="x" data-act="close" aria-label="Cerrar">×</button></div><div class="sheet-b" id="rec-b"><div class="empty">Buscando tu link…</div></div></div></div>`;
  let k=null,err='';try{k=await window.DC_CLAVE_CAL()}catch(e){err=e?.message||String(e)}
  const b=$('#rec-b');if(!b)return;
  if(!k){b.innerHTML=`<div class="empty">${navigator.onLine?'Falta activar los recordatorios en la base de datos (un paso único en Supabase: correr <b>supabase/recordatorios.sql</b>, ver la guía).':'Necesitás señal para esto.'}</div>${err?`<p class="note">${esc(err)}</p>`:''}`;return}
  const url=location.origin+'/calendario.ics?k='+k,web=url.replace(/^https?:/,'webcal:');
  b.innerHTML=`<p style="margin:0">Suscribite una vez y tu calendario muestra solo, y se actualiza solo: <b>qué hay que desparasitar, desvasar y herrar cada día</b> (por lugar) y <b>los partos probables</b>. El calendario te avisa como cualquier otro evento.</p>
   <div class="panel"><h3>Android / Google Calendar</h3><p class="small" style="margin:0 0 10px">Hacelo <b>desde la compu</b>: se abre Google Calendar y tocás “Agregar”. Después aparece solo en el celular.</p>
    <a class="btn pri" style="width:100%" href="https://calendar.google.com/calendar/r?cid=${encodeURIComponent(web)}" target="_blank" rel="noopener">Agregar a Google Calendar</a></div>
   <div class="panel"><h3>iPhone</h3><a class="btn pri" style="width:100%" href="${web}">Agregar al Calendario del iPhone</a></div>
   <div class="panel"><h3>Link para copiar</h3><input readonly value="${esc(url)}" onclick="this.select()"><div class="row" style="margin-top:8px"><button class="btn sm" data-act="copiarCal" data-u="${esc(url)}">Copiar link</button></div>
    <p class="note">No lo compartas fuera del equipo: con este link se ven los nombres de los caballos y las fechas.</p></div>
   <p class="note">Tip: en Google Calendar, en la configuración de este calendario, poné una notificación “1 día antes a las 8:00” para que te avise al celular.</p>`}
EXTRA_ACTS.recordatorios=panelRecordatorios;
EXTRA_ACTS.copiarCal=async d=>{try{await navigator.clipboard.writeText(d.u);toast('Link copiado')}catch(e){toast('Seleccioná el link y copialo')}};

/* ================= Panel de herramientas en Inicio ================= */
function panelHerramientas(){const sc=diasSinCopia();
  return `<div class="panel"><h3>Herramientas</h3><div class="list">
   <div class="li"><div>Descargar todo a Excel<div class="sub">Copia de seguridad con caballos, eventos, servicios, padrillos y notas.${sc!==null?' Última copia en este aparato: '+(sc===0?'hoy':'hace '+sc+' días')+'.':''}</div></div><button class="btn sm pri" data-act="excel">Excel</button></div>
   <div class="li"><div>Recordatorios en el calendario<div class="sub">Sanidad y partos en tu Google Calendar o iPhone, con aviso.</div></div><button class="btn sm" data-act="recordatorios">Activar</button></div>
   <div class="li"><div>Nombres parecidos<div class="sub">Unificar padres y madres escritos de distinta forma.</div></div><button class="btn sm" data-act="nombres">Revisar</button></div>
  </div></div>`}
