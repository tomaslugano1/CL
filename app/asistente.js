/* Doña Cecilia — Asistente (pedido de Tomás el 28/10/2026, como el de Polo Breeders).
   Un botón ✨ abre un chat: se le pregunta algo ("¿cuántos hijos tiene el Hulk?", "chip 40, ¿quién es el abuelo paterno?")
   y responde con los datos de la app, con las tarjetas de los caballos para tocar y abrir la ficha, y sugiere qué preguntar después.
   No usa inteligencia artificial ni internet: entiende las preguntas por palabras clave, así anda sin señal y es instantáneo. */
const ASIS={msgs:[],ultimo:null};
const ICO_CHISPA='<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M10 2l1.8 5.6L17.5 9.5l-5.7 1.9L10 17l-1.8-5.6L2.5 9.5l5.7-1.9z"/><path d="M18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9z"/></svg>';
const SUGERENCIAS_INICIO=['¿Quiénes están preñadas?','¿Qué hay que hacer esta semana?','¿Cuántos caballos hay?','¿Cuántos hijos tiene el Pulpero?','¿Quién es el chip 40?','¿Quiénes están a la venta?'];

/* ---------- entender la pregunta ---------- */
const limpio=s=>' '+norm(s).replace(/[^A-Z0-9Ñ]+/g,' ').trim()+' ';
const GENERICAS=new Set(['DOLFINA','ESPI','MACHITOS','SANTA','TERESA','DON','URBANO','IRENITA','LOS','LAS','OPEN','LA','EL','DE','DEL','DC','SN','POTRA','POTRANCA']);
function quienes(q){const out=[];let t=limpio(q);
  const todos=S.caballos.slice().sort((a,b)=>norm(b.nombre).length-norm(a.nombre).length);
  for(const c of todos)for(const n of [c.nombre,c.apodo].filter(Boolean)){const k=limpio(n);if(k.trim().length>=2&&!/^ \d+ $/.test(k)&&t.includes(k)){out.push({c});t=t.replace(k,' ')}}
  // números: "chip 40", "el 21" → RP, número del nombre o final del chip
  for(const m of t.matchAll(/ (\d{1,3}|\d{15}) /g)){const n=m[1];
    let c;if(n.length===15)c=S.caballos.filter(x=>String(x.chip||'').replace(/\D/g,'')===n);
    else{const porNombre=S.caballos.filter(x=>norm(x.nombre)===n||limpio(x.nombre).endsWith(' '+n+' ')),porRP=S.caballos.filter(x=>String(x.rp||'')===n);
      c=porNombre.length?porNombre:porRP;                       // primero el número del nombre ("DC (GUACHA) 40"), si no el RP
      const act=c.filter(x=>x.estado==='Activo');if(act.length)c=act} // los que están hoy, antes que las bajas
    const unicos=[...new Map(c.map(x=>[x.id,x])).values()];
    if(unicos.length===1)out.push({c:unicos[0]});else if(unicos.length>1)out.push({varios:unicos,n})}
  if(!out.length&&typeof listaPadrillos==='function'){ // padrillos que no son caballos de la manada (Hulk, Pulpero…)
    const pads=listaPadrillos();
    for(const p of pads){const ks=[p.nombre,p.k].map(limpio);const pal=p.nombre?norm(p.nombre).split(/[^A-Z0-9Ñ]+/).filter(w=>w.length>=4&&!GENERICAS.has(w)):[];
      if(ks.some(k=>t.includes(k))||pal.some(w=>t.includes(' '+w+' '))){out.push({p});break}}}
  return out}
const tiene=(q,re)=>re.test(norm(q).normalize('NFD').replace(/[̀-ͯ]/g,''));

/* ---------- armar respuestas ---------- */
const sexoTxt=c=>c.sexo==='Hembra'?'Hembra':c.sexo==='Macho'?'Macho':'';
const lineaCab=c=>[sexoTxt(c),c.estado==='Activo'?c.categoria:c.estado,c.nac?fmt(c.nac):c.camada?'Camada '+c.camada:''].filter(Boolean).join(' · ');
const plural=(n,a,b)=>n+' '+(n===1?a:b);
function hijosDe(nombre){const k=norm(nombre),ali=typeof clavePad==='function'?clavePad(nombre):k;
  return S.caballos.filter(x=>norm(x.madre)===k||norm(x.padre)===k||(typeof clavePad==='function'&&x.padre&&clavePad(x.padre)===ali))}
function abuelosDe(c){const pp=padresDeNombre(c.padre),pm=padresDeNombre(c.madre);
  return{abueloP:c.abueloP||pp.padre||'',abuelaP:c.abuelaP||pp.madre||'',abueloM:c.abueloM||pm.padre||'',abuelaM:c.abuelaM||pm.madre||''}}
const nombreLindo=n=>n||'no se sabe';
/* "X tiene 3 hijos en la manada: 1 macho y 2 hembras. Además, 2 vendidos y 6 que murieron." */
function resumenHijos(N,h){const viv=h.filter(x=>x.estado==='Activo'),ven=h.filter(x=>x.estado==='Vendido').length,mue=h.filter(x=>x.estado==='Muerto').length,otros=h.length-viv.length-ven-mue;
  const ma=viv.filter(x=>x.sexo==='Macho').length,he=viv.filter(x=>x.sexo==='Hembra').length,sx=[ma?plural(ma,'macho','machos'):'',he?plural(he,'hembra','hembras'):''].filter(Boolean).join(' y ');
  let t=viv.length?`${N} tiene ${plural(viv.length,'hijo','hijos')} en la manada${sx?': '+sx:''}.`:`${N} no tiene hijos vivos hoy en la manada.`;
  const extra=[ven?plural(ven,'vendido','vendidos'):'',mue?plural(mue,'que murió','que murieron'):'',otros?plural(otros,'dado de baja','dados de baja'):''].filter(Boolean);
  if(extra.length)t+=` Además, ${extra.join(' y ')}.`;return t}
const ordenHijos=(a,b)=>(a.estado==='Activo'?0:1)-(b.estado==='Activo'?0:1)||(b.nac||String(b.camada||'')).localeCompare(a.nac||String(a.camada||''));
function padresTxt(c){const p=c.padre&&norm(c.padre)!=='—'?c.padre:'',m=c.madre&&norm(c.madre)!=='—'?c.madre:'',h=c.sexo==='Hembra'?'hija':'hijo';
  return p&&m?`${c.nombre} es ${h} de ${p} y ${m}.`:p?`${c.nombre} es ${h} de ${p}; la madre no se sabe.`:m?`${c.nombre} es ${h} de ${m}; el padre no se sabe.`:`De ${c.nombre} no se saben los padres.`}
const conLink=n=>{const c=n&&findByName(n);return c?{c}:null};

function responder(q){
  const ent=quienes(q),r={txt:'',cards:[],sug:[]};
  const varios=ent.find(e=>e.varios);
  if(varios&&!ent.some(e=>e.c)){r.txt=`Hay ${varios.varios.length} caballos con el ${varios.n}. ¿Cuál de estos?`;r.cards=varios.varios;
    r.sug=varios.varios.slice(0,4).map(c=>{const x=q.replace(new RegExp('\\b'+varios.n+'\\b'),c.nombre);return x===q?`¿Quién es ${c.nombre}?`:x});return r}
  let c=ent.find(e=>e.c)?.c||null,pad=ent.find(e=>e.p)?.p||null;
  const sinNombre=!c&&!pad;
  // Sin nombre en la pregunta: si se refiere al último caballo ("¿quiénes son sus hermanos?", "¿qué eventos tiene registrados?")
  if(sinNombre&&ASIS.ultimo&&byId(ASIS.ultimo)&&(tiene(q,/HIJO|HIJA|CRIA|PADRE|MADRE|ABUEL|HERMAN|EVENTO|HISTORIAL|REGISTRAD|EDAD|NACIO|PELAJE/)
    ||tiene(q,/\b(SUS?|ESTE|ESTA|EL|LA)\b/)&&tiene(q,/CHIP|DONDE|PRENAD|DESPARAS|DESVAS|HERRA|VACUN|ANOS/)))c=byId(ASIS.ultimo);
  if(c)ASIS.ultimo=c.id;else if(pad)ASIS.ultimo=null; // "sus hermanos" después de un padrillo no se confunde con otro caballo
  const N=c?c.nombre:pad?pad.nombre:'';

  // ----- preguntas generales (sin un caballo) -----
  if(!c&&!pad){
    if(tiene(q,/PRENAD|PARTO|PARIR|PAREN|PARE |PARIDA/)){const l=S.servicios.filter(s=>s.estado==='Preñada'&&findByName(s.madre)?.estado!=='Muerto').sort((a,b)=>(a.fpp||'9').localeCompare(b.fpp||'9'));
      r.txt=l.length?`Hay ${plural(l.length,'preñada','preñadas')}. La próxima en parir es ${l[0].madre}${l[0].fpp?' ('+fmt(l[0].fpp)+', faltan '+diff(l[0].fpp,hoy())+' días)':''}.`:'No hay ninguna preñada cargada.';
      r.cards=l.map(s=>findByName(s.madre)).filter(Boolean);r.meta=Object.fromEntries(l.map(s=>[findByName(s.madre)?.id,`${s.padrillo||'—'}${s.fpp?' · parto '+fmt(s.fpp):''}`]));
      r.sug=['¿Qué hay que hacer esta semana?',l[0]?`¿Cuántos hijos tiene ${l[0].madre}?`:''];return r}
    if(tiene(q,/HERRER|HERRA|DESVAS|DESPARAS|PARA HACER|VENCID|PENDIENT|TOCA|SEMANA|TAREA/)){const {grupos}=tareasSemana(7);const items=grupos.flatMap(g=>g.items.map(i=>({...i,t:g.t})));
      const ver=t=>({'Desparasitación':'Desparasitar','Desvasada':'Desvasar','Herrada':'Herrar','Muelas':'Muelas','Agarrar':'Agarrar del descanso'}[t]||t);
      const por={};for(const i of items)(por[i.t]=por[i.t]||[]).push(i);
      r.txt=items.length?'Para esta semana: '+Object.entries(por).map(([t,l])=>`${ver(t)} ${l.length} (${l.filter(i=>i.s.d<0).length} atrasado${l.filter(i=>i.s.d<0).length===1?'':'s'})`).join(' · ')+'.':'No hay nada para hacer esta semana.';
      const vistos=new Map();for(const i of items)if(!vistos.has(i.c.id))vistos.set(i.c.id,i);
      r.cards=[...vistos.values()].map(i=>i.c);r.meta=Object.fromEntries([...vistos.values()].map(i=>[i.c.id,items.filter(x=>x.c.id===i.c.id).map(x=>ver(x.t)+(x.s.d<0?` (atrasado ${-x.s.d} d)`:x.s.d===0?' (hoy)':` (en ${x.s.d} d)`)).join(' · ')]));
      r.sug=['¿Quiénes están preñadas?','¿Cuántos caballos hay?'];return r}
    if(tiene(q,/^(HOLA|BUENAS|BUEN DIA|QUE TAL|CHE)\b/)&&q.trim().split(/\s+/).length<=3){r.txt='¡Hola! Preguntame lo que quieras de la manada. Por ejemplo:';r.sug=SUGERENCIAS_INICIO;return r}
    if(tiene(q,/VENDI|MUERT|MURIO|BAJA/)){const l=S.caballos.filter(x=>x.estado!=='Activo').sort((a,b)=>(b.bajaFecha||'').localeCompare(a.bajaFecha||''));
      r.txt=`Hay ${plural(l.length,'baja','bajas')}: ${plural(l.filter(x=>x.estado==='Vendido').length,'vendido','vendidos')} y ${plural(l.filter(x=>x.estado==='Muerto').length,'muerto','muertos')}.`;r.cards=l.slice(0,15);r.meta=Object.fromEntries(l.map(x=>[x.id,`${x.estado}${x.bajaFecha?' '+fmt(x.bajaFecha):''}${x.bajaPrecio?' · '+x.bajaPrecio:''}`]));r.sug=['¿Quiénes están a la venta?'];return r}
    if(tiene(q,/VENTA|VENDER/)){const l=activos().filter(x=>x.venta);r.txt=l.length?`A la venta hay ${plural(l.length,'caballo','caballos')}.`:'No hay caballos marcados a la venta.';r.cards=l;r.sug=['¿Cuántos caballos hay?'];return r}
    if(tiene(q,/FOTO/)){const l=activos().filter(x=>!fuera(x)&&!x.fotos?.length);r.txt=l.length?`Faltan fotos de ${plural(l.length,'caballo','caballos')}. Desde el Inicio, "Día de fotos" te los muestra por lugar.`:'Todos tienen foto.';r.cards=l.slice(0,15);return r}
    if(tiene(q,/PADRILLO/)){const l=listaPadrillos().filter(p=>!p.manada).sort((a,b)=>b.vivos.length-a.vivos.length);
      r.txt=`Usaste ${plural(l.length,'padrillo','padrillos')}. El que más hijos tiene hoy en la manada es ${l[0]?.nombre} (${l[0]?.vivos.length}).`;r.pads=l;r.sug=l.slice(0,2).map(p=>`¿Cuántos hijos tiene ${p.nombre}?`);return r}
    if(tiene(q,/CUANT|TOTAL|CABALLOS HAY/)&&!tiene(q,/HIJO|HIJA|HERMAN|SUELT|AGARRAD/)){const act=activos().filter(x=>!fuera(x));const cats=CATS.map(k=>[k,act.filter(x=>x.categoria===k).length]).filter(([,n])=>n);
      const cat=cats.find(([k])=>tiene(q,new RegExp(norm(k).slice(0,6))));
      if(cat){const l=act.filter(x=>x.categoria===cat[0]).sort(sortCab);r.txt=`Hay ${l.length} en ${cat[0]}.`;r.cards=l;return r}
      r.txt=`Hay ${act.length} caballos propios: `+cats.map(([k,n])=>n+' '+k.toLowerCase()).join(', ')+'.';r.sug=['¿Quiénes están preñadas?','¿Cuántos potrillos hay?','¿Quiénes están a la venta?'];return r}
    if(tiene(q,/SUELT|AGARRAD|DESCANSO/)){const l=activos().filter(x=>!fuera(x)&&typeof trabajoLinea==='function'&&trabajoLinea(x));
      r.txt=`Estos son los que están sueltos o agarrados, con desde cuándo.`;r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,trabajoLinea(x)]));return r}
    r.txt=tiene(q,/HIJO|HIJA|CRIA|PADRE|MADRE|ABUEL|HERMAN|EVENTO|EDAD|CHIP|PELAJE/)?'¿De qué caballo? Escribí el nombre o el número (por ejemplo "el 40").':'No te entendí. Probá con alguna de estas, o escribí el nombre de un caballo:';
    r.sug=SUGERENCIAS_INICIO;return r}

  // ----- un padrillo que no es de la manada -----
  if(pad&&!c){const h=pad.hijos.slice().sort(ordenHijos);
    if(tiene(q,/PADRE|MADRE|SANGRE|PEDIGR|ABUEL/)){r.txt=padresTxt({nombre:N,sexo:'Macho',padre:pad.sangre.padre,madre:pad.sangre.madre});r.pads=[pad];r.sug=[`¿Cuántos hijos tiene ${N}?`];return r}
    r.txt=resumenHijos(N,h)+(pad.porNacer.length?` Y ${pad.porNacer.length} por nacer.`:'');
    r.cards=h;r.pads=[pad];r.sug=[`¿Quiénes son los padres de ${N}?`,'¿Qué padrillos usé?'];return r}

  // ----- un caballo -----
  const nom=c.nombre;r.sug=[`¿Quiénes son sus hermanos?`,`¿Qué eventos tiene registrados?`];
  if(tiene(q,/HIJO|HIJA|CRIA|PROGENIE|DESCENDEN/)){const h=hijosDe(nom).sort(ordenHijos);
    r.txt=h.length?resumenHijos(nom,h):`${nom} no tiene hijos cargados.`;r.cards=h;
    const s=S.servicios.find(x=>norm(x.madre)===norm(nom)&&x.estado==='Preñada');if(s)r.txt+=` Y está preñada de ${s.padrillo||'—'}${s.fpp?', pare para el '+fmt(s.fpp):''}.`;
    r.sug=[`¿Quiénes son los padres de ${nom}?`,'¿Quiénes son sus hermanos?'];return r}
  if(tiene(q,/ABUEL/)){const a=abuelosDe(c);
    const pat=tiene(q,/PATERN/),mat=tiene(q,/MATERN/),fem=tiene(q,/ABUELA/),mas=tiene(q,/ABUELO\b/);
    const uno=(rol,quien,via,quienVia)=>quien?`${rol==='abuelo paterno'||rol==='abuelo materno'?'El':'La'} ${rol} de ${nom} es ${quien} (${via} ${quienVia}).`:`No se sabe quién es ${rol==='abuelo paterno'||rol==='abuelo materno'?'el':'la'} ${rol} de ${nom}${quienVia?` (${via} ${quienVia})`:''}.`;
    if(pat&&(mas||!fem)&&!mat)r.txt=uno('abuelo paterno',a.abueloP,'padre de su padre,',c.padre);
    else if(pat&&fem)r.txt=uno('abuela paterna',a.abuelaP,'madre de su padre,',c.padre);
    else if(mat&&(mas||!fem))r.txt=uno('abuelo materno',a.abueloM,'padre de su madre,',c.madre);
    else if(mat&&fem)r.txt=uno('abuela materna',a.abuelaM,'madre de su madre,',c.madre);
    else{const par=(x,y)=>x||y?`${nombreLindo(x)} y ${nombreLindo(y)}`:'no se saben';
      r.txt=`Los abuelos de ${nom}: por el padre (${nombreLindo(c.padre)}), ${par(a.abueloP,a.abuelaP)}; por la madre (${nombreLindo(c.madre)}), ${par(a.abueloM,a.abuelaM)}.`}
    r.cards=[a.abueloP,a.abuelaP,a.abueloM,a.abuelaM].map(conLink).filter(Boolean).map(x=>x.c);r.sug=['¿Quiénes son sus hermanos?',`¿Cuántos hijos tiene ${c.padre||nom}?`];return r}
  if(tiene(q,/HERMAN/)){const her=S.caballos.filter(x=>x.id!==c.id&&c.madre&&norm(x.madre)===norm(c.madre)).sort((a,b)=>(b.nac||'').localeCompare(a.nac||''));
    const enteros=her.filter(x=>c.padre&&norm(x.padre)===norm(c.padre)&&norm(c.padre)!=='MANADA');
    r.txt=her.length?`${nom} tiene ${plural(her.length,'hermano','hermanos')} por parte de madre (${c.madre})${enteros.length?`; ${plural(enteros.length,'es','son')} también del mismo padre (${c.padre})`:''}.`:`${nom} no tiene hermanos cargados${c.madre?' por parte de '+c.madre:''}.`;
    r.cards=her;r.meta=Object.fromEntries(her.map(x=>[x.id,lineaCab(x)+(x.padre?' · de '+x.padre:'')]));r.sug=[`¿Quiénes son los padres de ${nom}?`,'¿Qué eventos tiene registrados?'];return r}
  if(tiene(q,/PADRE|MADRE|PAPA|MAMA|SANGRE|PEDIGR|DE QUIEN ES/)){r.txt=padresTxt(c);
    r.cards=[c.padre,c.madre].map(conLink).filter(Boolean).map(x=>x.c);r.sug=[`¿Quién es el abuelo paterno de ${nom}?`,'¿Quiénes son sus hermanos?'];return r}
  if(tiene(q,/PRENAD|PARTO|PARE|SERVICIO/)){const s=servUltimo(nom);const st=estadoRepro(s);
    r.txt=!s?`${nom} no tiene servicios cargados.`:st.k==='pre'?`${nom} está preñada de ${s.padrillo||'—'} (servida ${fmt(s.fecha)}).${st.v?` Va por el día ${st.v.dia} y la ventana de parto es del ${fmt(st.v.desde)} al ${fmt(st.v.hasta)}, lo más probable el ${fmt(st.v.prob)}.`:''}`:`${nom}: ${st.txt.toLowerCase()} (último servicio ${s.fecha?fmt(s.fecha):'—'}${s.padrillo?' con '+s.padrillo:''}).`;
    r.cards=[c];return r}
  const evTipo=[['DESPARAS','Desparasitación'],['DESVAS','Desvasada'],['HERRA','Herrada'],['VACUN','Vacuna'],['MUELA','Muelas'],['ANEMIA','Anemia'],['PRACTICA','Práctica'],['TORNEO','Torneo']].find(([k])=>tiene(q,new RegExp(k)));
  if(evTipo||tiene(q,/EVENTO|HISTORIAL|QUE SE LE HIZO|ULTIM|REGISTR/)){let ev=S.eventos.filter(e=>e.caballoId===c.id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    if(evTipo)ev=ev.filter(e=>e.tipo===evTipo[1]||norm(e.tipo).startsWith(evTipo[0]));
    r.txt=ev.length?(evTipo?`${evTipo[1]} de ${nom}: la última fue el ${fmt(ev[0].fecha)}${ev.length>1?` (hay ${ev.length} cargadas)`:''}.`:`${nom} tiene ${plural(ev.length,'evento','eventos')}. Los últimos:`):`${nom} no tiene ${evTipo?evTipo[1].toLowerCase()+' cargada':'eventos cargados'}.`;
    r.lista=ev.slice(0,8).map(e=>`${fmt(e.fecha)} · ${e.detalle||e.tipo}${e.obs?' · '+e.obs:''}`);r.cards=[c];r.sug=['¿Quiénes son sus hermanos?',`¿Quiénes son los padres de ${nom}?`];return r}
  if(tiene(q,/EDAD|ANOS|CUANDO NACIO|NACIMIENTO|NACIO/)){const e=edad(c.nac);r.txt=c.nac?`${nom} nació el ${fmt(c.nac)}: tiene ${e} ${e===1?'año':'años'}.`:c.camada?`De ${nom} no está la fecha de nacimiento; es de la camada ${c.camada}.`:`De ${nom} no se sabe la edad.`;r.cards=[c];return r}
  if(tiene(q,/DONDE|LUGAR/)){r.txt=`${nom} está en ${c.lugar||'(sin lugar cargado)'}, en ${c.categoria}.${typeof trabajoLinea==='function'&&trabajoLinea(c)?' '+trabajoLinea(c)+'.':''}`;r.cards=[c];return r}
  // datos generales
  const e=edad(c.nac),datos=[sexoTxt(c),c.pelaje,e!==null?e+(e===1?' año':' años'):c.camada?'camada '+c.camada:'',c.estado==='Activo'?c.categoria:c.estado,c.lugar].filter(Boolean).join(', ');
  r.txt=`${nom}: ${datos}. ${padresTxt(c).replace(nom+' es','Es')}${c.chip?' Chip '+c.chip+'.':''}${c.obs?' '+c.obs+'.':''}`;r.cards=[c];
  r.sug=[`¿Quién es el abuelo paterno de ${nom}?`,'¿Quiénes son sus hermanos?','¿Qué eventos tiene registrados?'];return r}

/* ---------- pantalla ---------- */
function htmlRespuesta(r){
  const card=c=>`<button type="button" class="acard ${esc(c.sexo||'')}${c.estado!=='Activo'?' baja':''}" data-open="${c.id}"><div class="grow"><b>${esc(c.nombre)}</b><span>${esc((r.meta&&r.meta[c.id])||lineaCab(c))}</span></div><span class="go">›</span></button>`;
  const pcard=p=>`<button type="button" class="acard Macho" data-act="padVer" data-k="${esc(p.k)}"><div class="grow"><b>${esc(p.nombre)}</b><span>Padrillo · ${plural(p.vivos.length,'hijo vivo','hijos vivos')}</span></div><span class="go">›</span></button>`;
  return `<div class="amsg bot"><p>${esc(r.txt)}</p>${r.lista?.length?`<ul class="alist">${r.lista.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
    ${r.cards?.length||r.pads?.length?`<div class="acards">${(r.pads||[]).slice(0,12).map(pcard).join('')}${(r.cards||[]).slice(0,20).map(card).join('')}</div>${r.cards?.length>20?`<p class="small muted">y ${r.cards.length-20} más</p>`:''}`:''}</div>`}
function pantallaAsistente(){
  const ult=ASIS.msgs[ASIS.msgs.length-1],sug=(ult&&ult.r?ult.r.sug:SUGERENCIAS_INICIO).filter(Boolean);
  pantalla('Asistente',`<div class="achat" data-asistente>${ASIS.msgs.length?'':`<div class="amsg bot"><p>Preguntame lo que quieras de la manada: hijos, padres, abuelos, hermanos, chips, eventos, preñadas, qué hay que hacer… Anda sin señal.</p></div>`}
    ${ASIS.msgs.map(m=>m.q?`<div class="amsg yo">${esc(m.q)}</div>`:htmlRespuesta(m.r)).join('')}
    <div class="asug">${sug.slice(0,4).map(s=>`<button type="button" class="chip" data-act="aPreg" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    ${ASIS.msgs.length?'<button type="button" class="a anueva" data-act="aNueva">Nueva conversación</button>':''}</div>
    <form class="aform" id="aform" autocomplete="off"><input id="a-q" placeholder="Escribí tu pregunta…" enterkeyhint="send"><button class="btn pri" type="submit">Enviar</button></form>`);
  const ov=$('#modal .ov');if(ov)ov.scrollTop=ov.scrollHeight}
function preguntar(q){q=String(q||'').trim();if(!q)return;let r;try{r=responder(q)}catch(e){console.error(e);r={txt:'Uy, no pude responder eso. Probá preguntarlo de otra forma.',sug:SUGERENCIAS_INICIO}}
  ASIS.msgs.push({q},{r});pantallaAsistente()}
EXTRA_ACTS.asistente=()=>pantallaAsistente();
EXTRA_ACTS.aPreg=d=>preguntar(d.q);
EXTRA_ACTS.aNueva=()=>{ASIS.msgs=[];ASIS.ultimo=null;pantallaAsistente()};
document.addEventListener('submit',e=>{if(e.target.id!=='aform')return;e.preventDefault();const i=$('#a-q');preguntar(i.value)},true);
/* Al volver de una ficha que se abrió desde el asistente, vuelve el asistente (no se cierra todo) */
NAV.rehacer['p:Asistente']=pantallaAsistente;

/* Botón ✨ flotante */
{const b=document.createElement('button');b.className='afab';b.type='button';b.dataset.act='asistente';b.setAttribute('aria-label','Asistente');b.innerHTML=ICO_CHISPA;document.body.appendChild(b)}
{const st=document.createElement('style');st.textContent=`
.afab{position:fixed;right:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:40;width:58px;height:58px;border-radius:50%;border:0;background:var(--campo);color:var(--on-pri);display:grid;place-items:center;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer}
.achat{display:flex;flex-direction:column;gap:10px;padding-bottom:8px}
.amsg{max-width:88%;border-radius:18px;padding:12px 14px;line-height:1.4}
.amsg p{margin:0}
.amsg.yo{align-self:flex-end;background:var(--campo);color:var(--on-pri)}
.amsg.bot{align-self:flex-start;background:var(--surface);border:1px solid var(--line)}
.acards{display:flex;flex-direction:column;margin-top:10px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.acard{display:flex;align-items:center;gap:8px;width:100%;text-align:left;padding:10px 12px;border:0;border-top:1px solid var(--line);background:var(--surface);color:inherit;font:inherit;cursor:pointer}
.acard:first-child{border-top:0}.acard.Macho{background:var(--macho)}.acard.Hembra{background:var(--hembra)}.acard.baja{opacity:.6}
.acard b{display:block;font-size:15px}.acard span{font-size:13px;color:var(--muted)}.acard .go{font-size:22px;margin-left:auto}
.alist{margin:8px 0 0;padding-left:18px;font-size:14px}
.asug{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:4px}.asug .chip{text-align:left;white-space:normal}
.anueva{align-self:center;margin-top:6px;font-weight:600;border:0;background:none;color:var(--muted);cursor:pointer}
.aform{position:sticky;bottom:0;display:flex;gap:8px;padding:10px 0 calc(10px + env(safe-area-inset-bottom,0px));background:var(--surface)}
.aform input{flex:1;border-radius:24px}`;document.head.appendChild(st)}
