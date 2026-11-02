/* Doña Cecilia — fotos y videos de cada caballo (pedido de Tomás el 2/11/2026).
   - Tocás una foto y se ve grande: se pasa de una a otra deslizando, y se puede girar, cambiar de lugar, poner de portada o borrar.
     La primera foto es la portada (la que se ve en la lista y arriba de la ficha).
   - Videos cortos subidos a la app (hasta 50 MB, unos 30 a 40 segundos) y videos largos con un link (YouTube, Google Drive…).
   - Encuadrar: con el dedo se mueve la foto dentro del cuadro y se agranda o achica; queda fijo en la lista, la ficha
     y las imágenes para compartir. Se guarda en c.encuadres[foto] = {x, y, z} (punto de foco en % y zoom).
   Los videos se guardan en c.videos: {id} si se subió el archivo, {url} si es un link. */
const VIDEO_MAX_MB=50;

const encuadre=(c,f)=>({x:50,y:50,z:1,...((c.encuadres||{})[f]||{})});
const estiloEnc=e=>`object-position:${e.x}% ${e.y}%;transform:scale(${e.z});transform-origin:${e.x}% ${e.y}%`;
/* La foto con su encuadre (cls: thumb = redondita de la lista, cover = la de arriba de la ficha) */
function imgEnc(c,f,cls,alt=''){return `<span class="encw ${cls}"><img src="${fotoUrl(f)}" alt="${esc(alt)}" style="${estiloEnc(encuadre(c,f))}" loading="lazy"></span>`}
/* Lo mismo para las imágenes que se dibujan (ficha de venta, ficha de potrillo para WhatsApp) */
function dibujarFoto(x,im,dx,dy,W,H,e={x:50,y:50,z:1}){const k=Math.max(W/im.width,H/im.height)*e.z,sw=W/k,sh=H/k;
  x.drawImage(im,(im.width-sw)*e.x/100,(im.height-sh)*e.y/100,sw,sh,dx,dy,W,H)}
function seccionMedios(c){const ed=!!(assets&&canWrite),fotos=c.fotos||[],vids=c.videos||[];
  const botones=ed?`<div class="row mbtns"><label class="btn sm pri upl">+ Foto<input type="file" accept="image/*" multiple data-foto="${c.id}"></label><label class="btn sm upl">+ Video<input type="file" accept="video/*" data-video="${c.id}"></label><button type="button" class="btn sm" data-act="mLink" data-id="${c.id}">+ Link de video</button></div>`:'';
  const gal=fotos.length?`<div class="gal">${fotos.map((f,k)=>`<button type="button" class="gfoto" data-act="mVer" data-id="${c.id}" data-k="${k}" aria-label="Ver foto ${k+1} de ${esc(c.nombre)}">${imgEnc(c,f,'gimg')}${k?'':'<span class="gport">Portada</span>'}</button>`).join('')}</div>
    <p class="small muted" style="margin:0">${ed?'Tocá una foto para verla grande, encuadrarla, girarla o cambiarla de lugar.':'Tocá una foto para verla grande.'}</p>`:'';
  const del=(k)=>ed?`<button type="button" class="btn sm" data-act="mDelVid" data-id="${c.id}" data-k="${k}">Borrar</button>`:'';
  const vs=vids.length?`<div class="mvids">${vids.map((v,k)=>v.id
      ?`<figure class="gvid"><video controls playsinline preload="metadata" src="${fotoUrl(v.id)}"></video><figcaption><span class="small muted">${esc(v.nombre||'Video')}${v.fecha?' · '+fmt(v.fecha):''}</span>${del(k)}</figcaption></figure>`
      :`<div class="vlink"><a href="${esc(v.url)}" target="_blank" rel="noopener"><span class="vplay" aria-hidden="true">▶</span><span class="grow"><b>${esc(v.titulo||'Video')}</b><span class="small muted">${esc(dominio(v.url))}${v.fecha?' · '+fmt(v.fecha):''}</span></span></a>${del(k)}</div>`).join('')}</div>`:'';
  const vacio=!fotos.length&&!vids.length?`<div class="muted small">${ed?'Todavía no hay fotos ni videos. Con “+ Foto” podés sacarla con el celular.':'Sin fotos.'}</div>`:'';
  return sec('Fotos y videos','',botones+gal+vs+vacio)}
const dominio=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}};

/* ---------- ver en grande ---------- */
const VISOR={id:null,k:0};
function visorAbrir(id,k){VISOR.id=id;VISOR.k=k;visorDibujar()}
function visorCerrar(){VISOR.id=null;$('#visor')?.remove()}
function visorDibujar(){const c=byId(VISOR.id),fotos=c?.fotos||[];if(!c||!fotos.length){visorCerrar();return}
  VISOR.k=Math.max(0,Math.min(fotos.length-1,VISOR.k));const k=VISOR.k,ed=!!(assets&&canWrite),n=fotos.length;
  let el=$('#visor');if(!el){el=document.createElement('div');el.id='visor';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);visorGestos(el)}
  el.innerHTML=`<div class="vtop"><span>${esc(c.nombre)} · ${k+1} de ${n}${k?'':' · portada'}</span><button type="button" class="vx" data-act="mCerrar" aria-label="Cerrar">×</button></div>
    <div class="vimg"><img src="${fotoUrl(fotos[k])}" alt="Foto ${k+1} de ${esc(c.nombre)}">
      ${n>1?`<button type="button" class="vnav vprev" data-act="mPaso" data-d="-1" aria-label="Foto anterior" ${k?'':'disabled'}>‹</button><button type="button" class="vnav vnext" data-act="mPaso" data-d="1" aria-label="Foto siguiente" ${k<n-1?'':'disabled'}>›</button>`:''}</div>
    ${ed?`<div class="vbar"><button type="button" class="btn sm" data-act="mMover" data-d="-1" ${k?'':'disabled'}>◀ Mover</button><button type="button" class="btn sm" data-act="mMover" data-d="1" ${k<n-1?'':'disabled'}>Mover ▶</button>
      <button type="button" class="btn sm" data-act="mEncuadre">⤢ Encuadrar</button><button type="button" class="btn sm" data-act="mGirar">↻ Girar</button>${k?'<button type="button" class="btn sm" data-act="mPortada">Portada</button>':''}<button type="button" class="btn sm" data-act="mBorrar">Borrar</button></div>`:''}`}
function visorGestos(el){let x0=null;
  el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  el.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50){VISOR.k+=dx<0?1:-1;visorDibujar()}},{passive:true})}
document.addEventListener('keydown',e=>{if(!VISOR.id)return;
  if(e.key==='Escape'){e.stopPropagation();visorCerrar()}else if(e.key==='ArrowRight'){VISOR.k++;visorDibujar()}else if(e.key==='ArrowLeft'){VISOR.k--;visorDibujar()}},true);
async function guardarFotos(c,fotos,k,msg){await db.collection('caballos').doc(c.id).update({fotos});c.fotos=fotos;VISOR.k=k;visorDibujar();if(msg)toast(msg)}

EXTRA_ACTS.mVer=d=>visorAbrir(d.id,+d.k);
EXTRA_ACTS.mCerrar=()=>visorCerrar();
EXTRA_ACTS.mPaso=d=>{VISOR.k+=+d.d;visorDibujar()};
EXTRA_ACTS.mMover=async d=>{const c=byId(VISOR.id),f=[...c.fotos],k=VISOR.k,j=k+(+d.d);if(j<0||j>=f.length)return;[f[k],f[j]]=[f[j],f[k]];await guardarFotos(c,f,j,j===0?'Ahora es la portada':'')};
EXTRA_ACTS.mPortada=async()=>{const c=byId(VISOR.id),k=VISOR.k,f=c.fotos[k];await guardarFotos(c,[f,...c.fotos.filter((_,i)=>i!==k)],0,'Portada cambiada')};
EXTRA_ACTS.mBorrar=async(d,t)=>{const c=byId(VISOR.id),k=VISOR.k,f=c.fotos[k];
  if(t.dataset.seguro!=='1'){t.dataset.seguro='1';t.textContent='¿Seguro? Tocá de nuevo';setTimeout(()=>{if(t.isConnected){t.dataset.seguro='';t.textContent='Borrar'}},4000);return}
  await sinEncuadre(c,f);await guardarFotos(c,c.fotos.filter((_,i)=>i!==k),k,'Foto borrada');try{await assets.delete(f)}catch(e){}};
async function sinEncuadre(c,f){if(!(c.encuadres||{})[f])return;const en={...c.encuadres};delete en[f];await db.collection('caballos').doc(c.id).update({encuadres:en});c.encuadres=en}

/* ---------- encuadrar ---------- */
const ENC={e:null};
EXTRA_ACTS.mEncuadre=()=>{const c=byId(VISOR.id),f=c.fotos[VISOR.k];ENC.e=encuadre(c,f);
  const el=document.createElement('div');el.id='encuadre';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.innerHTML=`<div class="vtop"><span>Encuadrar · ${esc(c.nombre)}</span><button type="button" class="vx" data-act="mEncCancelar" aria-label="Cancelar">×</button></div>
    <div class="ebody"><p class="small">Mové la foto con el dedo y agrandala o achicala. Así queda en la ficha y en la lista.</p>
      <div class="emarco"><img src="${fotoUrl(f)}" alt="" draggable="false"></div>
      <div class="erow"><span class="small">Achicar</span><input type="range" id="enc-z" min="1" max="3" step="0.05" value="${ENC.e.z}" aria-label="Agrandar o achicar"><span class="small">Agrandar</span></div>
      <div class="erow"><span class="encw thumb eprev"><img src="${fotoUrl(f)}" alt=""></span><span class="small">Así se ve en la lista</span></div>
      <div class="erow ebtns"><button type="button" class="btn sm" data-act="mEncCentrar">Centrar</button><button type="button" class="btn sm" data-act="mEncCancelar">Cancelar</button><button type="button" class="btn sm pri" data-act="mEncListo">Listo</button></div></div>`;
  document.body.appendChild(el);encPintar();
  const marco=el.querySelector('.emarco'),img=marco.querySelector('img');let p0=null;
  marco.addEventListener('pointerdown',ev=>{p0={x:ev.clientX,y:ev.clientY,e:{...ENC.e}};marco.setPointerCapture(ev.pointerId)});
  marco.addEventListener('pointermove',ev=>{if(!p0||!img.naturalWidth)return;const W=marco.clientWidth,H=marco.clientHeight,s=Math.max(W/img.naturalWidth,H/img.naturalHeight)*ENC.e.z;
    const ox=img.naturalWidth*s-W,oy=img.naturalHeight*s-H,lim=v=>Math.max(0,Math.min(100,v));
    ENC.e.x=ox>1?lim(p0.e.x-(ev.clientX-p0.x)/ox*100):50;ENC.e.y=oy>1?lim(p0.e.y-(ev.clientY-p0.y)/oy*100):50;encPintar()});
  for(const t of ['pointerup','pointercancel'])marco.addEventListener(t,()=>{p0=null});
  marco.addEventListener('wheel',ev=>{ev.preventDefault();ENC.e.z=Math.max(1,Math.min(3,ENC.e.z-ev.deltaY/500));el.querySelector('#enc-z').value=ENC.e.z;encPintar()},{passive:false});
  el.querySelector('#enc-z').addEventListener('input',ev=>{ENC.e.z=+ev.target.value;encPintar()})};
function encPintar(){for(const i of document.querySelectorAll('#encuadre .emarco img,#encuadre .eprev img'))i.style.cssText=estiloEnc(ENC.e)}
EXTRA_ACTS.mEncCentrar=()=>{ENC.e={x:50,y:50,z:1};const z=$('#enc-z');if(z)z.value=1;encPintar()};
EXTRA_ACTS.mEncCancelar=()=>{$('#encuadre')?.remove()};
EXTRA_ACTS.mEncListo=async()=>{const c=byId(VISOR.id),f=c.fotos[VISOR.k],r=v=>Math.round(v*10)/10,e={x:r(ENC.e.x),y:r(ENC.e.y),z:Math.round(ENC.e.z*100)/100};
  const en={...(c.encuadres||{})};if(e.x===50&&e.y===50&&e.z===1)delete en[f];else en[f]=e;
  await db.collection('caballos').doc(c.id).update({encuadres:en});c.encuadres=en;$('#encuadre')?.remove();toast('Encuadre guardado');if(UI.ficha===c.id)renderFicha();visorDibujar()};
/* Girar: se vuelve a guardar la foto girada 90° (así se ve bien en todos lados) y se borra la vieja */
EXTRA_ACTS.mGirar=async(d,t)=>{const c=byId(VISOR.id),k=VISOR.k,f=c.fotos[k];if(t.disabled)return;t.disabled=true;t.textContent='Girando…';
  try{const blob=await (await fetch(fotoUrl(f))).blob(),bmp=await createImageBitmap(blob),cv=document.createElement('canvas');cv.width=bmp.height;cv.height=bmp.width;
    const x=cv.getContext('2d');x.translate(cv.width,0);x.rotate(Math.PI/2);x.drawImage(bmp,0,0);
    const nueva=await new Promise((r,j)=>cv.toBlob(b=>b?r(b):j(new Error('canvas')),'image/jpeg',.9));const {id}=await assets.upload(nueva,{type:'image/jpeg'});
    const fotos=[...c.fotos];fotos[k]=id;await sinEncuadre(c,f);await guardarFotos(c,fotos,k,'Foto girada');try{await assets.delete(f)}catch(e){}}
  catch(e){console.error(e);toast(navigator.onLine?'No se pudo girar la foto. Probá de nuevo.':'Para girar la foto necesitás señal.');if(t.isConnected){t.disabled=false;t.textContent='↻ Girar'}}};

/* ---------- videos ---------- */
document.addEventListener('change',async e=>{const el=e.target;if(!el.dataset?.video||!el.files?.length)return;const c=byId(el.dataset.video),f=el.files[0];el.value='';if(!c)return;
  if(!navigator.onLine){toast('Sin señal: el video queda en tu galería, subilo cuando tengas señal');return}
  const mb=f.size/1048576;if(mb>VIDEO_MAX_MB){toast(`El video pesa ${Math.round(mb)} MB y el máximo es ${VIDEO_MAX_MB} MB (unos 30 a 40 segundos). Recortalo o subilo a YouTube o Drive y usá “+ Link de video”.`);return}
  toast('Subiendo video…');
  try{const {id}=await assets.upload(f,{type:f.type||'video/mp4'});
    await db.collection('caballos').doc(c.id).update({videos:[...(c.videos||[]),{id,nombre:f.name.replace(/\.[^.]+$/,''),fecha:hoy(),mb:Math.round(mb*10)/10}]});toast('Video agregado');UI.ficha=c.id;renderFicha()}
  catch(err){console.error(err);toast('No se pudo subir el video. Probá de nuevo con señal.')}});
EXTRA_ACTS.mLink=d=>{const c=byId(d.id);if(!c)return;
  form('Link de video · '+c.nombre,[{k:'url',l:'Link (YouTube, Google Drive, WhatsApp…)',req:1,full:1},{k:'titulo',l:'Título (opcional, ej: "Doma 10/11")',full:1}],
    async v=>{let u=String(v.url||'').trim();if(!/^https?:\/\//i.test(u))u='https://'+u;if(!dominio(u)){toast('Ese link no parece válido. Copialo de nuevo.');return}
      await db.collection('caballos').doc(c.id).update({videos:[...(c.videos||[]),{url:u,titulo:(v.titulo||'').trim(),fecha:hoy()}]});toast('Link agregado');UI.ficha=c.id;renderFicha()},
    '<p class="note">Para videos largos: subilo a YouTube (como “oculto”) o a Google Drive y pegá acá el link. No ocupa lugar en la app.</p>')};
EXTRA_ACTS.mDelVid=async(d,t)=>{const c=byId(d.id),k=+d.k,v=(c?.videos||[])[k];if(!v)return;
  if(t.dataset.seguro!=='1'){t.dataset.seguro='1';t.textContent='¿Seguro?';setTimeout(()=>{if(t.isConnected){t.dataset.seguro='';t.textContent='Borrar'}},4000);return}
  await db.collection('caballos').doc(c.id).update({videos:c.videos.filter((_,i)=>i!==k)});if(v.id)try{await assets.delete(v.id)}catch(e){}toast('Video borrado');UI.ficha=c.id;renderFicha()};

{const st=document.createElement('style');st.textContent=`
.mbtns{margin-bottom:10px;flex-wrap:wrap}.mbtns .upl{text-transform:none;letter-spacing:0}
.gfoto{position:relative;display:block;padding:0;border:0;background:none;cursor:pointer;border-radius:8px}
.gfoto .gimg{display:block;width:100%;aspect-ratio:1;border-radius:8px;background:var(--surface2)}
.encw{display:block;overflow:hidden;position:relative}.encw img{display:block;width:100%;height:100%;object-fit:cover;max-width:none}
.encw.thumb{display:inline-block}.encw.cover{aspect-ratio:4/3;max-height:340px;height:auto}
#encuadre{position:fixed;inset:0;z-index:100001;background:#050505;color:#fff;display:flex;flex-direction:column;overflow:auto;
  padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
#encuadre .vtop{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;font-size:14px}
#encuadre .vx{background:none;border:0;color:#fff;font-size:32px;line-height:1;width:44px;height:44px;cursor:pointer}
#encuadre .ebody{display:grid;gap:14px;padding:0 16px 20px;max-width:560px;width:100%;margin:0 auto;box-sizing:border-box}
#encuadre .ebody p{margin:0;color:#ccc}
#encuadre .emarco{position:relative;overflow:hidden;aspect-ratio:4/3;border-radius:12px;background:#222;touch-action:none;cursor:grab;outline:2px solid rgba(255,255,255,.6)}
#encuadre .emarco img{width:100%;height:100%;object-fit:cover;display:block;max-width:none;user-select:none;-webkit-user-drag:none;pointer-events:none}
#encuadre .erow{display:flex;align-items:center;gap:10px}#encuadre .erow input{flex:1}
#encuadre .ebtns{justify-content:flex-end}#encuadre .btn{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.25)}#encuadre .btn.pri{background:#fff;color:#111}
.gfoto:focus-visible{outline:2px solid var(--fg);outline-offset:2px}
.gport{position:absolute;left:6px;bottom:6px;font-size:11px;font-weight:600;padding:2px 7px;border-radius:999px;background:rgba(0,0,0,.6);color:#fff}
.gal+p{margin-top:6px!important}
.mvids{display:grid;gap:10px;margin-top:12px}
.gvid{margin:0;display:grid;gap:6px}.gvid video{width:100%;max-height:60vh;border-radius:10px;background:#000}
.gvid figcaption,.vlink{display:flex;align-items:center;gap:8px;justify-content:space-between}
.vlink{padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}
.vlink a{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;min-width:0;flex:1}
.vlink .grow{display:grid;min-width:0}.vlink b,.vlink .small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.vplay{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--fg);color:var(--bg);font-size:13px}
#visor{position:fixed;inset:0;z-index:100000;background:#050505;color:#fff;display:flex;flex-direction:column;
  padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)}
#visor .vtop{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;font-size:14px}
#visor .vx{background:none;border:0;color:#fff;font-size:32px;line-height:1;width:44px;height:44px;cursor:pointer}
#visor .vimg{position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
#visor .vimg img{max-width:100%;max-height:100%;object-fit:contain}
#visor .vnav{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:64px;border:0;border-radius:10px;background:rgba(255,255,255,.12);color:#fff;font-size:34px;cursor:pointer}
#visor .vnav:disabled{opacity:.25;cursor:default}#visor .vprev{left:8px}#visor .vnext{right:8px}
#visor .vbar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:12px 14px 16px}
#visor .vbar .btn{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.25)}
#visor .vbar .btn:disabled{opacity:.35}`;document.head.appendChild(st)}
