/* Doña Cecilia — premios (pedido de Tomás el 3/11/2026: la Cala y la Contienda ganaron manta).
   Cada caballo puede tener premios: fecha, torneo, qué premio y una foto de las suyas (la de la manta).
   Se guardan en c.premios = [{fecha, torneo, premio, detalle, foto}]. Una estrellita los destaca en la lista y en la ficha.
   Nombres de los premios: BPP (Best Playing Pony) es como se dice en el polo en inglés; en Argentina, "Mejor caballo de la final".
   "Mejor producto" es el mejor caballo criado por un criador. */
const TIPOS_PREMIO=['Mejor caballo de la final (BPP)','Mejor producto','Mejor caballo del partido','Otro premio'];
const ICO_PREMIO='<span class="estrella" title="Ganó premios" aria-label="Ganó premios">★</span>';
const premiosDe=c=>[...(c?.premios||[])].sort((a,b)=>(b.fecha||'').localeCompare(a.fecha||''));
const premioTxt=p=>[p.premio,p.torneo,p.fecha?fmt(p.fecha):''].filter(Boolean).join(' · ');

function seccionPremios(c,polo){const l=premiosDe(c),ed=canWrite&&c.estado==='Activo';if(!l.length&&!(ed&&polo))return '';
  const fila=(p,k)=>`<div class="premio">${p.foto&&(c.fotos||[]).includes(p.foto)?`<button type="button" class="pfoto" data-act="mVer" data-id="${c.id}" data-k="${c.fotos.indexOf(p.foto)}" aria-label="Ver la foto del premio">${imgEnc(c,p.foto,'gimg')}</button>`:'<span class="pstar" aria-hidden="true">★</span>'}
    <div class="grow"><b>${esc(p.premio||'Premio')}</b><div class="sub">${esc([p.torneo,p.fecha?fmt(p.fecha):''].filter(Boolean).join(' · '))}</div>${p.detalle?`<div class="small muted">${esc(p.detalle)}</div>`:''}</div>
    ${ed?`<button type="button" class="btn sm" data-act="prBorrar" data-id="${c.id}" data-k="${k}">Borrar</button>`:''}</div>`;
  return sec(`Premios${l.length?' '+ICO_PREMIO:''}`,ed?`<button type="button" class="btn sm pri" data-act="prNuevo" data-id="${c.id}">+ Premio</button>`:'',
    l.length?`<div class="premios">${l.map((p,i)=>fila(p,(c.premios||[]).indexOf(p))).join('')}</div>`:'<div class="muted small">Todavía no tiene premios cargados. Si gana manta, cargalo con “+ Premio”.</div>')}

EXTRA_ACTS.prNuevo=d=>{const c=byId(d.id);if(!c)return;const fotos=c.fotos||[];
  const torneos=[...new Set([...S.caballos.flatMap(x=>(x.premios||[]).map(p=>p.torneo)),...S.eventos.filter(e=>e.tipo==='Torneo').map(e=>e.obs)].filter(Boolean))];
  form('Premio · '+c.nombre,[{k:'fecha',l:'Fecha',type:'date',v:hoy(),req:1},{k:'torneo',l:'Torneo (ej: Copa Provincia, final)',list:'dl-torneos',full:1},
    {k:'premio',l:'Premio',type:'select',opts:TIPOS_PREMIO,v:TIPOS_PREMIO[0]},{k:'detalle',l:'Detalle (opcional, ej: "manta", quién lo jugó)',full:1},
    ...(fotos.length?[{k:'foto',l:'Foto del premio',type:'select',opts:['Sin foto',...fotos.map((f,i)=>i?'Foto '+(i+1):'Foto 1 (portada)')],v:'Sin foto'}]:[])],
   async v=>{const i=fotos.length?['Sin foto',...fotos.map((f,i)=>i?'Foto '+(i+1):'Foto 1 (portada)')].indexOf(v.foto)-1:-1;
     const p={fecha:v.fecha,torneo:(v.torneo||'').trim(),premio:v.premio,detalle:(v.detalle||'').trim(),...(i>=0?{foto:fotos[i]}:{})};
     await db.collection('caballos').doc(c.id).update({premios:[...(c.premios||[]),p]});toast('Premio cargado ★');UI.ficha=c.id;renderFicha()},
   `<datalist id="dl-torneos">${torneos.map(t=>`<option value="${esc(t)}">`).join('')}</datalist>${fotos.length?'':'<p class="note">Para que quede la foto de la manta, primero subila en “Fotos y videos” y después elegila acá.</p>'}`)};
EXTRA_ACTS.prBorrar=async(d,t)=>{const c=byId(d.id),k=+d.k;if(!c?.premios?.[k])return;
  if(t.dataset.seguro!=='1'){t.dataset.seguro='1';t.textContent='¿Seguro?';setTimeout(()=>{if(t.isConnected){t.dataset.seguro='';t.textContent='Borrar'}},4000);return}
  await db.collection('caballos').doc(c.id).update({premios:c.premios.filter((_,i)=>i!==k)});toast('Premio borrado');UI.ficha=c.id;renderFicha()};

{const st=document.createElement('style');st.textContent=`
.estrella{color:#C9962B;font-size:1.05em;line-height:1}
.p-premio{background:#F6E7C1;color:#7A5A12}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .p-premio{background:#3A2F14;color:#E8C46A}}
:root[data-theme="dark"] .p-premio{background:#3A2F14;color:#E8C46A}
.premios{display:grid;gap:10px}
.premio{display:flex;align-items:center;gap:12px}.premio .grow{flex:1;min-width:0}
.pfoto{flex:none;width:64px;padding:0;border:0;background:none;cursor:pointer;border-radius:8px}.pfoto .gimg{width:64px;aspect-ratio:1;border-radius:8px}
.pstar{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:#F6E7C1;color:#C9962B}`;document.head.appendChild(st)}
