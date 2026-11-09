/* Doña Cecilia — compartir como cuadro (pedido de Tomás el 5/11/2026).
   En cada pantalla, el botón "Compartir" arma un CUADRO (una imagen prolija, como las fichas) para mandar por WhatsApp:
   - Madres: próximos partos ("MARTINA · pare el 04/12"), preñadas, paridas, servidas y vacías.
   - Inicio: lo que hay que hacer esta semana, por lugar, y los partos a vigilar.
   - Sanidad: lo vencido y lo que vence pronto (desparasitar, desvasar, herrar, muelas).
   - Camadas: las crías de la camada elegida (2023, 2024…) y las que están por nacer.
   - Ver caballos → Fichas: la lista del grupo.
   Cada cuadro sale de los mismos datos que la pantalla. También se puede mandar como texto. */
const faltanTxt=d=>d<0?'pasó hace '+(-d)+' d':d===0?'¡hoy!':'faltan '+d+' d';
const vencTxt=d=>d<0?'vencido hace '+(-d)+' d':d===0?'vence hoy':'vence en '+d+' d';
const stDias=(d,rojo=15,amarillo=30)=>d<=rojo?'bad':d<=amarillo?'warn':'none';
// un botón chico "Compartir" para el encabezado de cada pantalla
const botonComp=que=>`<button class="btn sm" data-act="comp" data-que="${que}" title="Armar un cuadro para mandar por WhatsApp">Compartir</button>`;

/* Cada pantalla arma un "cuadro": {etq, tit, sub, secs:[{t, filas:[{a, b, c, c2, st}]}], pie}
   a = nombre (negrita) · b = detalle (gris, hasta 2 renglones) · c = dato de la derecha (fecha) · c2 = debajo (faltan 10 d) · st = color */
const COMP={
  madres(){const t=temporadaActual(),nombres=new Map();
    for(const c of activos().filter(c=>c.categoria==='Madres'))nombres.set(norm(c.nombre),c.nombre);
    for(const s of S.servicios.filter(s=>+s.temporada===t))if(!nombres.has(norm(s.madre)))nombres.set(norm(s.madre),s.madre);
    const l=[...nombres.values()].map(n=>{const s=servActual(n,t);return{n,s,st:estadoRepro(s)}});
    const de=k=>l.filter(x=>x.st.k===k).sort((a,b)=>a.n.localeCompare(b.n,'es'));
    const pre=l.filter(x=>x.st.k==='pre'&&x.s?.fpp).sort((a,b)=>a.s.fpp.localeCompare(b.s.fpp));
    const parto=n=>{const m=findByName(n);const e=m&&S.eventos.filter(e=>e.caballoId===m.id&&e.tipo==='Parición').sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];return e?'Parió el '+fmt(e.fecha):'Parió'};
    const secs=[];
    if(pre.length)secs.push({t:'Preñadas · por fecha de parto',filas:pre.map(({n,s})=>{const d=diff(s.fpp,hoy());
      return {a:n,b:[s.padrillo,s.fecha?'servida el '+fmt(s.fecha):'',+s.temporada!==t?'temporada '+s.temporada:''].filter(Boolean).join(' · '),c:'pare el '+fmt(s.fpp),c2:faltanTxt(d),st:stDias(d)}})});
    const par=de('par');if(par.length)secs.push({t:'Paridas',filas:par.map(({n,s})=>({a:n,b:s?.padrillo||'',c:parto(n),st:'ok'}))});
    const ser=de('ser');if(ser.length)secs.push({t:'Servidas · falta la eco',filas:ser.map(({n,s})=>({a:n,b:[s?.padrillo,s?.fecha?'servida el '+fmt(s.fecha):''].filter(Boolean).join(' · '),c:'falta eco',st:'warn'}))});
    const vac=de('vac');if(vac.length)secs.push({t:'Vacías',filas:vac.map(({n,s})=>({a:n,b:s?.obs||'',c:'vacía',st:'none'}))});
    return {etq:'MADRES',tit:'Madres · temporada '+t,sub:`${pre.length} preñadas · ${par.length} paridas · ${vac.length} vacías`,secs,pie:'Fecha de parto aproximada: servicio + '+GEST+' días'}},

  semana(){const {grupos}=tareasSemana(),partos=partosCerca(30);if(!grupos.length&&!partos.length)return null;const secs=[];
    if(partos.length)secs.push({t:'Partos a vigilar',filas:partos.map(s=>{const d=diff(s.fpp,hoy());return {a:s.madre,b:s.padrillo||'',c:'pare el '+fmt(s.fpp),c2:faltanTxt(d),st:stDias(d)}})});
    for(const x of grupos)secs.push({t:`${x.lugar} · ${VERBO[x.etiqueta||x.t]||x.t} (${x.items.length})`,filas:x.items.map(y=>x.t==='Agarrar'?{a:y.c.nombre,c:'el '+fmt(y.s.p),st:'warn'}:
      {a:y.c.nombre,b:ultimo(y.c.id,x.t)?'último: '+fmt(ultimo(y.c.id,x.t)):'',c:(y.s.d<0?'tocaba ':'toca ')+fmt(y.s.p).slice(0,5),c2:vencTxt(y.s.d),st:y.s.d<0?'bad':'warn'})});
    return {etq:'ESTA SEMANA',tit:'Para hacer esta semana',sub:'Del '+fmt(hoy())+' al '+fmt(addDays(hoy(),7)),secs}},

  sanidad(){const l=activos().filter(c=>c.categoria!=='Doma'&&!fuera(c)&&(!UI.sanCat||c.categoria===UI.sanCat)).sort(sortCab),secs=[];
    for(const [t,v] of [['Desparasitación','Desparasitar'],['Desvasada','Desvasar'],['Herrada','Herrar'],['Muelas','Muelas']]){
      const it=l.map(c=>({c,s:estadoSan(c,t)})).filter(x=>!x.s.no&&x.s.p&&(x.s.st==='bad'||x.s.st==='warn')).sort((a,b)=>a.s.d-b.s.d);
      if(it.length)secs.push({t:v+` (${it.length})`,filas:it.map(x=>({a:x.c.nombre,b:x.c.categoria+(x.s.u?' · último: '+fmt(x.s.u):''),c:(x.s.d<0?'tocaba ':'toca ')+fmt(x.s.p).slice(0,5),c2:vencTxt(x.s.d),st:x.s.d<0?'bad':'warn'}))})}
    const sd=l.filter(c=>!estadoSan(c,'Desparasitación').u);
    if(sd.length)secs.push({t:'Sin dato de desparasitación',filas:sd.map(c=>({a:c.nombre,b:c.categoria,c:'sin dato',st:'none'}))});
    if(!secs.length)secs.push({t:'Sanidad',filas:[{a:'Todo al día',c:'✓',st:'ok'}]});
    return {etq:'SANIDAD',tit:'Sanidad y trabajos'+(UI.sanCat?' · '+UI.sanCat:''),sub:'Lo vencido y lo que vence en los próximos 15 días',secs,pie:'Los de doma no figuran: los atiende el domador'}},

  camada(){const t=+S.config.temporada||2026,y=UI.camada??t;
    const l=S.caballos.filter(c=>c.camada===y).sort((a,b)=>(a.nac||'9').localeCompare(b.nac||'9'));
    const por=y===t?S.servicios.filter(s=>+s.temporada===y&&s.estado==='Preñada').sort((a,b)=>(a.fpp||'9').localeCompare(b.fpp||'9')):[];
    if(!l.length&&!por.length)return null;const viv=l.filter(c=>c.estado==='Activo'),secs=[];
    if(l.length)secs.push({t:'Nacidos',filas:l.map(c=>({a:c.nombre,b:[c.sexo,c.pelaje,(c.padre||'?')+' × '+(c.madre||'?')].filter(Boolean).join(' · '),
      c:c.nac?fmt(c.nac):'',c2:c.estado==='Activo'?c.categoria.toLowerCase():c.estado==='Muerto'?'murió':c.estado.toLowerCase(),st:'none',c2st:c.estado==='Activo'?'':'bad'}))});
    if(por.length)secs.push({t:'Por nacer',filas:por.map(s=>{const d=diff(s.fpp,hoy());return {a:'Cría de '+s.madre,b:s.padrillo||'',c:'~'+fmt(s.fpp),c2:faltanTxt(d),st:stDias(d)}})});
    return {etq:'CAMADA',tit:'Camada '+y,sub:`${plural(viv.length,'vivo','vivos')}: ${plural(viv.filter(c=>c.sexo==='Macho').length,'macho','machos')} y ${plural(viv.filter(c=>c.sexo==='Hembra').length,'hembra','hembras')}${por.length?' · '+por.length+' por nacer':''}`,secs,pie:'Los muertos quedan como historia, pero no se cuentan entre los vivos'}},

  lista(){const l=listaFichas();if(!l.length)return null;
    return {etq:'CABALLOS',tit:tituloGrupo(),sub:plural(l.length,'caballo','caballos'),secs:[{t:'',filas:l.map(c=>{const I=infoFicha(c);
      return {a:c.nombre,b:[I.sub,(I.padre||I.madre)?(I.padre||'?')+' × '+(I.madre||'?'):'',...I.etapa,c.obs].filter(Boolean).join(' · '),c:c.rp&&c.rp!==c.nombre?'RP '+c.rp:'',st:'none'}})}]}},
};

/* ---- El cuadro como imagen ---- */
async function dibujarCuadro(q){await cargarFuentesFicha();
  const SER='"Playfair Display", Georgia, serif',SAN='Inter, system-ui, sans-serif',W=1080,M=44,CW=300;
  const me=document.createElement('canvas').getContext('2d');me.font='400 25px '+SAN;
  const filas=q.secs.map(s=>s.filas.map(f=>({...f,bl:f.b?wrap(me,f.b,W-2*M-CW-40).slice(0,2):[]})));
  const altoF=f=>Math.max(f.bl.length?62+f.bl.length*32:76,f.c2?88:76);
  let H=120+150+70+90;q.secs.forEach((s,i)=>{H+=(s.t?70:20)+filas[i].reduce((n,f)=>n+altoF(f),0)+16});
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#0E0E0E';x.fillRect(0,0,W,120);await logoFicha(x,M);
  x.textBaseline='middle';x.fillStyle='#fff';x.font='600 30px '+SAN;x.letterSpacing='6px';x.textAlign='left';x.fillText('DOÑA CECILIA',M+110,62);
  x.textAlign='right';x.font='500 22px '+SAN;x.letterSpacing='3px';x.fillText(q.etq||'',W-M,62);x.letterSpacing='0px';
  x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='#111';let fs=56;x.font=`700 ${fs}px ${SER}`;while(x.measureText(q.tit).width>W-2*M&&fs>34){fs-=4;x.font=`700 ${fs}px ${SER}`}x.fillText(q.tit,M,206);
  x.fillStyle='#666';x.font='500 26px '+SAN;let sub=q.sub||'';while(x.measureText(sub).width>W-2*M-200&&sub.length>8)sub=sub.slice(0,-2);x.fillText(sub,M,250);
  x.textAlign='right';x.fillText('al '+fmt(hoy()),W-M,250);x.textAlign='left';
  const col={bad:'#B23A3A',warn:'#B36B00',ok:'#2E7D4F',none:'#555'},fondo={bad:'#FBE9E9',warn:'#FDF1DC',ok:'#E6F2EA',none:'#F1F1EE'};
  let y=290;
  q.secs.forEach((s,i)=>{
    if(s.t){y+=50;x.fillStyle='#777';x.font='700 21px '+SAN;x.letterSpacing='3px';x.fillText(s.t.toUpperCase(),M,y);x.letterSpacing='0px';y+=20}else y+=20;
    x.fillStyle='#111';x.fillRect(M,y-6,W-2*M,2);
    filas[i].forEach((f,j)=>{const h=altoF(f);if(j%2===1){x.fillStyle='#F8F8F5';x.fillRect(M,y,W-2*M,h)}
      x.fillStyle='#111';x.font='700 30px '+SAN;let a=f.a;while(x.measureText(a).width>W-2*M-CW-40&&a.length>4)a=a.slice(0,-2);x.fillText(a,M+16,y+44);
      x.fillStyle='#666';x.font='400 25px '+SAN;f.bl.forEach((l,k)=>x.fillText(l,M+16,y+80+k*32));
      if(f.c){x.font='700 26px '+SAN;const w=Math.min(CW,x.measureText(f.c).width+32),bx=W-M-16-w;
        x.fillStyle=fondo[f.st]||fondo.none;x.beginPath();x.roundRect(bx,y+16,w,42,21);x.fill();
        x.fillStyle=col[f.st]||col.none;x.textAlign='center';x.fillText(f.c,bx+w/2,y+46);x.textAlign='left'}
      if(f.c2){x.fillStyle=col[f.c2st||f.st]||'#777';x.font='500 22px '+SAN;x.textAlign='right';x.fillText(f.c2,W-M-24,y+80);x.textAlign='left'}
      y+=h;x.fillStyle='#E4E4E0';x.fillRect(M,y-1,W-2*M,1)});
    y+=16});
  if(q.pie){x.fillStyle='#888';x.font='italic 400 22px '+SAN;x.fillText(q.pie,M,H-100)}
  x.fillStyle='#0E0E0E';x.fillRect(0,H-70,W,70);x.fillStyle='#fff';x.font='500 22px '+SAN;x.textBaseline='middle';x.fillText('Doña Cecilia · '+q.tit+' · '+fmt(hoy()),M,H-35);
  return await new Promise((ok,no)=>cv.toBlob(b=>b?ok(b):no(new Error('toBlob')),'image/jpeg',.9))}

/* ---- El mismo cuadro como texto (para quien lo prefiera) ---- */
function textoCuadro(q){const out=[`*${q.tit}*`,q.sub?q.sub:'',`_Doña Cecilia · ${fmt(hoy())}_`].filter(Boolean);
  for(const s of q.secs){out.push('');if(s.t)out.push('*'+s.t+'*');
    for(const f of s.filas)out.push(`${f.st==='bad'?'🔴':f.st==='warn'?'🟡':'•'} *${f.a}*${f.c?' — '+f.c:''}${f.c2?' ('+f.c2+')':''}${f.b?' · '+f.b:''}`)}
  if(q.pie)out.push('','_'+q.pie+'_');return out.join('\n')}

let CUADRO=null;
EXTRA_ACTS.comp=async d=>{const f=COMP[d.que];if(!f)return;const q=f(d);if(!q||!q.secs.length){toast('No hay nada para compartir.');return}
  toast('Armando el cuadro…');let b;try{b=await dibujarCuadro(q)}catch(e){console.error(e);toast('No se pudo armar el cuadro.');return}
  const file=new File([b],nomArch(q.tit)+'.jpg',{type:'image/jpeg'});CUADRO={q,file};
  pantalla('Compartir · '+q.tit,`<img src="${URL.createObjectURL(b)}" alt="${esc(q.tit)}" style="width:100%;max-width:520px;border-radius:10px;border:1px solid var(--line)">
    <div class="row" style="margin-top:12px">${puedeCompartirArchivos()?'<button class="btn pri" data-act="compImg">Mandar por WhatsApp</button>':''}
      <button class="btn ${puedeCompartirArchivos()?'':'pri'}" data-act="compBajar">Descargar imagen</button><button class="btn" data-act="compTexto">Mandar como texto</button></div>
    <p class="note">${puedeCompartirArchivos()?'':'En la compu: descargá la imagen y mandala por WhatsApp Web, o mantené apretada la imagen para copiarla.'}</p>`)};
EXTRA_ACTS.compImg=async()=>{if(!CUADRO)return;try{await navigator.share({files:[CUADRO.file]})}catch(e){if(e?.name!=='AbortError')toast('No se pudo compartir. Probá “Descargar imagen”.')}};
EXTRA_ACTS.compBajar=async()=>{if(!CUADRO)return;
  if(downloads){try{await downloads.save({filename:CUADRO.file.name,data:CUADRO.file});toast('Imagen lista')}catch(e){if(e?.code!=='declined')toast('No se pudo descargar.')}return}
  const a=document.createElement('a');a.href=URL.createObjectURL(CUADRO.file);a.download=CUADRO.file.name;document.body.appendChild(a);a.click();a.remove()};
EXTRA_ACTS.compTexto=async()=>{if(!CUADRO)return;const txt=textoCuadro(CUADRO.q);
  if(navigator.share){try{await navigator.share({text:txt});return}catch(e){if(e?.name==='AbortError')return}}
  pantalla('Texto · '+CUADRO.q.tit,`<textarea id="comp-t" readonly style="width:100%;min-height:50vh;font:15px/1.45 system-ui,sans-serif;padding:10px;border-radius:10px;border:1px solid var(--line)">${esc(txt)}</textarea>
    <div class="row" style="margin-top:10px"><a class="btn pri" href="https://wa.me/?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Abrir WhatsApp</a><button class="btn" data-act="compCopiar">Copiar</button></div>`)};
EXTRA_ACTS.compCopiar=async()=>{const t=document.getElementById('comp-t');if(!t)return;try{await navigator.clipboard.writeText(t.value);toast('Copiado')}catch(e){t.select();toast('Seleccioná el texto y copialo')}};
