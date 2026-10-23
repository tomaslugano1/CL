# El Sheet "MANADA DC II" se actualiza solo desde la app

El Sheet trae los datos directo de la app todos los días a las 7, y cuando querés con **Doña Cecilia → Actualizar ahora**.
No pasa por Netlify, así que no gasta créditos.

## Cuándo instalarlo
**El 29/10, después de publicar la app y abrirla una vez.** Al abrirla se cargan solos los cambios del 29 (la Pipa, las ventas, el Descanso…).
Si se instala antes, el Sheet copiaría la app vieja y "desharía" esas cosas en el Sheet.

## Cómo se instala (una sola vez, 5 minutos, desde la compu)
1. Abrí el Sheet **MANADA DC II** → menú **Extensiones → Apps Script**.
2. Borrá lo que haya en el archivo `Código.gs` y pegá todo el contenido de `sheet/actualizar.gs`. Tocá **Guardar** (el disquete).
3. Volvé al Sheet y recargá la página. Arriba aparece el menú **Doña Cecilia**.
4. **Doña Cecilia → Configurar clave**: Google pide permiso la primera vez (Continuar → elegí tu cuenta → Configuración avanzada → Ir al proyecto → Permitir). Pegá la clave del calendario (la del link del calendario, lo que va después de `k=`).
5. **Doña Cecilia → Actualizar ahora**. Tiene que decir cuántos caballos actualizó.
6. **Doña Cecilia → Actualizar solo todos los días a las 7**.

## Qué hace en cada pestaña
| Pestaña | Qué pasa |
|---|---|
| CABALLOS | Se reescribe con los caballos vivos de la app (sin padrillos). La edad se sigue calculando sola. |
| PREÑECES | Una fila por madre con su servicio más nuevo. La columna "FPP (planilla vieja)" se conserva. El resumen de abajo se corre solo. |
| SANIDAD | Últimas fechas de desparasitación, desvase, herrada y muelas. Las fórmulas de vencimiento y el cuadro de días no se tocan. |
| EVENTOS | Todo lo cargado en la app, del más nuevo al más viejo (sin prácticas ni torneos uno por uno). HERRERO se calcula de acá. |
| BAJAS | Vendidos, muertos y otros, con fecha, precio y comprador. |
| CAMADA 20XX | **No se reescriben** (tienen notas a mano). Se actualiza "Hoy está en", se completa lo vacío, se agregan los que nacen y la fila "Por nacer" de la madre pasa a ser el potrillo. |
| RESUMEN, HERRERO, PADRILLOS, PEDIGREE, A REVISAR | No se tocan. |

**La app manda**: lo que se escriba a mano en las columnas que vienen de la app se pisa en la próxima actualización. Las notas a mano van en columnas que la app no tiene o en otra pestaña.

## Si algo sale mal
- "Falta la clave" o "Revisá la clave": volvé a hacer el paso 4.
- "La app devolvió muy pocos caballos; no se tocó nada": es una protección para no borrar el Sheet si la app responde mal. Probá de nuevo más tarde.
- Para frenarlo: **Doña Cecilia → Dejar de actualizar solo**.
