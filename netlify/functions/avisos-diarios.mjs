// Doña Cecilia — aviso diario al celular, todos los días a las 8:00 (hora argentina = 11:00 UTC).
import { faltaConfig, leerDatos, leerSuscripciones, resumenDelDia, enviar } from '../lib/avisos.mjs';

export default async () => {
  const falta = faltaConfig();
  if (falta.length) { console.log('Faltan variables en Netlify:', falta.join(', ')); return; }
  const aviso = resumenDelDia(await leerDatos());
  if (!aviso) { console.log('Nada para avisar hoy'); return; }
  const subs = await leerSuscripciones();
  const r = await enviar(subs, aviso);
  console.log(`Aviso enviado a ${r.ok} celular(es), ${r.fallos} con error`);
};

export const config = { schedule: '0 11 * * *' };
