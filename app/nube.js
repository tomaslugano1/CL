/* Doña Cecilia — conexión con la nube (Supabase).
   La app guarda todo primero en el celular (así funciona sin señal) y cada tanto
   sube los cambios pendientes y baja lo que cargaron los demás.
   Cada registro vive en la tabla "registros" como (coleccion, id, data). */
(function(){
  const CFG=window.DC_CONFIG||{};
  const LS_DATOS='dc-nube-datos',LS_PEND='dc-nube-pendientes',LS_ULT='dc-nube-ultima',LS_YO='dc-nube-yo';
  const leer=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
  const guardar=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}};
  const clon=v=>v==null?v:JSON.parse(JSON.stringify(v));

  let D=leer(LS_DATOS)||{};   // {coleccion:{id:datos}}
  let P=leer(LS_PEND)||{};    // {"coleccion/id":{d:datos|null,t:marca}}  cambios sin subir
  let yo=leer(LS_YO);         // {id,email,nombre}
  const persistir=()=>{guardar(LS_DATOS,D);guardar(LS_PEND,P)};

  const configurado=CFG.url&&CFG.anonKey&&!/PEGAR/.test(CFG.url+CFG.anonKey);
  const sb=configurado?supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true}}):null;

  /* ---------- avisar a la app cuando cambian los datos ---------- */
  const subs=[];
  const avisar=()=>setTimeout(()=>subs.forEach(s=>s()),0);
  const snapDoc=(id,d)=>({id,exists:!!d,data:()=>clon(d)||undefined,metadata:{fromCache:false,hasPendingWrites:false}});

  function escribir(col,id,d){
    if(d==null){if(D[col])delete D[col][id]}else (D[col]=D[col]||{})[id]=clon(d);
    P[col+'/'+id]={d:clon(d),t:Date.now()+Math.random()};
    persistir();avisar();estado();programarSync(1500);
  }
  function docRef(col,id){return{id,path:col+'/'+id,
    get:async()=>snapDoc(id,(D[col]||{})[id]),
    set:async v=>escribir(col,id,v),
    update:async v=>{const c=(D[col]||{})[id];if(!c)throw{code:'invalid_argument',message:'no existe'};escribir(col,id,Object.assign(clon(c),clon(v)))},
    delete:async()=>escribir(col,id,null),
    onSnapshot:next=>{const f=()=>next(snapDoc(id,(D[col]||{})[id]));subs.push(f);setTimeout(f,0);return()=>{const i=subs.indexOf(f);if(i>=0)subs.splice(i,1)}}}}
  function colRef(col){const docs=()=>Object.keys(D[col]||{}).sort().map(k=>snapDoc(k,D[col][k]));
    const nuevoId=()=>'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    return{path:col,doc:id=>docRef(col,id||nuevoId()),
      add:async v=>{const r=docRef(col,nuevoId());await r.set(v);return r},
      get:async()=>{const d=docs();return{docs:d,size:d.length,empty:!d.length}},
      onSnapshot:next=>{const f=()=>{const d=docs();next({docs:d,size:d.length,empty:!d.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}})};subs.push(f);setTimeout(f,0);return()=>{const i=subs.indexOf(f);if(i>=0)subs.splice(i,1)}}}}
  const db={collection:colRef,doc:p=>{const [c,i]=p.split('/');return docRef(c,i)}};

  /* ---------- sincronización ---------- */
  let sincronizando=false,otraVez=false,timer=null,ultimoError='',ultimaOk=leer('dc-nube-ultima-ok');
  function programarSync(ms){clearTimeout(timer);timer=setTimeout(sync,ms)}
  async function sync(){
    if(!sb||!yo)return;
    if(sincronizando){otraVez=true;return}
    if(!navigator.onLine){ultimoError='sin señal';estado();return}
    sincronizando=true;estado();
    try{
      const {data:{session}}=await sb.auth.getSession();
      if(!session){ultimoError='sesión vencida';mostrarLogin('Tu sesión venció. Volvé a entrar (no se pierde nada de lo cargado).');return}
      const ult=leer(LS_ULT);
      // 1) subir lo pendiente
      const foto={...P},claves=Object.keys(foto);
      for(let i=0;i<claves.length;i+=300){
        const filas=claves.slice(i,i+300).map(k=>{const j=k.indexOf('/');const p=foto[k];return{coleccion:k.slice(0,j),id:k.slice(j+1),data:p.d,borrado:p.d==null}});
        const {error}=await sb.from('registros').upsert(filas,{onConflict:'coleccion,id'});
        if(error)throw error;
      }
      for(const k of claves)if(P[k]&&P[k].t===foto[k].t)delete P[k];
      persistir();
      // 2) bajar lo que cargaron los demás
      const desde=ult?new Date(new Date(ult).getTime()-120000).toISOString():'1970-01-01T00:00:00Z';
      let max=ult,cambio=false;
      for(let from=0;;from+=1000){
        const {data,error}=await sb.from('registros').select('coleccion,id,data,borrado,actualizado').gt('actualizado',desde).order('actualizado').range(from,from+999);
        if(error)throw error;
        for(const r of data){
          if(!max||r.actualizado>max)max=r.actualizado;
          if(P[r.coleccion+'/'+r.id])continue; // hay un cambio local más nuevo esperando subir
          if(r.borrado||r.data==null){if(D[r.coleccion]&&D[r.coleccion][r.id]){delete D[r.coleccion][r.id];cambio=true}}
          else{const prev=(D[r.coleccion]||{})[r.id];if(JSON.stringify(prev)!==JSON.stringify(r.data)){(D[r.coleccion]=D[r.coleccion]||{})[r.id]=r.data;cambio=true}}
        }
        if(data.length<1000)break;
      }
      if(max)guardar(LS_ULT,max);
      persistir();if(cambio)avisar();
      ultimoError='';ultimaOk=new Date().toISOString();guardar('dc-nube-ultima-ok',ultimaOk);
    }catch(e){console.error(e);ultimoError=e?.message||'error';}
    finally{sincronizando=false;estado();if(otraVez){otraVez=false;programarSync(500)}}
  }
  window.addEventListener('online',()=>programarSync(300));
  window.addEventListener('offline',estado);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)programarSync(300)});
  setInterval(()=>{if(!document.hidden)sync()},30000);

  /* ---------- fotos (se suben solo con señal) ---------- */
  /* ---------- clave del calendario de recordatorios (tabla calendario_clave, ver supabase/recordatorios.sql) ---------- */
  window.DC_CLAVE_CAL=async()=>{if(!sb)return null;const {data,error}=await sb.from('calendario_clave').select('clave').limit(1);if(error)throw error;return data?.[0]?.clave||null};

  window.DC_FOTO_URL=f=>sb?CFG.url.replace(/\/$/,'')+'/storage/v1/object/public/fotos/'+encodeURIComponent(f):'';
  const assets={
    upload:async(blob,opt)=>{
      if(!navigator.onLine){alert('Para subir fotos necesitás señal. Los demás datos sí se pueden cargar sin señal.');throw new Error('sin señal')}
      const id=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');
      const {error}=await sb.storage.from('fotos').upload(id,blob,{contentType:opt?.type||blob.type||'image/jpeg'});
      if(error)throw error;return{id}},
    delete:async id=>{await sb.storage.from('fotos').remove([id])}};

  /* ---------- quién está usando la app ---------- */
  const usuario={
    id:async()=>yo?.id||null,
    can:async()=>true,
    me:async()=>({name:yo?.nombre||''}),
    profiles:async ids=>{const o={};for(const i of ids){const u=(D.usuarios||{})[i];o[i]={name:u?.nombre||'alguien'}}return o}};
  const downloads={save:async({filename,data})=>{const b=data instanceof Blob?data:new Blob([data]);const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);return{status:'saved'}}};

  /* ---------- pantalla de ingreso ---------- */
  let listo,listoRes;listo=new Promise(r=>listoRes=r);
  const css=`#dc-login{position:fixed;inset:0;z-index:1000;background:#0E0E0E;color:#F7F7F5;display:grid;place-items:center;padding:16px;font-family:Inter,system-ui,sans-serif}
#dc-login form{width:100%;max-width:340px;display:flex;flex-direction:column;gap:12px}
#dc-login img{width:120px;margin:0 auto 6px;border-radius:8px;background:#fff}
#dc-login h1{font-family:'Playfair Display',Georgia,serif;text-align:center;margin:0 0 6px;font-size:1.7rem}
#dc-login input{font:inherit;font-size:1rem;padding:12px;border-radius:8px;border:1px solid #444;background:#1A1A1A;color:#F7F7F5;width:100%}
#dc-login button{font:600 1rem Inter,system-ui,sans-serif;padding:12px;border-radius:8px;border:0;background:#F7F7F5;color:#0E0E0E;cursor:pointer}
#dc-login p{margin:0;font-size:.85rem;opacity:.85;text-align:center}
#dc-login .err{color:#EE8F7E;opacity:1}
#dc-estado{position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:900;font:500 .75rem Inter,system-ui,sans-serif;background:#0E0E0E;color:#F7F7F5;border:1px solid #333;border-radius:20px;padding:6px 12px;cursor:pointer;opacity:.92}
#dc-estado.pend{background:#946300;border-color:#946300}
#dc-menu{position:fixed;left:12px;bottom:calc(52px + env(safe-area-inset-bottom,0px));z-index:901;background:#1A1A1A;color:#F7F7F5;border:1px solid #333;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:4px;font:500 .85rem Inter,system-ui,sans-serif;min-width:220px}
#dc-menu button{font:inherit;text-align:left;background:none;border:0;color:inherit;padding:8px 10px;border-radius:6px;cursor:pointer}
#dc-menu button:hover{background:#2A2A2A}
#dc-menu small{padding:4px 10px;opacity:.7}`;
  function montarCss(){if(document.getElementById('dc-css'))return;const s=document.createElement('style');s.id='dc-css';s.textContent=css;document.head.appendChild(s)}

  function mostrarLogin(msg){
    montarCss();let el=document.getElementById('dc-login');if(el)el.remove();
    el=document.createElement('div');el.id='dc-login';
    if(!configurado){el.innerHTML='<form><h1>Doña Cecilia</h1><p class="err">Falta conectar la base de datos: completá el archivo <b>config.js</b> (ver LEEME).</p></form>';document.body.appendChild(el);return}
    el.innerHTML=`<form autocomplete="on"><img src="logo.jpg" alt=""><h1>Doña Cecilia</h1>
      ${msg?`<p>${msg}</p>`:''}
      <input id="dc-mail" type="email" placeholder="Tu mail" autocomplete="username" required value="${yo?.email||''}">
      <input id="dc-pass" type="password" placeholder="Contraseña" autocomplete="current-password" required>
      <button type="submit">Entrar</button><p class="err" id="dc-err"></p></form>`;
    document.body.appendChild(el);
    el.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const err=el.querySelector('#dc-err'),btn=el.querySelector('button');
      if(!navigator.onLine){err.textContent='Para entrar la primera vez necesitás señal.';return}
      btn.disabled=true;btn.textContent='Entrando…';err.textContent='';
      const email=el.querySelector('#dc-mail').value.trim().toLowerCase(),password=el.querySelector('#dc-pass').value;
      const {data,error}=await sb.auth.signInWithPassword({email,password});
      if(error){btn.disabled=false;btn.textContent='Entrar';err.textContent=/invalid/i.test(error.message)?'Mail o contraseña incorrectos.':'No se pudo entrar: '+error.message;return}
      entrar(data.user);el.remove()}}

  function entrar(u){
    const cambioDeUsuario=yo&&yo.id!==u.id;
    if(cambioDeUsuario&&Object.keys(P).length){/* no debería pasar: al salir se suben los cambios */}
    const nombre=(D.usuarios||{})[u.id]?.nombre||u.user_metadata?.nombre||(u.email||'').split('@')[0];
    yo={id:u.id,email:u.email,nombre};guardar(LS_YO,yo);
    if(!(D.usuarios||{})[u.id])escribir('usuarios',u.id,{nombre,email:u.email});
    listoRes();montarEstado();sync();
  }

  async function salir(){
    if(Object.keys(P).length){
      if(!navigator.onLine){alert('Tenés cambios sin subir y no hay señal. Esperá a tener señal antes de salir, así no se pierden.');return}
      await sync();if(Object.keys(P).length&&!confirm('Hay cambios que no se pudieron subir. Si salís se pierden. ¿Salir igual?'))return}
    try{await sb.auth.signOut()}catch(e){}
    for(const k of [LS_DATOS,LS_PEND,LS_ULT,LS_YO,'dc-nube-ultima-ok'])localStorage.removeItem(k);
    location.reload()}

  /* ---------- cartelito de estado (abajo a la izquierda) ---------- */
  function montarEstado(){montarCss();if(document.getElementById('dc-estado'))return;
    const b=document.createElement('button');b.id='dc-estado';b.type='button';b.onclick=menu;document.body.appendChild(b);estado()}
  function estado(){const b=document.getElementById('dc-estado');if(!b)return;const n=Object.keys(P).length;
    b.classList.toggle('pend',n>0);
    b.textContent=sincronizando?'⟳ Sincronizando…':n?(navigator.onLine?`⟳ ${n} cambio${n>1?'s':''} por subir`:`● Sin señal · ${n} cambio${n>1?'s':''} guardado${n>1?'s':''} en el celular`):navigator.onLine?(ultimoError?'⚠ No se pudo sincronizar':'✓ Al día'):'● Sin señal'}
  function menu(){let m=document.getElementById('dc-menu');if(m){m.remove();return}
    m=document.createElement('div');m.id='dc-menu';const n=Object.keys(P).length;
    m.innerHTML=`<small>${yo?.nombre||''} · ${yo?.email||''}</small>
      <small>${n?n+' cambio(s) esperando señal':'Todo subido'}${ultimaOk?' · última vez: '+new Date(ultimaOk).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'}):''}</small>
      ${ultimoError&&ultimoError!=='sin señal'?`<small style="color:#EE8F7E">${ultimoError}</small>`:''}
      <button data-a="sync">Sincronizar ahora</button><button data-a="nombre">Cambiar mi nombre</button><button data-a="salir">Cerrar sesión</button>`;
    m.onclick=async e=>{const a=e.target.dataset.a;if(!a)return;m.remove();
      if(a==='sync')sync();
      if(a==='nombre'){const v=prompt('¿Cómo querés que aparezca tu nombre?',yo?.nombre||'');if(v&&v.trim()){yo.nombre=v.trim();guardar(LS_YO,yo);escribir('usuarios',yo.id,{nombre:yo.nombre,email:yo.email})}}
      if(a==='salir')salir()};
    document.body.appendChild(m)}

  /* ---------- arranque ---------- */
  document.addEventListener('DOMContentLoaded',async()=>{
    if(!sb){mostrarLogin();return}
    if(yo){listoRes();montarEstado();sync();return} // ya entró antes en este celular: funciona aunque no haya señal
    try{const {data:{session}}=await sb.auth.getSession();if(session){entrar(session.user);return}}catch(e){}
    mostrarLogin();
  });
  if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});

  window.claude={use:async n=>{await listo;return n==='db'?db:n==='user'?usuario:n==='assets'?(sb?assets:null):n==='downloads'?downloads:null}};
})();
