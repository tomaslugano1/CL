/* Doña Cecilia — sueltos y agarrados a la vista (pedido de Tomás el 25/10/2026).
   "Suelta desde 27/05 · 151 días" o "Agarrada desde 10/08 · 76 días", en la lista y en la ficha.
   - Suelto: en la categoría Descanso (desde que salió) o jugador/hechura con ritmo Descanso (desde el último "Suelta").
   - Agarrado: jugador o hechura, desde que se lo agarró (botón Agarrar, o el último movimiento "Agarrada …").
   La usan textoDescanso (lista) y botonesEtapa (recuadro Categoría de la ficha). */
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
