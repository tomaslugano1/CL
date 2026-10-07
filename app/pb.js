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
