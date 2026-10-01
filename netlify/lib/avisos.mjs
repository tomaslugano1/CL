// Doña Cecilia — lógica compartida de las notificaciones (aviso diario y prueba).
// Las claves de notificaciones las genera la app y viven en Supabase (tabla push_config);
// esta función las recibe de Supabase en cada pedido. Netlify no guarda ningún secreto.
import webpush from 'web-push';

export const SB_URL = process.env.SUPABASE_URL || 'https://rqmibapllqfvxgsawyox.supabase.co';
export const SB_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbWliYXBsbHFmdnhnc2F3eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTc2NTMsImV4cCI6MjEwNjI5MzY1M30.QH3vsZUmp2MXFq-2rPLgDmvoTGsRz4NojyGeGxvSRH0';

// Mismas reglas que la app (index.html: INTERV_DEF, grupoInt, intervalo). Si se cambian allá, cambiarlas acá.
const INTERV_DEF = { Potrillos: { desv: 45, herr: 0 }, Madres: { desv: 80, herr: 0 }, Hechura: { desv: 60, herr: 45 }, descanso: { desv: 80, herr: 0 }, normal: { desv: 60, herr: 50 }, apretar: { desv: 60, herr: 50 } };
export function reglas(config = {}) {
  const k = { despMadres: 180, despResto: 90, desvasar: 60, herrar: 45, ...config };
  const tabla = {}; for (const g in INTERV_DEF) tabla[g] = { ...INTERV_DEF[g], ...((k.intervalos || {})[g] || {}) };
  const grupo = (c) => { const rt = c.ritmo === 'fuerte' ? 'normal' : c.ritmo; return (rt && ['Hechura', 'Jugadores'].includes(c.categoria)) ? rt : (c.categoria === 'Jugadores' ? 'normal' : c.categoria); };
  return (c, t) => {
    if (t === 'Desparasitación') return +(c.categoria === 'Madres' ? k.despMadres : k.despResto) || 0;
    const g = tabla[grupo(c)];
    if (!g) return +(t === 'Desvasada' ? k.desvasar : k.herrar) || 0;
    return +(t === 'Desvasada' ? g.desv : g.herr) || 0;
  };
}

const VERBO = { 'Desparasitación': 'Desparasitar', 'Desvasada': 'Desvasar', 'Herrada': 'Herrar' };
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const diff = (a, b) => Math.round((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 864e5);
export const hoyAR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

// Llama una función de Supabase. Con token de usuario actúa como ese usuario; sin token, como anónimo.
export async function rpc(nombre, body = {}, token = SB_ANON) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${nombre}`, {
    method: 'POST',
    headers: { apikey: SB_ANON, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${nombre}: ${r.status} ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

// Prepara lo que hace falta para armar los avisos: cuándo vence cada cosa y las preñadas.
function preparar(filas) {
  const D = { caballos: [], eventos: [], servicios: [], config: {} };
  for (const r of filas || []) {
    if (r.coleccion === 'config') { if (r.id === 'app') D.config = r.data || {}; }
    else if (D[r.coleccion]) D[r.coleccion].push({ id: r.id, ...r.data });
  }
  const intervalo = reglas(D.config);
  const ultimo = {};
  for (const e of D.eventos) {
    // cuando se hierra también se desvasa: la herrada cuenta como desvase
    for (const t of e.tipo === 'Herrada' ? ['Herrada', 'Desvasada'] : [e.tipo]) { const key = e.caballoId + '|' + t; if (e.fecha && (!ultimo[key] || e.fecha > ultimo[key])) ultimo[key] = e.fecha; }
  }
  const vence = [];   // { t, c, p }
  for (const c of D.caballos) {
    if (c.estado !== 'Activo' || c.categoria === 'Doma') continue;
    for (const t of Object.keys(VERBO)) {
      const u = ultimo[c.id + '|' + t]; const n = intervalo(c, t); if (!u || !n) continue;
      if (t === 'Herrada' && (ultimo[c.id + '|Desherrada'] || '') >= u) continue; // desherrado
      vence.push({ t, c, p: addDays(u, n) });
    }
  }
  return { vence, prenadas: D.servicios.filter(s => s.estado === 'Preñada' && s.fpp) };
}
const fmtCorta = (s) => { const [, m, d] = s.split('-'); return `${+d}/${+m}`; };
const porTipo = (xs) => Object.keys(VERBO).map(t => [t, xs.filter(x => x.t === t)]).filter(([, l]) => l.length);
const quien = (xs) => xs.length <= 4 ? ': ' + xs.map(x => x.c.nombre).join(', ') : ` ${xs.length} caballos`;

// Aviso diario: lo que vence HOY y lo que vence EN 7 DÍAS (y partos de hoy o en 7 días). null si no hay nada.
export function avisoDiario(filas, hoy = hoyAR()) {
  const { vence, prenadas } = preparar(filas), en7 = addDays(hoy, 7), lineas = [];
  const hoyL = porTipo(vence.filter(x => x.p === hoy)).map(([t, l]) => VERBO[t] + quien(l));
  const antes = porTipo(vence.filter(x => x.p === en7)).map(([t, l]) => VERBO[t] + quien(l));
  const ph = prenadas.filter(s => s.fpp === hoy).map(s => s.madre), p7 = prenadas.filter(s => s.fpp === en7).map(s => s.madre);
  if (hoyL.length) lineas.push('Vence HOY → ' + hoyL.join(' · '));
  if (ph.length) lineas.push('Parto probable HOY: ' + ph.join(', '));
  if (antes.length) lineas.push('En 7 días (' + fmtCorta(en7) + ') → ' + antes.join(' · '));
  if (p7.length) lineas.push('Parto probable en 7 días: ' + p7.join(', '));
  return lineas.length ? { title: 'Doña Cecilia · Hoy', body: lineas.join('\n'), url: '/', tag: 'dc-diario' } : null;
}

// Resumen de la semana (se manda los lunes): lo atrasado + lo que vence en los próximos 7 días + partos.
export function avisoSemanal(filas, hoy = hoyAR()) {
  const { vence, prenadas } = preparar(filas), en7 = addDays(hoy, 7);
  const ls = porTipo(vence.filter(x => x.p <= en7)).map(([t, l]) => {
    const atr = l.filter(x => x.p < hoy).length;
    return `${VERBO[t]} ${l.length}${atr ? ` (${atr} atrasado${atr > 1 ? 's' : ''})` : ''}`;
  });
  const partos = prenadas.filter(s => s.fpp >= addDays(hoy, -7) && s.fpp <= en7).sort((a, b) => a.fpp.localeCompare(b.fpp)).map(s => `${s.madre} ${fmtCorta(s.fpp)}`);
  if (partos.length) ls.push('Partos: ' + partos.join(', '));
  return ls.length ? { title: 'Doña Cecilia · Esta semana', body: 'Para hacer hasta el ' + fmtCorta(en7) + ':\n' + ls.join('\n'), url: '/', tag: 'dc-semana' } : null;
}

// Todos los avisos de un día: el diario, y los lunes también el semanal.
export function avisosDelDia(filas, hoy = hoyAR()) {
  const out = [avisoDiario(filas, hoy)];
  if (new Date(hoy + 'T12:00:00Z').getUTCDay() === 1) out.push(avisoSemanal(filas, hoy));
  return out.filter(Boolean);
}

// Manda un aviso a una lista de celulares. Devuelve los que ya no existen para borrarlos.
export async function enviar({ publica, privada, subs }, aviso) {
  if (!publica || !privada) throw new Error('Todavía no hay claves de notificaciones: activalas desde la app.');
  webpush.setVapidDetails('mailto:avisos@donacecilia.app', publica, privada);
  const payload = JSON.stringify(aviso);
  let ok = 0, fallos = 0; const muertos = [];
  await Promise.all((subs || []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 12 * 3600 });
      ok++;
    } catch (e) {
      fallos++;
      if (e.statusCode === 404 || e.statusCode === 410) muertos.push(s.endpoint);
      else console.error('push', e.statusCode, e.body || e.message);
    }
  }));
  return { ok, fallos, muertos };
}

export const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
