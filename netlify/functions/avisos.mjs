// Doña Cecilia — avisos al celular.
// Lo llama Supabase todos los días a las 8:00 (ver supabase/notificaciones-2.sql) con la clave del calendario.
// Todos los días: lo atrasado, lo que vence hoy y en los próximos 7 días, y los partos.
import { rpc, avisosDelDia, enviar, json } from '../lib/avisos.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Usar POST' }, 405);
  const { clave } = await req.json().catch(() => ({}));
  if (!clave) return json({ error: 'Falta la clave' }, 400);
  const d = await rpc('push_datos', { p_clave: clave });
  if (!d) return json({ error: 'Clave incorrecta' }, 403);
  const avisos = avisosDelDia(d.filas);
  if (!avisos.length) return json({ enviados: 0, motivo: 'Nada para avisar hoy' });
  let ok = 0, fallos = 0;
  const muertos = new Set();
  for (const aviso of avisos) {
    const r = await enviar(d, aviso);
    ok += r.ok; fallos += r.fallos; r.muertos.forEach((e) => muertos.add(e));
    d.subs = d.subs.filter((s) => !muertos.has(s.endpoint));
  }
  for (const e of muertos) { try { await rpc('borrar_suscripcion_push', { p_clave: clave, p_endpoint: e }); } catch {} }
  console.log(`${avisos.length} aviso(s): ${ok} entregas, ${fallos} con error`);
  return json({ enviados: avisos.length, ok, fallos });
};

export const config = { path: '/api/avisos' };
