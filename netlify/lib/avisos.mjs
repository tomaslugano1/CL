// Doña Cecilia — lógica compartida de las notificaciones (aviso diario y prueba).
// Las claves de notificaciones las genera la app y viven en Supabase (tabla push_config);
// esta función las recibe de Supabase en cada pedido. Netlify no guarda ningún secreto.
import webpush from 'web-push';

export const SB_URL = process.env.SUPABASE_URL || 'https://rqmibapllqfvxgsawyox.supabase.co';
export const SB_ANON = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbWliYXBsbHFmdnhnc2F3eW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MTc2NTMsImV4cCI6MjEwNjI5MzY1M30.QH3vsZUmp2MXFq-2rPLgDmvoTGsRz4NojyGeGxvSRH0';

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

// Arma el texto del aviso del día. Devuelve null si no hay nada que avisar.
export function resumenDelDia(filas, hoy = hoyAR()) {
  const D = { caballos: [], eventos: [], servicios: [], config: {} };
  for (const r of filas || []) {
    if (r.coleccion === 'config') { if (r.id === 'app') D.config = r.data || {}; }
    else if (D[r.coleccion]) D[r.coleccion].push({ id: r.id, ...r.data });
  }
  const k = { despMadres: 180, despResto: 90, desvasar: 60, herrar: 45, ...D.config };
  const ultimo = {};
  for (const e of D.eventos) { const key = e.caballoId + '|' + e.tipo; if (e.fecha && (!ultimo[key] || e.fecha > ultimo[key])) ultimo[key] = e.fecha; }
  const intervalo = (c, t) => +(t === 'Desparasitación' ? (c.categoria === 'Madres' ? k.despMadres : k.despResto) : t === 'Desvasada' ? k.desvasar : k.herrar) || 0;

  const hoyN = {}, vencN = {};
  for (const c of D.caballos) {
    if (c.estado !== 'Activo' || c.categoria === 'Doma') continue;
    for (const t of Object.keys(VERBO)) {
      const u = ultimo[c.id + '|' + t]; if (!u) continue;
      const p = addDays(u, intervalo(c, t));
      if (p === hoy) hoyN[t] = (hoyN[t] || 0) + 1; else if (p < hoy) vencN[t] = (vencN[t] || 0) + 1;
    }
  }
  const partos = D.servicios.filter(s => s.estado === 'Preñada' && s.fpp && diff(s.fpp, hoy) >= -7 && diff(s.fpp, hoy) <= 7)
    .sort((a, b) => a.fpp.localeCompare(b.fpp))
    .map(s => { const d = diff(s.fpp, hoy); return `${s.madre} ${d === 0 ? 'hoy' : d > 0 ? `en ${d} día${d > 1 ? 's' : ''}` : `(pasó hace ${-d} d)`}`; });

  const lineas = [];
  const hoyTxt = Object.entries(hoyN).map(([t, n]) => `${VERBO[t]} ${n}`);
  if (hoyTxt.length) lineas.push('Vence hoy: ' + hoyTxt.join(' · '));
  const vencTxt = Object.entries(vencN).map(([t, n]) => `${VERBO[t]} ${n}`);
  if (vencTxt.length) lineas.push('Atrasado: ' + vencTxt.join(' · '));
  if (partos.length) lineas.push('Partos: ' + partos.join(', '));
  if (!lineas.length) return null;
  return { title: 'Doña Cecilia · Para hoy', body: lineas.join('\n'), url: '/' };
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
