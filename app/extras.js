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
    'Nombre':c.nombre,'Apodo':c.apodo||'','Estado':c.estado,'Categoría':c.categoria,'Lugar':c.lugar,'Sexo':c.sexo,'Pelaje':c.pelaje,
    'Nacimiento':fx(c.nac),'Camada':c.camada??'','RP':c.rp,'N° chip':c.chip,'Padre':c.padre,'Madre':c.madre,
    'Abuelo paterno':c.abueloP,'Abuela paterna':c.abuelaP,'Abuelo materno':c.abueloM,'Abuela materna':c.abuelaM,
    'Bisabuelos lado padre':(()=>{const ap=c.abueloP||padresDeNombre(c.padre).padre,bp=c.abuelaP||padresDeNombre(c.padre).madre;return [ap,bp].map(n=>{const x=padresDeNombre(n);return x.padre||x.madre?(x.padre||'?')+' × '+(x.madre||'?'):''}).filter(Boolean).join(' / ')})(),
    'Domador':c.domador,'Ritmo':['Hechura','Jugadores'].includes(c.categoria)?(RITMOS.find(r=>r[0]===((c.ritmo==='fuerte'?'normal':c.ritmo)||(c.categoria==='Jugadores'?'normal':'')))?.[1]||''):'','Entrada a doma':fx(c.ingresoDoma),'Alzada':c.alzada,'Prácticas':practicas(c),'Torneos':torneos(c),
    'Última desparasitación':fx(ultimo(c.id,'Desparasitación')),'Último desvase o herraje':fx(ultimo(c.id,'Desvasada')),'Última herrada':fx(ultimo(c.id,'Herrada')),
    'A la venta':c.venta?'Sí':'','Precio':c.precio||'','Fecha de baja':fx(c.bajaFecha),'Detalle de baja':c.bajaObs||'','Observaciones':c.obs}));
  XLSX.utils.book_append_sheet(wb,hoja(cab),'Caballos');
  const ev=[...S.eventos].sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(e=>({'Fecha':fx(e.fecha),'Caballo':byId(e.caballoId)?.nombre||e.caballo,'Tipo':e.tipo,'Detalle':e.detalle,'Observación':e.obs,'Precio':+e.precio||'','Cargó':e.por?(quien[e.por]?.name||''):''}));
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

/* Cambiar el nombre de un padrillo o ancestro en todas las fichas, servicios y padrillos que lo mencionan */
async function renombrarEnTodos(viejo,nuevo){const k=norm(viejo);let n=0;if(!k||!nuevo)return 0;
  for(const c of S.caballos){const u={};for(const f of CAMPOS_NOMBRE)if(norm(c[f])===k)u[f]=nuevo;if(Object.keys(u).length){await db.collection('caballos').doc(c.id).update(u);n++}}
  for(const s of S.servicios)if(norm(s.padrillo)===k){await db.collection('servicios').doc(s.id).update({padrillo:nuevo});n++}
  for(const p of S.padrillos){const u={};for(const f of ['padre','madre',...PAD_GEN.map(x=>x[0])])if(norm(p[f])===k)u[f]=nuevo;if(Object.keys(u).length){await db.collection('padrillos').doc(p.id).update(u);n++}}
  return n}

/* ================= 4) Genealogía de 3 generaciones ================= */
var padresDeNombre=function(n){return n?(padresDe(n)||{}):{}};
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

/* ================= Genealogía completa de padrillos ================= */
/* Cada padrillo guarda padres, 4 abuelos y 8 bisabuelos. Con eso se arma un índice nombre → padres
   que usan los árboles de sus hijos (y de cualquier caballo que tenga esos ancestros). */
const PAD_GEN=[['abueloP','Abuelo paterno'],['abuelaP','Abuela paterna'],['abueloM','Abuelo materno'],['abuelaM','Abuela materna'],
  ['bis1','Bisabuelo (padre del abuelo paterno)'],['bis2','Bisabuela (madre del abuelo paterno)'],['bis3','Bisabuelo (padre de la abuela paterna)'],['bis4','Bisabuela (madre de la abuela paterna)'],
  ['bis5','Bisabuelo (padre del abuelo materno)'],['bis6','Bisabuela (madre del abuelo materno)'],['bis7','Bisabuelo (padre de la abuela materna)'],['bis8','Bisabuela (madre de la abuela materna)']];
function camposGenPadrillo(p){return PAD_GEN.map(([k,l])=>({k,l,v:p?.[k]}))}
function genCargada(p){return ['padre','madre',...PAD_GEN.map(x=>x[0])].filter(k=>String(p[k]||'').trim()).length}
let _idx=null,_idxKey='';
function indiceGenealogia(){const key=JSON.stringify(S.padrillos);if(_idx&&key===_idxKey)return _idx;const m=new Map();
  const put=(n,pa,ma)=>{n=String(n||'').trim();if(!n||!(pa||ma))return;const k=norm(n);if(!m.has(k))m.set(k,{padre:pa||'',madre:ma||''})};
  // de la generación más cercana a la más lejana: si dos planillas no coinciden, gana la más directa
  for(const p of S.padrillos)put(p.nombre,p.padre,p.madre);
  for(const p of S.padrillos){put(p.padre,p.abueloP,p.abuelaP);put(p.madre,p.abueloM,p.abuelaM)}
  for(const p of S.padrillos){put(p.abueloP,p.bis1,p.bis2);put(p.abuelaP,p.bis3,p.bis4);put(p.abueloM,p.bis5,p.bis6);put(p.abuelaM,p.bis7,p.bis8)}
  _idx=m;_idxKey=key;return m}
padresDeNombre=function(n){if(!n)return{};const c=findByName(n);if(c&&(c.padre||c.madre))return{padre:c.padre||'',madre:c.madre||''};
  return indiceGenealogia().get(norm(n))||padresDe(n)||{}};
(function(){const orig=padresDe;padresDe=function(n){const k=norm(n);if(!k)return null;const c=S.caballos.find(x=>norm(x.nombre)===k&&(x.padre||x.madre));if(c)return orig(n);
  const g=indiceGenealogia().get(k);return g?{...g,de:'la genealogía de padrillos'}:orig(n)}})();
function arbolPadrillo(p){const c={nombre:p.nombre,sexo:'Macho',padre:p.padre,madre:p.madre,abueloP:p.abueloP,abuelaP:p.abuelaP,abueloM:p.abueloM,abuelaM:p.abuelaM};return arbol4(c,null,null)}

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

/* ================= Notificaciones en el celular ================= */
async function panelNotificaciones(){UI.ficha=null;const P=window.DC_PUSH;
  $('#modal').innerHTML=`<div class="ov" data-close-ov><div class="sheet narrow"><div class="sheet-h"><h2>Notificaciones</h2><button class="x" data-act="close" aria-label="Cerrar">×</button></div><div class="sheet-b" id="not-b"><div class="empty">Revisando…</div></div></div></div>`;
  const b=$('#not-b');const que='<p style="margin:0">A las <b>8:00</b> te llega un aviso al celular, como uno de WhatsApp: <b>el día que vence</b> algo y <b>7 días antes</b> (también los partos), y <b>los lunes</b> un resumen de todo lo de la semana. Llega aunque la app esté cerrada. Se activa <b>en cada celular</b> por separado.</p>';
  if(!P||!P.soportado()){b.innerHTML=que+(P&&P.esIOS()&&!P.instalada()?`<div class="panel"><h3>En iPhone, primero instalá la app</h3><ol style="margin:0;padding-left:18px"><li>Abrí la app en <b>Safari</b>.</li><li>Botón compartir ⬆ → <b>Agregar a inicio</b>.</li><li>Abrí la app <b>desde ese ícono</b> y volvé acá.</li></ol><p class="note">Apple solo permite notificaciones en apps agregadas a la pantalla de inicio (iOS 16.4 o más nuevo).</p></div>`:'<div class="empty">Este navegador no permite notificaciones. En Android usá Chrome.</div>');return}
  let st='apagada';try{st=await P.estado()}catch(e){}
  if(st==='bloqueada'){b.innerHTML=que+`<div class="panel"><h3>Están bloqueadas</h3><p class="small" style="margin:0">Alguna vez se tocó "Bloquear". Para destrabarlo: en Android, mantené apretado el ícono de la app → <b>Info de la app → Notificaciones → Permitir</b>. En la compu: el candadito al lado de la dirección → <b>Notificaciones → Permitir</b>. Después volvé acá.</p></div>`;return}
  b.innerHTML=que+(st==='activa'
    ?`<div class="panel"><h3>✅ Activadas en este aparato</h3><div class="row" style="margin-top:8px"><button class="btn pri" data-act="pushProbar">Mandarme una de prueba</button><button class="btn" data-act="pushOff">Desactivar</button></div><p class="note" id="not-msg"></p></div>`
    :`<button class="btn pri" style="width:100%;min-height:48px" data-act="pushOn">Activar notificaciones en este celular</button><p class="note" id="not-msg">El celular te va a preguntar si permitís notificaciones: tocá <b>Permitir</b>.</p>`)}
EXTRA_ACTS.notificaciones=panelNotificaciones;
EXTRA_ACTS.pushOn=async()=>{const m=$('#not-msg');if(m)m.textContent='Activando…';try{await DC_PUSH.activar();toast('Notificaciones activadas');panelNotificaciones()}catch(e){if(e.message==='bloqueada')return panelNotificaciones();if(m)m.textContent='No se pudo activar: '+(e.message||e)+(navigator.onLine?'':' (necesitás señal)')}};
EXTRA_ACTS.pushOff=async()=>{try{await DC_PUSH.desactivar();toast('Notificaciones desactivadas en este aparato')}catch(e){toast('No se pudo desactivar')}panelNotificaciones()};
EXTRA_ACTS.pushProbar=async()=>{const m=$('#not-msg');if(m)m.textContent='Mandando…';try{const r=await DC_PUSH.probar();if(m)m.textContent=r.ok?'Enviada. Te tiene que llegar en unos segundos.':'No se pudo mandar a este aparato. Probá desactivar y volver a activar.'}catch(e){if(m)m.textContent=e.message||String(e)}};

/* ================= Ritmo de trabajo, días y precios del herrero ================= */
function bloqueRitmo(c){if(!['Hechura','Jugadores'].includes(c.categoria)||c.estado!=='Activo')return '';
  const actual=(c.ritmo==='fuerte'?'normal':c.ritmo)||(c.categoria==='Jugadores'?'normal':'');const dv=intervalo(c,'Desvasada'),hr=intervalo(c,'Herrada');
  return `<div class="ritmo"><div><b style="font-size:15px">Ritmo de trabajo</b><div class="small muted">Desvasar cada ${dv} días · ${+hr?'herrar cada '+hr+' días':'no se hierra'}</div></div>
   <div class="row">${c.categoria==='Hechura'?`<button class="chip ${!c.ritmo?'on':''}" data-act="ritmo" data-id="${c.id}" data-r="">Hechura</button>`:''}${RITMOS.map(([k,l])=>`<button class="chip ${actual===k?'on':''}" data-act="ritmo" data-id="${c.id}" data-r="${k}" ${canWrite?'':'disabled'}>${l}</button>`).join('')}</div></div>`}
EXTRA_ACTS.desherrar=async d=>{const c=byId(d.id);if(!confirm(`¿Le sacaron las herraduras a ${c.nombre}? La app deja de avisar el herraje hasta que se vuelva a herrar.`))return;
  await db.collection('eventos').doc(slugId('e')).set({fecha:hoy(),caballoId:c.id,caballo:c.nombre,tipo:'Desherrada',detalle:'Desherrado',obs:'',por:uid||''});toast(c.nombre+': desherrado');UI.ficha=c.id;renderFicha()};
EXTRA_ACTS.ritmo=async d=>{if(!canWrite)return;const c=byId(d.id);await db.collection('caballos').doc(c.id).update({ritmo:d.r});toast(c.nombre+': ritmo '+(RITMOS.find(r=>r[0]===d.r)?.[1]||'de hechura').toLowerCase());UI.ficha=c.id;renderFicha()};
function panelDias(){const t=tablaInt(),k=S.config,p=precios(),dis=canWrite?'':'disabled';
  const filas=[['Potrillos','Potrillos'],['Madres','Madres'],['Hechura','Hechura'],['descanso','Descanso'],['normal','Normal'],['apretar','Apretar']];
  return `<div class="tablewrap"><table class="dias"><thead><tr><th></th><th>Desvasar cada</th><th>Herrar cada</th></tr></thead><tbody>
   ${filas.map(([g,l])=>`<tr><td><b>${l}</b></td><td><input id="i-${g}-desv" type="number" min="1" value="${t[g].desv}" ${dis}> días</td><td>${g==='Potrillos'||g==='Madres'?'<span class="muted small">no se hierran</span>':`<input id="i-${g}-herr" type="number" min="0" value="${t[g].herr||''}" placeholder="no" ${dis}> días`}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="note">El ritmo (Descanso, Normal, Apretar) se elige en la ficha de cada caballo de hechura o jugador. Jugadores sin ritmo elegido = Normal. Vacío en "Herrar" = no se hierra. Solo se avisa el herraje de los caballos que ya se herraron alguna vez.</p>
  <div class="form" style="margin-top:10px"><label>Desparasitar madres (días)<input id="k-despMadres" type="number" min="1" value="${k.despMadres}" ${dis}></label>
   <label>Desparasitar resto (días)<input id="k-despResto" type="number" min="1" value="${k.despResto}" ${dis}></label>
   <label>Precio desvase ($)<input id="p-Desvasada" type="number" min="0" value="${p['Desvasada']}" ${dis}></label>
   <label>Precio herrada ($)<input id="p-Herrada" type="number" min="0" value="${p['Herrada']}" ${dis}></label></div>
  ${canWrite?'<div class="row" style="margin-top:10px"><button class="btn sm pri" data-act="savecfg">Guardar días y precios</button></div>':''}`}
/* En "Nuevo evento": completa el precio del herrero según el tipo (se puede cambiar) */
function conectarPrecio(){const t=document.getElementById('f-tipo'),p=document.getElementById('f-precio');if(!t||!p)return;
  const lab=p.closest('label');const poner=()=>{const v=precios()[t.value];if(p.dataset.tocado)return;p.value=v??'';lab.hidden=v===undefined&&!p.value};
  p.addEventListener('input',()=>{p.dataset.tocado=1});t.addEventListener('change',poner);poner()}
const $$=n=>'$'+Math.round(n||0).toLocaleString('es-AR');
function panelHerrero(){const lim=addDays(hoy(),30),p=precios();let nd=0,nh=0;
  for(const c of activos().filter(enCampo))for(const t of ['Desvasada','Herrada']){if(!ultimo(c.id,t))continue;const s=estadoSan(c,t);if(s.p&&s.p<=lim)t==='Desvasada'?nd++:nh++}
  const anio=hoy().slice(0,4),ev=S.eventos.filter(e=>e.fecha>=anio+'-01-01'&&['Desvasada','Herrada'].includes(e.tipo));
  const gast=ev.reduce((a,e)=>a+(+e.precio||0),0),sinP=ev.filter(e=>!(+e.precio)).length;
  const mes=ev.filter(e=>e.fecha.slice(0,7)===hoy().slice(0,7)).reduce((a,e)=>a+(+e.precio||0),0);
  return `<div class="panel" style="margin-bottom:18px"><h3>Herrero</h3><div class="list">
   <div class="li"><div><b>Próximos 30 días</b><div class="sub">${nd} desvase${nd===1?'':'s'} × ${$$(p['Desvasada'])} + ${nh} herraje${nh===1?'':'s'} × ${$$(p['Herrada'])} (incluye lo atrasado)</div></div><b style="font-size:17px">≈ ${$$(nd*p['Desvasada']+nh*p['Herrada'])}</b></div>
   <div class="li"><div><b>Gastado en ${anio}</b><div class="sub">${ev.length} trabajos cargados${sinP?` · ${sinP} sin precio`:''} · este mes ${$$(mes)}</div></div><b style="font-size:17px">${$$(gast)}</b></div>
  </div><p class="note" style="margin:6px 0 0">Precios actuales: desvase ${$$(p['Desvasada'])}, herrada ${$$(p['Herrada'])}. Se cambian en Sanidad → Cada cuántos días.</p></div>`}

/* ================= Panel de herramientas en Inicio ================= */
function panelHerramientas(){const sc=diasSinCopia();
  return `<div class="panel"><h3>Herramientas</h3><div class="list">
   <div class="li"><div>Descargar todo a Excel<div class="sub">Copia de seguridad con caballos, eventos, servicios, padrillos y notas.${sc!==null?' Última copia en este aparato: '+(sc===0?'hoy':'hace '+sc+' días')+'.':''}</div></div><button class="btn sm pri" data-act="excel">Excel</button></div>
   <div class="li"><div>Notificaciones en el celular<div class="sub">El día que vence, 7 días antes y resumen de los lunes.</div></div><button class="btn sm pri" data-act="notificaciones">Activar</button></div>
   <div class="li"><div>Recordatorios en el calendario<div class="sub">Sanidad y partos en tu Google Calendar o iPhone, con aviso.</div></div><button class="btn sm" data-act="recordatorios">Activar</button></div>
   <div class="li"><div>Nombres parecidos<div class="sub">Unificar padres y madres escritos de distinta forma.</div></div><button class="btn sm" data-act="nombres">Revisar</button></div>
  </div></div>`}
