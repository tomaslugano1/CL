/* Doña Cecilia — sueltos y agarrados a la vista (pedido de Tomás el 25/10/2026).
   "Suelta desde 27/05 · 151 días" o "Agarrada desde 10/08 · 76 días", en la lista y en la ficha.
   - Suelto: en la categoría Descanso (desde que salió) o jugador/hechura con ritmo Descanso (desde el último "Suelta").
   - Agarrado: jugador o hechura, desde que se lo agarró (botón Agarrar, o el último movimiento "Agarrada …"). */
function ultimoMovimiento(c,re){let f='';for(const e of S.eventos)if(e.caballoId===c.id&&e.tipo==='Movimiento'&&re.test(e.detalle||'')&&e.fecha>f)f=e.fecha;return f}
function sueltoAgarrado(c){if(!c||c.estado!=='Activo')return null;const h=c.sexo==='Hembra';
  let tipo='',desde='';
  if(c.categoria==='Descanso'){tipo=h?'Suelta':'Suelto';desde=c.descansoDesde||ultimoMovimiento(c,/→ Descanso|suelt/i)}
  else if(['Jugadores','Hechura'].includes(c.categoria)){
    if(c.ritmo==='descanso'){tipo=h?'Suelta':'Suelto';desde=ultimoMovimiento(c,/suelt/i)}
    else{tipo=h?'Agarrada':'Agarrado';desde=c.agarradoEl||ultimoMovimiento(c,/agarrad/i)}}
  if(!tipo||!desde)return null;
  return {tipo,desde,dias:diff(hoy(),desde)}}
function trabajoLinea(c){const s=sueltoAgarrado(c);return s?`${s.tipo} desde ${fmt(s.desde).slice(0,5)} · ${s.dias} día${s.dias===1?'':'s'}`:''}

/* En la lista, la línea de descanso pasa a decir "Suelta desde …" */
{const td0=textoDescanso;textoDescanso=c=>{const t=td0(c),l=trabajoLinea(c);
  if(l)t.linea=[l,t.v===null?'':t.v<0?`agarrar: pasó ${-t.v} d`:t.v===0?'agarrar HOY':`agarrar en ${t.v} d`].filter(Boolean).join(' · ');return t}}

/* En la ficha, en el recuadro Categoría */
{const be0=botonesEtapa;botonesEtapa=c=>{const r=be0(c),l=trabajoLinea(c);
  return l&&r?r.replace(/(Hoy: <b>[^<]*<\/b>)/,`$1 · ${l.charAt(0).toLowerCase()+l.slice(1)}`):r}}
