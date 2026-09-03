# Asistente Académico Personal — UCA

Guía simple de cómo funciona esto. No hace falta saber programar para usarlo.

## La idea en una frase

Esta carpeta es tu "memoria académica" en archivos. Vos le pegás información (de EVA, del SIU, o
lo que sea), y Claude Code la organiza, la calcula y te avisa si algo requiere tu atención. Si
cerrás todo y volvés en una semana, el sistema se reconstruye leyendo estos mismos archivos —
no depende de que la conversación anterior siga "viva".

## Cómo se usa en el día a día

1. **Para cargar información nueva**: pegale a Claude el contenido (texto, aviso, nota, lo que
   sea) o guardalo como archivo dentro de la carpeta `inbox/`, y decile algo como
   *"hacé una actualización completa"* o *"actualizame Matemática II con esto"*.
2. **Para preguntar cosas**: simplemente preguntá — "¿qué tengo esta semana?", "¿cómo estoy de
   asistencia en Historia?", "¿qué debería priorizar?" — Claude va a leer los archivos de acá
   adentro para responder.
3. **Si hay algo urgente**, no hace falta que preguntes: si el sistema detecta un riesgo
   (por ejemplo, que te estás por quedar sin faltas disponibles), te lo va a decir apenas
   arranques una conversación nueva.

## Qué carpeta es cada cosa (en criollo)

- `data/` — toda la información de fondo: tus materias, notas, asistencia, exámenes, calendario.
- `state/` — la "foto actual" de tu situación: qué está pasando ahora, qué riesgos hay, qué
  priorizar. Estos archivos se regeneran solos en cada actualización.
- `changelog/CHANGELOG.md` — historial de qué fue cambiando con el tiempo.
- `inbox/` — donde dejás cosas nuevas para que se procesen (después se archivan, no se pierden).
- `CLAUDE.md` — instrucciones para Claude, no hace falta que lo edites vos.

## Sobre los archivos JSON

Vas a ver varios archivos que terminan en `.json`. Son archivos de datos estructurados — parecen
código pero en realidad son solo texto organizado en pares "campo: valor". No hace falta que los
edites a mano; Claude los lee y actualiza por vos. Si alguna vez abrís uno y ves un campo que dice
`"_descripcion"` o `"_nota"`, es una aclaración en español para que entiendas qué es ese archivo,
no es un dato real.

## Estado actual del proyecto

Esto es la **Fase 1**: la estructura y la memoria persistente ya están armadas, con una materia de
ejemplo (`data/courses/_ejemplo-materia/`) que sirve como plantilla. Todavía no hay conexión
automática a EVA ni al SIU — toda la carga de datos es manual, pegando información. Los cálculos
de asistencia y prioridad los hace Claude razonando (más adelante se van a volver más precisos
usando pequeños programas de cálculo, pero eso es para más adelante).
