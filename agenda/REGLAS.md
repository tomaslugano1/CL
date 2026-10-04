# Reglas de uso de la llave del EVA (EVA_TOKEN)

Acordadas con Tomás el 4/10/2026. Valen para cualquier sesión o tarea automática de Claude.

1. **Solo lectura.** Claude solo puede VER y ANALIZAR: materias, programas, secciones, foros, tareas y calendario.
2. **Prohibido actuar en nombre de Tomás.** Nada de entregar tareas, responder o publicar en foros, mandar mensajes, marcar cosas como hechas, inscribirse o cambiar algo del perfil. Para cualquier excepción hace falta que Tomás lo pida explícitamente en el chat.
3. **Candado técnico.** `agenda/eva_moodle.py` tiene una lista cerrada de funciones de lectura. Cualquier otra llamada al EVA queda bloqueada en el código. Nadie la amplía con funciones que escriban.
4. **La información no se guarda.** Los contenidos del EVA (avisos, programas, notas) no se commitean ni se guardan en archivos. Se leen, se resumen y se mandan a Tomás como notificación.
5. **La llave no se muestra.** Ni el token ni el link del calendario se imprimen, se commitean ni aparecen en mensajes.
6. **Para cortar el acceso:** se borra `EVA_TOKEN` en la configuración del entorno, y Claude ya no puede entrar.
