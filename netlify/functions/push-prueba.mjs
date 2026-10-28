// Doña Cecilia — "Mandarme una de prueba" desde la app: manda un aviso solo a los celulares de quien lo pide.
// Usa el token de sesión del usuario para pedirle los datos a Supabase.
import { rpc, avisoDiario, enviar, json } from '../lib/avisos.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Usar POST' }, 405);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Volvé a entrar a la app.' }, 401);
  let d;
  try { d = await rpc('push_datos_mios', {}, token); } catch (e) { return json({ error: 'Sesión no válida. Volvé a entrar a la app.' }, 401); }
  if (!d) return json({ error: 'Sesión no válida. Volvé a entrar a la app.' }, 401);
  if (!d.subs?.length) return json({ error: 'Este usuario no tiene celulares con notificaciones activadas.' }, 404);
  const dia = avisoDiario(d.filas);
  const aviso = { title: 'Doña Cecilia · Prueba ✅', body: dia ? 'Así te llega el aviso de las 8:\n' + dia.body : 'Las notificaciones funcionan. Hoy no hay nada pendiente.', url: '/' };
  try { const r = await enviar(d, aviso); return json({ ok: r.ok, fallos: r.fallos }); }
  catch (e) { return json({ error: e.message }, 500); }
};

export const config = { path: '/api/push-prueba' };
