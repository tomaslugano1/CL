/* Doña Cecilia — compartir por WhatsApp (pedido de Tomás el 5/11/2026).
   En cada pantalla, un botón "Compartir" arma un mensaje prolijo en texto, con fechas y datos, listo para WhatsApp:
   - Madres: próximos partos, preñadas, paridas y vacías.
   - Inicio: lo que hay que hacer esta semana (por lugar) y los partos a vigilar.
   - Sanidad: lo vencido y lo que vence pronto (desparasitar, desvasar, herrar, muelas).
   - Ver caballos → Fichas: la lista del grupo en texto.
   - Camadas: las crías de la camada y las que están por nacer.
   En WhatsApp *así* sale en negrita y _así_ en cursiva. */
const encabComp=(t,sub)=>`*${t}*${sub?'\n'+sub:''}\n_Doña Cecilia · ${fmt(hoy())}_`;
const cuandoTxt=d=>d<0?'vencido hace '+(-d)+(-d===1?' día':' días'):d===0?'vence hoy':'vence en '+d+(d===1?' día':' días');
const faltanTxt=d=>d<0?'pasó la fecha hace '+(-d)+(-d===1?' día':' días'):d===0?'¡es hoy!':'faltan '+d+(d===1?' día':' días');
// un botón chico "Compartir" para el encabezado de cada pantalla
const botonComp=que=>`<button class="btn sm" data-act="comp" data-que="${que}" title="Mandar por WhatsApp">Compartir</button>`;

async function compartirTexto(txt,titulo){
  if(navigator.share){try{await navigator.share({text:txt});return}catch(e){if(e?.name==='AbortError')return}}
  // compu o celular sin "compartir": se muestra el texto, con WhatsApp y Copiar
  pantalla(titulo,`<p class="muted small" style="margin-top:0">Así queda el mensaje. Podés abrir WhatsApp con el texto o copiarlo.</p>
    <textarea id="comp-t" readonly style="width:100%;min-height:50vh;font:15px/1.45 system-ui,sans-serif;padding:10px;border-radius:10px;border:1px solid var(--line)">${esc(txt)}</textarea>
    <div class="row" style="margin-top:10px"><a class="btn pri" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Abrir WhatsApp</a><button class="btn" data-act="compCopiar">Copiar</button></div>`)}
EXTRA_ACTS.compCopiar=async()=>{const t=document.getElementById('comp-t');if(!t)return;try{await navigator.clipboard.writeText(t.value);toast('Copiado')}catch(e){t.select();toast('Seleccioná el texto y copialo')}};
EXTRA_ACTS.comp=d=>{const f=COMP[d.que];if(!f)return;const r=f(d);if(!r){toast('No hay nada para compartir.');return}compartirTexto(r.txt,r.tit)};

const COMP={
  // Madres: igual que la pantalla (misma temporada y mismo orden por urgencia)
  madres(){const t=temporadaActual(),nombres=new Map();
    for(const c of activos().filter(c=>c.categoria==='Madres'))nombres.set(norm(c.nombre),c.nombre);
    for(const s of S.servicios.filter(s=>+s.temporada===t))if(!nombres.has(norm(s.madre)))nombres.set(norm(s.madre),s.madre);
    const l=[...nombres.values()].map(n=>{const s=servActual(n,t);return{n,s,st:estadoRepro(s)}});
    const pre=l.filter(x=>x.st.k==='pre'&&x.s?.fpp).sort((a,b)=>a.s.fpp.localeCompare(b.s.fpp));
    const otras=k=>l.filter(x=>x.st.k===k).sort((a,b)=>a.n.localeCompare(b.n,'es'));
    const parto=n=>{const m=findByName(n);const e=m&&S.eventos.filter(e=>e.caballoId===m.id&&e.tipo==='Parición').sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];return e?' el '+fmt(e.fecha):''};
    const par=otras('par'),vac=otras('vac'),ser=otras('ser'),out=[encabComp('Madres · temporada '+t)];
    if(pre.length){out.push('','🤰 *Preñadas, por fecha de parto* ('+pre.length+')');
      for(const {n,s} of pre){const d=diff(s.fpp,hoy());out.push(`${d<=30?'⚠️':'•'} *${n}* — pare ~${fmt(s.fpp)} (${faltanTxt(d)})${s.padrillo?' · '+s.padrillo:''}${+s.temporada!==t?' · temporada '+s.temporada:''}`)}}
    if(par.length){out.push('','🐴 *Paridas* ('+par.length+')');par.forEach(({n})=>out.push(`• ${n} — parió${parto(n)}`))}
    if(ser.length){out.push('','🔎 *Servidas, falta la eco* ('+ser.length+')');ser.forEach(({n,s})=>out.push(`• ${n}${s?.fecha?' — servida el '+fmt(s.fecha):''}${s?.padrillo?' · '+s.padrillo:''}`))}
    if(vac.length){out.push('','○ *Vacías* ('+vac.length+')');out.push(vac.map(x=>x.n).join(', '))}
    out.push('','_Fecha de parto = servicio + '+GEST+' días (aproximada)._');
    return {tit:'Compartir · Madres',txt:out.join('\n')}},

  // Inicio: para hacer esta semana, por lugar, más los partos a vigilar
  semana(){const {grupos}=tareasSemana(),partos=partosCerca();if(!grupos.length&&!partos.length)return null;
    const out=[encabComp('Para hacer esta semana','Hasta el '+fmt(addDays(hoy(),7)))];
    for(const lugar of [...new Set(grupos.map(x=>x.lugar))]){out.push('','📍 *'+lugar+'*');
      for(const x of grupos.filter(g=>g.lugar===lugar)){out.push(`*${VERBO[x.etiqueta||x.t]||x.t}* (${x.items.length}):`);
        x.items.forEach(y=>out.push(`• ${y.c.nombre} — ${x.t==='Agarrar'?'el '+fmt(y.s.p):cuandoTxt(y.s.d)}`))}}
    if(partos.length){out.push('','🤰 *Partos a vigilar*');partos.forEach(s=>out.push(`• *${s.madre}* — pare ~${fmt(s.fpp)} (${faltanTxt(diff(s.fpp,hoy()))})${s.padrillo?' · '+s.padrillo:''}`))}
    return {tit:'Compartir · Esta semana',txt:out.join('\n')}},

  // Sanidad: por cada trabajo, lo vencido y lo que vence en 15 días (con el filtro de categoría de la pantalla)
  sanidad(){const l=activos().filter(c=>c.categoria!=='Doma'&&!fuera(c)&&(!UI.sanCat||c.categoria===UI.sanCat)).sort(sortCab);
    const out=[encabComp('Sanidad y trabajos'+(UI.sanCat?' · '+UI.sanCat:''))];let algo=false;
    for(const [t,v] of [['Desparasitación','Desparasitar'],['Desvasada','Desvasar'],['Herrada','Herrar'],['Muelas','Muelas']]){
      const it=l.map(c=>({c,s:estadoSan(c,t)})).filter(x=>!x.s.no&&x.s.p&&(x.s.st==='bad'||x.s.st==='warn')).sort((a,b)=>a.s.d-b.s.d);
      if(!it.length)continue;algo=true;const ven=it.filter(x=>x.s.d<0),pron=it.filter(x=>x.s.d>=0);
      out.push('','*'+v+'*');
      if(ven.length){out.push('🔴 Vencidos ('+ven.length+'):');ven.forEach(x=>out.push(`• ${x.c.nombre} — último ${fmt(x.s.u)} (${cuandoTxt(x.s.d)})`))}
      if(pron.length){out.push('🟡 Vencen pronto ('+pron.length+'):');pron.forEach(x=>out.push(`• ${x.c.nombre} — ${fmt(x.s.p)}`))}}
    const sd=l.filter(c=>!estadoSan(c,'Desparasitación').u);
    if(sd.length){algo=true;out.push('','⚪ *Sin dato de desparasitación* ('+sd.length+'): '+sd.map(c=>c.nombre).join(', '))}
    if(!algo)out.push('','Todo al día ✅');
    out.push('','_Los de Doma no figuran: los atiende el domador._');
    return {tit:'Compartir · Sanidad',txt:out.join('\n')}},

  // La lista de Ver caballos (la categoría elegida), con los datos de cada uno
  lista(){const l=listaFichas();if(!l.length)return null;const out=[encabComp(tituloGrupo(),plural(l.length,'caballo','caballos'))];
    for(const c of l){const I=infoFicha(c);out.push('',`*${c.nombre}*${c.rp&&c.rp!==c.nombre?' (RP '+c.rp+')':''}`);
      if(I.sub)out.push(I.sub);if(I.padre||I.madre)out.push((I.padre||'Padre ?')+' × '+(I.madre||'Madre ?'));
      I.etapa.forEach(e=>out.push(e));if(c.obs)out.push('_'+c.obs+'_')}
    return {tit:'Compartir · '+tituloGrupo(),txt:out.join('\n')}},

  // Camada: crías (vivas y muertas, como en la pantalla) y las que están por nacer
  camada(){const t=+S.config.temporada||2026,y=UI.camada??t;
    const l=S.caballos.filter(c=>c.camada===y).sort((a,b)=>(a.nac||'9').localeCompare(b.nac||'9'));
    const por=y===t?S.servicios.filter(s=>+s.temporada===y&&s.estado==='Preñada').sort((a,b)=>(a.fpp||'9').localeCompare(b.fpp||'9')):[];
    if(!l.length&&!por.length)return null;const viv=l.filter(c=>c.estado==='Activo');
    const out=[encabComp('Camada '+y,`${plural(viv.length,'vivo','vivos')} (${plural(viv.filter(c=>c.sexo==='Macho').length,'macho','machos')}, ${plural(viv.filter(c=>c.sexo==='Hembra').length,'hembra','hembras')})${por.length?' · '+por.length+' por nacer':''}`)];
    if(l.length){out.push('','🐴 *Nacidos*');
      l.forEach(c=>out.push(`• *${c.nombre}* — ${[c.sexo,c.pelaje,c.nac?'nació el '+fmt(c.nac):''].filter(Boolean).join(' · ')}${c.madre||c.padre?' · '+(c.padre||'?')+' × '+(c.madre||'?'):''}${c.estado==='Muerto'?' · murió':c.estado!=='Activo'?' · '+c.estado.toLowerCase():''}`))}
    if(por.length){out.push('','🤰 *Por nacer*');por.forEach(s=>out.push(`• Cría de ${s.madre} — ~${fmt(s.fpp)}${s.padrillo?' · '+s.padrillo:''}`))}
    return {tit:'Compartir · Camada '+y,txt:out.join('\n')}},
};
