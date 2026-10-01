// Doña Cecilia — aviso diario al celular.
// Lo llama Supabase todos los días a las 8:00 (ver supabase/notificaciones-2.sql) con la clave del calendario.
import { rpc, resumenDelDia, enviar, json } from '../lib/avisos.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Usar POST' }, 405);
  const { clave } = await req.json().catch(() => ({}));
  if (!clave) return json({ error: 'Falta la clave' }, 400);
  const d = await rpc('push_datos', { p_clave: clave });
  if (!d) return json({ error: 'Clave incorrecta' }, 403);
  const aviso = resumenDelDia(d.filas);
  if (!aviso) return json({ enviado: false, motivo: 'Nada para avisar hoy' });
  const r = await enviar(d, aviso);
  for (const e of r.muertos) { try { await rpc('borrar_suscripcion_push', { p_clave: clave, p_endpoint: e }); } catch {} }
  console.log(`Aviso enviado a ${r.ok} celular(es), ${r.fallos} con error`);
  return json({ enviado: true, ok: r.ok, fallos: r.fallos });
};

export const config = { path: '/api/avisos' };
