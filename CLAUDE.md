# Doña Cecilia — instrucciones de trabajo

App de registro de la manada (PWA en `app/`, datos en Supabase, publicada en Netlify).

## Cuando Tomás cuenta algo que pasó en el campo (parto, muerte, venta, sanidad, movimiento…)
SIEMPRE, sin que lo pida: todo lo que cuenta va a la app **y** al Sheet en el mismo momento. Nunca uno solo.
1. Registrarlo en la app: como ajuste único en `AJUSTES` de `app/extras.js` (idempotente: no duplicar si ya está cargado). Probarlo con el mock antes de subir.
2. Registrarlo en el Google Sheet "MANADA DC II" en TODAS las pestañas donde corresponda (CABALLOS, PREÑECES, CAMADA de ese año, SANIDAD, EVENTOS, BAJAS, RESUMEN), sin borrar fórmulas.
   - Si no hay acceso de escritura al Sheet desde la sesión, dejar un prompt listo para pegar en Claude en Chrome.
3. Las camadas son registro histórico: un potrillo que nace muerto o muere queda en su camada (con sexo, fecha y "muerto"), no se borra; solo no cuenta entre los vivos.
4. Avisar en una línea qué quedó cargado y qué falta.

## Cómo leer los datos
- App (solo lectura), copiar este comando tal cual, en una sola línea (ya tiene permiso en `.claude/settings.json`; armarlo distinto lo frena el control de permisos):
  `curl -sS https://rqmibapllqfvxgsawyox.supabase.co/rest/v1/rpc/datos_calendario -H "apikey: $(sed -n "s/.*anonKey:'\([^']*\)'.*/\1/p" /home/user/CL/app/config.js)" -H "Content-Type: application/json" -d "{\"p_clave\":\"$DC_CLAVE\"}" -o <scratchpad>/app.json -w "%{http_code}\n"`
  Devuelve una lista de filas `{coleccion, id, data}` con coleccion = caballos, eventos, servicios o config. La clave está en la variable de entorno `DC_CLAVE` (la del link del calendario). Nunca pedirla por el chat ni guardarla en el repo.
  Lo que está en `AJUSTES` de `app/extras.js` y todavía no se publicó (ver MEJORAS-29-OCTUBRE.md) no aparece en la app pero sí va en el Sheet: no es una diferencia.
- Sheet: conector de Google Sheets; el ID está en la variable `DC_SHEET_ID` (no va en el repo porque el Sheet se comparte por link).
- Antes de cambiar el Sheet, comparar contra la app: la app manda.
- EVENTOS del Sheet: una fila por caballo con su precio (HERRERO suma desde ahí). No lleva prácticas ni torneos uno por uno.
- Las fórmulas de HERRERO arrancan en EVENTOS!5: si se insertan filas arriba, revisar que sigan en 5 (Google las corre solas).

## Reglas del herrero (confirmadas por Tomás)
- Herrar incluye desvasar: el conteo del desvase arranca desde el último desvase O la última herrada (lo que sea más reciente).
- Se puede desvasar sin herrar: eso reinicia solo el conteo del desvase, no el de la herrada.
- Desherrado o ritmo/categoría que no se hierra (madres, potrillos, descanso) → no se avisa herrar.

## Lo que Tomás ya aclaró (no volver a preguntar)
- Edades, padres, madres y sangre que faltan: no se saben. Lo cargado es toda la información que hay; no es que no la quiera pasar.
- No quiere "pausar avisos" ni avisos de madres para preñar o inseminar: de eso se ocupa él. No todo tiene que estar en la app.
- Nombres de los potrillos y fotos: los pasa él cuando los tenga (para las fotos está el "Día de fotos" del Inicio).

## Reglas
- El repo es público: no subir datos de la quinta (fotos, planillas, PDFs, SQL con datos).
- Netlify publica solo con `[publicar]` en el mensaje del commit (cada publicación cuesta créditos).
- No crear la cuenta de Martín en la app. No abrir PRs si no lo pide.
