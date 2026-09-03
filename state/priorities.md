# Prioridades

> Puntaje calculado con `scripts/compute_priority.py` (nivel 4, componentes en cada `exams.json`).
> Interpretación en lenguaje llano actualizada el 2026-09-03.

## 🔴 Hacer ahora

- **Empezar a estudiar para el primer parcial de Matemática II (23/09, quedan 20 días).** Es tu
  prioridad más alta del cuatrimestre (score 0.51): cubre dos unidades completas (Matrices/
  Determinantes y Sistemas de Ecuaciones), figura como "no iniciado" en el sistema, y ya tenés
  material real cargado para arrancar (`clase_2.pdf`, `clase_3.pdf`, `TP2.pdf` en
  `data/raw_captures/2026-09-03/matematica-ii/`).
- **Confirmar si entregaste "Caso Elefante Marino" de Gestión Organizacional** (fecha de la
  actividad: 25/08, ya pasada). El sistema no tiene ese dato — si no lo hiciste, es urgente
  resolverlo ya.

## 🟠 Hacer esta semana

- Autoevaluar tu preparación real en Matemática II (hoy el sistema asume "no iniciado" por
  default). Decime en qué nivel estás y recalculo la prioridad con un dato más preciso.
- Resolver la contradicción de comisión del Seminario (EVA dice 1MC, SIU dice 03CM) — mirá tu
  comprobante de inscripción o preguntá en Secretaría.
- Si podés, conseguí el programa completo de Contabilidad II en EVA (no solo la pantalla
  principal): hoy no sabemos qué temas puntuales del TP entran en el parcial del 23/10.

## 🟡 Tener en cuenta

- **Fin de octubre está cargado:** el parcial de Contabilidad II (23/10) y el segundo parcial de
  Matemática II (29/10) caen con solo 6 días de diferencia. Conviene planificar el estudio de
  ambas con anticipación en vez de dejarlo para la semana de cada una.
- Software de Negocios y Gestión Organizacional tienen examen parcial confirmado pero **sin
  fecha** — puede aparecer de un momento a otro en EVA. Macroeconomía y el Seminario ni siquiera
  tienen el examen confirmado todavía.
- Ningún examen tiene cargado su `peso_final` (cuánto vale en la nota) — si me pasás esos
  porcentajes, el ranking de prioridad se vuelve más preciso.

## 🟢 Bajo control

- **Asistencia:** en Matemática II, verificada con script — 92% real, 4 faltas disponibles de un
  máximo de 6, riesgo bajo. En las otras 5 materias el SIU reporta entre 91.67% y 96.88%, todas
  con apenas 1-2 faltas — ninguna está en zona de riesgo hoy (aunque el número del SIU sigue sin
  verificarse ahí, como está en `state/risks.md`).

## Ranking completo de exámenes con fecha conocida

| # | Materia | Evento | Fecha | Días | Score |
|---|---|---|---|---|---|
| 1 | Matemática II | Primer parcial | 23/09/2026 | 20 | 0.51 |
| 2 | Matemática II | Segundo parcial | 29/10/2026 | 56 | 0.452 |
| 3 | Contabilidad II | Parcial | 23/10/2026 | 50 | 0.391 |
| 4 | Matemática II | Recuperatorio | 18/11/2026 | 76 | 0.249 |
| 5 | Contabilidad II | Recuperatorio | 13/11/2026 | 71 | 0.22 |

## Cómo actualizar este ranking

`python3 scripts/compute_priority.py --write` recalcula todo. Conviene correrlo cada vez que
cambies tu autoevaluación de preparación, se confirme una fecha nueva de examen, o se cargue el
peso de cada parcial en la nota final.
