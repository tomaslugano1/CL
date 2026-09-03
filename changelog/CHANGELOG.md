# Historial de cambios

> Registro cronológico y legible de qué fue cambiando en el sistema. Se agregan entradas nuevas
> al principio (más reciente primero).

---

**2026-09-03** — Análisis interpretativo sobre los datos ya cargados (sin datos nuevos de EVA/SIU:
esta sesión en la nube no tiene navegador disponible, eso queda pendiente de la sesión local).
Se re-corrieron los scripts de asistencia y prioridad para confirmar que siguen vigentes (sin
cambios en los números). Se detectaron y registraron en `state/risks.md` y `state/priorities.md`
dos hallazgos nuevos por interpretación de los datos existentes: (1) sobrecarga de fin de octubre
— el parcial de Contabilidad II (23/10) y el segundo parcial de Matemática II (29/10) caen con
solo 6 días de diferencia; (2) la actividad "Caso Elefante Marino" de Gestión Organizacional tenía
fecha 25/08 (ya pasada) y no hay registro de si se entregó. Se armó por primera vez un ranking de
prioridades con semáforo (🔴🟠🟡🟢) e interpretación en lenguaje llano, no solo el score numérico.

---

**2026-09-03** — Arranca la Fase 2: cálculos por script en vez de a mano.
Se crearon `scripts/compute_attendance.py` y `scripts/compute_priority.py`, con las fórmulas
documentadas en `CLAUDE.md`. Se armó `data/courses/matematica-ii/cronograma.json` (estructurado
a partir del programa oficial) y se corrió el cálculo de asistencia real: **el % del SIU (93.75%)
resultó estar calculado sobre las 32 fechas totales del cuatrimestre, no sobre las 25 clases de
contenido real — el % real recalculado es 92%**, con 4 faltas disponibles de un máximo de 6. De
paso se encontró y corrigió un error en la fórmula de `maximo_faltas_permitidas` que había quedado
mal escrita en `CLAUDE.md` desde la Fase 1 (calculaba las clases a aprobar, no las faltas
permitidas). También se calculó el ranking de prioridad de los 5 exámenes con fecha confirmada,
con sus componentes explicados en cada `exams.json`.

---

**2026-09-03** — Cierre de la Fase 1 (carga inicial). Se agregó contenido real de Macroeconomía
a partir de dos guías de trabajos prácticos aportadas por el usuario (versión 2026 vigente y
2017 como referencia): temas confirmados de cuentas nacionales, mercado de bienes, mercado
monetario e IS-LM. El usuario decidió no seguir completando Software de Negocios por ahora —
queda aceptada como incompleta. Con esto se da por cerrada la carga inicial de las 6 materias
del cuatrimestre; de acá en más el sistema se actualiza con el uso normal (avisos y novedades
puntuales a medida que aparezcan), no con más rondas de captura masiva de EVA.

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
