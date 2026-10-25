# Doña Cecilia — mejoras para publicar el 29 de octubre

Todo esto ya está hecho y guardado, pero **todavía no se ve en la app**. Se publica de una sola vez el 29/10, cuando se renuevan los créditos de Netlify.
Estado: ✅ hecho · 🔨 en curso · ⏳ pendiente

## Resumen del 29, de lo más grande a lo más chico (revisado el 13/10 con los datos reales)
| # | Qué | Estado |
|---|---|---|
| 1 | **Diseño Polo Breeders — parte 1**: pantallas enteras con ‹, lista de Caballos con chips Categoría/Lugar y camadas, ficha en el orden de PB (Servicios, Preñez, Sanidad/Trabajos, línea de tiempo, Progenie) | ✅ |
| 2 | **Diseño Polo Breeders — parte 2**: sanidad masiva, controles nuevos y vacunas de preñez, ⚙ Configuración, Alta, Baja, Nuevo evento por categoría, Seleccionar, Receptoras | ✅ |
| 3 | **Diseño Polo Breeders — parte 3: el resto de la app**: sin pestañas, barra finita, Inicio primero con "Ver caballos", Padrillos en CATEGORÍA. Ver sección G | ✅ (13/10) — falta que Tomás lo vea en capturas |
| 4 | **El Sheet se actualiza solo desde la app** (sección F) | ✅ armado y probado con los datos reales (13/10) — se instala el 29 después de publicar |
| 5 | Categoría **Descanso** con fechas y aviso para agarrar | ✅ |
| 6 | **Cambio de etapa** a un toque (Potrillo → Doma → Hechura → Jugadores) | ✅ |
| 7 | **Pedigree como imagen** y **Fichas de potrillos** para WhatsApp | ✅ |
| 8 | **Madres**: tarjetas, ecografía con sexo, aborto | ✅ |
| 9 | **Aviso de las 8** todos los días, notificaciones que se arreglan solas, la app se actualiza sola | ✅ |
| 10 | **Bajas** con Vendidos/Muertos/Otros, precio y comprador | ✅ |
| 11 | Detalles: −1 en prácticas y torneos, torneo con copa, dibujito de preñada, observación solo en Doma y Potrillos | ✅ |
| 13 | **Cargar nacimiento**: botón en el servicio, formulario corto (vivo o nació muerto), el servicio pasa a "anteriores" con el potrillo enlazado (sección I) | ✅ |
| 14 | **Genealogía que se completa sola**: biblioteca con 49 caballos (sección H) | ✅ |
| 15 | Arreglos: al dar de alta se abre la ficha nueva; Preñez dice Parió/Abortó; Bajas de la más nueva a la más vieja; vacunas de preñez viejas dicen "Sin cargar"; Rockera fecha aproximada | ✅ |
| 12 | **Datos que se cargan solos**: ventas de PB, Hechura → Descanso, Potranca Baya preñada, Vilma y la 25, Pipa y su cría, Máximo, Rockera, **partos del 21/10 (Baya y Colorada Potra)** | ✅ probado: quedan 52 caballos, 13 madres, 9 en descanso |

## G. ⏳ Diseño general como Polo Breeders (pedido 13/10)
- Hoy: arriba hay una fila de 7 botones que se desliza (Inicio, Caballos, Madres, Camadas, Sanidad, Padrillos, Notas) y la ruedita ocupa una fila sola; en el celular "Sanidad" queda cortado. Sanidad y Camadas son tablas anchas que en el celular quedan apretadas. Tomás lo ve "tosco".
- Lo que pidió: que toda la app se vea como Polo Breeders, manteniendo los detalles del Inicio que le gustan.
- Para hacerlo igual hacen falta **capturas de PB**: inicio, menú, la lista de yeguas/madres y la de sanidad.
- ✅ (13/10) Inicio: no muestra categorías en 0; "Próximo parto" dice qué yeguas están atrasadas y cuántos días cada una (ej. "BAYA y COLORADA POTRA: pasaron 4 días cada una"); "Preñadas" cuenta 8 y aclara "7 paren esta temporada · POTRANCA BAYA en 2027", igual que el Sheet.
- ✅ (13/10) Anemia: Tomás confirmó que **solo se hace para viajar**. Queda apagada como control fijo (no avisa vencidas); se sigue cargando cuando se hace, y se puede prender en ⚙ si algún día hace falta.
- ✅ Tomás aprobó: el 28/10 se revisa todo con capturas y datos reales antes de publicar, para publicar una sola vez el 29.
- Tomás puede mandar las capturas de PB como fotos o como video de pantalla (se corta en imágenes).

### Cómo es Polo Breeders (del video de Tomás, 13/10)
- **No hay pestañas arriba.** La app es una sola pantalla: la lista de caballos. Madres, Padrillos y Bajas son opciones del botón **CATEGORÍA**, no secciones aparte.
- **Barra de arriba:** una sola franja oscura, finita: logo DC a la izquierda, "Doña Cecilia" al centro, ruedita redonda a la derecha.
- **Botones:** una fila chica: **[+ Alta]** (relleno) **[+ Sanidad] [Seleccionar]** y a la derecha el lector de chip y la lupa.
- **Filtros:** dos botones grandes, **CATEGORÍA** (con dibujito de caballo) y **LUGAR**. CATEGORÍA despliega: A la venta, Todos, Jugadores, Hechura, Doma, Potrillos, Padrillos, Madres, Bajas.
- **Pastillas debajo según la categoría:** Hechura/Doma/Potrillos → Todas · Camada 2025 · Camada 2024…; Madres → Madres · Receptoras; Bajas → Vendido · Muerto · Jubilado; Padrillos → Servicios.
- **Tarjetas:** todo el recuadro de color, **rosa las hembras y celeste los machos**; nombre en mayúscula y negrita; abajo "edad · categoría · camada"; flechita ›. Sin foto ni puntitos. Las preñadas con el dibujito de yegua con potrillo. Al final "13 caballos".
- **+ Sanidad:** arriba [Seleccionar] [Cancelar]; fila de controles que se desliza (Anemia, Influenza, Encéfalo (365 días), Desparasitada (180 días), Adenitis, Tétano, Rinoneumonitis); "Ocultar vencidos"; cada tarjeta se pinta: **rosa "Sin registro"/vencido** o **verde "en 143 días"**.
- **Seleccionar:** casillas en cada tarjeta y abajo dos botones oscuros **[Cambiar categoría] [Cambiar lugar]**.
- Colores de PB: verde muy oscuro y grises verdosos (en Doña Cecilia se usan los colores de Doña Cecilia).

### Lo que se hizo (13/10, Tomás eligió: Inicio primero y colores de Doña Cecilia)
- Sacar la fila de pestañas: la pantalla principal pasa a ser la lista de caballos igual a PB. Madres, Padrillos y Bajas entran en CATEGORÍA; Camadas como pastillas; Sanidad como "+ Sanidad".
- Barra de arriba finita como PB.
- Tarjetas como PB (sin foto en la lista, todo el recuadro rosa o celeste).
- La app **abre en el Inicio**: arriba un botón grande **Ver caballos** que lleva a la lista igual a PB, y debajo accesos a Madres y partos, Camadas, Sanidad, Padrillos y Notas.
- Fuera del Inicio aparece **‹** junto al logo; tocarlo (o el botón atrás del celular) vuelve al Inicio.
- En la lista se sacaron los puntitos de sanidad (como PB; el estado se ve con + Sanidad). Se mantienen la foto si tiene y la observación en Doma y Potrillos.
- Código: `app/diseno.js`.
- Lo que tiene Doña Cecilia y PB no (aviso de las 8, Para hacer esta semana, partos, Notas, Excel) sigue estando, en el Inicio o en la ⚙.

## A. Ya hecho antes de este plan
| | Qué | Mejora |
|---|---|---|
| ✅ | Aviso de las 8 | Todos los días, mientras haya algo pendiente: lo **atrasado**, lo que vence **hoy**, lo de los **próximos 7 días** y los **partos** (también los atrasados, como la Pipa). Antes solo avisaba el día exacto. |
| ✅ | Notificaciones | La app crea sola las claves si faltan y vuelve a anotar el celular. Se borran solos los celulares viejos o repetidos. |
| ✅ | Pestaña Madres | Tarjetas por madre, ordenadas por urgencia, con estado, padrillo, fecha de parto, días que faltan y barra de preñez. |
| ✅ | Ecografía | Se carga con fecha, resultado (Preñada, Vacía o Perdió la preñez), **sexo del potrillo** y observaciones. Si da preñada, calcula sola la fecha de parto. |
| ✅ | Actualización automática | Cuando se publica una versión nueva, la app se actualiza sola. Ya no hay que abrirla dos veces. |
| ✅ | Créditos | Netlify publica solo cuando se lo indicamos. Así no se gastan créditos con cada cambio. |

## B. Copiado de Polo Breeders (con los colores de Doña Cecilia)
| | Qué | Cómo era | Cómo queda |
|---|---|---|---|
| ✅ | Pantallas | La ficha y los formularios se abrían como una ventana encima de la lista. | Cada cosa es una **pantalla entera** con **‹** arriba a la izquierda para volver. El botón atrás del celular también vuelve, y **la lista queda en el mismo lugar** donde la dejaste. |
| ✅ | Guardar y volver | Al guardar se cerraba todo. | Al guardar un formulario **volvés a la ficha** de ese caballo, como en PB. |
| ✅ | Lista: filtros | Una fila larga de botones de categoría y un menú de lugar. | Dos chips grandes, **CATEGORÍA** y **LUGAR**, que despliegan la lista (A la venta, Todos, Jugadores, Hechura, Doma, Potrillos, Madres, Bajas). |
| ✅ | Lista: camadas | — | En Potrillos y Doma aparecen pestañas **por camada** (Todas, Camada 2025, Camada 2024…). |
| ✅ | Lista: buscador | El buscador estaba siempre abierto. | Se abre con la **lupa** (al lado del lector de chip), como en PB. |
| ✅ | Lista: preñadas | — | Etiqueta **"Preñada"** al lado del nombre de las madres preñadas. |
| ✅ | Lista: cantidad | Arriba, chiquito. | Abajo de todo: **"14 caballos"**. |
| ✅ | Ficha: orden | Sanidad, eventos y servicios todos mezclados. | Orden de PB, en recuadros blancos: Datos → **Servicios → Preñez** (solo madres) → Polo (prácticas, torneos y ritmo) → **Sanidad** → **Trabajos** → Eventos → Pedigree → Progenie → Fotos → botones. |
| ✅ | Servicios | Una lista chiquita al final. | Arriba de todo en las madres. Cada servicio tiene fecha, estado, **padrillo (tocás y abre su ficha)**, tipo, parto estimado, **Editar** y **Registrar aborto**. Más **[+ Servicio]** y **[+ Nacimiento]**. |
| ✅ | Preñez | — | Dos botones grandes, **[Vacía] [Preñada]**. Al tocarlos se carga la eco. Muestra fecha de tacto o eco, sexo, fecha de parto, observaciones y la barra de preñez. |
| ✅ | Aborto | — | Botón rojo claro **"Registrar aborto"**, no como en PB, donde parece una etiqueta. La madre queda como **Abortó**, para volver a servirla. |
| ✅ | Sanidad y Trabajos | Una sola lista mezclada. | **Sanidad** (desparasitación, y en el historial vacunas, anemias y veterinario) separada de **Trabajos** (desvase, herrado, muelas y castración). Cada una con pestañas **[Actual] [Historial]**. |
| ✅ | Eventos | Una lista de texto. | **Línea de tiempo con colores** por tipo: reproducción, preñez, servicio, sanidad, trabajos, movimiento y polo. Pestañas **[Historial] [Movimientos] [Todos]**. Se sigue viendo el último y "Ver todos", como pediste. |
| ✅ | Movimientos | — | Cada **cambio de categoría o de lugar** queda guardado solo, por ejemplo "Potrillos → Doma" o "Lugar: Doña Cecilia → 9 de Julio". |
| ✅ | Progenie | Nombres sueltos. | Tarjetas rosas y celestes de cada hijo, con camada y categoría. Se tocan y abren la ficha. |
| ✅ | Botones finales | Una fila de botones chicos. | Botones **anchos uno debajo del otro**: Editar datos, Ficha de venta y **Dar de baja** (rojo). |
| ✅ | Compu | Todo estirado a lo ancho. | Centrado a **700 px**, como una columna de celular. |
| ✅ | Sanidad masiva | Elegías caballos y después qué se hizo. | Como PB: **[+ Sanidad]** abre una pantalla con todos los **controles** en una fila que se desliza. Elegís uno y aparecen los caballos a los que aplica, **primero los sin registro y vencidos**. Podés tocar "**Elegir todos los vencidos**" o "Solo vencidos". Abajo, "**Continuar con N caballos**" y cargás fecha, **vencimiento en días**, **droga** (Ivomec, Dectomax, Moxidectina…), precio si es del herrero, y anotaciones. |
| ✅ | Más controles | Desparasitación, desvase, herrado y muelas. | Se suman **Anemia** (60 días), **Influenza** (90), **Encéfalo** (365), **Adenitis** y **Tétano** (180 y 365, potrillos), y las **vacunas de preñez por mes**: Rinoneumonitis en los meses 5, 7 y 9; Salmonela en el 4 y el 6; Encéfalo, Desparasitación y Adenitis en el 11. Van al aviso de las 8 y a "Para hacer esta semana". En la ficha de cada madre preñada se ve cada vacuna con su fecha y si está hecha. Las de preñez se avisan desde el 29/10 (las viejas no). |
| ✅ | Configuración ⚙ | "Cada cuántos días" estaba dentro de Sanidad. | Ruedita **⚙ arriba a la derecha**. Ahí prendés o apagás cada control y le cambiás los días (o los meses de preñez) y a qué categorías aplica. También están los días de desvase, herrado y desparasitación, los precios del herrero, y los accesos a Notificaciones y Calendario. |
| ✅ | Alta | Un formulario largo. | Pantalla con 4 botones grandes: **Nacimiento · Compra · Receptora · Padrillo**. En **Nacimiento** elegís la madre (primero las preñadas, con su padrillo y fecha de parto) y el padre se completa solo con el servicio. |
| ✅ | Baja | Un formulario. | Pantalla con **Venta** (precio, comprador, fecha), **Muerte** (fecha y causa), **Jubilado** y **Otro**, cada una **pidiendo confirmación** (en PB, Muerte no la pide). Aparte, en rojo, **Eliminar** (solo si se cargó por error, con doble confirmación). La baja queda como movimiento. |
| ✅ | Nuevo evento | Una lista de tipos. | Primero la **categoría** y después el **evento**: Sanidad, Herrero, Reproducción, Polo, **Lesión** (cólico, rengo, tendón…), **Enfermedad**, **Estudios** (radiografía, eco-tendones…), **Análisis**, **Trabajos** (destete, castración, chip…) y **Manejo**. Cada una con su color en la línea de tiempo. |
| ✅ | Seleccionar | — | Botón **[Seleccionar]** en la lista: tildás varios caballos y abajo aparece **[Cambiar categoría]** o **[Cambiar lugar]**. Queda como movimiento en cada uno. |
| ✅ | Receptoras | — | Categoría **Receptoras**. En Madres aparecen las pestañas **[Madres] [Receptoras]**, y se dan de alta desde Alta → Receptora. Tienen servicios, preñez y vacunas de preñez como las madres. |

## B2. Pedidos del 7/10
| | Qué | Cómo era | Cómo queda |
|---|---|---|---|
| ✅ | Prácticas y torneos | Solo había **+1**: si se sumaba uno de más, no se podía corregir. | Botón **−1** al lado del +1. Pide confirmación y borra la última cargada (dice la fecha). |
| ✅ | Dibujito de preñada | La etiqueta decía "Preñada". | **Dibujito verde de yegua con potrillo** al lado del nombre, como en PB. |
| ✅ | Categoría **Descanso** | Era solo un botón de ritmo, sin fecha. | **Categoría nueva.** Al mandar un caballo a descanso se carga **cuándo salió** y **cuándo volver a agarrarlo**. La ficha muestra los días de descanso y cuánto falta, con los botones **[Agarrar]** (vuelve a Hechura o Jugadores) y **[Cambiar fechas]**. Todo queda como movimiento ("Jugadores → Descanso", "Descanso → Jugadores (agarrado)", con los días que estuvo). El botón "Descanso" del ritmo ahora hace esto mismo. |
| ✅ | Aviso para agarrar | — | "**Agarrar del descanso**" aparece en el aviso de las 8 (una semana antes, el día y si está atrasado), en "Para hacer esta semana" y en el calendario. |
| ✅ | Bajas | Solo se veían los muertos, sin precio. | Pestañas **[Todas] [Vendidos] [Muertos] [Otros]**. Cada uno con fecha, **precio y comprador**. La baja ahora tiene **Vendido, Muerto, Jubilado u Otro**, con precio y comprador, y **pide confirmación**. El Excel tiene estas columnas. |
| ✅ | Vendidos de Polo Breeders | — | Se cargan solos: Mirtha (**10/3/2026**, USD 10.000, Pilar, Pablo Mancilla), Chavela (**10/8/2026**, USD 19.000, EE.UU., Alfredo Arrenio), Rumba (USD 4.000), Serena (USD 1.000) y Servilleta (USD 3.000), estas tres a Alejo Sagasti el **15/9/2026**. |
| ✅ | Hechura a descanso | — | Se pasa solo todo el lote de Hechura a **Descanso desde el 19/9/2026** (fecha aproximada). Cuando quieras, cargás en cada uno la fecha para volver a agarrarlo. |
| ✅ | Potranca Baya | — | Se carga sola: inseminada con **IRENITA PORRON** el **21/9/2026** (aprox.) y **preñez confirmada el 6/10**. Parto estimado: **22/8/2027**. |
| ✅ | Mini | — | Murió (ya estaba así en la app). |
| ✅ | Observación en la lista | Salía en todas las categorías menos Jugadores. | Sale **solo en Doma y Potrillos**, que es donde sirve para distinguirlos físicamente. En la ficha se sigue viendo en todos. |
| ✅ | Cambio de etapa | Había que entrar a "Editar datos" y cambiar la categoría a mano. | En la ficha, recuadro **Categoría** con el paso que sigue, a un toque: **Potrillo → [Pasar a Doma]** (pide fecha, lugar y domador; sugiere 9 de Julio y Piri), **Doma → [Entregado de doma → Hechura]** (fecha, lugar, y anota cuántos días estuvo en doma), **Hechura → [Pasar a Jugadores]**. También **[Mandar a descanso]** y **[Otra categoría]**. Cada paso queda como movimiento. Para varios juntos: **Seleccionar → Cambiar categoría** (con lugar y domador). |
| ✅ | Pedigree como imagen | — | Botón **Compartir** en el Pedigree de cada ficha: arma una imagen con 3 generaciones (padres, abuelos y bisabuelos), en celeste y rosa, con el logo DC, y la manda por WhatsApp. En cada servicio, botón **Pedigree** con el árbol del **potrillo que va a nacer** (padrillo × madre), para mostrarlo antes de que nazca. |
| ✅ | Torneos con copa | Preguntaba solo el nombre del torneo, en un cartelito. | Al tocar **+1 torneo** pregunta **fecha, qué copa** (te sugiere las que ya cargaste), **quién lo jugó** y **cómo le fue**. Queda en el historial del caballo. |
| ✅ | Vilma y la 25 | — | Se corrigen solos: **Vilma 4 prácticas** y **la 25 (Avispa) 0 torneos**. Lo que se sume después del 8/10 se suma arriba. |

## C. Lo que tiene Doña Cecilia y PB no (se mantiene)
Prácticas, torneos, ritmo de trabajo, apodo, embocadura, **observación y señas a la vista**, aviso de las 8 todos los días, "Para hacer esta semana", regla de desvase y herrado por categoría y ritmo, precios del herrero, Excel, ficha de venta por WhatsApp, genealogía de padrillos que heredan los hijos, calendario y lector de chip.

## D. Fichas de potrillos (agregado 12/10)
- En Caballos → Potrillos aparece el botón **Fichas**: arma una imagen prolija por potrillo (foto de portada, nombre, sexo, pelaje, nacimiento con edad en meses, camada, chip, RP, lugar, señas y observaciones, padre y madre con sus abuelos, sanidad con última/próxima y si está al día o vencido, y hermanos de la misma madre, marcando los hermanos enteros).
- Si estás en una pestaña de camada, arma solo esa camada.
- Botón **Mandar todas por WhatsApp** (todas juntas) o **Descargar todas**.

## E. PIPA (cargado el 13/10, se aplica solo al publicar)
- 11/10/2026: la PIPA parió el potrillo muerto y murió por complicaciones en el parto.
- La PIPA pasa a Bajas → Muertos con ese detalle. Su servicio (IRENITA PORRON) queda como Parida con la nota, y en su historial queda el parto y la baja.
- Se crea "Cría de Pipa 2026" (hembra, nació muerta) en Bajas → Muertos y en la camada 2026 como registro histórico (no cuenta entre los vivos).
- Si alguien ya lo cargó a mano antes, no se duplica.

## F. ✅ Para el 29: el Sheet se actualiza solo desde la app
- Hecho el 13/10: `sheet/actualizar.gs` + pasos en `sheet/LEEME.md`. Al final no usa Netlify: el Sheet lee directo la base de la app con la clave del calendario (no gasta créditos). Menú **Doña Cecilia** en el Sheet: Actualizar ahora · Configurar clave · Actualizar solo todos los días a las 7.
- Se instala el 29 **después** de publicar y abrir la app una vez (si no, copiaría la app vieja).
- Las camadas no se reescriben: solo "Hoy está en", lo vacío, los que nacen y "Por nacer" → potrillo.
- Diferencias encontradas entre el Sheet y la app para que Tomás decida: ✅ ROCKERA: Tomás confirmó (14/10) que la fecha es aproximada; queda 01/10/2022 con la nota "la planilla de partos decía 02/11/2022" (ajuste `oct-rockera-fecha-aprox` en la app y ya en el Sheet). ✅ SUSANA: Tomás confirmó (16/10) que es ruana; ya estaba así en la app y se corrigió la CAMADA 2020 del Sheet.
- Tomás confirmó (13/10) que entra en la publicación del 29.
- Idea de Tomás (13/10): que el Google Sheet "MANADA DC II" quede conectado a la app y no haya que descargar el Excel nunca más.
- Cómo: una función en Netlify (con la misma clave que el calendario) que entrega los datos de la app, y un script dentro del Sheet (Apps Script) que todos los días a las 7 los trae y reescribe las pestañas CABALLOS, PREÑECES, CAMADAS, SANIDAD, EVENTOS y BAJAS, sin tocar fórmulas ni formato. También va un botón "Actualizar ahora".
- La app es la fuente de verdad. Lo que se escriba a mano en el Sheet en esas pestañas se pisa, así que las notas a mano van en una pestaña aparte.
- Requisito: el Sheet tiene que ser una planilla de Google, no un Excel subido a Drive.

## H. ✅ Genealogía que se completa sola (16/10, entra el 29)
- Tomás quiere que al escribir un caballo conocido (ej. SANTA TERESA SPORT, CONCEPCIÓN, POTRANCA BAYA) la app ofrezca el nombre y complete padre, madre, abuelos y bisabuelos, como hace la app **Polo Argentino**.
- Polo Argentino (iPhone, de Symphony Technology LLC) no tiene una conexión pública para otras apps: no se puede enganchar directo. Se podría pedir acceso al desarrollador.
- Camino propuesto: una **biblioteca de genealogías propia** en la app, con todos los caballos conocidos (padrillos, madres, abuelos). Tomás manda capturas de los pedigríes de Polo Argentino y se cargan. Al escribir un nombre aparece la lista de conocidos y, al elegir uno, se completa todo el árbol.
- Hoy ya existe una parte: los padrillos guardan 3 generaciones y, al escribir el padre o la madre, se completan los abuelos si ese caballo ya está cargado.
- ✅ Hecho el 16/10 con las capturas de Polo Argentino y del catálogo de Genética Santa Agueda: `app/genealogias.js` con 49 caballos (padrillos Irenita Porron, Machitos Mercenario, Espi Pulpero, Espi Explosivo, Dolfina Hulk, Don Urbano Merequetenge, Santa Teresa Sport, Irenita Mañoso y sus ancestros hasta 3-4 generaciones). Al escribir Padre/Madre sugiere los conocidos y completa los abuelos; el Pedigree muestra los bisabuelos solo. Lo cargado en la app manda sobre la biblioteca. También quedó en la pestaña GENEALOGÍAS del Sheet.
- ⏳ Faltan: las madres de Doña Cecilia (Tomás no las tiene en Polo Argentino), BENICIO, BAYO PEPE C y CLARIFY.
- Ojo: la app escribe RENGO LUICITO y el catálogo RENGO LUISITO; la biblioteca entiende las dos.

## I. ✅ Cargar nacimiento (pedido 16/10, entra el 29)
- En el servicio de cada yegua preñada: botón grande **Cargar nacimiento** (también en Madres y partos, en lugar de "Parió"). Formulario corto: nombre, fecha, sexo, pelaje, padre y madre (vienen del servicio), RP, chip, **¿Cómo nació? Vivo / Nació muerto** y señas. Los abuelos se completan solos.
- Al guardar: alta del potrillo (o queda como muerto en su camada), el servicio pasa a Parida con el potrillo enlazado ("Nació: DC …"), y la parición queda en el historial de la madre. Se abre la ficha del potrillo.
- En la ficha de la madre arriba solo queda el servicio en curso; los parida/abortó/vacía van a **Servicios anteriores**. No se borra nada.
- Arreglado de paso: al dar de alta cualquier caballo, la app volvía a la lista en vez de abrir su ficha.

## J. Partos del 21/10 (cargados el 22/10, se aplican solos al publicar)
- BAYA parió una **hembra bayo claro**, cara blanca ancha y patas claras → `DC S/N BAYA 26`.
- COLORADA POTRA parió un **macho colorado**, patas blancas → `DC S/N COLORADA POTRA 26`.
- Los dos de IRENITA PORRON. Ajuste `oct-partos-baya-colorada` (servicio → Parida con el potrillo enlazado, parición en la madre, abuelos completos). Ya en el Sheet (CABALLOS, SANIDAD, PREÑECES, CAMADA 2026, EVENTOS).
- Las fotos (sacadas del video de Tomás) no van al repo: Tomás las sube con "+ Agregar foto" en cada ficha.
- RESUMEN del Sheet: "Próximos partos" ahora es una fórmula que muestra solo las preñadas (antes era una lista fija).

## El día 29, en orden
1. Tomás mira la página con las capturas (https://claude.ai/artifact/Ptq8X9fQNzRGzi56kDRXEE) y avisa si algo no va.
2. Claude publica una sola vez (commit con `[publicar]` en `claude/happy-davinci-ekp0k5`).
3. Tomás abre la app **con señal** y espera a que diga que está todo subido: ahí se cargan solos los datos (ventas, descanso, Pipa, partos del 21/10, Máximo…).
4. Claude lee la app y confirma que quedó todo bien.
5. Tomás sube las fotos de los potrillos nuevos (+ Agregar foto).
6. Desde la compu: instalar el script del Sheet (sheet/LEEME.md), 5 minutos.
