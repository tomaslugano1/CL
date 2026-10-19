# Reglas de uso de la llave del EVA (EVA_TOKEN)

Acordadas con Tomás el 4/10/2026. Valen para cualquier sesión o tarea automática de Claude.

1. **Solo lectura.** Claude solo puede VER y ANALIZAR: materias, programas, secciones, foros, tareas y calendario.
2. **Prohibido actuar en nombre de Tomás.** Nada de entregar tareas, responder o publicar en foros, mandar mensajes, marcar cosas como hechas, inscribirse o cambiar algo del perfil. Para cualquier excepción hace falta que Tomás lo pida explícitamente en el chat.
3. **Candado técnico.** `agenda/eva_moodle.py` tiene una lista cerrada de funciones de lectura, y la descarga de archivos solo acepta links del EVA (`webservice/pluginfile.php`). Cualquier otra llamada queda bloqueada en el código. Nadie la amplía con funciones que escriban.
4. **La información no se guarda.** Los contenidos del EVA (avisos, programas, archivos, notas) no se commitean. Los archivos se bajan solo a `/tmp` para leerlos y se borran después. Lo que se le muestra a Tomás son resúmenes y guías de estudio.
5. **La llave no se muestra.** Ni el token ni el link del calendario se imprimen, se commitean ni aparecen en mensajes.
6. **Para cortar el acceso:** se borra `EVA_TOKEN` en la configuración del entorno, y Claude ya no puede entrar.
