# Historial de cambios

> Registro cronológico y legible de qué fue cambiando en el sistema. Se agregan entradas nuevas
> al principio (más reciente primero).

---

**2026-09-03** — Actualización completa: se cargaron las 5 materias restantes del cuatrimestre
(Contabilidad II, Macroeconomía, Seminario de Profundización Filosófica, Software de Negocios,
Gestión Organizacional), a partir de PDFs exportados por el usuario desde EVA. La cobertura de
datos es muy desigual: Contabilidad II trajo fechas reales de parcial (23/10) y recuperatorio
(13/11); Gestión Organizacional trajo avisos y consignas reales con fechas (Caso Toyota 13/08,
Caso Elefante Marino 25/08) y los dos profesores; Macroeconomía, Seminario y Software de Negocios
solo trajeron el índice de materiales de la pantalla principal de EVA, sin fechas de examen ni
profesores (con la excepción de la profesora del Seminario). Se detectó y registró una
contradicción sin resolver: el Seminario tiene comisión "1MC" según EVA y "03CM" según el SIU.
Se completó la asistencia SIU de las 6 materias. Se tuvo que instalar una librería adicional
(`pypdf`) para poder leer uno de los PDFs grandes, porque la herramienta de lectura del entorno
no pudo procesarlo directamente. Detalle completo en `state/risks.md`.

---

**2026-09-03** — Primera materia real cargada: **Matemática II** (Matemática Aplicada II,
GMA0112, comisión 03AM). Se cargó el programa oficial completo, cronograma, criterios de
evaluación, los 3 parciales/recuperatorio, y el reporte de asistencia del SIU (93.75%, 2
inasistencias el 12/08 y 13/08). Se archivaron los PDFs originales y la captura de pantalla del
SIU. Quedó pendiente el recálculo independiente de la asistencia (falta el calendario académico
2026) — ver `state/risks.md`. También se guardó el dato de asistencia de las otras 5 materias
mencionadas por el usuario (Contabilidad II, Macroeconomía, Seminario de profundización
filosófica, Gestión Organizacional, Software de Negocios), listo para cuando se carguen.

---

**2026-09-03** — Sistema creado. Se generó la estructura inicial (Fase 1): archivo de instrucciones
(`CLAUDE.md`), guía para el usuario (`README.md`), carpetas de datos, estado, historial y bandeja
de entrada, y una materia de ejemplo como plantilla. Todavía no hay materias reales cargadas ni
conexión a EVA/SIU.
