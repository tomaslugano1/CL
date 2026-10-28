# Herramientas de prueba (las usa Claude, no la app)

- `copia_local.js <carpeta>`: abre la app en un navegador sin conexión, con los datos de `<carpeta>/app.json`
  (bajados con el comando de CLAUDE.md), aplica los ajustes pendientes y guarda en `<carpeta>/app29.json`
  cómo queda todo después de publicar. Correr con `NODE_PATH=/opt/node-tools/node_modules:$(npm root -g) node`.
- `armar_simulador.py <carpeta>`: arma `<carpeta>/demo/simulador.html`, la app entera con esos datos en una sola
  página, para publicarla como Artifact ("Simulador Doña Cecilia", https://claude.ai/artifact/Pxe8mZZSteYbGYHCzxQ6tF).
  Usa también `<carpeta>/demo/fb.jpg` y `fc.jpg` (fotos de prueba de los potrillos nuevos) y las fotos reales de la app
  bajadas y achicadas en `<carpeta>/demo/fotos/<id>.jpg` (el bucket `fotos` es público; si falta una, ese caballo sale sin foto). Lo que se carga ahí
  queda solo en ese navegador. No subir al repo los datos ni las fotos.
- `prueba_cambios.cjs <carpeta>`: con los datos de `<carpeta>/app.json` (mejor el `app29.json` de `copia_local`), prueba cambios de nombre, de categoría,
  de temporada, partos atrasados, bajas y altas casi vacías, y muestra si la app queda entera. Correrla antes de cada `[publicar]`.
  `copia_local.js` hay que copiarlo como `.cjs` para correrlo (el repo tiene `"type": "module"`).
- `prueba_asistente.cjs <carpeta>`: le hace al asistente ~900 preguntas (12 tipos por cada caballo, más errores de tipeo en los nombres) y lista las que contestó mal. Correrla después de tocar `app/asistente.js`.
- `prueba_completa_asistente.cjs <carpeta>`: ~1.300 preguntas con control del dato (no solo que conteste): cada caballo, categoría, padrillo, lugar y preguntas generales. Guarda preguntas y respuestas en `<carpeta>/todo.json` (de ahí sale la planilla para Tomás).
