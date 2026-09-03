# Riesgos activos

> Se regenera en cada actualización.

## Contradicción sin resolver: comisión del Seminario de Profundización Filosófica

- **EVA** dice: Comisión 1MC.
- **SIU/CIU** dice: Comisión 03CM.

Ambas son fuentes nivel 1 y no coinciden. No elegí una — lo dejo marcado en
`data/courses/seminario-profundizacion-filosofica/course.json` hasta que lo confirmes vos (por
ejemplo, mirando el comprobante de inscripción o preguntando en Secretaría).

## Asistencia: resuelta en Matemática II, pendiente en las otras 5

Con `scripts/compute_attendance.py` ya verificamos **Matemática II** con datos reales: el SIU reporta 93.75%, y confirmamos que ese número sale de
dividir sobre los 32 eventos del cuatrimestre (parciales, repasos y recuperatorio incluidos), no
solo sobre las 25 clases de contenido real (que darían 92%). Recalculado: **92% real, con 4
faltas todavía disponibles de un máximo de 6 — riesgo bajo.**

En las otras 5 materias sigue sin poder verificarse, porque no tienen un cronograma estructurado
con fechas reales de clase (solo Matemática II lo tiene completo). Para activarlo en otra
materia, hace falta un archivo `cronograma.json` como el de Matemática II — se puede armar en
cuanto tengamos el programa oficial de esa materia con fechas.

No es urgente en ninguna de las 5 restantes todavía (todas con 1-2 faltas), pero seguimos sin
poder confirmar el número del SIU en ellas.

## Cobertura de datos desigual entre materias (aceptado, cierre de la carga inicial)

El usuario decidió cerrar acá la fase de carga manual — no se va a seguir completando materia por
materia. Estado final de cobertura:

- **Buena:** Matemática II, Gestión Organizacional, Macroeconomía (temas reales vía guías de TP).
- **Solo fechas clave:** Contabilidad II (parcial y recuperatorio, sin programa ni profesor).
- **Mínima, aceptada como incompleta:** Software de Negocios (índice de temas, sin fechas de
  examen ni profesor) y Seminario de Profundización Filosófica (sin fechas de examen).

**Todavía no sabemos las fechas de parcial de Software de Negocios, Seminario ni Macroeconomía.**
En Software de Negocios y Gestión Organizacional sabemos que el examen existe pero no cuándo; en
Macroeconomía y el Seminario ni siquiera eso está confirmado. Esto puede convertirse en un riesgo
real más adelante en el cuatrimestre si alguna de esas fechas aparece de golpe — conviene que el
usuario esté atento a los avisos de esas materias en EVA por su cuenta, ya que el sistema no va a
poder anticiparlo sin ese dato.

## Primer parcial de Matemática II en 20 días (23/09)

Cubre Unidades 1 y 2 completas. Todavía no hay estado de preparación autoevaluado.

## Parcial de Contabilidad II — 23/10

Es el segundo parcial más próximo que conocemos. Todavía no sabemos qué temas puntuales entran.
