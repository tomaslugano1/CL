/* Doña Cecilia — Día de fotos (idea del 25/10/2026: a Tomás le cuesta sacar y subir las fotos).
   Una pantalla con los caballos que todavía no tienen foto, agrupados por lugar y categoría para recorrer
   el campo, con sus señas para reconocerlos. Cada uno tiene "Foto", que abre la cámara y la guarda
   en su ficha (usa la misma subida que "+ Agregar foto"). Los que ya tienen foto se ven tachados abajo. */
function pantallaFotos(redibujar){
  const ov=$('#modal .ov'),scroll=redibujar&&ov?ov.scrollTop:0;
  const act=activos().filter(c=>!fuera(c)).sort((a,b)=>(a.lugar||'').localeCompare(b.lugar||'')||porCatOrden(a)-porCatOrden(b)||sortCab(a,b));
  const sin=act.filter(c=>!c.fotos?.length),con=act.filter(c=>c.fotos?.length);
  const fila=c=>{const señas=[c.pelaje,c.obs].filter(Boolean).join(' · ');
    return `<div class="dfila ${esc(c.sexo||'')}"><div class="grow"><div class="nm">${esc(c.nombre)}${c.apodo?` <span class="muted small">(${esc(c.apodo)})</span>`:''}</div>
      <div class="meta">${esc([c.categoria,c.lugar].filter(Boolean).join(' · '))}</div>${señas?`<div class="obsl">${esc(señas)}</div>`:''}</div>
      ${assets?`<label class="btn pri upl dfoto">Foto<input type="file" accept="image/*" data-foto="${c.id}"></label>`:''}</div>`};
  let grupo='';const lista=sin.map(c=>{const g=c.lugar||'Sin lugar';const h=g!==grupo?`<h3 class="dgrupo">${esc(g)}</h3>`:'';grupo=g;return h+fila(c)}).join('');
  pantalla('Día de fotos',`<div data-diafotos>
    <div class="dprog"><b>${con.length} de ${act.length}</b> con foto<div class="dbar"><i style="width:${act.length?Math.round(con.length*100/act.length):0}%"></i></div></div>
    ${assets?'':'<p class="note">Para subir fotos hace falta señal y entrar con tu usuario.</p>'}
    <p class="note" style="margin-top:0">Tocá <b>Foto</b> y elegí sacarla con la cámara o subir una de la galería: queda en la ficha. De lejos y de costado, con el caballo entero, sale mejor.<br><b>Sin señal no se puede subir:</b> sacalas con la cámara del celular como siempre y subilas después desde la galería, cuando tengas wifi.</p>
    ${lista||'<div class="empty">¡Todos tienen foto!</div>'}
    ${con.length?`<details class="desp"><summary>Ya tienen foto (${con.length})</summary><div class="dhechos">${con.map(c=>`<span class="a" data-open="${c.id}">✓ ${esc(c.nombre)}</span>`).join('')}</div></details>`:''}</div>`);
  const ov2=$('#modal .ov');if(ov2&&scroll)ov2.scrollTop=scroll}
const porCatOrden=c=>{const i=['Potrillos','Doma','Hechura','Descanso','Jugadores','Madres','Receptoras'].indexOf(c.categoria);return i<0?99:i};
EXTRA_ACTS.diaFotos=()=>pantallaFotos();
NAV.rehacer['p:Día de fotos']=()=>pantallaFotos();
/* Cuando sube una foto, la lista se actualiza sola (sin perder dónde estabas) */
{const r0=render;render=function(){const r=r0.apply(this,arguments);if(document.querySelector('#modal [data-diafotos]'))pantallaFotos(true);return r}}
{const st=document.createElement('style');st.textContent=`
.dfila .grow{flex:1;min-width:0}.dfila{display:flex;align-items:center;gap:10px;padding:12px;border-radius:10px;border:1px solid var(--line);margin-bottom:8px;background:var(--surface)}
.dfila.Macho{background:var(--macho)}.dfila.Hembra{background:var(--hembra)}.dfila .nm{font-weight:700}.dfila .meta{font-size:13px;color:var(--muted)}
.dfoto{min-height:48px;display:flex;align-items:center;white-space:nowrap}
.dgrupo{margin:16px 0 8px}.dprog{margin-bottom:10px}.dbar{height:8px;border-radius:4px;background:var(--surface2);margin-top:6px;overflow:hidden}.dbar i{display:block;height:100%;background:var(--ok)}
.dhechos{display:flex;flex-wrap:wrap;gap:6px 12px;padding:8px 0}`;document.head.appendChild(st)}
