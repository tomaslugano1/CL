# Situación académica actual

> Este archivo se regenera automáticamente en cada actualización. No lo edites a mano.

**Última actualización:** 2026-09-03 (Fase 2 — cálculo por scripts activado)

## Resumen rápido

Las 6 materias del cuatrimestre están cargadas (cobertura desigual, aceptada — ver
`state/risks.md`). Ahora los cálculos de asistencia y prioridad de exámenes los hace
`scripts/compute_attendance.py` y `scripts/compute_priority.py` en vez de razonarse a mano.

## Materias

### Matemática II (GMA0112) — completa, asistencia verificada por script
Parcial 23/09 (prioridad más alta del cuatrimestre, score 0.51), segundo parcial 29/10,
recuperatorio 18/11. Asistencia: el SIU reporta 93.75%, pero el % real de clases de contenido
dictadas es **92%** (verificado con `scripts/compute_attendance.py`) — 4 faltas disponibles de
un máximo de 6, riesgo bajo.

### Gestión Organizacional (GAD0200) — buena cobertura
Profesores: Paula De Bonis (a cargo), Paulo Feliciate (asistente). Trabajo de campo grupal como
actividad central. Examen parcial confirmado, sin fecha. Asistencia SIU 93.75% (2 faltas).

### Macroeconomía (GEC0172) — buena cobertura de contenidos, sin fechas
Temas reales confirmados vía guías de trabajos prácticos: cuentas nacionales, mercado de bienes,
mercado monetario, IS-LM. Sin profesor, sin horario, **sin fecha de examen confirmada** (no
aparece ninguna referencia a parcial en lo capturado). Asistencia SIU 96.43% (1 falta).

### Contabilidad II (GCC0122) — solo fechas clave
**Parcial: 23/10/2026. Recuperatorio: 13/11/2026.** Temas según guía de TP: Caja y Bancos,
Inversiones, Distribución de Utilidades, etc. Sin profesor ni horario. Asistencia SIU 93.75%
(2 faltas).

### Seminario de Profundización Filosófica (GFF0902) — mínima + contradicción sin resolver
Profesora: Vivian Lombardini. Contradicción de comisión sin resolver (EVA: 1MC / SIU: 03CM).
Sin fecha de examen. Asistencia SIU 91.67% (1 falta).

### Software de Negocios (GCO0210) — mínima, cierre aceptado como incompleta
12 temas listados (Excel, Power BI, Python, Bloomberg). Existe sección de exámenes
parciales/finales confirmada, sin fecha. Sin profesor, sin horario. El usuario decidió no seguir
completando esta materia por ahora. Asistencia SIU 96.88% (1 falta).

## Exámenes con fecha confirmada (orden cronológico)

| Fecha | Materia | Evento |
|---|---|---|
| 2026-09-23 | Matemática II | Primer parcial |
| 2026-10-23 | Contabilidad II | Parcial |
| 2026-10-29 | Matemática II | Segundo parcial |
| 2026-11-13 | Contabilidad II | Recuperatorio |
| 2026-11-18 | Matemática II | Recuperatorio |

No hay superposición entre las fechas que conocemos.

## Exámenes que existen pero sin fecha (atención especial más adelante)

- Gestión Organizacional — parcial
- Software de Negocios — parciales y finales

Ninguna fecha de examen confirmada para Macroeconomía ni el Seminario todavía.

## Pendientes generales, para cuando surjan naturalmente (no hace falta salir a buscarlos)

- Calendario académico oficial 2026 — sigue bloqueando el recálculo independiente de asistencia
  en todas las materias.
- Resolver la contradicción de comisión del Seminario.
- Profesores y horarios de Contabilidad II, Macroeconomía y Software de Negocios.
- Fechas de examen de Gestión Organizacional, Software de Negocios, Macroeconomía y Seminario.

## Fase 1 — cerrada. Fase 2 — cálculo por scripts, activada

El núcleo del sistema quedó armado y probado con las 6 materias reales (Fase 1). Ahora además:
- `scripts/compute_attendance.py` recalcula asistencia de forma determinística (activo en
  Matemática II; para activarlo en otra materia hace falta su `cronograma.json`).
- `scripts/compute_priority.py` calcula el ranking de prioridad de exámenes con componentes
  explicados (activo en todas las materias con examen y fecha confirmados).

De acá en más, el uso normal es: traer avisos/novedades puntuales a medida que aparezcan
(actualización rápida), correr los scripts cuando cambie algo relevante (nueva falta, nueva
autoevaluación de preparación, fecha de examen confirmada), y pedir resúmenes cuando haga falta.
