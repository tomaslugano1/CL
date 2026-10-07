/* Doña Cecilia — segunda parte del diseño Polo Breeders (con los colores de Doña Cecilia):
   controles de sanidad nuevos (por días y por mes de preñez), sanidad masiva, alta, baja, nuevo evento por categoría,
   seleccionar para mover de categoría o lugar, receptoras y la pantalla ⚙ Configuración. */

/* ================= Receptoras ================= */
if(!CATS.includes('Receptoras'))CATS.push('Receptoras');
const esCatMadre=c=>['Madres','Receptoras'].includes(c.categoria);
{const g=grupoInt;grupoInt=c=>c.categoria==='Receptoras'?'Madres':g(c)}

/* ================= Controles de sanidad ================= */
const TODAS='todas';
const CONTROLES_DEF=[
  {k:'Anemia',dias:60,cats:TODAS},{k:'Influenza',dias:90,cats:TODAS},{k:'Encéfalo',dias:365,cats:TODAS},
  {k:'Adenitis',dias:180,cats:['Potrillos']},{k:'Tétano',dias:365,cats:['Potrillos']},
  {k:'Rinoneumonitis',meses:[5,7,9],cats:['Madres','Receptoras']},{k:'Salmonela',meses:[4,6],cats:['Madres','Receptoras']},
  {k:'Encéfalo (preñez)',base:'Encéfalo',meses:[11],cats:['Madres','Receptoras']},{k:'Desparasitación (preñez)',base:'Desparasitación',meses:[11],cats:['Madres','Receptoras']},
  {k:'Adenitis (preñez)',base:'Adenitis',meses:[11],cats:['Madres','Receptoras']}];
/* Las dosis de preñez se avisan desde que se publica esta versión (para no llenar el aviso con dosis viejas) */
const PRENEZ_DESDE='2026-10-29';
for(const t of ['Influenza','Encéfalo','Adenitis','Tétano','Rinoneumonitis','Salmonela'])if(!TIPOS.includes(t))TIPOS.splice(TIPOS.indexOf('Veterinario'),0,t);
for(const t of ['Influenza','Encéfalo','Adenitis','Tétano','Rinoneumonitis','Salmonela'])GRUPO_EV[t]=['Sanidad','#9C88D6'];
Object.assign(GRUPO_EV,{'Análisis':['Análisis','#3B6FB6'],'Enfermedad':['Enfermedad','#B23A3A'],'Estudios':['Estudios','#7A4FB5'],'Lesión':['Lesión','#D9822B'],'Manejo':['Manejo','#2E8B7A'],'Trabajos':['Trabajos','#A88B2C'],'Reproducción':['Reproducción','#D9822B']});
function controles(){const g=S.config.controles||{};return CONTROLES_DEF.map(c=>({...c,...(g[c.k]||{}),activo:g[c.k]?.activo??true}))}
const ctrlPor=k=>controles().find(c=>c.k===k);
const aplica=(ct,c)=>ct.cats===TODAS||(ct.cats||[]).includes(c.categoria);
/* Días de los controles nuevos (Anemia, Influenza…). Los de siempre siguen igual. */
{const iv=intervalo;intervalo=(c,tipo)=>{const ct=ctrlPor(tipo);if(ct&&ct.dias)return ct.activo&&aplica(ct,c)?+ct.dias:0;
  if(tipo==='Desparasitación'&&c.categoria==='Receptoras')return S.config.despMadres;return iv(c,tipo)}}
/* Si al cargar se cambió el vencimiento (días), vale ese */
{const es=estadoSan;estadoSan=(c,tipo)=>{const s=es(c,tipo);if(!s.u||tipo==='Desvasada'||s.no)return s;
  const e=S.eventos.filter(x=>x.caballoId===c.id&&x.tipo===tipo&&x.fecha===s.u&&+x.dias>0)[0];if(!e)return s;
  const p=addDays(s.u,+e.dias),d=diff(p,hoy());return{...s,p,d,st:d<0?'bad':d<=15?'warn':'ok',txt:d<0?'Vencido':d<=15?'Próximo':'Al día'}}}
/* Dosis de preñez de una madre preñada: cuándo toca cada una y si ya se dio */
function dosisPrenez(c){const s=S.servicios.filter(x=>norm(x.madre)===norm(c.nombre)&&x.estado==='Preñada'&&x.fecha).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];if(!s)return[];const out=[];
  for(const ct of controles().filter(x=>x.meses&&x.activo&&aplica(x,c)))for(const m of ct.meses){const due=addDays(s.fecha,Math.round(m*30.4)),base=ct.base||ct.k;
    const hecha=S.eventos.find(e=>e.caballoId===c.id&&e.tipo===base&&e.fecha>=addDays(due,-20)&&e.fecha<=addDays(due,40));
    out.push({ct,m,due,hecha,d:diff(due,hoy()),k:ct.k+' (mes '+m+')'})}
  return out.sort((a,b)=>a.due.localeCompare(b.due))}
/* Controles por días con registro (para la ficha y el aviso) */
const ctrlDiasActivos=c=>controles().filter(ct=>ct.dias&&ct.activo&&aplica(ct,c));

/* "Para hacer esta semana": suma controles nuevos y dosis de preñez */
{const ts=tareasSemana;tareasSemana=(dias=7)=>{const r=ts(dias),lim=addDays(hoy(),dias),extra={};
  for(const c of activos().filter(enCampo)){
    for(const ct of ctrlDiasActivos(c)){if(!ultimo(c.id,ct.k))continue;const s=estadoSan(c,ct.k);if(!s.p||s.p>lim)continue;
      const lugar=c.lugar||'Sin lugar',k=lugar+'|'+ct.k;(extra[k]=extra[k]||{lugar,t:ct.k,items:[]}).items.push({c,s})}
    for(const x of dosisPrenez(c)){if(x.hecha||x.due<PRENEZ_DESDE||x.due>lim||x.d<-30)continue;
      const lugar=c.lugar||'Sin lugar',k=lugar+'|'+x.ct.k;(extra[k]=extra[k]||{lugar,t:x.ct.base||x.ct.k,etiqueta:x.ct.k,items:[]}).items.push({c,s:{p:x.due,d:x.d}})}}
  for(const g of Object.values(extra)){VERBO[g.etiqueta||g.t]=VERBO[g.etiqueta||g.t]||('Dar '+(g.etiqueta||g.t));g.items.sort((a,b)=>a.s.d-b.s.d);r.grupos.push(g.etiqueta?{...g,t:g.t}:g)}
  r.grupos.sort((a,b)=>a.lugar.localeCompare(b.lugar)||a.t.localeCompare(b.t));return r}}
for(const ct of CONTROLES_DEF)VERBO[ct.k]=VERBO[ct.k]||('Dar '+ct.k);

/* Ficha: la sección Sanidad muestra los controles que tienen registro y, en las madres preñadas, las dosis de preñez */
{const sc=seccionControles;seccionControles=(c,evs,k,titulo,tipos,tiposHist)=>{
  if(k!=='san')return sc(c,evs,k,titulo,tipos,tiposHist);
  const extra=ctrlDiasActivos(c).filter(ct=>ultimo(c.id,ct.k)).map(ct=>ct.k);
  let h=sc(c,evs,k,titulo,[...tipos,...extra],[...tiposHist,...CONTROLES_DEF.map(x=>x.base||x.k)]);
  const ds=esCatMadre(c)?dosisPrenez(c):[];
  if(ds.length&&(UI.tabsFicha?.san||'act')==='act'){const filas=ds.map(x=>`<div class="li"><div>${esc(x.k)}<div class="sub">Toca el ${fmt(x.due)}</div></div><span class="pill ${x.hecha?'p-ok':x.d<0?'p-bad':x.d<=15?'p-warn':'p-none'}">${x.hecha?'Hecha '+fmt(x.hecha.fecha):x.d<0?'Vencida':x.d<=15?'En '+x.d+' d':'Pendiente'}</span></div>`).join('');
    h=h.replace(/<\/section>$/,`<div class="sub" style="margin-top:6px;font-weight:700">Vacunas de preñez</div><div class="list">${filas}</div></section>`)}
  return h}}

/* ================= Sanidad masiva (como Polo Breeders) ================= */
const DROGAS=['Ivomec','Dectomax','Moxidectina','Febendazol','Ibomec + praz','Cydectin Alfa'];
function opcionesMasiva(){return [...['Desparasitación','Desvasada','Herrada','Muelas'].map(k=>({k,tipo:k,dias:true})),
  ...controles().filter(c=>c.activo&&c.dias).map(c=>({k:c.k,tipo:c.k,dias:true})),...controles().filter(c=>c.activo&&c.meses).map(c=>({k:c.k,tipo:c.base||c.k,prenez:c}))]}
function filasMasiva(op){const out=[];
  for(const c of activos().filter(enCampo)){
    if(op.prenez){if(!esCatMadre(c))continue;const x=dosisPrenez(c).filter(d=>d.ct.k===op.k&&!d.hecha)[0];if(!x)continue;
      out.push({c,txt:x.d<0?'Vencida':'En '+x.d+' días',st:x.d<0?'bad':x.d<=15?'warn':'ok',orden:x.d,sub:'Mes '+x.m+' · toca el '+fmt(x.due)});continue}
    if(!intervalo(c,op.tipo)&&op.tipo!=='Desvasada')continue;
    const s=estadoSan(c,op.tipo);if(s.no)continue;
    out.push({c,txt:!s.u?'Sin registro':s.d<0?'Vencido':'en '+s.d+' días',st:!s.u?'bad':s.st,orden:!s.u?-99999:s.d,sub:s.u?'Última '+fmt(s.u):'Nunca cargado'})}
  return out.sort((a,b)=>a.orden-b.orden||a.c.nombre.localeCompare(b.c.nombre,'es'))}
function renderMasiva(){const M=UI.mas||(UI.mas={k:'Desparasitación',sel:new Set(),venc:false});const ops=opcionesMasiva(),op=ops.find(o=>o.k===M.k)||ops[0];
  let l=filasMasiva(op);if(M.venc)l=l.filter(x=>x.st==='bad');
  $('#modal').innerHTML=`<div class="ov"><div class="sheet"><div class="sheet-h"><h2>Sanidad</h2><button class="x" data-act="close" aria-label="Volver">×</button></div>
   <div class="sheet-b"><div class="hscroll">${ops.map(o=>`<button class="chip ${o.k===op.k?'on':''}" data-act="mctrl" data-v="${esc(o.k)}">${esc(o.k)}</button>`).join('')}</div>
    <div class="row" style="justify-content:space-between"><button class="a" style="background:none;border:0;color:var(--bad);font:inherit;font-weight:700;padding:8px 0;cursor:pointer" data-act="mvenc">Elegir todos los vencidos</button>
     <button class="chip ${M.venc?'on':''}" data-act="mfiltro">${M.venc?'Ver todos':'Solo vencidos'}</button></div>
    <div class="hcards">${l.map(x=>`<button class="hcard ${esc(x.c.sexo)} mrow ${x.st}" data-act="mpick" data-id="${x.c.id}"><input type="checkbox" tabindex="-1" ${M.sel.has(x.c.id)?'checked':''}>
      <div class="grow"><div class="nm">${esc(x.c.nombre)}</div><div class="meta">${esc([x.c.sexo,edad(x.c.nac)!==null?edad(x.c.nac)+' años':'',x.c.categoria,x.sub].filter(Boolean).join(' · '))}</div></div><span class="mest ${x.st}">${esc(x.txt)}</span></button>`).join('')||'<div class="empty">Ningún caballo para este control.</div>'}</div>
    <div style="height:70px"></div></div>
   <div class="selbar"><button class="btn pri ancho" data-act="mseguir" ${M.sel.size?'':'disabled'}>${M.sel.size?`Continuar con ${M.sel.size} caballo${M.sel.size>1?'s':''}`:'Elegí al menos un caballo'}</button></div></div></div>`}
EXTRA_ACTS.selmode=()=>{UI.mas={k:(UI.mas?.k)||'Desparasitación',sel:new Set(),venc:false};renderMasiva()};
EXTRA_ACTS.gosel=EXTRA_ACTS.selmode;
EXTRA_ACTS.mctrl=d=>{UI.mas.k=d.v;UI.mas.sel=new Set();renderMasiva()};
EXTRA_ACTS.mfiltro=()=>{UI.mas.venc=!UI.mas.venc;renderMasiva()};
EXTRA_ACTS.mpick=d=>{const s=UI.mas.sel;s.has(d.id)?s.delete(d.id):s.add(d.id);renderMasiva()};
EXTRA_ACTS.mvenc=()=>{const op=opcionesMasiva().find(o=>o.k===UI.mas.k);for(const x of filasMasiva(op))if(x.st==='bad')UI.mas.sel.add(x.c.id);renderMasiva()};
EXTRA_ACTS.mseguir=()=>{const M=UI.mas,op=opcionesMasiva().find(o=>o.k===M.k),ids=[...M.sel];if(!ids.length)return;
  const dias=op.prenez?null:(ctrlPor(op.k)?.dias||(op.tipo==='Desparasitación'?S.config.despResto:op.tipo==='Muelas'?(+S.config.muelas||365):''));
  const herrero=['Desvasada','Herrada'].includes(op.tipo);
  form('Sanidad · '+op.k,[{k:'fecha',l:'Fecha de aplicación',type:'date',v:hoy(),req:1},
    ...(op.prenez||herrero?[]:[{k:'dias',l:'Vencimiento (días)',type:'number',v:dias}]),
    ...(op.tipo==='Desparasitación'?[{k:'droga',l:'Droga',list:'dl-drogas'}]:[]),
    ...(herrero?[{k:'precio',l:'Precio por caballo',type:'number',v:precios()[op.tipo]}]:[]),
    {k:'obs',l:'Anotaciones',type:'area'}],
   async v=>{for(const id of ids){const c=byId(id);const e={fecha:v.fecha,caballoId:id,caballo:c?.nombre||'',tipo:op.tipo,detalle:op.prenez?op.k:(v.droga||op.tipo),obs:v.obs||'',por:uid||''};
       if(v.precio)e.precio=+v.precio;if(v.dias&&dias&&+v.dias!==+dias)e.dias=+v.dias;await db.collection('eventos').doc(slugId('e')).set(e)}
     toast(`${op.k}: cargado a ${ids.length} caballo${ids.length>1?'s':''}`);UI.mas.sel=new Set();closeModal();render()},
   `<p class="note">Se va a registrar <b>${esc(op.k)}</b> para <b>${ids.length} caballo${ids.length>1?'s':''}</b>: ${ids.map(i=>esc(byId(i)?.nombre||'')).join(', ')}.</p><datalist id="dl-drogas">${DROGAS.map(x=>`<option value="${x}">`).join('')}</datalist>`)};

/* ================= Alta (4 opciones) ================= */
function pantalla(titulo,cuerpo){$('#modal').innerHTML=`<div class="ov"><div class="sheet"><div class="sheet-h"><h2>${esc(titulo)}</h2><button class="x" data-act="close" aria-label="Volver">×</button></div><div class="sheet-b">${cuerpo}</div></div></div>`}
const grande=(act,titulo,sub,extra='')=>`<button class="bigbtn" data-act="${act}" ${extra}><b>${titulo}</b><span>${sub}</span></button>`;
EXTRA_ACTS.alta=()=>pantalla('Alta',grande('altaNac','Nacimiento','Una cría de tus madres: madre y padre se completan solos')+grande('altaCompra','Compra','Un caballo que entra a la manada')+grande('altaRecep','Receptora','Yegua que recibe embriones')+grande('altaPad','Padrillo','Padrillo de servicio, con su genealogía'));
EXTRA_ACTS.altaCompra=()=>caballoForm(null);
EXTRA_ACTS.altaPad=()=>padForm(null);
EXTRA_ACTS.altaRecep=()=>form('Alta de receptora',[{k:'nombre',l:'Número o nombre de la receptora',req:1,full:1},{k:'chip',l:'N° chip'},{k:'rp',l:'RP'},{k:'lugar',l:'Lugar',v:'Doña Cecilia',list:'dl-lug'},{k:'obs',l:'Observaciones / señas',type:'area'}],
  async v=>{const id=slugId('c');await db.collection('caballos').doc(id).set({...v,nombre:v.nombre.toUpperCase(),categoria:'Receptoras',sexo:'Hembra',estado:'Activo'});toast('Receptora dada de alta');UI.ficha=id;renderFicha()},datalists());
EXTRA_ACTS.altaNac=()=>{const ms=activos().filter(c=>c.sexo==='Hembra'&&(esCatMadre(c)||S.servicios.some(s=>norm(s.madre)===norm(c.nombre))))
    .map(c=>({c,s:S.servicios.filter(s=>norm(s.madre)===norm(c.nombre)&&s.estado!=='Parida').sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''))[0]}))
    .sort((a,b)=>(a.s?.estado==='Preñada'?0:1)-(b.s?.estado==='Preñada'?0:1)||(a.s?.fpp||'9').localeCompare(b.s?.fpp||'9'));
  pantalla('Nacimiento · ¿de qué madre?',`<p class="note" style="margin:0">Tocá la madre. Si tiene un servicio cargado, el padre se completa solo.</p><div class="hcards">${ms.map(({c,s})=>`<button class="hcard Hembra" data-act="nacDe" data-m="${esc(c.nombre)}" ${s?`data-s="${s.id}"`:''}><div class="grow"><div class="nm">${esc(c.nombre)} ${s?.estado==='Preñada'?ICO_PRENADA:''}</div><div class="meta">${s?esc((s.padrillo||'Sin padrillo')+' · servida '+fmt(s.fecha)+(s.fpp?' · FPP '+fmt(s.fpp):'')):'Sin servicio cargado'}</div></div><span class="go">›</span></button>`).join('')}</div>`)};
EXTRA_ACTS.nacDe=d=>EXTRA_ACTS.nacimiento({m:d.m,s:d.s});

/* ================= Baja (Venta · Muerte · Jubilado · Otro · Eliminar) ================= */
bajaForm=c=>pantalla('Baja · '+c.nombre,grande('bajaTipo','Venta','Precio, comprador y fecha',`data-id="${c.id}" data-v="Vendido"`)+grande('bajaTipo','Muerte','Fecha y causa',`data-id="${c.id}" data-v="Muerto"`)
  +grande('bajaTipo','Jubilado','Deja de trabajar pero sigue siendo de Doña Cecilia',`data-id="${c.id}" data-v="Jubilado"`)+grande('bajaTipo','Otro motivo','',`data-id="${c.id}" data-v="Otro"`)
  +`<p class="note">La baja no borra nada: queda en Bajas y en su camada, pero deja de contarse.</p>`+`<button class="bigbtn peligro" data-act="eliminarCab" data-id="${c.id}"><b>Eliminar</b><span>Solo si se cargó por error. Se borra la ficha.</span></button>`);
EXTRA_ACTS.bajaTipo=d=>{const c=byId(d.id),est=d.v,venta=est==='Vendido';
  form({Vendido:'Venta',Muerto:'Muerte',Jubilado:'Jubilado',Otro:'Baja'}[est]+' · '+c.nombre,[{k:'bajaFecha',l:'Fecha',type:'date',v:hoy(),req:1},
    ...(venta?[{k:'bajaPrecio',l:'Precio de venta',v:c.precio||''},{k:'bajaComprador',l:'Comprador'}]:[]),{k:'bajaObs',l:est==='Muerto'?'Causa':'Detalle',type:'area'}],
   async v=>{if(!confirm(`¿Confirmás la baja de ${c.nombre} (${est.toLowerCase()})?`))return;
     await db.collection('caballos').doc(c.id).update({estado:est==='Otro'?'Baja':est,bajaFecha:v.bajaFecha,bajaObs:v.bajaObs||'',bajaPrecio:v.bajaPrecio||'',bajaComprador:v.bajaComprador||'',catPrevia:c.categoria});
     await db.collection('eventos').doc(slugId('e')).set({fecha:v.bajaFecha||hoy(),caballoId:c.id,caballo:c.nombre,tipo:'Movimiento',detalle:c.categoria+' → '+(est==='Otro'?'Baja':est)+(venta&&v.bajaComprador?' a '+v.bajaComprador:''),obs:[venta&&v.bajaPrecio?'Precio: '+v.bajaPrecio:'',v.bajaObs].filter(Boolean).join(' · '),por:uid||''});
     toast(c.nombre+' dado de baja');UI.ficha=c.id;renderFicha()})};
EXTRA_ACTS.eliminarCab=async d=>{const c=byId(d.id);if(!c)return;
  if(!confirm(`¿Eliminar a ${c.nombre}? Esta acción es permanente y no se puede deshacer.`))return;if(!confirm(`Última confirmación: se borra la ficha de ${c.nombre}.`))return;
  await db.collection('caballos').doc(c.id).delete();toast(c.nombre+' eliminado');UI.ficha=null;closeModal();render()};

/* ================= Nuevo evento: primero la categoría, después el evento ================= */
const EV_CATS={
  'Sanidad':['Desparasitación','Vacuna','Anemia','Influenza','Encéfalo','Adenitis','Tétano','Rinoneumonitis','Salmonela','Veterinario'],
  'Herrero':['Desvasada','Herrada','Desherrada','Muelas'],
  'Reproducción':['Servicio','Tacto / Eco','Parición','Aborto','Revisión','Vacunación preñadas'],
  'Polo':['Práctica','Torneo'],
  'Lesión':['Aplastamiento de cruz','Barro','Cólico','Contractura muscular','Corte de lengua','Cortes','Cuerda','Desgarro de vulva','Desgarro muscular','Desplazamiento de cadera','Dolor','Dolor en sobrecañas','Entrecuerda','Epifisitis','Estiramiento de cuello','Fístula','Fisura','Fractura','Garrones','Golpe','Hernia','Infección','Inflamación','Infosura','Intoxicación','Laminitis','Lesión de encuentro','Manca','Ojo nube','Prolapso - parto','Queloide','Rengo','Rodillas','Rotura de cadera','Rotura de ligamento','Rotura de tendón','Rotura de vaso','Sesamoide','Sobrehueso','Ojo tuerto','Ojo úlcera','Vaina'],
  'Enfermedad':['Cataratas - ojos','Ciego','Desprendimiento de moco','Encefalomielitis','Influenza','Moquillo - adenitis','Pulmonía','Tétano','Úlcera estomacal','Verrugas','Sarcoma'],
  'Estudios':['Eco-tendones','Endoscopia','Radiografía'],
  'Análisis':['Análisis de ADN SRA','Libreta sanitaria','Necropsia'],
  'Trabajos':['Destete','Castración','Cáustico','Chip de identificación','Marca con nitrógeno','Sutura de vulva'],
  'Manejo':['Agarrada del lote','Suelta','Movimiento'],
  'Otro':['Otro']};
const catDeEvento=t=>Object.keys(EV_CATS).find(k=>EV_CATS[k].includes(t))||'Sanidad';
eventoForm=function(ids,tipo){const one=ids.length===1?byId(ids[0]):null;const cat0=catDeEvento(tipo||'Desparasitación');
  form(one?'Nuevo evento · '+one.nombre:`Cargar a ${ids.length} caballos`,[{k:'fecha',l:'Fecha del evento',type:'date',v:hoy(),req:1},
    {k:'cat',l:'Categoría',type:'select',opts:Object.keys(EV_CATS),v:cat0},{k:'tipo',l:'Evento',type:'select',opts:EV_CATS[cat0],v:tipo||EV_CATS[cat0][0]},
    {k:'detalle',l:'Detalle (producto, resultado, a dónde…)',full:1},{k:'precio',l:'Precio por caballo (herrero)',type:'number'},{k:'obs',l:'Anotaciones',type:'area'}],
   async d=>{const ev=d.tipo,cat=d.cat;delete d.cat;
     let tipoG=ev,det=d.detalle||ev;
     if(ev==='Vacunación preñadas'){tipoG='Vacuna';det='Vacunación preñadas'+(d.detalle?': '+d.detalle:'')}
     else if(!TIPOS.includes(ev)){tipoG=cat==='Otro'?'Otro':cat;det=ev+(d.detalle?': '+d.detalle:'')}
     for(const id of ids){const c=byId(id);const e={...d,tipo:tipoG,detalle:det,caballoId:id,caballo:c?.nombre||'',por:uid||''};if(!e.precio)delete e.precio;await db.collection('eventos').doc(slugId('e')).set(e)}
     toast(ids.length>1?`Cargado a ${ids.length} caballos`:'Evento cargado');if(ids.length>1){UI.sel=null;closeModal();render()}else{UI.ficha=ids[0];renderFicha()}});
  const cs=$('#f-cat'),ts=$('#f-tipo');cs.addEventListener('change',()=>{ts.innerHTML=EV_CATS[cs.value].map(o=>`<option>${esc(o)}</option>`).join('');ts.dispatchEvent(new Event('change'))});
  conectarPrecio()};

/* ================= Seleccionar: cambiar categoría o lugar a muchos juntos ================= */
EXTRA_ACTS.selmover=()=>{UI.sel=UI.sel?null:new Set();render()};
EXTRA_ACTS.moverCat=()=>{const ids=[...UI.sel];if(!ids.length)return;
  form(`Cambiar categoría · ${ids.length} caballo${ids.length>1?'s':''}`,[{k:'cat',l:'Nueva categoría',type:'select',opts:CATS},{k:'fecha',l:'Fecha',type:'date',v:hoy(),req:1}],
   async v=>{if(!confirm(`¿Pasar ${ids.length} caballo${ids.length>1?'s':''} a ${v.cat}?`))return;
     for(const id of ids){const c=byId(id);if(!c||c.categoria===v.cat)continue;const up={categoria:v.cat};
       if(v.cat==='Descanso'){up.catPrevia=c.categoria;up.descansoDesde=v.fecha}
       await db.collection('caballos').doc(id).update(up);
       await db.collection('eventos').doc(slugId('e')).set({fecha:v.fecha,caballoId:id,caballo:c.nombre,tipo:'Movimiento',detalle:c.categoria+' → '+v.cat,obs:'',por:uid||''})}
     toast('Categoría cambiada');UI.sel=null;closeModal();render()},`<p class="note">${ids.map(i=>esc(byId(i)?.nombre||'')).join(', ')}</p>`)};
EXTRA_ACTS.moverLug=()=>{const ids=[...UI.sel];if(!ids.length)return;
  form(`Cambiar lugar · ${ids.length} caballo${ids.length>1?'s':''}`,[{k:'lugar',l:'Nuevo lugar',list:'dl-lug',req:1},{k:'fecha',l:'Fecha',type:'date',v:hoy(),req:1}],
   async v=>{for(const id of ids){const c=byId(id);if(!c||(c.lugar||'')===v.lugar)continue;await db.collection('caballos').doc(id).update({lugar:v.lugar});
       await db.collection('eventos').doc(slugId('e')).set({fecha:v.fecha,caballoId:id,caballo:c.nombre,tipo:'Movimiento',detalle:'Lugar: '+(c.lugar||'sin lugar')+' → '+v.lugar,obs:'',por:uid||''})}
     toast('Lugar cambiado');UI.sel=null;closeModal();render()},datalists()+`<p class="note">${ids.map(i=>esc(byId(i)?.nombre||'')).join(', ')}</p>`)};

/* ================= ⚙ Configuración ================= */
EXTRA_ACTS.config=()=>{const cs=controles(),catsAll=CATS.filter(x=>x!=='Doma');
  pantalla('Configuración',`<section class="fsec"><div class="fsec-h"><h3>Controles de sanidad</h3></div>
    <p class="note" style="margin:0">Prendé o apagá los que usás y cambiales los días. Los de preñez se avisan en los meses de gestación que dice cada uno, contados desde el servicio.</p>
    ${cs.map((c,i)=>`<div class="ctrl"><label class="chk"><input type="checkbox" id="cc-a-${i}" ${c.activo?'checked':''}><b>${esc(c.k)}</b></label>
      <div class="row">${c.dias?`<label class="small">Cada <input id="cc-d-${i}" type="number" min="1" value="${c.dias}" style="width:80px"> días</label>`:`<label class="small">Meses de preñez <input id="cc-m-${i}" value="${c.meses.join(', ')}" style="width:110px"></label>`}</div>
      <div class="row">${['todas',...catsAll].map(k=>`<label class="chk small"><input type="checkbox" id="cc-c-${i}-${k}" ${(c.cats===TODAS?k==='todas':(c.cats||[]).includes(k))?'checked':''}>${k==='todas'?'Todas':k}</label>`).join('')}</div></div>`).join('')}
    ${canWrite?'<button class="btn pri ancho" data-act="guardarCtrl">Guardar controles</button>':''}</section>
   <section class="fsec"><div class="fsec-h"><h3>Desvase, herrado, desparasitación y precios</h3></div>${panelDias()}</section>
   <section class="fsec"><div class="fsec-h"><h3>Avisos</h3></div><div class="list"><div class="li"><span>Notificaciones en el celular</span><button class="btn sm" data-act="notificaciones">Abrir</button></div><div class="li"><span>Calendario</span><button class="btn sm" data-act="recordatorios">Abrir</button></div></div></section>`)};
EXTRA_ACTS.guardarCtrl=async()=>{const catsAll=CATS.filter(x=>x!=='Doma'),g={};
  CONTROLES_DEF.forEach((c,i)=>{const o={activo:$('#cc-a-'+i).checked};
    if(c.dias)o.dias=+$('#cc-d-'+i).value||c.dias;else o.meses=($('#cc-m-'+i).value.match(/\d+/g)||[]).map(Number).filter(n=>n>0&&n<12);
    o.cats=$(`#cc-c-${i}-todas`).checked?TODAS:catsAll.filter(k=>$(`#cc-c-${i}-${k}`).checked);g[c.k]=o});
  await db.doc('config/app').set({...S.config,controles:g});S.config.controles=g;toast('Controles guardados')};
