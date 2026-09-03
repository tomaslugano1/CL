# provenance_log.jsonl — registro de procedencia

Este archivo (`provenance_log.jsonl`) es un historial de hechos importantes: de dónde salió cada
dato, cuándo, y si reemplazó a un dato anterior. Está vacío al empezar. Un archivo `.jsonl`
significa "una línea = un objeto de datos" (no admite comentarios adentro, por eso esta
explicación va en un README aparte).

Cada línea que se agregue va a tener esta forma (ejemplo, no es un dato real):

```json
{"fact_id": "attendance.matematica-ii.inasistencias", "valor": 2, "nivel_fuente": 1, "fuente": "SIU", "metodo_captura": "manual_paste", "capturado_en": "2026-09-03T10:00:00", "capturado_por": "usuario", "supersede_a": null}
```

Campos:
- `fact_id`: identificador único y estable del dato (para poder rastrear su historia completa).
- `valor`: el dato en sí.
- `nivel_fuente`: 1 a 4, según la jerarquía de fuentes definida en CLAUDE.md.
- `fuente`: de dónde salió literalmente (EVA, SIU, profesor, el propio usuario, inferencia).
- `metodo_captura`: `manual_paste` (pegado a mano, como es todo por ahora) o `lectura_navegador`
  (reservado para cuando se conecte el sistema a EVA/SIU automáticamente, más adelante).
- `capturado_en`: fecha/hora en que se registró.
- `capturado_por`: `usuario` o, en el futuro, el nombre del script que lo capturó.
- `supersede_a`: si este dato reemplaza a uno anterior, el `fact_id` (o una referencia) del dato viejo.
  Los datos viejos nunca se borran, quedan marcados como reemplazados.
