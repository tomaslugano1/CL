/* Doña Cecilia — Padrillos (pedido de Tomás el 25/10/2026).
   Cada padrillo usado, con su sangre (padre × madre y abuelo materno), sus datos, y sus hijos:
   cuántos hay vivos y en qué categoría, cuántos vienen en camino, vendidos y muertos.
   Arriba se filtra por categoría ("qué padrillos usé en los potrillos, en la doma…").
   Junta los padrillos cargados en Padrillos, los padres de los caballos de la manada y los de los servicios,
   y entiende las distintas formas de escribir el mismo nombre (HULK = DOLFINA HULK). */
const CATS_PAD=[['','Todos'],['Potrillos','Potrillos'],['Doma','Doma'],['Hechura','Hechura'],['Descanso','Descanso'],['Jugadores','Jugadores'],['Madres','Madres'],['__nacer','Por nacer']];
const clavePad=n=>{const k=norm(n);return (typeof ALIAS_PEDIGRI!=='undefined'&&ALIAS_PEDIGRI[k])?norm(ALIAS_PEDIGRI[k]):k};

function listaPadrillos(){const m=new Map();
  const nodo=(nombre)=>{const k=clavePad(nombre);if(!k)return null;
    if(!m.has(k)){const lib=typeof pedigriConocido==='function'?pedigriConocido(nombre):null;
      m.set(k,{k,nombre:lib?.nombre||String(nombre).toUpperCase().trim(),reg:null,lib,hijos:[],servicios:[]})}return m.get(k)};
  for(const p of S.padrillos){const n=nodo(p.nombre);if(n){n.reg=p;n.nombre=p.nombre}}
  for(const c of S.caballos)if(c.padre){const n=nodo(c.padre);if(n)n.hijos.push(c)}
  for(const s of S.servicios)if(s.padrillo){const n=nodo(s.padrillo);if(n)n.servicios.push(s)}
  return [...m.values()].map(p=>{
    const sangre={padre:p.reg?.padre||p.lib?.padre||padresDeNombre(p.nombre).padre||'',madre:p.reg?.madre||p.lib?.madre||padresDeNombre(p.nombre).madre||''};
    const vivos=p.hijos.filter(c=>c.estado==='Activo'),cats={};for(const c of vivos)cats[c.categoria]=(cats[c.categoria]||0)+1;
    const porNacer=p.servicios.filter(s=>s.estado==='Preñada'),camadas=[...new Set(p.hijos.map(c=>+c.camada).filter(Boolean))].sort();
    const tipo=p.reg?.tipo||(p.servicios.some(s=>/insemin/i.test(s.tipo||''))?'Inseminación':'');
    return {...p,sangre,vivos,cats,porNacer,camadas,tipo,
      vendidos:p.hijos.filter(c=>c.estado==='Vendido'),muertos:p.hijos.filter(c=>c.estado==='Muerto'),
      manada:p.k==='MANADA'}})}

function sangreTxt(p){const s=p.sangre;if(!s.padre&&!s.madre)return '';
  const am=s.madre?padresDeNombre(s.madre).padre:'';
  return `${esc(s.padre||'?')} × ${esc(s.madre||'?')}${am?` <span class="muted">(por ${esc(am)})</span>`:''}`}
const UNO_CAT={Potrillos:['potrillo','potrillos'],Doma:['en doma','en doma'],Hechura:['en hechura','en hechura'],Descanso:['en descanso','en descanso'],Jugadores:['jugador','jugadores'],Madres:['madre','madres'],Receptoras:['receptora','receptoras']};
const chipsCats=cats=>CATS.filter(c=>cats[c]).map(c=>`<span class="pill p-none">${cats[c]} ${esc((UNO_CAT[c]||[c.toLowerCase(),c.toLowerCase()])[cats[c]===1?0:1])}</span>`).join(' ');

vPadrillos=function(){const f=''; // sin filtros: en la ficha de cada padrillo ya se ven sus hijos por categoría
  let l=listaPadrillos();
  if(f==='__nacer')l=l.filter(p=>p.porNacer.length);else if(f)l=l.filter(p=>p.cats[f]);
  l.sort((a,b)=>(f&&f!=='__nacer'?(b.cats[f]||0)-(a.cats[f]||0):0)||b.vivos.length-a.vivos.length||b.porNacer.length-a.porNacer.length||a.nombre.localeCompare(b.nombre,'es'));
  const tarjeta=p=>{const lib=p.lib,datos=[lib?.nac?(lib.nac.length>4?fmt(lib.nac):lib.nac):'',lib?.pelaje||'',lib?.criador||''].filter(Boolean).join(' · ');
    const extra=[p.porNacer.length?`${p.porNacer.length} por nacer`:'',p.vendidos.length?`${p.vendidos.length} vendido${p.vendidos.length>1?'s':''}`:'',
      p.muertos.length?`${p.muertos.length} muerto${p.muertos.length>1?'s':''}`:'',p.camadas.length?'camadas '+(p.camadas.length>1?p.camadas[0]+'–'+p.camadas[p.camadas.length-1]:p.camadas[0]):''].filter(Boolean).join(' · ');
    return `<button type="button" class="pcard" data-act="padVer" data-k="${esc(p.k)}">
      <div class="pc-top"><b class="pc-nom">${esc(p.manada?'MANADA (servicio a campo)':p.nombre)}</b>${p.tipo?`<span class="pill p-none">${esc(p.tipo)}</span>`:''}<span class="go">›</span></div>
      ${sangreTxt(p)?`<div class="pc-sangre">${sangreTxt(p)}</div>`:p.manada?'':'<div class="pc-sangre muted">Sangre sin cargar</div>'}
      ${datos?`<div class="small muted">${esc(datos)}</div>`:''}
      <div class="pc-hijos"><b>${p.vivos.length}</b> hijo${p.vivos.length===1?'':'s'} vivo${p.vivos.length===1?'':'s'} ${chipsCats(p.cats)}</div>
      ${extra?`<div class="small muted">${esc(extra)}</div>`:''}</button>`};
  return `<div class="pcards">${l.map(tarjeta).join('')||'<div class="empty">Ningún padrillo con hijos en esta categoría.</div>'}</div>
   <p class="lcount">${l.length} padrillo${l.length===1?'':'s'}</p>`};
EXTRA_ACTS.padCat=d=>{UI.padCat=d.v;render()};

/* Ficha del padrillo: pedigree, hijos por categoría, por nacer, vendidos y muertos */
EXTRA_ACTS.padVer=d=>{const p=listaPadrillos().find(x=>x.k===d.k);if(!p)return;
  const fila=c=>`<button type="button" class="hcard ${esc(c.sexo||'')} ${c.estado!=='Activo'?'baja':''}" data-open="${c.id}"><div class="grow"><div class="nm">${esc(c.nombre)}</div><div class="meta">${esc([c.madre?'de '+c.madre:'',c.camada?'Camada '+c.camada:'',c.estado!=='Activo'?c.estado+(c.bajaFecha?' '+fmt(c.bajaFecha):''):''].filter(Boolean).join(' · '))}</div></div><span class="go">›</span></button>`;
  const porCat=CATS.filter(k=>p.cats[k]).map(k=>sec(`${esc(k)} <span class="muted small">· ${p.cats[k]}</span>`,'',`<div class="hcards">${p.vivos.filter(c=>c.categoria===k).sort(sortCab).map(fila).join('')}</div>`)).join('');
  const lib=p.lib,kv=[['Sangre',p.sangre.padre||p.sangre.madre?`${p.sangre.padre||'?'} × ${p.sangre.madre||'?'}`:'—'],['Nacimiento',lib?.nac?(lib.nac.length>4?fmt(lib.nac):lib.nac):'—'],['Pelaje',lib?.pelaje||'—'],['Criador',lib?.criador||'—'],['Tipo',p.tipo||'—'],
    ['Hijos vivos hoy',String(p.vivos.length)],['Por nacer',String(p.porNacer.length)],['Vendidos',String(p.vendidos.length)],['Muertos',String(p.muertos.length)]];
  pantalla(p.manada?'MANADA':p.nombre,
    sec('Datos',p.reg&&canWrite?`<button class="btn sm" data-pad="${p.reg.id}">Editar</button>`:'',`<div class="kvl">${kv.map(([k,v])=>`<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>`)
    +(p.manada?'':sec('Pedigree','',`<div class="tree-wrap">${arbol4({nombre:p.nombre,sexo:'Macho',padre:p.sangre.padre,madre:p.sangre.madre},null,null)}</div><p class="note">Deslizá para ver los bisabuelos.</p>`))
    +(porCat||sec('Hijos vivos','','<div class="muted small">No tiene hijos vivos hoy en Doña Cecilia.</div>'))
    +(p.porNacer.length?sec('Por nacer','',`<div class="list">${p.porNacer.map(s=>`<div class="li"><div><span class="a" data-open-name="${esc(s.madre)}">${esc(s.madre)}</span><div class="sub">Servida ${fmt(s.fecha)}${s.fpp?' · parto '+fmt(s.fpp):''}</div></div></div>`).join('')}</div>`):'')
    +(p.vendidos.length||p.muertos.length?sec('Vendidos y muertos','',`<div class="hcards">${[...p.vendidos,...p.muertos].sort((a,b)=>(b.bajaFecha||'').localeCompare(a.bajaFecha||'')).map(fila).join('')}</div>`):''))};

{const st=document.createElement('style');st.textContent=`
.pcards{display:flex;flex-direction:column;gap:8px}
.pcard{display:flex;flex-direction:column;gap:4px;width:100%;text-align:left;padding:14px;border-radius:10px;border:1px solid var(--line);background:var(--macho);color:inherit;font:inherit;cursor:pointer}
.pcard:focus-visible{outline:2px solid var(--cuero);outline-offset:2px}
.pc-top{display:flex;align-items:center;gap:8px}.pc-nom{font-size:16px;font-weight:700}.pc-top .go{margin-left:auto;color:var(--muted);font-size:24px;line-height:1}
.pc-sangre{font-size:14px}.pc-hijos{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:14px;margin-top:2px}.pc-hijos b{font-size:18px}
.tree-wrap{overflow-x:auto}`;document.head.appendChild(st)}
