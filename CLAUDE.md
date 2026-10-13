# Doña Cecilia — instrucciones de trabajo

App de registro de la manada (PWA en `app/`, datos en Supabase, publicada en Netlify).

## Cuando Tomás cuenta algo que pasó en el campo (parto, muerte, venta, sanidad, movimiento…)
1. Registrarlo en la app: como ajuste único en `AJUSTES` de `app/extras.js` (idempotente: no duplicar si ya está cargado). Probarlo con el mock antes de subir.
2. Registrarlo en el Google Sheet "MANADA DC II" en TODAS las pestañas donde corresponda (CABALLOS, PREÑECES, CAMADA de ese año, SANIDAD, EVENTOS, BAJAS, RESUMEN), sin borrar fórmulas.
   - Si no hay acceso de escritura al Sheet desde la sesión, dejar un prompt listo para pegar en Claude en Chrome.
3. Las camadas son registro histórico: un potrillo que nace muerto o muere queda en su camada (con sexo, fecha y "muerto"), no se borra; solo no cuenta entre los vivos.
4. Avisar en una línea qué quedó cargado y qué falta.

## Cómo leer los datos
- App (solo lectura): `curl -sS https://rqmibapllqfvxgsawyox.supabase.co/rest/v1/rpc/datos_calendario -H "apikey: <anonKey de app/config.js>" -H "Content-Type: application/json" -d "{\"p_clave\":\"$DC_CLAVE\"}"` → caballos, eventos, servicios y config. La clave está en la variable de entorno `DC_CLAVE` (la del link del calendario). Nunca pedirla por el chat ni guardarla en el repo.
- Sheet: conector de Google Sheets; el ID está en la variable `DC_SHEET_ID` (no va en el repo porque el Sheet se comparte por link).
- Antes de cambiar el Sheet, comparar contra la app: la app manda.

## Reglas
- El repo es público: no subir datos de la quinta (fotos, planillas, PDFs, SQL con datos).
- Netlify publica solo con `[publicar]` en el mensaje del commit (cada publicación cuesta créditos).
- No crear la cuenta de Martín en la app. No abrir PRs si no lo pide.
