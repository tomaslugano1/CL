// Doña Cecilia — "Probar notificación" desde la app: manda un aviso a los celulares de quien lo pide.
// Recibe el token de sesión de Supabase para saber quién es.
import { SB_URL, SB_ANON, faltaConfig, leerDatos, leerSuscripciones, resumenDelDia, enviar } from '../lib/avisos.mjs';

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Usar POST' }, 405);
  const falta = faltaConfig();
  if (falta.length) return json({ error: 'Faltan configurar en Netlify: ' + falta.join(', ') }, 500);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, Authorization: 'Bearer ' + token } });
  if (!u.ok) return json({ error: 'Sesión no válida. Volvé a entrar a la app.' }, 401);
  const yo = await u.json();
  const mias = (await leerSuscripciones()).filter((s) => s.usuario === yo.id);
  if (!mias.length) return json({ error: 'Este usuario no tiene celulares con notificaciones activadas.' }, 404);
  const resumen = resumenDelDia(await leerDatos());
  const aviso = { title: 'Doña Cecilia · Prueba ✅', body: resumen ? 'Así te va a llegar cada mañana:\n' + resumen.body : 'Las notificaciones funcionan. Hoy no hay nada pendiente.', url: '/' };
  return json(await enviar(mias, aviso));
};

export const config = { path: '/api/push-prueba' };
