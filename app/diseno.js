/* Doña Cecilia — diseño general como Polo Breeders (pedido de Tomás el 13/10, se publica el 29/10).
   - Sin la fila de pestañas: barra de arriba finita con el logo, "Doña Cecilia" al centro y la ruedita.
   - La app abre en el Inicio, con un botón grande "Ver caballos" que lleva a la lista igual a PB.
   - Camadas, Sanidad y Notas se abren desde el Inicio. Padrillos, desde CATEGORÍA. Madres y partos, tocando "Próximo parto".
   - Fuera del Inicio, "‹" junto al logo (o el botón atrás del celular) vuelve al Inicio.
   Los colores siguen siendo los de Doña Cecilia. */
(function(){
  /* ---------- barra de arriba ---------- */
  const bar=document.querySelector('header .bar'),gear=bar.querySelector('.gear').outerHTML;
  bar.innerHTML=`<div class="pbhead"><button class="pbhome" data-act="inicio" aria-label="Inicio"><span class="pbback" aria-hidden="true">‹</span><div class="logo" id="logo"><span>DC</span></div></button>
    <h1>Doña Cecilia</h1><span class="who" id="who"></span>${gear}</div><nav id="nav"></nav>`;

  const css=document.createElement('style');css.textContent=`
header .bar{padding:8px 12px;gap:0}
.pbhead{display:flex;align-items:center;gap:8px;min-height:48px;position:relative}
.pbhead h1{position:absolute;left:50%;transform:translateX(-50%);font-family:var(--display);font-size:1.2rem;margin:0;white-space:nowrap;pointer-events:none}
.pbhome{display:flex;align-items:center;gap:2px;background:none;border:0;color:inherit;padding:0;cursor:pointer}
.pbback{font-size:30px;line-height:1;width:18px;display:none}
body:not(.en-inicio) .pbback{display:inline}
.pbhead .logo{width:38px;height:38px}
.pbhead .who{display:none}
.pbhead .gear{margin-left:auto;width:40px;height:40px;border-radius:50%}
#nav{display:none}
main .lbar{gap:6px}
main .lbar .btn{min-height:36px;padding:6px 11px;font-size:.8rem;white-space:nowrap}
main .lbar .btn.icon{width:36px;height:36px;min-height:36px}
.pbver{display:flex;justify-content:space-between;align-items:center;width:100%;padding:18px 20px;margin-bottom:10px;border:0;border-radius:14px;background:var(--campo);color:var(--on-pri);font:700 1.1rem var(--body);cursor:pointer}
.pbver span{font-size:1.6rem;line-height:1}
.pbacc{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:18px}
.pbacc::-webkit-scrollbar{display:none}
.pbacc .chip{flex:none;padding:8px 14px;font-weight:600}`;
  document.head.appendChild(css);

  /* ---------- volver al Inicio (renderNav, en index.html, deja el paso en el historial) ---------- */
  const alInicio=()=>{empujado=false;UI.tab='inicio';UI.sel=null;UI.drop=null;render();window.scrollTo(0,0)};
  EXTRA_ACTS.inicio=()=>{if(UI.tab==='inicio')return;if(empujado&&history.state&&history.state.dcTab)history.back();else alInicio()};
  addEventListener('popstate',()=>{
    if(!empujado||NAV.pila.length||$('#modal').innerHTML.trim()||(history.state&&history.state.dcTab))return;
    alInicio()});

  /* ---------- Inicio: los recuadros que se tocan (los arma vInicio) ---------- */
  EXTRA_ACTS.iniVer=()=>{UI.cat='';UI.bajas=false;UI.subCam=null;UI.lugar='';UI.tab='caballos';render();window.scrollTo(0,0)};
  EXTRA_ACTS.iniParto=()=>{const t=+S.config.temporada||new Date().getFullYear();
    const s=S.servicios.filter(x=>x.estado==='Preñada'&&+x.temporada===t&&x.fpp&&findByName(x.madre)?.estado==='Activo').sort((a,b)=>a.fpp.localeCompare(b.fpp))[0];
    const m=s&&findByName(s.madre);if(m){UI.ficha=m.id;renderFicha()}else{UI.tab='madres';render()}};
  EXTRA_ACTS.iniHacer=()=>{const el=document.querySelector('.panel.tareas');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})};
  document.addEventListener('keydown',e=>{const t=e.target;if((e.key==='Enter'||e.key===' ')&&t.classList&&t.classList.contains('toca')){e.preventDefault();t.click()}});
  {const st=document.createElement('style');st.textContent='.tile.toca{cursor:pointer}.tile.toca:active{transform:scale(.98)}.tile.toca:focus-visible{outline:2px solid var(--cuero);outline-offset:2px}.panel.tareas{scroll-margin-top:72px}';document.head.appendChild(st)}

  /* ---------- Inicio: buscador (pedido de Tomás el 3/11: que se vea claro). Muestra hasta 6 caballos mientras se escribe;
     con Enter va a la lista con la búsqueda puesta. Busca igual que la lista: nombre, número, chip o señas. */
  const ibuscar=q=>{const n=norm(q.trim());if(!n)return[];return S.caballos.filter(c=>coincide(c,n)).sort((a,b)=>(a.estado==='Activo'?0:1)-(b.estado==='Activo'?0:1)||sortCab(a,b))};
  document.addEventListener('input',e=>{if(e.target.id!=='iq')return;const r=$('#ires'),l=ibuscar(e.target.value);if(!r)return;
    r.hidden=!e.target.value.trim();r.innerHTML=l.length?l.slice(0,6).map(c=>`<button type="button" class="ires-i" data-open="${c.id}"><b>${esc(c.nombre)}</b><span>${esc([c.estado==='Activo'?c.categoria:c.estado,c.pelaje,c.obs].filter(Boolean).join(' · ').slice(0,70))}</span></button>`).join('')+(l.length>6?`<button type="submit" class="ires-mas">Ver los ${l.length} ›</button>`:''):'<div class="ires-no">No hay ningún caballo con eso.</div>'});
  document.addEventListener('submit',e=>{if(e.target.id!=='ibusca')return;e.preventDefault();const q=$('#iq').value.trim();if(!q)return;UI.q=q;UI.buscar=true;UI.cat='';UI.bajas=false;UI.tab='caballos';render();window.scrollTo(0,0)});
  {const st=document.createElement('style');st.textContent='.ibusca{position:relative;margin-bottom:12px}.ibusca input{width:100%;box-sizing:border-box;padding:14px 14px 14px 46px;font-size:1rem;border-radius:14px;border:1.5px solid var(--fg);background:var(--surface);color:var(--fg)}.ibl{position:absolute;left:14px;top:14px;color:var(--muted);display:flex}.ires{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:20;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);overflow:hidden}.ires-i{display:grid;gap:2px;width:100%;text-align:left;padding:10px 14px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--fg);cursor:pointer;font:inherit}.ires-i span{font-size:.82rem;color:var(--muted)}.ires-mas{width:100%;padding:10px 14px;border:0;background:var(--surface2);color:var(--fg);font:600 .9rem var(--body);cursor:pointer;text-align:left}.ires-no{padding:12px 14px;color:var(--muted);font-size:.9rem}';document.head.appendChild(st)}

  /* ---------- Inicio: lo que todavía no se subió (pedido de Tomás el 25/10; el cartel lo arma vInicio) ---------- */
  addEventListener('dc-pendientes',()=>{if(UI.tab==='inicio'&&!document.querySelector('#modal .ov'))render()});
  addEventListener('dc-subido',e=>toast(`✓ Se ${e.detail>1?'subieron '+e.detail+' cambios':'subió el cambio'} a la nube`));
  {const st=document.createElement('style');st.textContent='.pbpend{margin-bottom:12px;padding:10px 14px;border-radius:12px;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn);font-size:.9rem}.pbpend summary{cursor:pointer;font-weight:600}.pbpend ul{margin:8px 0 0;padding-left:20px}';document.head.appendChild(st)}

})();
