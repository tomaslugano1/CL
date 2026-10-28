/* Doña Cecilia — Asistente (pedido de Tomás el 28/10/2026, como el de Polo Breeders).
   Un botón ✨ abre un chat: se le pregunta algo ("¿cuántos hijos tiene el Hulk?", "chip 40, ¿quién es el abuelo paterno?")
   y responde con los datos de la app, con las tarjetas de los caballos para tocar y abrir la ficha, y sugiere qué preguntar después.
   No usa inteligencia artificial ni internet: entiende las preguntas por palabras clave, así anda sin señal y es instantáneo.
   Cómo contesta (responder):
   - Primero acomoda la pregunta: abreviaturas de WhatsApp, números en letras, palabras del dictado por voz, errores de tipeo.
   - Si hay varias preguntas en un mensaje, contesta cada una.
   - "¿y la Guacha?" repite la pregunta anterior con otro caballo; "de esas, ¿cuáles son alazanas?" o "ordenalas por edad"
     trabajan sobre la lista anterior; "no, la otra" cambia al otro caballo con un nombre parecido.
   - Las señas ("cara blanca", "estrella en la frente", "patas blancas") se buscan en las observaciones de las fichas.
   - Después prueba, en este orden: 1) preguntas de uso, 2) cómo se hace, sí o no, filtros y períodos, 3) lo de siempre
     (generales, padrillos y caballos). La primera que entiende la pregunta, contesta. */
const ASIS={msgs:[],ultimo:null,intencion:'',lista:null};
const ICO_CHISPA='<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M10 2l1.8 5.6L17.5 9.5l-5.7 1.9L10 17l-1.8-5.6L2.5 9.5l5.7-1.9z"/><path d="M18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9z"/></svg>';
const SUGERENCIAS_INICIO=['¿Quiénes están preñadas?','¿Qué hay que hacer esta semana?','¿Cuántos caballos hay?','¿Cuántos hijos tiene el Pulpero?','¿Quién es el chip 40?','¿Quiénes están a la venta?'];

/* ---------- entender la pregunta ---------- */
const limpio=s=>' '+norm(s).replace(/[^A-Z0-9Ñ]+/g,' ').trim()+' ';
const GENERICAS=new Set(['DOLFINA','ESPI','MACHITOS','SANTA','TERESA','DON','URBANO','IRENITA','LOS','LAS','OPEN','LA','EL','DE','DEL','DC','SN','POTRA','POTRANCA']);
const palSig=n=>norm(n).split(/[^A-Z0-9Ñ]+/).filter(w=>w&&(w.length>=2||/\d/.test(w))&&!GENERICAS.has(w)); // palabras que identifican al caballo ("COLORADA", "26")
function quienes(q){const out=[];let t=limpio(q);
  // "la colorada 26", "la de la baya 26": todas las palabras del nombre están en la pregunta (gana el que más palabras tiene)
  {const toks=new Set(t.trim().split(' '));let mejor=null,nm=1;
    const lista=t.trim().split(' ');
    for(const c of S.caballos){const w=palSig(c.nombre);if(w.length>nm&&w.some(x=>/\d/.test(x))&&w.every(x=>toks.has(x))){
      const ps=w.map(x=>lista.indexOf(x));if(Math.max(...ps)-Math.min(...ps)<=w.length){mejor=c;nm=w.length}}} // las palabras tienen que estar juntas ("baya 26"), no "la baya es la madre del 27"
    if(mejor){out.push({c:mejor});for(const w of palSig(mejor.nombre))t=t.replace(' '+w+' ',' ')}}
  const todos=S.caballos.slice().sort((a,b)=>norm(b.nombre).length-norm(a.nombre).length);
  for(const c of todos)for(const n of [c.nombre,c.apodo].filter(Boolean)){const k=limpio(n);if(k.trim().length>=2&&!/^ \d+ $/.test(k)&&t.includes(k)){out.push({c});t=t.replace(k,' ')}}
  // caballos cuyo nombre son solo palabras de la pregunta ("la colorada" → COLORADA POTRA, no sus potrillos)
  {const toks=new Set(t.trim().split(' ').filter(w=>w.length>=4&&!VOCAB.includes(w)&&!COMUNES.has(w)));
    for(const w of [...toks]){const cand=S.caballos.filter(x=>{const p=palSig(x.nombre);return p.length&&p.includes(w)&&p.every(y=>toks.has(y))});
      const act=cand.filter(x=>x.estado==='Activo'),u=act.length?act:cand;if(u.length===1&&!out.some(e=>e.c===u[0])){out.push({c:u[0]});for(const y of palSig(u[0].nombre)){t=t.replace(' '+y+' ',' ');toks.delete(y)}}}}
  if(!out.length)for(const w of t.trim().split(' ').filter(w=>w.length>=5&&!GENERICAS.has(w)&&!/\d/.test(w)&&!VOCAB.includes(w))){
    const m=S.caballos.filter(x=>limpio(x.nombre).includes(' '+w+' ')||(x.apodo&&limpio(x.apodo).includes(' '+w+' ')));const act=m.filter(x=>x.estado==='Activo');
    const u=act.length?act:m;if(u.length===1){out.push({c:u[0]});t=t.replace(' '+w+' ',' ')}}
  // números: "chip 40", "el 21" → RP, número del nombre o final del chip
  for(const m of t.matchAll(/ (\d{1,3}|\d{15}) (?!(A[NÑ]OS?|MESES|MES|DIAS?|SEMANAS?|PATAS?|MANOS?|PRACTICAS|TORNEOS|VECES|HIJOS|CRIAS|CABALLOS|YEGUAS|POTRILLOS)\b)/g)){const n=m[1]; // "de 3 años" no es el caballo 3
    let c;if(n.length===15)c=S.caballos.filter(x=>String(x.chip||'').replace(/\D/g,'')===n);
    else{const porNombre=S.caballos.filter(x=>norm(x.nombre)===n||limpio(x.nombre).endsWith(' '+n+' ')),porRP=S.caballos.filter(x=>String(x.rp||'')===n);
      c=t.includes(' RP '+n+' ')&&porRP.length?porRP:porNombre.length?porNombre:porRP;                       // primero el número del nombre ("DC (GUACHA) 40"), si no el RP
      const act=c.filter(x=>x.estado==='Activo');if(act.length)c=act} // los que están hoy, antes que las bajas
    let unicos=[...new Map(c.map(x=>[x.id,x])).values()];
    if(unicos.length>1){const tq=limpio(q);const f=unicos.filter(x=>t.includes(' '+norm(x.categoria||'-')+' ')||t.includes(' '+norm(x.categoria||'-').replace(/S$/,'')+' ')||palSig(x.nombre).some(w=>!/\d/.test(w)&&tq.includes(' '+w+' ')&&!out.some(e=>e.c&&palSig(e.c.nombre).join(' ')===w)));
      if(f.length===1){unicos=f;const k=norm(f[0].categoria||'-');t=t.replace(' '+k+' ',' ').replace(' '+k.replace(/S$/,'')+' ',' ')}}
    if(unicos.length===1){out.push({c:unicos[0]});t=t.replace(' '+n+' ',' ')}else if(unicos.length>1)out.push({varios:unicos,n});else if(n.length<15)out.push({ninguno:n})}
  if(!out.length||/ ES | SON /.test(t)){ // padrillos que no son caballos de la manada (Hulk, Pulpero…)
    const pads=listaPadrillos();
    for(const p of pads){if(p.manada&&!/ HIJ| CRIA/.test(t))continue;
      const ws=norm(p.nombre).split(/[^A-Z0-9Ñ]+/).filter(Boolean),pares=ws.slice(1).map((w,i)=>' '+ws[i]+' '+w+' ');
      if(pares.some(x=>t.includes(x))){out.push({p});for(const x of pares)t=t.replace(x,' ');break}
      const ks=[p.nombre,p.k].map(limpio);const pal=p.nombre?norm(p.nombre).split(/[^A-Z0-9Ñ]+/).filter(w=>w.length>=4&&!GENERICAS.has(w)):[];
      if(ks.some(k=>t.includes(k))||pal.some(w=>t.includes(' '+w+' '))){out.push({p});for(const k of ks)t=t.replace(k,' ');for(const w of pal)t=t.replace(' '+w+' ',' ');break}}}
  const tq=limpio(q),pos=e=>{if(e.varios||e.ninguno){const j=tq.indexOf(' '+(e.n||e.ninguno)+' ');return j<0?999:j}const n=e.c?e.c.nombre:e.p?e.p.nombre:'';const ws=palSig(n);let i=-1;for(const w of ws){const j=tq.indexOf(' '+w+' ');if(j>=0&&(i<0||j<i))i=j}return i<0?999:i};
  out.sort((a,b)=>pos(a)-pos(b));out.resto=t;return out}
/* Errores de tipeo: "hijso", "hermnos", "prenadas", "sicodelica"… Se corrige cada palabra a la más parecida
   (una letra de diferencia; dos si la palabra es larga). Primero contra los nombres de los caballos, después contra las palabras que entiende. */
const VOCAB=('HERRADO HERRADOS HERRADA HERRADAS DESHERRADO DESHERRADA CASTRADO CASTRADOS DESPARASITADO DESPARASITADOS DESPARASITADAS ALAZANES ALAZANAS ZAINOS ZAINAS TORDILLOS TORDILLAS TOBIANOS TOBIANAS OSCUROS OSCURAS COLORADOS MOROS MORAS RUANOS RUANAS VIEJOS JOVENES EMBRION EMBRIONES RECEPTORA RECEPTORAS NIETOS NIETAS NIETO NIETA DESCENDIENTES SANGRE PROMEDIO MOVIMIENTOS MOVIO HIJOS HIJAS HIJO HIJA HERMANOS HERMANAS HERMANO HERMANA PADRE MADRE PADRES ABUELO ABUELA ABUELOS PATERNO PATERNA MATERNO MATERNA '+
  'PREÑADA PREÑADAS PARTO PARTOS NACIMIENTO NACIMIENTOS NACIO NACIERON NACIDOS PARIERON PARIDAS PARIO EVENTOS HISTORIAL DESPARASITACION DESPARASITAR '+
  'DESVASE DESVASAR DESVASADA HERRADA HERRAR HERRERO VACUNA VACUNAS AGARRADOS AGARRADAS AGARRADO AGARRADA SUELTOS SUELTAS SUELTO SUELTA VENTA VENDIDOS '+
  'VENDIDAS MUERTOS MUERTAS FOTOS PADRILLO PADRILLOS CUANTOS CUANTAS JUGADORES POTRILLOS MADRES DOMA DESCANSO HECHURA EDAD CHIP PELAJE CAMADA ULTIMO '+
  'SANIDAD VETERINARIO LESION LESIONES ENFERMO ENFERMOS ANALISIS ESTUDIOS NUMERACION NUMERO SIGNIFICA DOMADOR CASTRADO CASTRADOS CASTRACION ABORTO ABORTOS ABORTO NOTAS REVISAR VACUNAR DOSIS SERVICIOS PROMEDIO POTRERO COMPLETA ADENITIS TETANO INFLUENZA RINONEUMONITIS ENCEFALO SALMONELA MURIERON MURIO MURIERON VENDIERON VENDIO NACE NACERA RESUMEN NOVEDAD ULTIMA ULTIMOS SEMANA PARIR PAREN PROXIMA PROXIMO PROXIMOS POTRANCAS POTRANCA VIEJO VIEJA JOVEN AYUDA NOVEDADES ATRASADOS VENCIDOS EMBOCADURA PRACTICAS TORNEOS VACIAS RECEPTORAS PRECIO QUIENES CUALES CABALLOS YEGUAS HEMBRAS MACHOS').split(' ');
function lev(a,b){if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1),
    i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]?d[i-2][j-2]+1:99);return d[a.length][b.length]}
const tope=w=>w.length>=8?2:1;
function masParecida(w,lista){let mejor=null,dmin=9,emp=false;for(const x of lista){const d=lev(w,x);if(d<dmin){dmin=d;mejor=x;emp=false}else if(d===dmin&&mejor&&x!==mejor&&x.slice(0,3)!==mejor.slice(0,3))emp=true}
  return mejor&&dmin<=tope(w)&&!emp?mejor:null}
function palabrasNombres(){const set=new Set();for(const c of S.caballos)for(const n of [c.nombre,c.apodo])if(n)for(const w of norm(n).split(/[^A-Z0-9Ñ]+/))if(w.length>=4&&!GENERICAS.has(w))set.add(w);
  for(const p of listaPadrillos())for(const w of norm(p.nombre).split(/[^A-Z0-9Ñ]+/))if(w.length>=4&&!GENERICAS.has(w))set.add(w);return [...set]}
const COMUNES=new Set('HIZO HICE HIZE HACE HAGO HICIERON DOÑA DONA CECILIA JULIO QUINTA CAMPO MAS MENOS MEJOR PEOR GRANDE CHICO CHICA SEMANA MES ENERO FEBRERO MARZO ABRIL MAYO JUNIO JULIO AGOSTO SETIEMBRE SEPTIEMBRE OCTUBRE NOVIEMBRE DICIEMBRE ESTA ESTAN ESTE TIENE TIENEN TENGO CUANDO DONDE QUIEN QUIENES CUAL CUALES HACER TOCA TOCAN PARA COMO HAY CUANTO CUANTA QUE LOS LAS UNA UNO DESDE HASTA HACE TODO TODOS TODAS SOLO MUCHO POCO NUEVO NUEVA VIEJO OTRO OTRA SON FUE FUERON ERES PERO CON SIN SUS LUGAR ESTOY'.split(' '));
function corregir(q){const nombres=palabrasNombres(),setN=new Set(nombres),setV=new Set(VOCAB);
  q=norm(q).replace(/\bHIERR(A|AN|O|E)\b/g,'HERRAR'); // "se hierra", "hierran"
  return norm(q).replace(/[^A-Z0-9Ñ ]+/g,' ').split(/\s+/).filter(Boolean).map(w=>{
    if(w.length<4||/\d/.test(w)||setN.has(w)||setV.has(w)||COMUNES.has(w)||GENERICAS.has(w))return w; // MACHITOS, DOLFINA, ESPI… son parte de nombres
    const n=w.length>=5?masParecida(w,nombres):null;if(n)return n;
    const v=masParecida(w,VOCAB);return v||w}).join(' ')}
const tiene=(q,re)=>re.test(norm(q).normalize('NFD').replace(/[̀-ͯ]/g,''));


/* Números dichos en letras ("el cuarenta" = 40), sobre todo cuando se pregunta por voz */
const NUM_U={UNO:1,UNA:1,DOS:2,TRES:3,CUATRO:4,CINCO:5,SEIS:6,SIETE:7,OCHO:8,NUEVE:9},NUM_D={DIEZ:10,ONCE:11,DOCE:12,TRECE:13,CATORCE:14,QUINCE:15,DIECISEIS:16,DIECISIETE:17,DIECIOCHO:18,DIECINUEVE:19,VEINTE:20,
  VEINTIUNO:21,VEINTIDOS:22,VEINTITRES:23,VEINTICUATRO:24,VEINTICINCO:25,VEINTISEIS:26,VEINTISIETE:27,VEINTIOCHO:28,VEINTINUEVE:29},NUM_T={TREINTA:30,CUARENTA:40,CINCUENTA:50,SESENTA:60,SETENTA:70,OCHENTA:80,NOVENTA:90};
function numerosEnLetras(q){let t=' '+norm(q).normalize('NFD').replace(/[\u0300-\u036f]/g,'')+' ';
  const T=Object.keys(NUM_T).join('|'),U=Object.keys(NUM_U).join('|'),D=Object.keys(NUM_D).join('|'),antes='(EL|LA|DEL|AL|NUMERO|N|CHIP|RP|DE LA)';
  t=t.replace(new RegExp(' '+antes+' ('+T+') Y ('+U+') ','g'),(m,a,d,u)=>` ${a} ${NUM_T[d]+NUM_U[u]} `)
     .replace(new RegExp(' '+antes+' ('+T+'|'+D+') ','g'),(m,a,d)=>` ${a} ${NUM_T[d]||NUM_D[d]} `)
     .replace(new RegExp(' '+antes+' ('+U+') ','g'),(m,a,u)=>` ${a} ${NUM_U[u]} `)
     .replace(new RegExp(' ('+T+') Y ('+U+') (?=(ANOS?|MESES|MES|DIAS?|SEMANAS?) )','g'),(m,d,u)=>` ${NUM_T[d]+NUM_U[u]} `)
     .replace(new RegExp(' ('+T+'|'+D+'|'+U+') (?=(ANOS?|MESES|MES|DIAS?|SEMANAS?) )','g'),(m,w)=>` ${NUM_T[w]||NUM_D[w]||NUM_U[w]} `);
  return t.trim()}
/* cómo suena: para el dictado por voz (VALLA = BAYA, HUACHA = GUACHA) */
const fon=w=>w.replace(/^HU(?=[AEIO])/,'GU').replace(/W/g,'GU').replace(/LL/g,'Y').replace(/V/g,'B').replace(/(^|[^C])H/g,'$1').replace(/Z/g,'S').replace(/C([EI])/g,'S$1').replace(/QU/g,'K').replace(/C([AOU])/g,'K$1').replace(/G([EI])/g,'J$1').replace(/Y$/,'I');
function porSonido(q){const nombres=palabrasNombres(),mapa={};for(const n of nombres)if(n.length>=4)mapa[fon(n)]=n;
  return norm(q).split(/\s+/).map(w=>{const k=w.replace(/[^A-ZÑ]/g,'');if(k.length<4||nombres.includes(k)||VOCAB.includes(k)||COMUNES.has(k))return w;const n=mapa[fon(k)];return n||w}).join(' ')}
/* Abreviaturas de WhatsApp: q, xq, cdo, dnd, hnos… */
const ABREV_WA={Q:'QUE',K:'QUE',KE:'QUE',XQ:'POR QUE',PQ:'POR QUE',PORQ:'POR QUE',CDO:'CUANDO',CUANDOO:'CUANDO',DSP:'DESPUES',DPS:'DESPUES',TB:'TAMBIEN',TMB:'TAMBIEN',TAMB:'TAMBIEN',
  X:'POR',D:'DE',DL:'DEL',HNOS:'HERMANOS',HNAS:'HERMANAS',HNO:'HERMANO',HNA:'HERMANA',PROX:'PROXIMO',PROXIMA:'PROXIMA',ULT:'ULTIMO',ULTI:'ULTIMO',CUANTS:'CUANTOS',CUANTAS:'CUANTAS',
  CTOS:'CUANTOS',CTAS:'CUANTAS',CUANT:'CUANTOS',DND:'DONDE',DOND:'DONDE',NAC:'NACIO',PREÑ:'PREÑADA',PRENADS:'PREÑADAS',DESPARA:'DESPARASITACION',DESPARAS:'DESPARASITACION',
  VACU:'VACUNA',SERV:'SERVICIO',POTRS:'POTRILLOS',POTRI:'POTRILLOS',MAMA:'MADRE',PAPA:'PADRE',VIEJ:'VIEJO',NRO:'NUMERO',NUM:'NUMERO',PLS:'',PLIS:'',PORFA:'',XFA:'',PF:''};
function abreviaturas(q){return String(q).split(/(\s+)/).map(w=>{const k=norm(w).replace(/[^A-ZÑ]/g,'');return k&&k.length<=8&&ABREV_WA[k]!==undefined&&!/\d/.test(w)?w.replace(/[A-Za-zÑñÁÉÍÓÚáéíóú]+/,ABREV_WA[k]):w}).join('')}
/* Meses y rangos de fechas */
const MESES_N=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const finMes=d=>addDays(addDays(d.slice(0,8)+'01',32).slice(0,8)+'01',-1);
/* rango de fechas pedido: "entre marzo y junio", "desde agosto", "hasta junio", "en 2025", "este año", "el año pasado" */
function rangoFechas(qc){const nq=' '+norm(qc).replace('SETIEMBRE','SEPTIEMBRE')+' ',y0=+hoy().slice(0,4),M='('+MESES_N.join('|')+')',yr=nq.match(/\b(20\d\d)\b/);const Y=yr?+yr[1]:y0;
  const ini=(m,y)=>`${y}-${String(MESES_N.indexOf(m)+1).padStart(2,'0')}-01`;let m;
  if((m=nq.match(new RegExp('ENTRE '+M+'(?: (?:DE |DEL )?(20\\d\\d))? Y '+M+'(?: (?:DE |DEL )?(20\\d\\d))?')))){const y2=+(m[4]||Y),y1=+(m[2]||(MESES_N.indexOf(m[1])>MESES_N.indexOf(m[3])?y2-1:y2));
    return{desde:ini(m[1],y1),hasta:finMes(ini(m[3],y2)),nombre:`entre ${m[1].toLowerCase()} y ${m[3].toLowerCase()} ${y2}`}}
  if((m=nq.match(new RegExp('DESDE '+M)))){const y=yr?Y:(MESES_N.indexOf(m[1])+1>+hoy().slice(5,7)?y0-1:y0);return{desde:ini(m[1],y),hasta:hoy(),nombre:`desde ${m[1].toLowerCase()} ${y}`}}
  if((m=nq.match(new RegExp('HASTA '+M)))){return{desde:`${Y}-01-01`,hasta:finMes(ini(m[1],Y)),nombre:`de enero a ${m[1].toLowerCase()} ${Y}`}}
  if(new RegExp(' '+M+' ').test(nq))return null; // un solo mes: lo resuelve la otra capa
  if(yr&&/\b(EN|DEL|DURANTE|EL|ANO|DE) 20\d\d\b/.test(nq))return{desde:`${Y}-01-01`,hasta:`${Y}-12-31`,nombre:'en '+Y,anio:Y};
  if(/ESTE ANO/.test(nq))return{desde:`${y0}-01-01`,hasta:`${y0}-12-31`,nombre:'este año',anio:y0};
  if(/ANO PASADO/.test(nq))return{desde:`${y0-1}-01-01`,hasta:`${y0-1}-12-31`,nombre:'el año pasado',anio:y0-1};
  return null}
/* Palabras que dicen que hay una pregunta (para separar dos preguntas en un mensaje y para el "¿y la Guacha?") */
const INTENCION=/TORNEO|PRACTICA|JUG|NOTA|ANOTE|AFUERA|SIGNIFICA|PORCENTAJE|PROMEDIO|MESES|GAST|HIJO|HIJA|CRIA|PADRE|MADRE|ABUEL|HERMAN|EDAD|ANOS|NACIO|CHIP|PELAJE|DONDE|PRENAD|PARE\b|PARTO|DESPARAS|DESVAS|HERR|VACUN|EVENTO|SANIDAD|TOCA|CUANT|QUIEN|CUAL|VENT|MUERT|VENDI/;

/* ---------- armar respuestas ---------- */
const sexoTxt=c=>c.sexo==='Hembra'?'Hembra':c.sexo==='Macho'?'Macho':'';
const lineaCab=c=>[sexoTxt(c),c.estado==='Activo'?c.categoria:bajaTxt(c),c.nac?fmt(c.nac):c.camada?'Camada '+c.camada:''].filter(Boolean).join(' · ');
const plural=(n,a,b)=>n+' '+(n===1?a:b);
/* "2 meses" para los potrillos de menos de un año, "6 años" para el resto */
const edadTxt=c=>{if(!c.nac)return '';const e=edad(c.nac);if(e>0)return plural(e,'año','años');const m=Math.max(0,Math.floor(diff(hoy(),c.nac)/30.44));return m?plural(m,'mes','meses'):plural(Math.max(0,diff(hoy(),c.nac)),'día','días')};
/* "Murió el 11/10/2026", "Vendida el 15/09/2026" (con el género del caballo) */
const bajaTxt=c=>{const f=c.sexo==='Hembra';return (c.estado==='Muerto'?'Murió':c.estado==='Vendido'?(f?'Vendida':'Vendido'):c.estado)+(c.bajaFecha?' el '+fmt(c.bajaFecha):'')};
function hijosDe(nombre){const k=norm(nombre),ali=clavePad(nombre);
  return S.caballos.filter(x=>norm(x.madre)===k||norm(x.padre)===k||(x.padre&&clavePad(x.padre)===ali))}
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

const $ar=n=>'$'+Math.round(n).toLocaleString('es-AR');
const costoHerrero=l=>{const p0=precios();return l.reduce((a,e)=>a+(+e.precio||p0[e.tipo]||0),0)};
const evHerrero=()=>S.eventos.filter(e=>['Desvasada','Herrada'].includes(e.tipo));
/* "Cómo se hace" en la app, con los nombres reales de los botones */
const AYUDA_APP=[
  [/PARTO|NACIMIENTO|PARIO|NACIO UN|POTRILLO NUEVO/,'Para cargar un parto: entrá a la ficha de la madre (o Inicio → Próximo parto) y en Servicios tocá "Cargar nacimiento". Completás sexo, pelaje, fecha y si nació vivo; la madre y el padre se completan solos y el servicio queda como parido. También desde "+ Alta" → Nacimiento.'],
  [/ABORT/,'Para cargar un aborto: en la ficha de la yegua, en Servicios, tocá "Registrar aborto" y poné la fecha.'],
  [/FOTO/,'Para agregar una foto: entrá a la ficha del caballo, bajá hasta Fotos y tocá "+ Agregar foto" (cámara o galería). Para varios de una, Inicio → "Día de fotos". Necesita señal.'],
  [/BAJA|VENDI|MURIO|MUERTE/,'Para dar de baja (venta o muerte): entrá a la ficha y abajo de todo tocá "Dar de baja". Elegís el motivo, la fecha y, si se vendió, el precio y el comprador.'],
  [/ALTA|CABALLO NUEVO|AGREGAR UN CABALLO|COMPRA/,'Para dar de alta un caballo: en Ver caballos tocá "+ Alta" y elegí Nacimiento, Compra, Receptora o Padrillo.'],
  [/SERVICIO|INSEMIN|SERVIR/,'Para cargar un servicio: en la ficha de la yegua (o en Madres y partos) tocá "+ Servicio": padrillo, fecha y cómo se sirvió. La fecha probable de parto se calcula sola.'],
  [/ECO|TACTO/,'Para cargar una ecografía o tacto: en la ficha de la yegua, en Preñez, tocá "+ Ecografía" (o los botones Vacía / Preñada).'],
  [/DESPARAS|VACUN|SANIDAD|ANEMIA|MUELA/,'Para cargar sanidad: en la ficha tocá "+ Evento" y elegí qué se hizo. Para varios caballos a la vez: en Ver caballos tocá "+ Sanidad", elegí los caballos y cargás una sola vez.'],
  [/HERR|DESVAS|HERRERO/,'Para cargar el herrero: en la ficha tocá "+ Evento" → Herrada o Desvasada (con el precio). Para varios de una: Ver caballos → "+ Sanidad", elegís los caballos y cargás Desvasada o Herrada.'],
  [/CATEGORIA|MOVER|PASAR A|DESCANSO|AGARRAR|SOLTAR|LUGAR/,'Para cambiar de categoría o de lugar: en la ficha, en Categoría, están "Pasar a…", "Mandar a descanso" y "Otra categoría" (y "Agarrar" si está en descanso). Para varios: Ver caballos → "Seleccionar", elegís y tocás "Cambiar categoría" o "Cambiar lugar".'],
  [/NOMBRE|DATOS|PELAJE|CHIP|EDITAR|CORREGIR/,'Para cambiar el nombre u otro dato: en la ficha tocá "Editar datos" (abajo de todo). Si cambiás el nombre de una madre, se cambia solo en sus servicios y en sus hijos. El chip también se carga pasando el lector.'],
  [/PRACTICA|TORNEO/,'Para sumar una práctica o un torneo: en la ficha del jugador, en Polo, tocá "+1".'],
  [/NOTA|ANOTO|ANOTAR|PENDIENTE|RECORDATORIO/,'Para anotar algo pendiente: en Inicio → Notas → "+ Nueva nota".'],
  [/LECTOR|ESCANE/,'Para el lector de chips: con la app abierta pasás el lector Bluetooth por el caballo y se abre su ficha sola. Si el chip no es de nadie, te pregunta de qué caballo es.']];
/* "Qué significa" cada cosa de la app */
const GLOSARIO=[
  [/PUNTO|PUNTITO|BOLITA|CIRCULITO/,'Los puntitos al lado de cada caballo en la lista son la sanidad: el primero es la desparasitación y el segundo el desvase. Verde = al día, amarillo = vence en 15 días o menos, rojo = vencido, gris = sin dato.'],
  [/COLOR|VERDE|AMARILL|ROJO|GRIS/,'Colores: verde = al día; amarillo = falta poco (15 días o menos) o falta un dato; rojo = vencido o atrasado; gris = sin dato o no corresponde (por ejemplo, madres y potrillos no se hierran).'],
  [/VENTANA/,'Ventana de parto: entre el día 320 y el 360 desde el servicio, que es cuando normalmente paren las yeguas. En Madres y partos está la barra amarilla; la rayita oscura es la fecha más probable y la roja es hoy.'],
  [/ATRASAD/,'Atrasado: ya pasó la fecha en que tocaba (desparasitar, desvasar, herrar o el parto). Sale en rojo hasta que se carga lo que se hizo.'],
  [/POR VENCER|PROXIMO|PROXIMA/,'Próximo o por vencer: vence en 15 días o menos. Sale en amarillo.'],
  [/AL DIA/,'Al día: lo último que se hizo todavía no venció. Sale en verde.'],
  [/AGARRAD|SUELT/,'Agarrado: el caballo está en el palenque, trabajando (se lo agarra cuando sale del descanso). Suelto: está largado en el campo, descansando. La app cuenta los días desde que se agarró o se soltó.'],
  [/HECHURA/,'Hechura: los caballos que ya salieron de la doma y se están haciendo para jugar, antes de pasar a Jugadores.'],
  [/DESVAS/,'Desvasar es emparejar y cortar el vaso (sin herrar). Herrar también incluye desvasar, así que el conteo del desvase arranca desde lo último que se hizo, desvase o herrada.'],
  [/FPP|FECHA PROBABLE/,'FPP es la fecha probable de parto: 340 días desde el servicio.'],
  [/RITMO/,'El ritmo dice cada cuánto se hierra y desvasa ese caballo según cuánto juega.'],
  [/RP\b|NUMERO/,'El número en el nombre (el RP) es el número del caballo: coincide con el final del chip. No es el orden en que nacieron y se puede repetir entre camadas.'],
  [/PENDIENTE|NUBE|SIN SUBIR|CARTEL/,'Cuando ves "cambios sin subir", es que se cargó algo sin señal: queda guardado en el celular y se sube solo cuando vuelve la señal (aparece "subido").'],
  [/AFUERA/,'Afuera: caballos nuestros que están en otro lado (por ejemplo, a la venta en otro campo). No cuentan en la manada ni en la sanidad de acá.']];
/* Pedidos de cargar algo: el asistente solo lee */
const CARGAR=/^(CARGA|CARGAME|CARGALE|CARGAR|CARGUE|ANOTA|ANOTAME|ANOTALE|REGISTRA|REGISTRAME|AGREGA|AGREGAME|AGREGALE|PONE|PONELE|PONEME|MARCA|MARCALE|DALE DE BAJA|DA DE BAJA|DALE|BORRA|BORRALE|CAMBIA|CAMBIALE|SUMA|SUMALE|MOVE|MOVELA|MOVELO|PASA|PASALA|PASALO|GUARDA|GUARDAME)\b|^(DE BAJA|DAR DE BAJA) |^(PODES|PODRIAS|ME) (CARGAR|ANOTAR|REGISTRAR|AGREGAR|PONER|BORRAR|CAMBIAR|DAR DE BAJA)|^(QUIERO|NECESITO) (CARGAR|ANOTAR|REGISTRAR|AGREGAR|PONER|BORRAR|DAR DE BAJA|CAMBIAR)/;

/* ---------- responder ---------- */
function responder(q0){
  q0=String(q0||'');
  // números en letras y palabras del dictado
  let q1=numerosEnLetras(abreviaturas(q0));q1=porSonido(q1);
  // dos preguntas en un mensaje: "los hijos de la Baya y cuándo pare la Martina"
  const partes=q1.split(/\?|[.;]\s|\bY TAMBIEN\b|\bTAMBIEN\b|\bY DESPUES\b|\bDESPUES\b|\bY ADEMAS\b|\bY (?=(QUE|CUANDO|CUANTO|CUANTOS|CUANTAS|QUIEN|QUIENES|DONDE|COMO|DECIME|DAME|PASAME)\b)/).filter(x=>x&&!/^(QUE|CUANDO|CUANTO|CUANTOS|CUANTAS|QUIEN|QUIENES|DONDE|COMO|DECIME|DAME|PASAME)$/.test(x.trim())&&x.trim().length>3)
    .filter(x=>!/^\s*(Y )?(CUALES|CUAL|QUIENES|QUIEN)( SON| ES)?( ESOS| ESAS| ELLOS| ELLAS)?\s*$/.test(x)); // "¿Y cuáles?" va con la anterior (las tarjetas ya los muestran)
  if(partes.length>=2&&partes.every(p=>INTENCION.test(p))){
    const rs=[];let txt=[],ant=null;for(let p of partes.slice(0,4)){const e=quienes(corregir(p));const n=e.find(x=>x.c)?.c.nombre||e.find(x=>x.p)?.p.nombre;if(n)ant=n;else if(ant)p=p+' '+ant;const r=responderUna(p);rs.push(r);txt.push(r.txt)}
    return {txt:txt.join('\n\n'),cards:[...new Map(rs.flatMap(r=>r.cards||[]).map(x=>[x.id,x])).values()].slice(0,20),pads:rs.flatMap(r=>r.pads||[]),lista:rs.flatMap(r=>r.lista||[]),meta:Object.assign({},...rs.map(r=>r.meta||{})),sug:rs[rs.length-1].sug||[]}}
  return responderUna(q1)}
function responderUna(q){const r=responderUna0(q);if((r.cards||[]).length>=2)ASIS.lista=r.cards;return r}
function responderUna0(q){
  const qc=corregir(q);
  // "¿y la Guacha?": repite la pregunta anterior con otro caballo
  if(/^\s*Y\b/.test(norm(qc))&&ASIS.intencion){const ent=quienes(qc);const resto=(ent.resto||'').replace(/\b(Y|EL|LA|LOS|LAS|DEL|DE|AL|CON|QUE|ONDA)\b/g,' ').trim();
    if(ent.some(e=>e.c||e.p||e.varios)&&!resto){const nombre=ent.find(e=>e.c)?.c.nombre||ent.find(e=>e.p)?.p.nombre||ent.find(e=>e.varios)?.n;return responderUna(ASIS.intencion+' '+nombre)}}
  const rf=refinar(qc);if(rf)return rf;
  const se=buscarSenas(q,false);if(se)return se;
  let r=respuestasDeUso(q,qc)||respuestasPorFiltro(q,qc)||respuestasBase(q);
  if(/^No te entendí/.test(r.txt))r=buscarSenas(q,true)||r;
  const ent=quienes(qc);if(ent.some(e=>e.c||e.p)){const it=(ent.resto||'').trim();if(it&&INTENCION.test(it))ASIS.intencion=it}
  return r}

/* ---------- Sobre la respuesta anterior ----------
   "de esas, ¿cuáles son alazanas?", "solo las de doma", "sacá las madres", "ordenalas por edad", "no, la otra" */
const REFINA=/\b(DE|ENTRE) (ESAS|ESOS|ESTAS|ESTOS|ELLAS|ELLOS|LA LISTA|ESA LISTA)\b|^(Y )?(ORDENA(LAS|LOS|ME|MELAS|MELOS)?|SOLO|SOLAMENTE|NADA MAS|SACA\w*|SACALE\w*|FILTRA\w*|DEJA SOLO|DEJAME SOLO|MOSTRAME SOLO|QUITA\w*)\b/;
function refinar(qc){const nq=norm(qc);
  // "no, la otra": otro caballo con una palabra del nombre en común (la otra Baya)
  if(/^(NO,? )?(LA OTRA|EL OTRO|OTRA|OTRO)\b|\bNO,? (LA|EL) OTR[AO]\b|\bME REFERIA A (LA|EL) OTR[AO]\b/.test(nq)&&ASIS.ultimo&&byId(ASIS.ultimo)){const c=byId(ASIS.ultimo);
    const pal=norm(c.nombre).split(/[^A-Z0-9Ñ]+/).filter(w=>w.length>=3&&!/^(DC|S|N)$/.test(w));
    const otros=S.caballos.filter(x=>x.id!==c.id&&pal.some(w=>norm(x.nombre).split(/[^A-Z0-9Ñ]+/).includes(w))).sort(sortCab);
    if(otros.length===1)return responderUna0((ASIS.intencion||'todo de')+' '+otros[0].nombre);
    const r={txt:otros.length?`Con ${pal.join(' o ').toLowerCase()} en el nombre hay ${otros.length} más. ¿Cuál?`:`No hay otro caballo con un nombre parecido a ${c.nombre}.`,cards:otros,sug:[]};return r}
  const L=ASIS.lista;if(!L||L.length<2||!REFINA.test(nq))return null;
  const ws=nq.split(/[^A-Z0-9Ñ]+/),raiz=w=>norm(w).replace(/(ES|S)$/,'').replace(/[AO]$/,'').slice(0,6),pels=[...new Set(S.caballos.map(x=>x.pelaje).filter(Boolean))];
  const fuera0=/SACA|QUITA|\bSIN\b|MENOS|EXCEPTO|SALVO|\bNO\b/.test(nq),conds=[],desc=[];
  const cond=(f,t)=>{conds.push(f);desc.push(t)};
  if(/HEMBRA|YEGUA|POTRANCA/.test(nq))cond(x=>x.sexo==='Hembra','hembras');else if(/\bMACHO/.test(nq))cond(x=>x.sexo==='Macho','machos');
  const cat=CATS.find(k=>new RegExp('\\b'+norm(k).slice(0,6)).test(nq))||(/\bPOLO\b|JUGANDO/.test(nq)?'Jugadores':null);if(cat)cond(x=>x.categoria===cat,'en '+cat);
  const pel=pels.find(p=>ws.some(w=>w.length>=4&&raiz(w)===raiz(p.split(' ')[0])));if(pel){const pr=raiz(pel.split(' ')[0]);cond(x=>x.pelaje&&raiz(x.pelaje.split(' ')[0])===pr,'de pelaje '+pel.toLowerCase())}
  const lug=[...new Set(S.caballos.map(x=>x.lugar).filter(Boolean))].find(l=>limpio(nq).includes(limpio(l)));if(lug)cond(x=>x.lugar===lug,'en '+lug);
  if(/VENTA/.test(nq))cond(x=>x.venta,'a la venta');
  if(/CHIP/.test(nq))cond(x=>/SIN CHIP|NO TIENEN CHIP/.test(nq)?!x.chip:!!x.chip,/SIN CHIP|NO TIENEN CHIP/.test(nq)?'sin chip':'con chip');
  if(/FOTO/.test(nq))cond(x=>/SIN FOTO|NO TIENEN FOTO/.test(nq)?!x.fotos?.length:!!x.fotos?.length,/SIN FOTO|NO TIENEN FOTO/.test(nq)?'sin foto':'con foto');
  if(/PRENAD/.test(nq))cond(x=>S.servicios.some(s=>norm(s.madre)===norm(x.nombre)&&s.estado==='Preñada'),'preñadas');
  if(/\bVIV|ACTIV|EN LA MANADA/.test(nq))cond(x=>x.estado==='Activo','vivos');else if(/MUERT/.test(nq))cond(x=>x.estado==='Muerto','muertos');else if(/VENDID/.test(nq))cond(x=>x.estado==='Vendido','vendidos');
  const e=x=>x.nac?diff(hoy(),x.nac)/365.25:null,mA=nq.match(/(MAYORES DE|MAS DE|MENORES DE|MENOS DE|DE) (\d{1,2}) ANOS/);
  if(mA){const n=+mA[2];if(/MAYOR|MAS/.test(mA[1]))cond(x=>e(x)!==null&&e(x)>n,`de más de ${plural(n,'año','años')}`);else if(/MENOR|MENOS/.test(mA[1]))cond(x=>e(x)!==null&&e(x)<n,`de menos de ${plural(n,'año','años')}`);else cond(x=>e(x)!==null&&Math.floor(e(x))===n,`de ${plural(n,'año','años')}`)}
  const orden=/POR EDAD|MAS VIEJ|MAS JOVEN|MAS CHIC|DEL MAS/.test(nq)?'edad':/POR NOMBRE|ALFABETIC|POR LETRA/.test(nq)?'nombre':/POR CATEGORIA/.test(nq)?'cat':null;
  if(!conds.length&&!orden)return null;
  let l=L.filter(x=>conds.every(f=>f(x))!==fuera0||!conds.length);
  if(orden==='edad'){const joven=/JOVEN|CHIC|MENOR/.test(nq);l=[...l.filter(x=>x.nac).sort((a,b)=>joven?b.nac.localeCompare(a.nac):a.nac.localeCompare(b.nac)),...l.filter(x=>!x.nac)]}
  else if(orden==='nombre')l=[...l].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));else if(orden==='cat')l=[...l].sort(sortCab);
  const que=desc.join(', '),ord=orden?`ordenados por ${orden==='edad'?(/JOVEN|CHIC|MENOR/.test(nq)?'edad, del más joven al más viejo':'edad, del más viejo al más joven'):orden==='nombre'?'nombre':'categoría'}${orden==='edad'&&l.some(x=>!x.nac)?' (los que no tienen fecha, al final)':''}`:'';
  const txt=!conds.length?`Los mismos ${L.length}, ${ord}.`:fuera0?`De esos ${L.length}, sin los ${que} quedan ${l.length}.`:`De esos ${L.length}, ${l.length||'ninguno'} ${que}.`;
  const r={txt:txt+(conds.length&&ord?' '+ord.charAt(0).toUpperCase()+ord.slice(1)+'.':''),cards:l,sug:[]};
  r.meta=Object.fromEntries(l.map(x=>[x.id,[sexoTxt(x),x.pelaje,x.nac?edadTxt(x):'',x.estado==='Activo'?x.categoria:bajaTxt(x),x.lugar].filter(Boolean).join(' · ')]));
  return r}

/* ---------- Señas de las observaciones ----------
   "cara blanca", "estrella en la frente", "patas blancas", "cuatro patas blancas", "machos cara blanca", "¿la Pipa tiene pata blanca?".
   Busca en todas las observaciones de cada caballo: la de la ficha, la de la baja, las de sus servicios y las de sus eventos.
   Cualquier otra palabra ("bozal azul", "rengo") se busca si se nombran las observaciones ("¿quién tiene anotado rengo?",
   "observaciones de la China") o si la pregunta no se entendió por otro lado. */
const sinTildes=t=>norm(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function obsPartes(x){const p=[];if(x.obs)p.push(['Ficha',x.obs]);if(x.bajaObs)p.push(['Baja',x.bajaObs]);
  for(const s of S.servicios)if(norm(s.madre)===norm(x.nombre)&&s.obs)p.push(['Servicio'+(s.fecha?' '+fmt(s.fecha):''),s.obs]);
  // de los eventos: lo anotado a mano (no las notas de dónde salió el dato) y el detalle de lesiones, enfermedades, veterinario…
  const ev=S.eventos.filter(e=>e.caballoId===x.id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  for(const e of ev){const o=/^Del (informe|chat)/.test(e.obs||'')?'':e.obs,d=e.detalle&&e.detalle!==e.tipo&&(e.detalle.includes(': ')||!RUTINA.has(e.tipo))?e.detalle:'';
    const t=[d,o].filter(Boolean).join(' · ');if(t)p.push([fmt(e.fecha)+' · '+e.tipo,t])}
  return p}
const RUTINA=new Set(['Práctica','Torneo','Desvasada','Herrada','Desherrada','Desparasitación','Muelas','Servicio','Movimiento','Parición','Anemia','Castración']);
const SENAS=[{re:/CARA ?BLANCA|CARABLANCA|MALACARA|BLANCO EN LA CARA/,n:'cara blanca'},{re:/ESTRELLA|LUCERO/,n:'estrella en la frente'},
  {re:/PATAS? BLANCAS?|MANOS? BLANCAS?|CALZAD|MEDIAS? BLANCAS?/,n:'patas blancas',patas:true}];
const NUM_PATAS={UNA:1,UN:1,DOS:2,TRES:3,CUATRO:4,'1':1,'2':2,'3':3,'4':4};
const patasBlancas=t=>{const m=t.match(/\b(UNA|UN|DOS|TRES|CUATRO|[1-4]) (PATAS?|MANOS?)/);return m?NUM_PATAS[m[1]]:/\b(PATA|MANO) BLANCA\b/.test(t)?1:null};
const SIN_SENA=new Set('QUE QUIEN QUIENES CUAL CUALES TIENE TIENEN TENGAN CON LOS LAS DEL TODOS TODAS HAY CABALLO CABALLOS YEGUA YEGUAS MACHO MACHOS HEMBRA HEMBRAS POTRANCA POTRANCAS MOSTRAME DECIME PASAME DAME SON ESTAN LISTA ALGUN ALGUNO ALGUNA CUANTOS CUANTAS BUSCA BUSCAME BUSCAR SEÑA SEÑAS SENA SENAS OBSERVACION OBSERVACIONES DICE DICEN FICHA ANOTADO ANOTADA ANOTADOS ANOTACION ANOTACIONES ESCRITO FIGURA ALGO PALABRA'.split(' '));
function buscarSenas(q,generico){const nq=' '+sinTildes(q)+' ',PART=new Map(),partes=x=>{if(!PART.has(x.id))PART.set(x.id,obsPartes(x));return PART.get(x.id)},ob=x=>partes(x).map(p=>sinTildes(p[1])).join(' · ');
  const pide=/OBSERVACION|\bOBS\b|ANOTAD|ANOTACION|ESCRITO|QUE DICE|DICEN|FIGURA/.test(nq);generico=generico||pide;
  const sn=SENAS.filter(x=>x.re.test(nq)),ent=quienes(q),c=/\b\d (PATAS?|MANOS?)\b/.test(nq)?null:ent.find(e=>e.c)?.c,np=sn.some(x=>x.patas)?(/PATAS BLANCAS|MANOS BLANCAS/.test(nq)&&!/\b(UNA|UN|DOS|TRES|CUATRO|[1-4]) (PATAS|MANOS)/.test(nq)?null:patasBlancas(nq)):null;
  const raiz=w=>w.replace(/(ES|S)$/,'').replace(/[AO]$/,'').slice(0,6),pels=[...new Set(S.caballos.map(x=>x.pelaje).filter(Boolean))];
  let pal=[];
  if(!sn.length){if(!generico||(c&&!pide))return null;
    const enNombre=c?sinTildes(c.nombre+' '+(c.apodo||'')).split(/[^A-Z0-9Ñ]+/):[];
    pal=nq.trim().split(/[^A-Z0-9Ñ]+/).filter(w=>w.length>=4&&!SIN_SENA.has(w)&&!enNombre.includes(w)&&!CATS.some(k=>raiz(norm(k))===raiz(w))&&!pels.some(p=>raiz(norm(p.split(' ')[0]))===raiz(w)));
    // "observaciones de la China": todo lo anotado de ese caballo
    if(c&&!pal.length){const ps=partes(c);return{txt:ps.length?`Observaciones de ${c.nombre}: ${plural(ps.length,'anotación','anotaciones')}.`:`${c.nombre} no tiene observaciones cargadas.`,lista:ps.map(([d,t])=>`${d}: ${t}`),cards:[c],sug:[]}}
    if(!pal.length||(!c&&!S.caballos.some(x=>pal.every(w=>ob(x).split(/[^A-Z0-9Ñ]+/).some(o=>o.startsWith(raiz(w)))))))return pide&&pal.length?{txt:`No encontré "${pal.join(' ').toLowerCase()}" en las observaciones de ningún caballo.`,cards:[],sug:[]}:null}
  const obF=x=>sinTildes([x.obs,x.bajaObs].filter(Boolean).join(' · ')); // las señas, de la ficha (en un parto la seña es de la cría, no de la madre)
  const tiene0=x=>sn.length?sn.every(z=>z.re.test(' '+obF(x)+' ')&&(!z.patas||np===null||patasBlancas(' '+obF(x)+' ')===np)):pal.every(w=>ob(x).split(/[^A-Z0-9Ñ]+/).some(o=>o.startsWith(raiz(w))));
  const que=sn.length?sn.map(z=>z.patas&&np?(np===1?'una pata blanca':np===4?'cuatro patas blancas':np+' patas blancas'):z.n).join(' y '):pal.join(' ').toLowerCase();
  // un número que es de varios ("la 21"): contesta por cada uno
  const vs=/\b\d (PATAS?|MANOS?)\b/.test(nq)?[]:ent.find(e=>e.varios)?.varios||[];
  if(!c&&vs.length&&sn.length){return{txt:`Hay ${vs.length} con ese número. ¿Tienen ${que}? `+vs.map(x=>`${x.nombre}: ${tiene0(x)?'sí':'no'}`).join(' · ')+'.',lista:vs.filter(x=>x.obs).map(x=>`${x.nombre}: ${x.obs}`),cards:vs,sug:[]}}
  // un caballo: sí o no
  const donde=x=>{const ps=partes(x),h=ps.filter(([,t])=>sn.length?sn.some(z=>z.re.test(' '+sinTildes(t)+' ')):pal.some(w=>sinTildes(t).split(/[^A-Z0-9Ñ]+/).some(o=>o.startsWith(raiz(w)))));return(h.length?h:ps).map(([d,t])=>d==='Ficha'?t:`${d}: ${t}`).join(' · ')};
  if(c){const si=tiene0(c),ps=partes(c);return{txt:si?(sn.length?`Sí, ${c.nombre} tiene ${que}`:`Sí, en las observaciones de ${c.nombre} figura "${que}"`)+` ("${donde(c)}").`:`En las observaciones de ${c.nombre} no figura ${que}${ps.length?` (dice: "${ps.map(p=>p[1]).join(' · ').slice(0,200)}")`:' (no tiene observaciones cargadas)'}.`,cards:[c],sug:[]}}
  // filtros que acompañan: sexo, categoría, pelaje
  const sx=/HEMBRA|YEGUA|POTRANCA/.test(nq)?'Hembra':/\bMACHO/.test(nq)?'Macho':null,cat=CATS.find(k=>new RegExp('\\b'+norm(k).slice(0,6)).test(nq));
  const pel=pels.find(p=>nq.split(/[^A-Z0-9Ñ]+/).some(w=>w.length>=4&&raiz(w)===raiz(norm(p.split(' ')[0]))&&!/^(BAYA|COLORADA)$/.test(w)));
  let l=S.caballos.filter(tiene0);if(sx)l=l.filter(x=>x.sexo===sx);if(cat)l=l.filter(x=>x.categoria===cat);if(pel)l=l.filter(x=>x.pelaje&&raiz(norm(x.pelaje.split(' ')[0]))===raiz(norm(pel.split(' ')[0])));
  const viv=l.filter(x=>x.estado==='Activo').sort(sortCab),otros=l.filter(x=>x.estado!=='Activo');
  const desc=[sx==='Hembra'?'hembras':sx==='Macho'?'machos':'',cat?'en '+cat:'',pel?pel.toLowerCase():''].filter(Boolean).join(', ');
  const r={txt:viv.length||otros.length?`Con ${sn.length?que:'"'+que+'" en las observaciones'}${desc?' ('+desc+')':''}: ${viv.length?viv.length+' en la manada':'ninguno en la manada'}${otros.length?`${viv.length?' y':';'} ${otros.length} que ya no ${otros.length>1?'están':'está'}`:''}.`:`No hay ${desc?desc+' ':''}con ${que} en las observaciones.`+(sn.length?' Las señas salen de lo que dice "Observaciones / señas" en cada ficha.':''),cards:[...viv,...otros],sug:[]};
  r.meta=Object.fromEntries(r.cards.map(x=>[x.id,[donde(x).slice(0,140),x.estado==='Activo'?x.categoria:bajaTxt(x)].filter(Boolean).join(' · ')]));return r}

/* ---------- 1) Preguntas de uso: cargar, qué significa, afuera, notas, polo de un caballo, edad en meses,
   comparar años, porcentajes y promedios, rankings y rangos de fechas ---------- */
function respuestasDeUso(q0,qc){const r={txt:'',cards:[],sug:[]},nq=norm(qc),tAct=+S.config.temporada||new Date().getFullYear();
  const ent=quienes(qc),cs=ent.filter(e=>e.c).map(e=>e.c),c=cs[0],pad=ent.find(e=>e.p)?.p;
  // pedirle que cargue algo: no carga, dice cómo y abre la ficha
  if(CARGAR.test(nq.replace(/^(CHE|DALE|BUENO|HOLA|OK)\s+/,''))){const h=AYUDA_APP.find(([re])=>re.test(nq));
    r.txt='Yo solo leo los datos, no cargo nada (así nada se carga por error ni sin que lo veas). '+(h?h[1]:'Se carga desde la ficha del caballo con "+ Evento" o "Editar datos".')+(c?` Te dejo la ficha de ${c.nombre} abajo.`:'');const vs=ent.find(e=>e.varios)?.varios||[];r.cards=cs.length?cs:vs;if(!c&&vs.length)r.txt+=` Hay ${vs.length} con ese número: ${vs.map(x=>x.nombre).join(', ')}.`;return r}
  // por qué un caballo está en rojo o amarillo
  if(c&&cs.length===1&&tiene(nq,/ROJO|AMARILL|ATRASAD|VENCID|POR QUE (ESTA|SALE|APARECE)/)){const ver={'Desparasitación':'desparasitación','Desvasada':'desvase','Herrada':'herrada','Muelas':'muelas'};
    const mal=['Desparasitación','Desvasada','Herrada','Muelas'].map(t=>[t,estadoSan(c,t)]).filter(([t,e])=>!e.no&&(e.st==='bad'||e.st==='warn'));
    const rep0=c.categoria==='Madres'?estadoRepro(servUltimo(c.nombre)):null;const pr=rep0&&(rep0.cpill==='p-bad'||rep0.cpill==='p-warn')?`${rep0.txt.toLowerCase()}, ${rep0.cuenta.charAt(0).toLowerCase()+rep0.cuenta.slice(1)}`.replace(/ d$/,' días'):'';
    r.txt=mal.length||pr?`${c.nombre}: `+[...mal.map(([t,e])=>`${ver[t]} ${e.st==='bad'?'vencida (en rojo) desde el '+fmt(e.p):'vence el '+fmt(e.p)+' (en amarillo)'}`),pr].filter(Boolean).join(' · ')+'.':`${c.nombre} no tiene nada vencido ni por vencer.`+(c.categoria==='Madres'&&rep0?` Preñez: ${rep0.txt}${rep0.cuenta?' · '+rep0.cuenta:''}.`:'');r.cards=[c];return r}
  // qué significa algo de la app
  if(tiene(nq,/QUE (SIGNIFICA|QUIERE DECIR|ES|SON|ONDA)|PARA QUE (ES|SIRVE|SON)|^SIGNIFICADO/)&&!c&&!pad){const g=GLOSARIO.find(([re])=>re.test(nq));if(g&&!tiene(nq,/NUMERACION|CAMADA/)){r.txt=g[1];return r}}
  // los que están afuera
  if(tiene(nq,/\bAFUERA\b|FUERA DE LA (MANADA|QUINTA)|EN OTRO (LADO|CAMPO)/)&&!c){let l=S.caballos.filter(x=>x.estado==='Activo'&&fuera(x));if(tiene(nq,/VENTA/))l=l.filter(x=>x.venta||/VENTA/.test(norm(x.lugar)));
    r.txt=l.length?`${tiene(nq,/CUANT/)?'Hay ':''}${plural(l.length,'caballo','caballos')} afuera${tiene(nq,/VENTA/)?' a la venta':''}: ${l.map(x=>x.nombre).join(', ')}. No cuentan en la manada ni en la sanidad.`:`No hay caballos afuera${tiene(nq,/VENTA/)?' a la venta':''}.`;
    r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,[x.lugar,x.categoria,x.venta?'a la venta'+(x.precio?' '+x.precio:''):''].filter(Boolean).join(' · ')]));return r}
  // notas: "¿qué anoté de la China?", "notas sobre el herrero"
  if(tiene(nq,/\bNOTAS?\b|ANOTE|ANOTAMOS|ANOTASTE|ANOTADO/)&&(c||/(SOBRE|DE|DEL|CON) [A-Z]{4,}/.test(nq.replace(/\b(LAS|LOS|LA|EL)\b/g,'')))){
    let pal;if(c)pal=[norm(c.nombre),...(c.apodo?[norm(c.apodo)]:[])];else{const m=nq.replace(/\b(LAS|LOS|LA|EL|UNA|UN)\b/g,' ').replace(/\s+/g,' ').match(/(SOBRE|DE|DEL|CON) (.+)$/);pal=m?m[2].split(' ').filter(w=>w.length>=4&&!/^(NOTA|NOTAS|ANOTE|PENDIENTE|PENDIENTES)$/.test(w)):[]}
    if(pal.length){const txt=n=>norm((n.titulo||'')+' '+(n.texto||''));const l=S.notas.filter(n=>c?pal.some(p=>txt(n).includes(p)||p.split(' ').filter(w=>w.length>=4&&!/^\d+$/.test(w)).every(w=>txt(n).includes(w))):pal.some(p=>txt(n).includes(p.slice(0,Math.max(4,p.length-2))))).sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
      const que=c?c.nombre:pal.join(' ').toLowerCase();r.txt=l.length?`${plural(l.length,'nota','notas')} sobre ${que}:`:`No hay notas sobre ${que}.`;r.lista=l.slice(0,12).map(n=>`${n.fecha?fmt(n.fecha)+' · ':''}${n.titulo}${n.texto?': '+n.texto:''}${n.estado==='Listo'?' (lista)':''}`);r.cards=c?[c]:[];return r}}
  // torneos y prácticas de un caballo
  if(c&&cs.length===1&&tiene(nq,/TORNEO|PRACTICA|JUGO|JUEGA|JUGANDO/)&&tiene(nq,/EN QUE|CUALES|QUE TORNEOS|ULTIM|CUANDO|LISTA|FECHAS|DETALLE/)){
    const ev=S.eventos.filter(e=>e.caballoId===c.id&&['Práctica','Torneo'].includes(e.tipo)).sort((a,b)=>b.fecha.localeCompare(a.fecha)),tor=ev.filter(e=>e.tipo==='Torneo'),pra=ev.filter(e=>e.tipo==='Práctica');
    if(tiene(nq,/ULTIM|CUANDO/)&&!tiene(nq,/EN QUE TORNEOS|CUALES/)){const quiero=tiene(nq,/TORNEO/)?tor:tiene(nq,/PRACTICA/)?pra:ev;const u=quiero[0];
      r.txt=u?`${tiene(nq,/TORNEO/)?'El último torneo de '+c.nombre+':':tiene(nq,/PRACTICA/)?'La última práctica de '+c.nombre+':':c.nombre+' jugó por última vez el'} ${fmt(u.fecha)} (hace ${plural(diff(hoy(),u.fecha),'día','días')})${u.obs?' · '+u.obs:''}.`:`${c.nombre} no tiene ${tiene(nq,/TORNEO/)?'torneos':tiene(nq,/PRACTICA/)?'prácticas':'prácticas ni torneos'} cargados con fecha.`;r.cards=[c];return r}
    const l=tiene(nq,/PRACTICA/)&&!tiene(nq,/TORNEO/)?pra:tor;const prev=tiene(nq,/PRACTICA/)&&!tiene(nq,/TORNEO/)?+c.practicasPrevias||0:+c.torneosPrevios||0;
    r.txt=l.length?`${c.nombre}: ${plural(l.length,l===pra?'práctica cargada':'torneo cargado',l===pra?'prácticas cargadas':'torneos cargados')} con fecha${prev?` (y ${prev} de antes, sin fecha)`:''}.`:`${c.nombre} no tiene ${l===pra?'prácticas':'torneos'} cargados con fecha${prev?` (tiene ${prev} de antes, sin fecha)`:''}.`;
    r.lista=l.slice(0,15).map(e=>`${fmt(e.fecha)} · ${e.detalle||e.tipo}${e.obs?' · '+e.obs:''}`);r.cards=[c];return r}
  // "¿la Blusera tiene 3 años?"
  {const m=nq.match(/\b(TIENE|TENDRA|ES DE) (\d{1,2}) A[NÑ]OS?\b/);if(c&&cs.length===1&&m){const n=+m[2];
    if(!c.nac){r.txt=`De ${c.nombre} no se sabe la edad (no tiene fecha de nacimiento cargada).`;r.cards=[c];return r}
    const a=edad(c.nac);r.txt=`${a===n?'Sí':'No'}, ${c.nombre} tiene ${edadTxt(c)} (nació el ${fmt(c.nac)}).`;r.cards=[c];return r}}
  // edad en meses de los chicos
  if(c&&cs.length===1&&tiene(nq,/EDAD|ANOS TIENE|MESES TIENE|CUANTOS MESES|QUE TAN (CHICO|CHICA|GRANDE)/)&&c.nac&&diff(hoy(),c.nac)<3*365.25){const d=diff(hoy(),c.nac),m=Math.floor(d/30.44),a=Math.floor(m/12),mm=m%12;
    const t=m<1?plural(d,'día','días'):a?`${plural(a,'año','años')}${mm?' y '+plural(mm,'mes','meses'):''} (${m} meses)`:plural(m,'mes','meses');
    r.txt=`${c.nombre} nació el ${fmt(c.nac)}: tiene ${t}.`;r.cards=[c];return r}
  // comparar años: "¿cuántos nacieron en 2025 contra 2026?", "¿se gastó más en herrero este año o el pasado?"
  {let ys=[...new Set((nq.match(/\b20\d\d\b/g)||[]).map(Number))];const y0=+hoy().slice(0,4);
    if(ys.length<2&&tiene(nq,/ESTE ANO/)&&tiene(nq,/(ANO )?PASADO|ANTERIOR/))ys=[y0-1,y0];
    if(ys.length===1&&tiene(nq,/CONTRA|VS|COMPARAD|COMPARA|O EL PASADO|QUE EL PASADO/))ys=[ys[0]-1,ys[0]];
    if(ys.length>=2&&tiene(nq,/NACI|PARTO|PARIERON|POTRILL|CRIA|CAMADA|HERR|DESVAS|GAST|PLATA|VEND|VENTA|MURI|MUERT|BAJA|PRENAD|SERVICIO|EVENTO|DESPARAS|PRACTICA|TORNEO|JUG/)){ys=ys.sort().slice(-3);let fila;
      if(tiene(nq,/HERR|DESVAS|GAST|PLATA/)&&!tiene(nq,/VEND|VENTA/))fila=y=>{const l=evHerrero().filter(e=>e.fecha.startsWith(String(y)));return[costoHerrero(l),`${$ar(costoHerrero(l))} (${l.length} trabajos)`]};
      else if(tiene(nq,/VEND|VENTA/))fila=y=>{const l=S.caballos.filter(x=>x.estado==='Vendido'&&(x.bajaFecha||'').startsWith(String(y)));return[l.length,plural(l.length,'venta','ventas')]};
      else if(tiene(nq,/MURI|MUERT/))fila=y=>{const l=S.caballos.filter(x=>x.estado==='Muerto'&&(x.bajaFecha||'').startsWith(String(y)));return[l.length,plural(l.length,'muerte','muertes')]};
      else if(tiene(nq,/BAJA/))fila=y=>{const l=S.caballos.filter(x=>x.estado!=='Activo'&&(x.bajaFecha||'').startsWith(String(y)));return[l.length,plural(l.length,'baja','bajas')]};
      else if(tiene(nq,/PRENAD|SERVICIO/))fila=y=>{const l=S.servicios.filter(s=>+s.temporada===y);const p=l.filter(s=>['Preñada','Parida'].includes(s.estado)).length;return[p,`${plural(l.length,'servicio','servicios')}, ${p} preñadas`]};
      else if(tiene(nq,/PRACTICA|TORNEO|JUG/))fila=y=>{const l=S.eventos.filter(e=>['Práctica','Torneo'].includes(e.tipo)&&e.fecha.startsWith(String(y)));return[l.length,`${l.filter(e=>e.tipo==='Práctica').length} prácticas y ${l.filter(e=>e.tipo==='Torneo').length} torneos`]};
      else if(tiene(nq,/DESPARAS/))fila=y=>{const l=S.eventos.filter(e=>e.tipo==='Desparasitación'&&e.fecha.startsWith(String(y)));return[l.length,plural(l.length,'desparasitación','desparasitaciones')]};
      else if(tiene(nq,/EVENTO/))fila=y=>{const l=S.eventos.filter(e=>e.fecha.startsWith(String(y)));return[l.length,plural(l.length,'evento','eventos')]};
      else fila=y=>{const l=S.caballos.filter(x=>+x.camada===y);const v=l.filter(x=>x.estado!=='Muerto'||x.bajaFecha!==x.nac).length;return[l.length,`${plural(l.length,'potrillo','potrillos')} (${l.filter(x=>x.sexo==='Macho').length} machos, ${l.filter(x=>x.sexo==='Hembra').length} hembras)`]};
      const fs=ys.map(y=>[y,...fila(y)]);const max=Math.max(...fs.map(f=>f[1])),gan=fs.filter(f=>f[1]===max);
      r.txt=fs.map(f=>`${f[0]}: ${f[2]}`).join(' · ')+'.'+(fs.every(f=>f[1]===fs[0][1])?' Igual.':gan.length===1&&max>0?` Más en ${gan[0][0]}.`:'')+(ys.includes(y0)?` (${y0} va hasta hoy.)`:'');return r}}
  // porcentajes y promedios
  if(tiene(nq,/PORCENTAJE|%|POR CIENTO|TASA|EFECTIVIDAD/)&&tiene(nq,/PRENE|PRENAD|SERVICIO|PREN/)){const y=+((nq.match(/\b(20\d\d)\b/)||[])[1]||tAct),l=S.servicios.filter(s=>+s.temporada===y),con=l.filter(s=>s.estado!=='Servida (sin tacto)'),p=con.filter(s=>['Preñada','Parida'].includes(s.estado)||s.estado==='Abortó');
    r.txt=con.length?`Temporada ${y}: ${p.length} de ${plural(con.length,'servicio con resultado','servicios con resultado')} quedaron preñadas = ${Math.round(p.length/con.length*100)}%.${l.length>con.length?` Hay ${l.length-con.length} sin tacto todavía.`:''}`:`No hay servicios con resultado en la temporada ${y}.`;return r}
  if(tiene(nq,/MACHOS Y HEMBRAS|HEMBRAS Y MACHOS|CUANTOS MACHOS|CUANTAS HEMBRAS/)&&tiene(nq,/CAMADA|NACI|POTRILL|POR ANO|CADA ANO/)){const ys=[...new Set(S.caballos.map(x=>+x.camada).filter(Boolean))].sort((a,b)=>b-a);const y1=(nq.match(/\b(20\d\d)\b/)||[])[1];
    const lin=y=>{const l=S.caballos.filter(x=>+x.camada===y);return`${y}: ${plural(l.filter(x=>x.sexo==='Macho').length,'macho','machos')} y ${plural(l.filter(x=>x.sexo==='Hembra').length,'hembra','hembras')}`};
    r.txt=y1?lin(+y1)+'.':'Por camada:';if(!y1)r.lista=ys.map(lin);return r}
  if(tiene(nq,/PROMEDIO|EN PROMEDIO|MEDIA/)&&tiene(nq,/POTRILL|HIJOS|CRIAS/)&&tiene(nq,/MADRE|YEGUA|POR MADRE|CADA MADRE/)){const m=activos().filter(x=>x.categoria==='Madres'),hs=m.map(x=>hijosDe(x.nombre).length),t=hs.reduce((a,b)=>a+b,0);
    r.txt=m.length?`Las ${m.length} madres tienen ${t} crías cargadas: ${(t/m.length).toLocaleString('es-AR',{maximumFractionDigits:1})} por madre en promedio. La que más: ${m[hs.indexOf(Math.max(...hs))].nombre} (${Math.max(...hs)}).`:'No hay madres cargadas.';
    r.cards=m.slice().sort((a,b)=>hijosDe(b.nombre).length-hijosDe(a.nombre).length);r.meta=Object.fromEntries(m.map(x=>[x.id,plural(hijosDe(x.nombre).length,'cría','crías')]));return r}
  if(tiene(nq,/PROMEDIO/)&&tiene(nq,/HERR|DESVAS/)&&tiene(nq,/MES|CABALLO/)){const y=+((nq.match(/\b(20\d\d)\b/)||[])[1]||hoy().slice(0,4)),l=evHerrero().filter(e=>e.fecha.startsWith(String(y))),meses=y===+hoy().slice(0,4)?+hoy().slice(5,7):12,cab=new Set(l.map(e=>e.caballoId)).size;
    r.txt=l.length?`Herrero ${y}: ${$ar(costoHerrero(l))} en total, ${$ar(costoHerrero(l)/meses)} por mes en promedio${cab?` y ${$ar(costoHerrero(l)/cab)} por caballo (${cab} caballos)`:''}.`:`No hay herrero cargado en ${y}.`;return r}
  // rankings por período y herrero por mes
  const rg=rangoFechas(qc)||(()=>{const mi=MESES_N.findIndex(m=>new RegExp('\\b'+m+'\\b').test(nq));if(mi>=0){const y=+((nq.match(/\b(20\d\d)\b/)||[])[1]||hoy().slice(0,4)),d=`${y}-${String(mi+1).padStart(2,'0')}-01`;return{desde:d,hasta:finMes(d),nombre:MESES_N[mi].toLowerCase()+' '+y}}
    if(tiene(nq,/ESTE MES/)){const d=hoy().slice(0,8)+'01';return{desde:d,hasta:finMes(d),nombre:'este mes'}}if(tiene(nq,/MES PASADO/)){const d=addDays(hoy().slice(0,8)+'01',-1);return{desde:d.slice(0,8)+'01',hasta:d,nombre:'el mes pasado'}}
    if(tiene(nq,/ESTA SEMANA/))return{desde:addDays(hoy(),-6),hasta:hoy(),nombre:'esta semana'};return null})();
  const dentro=e=>!rg||(e.fecha>=rg.desde&&e.fecha<=rg.hasta);
  if(tiene(nq,/HERR|DESVAS|GAST/)&&tiene(nq,/POR MES|CADA MES|MES A MES|MENSUAL/)){const y=+((nq.match(/\b(20\d\d)\b/)||[])[1]||hoy().slice(0,4)),l=evHerrero().filter(e=>e.fecha.startsWith(String(y))),por={};for(const e of l){const k=e.fecha.slice(5,7);(por[k]=por[k]||[]).push(e)}
    r.txt=l.length?`Herrero ${y} por mes (total ${$ar(costoHerrero(l))}):`:`No hay herrero cargado en ${y}.`;r.lista=Object.keys(por).sort().map(k=>`${MESES_N[+k-1].charAt(0)+MESES_N[+k-1].slice(1).toLowerCase()}: ${$ar(costoHerrero(por[k]))} (${por[k].filter(e=>e.tipo==='Desvasada').length} desvases, ${por[k].filter(e=>e.tipo==='Herrada').length} herradas)`);return r}
  if(!c&&tiene(nq,/(EN )?QUE CABALLO|QUIEN|CUAL/)&&tiene(nq,/MAS/)&&tiene(nq,/HERR|DESVAS|GAST/)){const l=evHerrero().filter(dentro),por={};for(const e of l)(por[e.caballoId]=por[e.caballoId]||[]).push(e);
    const top=Object.entries(por).map(([id,v])=>[byId(id),costoHerrero(v),v.length]).filter(x=>x[0]).sort((a,b)=>b[1]-a[1]).slice(0,10);
    r.txt=top.length?`${rg?'En '+rg.nombre.replace(/^en /,'')+', e':'E'}l que más gastó de herrero: ${top[0][0].nombre} con ${$ar(top[0][1])} (${plural(top[0][2],'trabajo','trabajos')}).`.replace('En este mes','Este mes').replace('En esta semana','Esta semana').replace('En el mes pasado','El mes pasado').replace('En este año','Este año').replace('En el año pasado','El año pasado'):`No hay herrero cargado${rg?' '+rg.nombre:''}.`;
    r.cards=top.map(x=>x[0]);r.meta=Object.fromEntries(top.map(x=>[x[0].id,`${$ar(x[1])} · ${plural(x[2],'trabajo','trabajos')}`]));return r}
  if(!c&&rg&&tiene(nq,/JUGO MAS|JUGARON MAS|MAS (PRACTICAS|TORNEOS|JUGO)|QUIEN JUGO|QUIENES JUGARON|CUANTO JUG|RANKING/)){const tip=tiene(nq,/TORNEO/)&&!tiene(nq,/PRACTICA/)?['Torneo']:tiene(nq,/PRACTICA/)&&!tiene(nq,/TORNEO/)?['Práctica']:['Práctica','Torneo'];
    const l=S.eventos.filter(e=>tip.includes(e.tipo)&&dentro(e)),por={};for(const e of l)(por[e.caballoId]=por[e.caballoId]||[]).push(e);
    const top=Object.entries(por).map(([id,v])=>[byId(id),v.length,v.filter(e=>e.tipo==='Torneo').length]).filter(x=>x[0]).sort((a,b)=>b[1]-a[1]).slice(0,10);
    r.txt=top.length?`${/^(este|esta|el|entre|desde|de |en )/.test(rg.nombre)?rg.nombre.charAt(0).toUpperCase()+rg.nombre.slice(1):'En '+rg.nombre} jugó más ${top[0][0].nombre}: ${top[0][1]} (${plural(top[0][1]-top[0][2],'práctica','prácticas')} y ${plural(top[0][2],'torneo','torneos')}). ${plural(Object.keys(por).length,'caballo jugó','caballos jugaron')}${Object.keys(por).length>10?' (muestro 10)':''}.`.replace(/^En /,'En '):`No hay ${tip.length>1?'prácticas ni torneos':tip[0]==='Torneo'?'torneos':'prácticas'} cargados ${rg.nombre}.`;
    r.cards=top.map(x=>x[0]);r.meta=Object.fromEntries(top.map(x=>[x[0].id,`${x[1]-x[2]} prácticas · ${x[2]} torneos`]));return r}
  // rango de fechas (entre meses, desde, hasta, un año): eventos, bajas
  {const rr=rangoFechas(qc);if(rr&&!c&&!tiene(nq,/PARE|PARIR|PRENAD|NACIERON|NACIDOS|CAMADA|POTRILL|SERVICIO|ESTE ANO NACI|CUANTOS TIENE|EDAD/)){
    if(tiene(nq,/VENDI|MURI|MUERT|BAJA/)){const l=S.caballos.filter(x=>x.estado!=='Activo'&&x.bajaFecha>=rr.desde&&x.bajaFecha<=rr.hasta&&(!tiene(nq,/VENDI/)||x.estado==='Vendido')&&(!tiene(nq,/MURI|MUERT/)||x.estado==='Muerto'));
      r.txt=l.length?`${rr.nombre.charAt(0).toUpperCase()+rr.nombre.slice(1)}: ${plural(l.length,'baja','bajas')}.`:`${rr.nombre.charAt(0).toUpperCase()+rr.nombre.slice(1)} no hay bajas cargadas.`;r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,`${bajaTxt(x)}${x.bajaPrecio?' · '+x.bajaPrecio:''}`]));return r}
    if(tiene(nq,/HERR|DESVAS|GAST/)){const l=evHerrero().filter(e=>e.fecha>=rr.desde&&e.fecha<=rr.hasta);r.txt=`Herrero ${rr.nombre}: ${$ar(costoHerrero(l))} (${plural(l.filter(e=>e.tipo==='Desvasada').length,'desvase','desvases')} y ${plural(l.filter(e=>e.tipo==='Herrada').length,'herrada','herradas')}).`;return r}
    if(tiene(nq,/EVENTO|SE HIZO|PASO|HICIMOS|HICIERON|CARGO|MOVI|DESPARAS|VACUN|PRACTICA|TORNEO|^QUE /)){let ev=S.eventos.filter(e=>e.fecha>=rr.desde&&e.fecha<=rr.hasta);
      const tipos={MOVI:'Movimiento',DESPARAS:'Desparasitación',VACUN:'Vacuna',PRACTICA:'Práctica',TORNEO:'Torneo'};const t=Object.keys(tipos).find(k=>nq.includes(k));if(t)ev=ev.filter(e=>e.tipo===tipos[t]);ev.sort((a,b)=>b.fecha.localeCompare(a.fecha));
      const por={};for(const e of ev)por[e.tipo]=(por[e.tipo]||0)+1;const N=rr.nombre.charAt(0).toUpperCase()+rr.nombre.slice(1);
      r.txt=ev.length?`${N}: ${plural(ev.length,'evento','eventos')} — `+Object.entries(por).sort((a,b)=>b[1]-a[1]).map(([t,n])=>`${t} ${n}`).join(', ')+'.':`${N} no hay ${t?tipos[t].toLowerCase()+'s':'eventos'} cargados.`;
      r.lista=ev.slice(0,15).map(e=>`${fmt(e.fecha)} · ${byId(e.caballoId)?.nombre||e.caballo||''} · ${e.detalle||e.tipo}`);return r}}}
  return null}

/* ---------- 2) Cómo se hace, comparar dos caballos, sí o no, embriones, movimientos, nietos y sangre, plata,
   negaciones, un mes o "la semana que viene", y filtros (pelaje, edad, categoría, sexo, lugar, padre) ---------- */
function respuestasPorFiltro(q0,qc){const r={txt:'',cards:[],sug:[]};const tAct=+S.config.temporada||new Date().getFullYear();
  // cómo se hace algo en la app
  if(tiene(qc,/^(COMO|DONDE) (SE |HAGO |PUEDO |CARGO|AGREGO|DOY|PONGO|SUBO|MARCO|CAMBIO|BORRO|ANOTO|MUEVO|PASO|USO|SUMO|REGISTRO|INGRESO)|COMO (CARGO|AGREGO|DOY|PONGO|SUBO|MARCO|CAMBIO|ANOTO|MUEVO|PASO|USO|SUMO|REGISTRO|SE CARGA|SE HACE|HAGO PARA)/)){
    const h=AYUDA_APP.find(([re])=>tiene(qc,re));if(h){r.txt=h[1];return r}}
  const ent=quienes(qc),cs=ent.filter(e=>e.c).map(e=>e.c),c=cs[0],pad=ent.find(e=>e.p)?.p,resto=ent.resto||limpio(qc);
  // "el 41" que no es de nadie
  {const m=norm(qc).match(/\b(EL|LA|DEL|AL) (\d{1,3})\b(?! (ANOS|DIAS|MESES|SEMANAS|DE ))/);
    if(m&&!c&&!pad&&!ent.some(e=>e.varios)&&!S.caballos.some(x=>new RegExp('\\b'+m[2]+'\\b').test(x.nombre)||String(x.rp||'')===m[2])){r.txt=`No hay ningún caballo con el número ${m[2]}.`;return r}}
  // comparar dos caballos
  if(cs.length>=2&&tiene(qc,/MAS VIEJ|MAYOR|MAS GRANDE|MAS JOVEN|MENOR|MAS CHIC|JUGO MAS|MAS PRACTICAS|MAS TORNEOS|MAS HIJOS|MAS CRIAS/)){const [a,b]=cs;
    if(tiene(qc,/HIJOS|CRIAS/)){const ha=hijosDe(a.nombre).length,hb=hijosDe(b.nombre).length;r.txt=ha===hb?`Tienen las mismas crías cargadas: ${ha}.`:`${ha>hb?a.nombre:b.nombre} tiene más crías cargadas (${Math.max(ha,hb)} contra ${Math.min(ha,hb)}).`;r.cards=[a,b];return r}
    if(tiene(qc,/JUGO|PRACTICA|TORNEO/)){const pa=practicas(a)+torneos(a),pb=practicas(b)+torneos(b);r.txt=`${a.nombre}: ${plural(practicas(a),'práctica','prácticas')} y ${plural(torneos(a),'torneo','torneos')}. ${b.nombre}: ${plural(practicas(b),'práctica','prácticas')} y ${plural(torneos(b),'torneo','torneos')}. ${pa===pb?'Igual.':`Jugó más ${pa>pb?a.nombre:b.nombre}.`}`;r.cards=[a,b];return r}
    if(!a.nac||!b.nac){r.txt=`No puedo comparar: ${[a,b].filter(x=>!x.nac).map(x=>x.nombre).join(' y ')} no ${[a,b].filter(x=>!x.nac).length>1?'tienen':'tiene'} fecha de nacimiento cargada.`;r.cards=[a,b];return r}
    const viejo=a.nac<b.nac?a:b,joven=viejo===a?b:a;r.txt=a.nac===b.nac?`Nacieron el mismo día (${fmt(a.nac)}).`:`${tiene(qc,/JOVEN|MENOR|CHIC/)?joven.nombre+' es más joven':viejo.nombre+' es más vieja'} : ${viejo.nombre} nació el ${fmt(viejo.nac)} y ${joven.nombre} el ${fmt(joven.nac)}.`.replace(' :',':').replace('es más vieja',viejo.sexo==='Macho'?'es más viejo':'es más vieja');r.cards=[a,b];return r}
  // sí / no de un dato de un caballo
  if(c&&cs.length===1&&tiene(resto,/\b(ESTA|ES|TIENE|SIGUE|ANDA)\b/)&&!tiene(norm(qc).replace(/EN (MADRES|PADRILLOS)/,''),/PRENAD|HERRAD|SUELT|AGARRAD|CASTR|AL DIA|VACIA|DESPARAS|HIJ|PADRE|MADRE|HERMAN|PARE|PARIO/)){
    const n=c.nombre,lug=[...new Set(activos().map(x=>x.lugar).filter(Boolean))].find(l=>limpio(qc).includes(limpio(l))),cat=CATS.find(k=>tiene(resto,new RegExp('\\b'+norm(k).slice(0,6))))||(tiene(resto,/\bPOLO\b|JUGAND/)?'Jugadores':null);let t=null;
    if(tiene(resto,/VENTA/))t=c.venta?`Sí, ${n} está a la venta${c.precio?' ('+c.precio+')':''}.`:`No, ${n} no está a la venta.`;
    else if(tiene(resto,/CHIP/))t=c.chip?`Sí: chip ${c.chip}.`:`No, ${n} no tiene chip cargado.`;
    else if(tiene(resto,/FOTO/))t=c.fotos?.length?`Sí, ${n} tiene ${plural(c.fotos.length,'foto','fotos')}.`:`No, ${n} no tiene foto todavía.`;
    else if(lug)t=c.lugar===lug?`Sí, ${n} está en ${lug}.`:`No, ${n} está en ${c.lugar||'(sin lugar)'}.`;
    else if(tiene(resto,/MACHO|HEMBRA|YEGUA|POTRANCA|CABALLO\b/))t=c.sexo?`${n} es ${c.sexo==='Hembra'?'hembra':'macho'}.`:`De ${n} no está cargado el sexo.`;
    else if(tiene(resto,/VIV|MUERT/))t=c.estado==='Activo'?`Sí, ${n} está viva/o y en la manada.`:`${n}: ${bajaTxt(c)}.`;
    else if(cat)t=c.categoria===cat?`Sí, ${n} está en ${cat}.`:`No, ${n} está en ${c.categoria}.`;
    else if(tiene(resto,/EMBRION/))t=/EMBRI/.test(norm(c.obs||''))?`Sí: ${c.obs}.`:`No figura como embrión.`;
    if(t){r.txt=t;r.cards=[c];return r}}
  // embriones y receptoras
  if(tiene(qc,/EMBRION|QUIEN LO PARIO|QUIEN LA PARIO/)||(c&&tiene(qc,/RECEPTORA/))){
    if(c){const sv=S.servicios.filter(s=>/EMBRI/.test(norm(s.tipo||''))&&norm(s.madre)===norm(c.nombre));r.txt=/EMBRI/.test(norm(c.obs||''))?`${c.nombre}: ${c.obs}.`:sv.length?`${c.nombre} tiene ${plural(sv.length,'servicio','servicios')} por embrión.`:`${c.nombre} no figura como embrión ni como receptora.`;r.cards=[c];return r}
    const l=S.caballos.filter(x=>/EMBRI|LO PARIO|LA PARIO|RECEPTORA/.test(norm(x.obs||''))||x.categoria==='Receptoras'),sv=S.servicios.filter(s=>/EMBRI/.test(norm(s.tipo||'')));
    r.txt=l.length||sv.length?`Embriones y receptoras cargados: ${plural(l.length,'caballo','caballos')}${sv.length?` y ${plural(sv.length,'servicio','servicios')} por embrión`:''}.`:'No hay embriones ni receptoras cargados.';r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,(x.obs||x.categoria).slice(0,80)]));return r}
  // movimientos de un caballo
  if(c&&tiene(qc,/CUANDO PASO|PASO A|SE MOVIO|MOVIMIENTO|HISTORIAL DE (LUGAR|CATEGORIA)|DONDE ESTUVO|DESDE CUANDO ESTA EN|CUANDO LO AGARRARON|CUANDO LA AGARRARON|CUANDO LO SOLTARON|CUANDO LA SOLTARON/)){
    const ev=S.eventos.filter(e=>e.caballoId===c.id&&e.tipo==='Movimiento').sort((a,b)=>b.fecha.localeCompare(a.fecha));
    r.txt=ev.length?`Movimientos de ${c.nombre}: ${plural(ev.length,'cargado','cargados')}. Hoy está en ${c.categoria}${c.lugar?', '+c.lugar:''}.`:`${c.nombre} no tiene movimientos cargados. Hoy está en ${c.categoria}${c.lugar?', '+c.lugar:''}.`;r.lista=ev.slice(0,10).map(e=>`${fmt(e.fecha)} · ${e.detalle}${e.obs?' · '+e.obs:''}`);r.cards=[c];return r}
  // nietos y descendientes
  if((c||pad)&&tiene(qc,/NIETO|DESCENDIENT|TODA SU (FAMILIA|DESCENDENCIA)/)){const nom=c?c.nombre:pad.nombre,h1=hijosDe(nom),h2=h1.flatMap(h=>hijosDe(h.nombre));
    if(tiene(qc,/NIETO/)){r.txt=h2.length?`${nom} tiene ${plural(h2.length,'nieto cargado','nietos cargados')} (${h2.filter(x=>x.estado==='Activo').length} en la manada).`:`${nom} no tiene nietos cargados.`;r.cards=h2.sort(ordenHijos);r.meta=Object.fromEntries(h2.map(x=>[x.id,lineaCab(x)+' · de '+(norm(x.madre)&&h1.some(h=>norm(h.nombre)===norm(x.madre))?x.madre:x.padre)]));return r}
    const todos=[],ver=new Set(),ir=n=>{for(const h of hijosDe(n))if(!ver.has(h.id)){ver.add(h.id);todos.push(h);ir(h.nombre)}};ir(nom);
    r.txt=`Descendientes de ${nom} cargados: ${todos.length} (${todos.filter(x=>x.estado==='Activo').length} en la manada).`;r.cards=todos.sort(ordenHijos);return r}
  // sangre de alguien: "¿qué caballos tienen sangre de Sportivo?"
  {const m=norm(qc).match(/(SANGRE DE|DESCIENDEN DE|TIENEN DE (PADRE|ABUELO|ABUELA|MADRE) A|LINEA DE) (.+)$/);if(m){const x=m[3].replace(/^(EL|LA|LOS) /,'').trim();
    const anc=(n,d,acc)=>{if(!n||d>4)return acc;const p=padresDeNombre(n);for(const y of [p.padre,p.madre].filter(Boolean)){acc.push(norm(y));anc(y,d+1,acc)}return acc};
    const l=activos().filter(h=>{const a=[...anc(h.nombre,1,[]),norm(h.padre||''),norm(h.madre||''),norm(h.abueloP||''),norm(h.abuelaP||''),norm(h.abueloM||''),norm(h.abuelaM||'')];return a.some(y=>y&&(y===x||y.includes(x)))});
    r.txt=l.length?`${plural(l.length,'caballo tiene','caballos tienen')} sangre de ${x} (padre, madre, abuelos o bisabuelos, de lo que está cargado).`:`No encontré caballos con ${x} en la genealogía cargada.`;r.cards=l.sort(sortCab);return r}}
  // plata: herrero de un caballo, precio promedio, ventas a alguien
  if(c&&tiene(qc,/HERRER|HERRA|DESVAS/)&&tiene(qc,/CUANTO|GAST|PLATA|COSTO|SALIO/)){const p0=precios(),ev=S.eventos.filter(e=>e.caballoId===c.id&&['Desvasada','Herrada'].includes(e.tipo)),anio=hoy().slice(0,4);
    const sum=l=>l.reduce((a,e)=>a+(+e.precio||p0[e.tipo]||0),0),$f=n=>'$'+n.toLocaleString('es-AR');const la=ev.filter(e=>e.fecha.startsWith(anio));
    r.txt=`Herrero de ${c.nombre}: en ${anio} ${$f(sum(la))} (${plural(la.filter(e=>e.tipo==='Desvasada').length,'desvase','desvases')} y ${plural(la.filter(e=>e.tipo==='Herrada').length,'herrada','herradas')}); en total cargado ${$f(sum(ev))}.`;r.cards=[c];return r}
  if(tiene(qc,/PROMEDIO/)&&tiene(qc,/VENT|VENDI|PRECIO/)){const l=S.caballos.filter(x=>x.estado==='Vendido'&&/USD|U\$S/i.test(x.bajaPrecio||'')),num=v=>+(String(v).replace(/[^\d]/g,''))||0;
    r.txt=l.length?`Precio promedio de venta: USD ${Math.round(l.reduce((a,x)=>a+num(x.bajaPrecio),0)/l.length).toLocaleString('es-AR')} (de ${plural(l.length,'venta','ventas')} en dólares).`:'No hay ventas con precio en dólares.';r.cards=l;return r}
  {const m=norm(qc).match(/(VENDIO|VENDI A|VENDIDOS? A|LE VENDI A|COMPRO|COMPRADOR) (.+)$/);if(m&&!c){const x=m[2].replace(/^(EL|LA|A) /,'').replace(/[^A-ZÑ ]/g,'').trim().split(' ').filter(w=>w.length>=4);
    const l=S.caballos.filter(h=>h.estado==='Vendido'&&x.some(w=>norm((h.bajaComprador||'')+' '+(h.bajaObs||'')).includes(w)));
    if(x.length){r.txt=l.length?`Ventas donde figura ${x.join(' ').toLowerCase()}: ${plural(l.length,'caballo','caballos')}.`:`No encontré ventas con ${x.join(' ').toLowerCase()}.`;r.cards=l;r.meta=Object.fromEntries(l.map(h=>[h.id,`${h.bajaPrecio||''}${h.bajaFecha?' · '+fmt(h.bajaFecha):''}${h.bajaComprador?' · '+h.bajaComprador:''}`]));return r}}}
  // negaciones
  if(!c&&tiene(qc,/\bNO (ESTA|ESTAN) PRENAD|NO PRENAD|SIN PRENAR/)){const l=activos().filter(x=>x.categoria==='Madres'&&!S.servicios.some(s=>norm(s.madre)===norm(x.nombre)&&s.estado==='Preñada'));r.txt=`Madres que no están preñadas: ${l.length}.`;r.cards=l.sort(sortCab);r.meta=Object.fromEntries(l.map(x=>[x.id,estadoRepro(servUltimo(x.nombre)).txt]));return r}
  if(!c&&tiene(qc,/NO (ESTA|ESTAN) CASTRAD|SIN CASTRAR|NO CASTRAD/)){let l=activos().filter(x=>x.sexo==='Macho'&&!/castrad/i.test(x.obs||'')&&!S.eventos.some(e=>e.caballoId===x.id&&/^CASTR/.test(norm(e.tipo))));const cat=CATS.find(k=>tiene(qc,new RegExp(norm(k).slice(0,6))));if(cat)l=l.filter(x=>x.categoria===cat);
    r.txt=`Machos sin castración cargada${cat?' en '+cat:''}: ${l.length}.`;r.cards=l.sort(sortCab);return r}
  if(!c&&tiene(qc,/NO (ESTA|ESTAN) DESPARASITAD|SIN DESPARASITAR|NO DESPARASITAD/)){const l=activos().filter(enCampo).filter(x=>{const s2=estadoSan(x,'Desparasitación');return s2.st==='bad'||s2.st==='none'});r.txt=l.length?`Sin desparasitar (vencida o sin dato): ${l.length}.`:'Todos están desparasitados al día.';r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,estadoSan(x,'Desparasitación').txt]));return r}
  if(!c&&tiene(qc,/NO (ESTA|ESTAN) HERRAD|SIN HERRAR|NO HERRAD/)){const l=activos().filter(enCampo).filter(x=>seHierra(x)).filter(x=>{const s2=estadoSan(x,'Herrada');return s2.no||s2.st==='bad'||s2.st==='none'});r.txt=`De los que se hierran, ${plural(l.length,'tiene','tienen')} la herrada vencida, sin dato o está desherrado.`;r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,estadoSan(x,'Herrada').txt]));return r}
  if(!c&&tiene(qc,/NO (ESTA|ESTAN) A LA VENTA/)){const l=activos().filter(x=>!x.venta&&!fuera(x));r.txt=`No están a la venta: ${l.length}.`;r.cards=l.sort(sortCab);return r}
  // períodos
  {const MES=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'],nq=norm(qc).replace('SETIEMBRE','SEPTIEMBRE');
    let desde=null,hasta=null,nombre='';const mi=MES.findIndex(m=>new RegExp('\\b'+m+'\\b').test(nq)&&!/9 DE JULIO/.test(nq));
    if(mi>=0){let y=+((nq.match(/\b(20\d\d)\b/)||[])[1]||hoy().slice(0,4));const futuro=tiene(qc,/TOCA|HACER|HAY PARA|PENDIENT|PASA\b|VIENE|PARA (ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)/);
      if(futuro&&mi+1<+hoy().slice(5,7)&&!/20\d\d/.test(nq))y++;desde=`${y}-${String(mi+1).padStart(2,'0')}-01`;hasta=addDays(addDays(desde,32).slice(0,8)+'01',-1);nombre=MES[mi].toLowerCase()+' '+y}
    else if(tiene(qc,/SEMANA QUE VIENE|PROXIMA SEMANA/)){desde=addDays(hoy(),1);hasta=addDays(hoy(),7);nombre='la semana que viene'}
    else if(tiene(qc,/ESTE MES/)){desde=hoy().slice(0,8)+'01';hasta=addDays(addDays(desde,32).slice(0,8)+'01',-1);nombre='este mes'}
    else if(tiene(qc,/MES PASADO/)){const d=addDays(hoy().slice(0,8)+'01',-1);desde=d.slice(0,8)+'01';hasta=d;nombre='el mes pasado'}
    else if(tiene(qc,/SEMANA PASADA/)){desde=addDays(hoy(),-7);hasta=hoy();nombre='la semana pasada'}
    if(desde&&!tiene(qc,/PARE|PARTO|PARIR|PRENAD|NACIERON|CAMADA/)){
      if(tiene(qc,/VENDI|MURI|MUERT|BAJA/)){const l=S.caballos.filter(x=>x.estado!=='Activo'&&x.bajaFecha>=desde&&x.bajaFecha<=hasta&&(!tiene(qc,/VENDI/)||x.estado==='Vendido')&&(!tiene(qc,/MURI|MUERT/)||x.estado==='Muerto'));
        r.txt=l.length?`En ${nombre}: ${plural(l.length,'baja','bajas')}.`:`En ${nombre} no hay bajas cargadas.`;r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,`${bajaTxt(x)}${x.bajaPrecio?' · '+x.bajaPrecio:''}`]));return r}
      if((tiene(qc,/TOCA|HACER|HAY PARA|PENDIENT|VENCE|SEMANA QUE VIENE|PROXIMA SEMANA/)&&desde>=hoy())||desde>hoy()){const out=[];for(const x of activos().filter(enCampo))for(const t of ['Desparasitación','Desvasada','Herrada','Muelas']){const s2=estadoSan(x,t);if(s2.p&&s2.p>=desde&&s2.p<=hasta)out.push({c:x,t,p:s2.p})}
        const pp=S.servicios.filter(s=>s.estado==='Preñada'&&s.fpp>=desde&&s.fpp<=hasta);const vis=[...new Map(out.map(o=>[o.c.id,o.c])).values()];
        const ver={'Desparasitación':'desparasitar','Desvasada':'desvasar','Herrada':'herrar','Muelas':'muelas'};const por={};for(const o of out)por[o.t]=(por[o.t]||0)+1;
        r.txt=out.length||pp.length?`Para ${nombre}: `+[...Object.entries(por).map(([t,n])=>`${ver[t]} ${n}`),pp.length?`${plural(pp.length,'parto probable','partos probables')} (${pp.map(s=>s.madre).join(', ')})`:''].filter(Boolean).join(' · ')+'.':`Para ${nombre} no hay nada con fecha.`;
        r.cards=vis;r.meta=Object.fromEntries(vis.map(x=>[x.id,out.filter(o=>o.c===x).map(o=>`${ver[o.t]} ${fmt(o.p).slice(0,5)}`).join(' · ')]));return r}
      if(tiene(qc,/SE HIZO|PASO|EVENTO|CARGO|HICIMOS|HICIERON|MOVIO|MOVIMIENTO/)||tiene(qc,/^(QUE|EN) /)){let ev=S.eventos.filter(e=>e.fecha>=desde&&e.fecha<=hasta);if(tiene(qc,/MOVI/))ev=ev.filter(e=>e.tipo==='Movimiento');if(c)ev=ev.filter(e=>e.caballoId===c.id);ev.sort((a,b)=>b.fecha.localeCompare(a.fecha));
        const por={};for(const e of ev)por[e.tipo]=(por[e.tipo]||0)+1;r.txt=ev.length?`En ${nombre}${c?' ('+c.nombre+')':''}: ${plural(ev.length,'evento','eventos')} — `+Object.entries(por).map(([t,n])=>`${t} ${n}`).join(', ')+'.':`En ${nombre} no hay eventos cargados${c?' de '+c.nombre:''}.`;
        r.lista=ev.slice(0,15).map(e=>`${fmt(e.fecha)} · ${byId(e.caballoId)?.nombre||e.caballo||''} · ${e.detalle||e.tipo}`);return r}}}
  // filtros: pelaje, edad, sexo, categoría, lugar, padre ("yeguas alazanas de doma", "los de 6 años", "los 5 más viejos")
  {const pel0=[...new Set(S.caballos.map(x=>x.pelaje).filter(Boolean))],rz=w=>norm(w).replace(/(ES|S)$/,'').replace(/[AO]$/,'').slice(0,6),ws=norm(qc).split(' ');
    const plu=ws.filter(w=>!(pad&&norm(pad.nombre).split(' ').includes(w))&&/S$/.test(w)&&w.length>=5&&pel0.some(p=>rz(p.split(' ')[0])===rz(w)));
    const soloPel=c&&plu.length&&norm(c.nombre).split(' ').filter(w=>ws.includes(w)).every(w=>plu.some(u=>rz(u)===rz(w)));
    const top=/\bLOS \d{1,2} MAS (VIEJ|JOVEN|GRANDE|CHIC)|POR EDAD|(MAYORES|MENORES|MAS|MENOS) DE \d{1,2} ANOS/.test(norm(qc));
  if(!c||soloPel||top){const c=null,pel=[...new Set(S.caballos.map(x=>x.pelaje).filter(Boolean))],raiz=w=>norm(w).replace(/(ES|S)$/,'').replace(/[AO]$/,'').slice(0,6);
    const sinPad=norm(qc).split(' ').filter(w=>!(pad&&norm(pad.nombre).split(' ').includes(w))).join(' ');const pelQ=pel.filter(p=>sinPad.split(' ').some(w=>w.length>=4&&raiz(w)===raiz(p.split(' ')[0])&&!/^BAYA$|^COLORADA$/.test(norm(w)))),pelR=pelQ.length?raiz(pelQ[0].split(' ')[0]):null;
    const mA=norm(qc).match(/(?<!(MAYORES|MENORES|MAS|MENOS) DE |(MAYORES|MENORES|MAS|MENOS) )\b(?:DE |CON |TIENEN |TENGAN )?(\d{1,2}) A[NÑ]OS?\b/),mMes=norm(qc).match(/\b(\d{1,2}) MES(ES)?\b/),mMay=norm(qc).match(/(MAYORES DE|MAS DE) (\d{1,2})/),mMen=norm(qc).match(/(MENORES DE|MENOS DE) (\d{1,2})/),mTop=norm(qc).match(/\bLOS (\d{1,2}) MAS (VIEJ|JOVEN|GRANDE|CHIC)/),orden=tiene(qc,/ORDENAD\w* POR EDAD|POR EDAD/);
    const cat=CATS.find(k=>tiene(qc,new RegExp('\\b'+norm(k).slice(0,6))))||(tiene(qc,/\bDE POLO\b|\bJUEGAN\b/)?'Jugadores':tiene(qc,/POTRANC/)?'Potrillos':null),sx=tiene(qc,/YEGUA|HEMBRA|POTRANC|ALAZANAS|ZAINAS|BAYAS\b|TOBIANAS|RUANAS/)?'Hembra':tiene(qc,/MACHO/)?'Macho':null;
    const lug=[...new Set(activos().map(x=>x.lugar).filter(Boolean))].find(l=>limpio(qc).includes(limpio(l)));
    const vta=tiene(qc,/A LA VENTA|EN VENTA/),filtros=[pelR,mA,mMes,mMay,mMen,mTop,orden,cat,sx,lug,pad,vta].filter(Boolean).length;
    const PEL_FIJOS=/\b(ALAZAN|ZAIN|TORDILL|BAY[OA]S|OSCUR|COLORAD[OA]S|MOR[OA]S|TOBIAN|RUAN|OVER[OA]|PANGARE|ROSILL|LOBUN|GATEAD|PICAZ)\w*/;
    if(!pelR&&PEL_FIJOS.test(sinPad)&&!soloPel&&!tiene(qc,/HIJ|CRIA|PADRE|MADRE/)){const w=sinPad.match(PEL_FIJOS)[0].toLowerCase();r.txt=`No hay caballos ${w} cargados en la manada.`;return r}
    if(pelR||mA||mMes||mMay||mMen||mTop||orden||filtros>=3||(pad&&cat)||(vta&&(cat||sx||lug||pad))){let l=activos().filter(x=>vta||!fuera(x));
      if(pelR)l=l.filter(x=>x.pelaje&&raiz(x.pelaje.split(' ')[0])===pelR);if(cat)l=l.filter(x=>x.categoria===cat);if(sx)l=l.filter(x=>x.sexo===sx);if(lug)l=l.filter(x=>x.lugar===lug);if(vta)l=l.filter(x=>x.venta);
      if(pad)l=l.filter(x=>x.padre&&(clavePad(x.padre)===pad.k||norm(x.madre)===norm(pad.nombre)));
      const e=x=>x.nac?diff(hoy(),x.nac)/365.25:null;
      const base=l.length;if(mA)l=l.filter(x=>e(x)!==null&&Math.floor(e(x))===+mA[3]);if(mMes)l=l.filter(x=>x.nac&&Math.floor(diff(hoy(),x.nac)/30.44)===+mMes[1]);if(mMay)l=l.filter(x=>e(x)!==null&&e(x)>+mMay[2]);if(mMen)l=l.filter(x=>e(x)!==null&&e(x)<+mMen[2]);
      if(mTop||orden){l=l.filter(x=>x.nac).sort((a,b)=>/JOVEN|CHIC/.test(mTop?.[2]||'')?b.nac.localeCompare(a.nac):a.nac.localeCompare(b.nac));if(mTop)l=l.slice(0,+mTop[1])}else l.sort(sortCab);
      const desc=[sx==='Hembra'?'hembras':sx==='Macho'?'machos':'',pelQ.length?pelQ[0].toLowerCase():'',cat?'en '+cat:'',lug?'en '+lug:'',vta?'a la venta':'',pad?'hijos de '+pad.nombre:'',mA?`de ${plural(+mA[3],'año','años')}`:'',mMes?`de ${plural(+mMes[1],'mes','meses')}`:'',mMay?`de más de ${mMay[2]} años`:'',mMen?`de menos de ${mMen[2]} años`:''].filter(Boolean).join(', ');
      const sinFecha=(mA||mMes||mMay||mMen||mTop||orden)?activos().filter(x=>(vta||!fuera(x))&&!x.nac&&(!cat||x.categoria===cat)&&(!sx||x.sexo===sx)).length:0;
      r.txt=l.length?`${mTop?`Los ${l.length} más ${/JOVEN|CHIC/.test(mTop[2])?'jóvenes':'viejos'}`:orden?'Por edad, del más viejo al más joven':(tiene(qc,/CUANT/)?'Hay ':'Encontré ')+(sx==='Hembra'?plural(l.length,'yegua','yeguas'):sx==='Macho'?plural(l.length,'macho','machos'):plural(l.length,'caballo','caballos'))}${desc.replace(/^(hembras|machos)(, )?/,'')?' ('+desc.replace(/^(hembras|machos)(, )?/,'')+')':''}${!mTop&&!orden&&l.length<=8?': '+l.map(x=>x.nombre).join(', '):''}.`+((mA||mMes||mMay||mMen||mTop||orden)&&sinFecha?` Ojo: ${plural(sinFecha,'caballo no tiene','caballos no tienen')} fecha de nacimiento cargada y no ${sinFecha>1?'entran':'entra'} en la cuenta.`:''):`No hay caballos${desc?' '+desc:''}.`+((mA||mMes||mMay||mMen)&&sinFecha?` (${plural(sinFecha,'caballo no tiene','caballos no tienen')} fecha de nacimiento cargada.)`:'');
      r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,[sexoTxt(x),x.pelaje,x.nac?edadTxt(x):'',x.categoria,x.lugar].filter(Boolean).join(' · ')]));return r}}}
  return null}

/* ---------- 3) Lo de siempre: preguntas generales (preñadas, tareas, bajas, ventas, camadas, sanidad…),
   de un padrillo y de un caballo (hijos, padres, edad, chip, preñez, sanidad, eventos…) ---------- */
function respuestasBase(q0){
  q0=String(q0).replace(/\b\d{3}(?:[ .-]\d{3}){4}\b/g,m=>m.replace(/\D/g,'')); // chip escrito en grupos
  const qc=corregir(q0),r={txt:'',cards:[],sug:[]};
  let q=qc;const tAct=+S.config.temporada||new Date().getFullYear();
  if(tiene(q,/^(QUIEN ES |QUE ES )?(LA |EL )?MANADA$/)){const n=S.caballos.filter(x=>norm(x.padre)==='MANADA');r.txt=`MANADA es el servicio a campo: la yegua quedó preñada en la manada y no se sabe con qué padrillo. Figura como padre de ${plural(n.length,'caballo','caballos')}.`;r.cards=n.sort(ordenHijos);return r}
  if(tiene(q,/^(AYUDA|COMO (SE )?USA|COMO TE USO|QUE (PODES|SABES) HACER|QUE (TE )?PUEDO PREGUNTAR|QUE PREGUNTAS)/)||tiene(q,/COMO USO LA APP|QUE PREGUNTAS PUEDO/)){
    r.txt='Podés preguntarme de cualquier caballo (por nombre o número): hijos, padres, abuelos, hermanos, edad, chip, eventos, qué le toca, si está preñada, suelta o agarrada. Y de la manada: preñadas y partos, qué hay que hacer, herrero, cuántos hay, a la venta, vendidos, muertos, camadas, lugares, padrillos. Algunos ejemplos:';r.sug=SUGERENCIAS_INICIO;return r}
  if(tiene(q,/MEJOR|JUEGA MAS|MAS JUEGA/)&&tiene(q,/CABALLO|YEGUA|JUEGA|JUGADOR/)){const l=activos().filter(x=>['Jugadores','Hechura'].includes(x.categoria)).map(x=>({x,n:(practicas?.(x)||0)+(torneos?.(x)||0)})).sort((a,b)=>b.n-a.n);
    r.txt='Eso no lo mide la app 🙂. Lo que sí sé es cuánto jugó cada uno (prácticas y torneos cargados):';r.cards=l.map(o=>o.x);r.meta=Object.fromEntries(l.map(o=>[o.x.id,`${plural(practicas(o.x),'práctica','prácticas')} · ${plural(torneos(o.x),'torneo','torneos')}`]));return r}
  {const m=tiene(q,/MAS VIEJ|MAS GRANDE|MAYOR/)?'v':tiene(q,/MAS JOVEN|MAS CHIC|MENOR|MAS NUEV/)?'j':'';
    if(m){let l=activos().filter(x=>x.nac&&!fuera(x));if(tiene(q,/YEGUA|HEMBRA/))l=l.filter(x=>x.sexo==='Hembra');if(tiene(q,/MACHO|CABALLO /))l=l.filter(x=>x.sexo==='Macho');
      l.sort((a,b)=>m==='v'?a.nac.localeCompare(b.nac):b.nac.localeCompare(a.nac));const top=l.filter(x=>x.nac===l[0]?.nac);
      r.txt=l.length?`${m==='v'?'Los más viejos':'Los más jóvenes'} (con fecha cargada): ${top.map(x=>x.nombre).join(', ')}, ${m==='v'?'nacidos':'nacido'} el ${fmt(l[0].nac)}.`+(activos().some(x=>!x.nac)?' Ojo: hay caballos sin fecha de nacimiento.':''):'No hay fechas de nacimiento cargadas.';
      r.cards=l.slice(0,8);r.meta=Object.fromEntries(l.slice(0,8).map(x=>[x.id,`${fmt(x.nac)} · ${edad(x.nac)} años · ${x.categoria}`]));return r}}
  {const MES=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];const nq=norm(q0).replace('SETIEMBRE','SEPTIEMBRE');
    // un día: "¿qué pasó el 21 de octubre?", "21/10"
    const d1=nq.match(/\b(\d{1,2}) DE (ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)\b/)||nq.match(/\b(\d{1,2})\/(\d{1,2})\b/);
    if(d1&&!/9 DE JULIO/.test(nq)){const mm=isNaN(d1[2])?MES.indexOf(d1[2])+1:+d1[2],dd=+d1[1];const cand=[tAct,tAct-1,tAct+1].map(y=>`${y}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`).filter(f=>f<=addDays(hoy(),400));
      const f=cand.find(f=>S.eventos.some(e=>e.fecha===f)||S.caballos.some(x=>x.nac===f))||cand[0];const ev=S.eventos.filter(e=>e.fecha===f),nac=S.caballos.filter(x=>x.nac===f);
      r.txt=ev.length||nac.length?`El ${fmt(f)}: `+[nac.length?`nacieron ${nac.map(x=>x.nombre).join(' y ')}`:'',ev.length?plural(ev.length,'evento cargado','eventos cargados'):''].filter(Boolean).join(' · ')+'.':`El ${fmt(f)} no hay nada cargado.`;
      r.lista=ev.slice(0,12).map(e=>`${byId(e.caballoId)?.nombre||e.caballo||''} · ${e.detalle||e.tipo}`);r.cards=nac;return r}
    // partos de un mes: "¿quiénes paren en diciembre?"
    const meses=MES.map((m,i)=>new RegExp('\\b'+m+'\\b').test(nq)?i:-1).filter(i=>i>=0).sort((a,b)=>nq.indexOf(MES[a])-nq.indexOf(MES[b])),nomM=meses.map(i=>MES[i].toLowerCase()).join(' y ');
    if(meses.length&&tiene(q,/PARE|PARTO|PARIR|PRENAD/)){const l=S.servicios.filter(s=>s.estado==='Preñada'&&s.fpp&&meses.includes(+s.fpp.slice(5,7)-1)).sort((a,b)=>a.fpp.localeCompare(b.fpp));
      r.txt=l.length?`En ${nomM} tienen fecha probable de parto: ${l.map(s=>s.madre+' ('+fmt(s.fpp).slice(0,5)+')').join(', ')}.`:`Ninguna tiene la fecha probable de parto en ${nomM}.`;r.cards=l.map(s=>findByName(s.madre)).filter(Boolean);return r}}
  if(tiene(q,/NUMERACION|QUE (SIGNIFICA|QUIERE DECIR|ES) (EL|LA|ESE) NUMERO|NUMERO (DE|EN) (CADA|LA CAMADA|LOS POTRILLOS)|POR QUE SE LLAMA/)){const ej=S.caballos.find(x=>/\(GUACHA\) 40/.test(x.nombre))||S.caballos.find(x=>x.rp&&x.chip);
    r.txt=`El número que lleva cada potrillo en el nombre (por ejemplo el 40 de "DC (GUACHA) 40") es su RP: el número de registro que se le pone a cada uno. En los que tienen chip coincide con el final del chip${ej?.chip?` (${ej.nombre}: RP ${ej.rp}, chip …${String(ej.chip).slice(-6)})`:''}. No es el orden de nacimiento dentro de la camada y se repite entre camadas: por ejemplo hay más de un caballo con el 34 o con el 21. Por eso, si preguntás por un número que tienen dos, te pregunto cuál.`;
    r.sug=['¿Quién es el 40?','camada 2025'];return r}
  if(tiene(q,/CADA CUANTO/)&&tiene(q,/DESPARAS|DESVAS|HERR|MUELA|VACUN|ANEMIA|INFLUENZA/)){const t=tablaInt(),k=S.config;
    r.txt=tiene(q,/DESPARAS/)?`Desparasitar: las madres cada ${k.despMadres} días y el resto cada ${k.despResto} días.`:tiene(q,/DESVAS/)?`Desvasar: potrillos cada ${t.Potrillos.desv} días, madres cada ${t.Madres.desv}, descanso cada ${t.descanso.desv}, jugadores cada ${t.normal.desv} y hechura cada ${t.Hechura.desv}.`:tiene(q,/HERR/)?`Herrar: jugadores cada ${t.normal.herr} días y hechura cada ${t.Hechura.herr}. Madres, potrillos y los que están en descanso no se hierran.`:tiene(q,/MUELA/)?`Muelas: cada ${+k.muelas||365} días.`:
      controles().filter(ct=>ct.activo&&(ct.dias||ct.meses)).map(ct=>`${ct.k}: ${ct.dias?'cada '+ct.dias+' días':'en los meses '+ct.meses.join(', ')+' de preñez'}`).join(' · ')+'.';
    r.txt+=' Se cambia en Sanidad → Cada cuántos días.';return r}
  if(tiene(q,/SANIDAD|AL DIA|VENCID|SEMAFORO|PUNTITO|ROJOS|VERDES|AMARILLOS/)&&quienes(qc).filter(e=>e.c||e.varios).length===0){
    const cat=CATS.find(k=>tiene(q,new RegExp(norm(k).slice(0,6))));let l=activos().filter(enCampo);if(cat)l=l.filter(x=>x.categoria===cat);
    if(cat==='Doma'){r.txt=`Los de doma no figuran en sanidad porque están en ${[...new Set(activos().filter(x=>x.categoria==='Doma').map(x=>x.lugar).filter(Boolean))].join(', ')||'otro lugar'}.`;return r}
    if(cat&&!l.length){r.txt=`No hay caballos en ${cat}.`;return r}
    // tipos: desparasitación, los controles que alguna vez se cargaron, y desvase/herrada
    const cargado=t=>S.eventos.some(e=>e.tipo===t);let tipos=['Desparasitación',...new Set(l.flatMap(c=>ctrlDiasActivos(c).map(ct=>ct.k)).filter(cargado)),'Desvasada','Herrada'];
    const solo=tiene(q,/DESPARAS/)?'Desparasitación':tiene(q,/DESVAS/)?'Desvasada':tiene(q,/HERR/)?'Herrada':null;if(solo)tipos=[solo];
    const cuenta=t=>{const o={bad:[],warn:[],ok:[],none:[]};for(const c of l){const s2=estadoSan(c,t);if(s2.no)continue;o[s2.st].push(c)}return o};
    const res=tipos.map(t=>[t,cuenta(t)]).filter(([,o])=>o.bad.length+o.warn.length+o.ok.length+o.none.length>0);
    if(tiene(q,/PUNTITO|SEMAFORO|COLORES|SIGNIFICA/)){r.txt='Los puntitos de cada caballo son su sanidad: rojo = vencido, amarillo = vence en 15 días o menos, verde = al día, gris = sin dato. Hoy: '+res.map(([t,o])=>`${t} ${o.bad.length} rojos, ${o.warn.length} amarillos`).join(' · ')+'.';return r}
    if(tiene(q,/AL DIA/)&&!tiene(q,/NO ESTAN|QUIEN NO/)){const ok=l.filter(c=>tipos.every(t=>{const s2=estadoSan(c,t);return s2.no||s2.st==='ok'||s2.st==='none'}));r.txt=`Al día${cat?' en '+cat:''} (sin nada vencido ni por vencer): ${plural(ok.length,'caballo','caballos')} de ${l.length}.`;r.cards=ok;return r}
    const venc=[...new Map(res.flatMap(([t,o])=>(tiene(q,/VENCID/)?o.bad:[...o.bad,...o.warn]).map(c=>[c.id,c]))).values()].sort(sortCab);
    r.txt=tiene(q,/VENCID/)?(venc.length?`${solo||'Vencidos'}${cat?' en '+cat:''}: ${plural(venc.length,'caballo','caballos')} con algo vencido.`:`${solo||'Sanidad'}${cat?' en '+cat:''}: ningún caballo vencido, todo al día.`):`Sanidad${cat?' de '+cat:''} (sin doma): `+res.map(([t,o])=>`${t}: ${o.bad.length} vencidos, ${o.warn.length} por vencer, ${o.ok.length} al día${o.none.length?`, ${o.none.length} sin dato`:''}`).join(' · ')+'.';
    r.cards=venc;r.meta=Object.fromEntries(venc.map(c=>[c.id,tipos.map(t=>[t,estadoSan(c,t)]).filter(([,x])=>x.st==='bad'||x.st==='warn'&&!tiene(q,/VENCID/)).map(([t,x])=>`${t} ${x.st==='bad'?'vencida':'vence '+fmt(x.p).slice(0,5)}`).join(' · ')]));
    r.sug=['¿Qué hay que hacer esta semana?','¿Cada cuántos días se desparasita?'];return r}
  if(tiene(q,/\bNOTAS?\b|PARA REVISAR|A REVISAR/)){const l=S.notas.filter(n=>n.estado!=='Listo').sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
    r.txt=l.length?`Hay ${plural(l.length,'nota pendiente','notas pendientes')}:`:'No hay notas pendientes.';r.lista=l.slice(0,12).map(n=>`${n.fecha?fmt(n.fecha)+' · ':''}${n.titulo}${n.texto?': '+n.texto:''}`);return r}
  if(tiene(q,/PROMEDIO/)&&tiene(q,/EDAD|ANOS/)){const l=activos().filter(x=>x.nac&&!fuera(x));const prom=l.reduce((a,x)=>a+diff(hoy(),x.nac)/365.25,0)/(l.length||1);
    r.txt=`La edad promedio es de ${prom.toFixed(1).replace('.',',')} años (de los ${l.length} que tienen fecha de nacimiento cargada).`;return r}
  if(tiene(q,/TODOS LOS CABALLOS|LISTA COMPLETA|MOSTRAME TODO|TODA LA MANADA|TODOS$/)){const l=activos().filter(x=>!fuera(x)).sort(sortCab);r.txt=`Estos son los ${l.length} caballos propios.`;r.cards=l;return r}
  {const sc=CATS.find(k=>tiene(q,new RegExp('SIN CONTAR (LOS |LAS |A LOS |A LAS )?'+norm(k).slice(0,6))));if(sc){const l=activos().filter(x=>!fuera(x)&&x.categoria!==sc).sort(sortCab);r.txt=`Sin contar ${sc.toLowerCase()}: ${plural(l.length,'caballo','caballos')}.`;r.cards=l;return r}}
  {const ch=norm(q).match(/\b\d{15}\b/);if(ch&&!S.caballos.some(x=>String(x.chip||'').replace(/\D/g,'')===ch[0])){r.txt=`Ningún caballo tiene el chip ${ch[0]}. Si lo pasás con el lector, la app te deja elegir de qué caballo es.`;return r}}
  const ent=quienes(qc);
  const varios=ent.find(e=>e.varios);
  if(varios&&ent.some(e=>e.c)){ // "¿la Baya es la madre del 27?": de los 27, el que es hijo de la Baya
    const otro=ent.find(e=>e.c).c,f=varios.varios.filter(x=>norm(x.madre)===norm(otro.nombre)||norm(x.padre)===norm(otro.nombre)||norm(otro.madre)===norm(x.nombre)||norm(otro.padre)===norm(x.nombre));
    if(f.length===1){const i=ent.indexOf(varios);ent[i]={c:f[0]}}}
  if(varios&&ent.includes(varios)){r.txt=`Hay ${varios.varios.length} caballos con el ${varios.n}. ¿Cuál de estos?`;r.cards=varios.varios;
    r.sug=varios.varios.slice(0,4).map(c=>{const x=q0.replace(new RegExp('\\b'+varios.n+'\\b'),c.nombre);return x===q0?`¿Quién es ${c.nombre}?`:x});return r}
  let c=ent.find(e=>e.c)?.c||null,pad=ent.find(e=>e.p)?.p||null;
  {const ni=ent.find(e=>e.ninguno),enLugar=activos().some(x=>x.lugar&&/\d/.test(x.lugar)&&limpio(q).includes(limpio(x.lugar)));
    if(ni&&!c&&!pad&&!enLugar&&!tiene(q,/CAMADA|DIAS|ANOS|MES|SEMANA|20\d\d/)){r.txt=`No hay ningún caballo con el número ${ni.ninguno}.`;r.sug=['¿Cuántos caballos hay?'];return r}}
  const sinNombre=!c&&!pad;
  // Sin nombre en la pregunta: si se refiere al último caballo ("¿quiénes son sus hermanos?", "¿qué eventos tiene registrados?")
  if(sinNombre&&ASIS.ultimo&&byId(ASIS.ultimo)&&(tiene(q,/\bHIJOS?\b|\bHIJAS?\b|\bCRIAS?\b|\bPADRES?\b|\bMADRE\b|ABUEL|HERMAN|EVENTO|HISTORIAL|REGISTRAD|\bEDAD\b|NACIO|PELAJE/)&&!tiene(q,/CUANT\w* (MADRES|POTRILLOS|JUGADORES)|LAS MADRES/)
    ||tiene(q,/\b(SUS?|ELLA|ESA|ESE)\b/)&&tiene(q,/CHIP|DONDE|PRENAD|DESPARAS|DESVAS|HERRA|VACUN|ANOS/))&&!tiene(q,/NO TIENEN|SIN |FALTA|PADRILLO|CADA|\bMAS\b|POTRILLOS|JUGADORES|MADRES|RESUMEN|NOVEDAD/))c=byId(ASIS.ultimo);
  if(c)ASIS.ultimo=c.id;else if(pad)ASIS.ultimo=null; // "sus hermanos" después de un padrillo no se confunde con otro caballo
  const N=c?c.nombre:pad?pad.nombre:'';
  if((c||pad)&&ent.resto)q=ent.resto; // lo que se pregunta, sin el nombre
  const multi=ent.filter(e=>e.c).map(e=>e.c);
  // "¿la China es hija de la Gorda?", "¿el 40 es hijo del Mercenario?", "¿la Baya es la madre del 27?", "¿la Susana es hermana de la Vilma?"
  if(tiene(q0,/\bES\b|\bSON\b/)&&(multi.length>=2||multi.length===1&&pad)&&tiene(q,/HIJ|MADRE|PADRE|HERMAN/)){
    const [a,b]=multi.length>=2?multi:[multi[0],null],bn=b?b.nombre:pad.nombre,k=x=>clavePad(x||'');
    const esHijo=(h,p)=>norm(h.madre)===norm(p)||norm(h.padre)===norm(p)||k(h.padre)===k(p);
    let expl;const mencionPadre=tiene(q,/(ES|SON) (LA |EL )?(MADRE|PADRE|MAMA|PAPA)/);
    if(tiene(q,/HERMAN/)&&b){const si=a.madre&&norm(a.madre)===norm(b.madre);expl=si?`Sí: ${a.nombre} y ${b.nombre} son hermanos por parte de madre (${a.madre})${a.padre&&norm(a.padre)===norm(b.padre)?`, y también de padre (${a.padre})`:''}.`:`No: ${a.nombre} es de ${a.madre||'madre que no se sabe'} y ${b.nombre} de ${b.madre||'madre que no se sabe'}.`}
    else if(mencionPadre&&b){const si=esHijo(b,a.nombre);expl=si?`Sí: ${a.nombre} es ${norm(b.madre)===norm(a.nombre)?'la madre':'el padre'} de ${b.nombre}.`:`No: ${b.nombre} es ${b.sexo==='Hembra'?'hija':'hijo'} de ${b.padre||'padre que no se sabe'} y ${b.madre||'madre que no se sabe'}.`}
    else{const h=a,p=b?b.nombre:bn,si=esHijo(h,p);expl=si?`Sí: ${h.nombre} es ${h.sexo==='Hembra'?'hija':'hijo'} de ${p}.`:`No: ${h.nombre} es ${h.sexo==='Hembra'?'hija':'hijo'} de ${h.padre||'padre que no se sabe'} y ${h.madre||'madre que no se sabe'}.`}
    r.txt=expl;r.cards=multi;return r}
  if(multi.length>=2&&tiene(q,/PADRE|MADRE/)&&!tiene(q,/HIJO|HIJA/)){r.txt=multi.map(padresTxt).join(' ');r.cards=multi;return r}
  if(multi.length>=2&&tiene(q,/HIJO|HIJA|CRIA|POTRILL|POTRANC|NACI/)){ // "los potrillos de la Baya y la Colorada"
    r.txt=multi.map(m=>{const h=hijosDe(m.nombre).filter(x=>x.nac).sort((a,b)=>b.nac.localeCompare(a.nac));return h[0]?`${m.nombre}: el último fue ${h[0].nombre}, nació el ${fmt(h[0].nac)}`:`${m.nombre}: sin crías con fecha`}).join('. ')+'.';
    r.cards=multi.flatMap(m=>hijosDe(m.nombre).filter(x=>x.nac).sort((a,b)=>b.nac.localeCompare(a.nac)).slice(0,1));return r}

  // ----- preguntas generales (sin un caballo) -----
  if(!c&&!pad){
    if(tiene(q,/RESUMEN|COMO ESTA LA MANADA|COMO VIENE|PANORAMA/)){const act=activos().filter(x=>!fuera(x)),pre=S.servicios.filter(s=>s.estado==='Preñada'&&s.fpp).sort((a,b)=>a.fpp.localeCompare(b.fpp));const {grupos}=tareasSemana(7);const it=grupos.flatMap(g=>g.items);
      r.txt=`Resumen: ${act.length} caballos propios (`+CATS.map(k=>[k,act.filter(x=>x.categoria===k).length]).filter(([,n])=>n).map(([k,n])=>n+' '+k.toLowerCase()).join(', ')+`). ${plural(pre.length,'preñada','preñadas')}${pre[0]?`; la próxima en parir es ${pre[0].madre} (${fmt(pre[0].fpp).slice(0,5)})`:''}. Para esta semana: ${plural(it.length,'tarea','tareas')} (${it.filter(i=>i.s.d<0).length} atrasadas). ${act.filter(x=>x.venta).length} a la venta.`;
      r.sug=['¿Qué hay que hacer esta semana?','¿Quiénes están preñadas?','¿Qué pasó esta semana?'];return r}
    if(tiene(q,/PADRILLO|PADRE/)&&tiene(q,/MAS (HIJOS|POTRILLOS|CRIAS)|CADA PADRILLO|RANKING/)){const l=listaPadrillos().filter(p=>!p.manada).sort((a,b)=>b.vivos.length-a.vivos.length||b.hijos.length-a.hijos.length);
      r.txt=`El que más hijos tiene hoy en la manada es ${l[0].nombre} (${l[0].vivos.length}). Todos, de más a menos:`;r.pads=l;r.lista=l.map(p=>`${p.nombre}: ${plural(p.vivos.length,'vivo','vivos')}${p.hijos.length>p.vivos.length?` · ${p.hijos.length} en total`:''}${p.porNacer.length?` · ${p.porNacer.length} por nacer`:''}`);return r}
    // último evento de una categoría: "último desvase de los potrillos"
    {const tt=[['DESPARAS','Desparasitación'],['DESVAS','Desvasada'],['HERR','Herrada'],['VACUN','Vacuna']].find(([k])=>tiene(q,new RegExp(k)));const cat=CATS.find(k=>tiene(q,new RegExp(norm(k).slice(0,6))));
      if(tt&&cat&&tiene(q,/ULTIM|CUANDO/)){const ids=new Set(activos().filter(x=>x.categoria===cat).map(x=>x.id));const ev=S.eventos.filter(e=>ids.has(e.caballoId)&&(e.tipo===tt[1]||norm(e.tipo).startsWith(tt[0]))).sort((a,b)=>b.fecha.localeCompare(a.fecha));
        r.txt=ev.length?`${tt[1]} en ${cat}: la última fue el ${fmt(ev[0].fecha)} (${plural(ev.filter(e=>e.fecha===ev[0].fecha).length,'caballo','caballos')} ese día).`:`No hay ${tt[1].toLowerCase()} cargada en ${cat}.`;
        r.cards=activos().filter(x=>x.categoria===cat).sort(sortCab);r.meta=Object.fromEntries(r.cards.map(x=>{const s2=estadoSan(x,tt[1]);return [x.id,s2.u?`última ${fmt(s2.u)}${s2.p?` · próxima ${fmt(s2.p)}`:''}`:'sin dato']}));return r}}
    // lugares: "¿quiénes están en 9 de Julio?"
    {const lug=[...new Set(activos().map(x=>x.lugar).filter(Boolean))].find(l=>limpio(q).includes(limpio(l)));
      if(lug){const l=activos().filter(x=>x.lugar===lug).sort(sortCab);r.txt=`En ${lug} hay ${plural(l.length,'caballo','caballos')}.`;r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,lineaCab(x)]));return r}}
    // una categoría sola: "jugadores", "los de descanso", "madres"
    {const cat=CATS.find(k=>new RegExp('^(LOS |LAS )?(DE |EN )?'+norm(k)+'$').test(q.trim())||new RegExp('^(QUIENES|CUALES|CUANTOS|CUANTAS)( SON| ESTAN| HAY)?( LOS| LAS)?( EN)? '+norm(k)+'( HAY)?$').test(q.trim()));
      if(cat){const l=activos().filter(x=>!fuera(x)&&x.categoria===cat).sort(sortCab);r.txt=l.length?`Hay ${l.length} en ${cat}.`:`No hay ninguno en ${cat}.`;r.cards=l;return r}}
    if(tiene(q,/ESTE ANO|ESTA TEMPORADA|ESTE TEMPORADA/)&&tiene(q,/NACI|POTRILL|CRIA/)){const l=S.caballos.filter(x=>+x.camada===tAct).sort((a,b)=>(b.nac||'').localeCompare(a.nac||''));
      r.txt=l.length?`En ${tAct} nacieron ${plural(l.length,'potrillo','potrillos')}${l.some(x=>x.estado==='Muerto')?` (${l.filter(x=>x.estado==='Muerto').length} murieron)`:''}.`:`En ${tAct} todavía no nació ninguno.`;r.cards=l;return r}
    // último nacimiento
    if(tiene(q,/ULTIM\w* (NACI|PARTO|PARI|POTRILL|CRIA)|(NACIO|PARIO|NACIERON|PARIERON) ULTIM|QUIEN NACIO|ULTIMOS NACIDOS|RECIEN NACID/)){const l=S.caballos.filter(x=>x.nac).sort((a,b)=>b.nac.localeCompare(a.nac));
      const f=l[0]?.nac,mismos=l.filter(x=>x.nac===f);
      r.txt=f?`El último nacimiento fue el ${fmt(f)} (hace ${diff(hoy(),f)} días): `+mismos.map(x=>`${x.nombre} (${(x.sexo||'').toLowerCase()||'sin sexo cargado'}${x.madre?', de '+x.madre:''}${x.estado==='Muerto'?', murió':''})`).join(' y ')+'.':'No hay nacimientos cargados.';
      r.cards=l.slice(0,6);r.meta=Object.fromEntries(l.slice(0,6).map(x=>[x.id,[sexoTxt(x),'nació '+fmt(x.nac),x.madre?'de '+x.madre:'',x.estado!=='Activo'?x.estado:''].filter(Boolean).join(' · ')]));
      r.sug=['¿Cuáles parieron esta temporada?','¿Quiénes están preñadas?'];return r}
    if(tiene(q,/ABORT/)){const l=S.servicios.filter(s=>s.estado==='Abortó').sort((a,b)=>(+b.temporada||0)-(+a.temporada||0));
      r.txt=l.length?`${plural(l.length,'aborto cargado','abortos cargados')}: `+l.map(s=>`${s.madre} (temporada ${s.temporada||'—'})`).join(', ')+'.':'No hay abortos cargados.';r.cards=l.map(s=>findByName(s.madre)).filter(Boolean);return r}
    if(tiene(q,/NACI\w* MUERT|NACIERON MUERT/)){const l=S.caballos.filter(x=>x.estado==='Muerto'&&(x.bajaFecha&&x.bajaFecha===x.nac||/NACIO MUERT|NACIERON MUERT/.test(norm((x.bajaObs||'')+' '+(x.obs||'')).normalize('NFD').replace(/[\u0300-\u036f]/g,'')))).sort((a,b)=>(b.nac||'').localeCompare(a.nac||''));
      r.txt=l.length?`${plural(l.length,'potrillo nació muerto','potrillos nacieron muertos')} (de los que está cargado así).`:'No hay potrillos cargados como nacidos muertos.';r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,`${x.nac?fmt(x.nac):''}${x.madre?' · de '+x.madre:''}`]));return r}
    if(tiene(q,/DOMADOR|QUIEN DOMA|ENTRARON|EN DOMA DESDE|HACE QUE ESTAN EN DOMA/)&&tiene(q,/DOMA/)){const l=activos().filter(x=>x.categoria==='Doma').sort(sortCab);const dom=[...new Set(l.map(x=>x.domador).filter(Boolean))];
      r.txt=l.length?`En doma hay ${plural(l.length,'caballo','caballos')}${dom.length?`, con ${dom.join(' y ')}`:''}${l[0]?.lugar?' ('+l[0].lugar+')':''}.`:'No hay caballos en doma.';r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,[x.domador?'domador '+x.domador:'',x.ingresoDoma?'entró '+fmt(x.ingresoDoma):'sin fecha de entrada'].filter(Boolean).join(' · ')]));return r}
    if(tiene(q,/PRENAD/)&&tiene(q,/VACIA|MADRES TENGO|CUANTAS MADRES/)){const pre=S.servicios.filter(s=>s.estado==='Preñada'),mad=activos().filter(x=>x.categoria==='Madres');const vac=mad.filter(m=>estadoRepro(servUltimo(m.nombre)).k==='vac');
      r.txt=`Madres: ${mad.length}. Preñadas: ${pre.length}${pad?` (de ${pad.nombre}: ${pre.filter(s=>clavePad(s.padrillo||'')===pad.k).length})`:''}. Vacías: ${vac.length}.`;r.cards=mad.sort(sortCab);r.meta=Object.fromEntries(mad.map(m=>[m.id,estadoRepro(servUltimo(m.nombre)).txt]));return r}
    if(tiene(q,/VACUN|DOSIS/)&&tiene(q,/PENDIENT|FALTA|TOCA|PROXIM/)){const out=[];
      for(const m of activos().filter(x=>!fuera(x)))for(const d of dosisPrenez(m))if(!d.hecha&&d.d<=30&&d.d>=-30)out.push({c:m,t:d.k,p:d.due,d:d.d});
      for(const m of activos().filter(enCampo))for(const ct of ctrlDiasActivos(m)){const st=estadoSan(m,ct.k);if(st.u&&st.p&&st.d<=30)out.push({c:m,t:ct.k,p:st.p,d:st.d})}
      out.sort((a,b)=>a.p.localeCompare(b.p));r.txt=out.length?`Vacunas para los próximos 30 días (y lo atrasado): ${plural(out.length,'dosis','dosis')}.`:'No hay vacunas pendientes para los próximos 30 días.';
      const vis=[...new Map(out.map(o=>[o.c.id,o.c])).values()];r.cards=vis;r.meta=Object.fromEntries(vis.map(c=>[c.id,out.filter(o=>o.c===c).map(o=>`${o.t} ${o.d<0?'atrasada':fmt(o.p).slice(0,5)}`).join(' · ')]));return r}
    // cuáles parieron / abortaron esta temporada
    if(tiene(q,/PARIERON|PARIDAS|PARIO|YA PARI/)||tiene(q,/TEMPORADA (20\d\d)/)){const tq=+((norm(q).match(/\b(20\d\d)\b/)||[])[1]||tAct);const l=S.servicios.filter(s=>+s.temporada===tq&&['Parida','Abortó'].includes(s.estado)).sort((a,b)=>(b.fechaParto||b.fpp||'').localeCompare(a.fechaParto||a.fpp||''));
      const cria=s=>s.criaId&&byId(s.criaId)||S.caballos.find(x=>norm(x.madre)===norm(s.madre)&&+x.camada===tq);
      r.txt=l.length?`En la temporada ${tq} ${l.length===1?'parió 1 yegua':'parieron '+l.length+' yeguas'}${l.some(s=>s.estado==='Abortó')?' (contando abortos)':''}.`:`En la temporada ${tq} ${tq===tAct?'todavía no parió ninguna':'no hay partos cargados'}.`;
      r.cards=l.map(s=>findByName(s.madre)).filter(Boolean);r.meta=Object.fromEntries(l.map(s=>{const m=findByName(s.madre),c2=cria(s);return [m?.id,s.estado==='Abortó'?'Abortó':`Parió${c2?.nac?' el '+fmt(c2.nac):''}${c2?': '+c2.nombre+(c2.sexo?' ('+c2.sexo.toLowerCase()+')':'')+(c2.estado==='Muerto'?' · murió':''):''}`]}));
      r.sug=['¿Cuál fue el último nacimiento?','¿Quiénes están preñadas?'];return r}
    if(tiene(q,/VACIA/)){const l=S.servicios.filter(s=>+s.temporada===tAct||s.estado==='Vacía').filter(s=>s.estado==='Vacía').map(s=>findByName(s.madre)).filter(x=>x&&x.estado==='Activo');
      const u=[...new Map(l.map(x=>[x.id,x])).values()];r.txt=u.length?`Hay ${plural(u.length,'madre vacía','madres vacías')}.`:'No hay madres vacías cargadas.';r.cards=u;r.sug=['¿Quiénes están preñadas?'];return r}
    if(tiene(q,/PRENAD|PARTO|PARIR|PAREN|PARE |PARIDA/)){let l=S.servicios.filter(s=>s.estado==='Preñada'&&findByName(s.madre)?.estado!=='Muerto').sort((a,b)=>(a.fpp||'9').localeCompare(b.fpp||'9'));
      const y=(norm(q).match(/\b(20\d\d)\b/)||[])[1]||(tiene(q,/ESTE ANO|ESTA TEMPORADA/)?String(tAct):'');if(y)l=l.filter(s=>+s.temporada===+y||(s.fpp||'').startsWith(y));
      if(y&&+y<tAct)return responder('parieron temporada '+y); // un año que ya pasó: los partos de ese año
      if(y&&!l.length){r.txt=`No hay preñadas que paran en ${y}.`;return r}
      r.txt=l.length?`Hay ${plural(l.length,'preñada','preñadas')}${y?' que paren en '+y:''}. La próxima en parir es ${l[0].madre}${l[0].fpp?' ('+fmt(l[0].fpp)+', faltan '+diff(l[0].fpp,hoy())+' días)':''}.`:'No hay ninguna preñada cargada.';
      r.cards=l.map(s=>findByName(s.madre)).filter(Boolean);r.meta=Object.fromEntries(l.map(s=>[findByName(s.madre)?.id,`${s.padrillo||'—'}${s.fpp?' · parto '+fmt(s.fpp):''}`]));
      r.sug=['¿Qué hay que hacer esta semana?',l[0]?`¿Cuántos hijos tiene ${l[0].madre}?`:''];return r}
    if(tiene(q,/HERRER|HERRA|DESVAS/)&&tiene(q,/CUANTO|GAST|DEBO|SALE|PLATA|PAGAR|COSTO/)){const p0=precios(),mes=hoy().slice(0,7),anio=hoy().slice(0,4);
      const conPrecio=S.eventos.filter(e=>['Desvasada','Herrada'].includes(e.tipo)),sum=l=>l.reduce((a,e)=>a+(+e.precio||p0[e.tipo]||0),0),$f=n=>'$'+n.toLocaleString('es-AR');
      const lm=conPrecio.filter(e=>e.fecha.startsWith(mes)),la=conPrecio.filter(e=>e.fecha.startsWith(anio));
      const prox=activos().filter(enCampo).flatMap(c=>['Desvasada','Herrada'].map(t=>[t,estadoSan(c,t)])).filter(([,x])=>x.p&&x.p<=addDays(hoy(),30)&&!x.no);
      r.txt=`Herrero: este mes ${$f(sum(lm))} (${lm.length} trabajos), en ${anio} ${$f(sum(la))} (${la.length} trabajos). Para los próximos 30 días (con lo atrasado) serían unos ${$f(prox.reduce((a,[t])=>a+(p0[t]||0),0))}: ${plural(prox.filter(([t])=>t==='Desvasada').length,'desvase','desvases')} y ${plural(prox.filter(([t])=>t==='Herrada').length,'herrada','herradas')}. Precios: desvase ${$f(p0['Desvasada'])}, herrada ${$f(p0['Herrada'])}.`;return r}
    {const tipos=[['ANEMIA','Anemia'],['VACUN','Vacuna'],['MUELA','Muelas'],['INFLUENZA','Influenza'],['CASTR','Castración'],['ADENITIS','Adenitis'],['TETANO','Tétano'],['RINONEUMONITIS','Rinoneumonitis'],['ENCEFALO','Encéfalo'],['SALMONELA','Salmonela'],['VETERINAR','Veterinario'],['LESION','Lesión'],['ENFERM','Enfermedad'],['ANALISIS','Análisis'],['ESTUDIO','Estudios'],['REVISION','Revisión'],['DESPARAS','Desparasitación'],['MUELA','Muelas']].find(([k])=>tiene(q,new RegExp(k))&&(!['DESPARAS','MUELA'].includes(k)||tiene(q,/ULTIM|CUANDO FUE|CUANDO SE|HISTORIAL/)));
      if(tipos){const ev=S.eventos.filter(e=>e.tipo===tipos[1]||norm(e.tipo).startsWith(tipos[0])).sort((a,b)=>b.fecha.localeCompare(a.fecha));
        r.txt=ev.length?`${tipos[1]}: la última cargada fue el ${fmt(ev[0].fecha)} (${plural(ev.filter(e=>e.fecha===ev[0].fecha).length,'caballo','caballos')}). Hay ${ev.length} en total.`:`No hay registros de ${tipos[1]} cargados.`;
        r.cards=[...new Map(ev.map(e=>[e.caballoId,byId(e.caballoId)]).filter(([,x])=>x)).values()];
        r.lista=ev.slice(0,10).map(e=>`${fmt(e.fecha)} · ${byId(e.caballoId)?.nombre||e.caballo||''}`);return r}}
    if(tiene(q,/FALTA|\bSIN\b|NO TIENEN?\b|NUNCA/)&&tiene(q,/DESPARAS|DESVAS|MUELA|VACUN|ANEMIA/)){const t=tiene(q,/DESPARAS/)?'Desparasitación':tiene(q,/DESVAS/)?'Desvasada':tiene(q,/MUELA/)?'Muelas':tiene(q,/ANEMIA/)?'Anemia':'Vacuna';
      const l=activos().filter(enCampo).filter(c=>!S.eventos.some(e=>e.caballoId===c.id&&e.tipo===t)).sort(sortCab);r.txt=l.length?`${plural(l.length,'caballo no tiene','caballos no tienen')} ${t.toLowerCase()} cargada (sin contar doma).`:`Todos tienen al menos una ${t.toLowerCase()} cargada.`;r.cards=l;return r}
    if(tiene(q,/FALTA|\bSIN\b|NO TIENEN|NO ESTA CARGAD/)&&tiene(q,/PADRE|MADRE|NACIMIENTO|FECHA|EDAD|PELAJE|SEXO/)){const campo=tiene(q,/PADRE/)?['padre','el padre']:tiene(q,/MADRE/)?['madre','la madre']:tiene(q,/PELAJE/)?['pelaje','el pelaje']:tiene(q,/SEXO/)?['sexo','el sexo']:['nac','la fecha de nacimiento'];
      const l=activos().filter(x=>!fuera(x)&&(!x[campo[0]]||norm(x[campo[0]])==='—')).sort(sortCab);r.txt=`${plural(l.length,'caballo no tiene','caballos no tienen')} ${campo[1]} cargad${campo[1].startsWith('la ')?'a':'o'}. (Ya sabemos que muchos de esos datos no se conocen.)`;r.cards=l;return r}
    if(tiene(q,/HERRER|HERRA|DESVAS|DESPARAS|HACER|VENCID|ATRASAD|PENDIENT|TOCA|SEMANA|TAREA|MUELA/)&&!tiene(q,/ULTIM|CUANDO FUE|NO TIENEN?\b|SIN |NUNCA/)&&!tiene(q,/QUE PASO|NOVEDAD|SE HIZO|SE CARGO/)){const {grupos}=tareasSemana(7);let items=grupos.flatMap(g=>g.items.map(i=>({...i,t:g.t})));
      const solo=tiene(q,/DESPARAS/)?'Desparasitación':tiene(q,/DESVAS/)?'Desvasada':tiene(q,/HERRAR|HERRAD|HERRAJE/)?'Herrada':tiene(q,/MUELA/)?'Muelas':null;if(solo)items=items.filter(i=>i.t===solo);
      if(tiene(q,/ATRASAD|VENCID/))items=items.filter(i=>i.s.d<0);else if(tiene(q,/\bHOY\b/))items=items.filter(i=>i.s.d<=0);
      if(!items.length&&solo){const prox=activos().filter(enCampo).map(c=>({c,s:estadoSan(c,solo)})).filter(x=>x.s.p).sort((a,b)=>a.s.p.localeCompare(b.s.p))[0];
        r.txt=`Esta semana no hay que ${({'Desparasitación':'desparasitar','Desvasada':'desvasar','Herrada':'herrar','Muelas':'hacer muelas'})[solo]} a ninguno.${prox?` El próximo es ${prox.c.nombre}, el ${fmt(prox.s.p)}.`:''}`;r.cards=prox?[prox.c]:[];return r}
      const ver=t=>({'Desparasitación':'Desparasitar','Desvasada':'Desvasar','Herrada':'Herrar','Muelas':'Muelas','Agarrar':'Agarrar del descanso'}[t]||t);
      const por={};for(const i of items)(por[i.t]=por[i.t]||[]).push(i);
      r.txt=items.length?(tiene(q,/\bHOY\b/)?'Para hoy (con lo atrasado): ':tiene(q,/ATRASAD|VENCID/)?'Atrasado: ':'Para esta semana: ')+Object.entries(por).map(([t,l])=>`${ver(t)} ${l.length} (${l.filter(i=>i.s.d<0).length} atrasado${l.filter(i=>i.s.d<0).length===1?'':'s'})`).join(' · ')+'.':'No hay nada para hacer esta semana.';
      const vistos=new Map();for(const i of items)if(!vistos.has(i.c.id))vistos.set(i.c.id,i);
      r.cards=[...vistos.values()].map(i=>i.c);r.meta=Object.fromEntries([...vistos.values()].map(i=>[i.c.id,items.filter(x=>x.c.id===i.c.id).map(x=>ver(x.t)+(x.s.d<0?` (atrasado ${-x.s.d} d)`:x.s.d===0?' (hoy)':` (en ${x.s.d} d)`)).join(' · ')]));
      r.sug=['¿Quiénes están preñadas?','¿Cuántos caballos hay?'];return r}
    if(tiene(q,/^(GRACIAS|GENIO|BUENISIMO|PERFECTO|DALE|OK)\b/)&&q.trim().split(/\s+/).length<=3){r.txt='¡De nada! Cualquier otra cosa, preguntame.';r.sug=SUGERENCIAS_INICIO.slice(0,3);return r}
    if(tiene(q,/^(HOLA|BUENAS|BUEN DIA|QUE TAL|CHE)\b/)&&q.trim().split(/\s+/).length<=3){r.txt='¡Hola! Preguntame lo que quieras de la manada. Por ejemplo:';r.sug=SUGERENCIAS_INICIO;return r}
    if(tiene(q,/GANE|PLATA|TOTAL.*VEND|\bVENTAS\b|CUANTO VENDI|CUANTO SAQUE/)&&!tiene(q,/A LA VENTA/)){const l=S.caballos.filter(x=>x.estado==='Vendido');const num=v=>+(String(v||'').replace(/[^\d]/g,''))||0;
      const usd=l.filter(x=>/USD|U\$S|DOLAR/i.test(x.bajaPrecio||'')),otros=l.filter(x=>x.bajaPrecio&&!usd.includes(x));
      r.txt=`Vendiste ${plural(l.length,'caballo','caballos')}${usd.length?`: en total USD ${usd.reduce((a,x)=>a+num(x.bajaPrecio),0).toLocaleString('es-AR')}`:''}${otros.length?` y ${otros.map(x=>x.bajaPrecio).join(' + ')}`:''}.`;
      r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,`${x.bajaPrecio||'sin precio'}${x.bajaFecha?' · '+fmt(x.bajaFecha):''}${x.bajaComprador?' · '+x.bajaComprador:''}`]));return r}
    if(tiene(q,/VENDI|MUERT|MURIO|MURIERON|BAJA/)){const anio=(norm(q).match(/\b(20\d\d)\b/)||[])[1]||(tiene(q,/ESTE ANO/)?String(tAct):'');const sm=tiene(q,/MUERT|MURI/)&&!tiene(q,/VENDI/),sv=tiene(q,/VENDI/)&&!tiene(q,/MUERT|MURI/);
      const soloPot=tiene(q,/POTRILL|CRIA/);
      const l=S.caballos.filter(x=>x.estado!=='Activo'&&(!sm||x.estado==='Muerto')&&(!sv||x.estado==='Vendido')&&(!anio||String(x.bajaFecha||x.camada||'').startsWith(anio))&&(!soloPot||x.categoria==='Potrillos'||/^CRIA DE/.test(norm(x.nombre)))).sort((a,b)=>(b.bajaFecha||String(b.camada||'')).localeCompare(a.bajaFecha||String(a.camada||'')));
      if(sm||sv){r.txt=`${sm?'Murieron':'Se vendieron'} ${plural(l.length,soloPot?'potrillo':'caballo',soloPot?'potrillos':'caballos')}${anio?' en '+anio:''} (los más recientes primero).`;r.cards=l.slice(0,15);r.meta=Object.fromEntries(l.map(x=>[x.id,`${x.estado}${x.bajaFecha?' '+fmt(x.bajaFecha):''}${x.bajaPrecio?' · '+x.bajaPrecio:''}${x.madre?' · de '+x.madre:''}`]));r.sug=[sm?'¿Qué vendí?':'¿Quién murió?'];return r}
      r.txt=`Hay ${plural(l.length,'baja','bajas')}: ${plural(l.filter(x=>x.estado==='Vendido').length,'vendido','vendidos')} y ${plural(l.filter(x=>x.estado==='Muerto').length,'muerto','muertos')}.`;r.cards=l.slice(0,15);r.meta=Object.fromEntries(l.map(x=>[x.id,`${x.estado}${x.bajaFecha?' '+fmt(x.bajaFecha):''}${x.bajaPrecio?' · '+x.bajaPrecio:''}`]));r.sug=['¿Quiénes están a la venta?'];return r}
    if(tiene(q,/VENTA|VENDER/)){const l=activos().filter(x=>x.venta);r.txt=l.length?`A la venta hay ${plural(l.length,'caballo','caballos')}.`:'No hay caballos marcados a la venta.';r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,lineaCab(x)+(x.precio?' · '+x.precio:' · sin precio cargado')]));r.sug=['¿Cuántos caballos hay?'];return r}
    if(tiene(q,/CHIP/)&&tiene(q,/\bNO\b|\bSIN\b|FALTA/)){const l=activos().filter(x=>!fuera(x)&&!String(x.chip||'').replace(/\D/g,'')).sort(sortCab);r.txt=`${plural(l.length,'caballo no tiene','caballos no tienen')} el chip cargado. Si les pasás el lector, la app te pregunta de quién es y lo guarda.`;r.cards=l;return r}
    if(tiene(q,/FOTO/)){const l=activos().filter(x=>!fuera(x)&&!x.fotos?.length);r.txt=l.length?`Faltan fotos de ${plural(l.length,'caballo','caballos')}. Desde el Inicio, "Día de fotos" te los muestra por lugar.`:'Todos tienen foto.';r.cards=l.slice(0,15);return r}
    if(tiene(q,/PADRILLO/)){const l=listaPadrillos().filter(p=>!p.manada).sort((a,b)=>b.vivos.length-a.vivos.length);
      r.txt=`Usaste ${plural(l.length,'padrillo','padrillos')}. El que más hijos tiene hoy en la manada es ${l[0]?.nombre} (${l[0]?.vivos.length}).`;r.pads=l;r.sug=l.slice(0,2).map(p=>`¿Cuántos hijos tiene ${p.nombre}?`);return r}
    if(!tiene(q,/\b20\d\d\b/)&&(tiene(q,/CUANT|TOTAL|CABALLOS HAY|POTRANCAS/)||tiene(q,/QUIEN|CUALES|LISTA|MOSTRA|ESTAN EN|HAY EN/)&&tiene(q,/POTRILL|JUGADOR|MADRES|DOMA|DESCANSO|HECHURA|RECEPTORA|HEMBRA|MACHO|YEGUA/))&&!tiene(q,/HIJO|HIJA|HERMAN|SUELT|AGARRAD/)){const act=activos().filter(x=>!fuera(x));const cats=CATS.map(k=>[k,act.filter(x=>x.categoria===k).length]).filter(([,n])=>n);
      if(tiene(q,/HEMBRA|YEGUA|MACHO/)&&!tiene(q,/POTRILL|JUGADOR|MADRES|DOMA|DESCANSO|HECHURA/)){const h=act.filter(x=>x.sexo==='Hembra'),m=act.filter(x=>x.sexo==='Macho');
        r.txt=`De los ${act.length} caballos propios: ${plural(h.length,'hembra','hembras')} y ${plural(m.length,'macho','machos')}.`;r.cards=(tiene(q,/MACHO/)?m:tiene(q,/HEMBRA|YEGUA/)?h:[]).sort(sortCab);return r}
      const cat=CATS.map(k=>[k,act.filter(x=>x.categoria===k).length]).find(([k])=>tiene(q,new RegExp(norm(k).slice(0,6))));
      const potr=tiene(q,/POTRANC/)?'Hembra':null;const cat2=cat||(potr?['Potrillos']:null);
      if(cat2){let l=act.filter(x=>x.categoria===cat2[0]).sort(sortCab);const sx=potr||(tiene(q,/HEMBRA|YEGUA/)?'Hembra':tiene(q,/MACHO/)?'Macho':null);if(sx)l=l.filter(x=>x.sexo===sx);
        r.txt=l.length?`Hay ${l.length} en ${cat2[0]}${sx?` (${sx==='Hembra'?'hembras':'machos'})`:''}.`:`No hay ninguno en ${cat2[0]}${sx?' de ese sexo':''}.`;r.cards=l;
        r.meta=Object.fromEntries(l.map(x=>[x.id,[sexoTxt(x),x.nac?edadTxt(x):x.camada?'camada '+x.camada:'',x.lugar].filter(Boolean).join(' · ')]));return r}
      r.txt=`Hay ${act.length} caballos propios: `+cats.map(([k,n])=>n+' '+k.toLowerCase()).join(', ')+'.';r.sug=['¿Quiénes están preñadas?','¿Cuántos potrillos hay?','¿Quiénes están a la venta?'];return r}
    if(tiene(q,/SUELT|AGARRAD/)){const ag=tiene(q,/AGARRAD/),su=tiene(q,/SUELT|DESCANSO/);
      let l=activos().filter(x=>!fuera(x)&&sueltoAgarrado(x));
      if(ag&&!su)l=l.filter(x=>/^Agarrad/.test(sueltoAgarrado(x).tipo));else if(su&&!ag)l=l.filter(x=>/^Suelt/.test(sueltoAgarrado(x).tipo));
      l.sort((a,b)=>sueltoAgarrado(b).dias-sueltoAgarrado(a).dias);
      r.txt=l.length?`${ag&&!su?'Agarrados':su&&!ag?'Sueltos':'Sueltos y agarrados'}: ${plural(l.length,'caballo','caballos')}, con desde cuándo.`:`No hay ${ag&&!su?'agarrados':'sueltos'} con fecha cargada.`;
      if(l[0])r.txt+=` Hace más tiempo: ${l[0].nombre} (${sueltoAgarrado(l[0]).dias} días).`;
      r.cards=l;r.meta=Object.fromEntries(l.map(x=>[x.id,trabajoLinea(x)]));r.sug=[ag&&!su?'¿Quiénes están sueltos?':'¿Quiénes están agarrados?','¿Qué hay que hacer esta semana?'];return r}
    // camada de un año: "camada 2024", "los que nacieron en 2025"
    {const m=norm(q).match(/(CAMADA|NACIERON EN|NACIDOS EN|POTRILLOS|POTRILLOS DE|DEL|DE) (20\d\d)/);if(m&&tiene(q,/CAMADA|NACI|POTRILL/)){const y=+m[2],l=S.caballos.filter(x=>+x.camada===y).sort((a,b)=>(a.nac||'9').localeCompare(b.nac||'9'));
      const viv=l.filter(x=>x.estado==='Activo'),ma=viv.filter(x=>x.sexo==='Macho').length,he=viv.filter(x=>x.sexo==='Hembra').length;
      r.txt=l.length?`Camada ${y}: ${plural(l.length,'potrillo','potrillos')}, ${viv.length} vivos hoy${ma||he?' ('+[ma?plural(ma,'macho','machos'):'',he?plural(he,'hembra','hembras'):''].filter(Boolean).join(' y ')+')':''}.`:`No hay caballos de la camada ${y}.`;r.cards=l.sort(ordenHijos);return r}}
    // últimos eventos en general
    if(tiene(q,/ULTIM\w* (EVENTO|COSA|CARGA|NOVEDAD)|QUE SE HIZO|QUE PASO|NOVEDAD/)){const sem=tiene(q,/SEMANA/);let ev=[...S.eventos].sort((a,b)=>b.fecha.localeCompare(a.fecha));
      if(sem)ev=ev.filter(e=>e.fecha>=addDays(hoy(),-7));ev=ev.slice(0,sem?30:10);
      r.txt=sem?(ev.length?`En los últimos 7 días se cargaron ${plural(ev.length,'evento','eventos')}:`:'En los últimos 7 días no se cargó nada.'):'Lo último que se cargó:';r.lista=ev.map(e=>`${fmt(e.fecha)} · ${byId(e.caballoId)?.nombre||e.caballo||''} · ${e.detalle||e.tipo}`);return r}
    {const toks=limpio(q).trim().split(' ').filter(w=>w.length>=3&&!VOCAB.includes(w)&&!COMUNES.has(w));
      const ref=toks.map(w=>{const h=S.caballos.filter(x=>palSig(x.madre||'').join(' ')===w||palSig(x.padre||'').join(' ')===w);return h.length?{w,h}:null}).find(Boolean);
      if(ref){const nomRef=norm(ref.h[0].madre).includes(ref.w)?ref.h[0].madre:ref.h[0].padre;r.txt=`${nomRef} no está cargada como caballo de la manada, pero figura como ${norm(ref.h[0].madre).includes(ref.w)?'madre':'padre'} de ${ref.h.length===1?ref.h[0].nombre:plural(ref.h.length,'caballo','caballos')}.`;r.cards=ref.h.sort(ordenHijos);return r}}
    // una categoría con cualquier verbo ("pasame los potrillos", "edades de los de doma", "¿en qué lugar están los de doma?")
    {const cat=CATS.find(k=>tiene(q,new RegExp('\\b'+norm(k).slice(0,6))))||(tiene(q,/POTRANC/)?'Potrillos':null);
      if(cat){let l=activos().filter(x=>!fuera(x)&&x.categoria===cat).sort(sortCab);if(tiene(q,/POTRANC|HEMBRA/))l=l.filter(x=>x.sexo==='Hembra');else if(tiene(q,/MACHO/))l=l.filter(x=>x.sexo==='Macho');
        const lugs={};for(const x of l)lugs[x.lugar||'sin lugar']=(lugs[x.lugar||'sin lugar']||0)+1;
        r.txt=l.length?`${cat}: ${plural(l.length,'caballo','caballos')}${tiene(q,/DONDE|LUGAR|POTRERO/)?' — están en '+Object.entries(lugs).map(([k,n])=>`${k} (${n})`).join(', '):''}.`:`No hay ninguno en ${cat}.`;r.cards=l;
        r.meta=Object.fromEntries(l.map(x=>[x.id,[sexoTxt(x),x.nac?edadTxt(x):x.camada?'camada '+x.camada:'',x.lugar].filter(Boolean).join(' · ')]));return r}}
    if(tiene(q,/NOVEDAD|DE NUEVO|QUE HAY NUEVO/)){const ev=[...S.eventos].sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,10);r.txt='Lo último que se cargó:';r.lista=ev.map(e=>`${fmt(e.fecha)} · ${byId(e.caballoId)?.nombre||e.caballo||''} · ${e.detalle||e.tipo}`);return r}
    r.txt=tiene(q,/HIJO|HIJA|CRIA|PADRE|MADRE|ABUEL|HERMAN|EVENTO|EDAD|CHIP|PELAJE/)?'¿De qué caballo? Escribí el nombre o el número (por ejemplo "el 40").':'No te entendí. Probá con alguna de estas, o escribí el nombre de un caballo:';
    r.sug=SUGERENCIAS_INICIO;return r}

  // ----- un padrillo que no es de la manada -----
  if(pad&&!c){let h=pad.hijos.slice().sort(ordenHijos);if(tiene(q,/HIJAS|HEMBRAS/))h=h.filter(x=>x.sexo==='Hembra');else if(tiene(q,/MACHOS/))h=h.filter(x=>x.sexo==='Macho');
    if(tiene(q,/PADRE|MADRE|SANGRE|PEDIGR|ABUEL/)){r.txt=padresTxt({nombre:N,sexo:'Macho',padre:pad.sangre.padre,madre:pad.sangre.madre});r.pads=[pad];r.sug=[`¿Cuántos hijos tiene ${N}?`];return r}
    if(tiene(q,/PRENAD|POR NACER/)){const vac=activos().filter(x=>x.categoria==='Madres'&&estadoRepro(servUltimo(x.nombre)).k==='vac').length;r.txt=(pad.porNacer.length?`Preñadas de ${N}: ${pad.porNacer.length}.`:`No hay yeguas preñadas de ${N}.`)+(tiene(q,/VACIA/)?` Madres vacías: ${vac}.`:'');r.cards=pad.porNacer.map(s=>findByName(s.madre)).filter(Boolean);r.meta=Object.fromEntries(pad.porNacer.map(s=>[findByName(s.madre)?.id,s.fpp?'parto '+fmt(s.fpp):'']));return r}
    r.txt=(tiene(q,/QUIEN ES/)?padresTxt({nombre:N,sexo:'Macho',padre:pad.sangre.padre,madre:pad.sangre.madre})+' ':'')+resumenHijos(N,h)+(pad.porNacer.length?` Y ${pad.porNacer.length} por nacer.`:'');
    r.cards=h;r.pads=[pad];r.sug=[`¿Quiénes son los padres de ${N}?`,'¿Qué padrillos usé?'];return r}

  // ----- un caballo -----
  const nom=c.nombre;
  if((tiene(q,/DOMA|DOMADOR/)||tiene(qc,/ENTRO A DOMA|EN DOMA|DOMADOR/))&&!tiene(q,/HIJ/)){r.txt=c.categoria==='Doma'||c.domador||c.ingresoDoma?`${nom}: ${c.categoria==='Doma'?'está en doma':'estuvo en doma'}${c.domador?' con '+c.domador:''}${c.ingresoDoma?`, entró el ${fmt(c.ingresoDoma)} (hace ${diff(hoy(),c.ingresoDoma)} días)`:', sin fecha de entrada cargada'}${c.lugar?', en '+c.lugar:''}.`:`${nom} no está en doma (está en ${c.categoria}).`;r.cards=[c];return r}
  if(tiene(q,/CASTR/)){const e=S.eventos.filter(x=>x.caballoId===c.id&&norm(x.tipo).startsWith('CASTRA')).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];const o=/castrad/i.test(c.obs||'');
    r.txt=e?`Sí, ${nom} está castrado: se castró el ${fmt(e.fecha)}.`:o?`Sí: en las observaciones de ${nom} dice "${(c.obs.match(/[^·]*castrad[^·]*/i)||[''])[0].trim()}".`:c.sexo==='Hembra'?`${nom} es hembra.`:`No hay castración cargada de ${nom}.`;r.cards=[c];return r}
  if(tiene(q,/VACUN|DOSIS/)&&!tiene(q,/ULTIM/)){const ds=dosisPrenez(c),cs=ctrlDiasActivos(c).map(ct=>[ct.k,estadoSan(c,ct.k)]).filter(([,x])=>x.u);
    r.txt=ds.length||cs.length?`${nom}: `+[...ds.map(d=>`${d.k}: ${d.hecha?'dada el '+fmt(d.hecha.fecha):d.d<0?'tocaba el '+fmt(d.due)+' (no está cargada)':'toca el '+fmt(d.due)}`),...cs.map(([k,x])=>`${k}: próxima ${fmt(x.p)}`)].join(' · ')+'.':`${nom} no tiene vacunas pendientes con fecha.`;r.cards=[c];return r}
  if(tiene(q,/SERVICIOS/)||tiene(q,/CUANTOS SERVICIO/)){const l=S.servicios.filter(x=>norm(x.madre)===norm(nom)).sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
    r.txt=l.length?`${nom} tiene ${plural(l.length,'servicio cargado','servicios cargados')}:`:`${nom} no tiene servicios cargados.`;r.lista=l.map(x=>`${x.fecha?fmt(x.fecha):'sin fecha'} · ${x.padrillo||'—'}${x.tipo?' ('+x.tipo+')':''} · ${x.estado}${x.temporada?' · temporada '+x.temporada:''}`);r.cards=[c];return r}
  if(tiene(q,/\bJUEGA\b|JUGANDO|\bJUGO\b/)){const t2=trabajoLinea(c);r.txt=`${nom} está en ${c.categoria}${t2?' · '+t2.charAt(0).toLowerCase()+t2.slice(1):''}. Tiene ${plural(practicas(c),'práctica','prácticas')} y ${plural(torneos(c),'torneo','torneos')} cargados.`;r.cards=[c];return r}
  const esPrenez=tiene(q,/VACIA|PRENAD|PARA CUANDO|\bFPP\b|FECHA PROBABLE|NACE\b|NACERA|VA A NACER|VA A PARIR|POR PARIR/)||tiene(q,/PADRILLO/)&&tiene(q,/USO|USASTE|SIRVI|SERVICIO|INSEMIN/);r.sug=[`¿Quiénes son sus hermanos?`,`¿Qué eventos tiene registrados?`];
  if(!esPrenez&&tiene(q,/POTRILL|POTRANC|CRIA|HIJ/)&&tiene(q,/PADRILLO|PADRE/)){const h=hijosDe(nom).filter(x=>norm(x.madre)===norm(nom)).sort((a,b)=>(b.nac||String(b.camada||'')).localeCompare(a.nac||String(a.camada||'')))[0];
    r.txt=h?`El último ${h.sexo==='Hembra'?'potranca':'potrillo'} de ${nom} es ${h.nombre}${h.nac?' (nació el '+fmt(h.nac)+')':''}, de ${h.padre||'padre que no se sabe'}.`:`${nom} no tiene crías cargadas.`;r.cards=h?[h]:[];return r}
  if(!esPrenez&&tiene(q,/HIJO|HIJA|CRIA|PROGENIE|DESCENDEN|POTRILL|POTRANC/)&&!tiene(q,/PADRILLO/)){let h=hijosDe(nom).sort(ordenHijos);if(tiene(q,/POTRANC/))h=h.filter(x=>x.sexo!=='Macho');
    if(tiene(q,/HIJAS|HEMBRAS/))h=h.filter(x=>x.sexo==='Hembra');else if(tiene(q,/MACHOS/))h=h.filter(x=>x.sexo==='Macho');
    r.txt=h.length?resumenHijos(nom,h):`${nom} no tiene hijos cargados.`;r.cards=h;
    const s=S.servicios.find(x=>norm(x.madre)===norm(nom)&&x.estado==='Preñada');if(s)r.txt+=` Y está preñada de ${s.padrillo||'—'}${s.fpp?', pare para el '+fmt(s.fpp):''}.`;
    r.sug=[`¿Quiénes son los padres de ${nom}?`,'¿Quiénes son sus hermanos?'];return r}
  if(tiene(q,/BISABUEL|GENEALOG|PEDIGR|ARBOL/)){const a=abuelosDe(c),b=[a.abueloP,a.abuelaP,a.abueloM,a.abuelaM].map(x=>x?padresDeNombre(x):{});
    const bis=b.flatMap(x=>[x.padre,x.madre]).filter(Boolean);
    r.txt=`${padresTxt(c)} Abuelos: ${[a.abueloP,a.abuelaP,a.abueloM,a.abuelaM].filter(Boolean).join(', ')||'no se saben'}.${bis.length?` Bisabuelos que se conocen: ${bis.join(', ')}.`:''} En la ficha, abajo, está el árbol completo.`;r.cards=[c];return r}
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
  if(!esPrenez&&tiene(q,/PADRE|MADRE|PAPA|MAMA|SANGRE|DE QUIEN ES|PADRILLO/)){r.txt=padresTxt(c);
    if(tiene(q,/PADRILLO/)){const s=S.servicios.find(x=>norm(x.madre)===norm(nom)&&x.estado==='Preñada');if(s)r.txt+=` Está preñada de ${s.padrillo||'—'}.`}
    r.cards=[c.padre,c.madre].map(conLink).filter(Boolean).map(x=>x.c);r.sug=[`¿Quién es el abuelo paterno de ${nom}?`,'¿Quiénes son sus hermanos?'];return r}
  if(tiene(q,/SUELT|AGARRAD|VUELVE|JUGAR|DESCANSO/)){const t2=trabajoLinea(c);
    r.txt=t2?`${nom}: ${t2.charAt(0).toLowerCase()+t2.slice(1)}.${c.descansoHasta?` Volver a agarrar el ${fmt(c.descansoHasta)}.`:''}`:`De ${nom} no hay fecha de suelta ni de agarrada cargada (está en ${c.categoria}).`;r.cards=[c];return r}
  if(tiene(q,/SANIDAD|AL DIA|VENCID|COMO ESTA DE/)&&!tiene(q,/PARTO|PARE|PRENAD/)&&c.categoria==='Doma'){r.txt=`${nom} está en doma${c.lugar?' en '+c.lugar:''}: los de doma no se siguen en sanidad.`;r.cards=[c];return r}
  if(tiene(q,/SANIDAD|AL DIA|VENCID|COMO ESTA DE/)&&!tiene(q,/PARTO|PARE|PRENAD/)){const ts=['Desparasitación','Desvasada','Herrada','Muelas',...ctrlDiasActivos(c).map(ct=>ct.k).filter(k=>S.eventos.some(e=>e.caballoId===c.id&&e.tipo===k))].map(t=>[t,estadoSan(c,t)]);
    const pal={bad:'vencida',warn:'por vencer',ok:'al día',none:'sin dato'};r.txt=`Sanidad de ${nom}: `+ts.map(([t,x])=>`${t} ${x.no?x.txt.toLowerCase():pal[x.st]+(x.u?` (última ${fmt(x.u).slice(0,5)}${x.p?', próxima '+fmt(x.p).slice(0,5):''})`:'')}`).join(' · ')+'.';
    const ds=dosisPrenez(c).filter(d=>!d.hecha&&d.d<=30);if(ds.length)r.txt+=` Dosis de preñez sin cargar: ${ds.map(d=>d.k).join(', ')}.`;r.cards=[c];return r}
  if(tiene(q,/TOCA|HACER|PENDIENT|VENCE|PROXIM|CUANDO HAY QUE/)&&!tiene(q,/PARTO|PARE/)){const solo=tiene(q,/DESPARAS/)?'Desparasitación':tiene(q,/DESVAS/)?'Desvasada':tiene(q,/HERR/)?'Herrada':tiene(q,/MUELA/)?'Muelas':null;
    const ts=['Desparasitación','Desvasada','Herrada','Muelas'].filter(t=>!solo||t===solo).map(t=>[t,estadoSan(c,t)]).filter(([,x])=>x.p||solo);
    if(solo&&ts[0]&&!ts[0][1].p){r.txt=`${nom}: ${ts[0][1].txt==='No se hierra'?'no se hierra (por su categoría o ritmo)':ts[0][1].txt==='Desherrado'?'está desherrado':'no hay '+solo.toLowerCase()+' cargada para calcular la próxima'}.`;r.cards=[c];return r}
    r.txt=ts.length?`${nom}: `+ts.map(([t,x])=>`${t.toLowerCase()} ${x.d<0?`atrasada ${-x.d} días (tocaba el ${fmt(x.p)})`:x.d===0?'hoy':`el ${fmt(x.p)} (en ${x.d} días)`}`).join(' · ')+'.':`${nom} no tiene nada pendiente con fecha.`;r.cards=[c];return r}
  if(tiene(q,/NUMERO|SIGNIFICA/)&&!tiene(q,/CHIP/)){r.txt=c.rp&&c.rp!=='—'?`${nom} tiene el RP ${c.rp}${c.chip?` y su chip termina en …${String(c.chip).slice(-6)}`:''}. El número del nombre es el RP; no es el orden en la camada.`:`${nom} no tiene RP cargado.`;r.cards=[c];return r}
  if(tiene(q,/\bCHIP\b|\bRP\b|PELAJE|COLOR|SENAS|SEÑAS/)&&!tiene(q,/HIJO|PADRE|MADRE|ABUEL/)){r.txt=[tiene(q,/CHIP/)?`Chip: ${c.chip||'no cargado'}`:'',tiene(q,/\bRP\b/)?`RP: ${c.rp||'no cargado'}`:'',tiene(q,/PELAJE|COLOR/)?`Pelaje: ${c.pelaje||'no cargado'}`:'',tiene(q,/SENAS|SEÑAS/)?`Señas: ${c.obs||'no cargadas'}`:''].filter(Boolean).map(x=>nom+' · '+x).join('. ')+'.';r.cards=[c];return r}
  if(esPrenez||tiene(q,/PRENAD|PARTO|PARE|PARIR|SERVICIO|SIRV|INSEMIN|FALTA|CUANTOS DIAS/)){const s=servUltimo(nom);const st=estadoRepro(s);
    const cr=s&&(s.criaId&&byId(s.criaId)||(s.estado==='Parida'?S.caballos.find(x=>norm(x.madre)===norm(nom)&&+x.camada===+s.temporada):null));
    if(s&&s.estado==='Parida'){r.txt=`${nom} parió${cr?.nac?' el '+fmt(cr.nac):''}${cr?`: ${cr.nombre}${cr.sexo?' ('+cr.sexo.toLowerCase()+')':''}${cr.estado==='Muerto'?', que murió':''}`:''}. Era de ${s.padrillo||'—'}.`;r.cards=[cr,c].filter(Boolean);r.sug=[`¿Cuántos hijos tiene ${nom}?`,'¿Quiénes están preñadas?'];return r}
    r.txt=!s?`${nom} no tiene servicios cargados.`:st.k==='pre'?`${nom} está preñada de ${s.padrillo||'—'} (servida ${fmt(s.fecha)}).${st.v?` Va por el día ${st.v.dia} y la ventana de parto es del ${fmt(st.v.desde)} al ${fmt(st.v.hasta)}, lo más probable el ${fmt(st.v.prob)}.`:''}`:`${nom}: ${st.txt.toLowerCase()} (último servicio ${s.fecha?fmt(s.fecha):'—'}${s.padrillo?' con '+s.padrillo:''}).`;
    r.cards=[c];return r}
  if(c.estado==='Activo'&&tiene(q,/PRECIO|VALE|CUESTA|SALE/)){r.txt=c.precio?`${nom}: ${c.venta?'a la venta, ':''}precio ${c.precio}.`:`${nom} ${c.venta?'está a la venta pero ':''}no tiene precio cargado.`;r.cards=[c];return r}
  if(tiene(q,/PRACTICA|TORNEO/)){r.txt=`${nom}: ${plural(practicas(c),'práctica','prácticas')} y ${plural(torneos(c),'torneo','torneos')} cargados.`;r.cards=[c];return r}
  const evTipo=[['DESPARAS','Desparasitación'],['DESVAS','Desvasada'],['HERR','Herrada'],['CASTRA','Castración'],['VETERINAR','Veterinario'],['LESION','Lesión'],['ENFERM','Enfermedad'],['REVISION','Revisión'],['TACTO','Tacto / Eco'],['\\bECO','Tacto / Eco'],['INFLUENZA','Influenza'],['ENCEFALO','Encéfalo'],['ADENITIS','Adenitis'],['TETANO','Tétano'],['RINONEUMONITIS','Rinoneumonitis'],['SALMONELA','Salmonela'],['VACUN','Vacuna'],['MUELA','Muelas'],['ANEMIA','Anemia'],['PRACTICA','Práctica'],['TORNEO','Torneo']].find(([k])=>tiene(q,new RegExp(k)));
  if(evTipo||tiene(q,/EVENTO|HISTORIAL|QUE SE LE HIZO|ULTIM|REGISTR|QUE (LE )?PASO/)){let ev=S.eventos.filter(e=>e.caballoId===c.id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
    if(evTipo)ev=ev.filter(e=>e.tipo===evTipo[1]||norm(e.tipo).startsWith(evTipo[0]));
    r.txt=ev.length?(evTipo?`${evTipo[1]} de ${nom}: la última fue el ${fmt(ev[0].fecha)}${ev.length>1?` (hay ${ev.length} cargadas)`:''}.`:`${nom} tiene ${plural(ev.length,'evento','eventos')}. Los últimos:`):`${nom} no tiene ${evTipo?'registros de '+evTipo[1].toLowerCase()+' cargados':'eventos cargados'}.`;
    if(evTipo&&['Desparasitación','Desvasada','Herrada'].includes(evTipo[1])){const s2=estadoSan(c,evTipo[1]);
      if(s2.no)r.txt+=` ${s2.txt==='Desherrado'?'Ahora está desherrado.':'No se hierra por su categoría o ritmo.'}`;else if(s2.p)r.txt+=` La próxima ${s2.d<0?`está atrasada ${-s2.d} días (tocaba el ${fmt(s2.p)})`:s2.d===0?'toca hoy':`toca el ${fmt(s2.p)} (en ${s2.d} días)`}.`}
    r.lista=ev.slice(0,8).map(e=>`${fmt(e.fecha)} · ${e.detalle||e.tipo}${e.obs?' · '+e.obs:''}`);r.cards=[c];r.sug=['¿Quiénes son sus hermanos?',`¿Quiénes son los padres de ${nom}?`];return r}
  if(c.estado!=='Activo'&&tiene(q,/VENDI|PRECIO|COMPRADOR|CUANTO|MURIO|MUERT|BAJA/)){r.txt=`${nom}: ${bajaTxt(c).toLowerCase()}${c.bajaPrecio?', en '+c.bajaPrecio:''}${c.bajaComprador?', a '+c.bajaComprador:''}.${c.bajaObs?' '+c.bajaObs:''}`;r.cards=[c];return r}
  if(tiene(q,/EMBOCADURA|ENSILLA|RIENDA/)){r.txt=c.embocadura?`${nom} usa: ${c.embocadura}.`:`De ${nom} no está cargada la embocadura.`;r.cards=[c];return r}
  if(tiene(q,/EDAD|ANOS|CUANDO NACIO|NACIMIENTO|NACIO/)){r.txt=c.nac?(c.estado==='Activo'?`${nom} nació el ${fmt(c.nac)}: tiene ${edadTxt(c)}.`:`${nom} nació el ${fmt(c.nac)}. ${bajaTxt(c)}.`):c.camada?`De ${nom} no está la fecha de nacimiento; es de la camada ${c.camada}.`:`De ${nom} no se sabe la edad.`;r.cards=[c];return r}
  if(tiene(q,/DONDE|LUGAR|POTRERO/)){r.txt=`${nom} está en ${c.lugar||'(sin lugar cargado)'}, en ${c.categoria}.${trabajoLinea(c)?' '+trabajoLinea(c)+'.':''}`;r.cards=[c];return r}
  // datos generales (con "todo", "ficha completa", "info": más datos)
  if(tiene(q,/TODO|COMPLETA|INFO|DATOS|CONTAME|SABES/)){const e2=edad(c.nac),t2=trabajoLinea(c),st=c.sexo==='Hembra'?estadoRepro(servUltimo(c.nombre)):null,h=hijosDe(nom);
    const ul=S.eventos.filter(x=>x.caballoId===c.id).sort((a,b)=>b.fecha.localeCompare(a.fecha))[0];
    r.txt=[`${nom}${c.apodo?' ('+c.apodo+')':''}: ${[sexoTxt(c),c.pelaje].filter(Boolean).join(', ')||'sin sexo ni pelaje cargados'}.`,c.nac?(c.estado==='Activo'?`Nació el ${fmt(c.nac)} (${edadTxt(c)}).`:`Nació el ${fmt(c.nac)}.`):c.camada?`Camada ${c.camada}.`:'',padresTxt(c),
      c.estado==='Activo'?`Está en ${c.categoria}${c.lugar?', '+c.lugar:''}.`:`${bajaTxt(c)}.`,t2?t2+'.':'',st&&st.k!=='sin'?`Reproducción: ${st.txt.toLowerCase()}.`:'',h.length?`${plural(h.length,'cría cargada','crías cargadas')}.`:'',
      c.chip?`Chip ${c.chip}.`:'',c.rp?`RP ${c.rp}.`:'',c.embocadura?`Embocadura: ${c.embocadura}.`:'',c.obs?c.obs.replace(/\.\s*$/,'')+'.':'',ul?`Último evento: ${fmt(ul.fecha)} · ${ul.detalle||ul.tipo}.`:''].filter(Boolean).join(' ');r.cards=[c];return r}
  const e=edad(c.nac),act=c.estado==='Activo',datos=[sexoTxt(c),c.pelaje,act&&c.nac?edadTxt(c):c.camada?'camada '+c.camada:'',act?c.categoria:'',act?c.lugar:''].filter(Boolean).join(', ');
  const baja=c.estado!=='Activo'?` ${bajaTxt(c)}${c.bajaPrecio?' en '+c.bajaPrecio:''}${c.bajaObs?' · '+c.bajaObs.replace(/\.\s*$/,''):''}.`:'';
  r.txt=`${nom}: ${datos}.${baja} ${padresTxt(c).replace(nom+' es','Es')}${c.chip?' Chip '+c.chip+'.':''}${c.obs?' '+c.obs.replace(/\.\s*$/,'')+'.':''}`;r.cards=[c];
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
EXTRA_ACTS.aNueva=()=>{ASIS.msgs=[];ASIS.ultimo=null;ASIS.intencion='';ASIS.lista=null;pantallaAsistente()};
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
