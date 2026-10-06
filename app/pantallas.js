/* Doña Cecilia — pantallas al estilo Polo Breeders (con los colores de Doña Cecilia).
   - Cada cosa que se abre (ficha, formulario, panel) es una pantalla entera con "‹" para volver.
     El botón "atrás" del celular también vuelve, y la lista queda donde estaba.
   - Lista de caballos con chips CATEGORÍA / LUGAR, pestañas por camada y cantidad al final.
   - Ficha en el orden de Polo Breeders: en las madres, Servicios y Preñez arriba de todo. */

/* ================= Navegación entre pantallas ================= */
const NAV={pila:[],silencio:0};
const navTop=()=>NAV.pila[NAV.pila.length-1];
function navClave(){const ov=$('#modal .ov');if(!ov)return null;
  return ov.querySelector('[aria-label="Ficha"]')&&UI.ficha?'f:'+UI.ficha:'p:'+(ov.querySelector('h2')?.textContent||'')}
/* Se llama cada vez que cambia lo que se ve en #modal */
function navCambio(){const k=navClave();if(!k)return;const p=NAV.pila,top=navTop(),ov=$('#modal .ov');
  if(top&&top.k===k){if(ov)ov.scrollTop=top.scroll||0;return}               // misma pantalla redibujada: queda donde estaba
  const i=p.findIndex(e=>e.k===k);
  if(i>=0){const n=p.length-1-i;p.length=i+1;NAV.silencio++;history.go(-n);if(ov)ov.scrollTop=p[i].scroll||0;return} // volver a una pantalla anterior
  if(top&&top.k.startsWith('p:')&&k.startsWith('f:')){p[p.length-1]={k,scroll:0};history.replaceState({dc:p.length},'');return} // guardar un formulario y ver la ficha
  p.push({k,scroll:0});history.pushState({dc:p.length},'');if(ov)ov.scrollTop=0}
new MutationObserver(navCambio).observe($('#modal'),{childList:true});
$('#modal').addEventListener('scroll',e=>{const t=navTop();if(t&&e.target.classList&&e.target.classList.contains('ov'))t.scroll=e.target.scrollTop},true);
addEventListener('popstate',()=>{if(NAV.silencio){NAV.silencio--;return}
  const p=NAV.pila;p.pop();const top=navTop();
  if(top&&top.k.startsWith('f:')&&byId(top.k.slice(2))){UI.ficha=top.k.slice(2);renderFicha();return}
  p.length=0;UI.ficha=null;$('#modal').innerHTML=''});
/* "‹", Cancelar y Escape: una pantalla para atrás */
function navAtras(){if(NAV.pila.length)history.back();else{UI.ficha=null;$('#modal').innerHTML=''}}
/* Cerrar después de guardar: si abajo hay una ficha, se vuelve a ella; si no, se cierra todo */
const _cerrarTodo=closeModal;
closeModal=function(){const p=NAV.pila;let n=0;
  while(p.length&&p[p.length-1].k.startsWith('p:')){p.pop();n++}
  const top=navTop();
  if(n&&top&&byId(top.k.slice(2))){NAV.silencio++;history.go(-n);UI.ficha=top.k.slice(2);renderFicha();return}
  n+=p.length;p.length=0;_cerrarTodo();if(n){NAV.silencio++;history.go(-n)}};

/* ================= Lista de caballos ================= */
const CATS_LISTA=[['__venta','A la venta'],['','Todos'],['Jugadores','Jugadores'],['Hechura','Hechura'],['Doma','Doma'],['Potrillos','Potrillos'],['Madres','Madres'],['__bajas','Bajas']];
const ICO_LUPA='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const ICO_PIN='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const ICO_CAT='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>';
function preñadaAhora(c){return c.sexo==='Hembra'&&S.servicios.some(s=>norm(s.madre)===norm(c.nombre)&&s.estado==='Preñada')}
vCaballos=function(){
  const q=norm(UI.q),cat=UI.bajas?'__bajas':UI.cat;
  let l=S.caballos.filter(c=>(cat==='__bajas'?c.estado!=='Activo':c.estado==='Activo')&&(!cat||cat==='__bajas'||(cat==='__venta'?c.venta:c.categoria===cat))
    &&(!UI.lugar||(UI.lugar==='__sin'?!c.lugar:c.lugar===UI.lugar))
    &&(!q||norm(c.nombre+' '+(c.apodo||'')+' '+(c.obs||'')+' '+c.rp+' '+c.chip+' '+c.madre+' '+c.padre).includes(q)));
  const conCamadas=['Potrillos','Doma'].includes(cat);
  const camadas=conCamadas?[...new Set(l.map(c=>c.camada).filter(Boolean))].sort((a,b)=>b-a):[];
  if(conCamadas&&UI.subCam&&camadas.includes(UI.subCam))l=l.filter(c=>c.camada===UI.subCam);
  l.sort(sortCab);
  const sel=UI.sel,catTxt=(CATS_LISTA.find(x=>x[0]===cat)||['','Todos'])[1],lugTxt=UI.lugar==='__sin'?'Sin lugar':UI.lugar||'Todos';
  const buscando=UI.buscar||UI.q;
  return `<div class="lbar">${canWrite?`<button class="btn pri" data-act="alta">+ Alta</button><button class="btn" data-act="selmode">${sel?'Cancelar':'+ Sanidad'}</button>`:''}
     <span style="flex:1"></span><button class="btn icon" data-act="chip" aria-label="Leer chip" title="Leer chip">${ICO_CHIP}</button><button class="btn icon ${buscando?'on':''}" data-act="lupa" aria-label="Buscar" title="Buscar">${ICO_LUPA}</button></div>
   ${buscando?`<div class="row" style="margin-bottom:10px"><input id="q" class="search" type="search" placeholder="Nombre, RP, chip, madre o seña…" value="${esc(UI.q)}"></div>`:''}
   <div class="fchips"><button class="fchip ${UI.drop==='cat'?'on':''}" data-act="drop" data-d="cat">${ICO_CAT}<span>${esc(catTxt)}</span></button><button class="fchip ${UI.drop==='lug'?'on':''}" data-act="drop" data-d="lug">${ICO_PIN}<span>${esc(lugTxt)}</span></button></div>
   ${UI.drop==='cat'?`<div class="fdrop">${CATS_LISTA.map(([k,t])=>`<button class="${cat===k?'on':''}" data-act="fcat" data-v="${k}">${t}</button>`).join('')}</div>`:''}
   ${UI.drop==='lug'?`<div class="fdrop">${[['','Todos'],['__sin','Sin lugar definido'],...lugares().map(x=>[x,x])].map(([k,t])=>`<button class="${(UI.lugar||'')===k?'on':''}" data-act="flug" data-v="${esc(k)}">${esc(t)}</button>`).join('')}</div>`:''}
   ${conCamadas&&camadas.length>1?`<div class="tabs">${[['','Todas'],...camadas.map(y=>[y,'Camada '+y])].map(([k,t])=>`<button class="${(UI.subCam||'')==k?'on':''}" data-act="subcam" data-v="${k}">${t}</button>`).join('')}</div>`:''}
   ${sel?`<p class="note">Tocá los caballos a los que querés cargarles sanidad. Después elegí qué se les hizo.</p>`:''}
   <div class="hcards">${l.map(c=>{const e=edad(c.nac);const ds=['Desparasitación','Desvasada'].map(t=>estadoSan(c,t));
     const meta=[e!==null?e+(e===1?' año':' años'):'',cat===c.categoria?'':c.categoria,c.camada?'Camada '+c.camada:'',c.venta&&cat!=='__venta'?'A la venta':'',c.estado!=='Activo'?c.estado:''].filter(Boolean).join(' · ');
     return `<button class="hcard ${esc(c.sexo)} ${c.estado!=='Activo'?'baja':''}" data-${sel?'pick':'open'}="${c.id}">
      ${sel?`<input type="checkbox" tabindex="-1" ${sel.has(c.id)?'checked':''}>`:''}
      ${c.fotos?.length?`<img class="thumb" src="${fotoUrl(c.fotos[0])}" alt="" loading="lazy">`:''}
      <div class="grow"><div class="nm">${esc(c.nombre)} ${preñadaAhora(c)?'<span class="pill p-ok">Preñada</span>':''} ${c.ritmo&&['Hechura','Jugadores'].includes(c.categoria)&&!['normal','fuerte'].includes(c.ritmo)?`<span class="pill p-none">${esc(RITMOS.find(r=>r[0]===c.ritmo)?.[1]||'')}</span>`:''}</div>
      <div class="meta">${esc(meta)}</div>${c.obs&&c.categoria!=='Jugadores'?`<div class="obsl">${esc(c.obs)}</div>`:''}</div>
      ${c.estado==='Activo'&&enCampo(c)?`<div class="dots" title="Desparasitación · Desvasada">${ds.map(s=>`<span class="dot d-${s.st}"></span>`).join('')}</div>`:''}
      ${sel?'':'<span class="go">›</span>'}</button>`}).join('')||'<div class="empty">No hay caballos en esta categoría.</div>'}</div>
   ${l.length?`<p class="lcount">${l.length} caballo${l.length===1?'':'s'}</p>`:''}
   ${sel?`<div class="selbar"><b>${sel.size} elegidos</b><button class="btn sm" data-act="selall">Elegir todos los de la lista</button><button class="btn sm pri" data-act="bulk" ${sel.size?'':'disabled'}>Cargar sanidad</button></div>`:''}`};
EXTRA_ACTS.drop=d=>{UI.drop=UI.drop===d.d?null:d.d;render()};
EXTRA_ACTS.fcat=d=>{UI.drop=null;UI.subCam=null;if(d.v==='__bajas'){UI.bajas=true;UI.cat=''}else{UI.bajas=false;UI.cat=d.v}render()};
EXTRA_ACTS.flug=d=>{UI.drop=null;UI.lugar=d.v;render()};
EXTRA_ACTS.subcam=d=>{UI.subCam=d.v?+d.v:null;render()};
EXTRA_ACTS.lupa=()=>{if(UI.buscar&&!UI.q){UI.buscar=false;render();return}UI.buscar=true;render();const q=$('#q');q&&q.focus()};

/* ================= Ficha del caballo ================= */
const GRUPO_EV={'Parición':['Reproducción','#D9822B'],'Revisión':['Reproducción','#D9822B'],'Tacto / Eco':['Preñez','#C2307E'],'Aborto':['Preñez','#C2307E'],
  'Servicio':['Servicio','#7A4FB5'],'Inseminación':['Servicio','#7A4FB5'],'Desparasitación':['Sanidad','#9C88D6'],'Vacuna':['Sanidad','#9C88D6'],'Anemia':['Sanidad','#9C88D6'],'Veterinario':['Sanidad','#9C88D6'],
  'Desvasada':['Trabajos','#A88B2C'],'Herrada':['Trabajos','#A88B2C'],'Desherrada':['Trabajos','#A88B2C'],'Muelas':['Trabajos','#A88B2C'],'Castración':['Trabajos','#A88B2C'],
  'Movimiento':['Movimiento','#8A5A3C'],'Práctica':['Polo','#3B6FB6'],'Torneo':['Polo','#3B6FB6']};
const grupoEv=t=>GRUPO_EV[t]||['Otro','#8C8C86'];
function tituloEv(x){if(x.tipo==='Servicio'&&x.detalle&&x.detalle!=='Servicio')return 'SERVICIO → '+x.detalle.replace(/^Servicio\s*/i,'');return x.detalle&&x.detalle!==x.tipo?x.detalle:x.tipo}
function filaEv(x){const [g,col]=grupoEv(x.tipo);
  return `<div class="tl"><i style="--c:${col}"></i><div class="grow"><div class="sub">${fmt(x.fecha)}</div><b>${esc(tituloEv(x))}</b><div class="sub">${g}${x.obs?' · '+esc(x.obs):''}${x.precio?' · '+$$(x.precio):''}${x.por?' · cargó '+esc(names[x.por]||'…'):''}</div></div>
   ${canWrite?`<button class="btn sm" data-delev="${x.id}">Borrar</button>`:''}</div>`}
const sec=(titulo,der,cuerpo,cls='')=>`<section class="fsec ${cls}"><div class="fsec-h"><h3>${titulo}</h3>${der||''}</div>${cuerpo}</section>`;
function tabsSec(k,opts){const v=(UI.tabsFicha||(UI.tabsFicha={}))[k]||opts[0][0];return {v,html:`<div class="tabs sm">${opts.map(([o,t])=>`<button class="${v===o?'on':''}" data-act="ftab" data-k="${k}" data-v="${o}">${t}</button>`).join('')}</div>`}}
EXTRA_ACTS.ftab=d=>{(UI.tabsFicha||(UI.tabsFicha={}))[d.k]=d.v;renderFicha()};
function filasControl(c,tipos,evs){return tipos.map(t=>{const s=estadoSan(c,t);const h=evs.filter(x=>x.tipo===t||(t==='Desvasada'&&x.tipo==='Herrada')||(t==='Herrada'&&x.tipo==='Desherrada'));const k='san-'+c.id+'-'+t;
  return `<details class="desp" data-k="${k}" ${UI.abiertos?.has(k)?'open':''}><summary><div class="grow">${t}<div class="sub">Última ${fmt(s.u)}${s.p?' · próxima '+fmt(s.p):''}</div></div><span class="pill p-${s.st}">${s.txt}</span><span class="go">›</span></summary>
   <div class="hist">${h.map(x=>`<div class="li"><div>${fmt(x.fecha)}${x.tipo!==t?' · '+esc(x.tipo):''}${x.obs?`<div class="sub">${esc(x.obs)}</div>`:''}</div>${x.precio?`<span class="small muted">${$$(x.precio)}</span>`:''}</div>`).join('')||'<div class="muted small">Sin registros.</div>'}
   ${t==='Herrada'&&s.p&&canWrite?`<button class="btn sm" data-act="desherrar" data-id="${c.id}">Ya no está herrado</button>`:''}</div></details>`}).join('')}
function seccionControles(c,evs,k,titulo,tipos,tiposHist){const tb=tabsSec(k,[['act','Actual'],['hist','Historial']]);
  const hist=evs.filter(x=>tiposHist.includes(x.tipo));
  return sec(titulo,'',tb.html+(tb.v==='act'?`<div class="list">${filasControl(c,tipos,evs)}</div>`:hist.length?`<div class="tlw">${hist.map(filaEv).join('')}</div>`:'<div class="muted small">Sin registros.</div>'))}
function esMadre(c){return c.sexo==='Hembra'&&(c.categoria==='Madres'||S.servicios.some(s=>norm(s.madre)===norm(c.nombre)))}
function seccionServicios(c){const serv=S.servicios.filter(s=>norm(s.madre)===norm(c.nombre)).sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||'')||(+b.temporada-+a.temporada));
  const pre=serv.find(s=>s.estado==='Preñada');
  const der=canWrite&&c.estado==='Activo'?`<button class="btn sm pri" data-act="nacimiento" data-m="${esc(c.nombre)}" ${pre?`data-s="${pre.id}"`:''}>+ Nacimiento</button>`:'';
  const tarjetas=serv.map(s=>{const st=estadoRepro(s);const ab=s.estado==='Abortó';
    return `<div class="scard"><div class="mtop"><span class="sub" style="margin:0">${fmt(s.fecha)}</span><span class="pill ${ab?'p-bad':st.pill}">${ab?'Abortó':esc(s.estado||'—')}</span>
       ${canWrite?`<span style="margin-left:auto" class="row"><button class="btn sm" data-serv="${s.id}" aria-label="Editar servicio">Editar</button></span>`:''}</div>
      <div class="snom">${s.padrillo?`<span class="a" data-open-name="${esc(s.padrillo)}">${esc(s.padrillo)}</span>`:'Sin padrillo'}${s.tipo?` <span class="sub" style="display:inline">· ${esc(s.tipo)}</span>`:''}</div>
      <div class="sub">${s.fpp&&s.estado!=='Vacía'&&!ab?'Parto estimado: '+fmt(s.fpp)+' · ':''}Temporada ${esc(s.temporada||'—')}</div>
      ${canWrite&&['Preñada','Servida (sin tacto)'].includes(s.estado)?`<div class="row" style="margin-top:8px"><button class="btn sm danger-o" data-act="aborto" data-id="${s.id}">Registrar aborto</button></div>`:''}</div>`}).join('');
  return sec('Servicios',der,(tarjetas||'<div class="muted small">Todavía no tiene servicios cargados.</div>')+(canWrite&&c.estado==='Activo'?`<button class="btn ancho" data-act="servMadre" data-m="${esc(c.nombre)}">+ Servicio</button>`:''),'repro')}
function seccionPrenez(c){const s=servUltimo(c.nombre);const st=estadoRepro(s);const ec=ecosDe(s),ue=ec[ec.length-1];
  if(!s)return sec('Preñez','','<div class="muted small">Sin servicio cargado. Cargá el servicio y después la ecografía.</div>');
  const vacia=['Vacía','Abortó','Parida'].includes(s.estado),pre=s.estado==='Preñada';
  const btn=(r,txt,on)=>canWrite?`<button class="pbtn ${on?'on '+(r==='Preñada'?'ok':'bad'):''}" data-act="eco" data-id="${s.id}" data-r="${r}">${txt}</button>`:`<span class="pbtn ${on?'on '+(r==='Preñada'?'ok':'bad'):''}">${txt}</span>`;
  const filas=[['Fecha de tacto o eco',ue?fmt(ue.fecha):'—'],['Sexo',ue?.sexo||'Indefinido'],['Fecha probable de parto',pre&&s.fpp?fmt(s.fpp):'—'],['Observaciones',ue?.obs||'—']];
  return sec('Preñez'+(s.temporada?` <span class="muted small">· para ${esc(s.temporada)}</span>`:''),st.cuenta&&pre?`<span class="pill ${st.cpill}">${st.cuenta}</span>`:'',
    `<div class="pbtns">${btn('Vacía','Vacía',vacia)}${btn('Preñada','Preñada',pre)}</div>${s.estado==='Servida (sin tacto)'?'<p class="note" style="margin:0">Servida '+fmt(s.fecha)+': falta la ecografía. Tocá Preñada o Vacía para cargarla.</p>':''}
     <div class="kvl">${filas.map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>${barraGest(st)}`,'repro')}
renderFicha=function(){
  const c=byId(UI.ficha);if(!c){closeModal();return}
  const e=edad(c.nac),activo=c.estado==='Activo';
  const evs=S.eventos.filter(x=>x.caballoId===c.id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const padre=findByName(c.padre),madre=findByName(c.madre);
  const herm=S.caballos.filter(x=>x.id!==c.id&&c.madre&&norm(x.madre)===norm(c.madre));
  const hijos=S.caballos.filter(x=>norm(x.madre)===norm(c.nombre)||norm(x.padre)===norm(c.nombre));
  loadNames([...new Set(evs.map(x=>x.por).filter(Boolean))]);
  const datos=[...(c.apodo?[['Apodo',c.apodo]]:[]),['Sexo',c.sexo],['Nacimiento',fmt(c.nac)+(e!==null?` (${e} ${e===1?'año':'años'})`:'')],['Camada',c.camada],...(c.pelaje?[['Pelaje',c.pelaje]]:[]),['N° chip',c.chip],['RP',c.rp],
    ...(c.alzada?[['Alzada',c.alzada]]:[]),...(c.domador?[['Domador',c.domador]]:[]),...(c.ingresoDoma?[['Entró a doma',fmt(c.ingresoDoma)]]:[])];
  const polo=['Hechura','Jugadores'].includes(c.categoria)&&activo;
  const ultimoDe=t=>S.eventos.filter(x=>x.caballoId===c.id&&x.tipo===t).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];
  const tbE=tabsSec('ev',[['hist','Historial'],['mov','Movimientos'],['todos','Todos']]);
  const evsF=evs.filter(x=>tbE.v==='todos'?true:tbE.v==='mov'?x.tipo==='Movimiento':x.tipo!=='Movimiento');
  const kE='ev-'+c.id+'-'+tbE.v;
  $('#modal').innerHTML=`<div class="ov"><div class="sheet" role="dialog" aria-label="Ficha">
   <div class="sheet-h"><h2>${esc(c.nombre)}</h2><button class="x" data-act="close" aria-label="Volver">×</button></div>
   <div class="sheet-b">
    <div class="row fpills"><span class="pill p-none">${esc(c.categoria)}</span>${c.lugar?`<span class="pill p-none">${esc(c.lugar)}</span>`:''}${c.venta?'<span class="pill p-venta">A la venta</span>':''}${!activo?`<span class="pill p-bad">${esc(c.estado)}${c.bajaFecha?' '+fmt(c.bajaFecha):''}</span>`:''}</div>
    ${c.obs||c.embocadura?`<div class="senas">${c.obs?`<div><span>Observación</span>${esc(c.obs)}</div>`:''}${c.embocadura?`<div><span>Embocadura</span>${esc(c.embocadura)}</div>`:''}</div>`:''}
    ${c.fotos?.length?`<img class="cover" src="${fotoUrl(c.fotos[0])}" alt="${esc(c.nombre)}">`:''}
    ${sec('Datos','',`<div class="kvl">${datos.map(([k,v])=>`<div><span>${k}</span><b>${esc(v||'—')}</b></div>`).join('')}</div>`)}
    ${esMadre(c)?seccionServicios(c)+seccionPrenez(c):''}
    ${polo?sec('Polo','',`<div class="prac"><b>${practicas(c)}</b><div class="grow" style="flex:1">prácticas<div class="small muted">${(u=>u?'Última: '+fmt(u.fecha):'Sin prácticas cargadas')(ultimoDe('Práctica'))}</div></div>${canWrite?`<button class="btn pri" data-prac="${c.id}">+1 práctica</button>`:''}</div>
      <div class="prac"><b>${torneos(c)}</b><div class="grow" style="flex:1">torneos<div class="small muted">${(u=>u?'Último: '+fmt(u.fecha)+(u.obs?' · '+esc(u.obs):''):'Sin torneos cargados')(ultimoDe('Torneo'))}</div></div>${canWrite?`<button class="btn pri" data-torneo="${c.id}">+1 torneo</button>`:''}</div>${bloqueRitmo(c)}`):''}
    ${activo?seccionControles(c,evs,'san','Sanidad',['Desparasitación'],['Desparasitación','Vacuna','Anemia','Veterinario']):''}
    ${activo?seccionControles(c,evs,'trab','Trabajos',['Desvasada','Herrada','Muelas'],['Desvasada','Herrada','Desherrada','Muelas','Castración']):''}
    ${sec('Eventos',canWrite?`<button class="btn sm pri" data-evento="${c.id}">+ Evento</button>`:'',tbE.html+(evsF.length?`<div class="tlw">${filaEv(evsF[0])}</div>${evsF.length>1?`<details class="desp mas" data-k="${kE}" ${UI.abiertos?.has(kE)?'open':''}><summary><div class="grow">Ver todos (${evsF.length})</div><span class="go">›</span></summary><div class="tlw">${evsF.slice(1).map(filaEv).join('')}</div></details>`:''}`:`<div class="muted small">${tbE.v==='mov'?'Sin movimientos registrados.':'Sin eventos registrados.'}</div>`))}
    ${sec('Pedigree',canWrite?`<button class="btn sm" data-edit="${c.id}">Editar</button>`:'',`<div class="treewrap">${arbol4(c,padre,madre)}</div><p class="note" style="margin:6px 0 0">Deslizá para ver los bisabuelos. Tocá un caballo para abrir su ficha.</p>`)}
    ${hijos.length?sec(c.sexo==='Hembra'?'Progenie':'Crías','',`<div class="list">${hijos.sort((a,b)=>(b.camada||0)-(a.camada||0)).map(h=>`<button class="hcard ${esc(h.sexo)} chico" data-open="${h.id}"><div class="grow"><div class="nm">${esc(h.nombre)}</div><div class="meta">${[h.camada?'Camada '+h.camada:'',h.estado==='Activo'?h.categoria:h.estado].filter(Boolean).join(' · ')}</div></div><span class="go">›</span></button>`).join('')}</div>`):''}
    ${herm.length?sec('Hermanos (misma madre)','',`<div class="small">${herm.map(h=>`<span class="a" data-open="${h.id}">${esc(h.nombre)}</span>${h.estado!=='Activo'?' ('+esc(h.estado.toLowerCase())+')':''}`).join(' · ')}</div>`):''}
    ${sec('Fotos',assets?`<label class="btn sm pri upl">+ Agregar foto<input type="file" accept="image/*" multiple data-foto="${c.id}"></label>`:'',c.fotos?.length?`<div class="gal">${c.fotos.map((f,k)=>`<figure><a href="${fotoUrl(f)}" target="_blank" rel="noopener"><img src="${fotoUrl(f)}" alt="Foto ${k+1} de ${esc(c.nombre)}" loading="lazy"></a>${assets?`<div class="row">${k?`<button class="btn sm" data-portada="${c.id}|${f}">Portada</button>`:'<span class="small muted">Portada</span>'}<button class="btn sm" data-delfoto="${c.id}|${f}">Borrar</button></div>`:''}</figure>`).join('')}</div>`:`<div class="muted small">${assets?'Todavía no hay fotos. Tocá “+ Agregar foto”, podés sacarla con el celular.':'Sin fotos.'}</div>`)}
    ${canWrite?`<div class="fbtns"><button class="btn ancho" data-edit="${c.id}">Editar datos</button>
      ${c.venta&&activo?`<button class="btn ancho" data-venta="${c.id}">Ficha de venta</button>`:''}
      ${activo?`<button class="btn ancho danger" data-baja="${c.id}">Dar de baja</button>`:`<button class="btn ancho" data-alta-de-nuevo="${c.id}">Volver a activo</button>`}</div>`:''}
   </div></div></div>`};

/* ================= Reproducción: nacimiento y aborto ================= */
EXTRA_ACTS.nacimiento=d=>{const s=d.s&&S.servicios.find(x=>x.id===d.s);if(s){partoForm(s);return}
  const m=findByName(d.m);caballoForm(null,{nombre:'DC S/N '+norm(d.m),categoria:'Potrillos',nac:hoy(),camada:+hoy().slice(0,4),madre:norm(d.m),lugar:m?.lugar||'Doña Cecilia'})};
EXTRA_ACTS.aborto=d=>{const s=S.servicios.find(x=>x.id===d.id);if(!s)return;
  form('Registrar aborto · '+s.madre,[{k:'fecha',l:'Fecha',type:'date',v:hoy(),req:1},{k:'obs',l:'Observaciones (opcional)',type:'area'}],
   async v=>{await db.collection('servicios').doc(s.id).update({estado:'Abortó',fpp:'',obs:[s.obs,'Abortó '+fmt(v.fecha)+(v.obs?': '+v.obs:'')].filter(Boolean).join(' · ')});
     const m=findByName(s.madre);if(m)await db.collection('eventos').doc(slugId('e')).set({fecha:v.fecha,caballoId:m.id,caballo:m.nombre,tipo:'Aborto',detalle:'Aborto'+(s.padrillo?' · '+s.padrillo:''),obs:v.obs||'',por:uid||''});
     toast(s.madre+': aborto registrado');closeModal()},
   `<p class="note">${esc(s.padrillo||'Sin padrillo')} × ${esc(s.madre)} · servicio del ${fmt(s.fecha)}. La madre queda como vacía para volver a servirla.</p>`)};
