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

  /* ---------- la app abre en el Inicio ---------- */
  UI.tab='inicio';
  let empujado=false; // si se entró a otra pantalla desde el Inicio, hay un paso en el historial para volver con "atrás"
  renderNav=function(){
    if(UI.tab!=='inicio'&&!empujado){empujado=true;history.pushState({dcTab:1},'')}
    document.body.classList.toggle('en-inicio',UI.tab==='inicio')};
  const alInicio=()=>{empujado=false;UI.tab='inicio';UI.sel=null;UI.drop=null;render();window.scrollTo(0,0)};
  EXTRA_ACTS.inicio=()=>{if(UI.tab==='inicio')return;if(empujado&&history.state&&history.state.dcTab)history.back();else alInicio()};
  addEventListener('popstate',()=>{
    if(!empujado||NAV.pila.length||$('#modal').innerHTML.trim()||(history.state&&history.state.dcTab))return;
    alInicio()});

  /* ---------- Inicio: "Ver caballos" y accesos ---------- */
  const _inicio=vInicio;
  vInicio=function(){return `<button class="pbver" data-tab="caballos">Ver caballos <span>›</span></button>
    <div class="pbacc">${[['camadas','Camadas'],['sanidad','Sanidad'],['notas','Notas']].map(([k,t])=>`<button class="chip" data-tab="${k}">${t}</button>`).join('')}<button class="chip" data-act="diaFotos">Día de fotos</button></div>`+_inicio()};

  /* ---------- Inicio: cada recuadro se toca (pedido de Tomás el 25/10) ---------- */
  const tocar=(html,label,attrs)=>html.replace(`<div class="tile"><span>${label}</span>`,`<div class="tile toca" ${attrs} role="button" tabindex="0"><span>${label} ›</span>`)
    .replace(`<div class="tile alert"><span>${label}</span>`,`<div class="tile alert toca" ${attrs} role="button" tabindex="0"><span>${label} ›</span>`)
    .replace(`<div class="tile "><span>${label}</span>`,`<div class="tile toca" ${attrs} role="button" tabindex="0"><span>${label} ›</span>`);
  const _ini2=vInicio;
  vInicio=function(){let h=_ini2();
    h=tocar(h,'Caballos propios','data-act="iniVer"');                 // → Ver caballos, todos
    h=tocar(h,'Preñadas','data-tab="madres"');                         // → Madres y partos
    h=h.replace('<div class="tile" data-tab="madres" role="button" tabindex="0" style="cursor:pointer"><span>Próximo parto ›</span>',
      '<div class="tile toca" data-act="iniParto" role="button" tabindex="0"><span>Próximo parto ›</span>');   // → ficha de la próxima en parir
    h=tocar(h,'Para hacer · 7 días','data-act="iniHacer"');            // → baja a "Para hacer esta semana"
    h=tocar(h,'Para revisar','data-tab="notas"');                      // → Notas
    return h};
  EXTRA_ACTS.iniVer=()=>{UI.cat='';UI.bajas=false;UI.subCam=null;UI.lugar='';UI.tab='caballos';render();window.scrollTo(0,0)};
  EXTRA_ACTS.iniParto=()=>{const t=+S.config.temporada||new Date().getFullYear();
    const s=S.servicios.filter(x=>x.estado==='Preñada'&&+x.temporada===t&&x.fpp&&findByName(x.madre)?.estado==='Activo').sort((a,b)=>a.fpp.localeCompare(b.fpp))[0];
    const m=s&&findByName(s.madre);if(m){UI.ficha=m.id;renderFicha()}else{UI.tab='madres';render()}};
  EXTRA_ACTS.iniHacer=()=>{const el=document.querySelector('.panel.tareas');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})};
  document.addEventListener('keydown',e=>{const t=e.target;if((e.key==='Enter'||e.key===' ')&&t.classList&&t.classList.contains('toca')){e.preventDefault();t.click()}});
  {const st=document.createElement('style');st.textContent='.tile.toca{cursor:pointer}.tile.toca:active{transform:scale(.98)}.tile.toca:focus-visible{outline:2px solid var(--cuero);outline-offset:2px}.panel.tareas{scroll-margin-top:72px}';document.head.appendChild(st)}

  /* ---------- Padrillos en CATEGORÍA, como en PB ---------- */
  CATS_LISTA.splice(CATS_LISTA.findIndex(x=>x[0]==='Madres'),0,['__padrillos','Padrillos']);
  const _fcat=EXTRA_ACTS.fcat;
  EXTRA_ACTS.fcat=d=>{if(d.v==='__padrillos'){UI.drop=null;UI.tab='padrillos';render();window.scrollTo(0,0);return}_fcat(d)};
})();
