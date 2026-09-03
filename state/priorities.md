# Prioridades

> Se regenera con `scripts/compute_priority.py`. El puntaje es nivel 4 (calculado), con sus
> componentes explicados en `exams.json` de cada materia — nunca un número sin justificación.
> Calculado el 2026-09-03.

## Ranking de exámenes con fecha conocida

| # | Materia | Evento | Fecha | Días | Score |
|---|---|---|---|---|---|
| 1 | Matemática II | Primer parcial | 23/09/2026 | 20 | **0.51** |
| 2 | Matemática II | Segundo parcial | 29/10/2026 | 56 | 0.452 |
| 3 | Contabilidad II | Parcial | 23/10/2026 | 50 | 0.391 |
| 4 | Matemática II | Recuperatorio | 18/11/2026 | 76 | 0.249 |
| 5 | Contabilidad II | Recuperatorio | 13/11/2026 | 71 | 0.22 |

## Por qué el primer parcial de Matemática II quedó primero

No es solo por ser el más próximo. Componentes (podés ver el detalle completo en
`data/courses/matematica-ii/exams.json`):
- Proximidad: alta (20 días)
- Volumen de contenido: 2 unidades completas (el más alto de todos)
- Preparación: "no iniciado" → suma prioridad al máximo
- Énfasis del profesor: hay 2 indicaciones registradas del programa (la más alta de todas)

**Falta el `peso_final`** (cuánto vale cada parcial en la nota) en todos los exámenes — ese peso
se redistribuyó entre los demás componentes. Si me pasás ese dato (por ejemplo, si cada parcial
vale 50% de la cursada), el ranking se vuelve más preciso.

## Exámenes sin fecha — no rankeables todavía

- Gestión Organizacional — parcial (existe, sin fecha)
- Software de Negocios — parciales y finales (existe, sin fecha)
- Macroeconomía y Seminario de Profundización Filosófica — sin examen confirmado

## Cómo actualizar este ranking

`python3 scripts/compute_priority.py --write` recalcula todo. Conviene correrlo cada vez que:
cambies tu autoevaluación de preparación, se confirme una fecha nueva de examen, o se cargue el
peso de cada parcial en la nota final.
