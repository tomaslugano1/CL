/* Doña Cecilia — segunda parte del diseño Polo Breeders (con los colores de Doña Cecilia):
   controles de sanidad nuevos (por días y por mes de preñez), sanidad masiva, alta, baja, nuevo evento por categoría,
   seleccionar para mover de categoría o lugar, receptoras y la pantalla ⚙ Configuración. */

/* ================= Receptoras ================= */
if(!CATS.includes('Receptoras'))CATS.push('Receptoras');
const esCatMadre=c=>['Madres','Receptoras'].includes(c.categoria);

/* ================= Controles de sanidad ================= */
const TODAS='todas';
const CONTROLES_DEF=[
  {k:'Anemia',dias:60,cats:TODAS,activo:false},{k:'Influenza',dias:90,cats:TODAS},{k:'Encéfalo',dias:365,cats:TODAS},
  {k:'Adenitis',dias:180,cats:['Potrillos']},{k:'Tétano',dias:365,cats:['Potrillos']},
  {k:'Rinoneumonitis',meses:[5,7,9],cats:['Madres','Receptoras']},{k:'Salmonela',meses:[4,6],cats:['Madres','Receptoras']},
  {k:'Encéfalo (preñez)',base:'Encéfalo',meses:[11],cats:['Madres','Receptoras']},{k:'Desparasitación (preñez)',base:'Desparasitación',meses:[11],cats:['Madres','Receptoras']},
  {k:'Adenitis (preñez)',base:'Adenitis',meses:[11],cats:['Madres','Receptoras']}];
/* Las dosis de preñez se avisan desde que se publica esta versión (para no llenar el aviso con dosis viejas) */
const PRENEZ_DESDE='2026-10-29';
for(const t of ['Influenza','Encéfalo','Adenitis','Tétano','Rinoneumonitis','Salmonela'])if(!TIPOS.includes(t))TIPOS.splice(TIPOS.indexOf('Veterinario'),0,t);
for(const t of ['Influenza','Encéfalo','Adenitis','Tétano','Rinoneumonitis','Salmonela'])GRUPO_EV[t]=['Sanidad','#9C88D6'];
Object.assign(GRUPO_EV,{'Análisis':['Análisis','#3B6FB6'],'Enfermedad':['Enfermedad','#B23A3A'],'Estudios':['Estudios','#7A4FB5'],'Lesión':['Lesión','#D9822B'],'Manejo':['Manejo','#2E8B7A'],'Trabajos':['Trabajos','#A88B2C'],'Reproducción':['Reproducción','#D9822B']});
function controles(){const g=S.config.controles||{};return CONTROLES_DEF.map(c=>({...c,...(g[c.k]||{}),activo:g[c.k]?.activo??c.activo??true}))}
const ctrlPor=k=>controles().find(c=>c.k===k);
const aplica=(ct,c)=>ct.cats===TODAS||(ct.cats||[]).includes(c.categoria);
/* Dosis de preñez de una madre preñada: cuándo toca cada una y si ya se dio */
function dosisPrenez(c){const s=S.servicios.filter(x=>norm(x.madre)===norm(c.nombre)&&x.estado==='Preñada'&&x.fecha).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];if(!s)return[];const out=[];
  for(const ct of controles().filter(x=>x.meses&&x.activo&&aplica(x,c)))for(const m of ct.meses){const due=addDays(s.fecha,Math.round(m*30.4)),base=ct.base||ct.k;
    const hecha=S.eventos.find(e=>e.caballoId===c.id&&e.tipo===base&&e.fecha>=addDays(due,-20)&&e.fecha<=addDays(due,40));
    out.push({ct,m,due,hecha,d:diff(due,hoy()),k:ct.k+' (mes '+m+')'})}
  return out.sort((a,b)=>a.due.localeCompare(b.due))}
/* Controles por días con registro (para la ficha y el aviso) */
const ctrlDiasActivos=c=>controles().filter(ct=>ct.dias&&ct.activo&&aplica(ct,c));

for(const ct of CONTROLES_DEF)VERBO[ct.k]=VERBO[ct.k]||('Dar '+ct.k);

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
function bajaForm(c){return pantalla('Baja · '+c.nombre,grande('bajaTipo','Venta','Precio, comprador y fecha',`data-id="${c.id}" data-v="Vendido"`)+grande('bajaTipo','Muerte','Fecha y causa',`data-id="${c.id}" data-v="Muerto"`)
  +grande('bajaTipo','Jubilado','Deja de trabajar pero sigue siendo de Doña Cecilia',`data-id="${c.id}" data-v="Jubilado"`)+grande('bajaTipo','Otro motivo','',`data-id="${c.id}" data-v="Otro"`)
  +`<p class="note">La baja no borra nada: queda en Bajas y en su camada, pero deja de contarse.</p>`+`<button class="bigbtn peligro" data-act="eliminarCab" data-id="${c.id}"><b>Eliminar</b><span>Solo si se cargó por error. Se borra la ficha.</span></button>`)}
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
function eventoForm(ids,tipo){const one=ids.length===1?byId(ids[0]):null;const cat0=catDeEvento(tipo||'Desparasitación');
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
  conectarPrecio()}

/* ================= Seleccionar: cambiar categoría o lugar a muchos juntos ================= */
EXTRA_ACTS.selmover=()=>{UI.sel=UI.sel?null:new Set();render()};
EXTRA_ACTS.moverCat=()=>{const ids=[...UI.sel];if(ids.length)formPaso(ids,null)};

/* ================= Cambio de etapa: Potrillo → Doma → Hechura → Jugadores ================= */
const ETAPA_SIG={Potrillos:'Doma',Doma:'Hechura',Hechura:'Jugadores'};
const masComunDoma=k=>{const n={};S.caballos.filter(x=>x.categoria==='Doma'&&x.estado==='Activo').forEach(x=>{if(x[k])n[x[k]]=(n[x[k]]||0)+1});return Object.keys(n).sort((a,b)=>n[b]-n[a])[0]||''};
/* En la ficha: el paso que sigue, a un toque */
function botonesEtapa(c){if(!canWrite||c.estado!=='Activo')return '';const sig=ETAPA_SIG[c.categoria],b=[];
  if(sig)b.push(`<button class="btn pri" data-act="pasarA" data-id="${c.id}" data-v="${sig}">${c.categoria==='Doma'?'Entregado de doma → Hechura':'Pasar a '+sig}</button>`);
  if(['Hechura','Jugadores'].includes(c.categoria))b.push(`<button class="btn" data-act="aDescanso" data-id="${c.id}">Mandar a descanso</button>`);
  b.push(`<button class="btn" data-act="pasarA" data-id="${c.id}">Otra categoría</button>`);
  const desde=c.categoria==='Doma'&&c.ingresoDoma?` · en doma desde ${fmt(c.ingresoDoma)} (${diff(hoy(),c.ingresoDoma)} días)`:'',l=trabajoLinea(c);
  return sec('Categoría','',`<div class="sub" style="margin:0">Hoy: <b>${esc(c.categoria)}</b>${l?' · '+l.charAt(0).toLowerCase()+l.slice(1):''}${desde}</div><div class="row">${b.join('')}</div>`)}
EXTRA_ACTS.pasarA=d=>{if(d.v==='Descanso')return EXTRA_ACTS.aDescanso({id:d.id});formPaso([d.id],d.v||null)};
/* Formulario del cambio (uno o varios caballos). dest = null: se elige la categoría en el formulario. */
function formPaso(ids,dest){const one=ids.length===1?byId(ids[0]):null,desdeDoma=one?.categoria==='Doma';
  const pideDoma=!dest||dest==='Doma';
  const lugar0=dest==='Doma'?(masComunDoma('lugar')||'9 de Julio'):desdeDoma?'Doña Cecilia':'';
  const titulo=dest?(desdeDoma&&dest==='Hechura'?'Entregado de doma':'Pasar a '+dest):'Cambiar categoría';
  form(titulo+' · '+(one?one.nombre:ids.length+' caballos'),[...(dest?[]:[{k:'cat',l:'Nueva categoría',type:'select',opts:CATS.filter(x=>!one||x!==one.categoria)}]),
    {k:'fecha',l:dest==='Doma'?'Entró a doma el':desdeDoma?'Se entregó el':'Fecha',type:'date',v:hoy(),req:1},
    {k:'lugar',l:'Lugar'+(dest?'':' (si cambia)'),v:lugar0,list:'dl-lug'},
    ...(pideDoma?[{k:'domador',l:'Domador'+(dest?'':' (si pasan a Doma)'),v:masComunDoma('domador')||'Piri'}]:[]),{k:'obs',l:'Observación',type:'area'}],
   async v=>{const destino=dest||v.cat;if(destino==='Descanso'&&one){EXTRA_ACTS.aDescanso({id:one.id});return}
     if(ids.length>1&&!confirm(`¿Pasar ${ids.length} caballos a ${destino}?`))return;
     for(const id of ids){const c=byId(id);if(c&&c.categoria!==destino)await aplicarPaso(c,destino,v)}
     toast(one?one.nombre+' pasó a '+destino:'Categoría cambiada');UI.sel=null;
     if(one){UI.ficha=one.id;renderFicha()}else{closeModal();render()}},
   datalists()+`<p class="note">${one?'':ids.map(i=>esc(byId(i)?.nombre||'')).join(', ')+'. '}Queda guardado como movimiento en cada ficha.</p>`)}
async function aplicarPaso(c,dest,v){const up={categoria:dest};
  if(dest==='Doma'){up.ingresoDoma=v.fecha;if(v.domador)up.domador=v.domador}
  if(c.categoria==='Doma'&&dest!=='Doma')up.salidaDoma=v.fecha;
  if(dest==='Descanso'){up.catPrevia=c.categoria;up.descansoDesde=v.fecha;up.ritmo=''}
  if(dest==='Jugadores'&&!c.ritmo)up.ritmo='normal';
  if(v.lugar&&v.lugar!==(c.lugar||''))up.lugar=v.lugar;
  await db.collection('caballos').doc(c.id).update(up);
  const obs=[c.categoria==='Doma'&&dest!=='Doma'&&c.ingresoDoma?diff(v.fecha,c.ingresoDoma)+' días en doma':'',dest==='Doma'&&v.domador?'Con '+v.domador:'',up.lugar?'Lugar: '+up.lugar:'',v.obs].filter(Boolean).join(' · ');
  await db.collection('eventos').doc(slugId('e')).set({fecha:v.fecha,caballoId:c.id,caballo:c.nombre,tipo:'Movimiento',detalle:c.categoria+' → '+dest+(c.categoria==='Doma'&&dest==='Hechura'?' (entregado de doma)':''),obs,por:uid||''})}
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

/* ================= Torneo: pregunta qué copa, quién lo jugó y cómo le fue ================= */
EXTRA_ACTS.torneoForm=d=>{const c=byId(d.id);if(!c)return;
  const copas=[...new Set(S.eventos.filter(e=>e.tipo==='Torneo'&&e.obs).sort((a,b)=>b.fecha.localeCompare(a.fecha)).map(e=>e.obs))];
  form('Torneo · '+c.nombre,[{k:'fecha',l:'Fecha',type:'date',v:hoy(),req:1},{k:'copa',l:'¿Qué copa o torneo?',list:'dl-copas',full:1},{k:'jugo',l:'¿Quién lo jugó?'},{k:'resultado',l:'¿Cómo le fue? (opcional)'}],
   async v=>{await db.collection('eventos').doc(slugId('e')).set({fecha:v.fecha,caballoId:c.id,caballo:c.nombre,tipo:'Torneo',detalle:'Torneo'+(v.copa?': '+v.copa:'')+(v.jugo?' · lo jugó '+v.jugo:''),obs:[v.copa,v.resultado].filter(Boolean).join(' · '),copa:v.copa||'',jugo:v.jugo||'',resultado:v.resultado||'',por:uid||''});
     toast('Torneo sumado a '+c.nombre);UI.ficha=c.id;renderFicha()},
   `<datalist id="dl-copas">${copas.map(x=>`<option value="${esc(x)}">`).join('')}</datalist><p class="note">Queda en el historial del caballo y sirve para la ficha de venta.</p>`)};

/* ================= Pedigree como imagen (para mandar por WhatsApp) ================= */
function genealogiaDe(c){const gp=padresDeNombre(c.padre),gm=padresDeNombre(c.madre);
  const a=[c.abueloP||gp.padre||'',c.abuelaP||gp.madre||'',c.abueloM||gm.padre||'',c.abuelaM||gm.madre||''];
  return {p:c.padre||'',m:c.madre||'',a,b:a.flatMap(n=>{const x=padresDeNombre(n);return[x.padre||'',x.madre||'']})}}
async function dibujarPedigree(c,sub){
  try{await Promise.all([document.fonts.load('700 40px "Playfair Display"'),document.fonts.load('600 24px Inter')])}catch(e){}
  const W=1600,H=1000,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  const SER='"Playfair Display", Georgia, serif',SAN='Inter, system-ui, sans-serif',G=genealogiaDe(c);
  x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.fillStyle='#0E0E0E';x.fillRect(0,0,W,110);
  if(S.config.logo){try{const l=await loadImg(fotoUrl(S.config.logo));x.fillStyle='#fff';x.fillRect(40,17,76,76);const k=Math.min(68/l.width,68/l.height);x.drawImage(l,78-l.width*k/2,55-l.height*k/2,l.width*k,l.height*k)}catch(e){}}
  else{x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(42,19,72,72);x.fillStyle='#fff';x.font='700 34px '+SER;x.textAlign='center';x.textBaseline='middle';x.fillText('DC',78,56)}
  x.textAlign='left';x.textBaseline='middle';x.fillStyle='#fff';x.font='700 40px '+SER;x.fillText(c.nombre,140,46);
  x.font='500 22px '+SAN;x.fillStyle='#CFCFCA';x.fillText(sub,140,84);
  x.textAlign='right';x.font='600 22px '+SAN;x.fillStyle='#fff';x.fillText('PEDIGREE · DOÑA CECILIA',W-40,56);
  const top=140,bot=H-70,h=(bot-top)/8,cols=[40,410,780,1170],ws=[330,330,350,390];
  const yb=i=>top+(i+.5)*h,ya=j=>(yb(2*j)+yb(2*j+1))/2,yp=k=>(ya(2*k)+ya(2*k+1))/2,yc=(yp(0)+yp(1))/2;
  const caja=(n,col,y,hh,sexo,rol)=>{const w=ws[col],x0=cols[col],y0=y-hh/2;
    x.fillStyle=n?(sexo==='M'?'#DCE8FB':sexo==='H'?'#FCE4F0':'#111'):'#F2F2EF';x.strokeStyle=n?'rgba(0,0,0,.18)':'#BDBDB7';x.lineWidth=2;
    if(!n)x.setLineDash([8,6]);x.beginPath();x.roundRect(x0,y0,w,hh,14);x.fill();x.stroke();x.setLineDash([]);
    x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle=sexo==='X'?'#bbb':'#6A6A66';x.font='600 15px '+SAN;x.fillText(rol.toUpperCase(),x0+16,y0+26);
    x.fillStyle=sexo==='X'?'#fff':'#111';x.font=(n?'700 ':'italic 500 ')+(col===0?'26px ':'21px ')+SAN;
    const ls=wrap(x,n||'Desconocido',w-32).slice(0,2);ls.forEach((l,i)=>x.fillText(l,x0+16,y0+26+(col===0?34:28)*(i+1)))};
  const linea=(c1,y1,c2,y2)=>{const xa=cols[c1]+ws[c1],xb=cols[c2],xm=(xa+xb)/2;x.strokeStyle='#9A9A94';x.lineWidth=2;x.beginPath();x.moveTo(xa,y1);x.lineTo(xm,y1);x.lineTo(xm,y2);x.lineTo(xb,y2);x.stroke()};
  for(let k=0;k<2;k++){linea(0,yc,1,yp(k));for(let j=2*k;j<2*k+2;j++){linea(1,yp(k),2,ya(j));for(let i=2*j;i<2*j+2;i++)linea(2,ya(j),3,yb(i))}}
  caja(c.nombre,0,yc,130,'X','Este caballo');
  caja(G.p,1,yp(0),110,'M','Padre');caja(G.m,1,yp(1),110,'H','Madre');
  ['Abuelo paterno','Abuela paterna','Abuelo materno','Abuela materna'].forEach((r,j)=>caja(G.a[j],2,ya(j),96,j%2?'H':'M',r));
  G.b.forEach((n,i)=>caja(n,3,yb(i),h-12,i%2?'H':'M',i%2?'Bisabuela':'Bisabuelo'));
  x.fillStyle='#0E0E0E';x.fillRect(0,H-50,W,50);x.fillStyle='#fff';x.font='500 20px '+SAN;x.textAlign='left';x.textBaseline='middle';x.fillText(S.config.contacto||'Doña Cecilia',40,H-25);
  return await new Promise((ok,no)=>cv.toBlob(b=>b?ok(b):no(new Error('toBlob')),'image/png'))}
EXTRA_ACTS.pedShare=async d=>{let c,sub;
  if(d.s){const s=S.servicios.find(x=>x.id===d.s);if(!s)return;c={nombre:'POTRILLO DE '+norm(s.madre),padre:s.padrillo,madre:norm(s.madre)};sub=`${s.padrillo} × ${s.madre} · servicio del ${fmt(s.fecha)}${s.fpp?' · parto estimado '+fmt(s.fpp):''}`}
  else{c=byId(d.id);if(!c)return;sub=[c.sexo,c.pelaje,c.nac?'Nacido el '+fmt(c.nac):''].filter(Boolean).join(' · ')||'Doña Cecilia'}
  toast('Armando la imagen…');
  try{const b=await dibujarPedigree(c,sub),nom='Pedigree '+c.nombre.replace(/[\\/:*?"<>|]/g,'')+'.png';
    if(puedeCompartirArchivos()){try{await navigator.share({files:[new File([b],nom,{type:'image/png'})],text:'Pedigree de '+c.nombre});return}catch(e){if(e?.name==='AbortError')return}}
    if(downloads){await downloads.save({filename:nom,data:b});toast('Imagen lista');return}
    const u=URL.createObjectURL(b);pantalla('Pedigree · '+c.nombre,`<img src="${u}" alt="Pedigree de ${esc(c.nombre)}" style="width:100%;border-radius:10px;border:1px solid var(--line)"><p class="note">Mantené apretada la imagen para guardarla o compartirla.</p>`)}
  catch(e){console.error(e);toast('No se pudo armar la imagen.')}};

/* ================= Fichas de potrillos =================
   Una imagen prolija por potrillo (foto, padres, sanidad, hermanos) para mandar por WhatsApp. */
function potrillosFicha(){let l=activos().filter(c=>c.categoria==='Potrillos');if(UI.subCam)l=l.filter(c=>c.camada===UI.subCam);return l.sort(sortCab)}
function edadTxtPot(nac){const n=new Date(nac+'T12:00:00'),t=new Date();let m=(t.getFullYear()-n.getFullYear())*12+t.getMonth()-n.getMonth();if(t.getDate()<n.getDate())m--;m=Math.max(0,m);
  return m<24?(m===1?'1 mes':m+' meses'):Math.floor(m/12)+' años'}
function infoFicha(c){const p=findByName(c.padre),m=findByName(c.madre);
  const tipos=['Desparasitación','Desvasada',...(seHierra(c)?['Herrada']:[]),'Muelas',...ctrlDiasActivos(c).map(x=>x.k).filter(k=>!['Desparasitación','Desvasada','Muelas'].includes(k))];
  const san=tipos.map(t=>({t,...estadoSan(c,t)})).filter(s=>s.u||['Desparasitación','Desvasada'].includes(s.t));
  const herm=S.caballos.filter(x=>x.id!==c.id&&x.estado!=='Muerto'&&c.madre&&norm(x.madre)===norm(c.madre)).sort((a,b)=>(a.nac||'').localeCompare(b.nac||''))
    .map(h=>h.nombre+(c.padre&&norm(h.padre)===norm(c.padre)?' (hermano entero)':'')+(h.estado!=='Activo'?' ('+h.estado.toLowerCase()+')':''));
  return {sub:[c.sexo,c.pelaje,c.nac?'Nació el '+fmt(c.nac)+' ('+edadTxtPot(c.nac)+')':'',c.camada?'Camada '+c.camada:''].filter(Boolean).join(' · '),
    padre:c.padre||'',madre:c.madre||'',gp:[c.abueloP||p?.padre,c.abuelaP||p?.madre].filter(Boolean).join(' × '),gm:[c.abueloM||m?.padre,c.abuelaM||m?.madre].filter(Boolean).join(' × '),
    san,herm,extra:[c.chip?'Chip '+c.chip:'',c.rp?'RP '+c.rp:'',c.lugar?'Está en '+c.lugar:''].filter(Boolean).join(' · '),obs:[c.senas,c.obs].filter(Boolean).join(' · ')}}
async function dibujarFichaPot(c){
  try{await Promise.all([document.fonts.load('700 72px "Playfair Display"'),document.fonts.load('500 30px Inter'),document.fonts.load('600 30px Inter')])}catch(e){}
  const I=infoFicha(c),SER='"Playfair Display", Georgia, serif',SAN='Inter, system-ui, sans-serif',W=1080,M=48;
  const me=document.createElement('canvas').getContext('2d');me.font='400 28px '+SAN;
  const obsL=I.obs?wrap(me,I.obs,W-2*M).slice(0,3):[];me.font='500 28px '+SAN;const hL=I.herm.length?wrap(me,I.herm.join(' · '),W-2*M).slice(0,4):[];
  let foto=null;if(c.fotos?.length)try{foto=await loadImg(fotoUrl(c.fotos[0]))}catch(e){}
  const fh=foto?Math.round(Math.min(900,Math.max(600,W*foto.height/foto.width))):700,H=120+fh+190+(obsL.length?obsL.length*38+20:0)+(I.extra?44:0)+190+70+I.san.length*58+(hL.length?90+hL.length*38:0)+110;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#0E0E0E';x.fillRect(0,0,W,120);
  if(S.config.logo){try{const l=await loadImg(fotoUrl(S.config.logo));x.fillStyle='#fff';x.fillRect(M,20,80,80);const k=Math.min(72/l.width,72/l.height);x.drawImage(l,M+40-l.width*k/2,60-l.height*k/2,l.width*k,l.height*k)}catch(e){}}
  x.textBaseline='middle';x.fillStyle='#fff';x.font='600 30px '+SAN;x.letterSpacing='6px';x.textAlign='left';x.fillText('DOÑA CECILIA',M+110,62);x.textAlign='right';x.font='500 24px '+SAN;x.fillText('POTRILLO',W-M,62);x.letterSpacing='0px';
  const fy=120;
  if(foto){const im=foto,k=Math.max(W/im.width,fh/im.height);const sw=W/k,sh=fh/k;x.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,0,fy,W,fh)}
  else{x.fillStyle='#EDEDEA';x.fillRect(0,fy,W,fh);x.fillStyle='#8A8A85';x.textAlign='center';x.font='500 30px '+SAN;x.fillText('Sin foto',W/2,fy+fh/2)}
  x.textBaseline='alphabetic';x.textAlign='left';let y=fy+fh+86;x.fillStyle='#111';
  let fs=76;x.font=`700 ${fs}px ${SER}`;while(x.measureText(c.nombre).width>W-2*M&&fs>40){fs-=4;x.font=`700 ${fs}px ${SER}`}x.fillText(c.nombre,M,y);
  y+=50;x.font='500 28px '+SAN;x.fillStyle='#555';let s=I.sub;while(x.measureText(s).width>W-2*M&&s.length>10)s=s.slice(0,-2);x.fillText(s,M,y);
  if(I.extra){y+=44;x.fillText(I.extra,M,y)}
  if(obsL.length){y+=20;x.fillStyle='#8A6D00';x.font='400 28px '+SAN;obsL.forEach(l=>{y+=38;x.fillText(l,M,y)})}
  y+=34;x.fillStyle='#111';x.fillRect(M,y,W-2*M,2);
  const etiqueta=(t,cx,yy)=>{x.fillStyle='#777';x.font='600 20px '+SAN;x.letterSpacing='3px';x.fillText(t,cx,yy);x.letterSpacing='0px'};
  y+=50;const cw=(W-2*M)/2-20;
  for(const [lab,nom,ab,cx] of [['PADRE',I.padre,I.gp,M],['MADRE',I.madre,I.gm,W/2+10]]){etiqueta(lab,cx,y);x.fillStyle='#111';x.font='600 32px '+SAN;let n=nom||'Desconocido';while(x.measureText(n).width>cw&&n.length>4)n=n.slice(0,-2);x.fillText(n,cx,y+44);
    if(ab){x.fillStyle='#666';x.font='400 24px '+SAN;let a=ab;while(x.measureText(a).width>cw&&a.length>4)a=a.slice(0,-2);x.fillText(a,cx,y+80)}}
  y+=140;etiqueta('SANIDAD',M,y);y+=14;
  const col={bad:'#B23A3A',warn:'#C27C0E',ok:'#2E7D4F',none:'#888'};
  for(const r of I.san){y+=58;x.fillStyle='#F4F4F1';x.fillRect(M,y-40,W-2*M,50);x.fillStyle='#111';x.font='600 26px '+SAN;x.fillText(r.t,M+16,y-6);
    x.font='400 24px '+SAN;x.fillStyle='#444';x.fillText(r.u?'Última '+fmt(r.u)+(r.p?' · próxima '+fmt(r.p):''):'Sin dato',M+300,y-6);
    x.textAlign='right';x.fillStyle=col[r.st]||'#888';x.font='600 24px '+SAN;x.fillText(r.txt,W-M-16,y-6);x.textAlign='left'}
  if(hL.length){y+=70;etiqueta('HERMANOS (MISMA MADRE)',M,y);x.fillStyle='#111';x.font='500 28px '+SAN;hL.forEach(l=>{y+=40;x.fillText(l,M,y)})}
  x.fillStyle='#0E0E0E';x.fillRect(0,H-70,W,70);x.fillStyle='#fff';x.font='500 22px '+SAN;x.textBaseline='middle';x.fillText('Doña Cecilia · ficha al '+fmt(hoy()),M,H-35);
  return await new Promise((ok,no)=>cv.toBlob(b=>b?ok(b):no(new Error('toBlob')),'image/jpeg',.88))}
const FICHAS={};
EXTRA_ACTS.fichasPot=async()=>{const l=potrillosFicha();
  if(!l.length){toast('No hay potrillos activos.');return}
  const comp=puedeCompartirArchivos();
  pantalla('Fichas de potrillos',`<p class="muted small">${l.length} potrillo${l.length>1?'s':''}${UI.subCam?' · camada '+UI.subCam:''}. Una imagen por potrillo, lista para mandar.</p>
    <div class="row" style="margin:10px 0 14px">${comp?'<button class="btn pri" data-act="fichasShare">Mandar todas por WhatsApp</button>':''}${downloads?`<button class="btn ${comp?'':'pri'}" data-act="fichasBajar">Descargar todas</button>`:''}</div>
    <div id="fichas-prev" style="display:grid;gap:14px">${l.map(c=>`<div data-fp="${c.id}" class="muted small">Armando la ficha de ${esc(c.nombre)}…</div>`).join('')}</div>
    ${!comp&&!downloads?'<p class="note">Mantené apretada cada imagen para guardarla o compartirla.</p>':''}`);
  for(const c of l){try{const b=FICHAS[c.id]=await dibujarFichaPot(c);const el=document.querySelector(`[data-fp="${c.id}"]`);if(!el)return;
    el.outerHTML=`<img src="${URL.createObjectURL(b)}" alt="Ficha de ${esc(c.nombre)}" style="width:100%;max-width:480px;border-radius:10px;border:1px solid var(--line)">`}
    catch(e){console.error(e);const el=document.querySelector(`[data-fp="${c.id}"]`);if(el)el.textContent='No se pudo armar la ficha de '+c.nombre}}};
const archivosFichas=()=>potrillosFicha().filter(c=>FICHAS[c.id]).map(c=>new File([FICHAS[c.id]],'Ficha '+c.nombre.replace(/[\\/:*?"<>|]/g,'')+'.jpg',{type:'image/jpeg'}));
EXTRA_ACTS.fichasShare=async()=>{const f=archivosFichas();if(!f.length){toast('Esperá que terminen de armarse.');return}
  try{await navigator.share({files:f,text:'Fichas de los potrillos · Doña Cecilia'})}catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir. Probá con menos o descargalas.')}};
EXTRA_ACTS.fichasBajar=async()=>{const f=archivosFichas();if(!f.length){toast('Esperá que terminen de armarse.');return}
  try{for(const x of f)await downloads.save({filename:x.name,data:x});toast('Fichas descargadas')}catch(e){if(e?.code!=='declined')toast('No se pudieron descargar.')}};
