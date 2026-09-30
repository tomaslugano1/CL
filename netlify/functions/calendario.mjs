// Doña Cecilia — calendario de recordatorios (.ics) para suscribirse desde Google Calendar o iPhone.
// URL: https://donacecilia.netlify.app/calendario.ics?k=<clave>  (la clave está en la tabla calendario_clave)
// Usa las mismas reglas que "Para hacer esta semana" en la app.

// Mismos datos públicos que app/config.js (la anon key es pública; la seguridad la da la clave).
const SB_URL = process.env.SUPABASE_URL || 'https://rqmibapllqfvxgsawyox.supabase.co';
const SB_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbWliYXBsbHFmdnhnc2F3eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTc2NTMsImV4cCI6MjEwNjI5MzY1M30.QH3vsZUmp2MXFq-2rPLgDmvoTGsRz4NojyGeGxvSRH0';

const DIAS_ADELANTE = 120;
const VERBO = { 'Desparasitación': 'Desparasitar', 'Desvasada': 'Desvasar', 'Herrada': 'Herrar' };

const addDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const hoyAR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); // hora de Argentina

export function armarCalendario(filas, hoy = hoyAR()) {
  const D = { caballos: [], eventos: [], servicios: [], config: {} };
  for (const r of filas) {
    if (r.coleccion === 'config') { if (r.id === 'app') D.config = r.data || {}; }
    else if (D[r.coleccion]) D[r.coleccion].push({ id: r.id, ...r.data });
  }
  const k = { despMadres: 180, despResto: 90, desvasar: 60, herrar: 45, ...D.config };
  const ultimo = {};
  for (const e of D.eventos) {
    const key = e.caballoId + '|' + e.tipo;
    if (e.fecha && (!ultimo[key] || e.fecha > ultimo[key])) ultimo[key] = e.fecha;
  }
  const intervalo = (c, t) => +(t === 'Desparasitación' ? (c.categoria === 'Madres' ? k.despMadres : k.despResto) : t === 'Desvasada' ? k.desvasar : k.herrar) || 0;
  const hasta = addDays(hoy, DIAS_ADELANTE);

  // Sanidad: agrupada por día + tarea + lugar. Lo vencido va al día de hoy.
  const grupos = {};
  for (const c of D.caballos) {
    if (c.estado !== 'Activo' || c.categoria === 'Doma') continue;
    for (const t of ['Desparasitación', 'Desvasada', 'Herrada']) {
      const u = ultimo[c.id + '|' + t];
      if (!u) continue; // sin dato (o nunca herrado): no se agenda
      const p = addDays(u, intervalo(c, t));
      if (p > hasta) continue;
      const vencido = p < hoy, dia = vencido ? hoy : p, lugar = c.lugar || 'Sin lugar';
      const g = grupos[dia + '|' + t + '|' + lugar + '|' + vencido] ||= { dia, t, lugar, vencido, caballos: [] };
      g.caballos.push(c.nombre + (vencido ? ` (venció ${fmt(p)})` : ''));
    }
  }
  const ev = [];
  for (const g of Object.values(grupos)) {
    const n = g.caballos.length;
    ev.push({
      uid: `san-${g.dia}-${slug(g.t)}-${slug(g.lugar)}-${g.vencido ? 'v' : 'p'}`,
      dia: g.dia,
      titulo: `${g.vencido ? 'Vencido: ' : ''}${VERBO[g.t]} ${n} caballo${n > 1 ? 's' : ''} · ${g.lugar}`,
      desc: g.caballos.sort().join('\n'),
    });
  }
  // Partos probables
  for (const s of D.servicios) {
    if (s.estado !== 'Preñada' || !s.fpp || s.fpp < addDays(hoy, -30) || s.fpp > hasta) continue;
    ev.push({ uid: `parto-${s.id}`, dia: s.fpp, titulo: `Parto probable: ${s.madre}`, desc: `Padrillo: ${s.padrillo || '—'}\nServicio: ${fmt(s.fecha)}`, alarma: true });
  }
  ev.sort((a, b) => a.dia.localeCompare(b.dia));

  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dona Cecilia//Recordatorios//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:Doña Cecilia', 'X-WR-TIMEZONE:America/Argentina/Buenos_Aires', 'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H'];
  for (const e of ev) {
    L.push('BEGIN:VEVENT', `UID:${e.uid}@donacecilia`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.dia.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(e.dia, 1).replace(/-/g, '')}`,
      `SUMMARY:${txt(e.titulo)}`, `DESCRIPTION:${txt(e.desc)}`, 'TRANSP:TRANSPARENT');
    if (e.alarma) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${txt(e.titulo)}`, 'TRIGGER:-P7D', 'END:VALARM');
    L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${txt(e.titulo)}`, 'TRIGGER:-PT15H', 'END:VALARM', 'END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(plegar).join('\r\n') + '\r\n';
}

function fmt(s) { if (!s) return '—'; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; }
function slug(s) { return String(s).normalize('NFD').replace(/[^\w]+/g, '').toLowerCase(); }
function txt(s) { return String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
// Líneas de hasta 75 bytes (regla del formato .ics), sin cortar letras con tilde.
function plegar(l) {
  const out = []; let cur = '', n = 0;
  for (const ch of l) {
    const b = Buffer.byteLength(ch);
    if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; n = 0; }
    cur += ch; n += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

export default async (req) => {
  const clave = new URL(req.url).searchParams.get('k');
  if (!clave) return new Response('Falta la clave del calendario.', { status: 400 });
  const r = await fetch(SB_URL + '/rest/v1/rpc/datos_calendario', {
    method: 'POST',
    headers: { apikey: SB_ANON, Authorization: 'Bearer ' + SB_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_clave: clave }),
  });
  if (!r.ok) return new Response('No se pudo leer la base de datos.', { status: 502 });
  const filas = await r.json();
  if (!filas.length) return new Response('Clave incorrecta.', { status: 403 });
  return new Response(armarCalendario(filas), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'inline; filename="dona-cecilia.ics"', 'Cache-Control': 'public, max-age=900' },
  });
};

export const config = { path: '/calendario.ics' };
