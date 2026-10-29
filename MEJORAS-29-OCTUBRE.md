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
| 16 | Día de fotos (Inicio): los caballos sin foto, por lugar, con sus señas y un botón "Foto" (cámara o galería) | ✅ |
| 17 | Alegra, Contienda y Marimorena agarradas desde el 08/10 (fecha aproximada) | ✅ |
| 18 | Buscar por señas; Progenie de cada madre con qué hace hoy cada cría; aviso de cambios sin subir; Cala fuera de la cuenta | ✅ |
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

## K. ✅ Sueltos y agarrados a la vista (pedido 25/10)
- En la lista y en la ficha: "Suelta desde 27/05 · 151 días" o "Agarrada desde 10/08 · 76 días".
- Suelto = categoría Descanso (desde que salió) o jugador con ritmo Descanso (desde el último "Suelta"). Agarrado = desde el botón Agarrar o el último "Agarrada…".
- ALEGRA, CONTIENDA y MARIMORENA: agarradas el 08/10 (ver N). CALA: afuera, a la venta (no cuenta).
- Pelaje de la potranca de la Baya confirmado: bayo claro.

## L. ✅ Padrillos (pedido 25/10)
- Una tarjeta por padrillo usado (los cargados, los padres de la manada y los de los servicios; HULK = DOLFINA HULK): sangre (padre × madre y abuelo materno), nacimiento, pelaje, criador, tipo, **hijos vivos y en qué categoría**, por nacer, vendidos, muertos y camadas.
- Filtros arriba: Todos · Potrillos · Doma · Hechura · Descanso · Jugadores · Madres · Por nacer ("qué padrillos usé en cada categoría").
- Tocando uno: datos, pedigree de 3 generaciones, hijos por categoría (se tocan y abren la ficha), por nacer, vendidos y muertos.

## M. ✅ Ajustes del 25/10 (probando el simulador)
- Inicio: sin los botones repetidos de Padrillos y Madres y partos. "Próximo parto" se toca y abre Madres y partos. Quedan Camadas, Sanidad y Notas.
- Arreglado: si en Madres se elegía el año 2027, el Inicio mostraba esa temporada ("Próximo parto 301 d"). Ahora el Inicio siempre usa la temporada actual.
- Padrillos: sin título, botones ni filtros arriba (en la ficha de cada padrillo ya están los hijos por categoría). Para agregar uno: + Alta → Padrillo.
- Inicio: los recuadros se tocan (25/10): Caballos propios → Ver caballos (todos); Preñadas → Madres y partos; Próximo parto → ficha de la próxima en parir; Para hacer → baja a "Para hacer esta semana"; Para revisar → Notas.

## N. ✅ Día de fotos y yeguas agarradas (25/10)
- Inicio → "Día de fotos": lista de los caballos que todavía no tienen foto, agrupados por lugar, con categoría, pelaje y señas para reconocerlos. "Foto" deja sacarla con la cámara o elegirla de la galería y la guarda en la ficha (necesita señal; sin señal avisa y se sube después desde la galería). Arriba, "X de 54 con foto"; abajo, los que ya tienen.
- ALEGRA, CONTIENDA y MARIMORENA: agarradas el 08/10/2026 (fecha aproximada; por la lluvia casi no jugaron). En la app dicen "Agarrada desde 08/10 · N días". En el Sheet: EVENTOS (3 filas, sin precio) y observación en CABALLOS.

## O. ✅ Ideas aprobadas el 25/10
- **Buscar por señas:** la lupa de Ver caballos entiende palabras sueltas en cualquier orden y sin importar plural o femenino: "bayo pata blanca", "estrella", "yegua zaina", "cara blanca". Busca en nombre, apodo, pelaje, observación, padres, RP, chip, categoría y lugar.
- **Progenie** (ficha de la madre): arriba un resumen ("5 crías · 4 en la manada · 1 muerta") y cada cría con su camada, el padre y qué hace hoy: Potrillo/Potranca, En doma, Jugando, En descanso, Madre, Vendida (fecha), Murió (fecha), Nació muerto. También lo que viene en camino ("Por nacer") y los abortos. En los padrillos y caballos, igual pero con la madre.
- **Cambios sin subir:** si se carga algo sin señal, en el Inicio aparece un recuadro amarillo "⟳ 3 cambios sin subir · se suben solos cuando haya señal", y tocándolo se ve cuáles son (ej: "Desvasada — CHINA"). Cuando se suben, aparece "✓ Se subieron 3 cambios a la nube". El botoncito de abajo a la izquierda también lista lo pendiente.
  - El 29, al abrir la app por primera vez, el recuadro va a mostrar muchos cambios (son los ajustes de esta publicación) y en unos segundos se suben solos.
- **Cala:** está a la venta pero no está en Doña Cecilia. Su lugar pasa a "Afuera (a la venta)" y no cuenta en Caballos propios, Para hacer, Sanidad ni Día de fotos. Sigue en Ver caballos (A la venta). Si vuelve, se le cambia el lugar y vuelve a contar sola.
- Ya estaban y no hacía falta hacerlas: cargar a varios de una (Seleccionar / + Sanidad), mover en grupo, ficha para vender, prácticas y torneos, historial (Eventos).

## P. ✅ Revisión crítica antes del 29 (25/10)
- Probado: si la app se cierra a la mitad de los ajustes del 29 y se vuelven a correr, el de los vendidos de Polo Breeders duplicaba las 5 bajas (Chavela, Mirtha, Rumba, Serena, Servilleta). Arreglado: no repite la baja si ya está.
- Ahora cada ajuste se anota apenas termina (antes se anotaban todos juntos al final): si se corta, sigue desde donde quedó.
- El 29: que abra la app primero un solo celular (el de Tomás) con buena señal y la deje abierta 1 minuto, hasta que el recuadro de "cambios sin subir" desaparezca. Recién después, los demás.
- **Prueba de cambios** (`herramientas/prueba_cambios.cjs`): se renombraron madres, preñadas y potrillos, se dejó sin preñadas, parto atrasado, murió una madre con hijos, alta con solo el nombre, Alegra a Descanso, temporada 2027. Todo quedó bien salvo una cosa, ya arreglada:
  - **Cambiar el nombre de una madre le hacía perder sus servicios y sus hijos** (BAYA → LA BAYA quedaba con 0 servicios y 0 hijos). Ahora el nombre nuevo se cambia también en sus servicios y en las fichas de sus hijos. Igual con cualquier caballo que sea padre o abuelo de otro.
  - Si se le pone a un caballo el nombre de otro que ya existe, no deja guardar y avisa.
  - El Sheet (EVENTOS) usa el nombre de hoy del caballo, no el que tenía cuando se cargó el evento.
- **Hasta el 29: no cambiar nombres de caballos en la app** (la versión publicada todavía tiene el problema). Si hay que cambiar uno, decírselo a Claude.
- Arreglado en el script del Sheet: reconocía mal las filas de CAMADA escritas como "MÁXIMO — DC (MINI) 30" y el 29 las habría duplicado. Ahora las reconoce por nombre, apodo o chip.

## Q. ✅ Revisión general del 26/10
- **GitHub:** todo subido en `claude/happy-davinci-ekp0k5` (y copia en `claude/nifty-cray-80hmov`). Netlify publica desde esa rama (confirmado por Tomás en Netlify el 27/10).
- **Supabase:** la lectura de datos anda, las fotos se ven (el depósito de fotos es público), y las notificaciones están configuradas (claves creadas y 3 iPhones anotados).
- **Aviso diario al celular:** simulado con los datos. Hoy todavía avisa "parto atrasado" de Baya, Colorada y Pipa (porque los partos se publican el 29); después del 29 queda: desvasar Falucho, Guerrera, Hammer y Roman (atrasado), herrar 9, desvasar 6 en la semana. Arreglado: el aviso no cuenta a los que están "Afuera" (Cala), igual que la app.
- **Recorrida completa en la copia de prueba:** las 7 pantallas, las 10 categorías, las 76 fichas, 60 formularios de edición, los 13 padrillos, los 15 servicios, búsquedas, altas, nacimiento, aborto, agarrar y los menús de la ruedita: sin errores.
- **Sheet vs app (como queda el 29):** los mismos 54 caballos, cada uno en la misma categoría.
- **Lo que no se puede ver desde acá:** la página de Netlify y su configuración. El 29, antes de publicar, Tomás mira en Netlify → Site configuration → Build & deploy → Branches que la rama de producción sea `claude/happy-davinci-ekp0k5`, y que haya créditos.

## R. ✅ Lector de chips sin botones y Día de fotos (27/10)
- **Lector Bluetooth:** con la app abierta, se pasa el lector por el caballo y se abre su ficha sola (sin tocar nada). Funciona con lectores en modo teclado ("HID"), que escriben el número rápido; una persona tipeando no lo dispara, y si se está escribiendo en un campo tampoco.
  - Si el chip no es de ningún caballo: "¿De qué caballo es?" → se elige y queda guardado (hoy solo los 10 potrillos tienen chip cargado). O "Es un caballo nuevo: darlo de alta".
  - Antes de comprar un lector: conectarlo al iPhone por Bluetooth, abrir Notas y escanear. Si aparece el número en Notas, anda con la app.
- **Día de fotos:** el botón del Inicio dice cuántos faltan ("Día de fotos · faltan 43") y desaparece solo cuando todos tienen foto.

## S. Netlify y créditos (revisado por Tomás con Claude en Chrome, 27/10)
- Rama de producción: `claude/happy-davinci-ekp0k5` ✅. Lo que está online es la publicación del **1/10** ("Muelas cada 365 días…"): todo lo posterior sale el 29.
- Créditos: período 29/9 → 28/10, se renuevan el **jueves 29/10**. Quedan 28, pero Netlify tiene las publicaciones en pausa hasta la renovación.
- Cada publicación gasta ~15 créditos. Casi todo el gasto del mes fue al principio (más de 10 publicaciones el 1/10). Los intentos de después figuran "Skipped"/"Canceled": no gastaron.
- Detalle del período (visto el 27/10): 300 créditos por mes en el plan gratis. Se fueron en **20 publicaciones × 15 = 300**. El uso de la app (funciones, visitas, datos) es casi nada: ~3 créditos por mes (0,1 por día). Conclusión: el único gasto que importa son las publicaciones; da para unas 19 por mes. Publicar siempre todo junto.
- El 29: confirmar en Netlify que los créditos se renovaron y que las publicaciones ya no están en pausa; recién ahí, una sola publicación con todo junto. Guardar créditos para una más de reserva.

## T. Tablero de madres y Asistente (28/10, en prueba en el simulador)
- **Tablero de madres** (Madres y partos): cada preñada con una barra de los días de preñez, la **ventana de parto** marcada en amarillo (días 320–360 desde el servicio), la fecha más probable y una rayita roja en hoy. El cartelito avisa "Entra en ventana en X d" (amarillo, 30 días antes) y "En ventana de parto" (rojo). Idea sacada de HorseBook y Polo HQ.
- **Asistente** (botón ✨ abajo a la derecha, como el de Polo Breeders): se le pregunta y responde con los datos de la app, con tarjetas para abrir la ficha y preguntas sugeridas. **Sin IA ni internet:** entiende por palabras clave (hijos, padres, abuelos, hermanos, chip o número, eventos, última desparasitación/desvase/herrada, edad, dónde está, preñada, preñadas, qué hay que hacer, cuántos hay, a la venta, vendidos/muertos, fotos, padrillos, sueltos/agarrados). Se acuerda del último caballo ("¿quiénes son sus hermanos?"). Si un número es de dos caballos, pregunta cuál.
- Arreglado de paso: al volver con "atrás" desde una ficha abierta desde el asistente, un padrillo o el Día de fotos, se vuelve a esa pantalla (antes se cerraba todo).
- Asistente, ronda de correcciones (29/10, con las pruebas de Tomás): último nacimiento, cuáles parieron esta temporada, agarrados y sueltos por separado (con el que más tiempo lleva), vacías, camada de un año, nacidos este año, lugares ("¿quiénes están en 9 de Julio?"), categoría sola ("jugadores"), hembras/machos, qué le toca a un caballo (desparasitar, desvasar, herrar, muelas con fecha), chip/RP/pelaje, embocadura, prácticas y torneos, suelta/agarrada de un caballo, pedigree y bisabuelos, precio y fecha de un vendido, cuánto se ganó con las ventas, muertos o vendidos de un año, sin chip, preñadas de un padrillo, el último potrillo de una yegua y su padre. **Errores de tipeo:** corrige palabras ("hijso", "hermnos", "desparacitacion") y nombres ("sicodelica", "marimoreana", "pulpro"). Nombres por partes: "la colorada", "la concepción", "la de la baya 26".
- Asistente, segunda ronda (29/10): prueba automática de 912 preguntas (12 por caballo) sin fallas, y 26 de 26 nombres con error de tipeo bien entendidos. Agregado: ayuda ("¿qué podés hacer?"), partos por mes ("¿quiénes paren en diciembre?"), cuánto le falta a una yegua, un día ("¿qué pasó el 21 de octubre?", "11/10"), qué pasó esta semana / novedades, el más viejo y el más joven, cuánto se gastó y se va a gastar en herrero, anemias y vacunas en general, precio de un caballo a la venta, hijas/machos de un padrillo, potrancas y potrillos machos, datos que faltan (padre, fecha de nacimiento…), chip desconocido, "mejor caballo" (responde que eso no lo mide y muestra prácticas y torneos). Arreglado: "esta semana" ya no se toma como "esta yegua".
- Asistente, tercera ronda (29/10): ~130 preguntas más, con muletillas ("che decime…", "boludo…", "porfa"), mayúsculas, signos, espacios de más, chip en grupos ("990 000 015 936 340"), errores fuertes ("hjos d la baya"). Agregado: resumen de la manada, ranking de padrillos, preñadas por año, último desvase/desparasitación de una categoría, cuándo toca herrar/desvasar a un caballo (y si está desherrado), para cuándo / FPP / cuándo nace, con qué padrillo está preñada, padres de dos caballos a la vez, potrillos muertos, número que no existe. Arreglado: "murieron" se corregía a "parieron", "a la venta" se confundía con la plata de las ventas, "Doña" se corregía a "Doma".
- Asistente, cuarta ronda (29/10): preguntas de sí o no ("¿la China es hija de la Gorda?", "¿el 40 es hijo del Mercenario?", "¿la Baya es la madre del 27?", "¿la Susana es hermana de la Vilma?"), doma (domador, cuándo entró), castraciones, abortos, nacidos muertos, partos de temporadas pasadas, notas pendientes, vacunas por nombre y pendientes, dosis de preñez de una yegua, servicios de una yegua, si juega, ficha completa ("todo lo de la China"), promedio de edad, "sin contar potrillos", todos los caballos, dónde están los de una categoría, apodos (la Avispa), emojis y "pls/xfa".
- Asistente, sanidad y numeración (29/10): resumen de sanidad (desparasitación, controles cargados, desvase y herrada: vencidos, por vencer, al día), qué significan los puntitos, quiénes están al día o vencidos (también por categoría o por tipo), sanidad de un caballo, cada cuántos días se desparasita/desvasa/hierra/muelas/vacunas, muelas, quién no tiene desparasitación cargada, veterinario/lesiones/enfermedad/análisis/revisiones/tactos, vacunas por nombre de un caballo. **Numeración:** el número del nombre del potrillo es su RP (coincide con el final del chip); no es el orden en la camada y se repite entre camadas. Prueba automática: 1.140 preguntas (15 por caballo), 0 fallas.
- Asistente, prueba completa (29/10): 1.303 preguntas con control del dato (76 caballos × ~15, 7 categorías × 7, 13 padrillos, 2 lugares, 51 generales): 1.303 bien. Arreglado en esta vuelta: "Machitos" se corregía a "machos", sanidad de doma vacía (ahora explica que no se siguen), qué es MANADA, edades en meses/días para los potrillos chicos, bajas con género ("Vendida", "Murió el…").

- Asistente, quinta ronda (29/10, "hacé todos"): 14 tipos de pregunta nuevos, todos probados (57 preguntas de los grupos + 583 por caballo, 0 fallas; las 1.303 y 1.140 de antes siguen en 0):
  - **Seguimiento:** "¿y la Guacha?" repite la pregunta anterior con otro caballo.
  - **Dictado por voz:** "valla" = Baya, "huacha" = Guacha (palabras que suenan igual), y números en letras ("el cuarenta", "el veintidós", "el cuarenta y uno"). Si el número no es de nadie, lo dice.
  - **Cómo se hace en la app:** parto, aborto, foto, baja, alta, servicio, ecografía, sanidad, herrero, categoría/lugar, editar datos, prácticas, notas, lector de chips (con los nombres reales de los botones).
  - **Sí o no:** ¿está a la venta?, ¿tiene chip / foto?, ¿es macho?, ¿está viva?, ¿está en Madres / en polo / en tal lugar?, ¿es embrión?
  - **Filtros:** por pelaje ("alazanes", "yeguas zainas"), por edad ("de 6 años", "mayores de 5", "los 5 más viejos", "ordenados por edad") y combinados ("hijos del Pulpero en potrillos").
  - **Comparar dos:** quién es más vieja, quién jugó más, quién tiene más crías.
  - **Períodos:** "qué se hizo en septiembre", "este mes", "el mes pasado", "qué toca la semana que viene", "qué hay para noviembre", "bajas de octubre".
  - **Movimientos** de un caballo y "quién se movió este mes"; **nietos**, descendientes y "qué caballos tienen sangre de X".
  - **Plata:** herrero de un caballo (este año y total), precio promedio de venta, "qué le vendí a X".
  - **Embriones y receptoras**; **negaciones** (no preñadas, sin castrar, sin desparasitar, sin herrar, no están a la venta).
  - **Dos preguntas en un mensaje:** "los hijos de la Guacha y cuándo pare la Martina" (si la segunda no nombra caballo, usa el de la primera).
- Asistente, sexta ronda (29/10, "hacé todos" otra vez): 12 tipos más, probados (109 preguntas de los grupos + 848 por caballo, 0 fallas; las 1.303 y 1.140 de antes siguen en 0):
  - **Abreviaturas de WhatsApp:** q, xq, cdo, dnd, hnos, cuants, ctos, prox, ult, tb… y nombres con una letra de menos ("mrtina").
  - **Pedirle que cargue algo** ("cargá que parió la Martina", "dale de baja a la China"): contesta que solo lee, explica con qué botón se hace y deja la ficha.
  - **Rangos de fechas:** "entre marzo y junio", "desde agosto", "hasta junio", "en 2025", "este año", "el año pasado".
  - **Comparar años:** nacimientos, herrero, ventas, muertes, preñeces, prácticas y torneos ("2025 contra 2026", "este año o el pasado").
  - **Porcentajes y promedios:** % de preñez de la temporada, machos y hembras por camada, crías por madre, herrero por mes y por caballo.
  - **Rankings por período:** quién jugó más (este mes, en septiembre, entre meses), en qué caballo se gastó más herrero, herrero mes por mes.
  - **Polo de un caballo:** en qué torneos jugó (con fechas), última práctica, último torneo, última vez que jugó.
  - **Edad de los chicos en meses:** "1 año y 11 meses (23 meses)".
  - **Buscar en las notas:** "¿qué anoté de la China?", "notas sobre herrero".
  - **Qué significa cada cosa:** puntitos, colores, atrasado, por vencer, ventana de parto, agarrado/suelto, Hechura, desvasar, FPP, ritmo, número, "cambios sin subir", Afuera. Y "¿por qué la China está en rojo?" dice qué tiene vencido.
  - **Los de afuera:** "¿quiénes están afuera?", "¿cuántos hay a la venta afuera?".
  - **Mensajes largos:** hasta 4 preguntas juntas, separadas con punto, "y", "también" o "después".
- Asistente, séptima ronda (28/10): **refinar la respuesta anterior** ("de esas, ¿cuáles son alazanas?", "solo las hembras", "sacá las de jugadores", "ordenalas por edad / por nombre") y **"no, la otra"** (otro caballo con un nombre parecido). Además, "a la venta" se combina con los otros filtros ("yeguas alazanas a la venta"). 120 preguntas de los grupos + 848 por caballo, 0 fallas.

- Asistente, señas (28/10, pedido de Tomás): busca en las **observaciones** de las fichas. "cara blanca" (también "carablanca", "malacara"), "estrella en la frente" ("lucero"), "patas blancas", "cuatro patas blancas", "una pata blanca", y combinado con sexo, categoría o pelaje ("machos cara blanca", "potrillos con cara blanca"). Dice cuántos hay en la manada y cuántos que ya no están. "¿La 34 tiene pata blanca?" contesta sí o no (si el número es de dos caballos, contesta por los dos). Cualquier otra palabra de las observaciones también se encuentra ("bozal azul"). 135 preguntas de los grupos + 954 por caballo, 0 fallas.
- Asistente, observaciones (28/10): además de la ficha, busca en lo anotado en la baja, en los servicios y en los eventos (sin las notas de rutina ni las de "de dónde salió el dato"). "Observaciones de la Gorda" lista todo lo anotado de ese caballo; "¿quién tiene anotado vacunación preñadas?", "observaciones con perdió", "¿la Gorda tiene anotado que la perdió?". Las señas físicas (cara blanca, estrella, patas) salen solo de la ficha del caballo, para no confundir la seña de una cría con la de la madre. 139 preguntas de los grupos + 1.007 por caballo, 0 fallas.
- Asistente, edades (28/10, con las capturas de Tomás): "¿Cuántas yeguas de 3 años hay? ¿Y cuáles?" contestaba la Blusera (tomaba el 3 como su número). Ahora un número seguido de años, meses o días es una edad, no un caballo. Entiende "3 años", "2 años", "dos años", "1 año", "potrillos de 10 meses", "yeguas alazanas de polo"; dice los nombres y cuántos caballos no tienen fecha de nacimiento (no entran en la cuenta). "¿La Blusera tiene 3 años?" → "No, tiene 6". "¿Y cuáles?" al final ya no es otra pregunta. 149 preguntas de los grupos + 1.007 por caballo, 0 fallas.
- Edades por camada (28/10, pedido de Tomás): como se cuenta en el campo, la edad sale de la camada (los de 2025 cumplen 1 esta temporada, los de 2024 cumplen 2…); sin camada, del año de nacimiento. "Caballos de 2 años" da los 5 de la camada 2024 (antes mezclaba una potranca recién nacida y la Cala por decir "años" en la observación). En la ficha, el renglón Camada dice "2024 · cumple 2 años esta temporada". La edad de un caballo dice la exacta y la de camada. 24 caballos (madres y jugadores grandes) no tienen camada ni fecha: no entran en esas cuentas y el asistente lo avisa.
- Asistente, entender mejor la pregunta (28/10, Tomás: "si no le preguntás exactamente lo que quiere escuchar, no interpreta"): prueba nueva con ~1.550 formas distintas de preguntar lo mismo (grupos, edades, cada tema de un caballo, generales). Arreglado: "yeguas de un año de edad" ("un" = 1, y con "?" al final), "yeguas" / "machos" solos, "qué edad tienen los potrillos", "está llena" = preñada, "con qué padrillo está", "qué le falta", "de qué camada es", "en qué categoría está", "lugares", "quiénes nacieron", "qué anoté". Si un número es de varios caballos ("cuándo pare la 23"), contesta por cada uno en vez de preguntar cuál. Resultado: 0 sin entender y 0 fuera de tema.
- Nombres unificados (28/10, Tomás: "unificar" HULK / DOLFINA HULK y LOSMACHITOS LIBANO / LOS MACHITOS LIBANO): en la app real las fichas ya decían HULK (9) y LOSMACHITOS LIBANO; las otras formas aparecían al cargar en el simulador porque el autocompletar ofrecía el nombre de la biblioteca de genealogías. Ahora la biblioteca se muestra y se completa con la forma que ya usa la app (HULK, LOSMACHITOS LIBANO, DON URBANO MEREQUETENGUE), en el autocompletar, en los abuelos que se completan solos y en la pantalla Padrillos. Sheet: CABALLOS (21, S/N PAROLA 23, ROCKERA), PEDIGREE y PADRILLOS pasaron de DOLFINA HULK a HULK, y LOS MACHITOS LIBANO a LOSMACHITOS LIBANO (las cuentas por padrillo siguen bien). GENEALOGÍAS deja el nombre completo del catálogo.
- Asistente, sugerencias (28/10, pedido de Tomás): al abrir muestra 8 sugerencias (antes 4 fijas), una de cada tema (preñez, trabajo y sanidad, manada, genealogía, polo, plata y ventas, cómo se usa la app, datos), con caballos de verdad ("¿Cuándo pare la Potranca Baya?", "Sanidad de la China", "Abuelos del 28") y distintas cada vez que se abre: nunca repite las de la vez anterior. ~130 sugerencias posibles, todas probadas (se entienden y contestan bien). De paso: "¿Cuál es el chip del 40?" / "¿Quién es el chip 40?" ya no contesta como si fuera sí o no, y "¿Qué nació este año?" lista los nacimientos.
- Asistente, después de cada respuesta (28/10, pedido de Tomás): 4 sugerencias, 2 relacionadas con lo que se habló y 2 de otro tema. Relacionadas: si se habló de un caballo, otras cosas de ese caballo que tengan dato (sanidad, padres, hermanos, edad, abuelos, dónde está, cuándo pare, cuándo jugó); si salió una lista, una para refinarla ("Ordenalos por edad", "De esos, ¿cuáles son hembras?") y una del mismo tema. Probado: 1.600 sugerencias después de 400 respuestas, todas se entienden.
  - Falta: repetir todas las pruebas con los datos reales el 29, después de publicar.

## U. Código ordenado, sin parches (28/10)
- Antes, unas 25 funciones se definían en un archivo y otro las reemplazaba o envolvía (sanidad, tareas, ficha, Inicio, Madres, genealogía, cerrar pantallas, formulario de evento y de baja…). Ahora cada una está **una sola vez**, con todo junto, y un comentario dice qué parte viene de qué archivo.
- Se sacó lo que ya no se usaba: funciones viejas reemplazadas (árbol viejo, formulario de baja y de evento viejos, lista vieja de padrillos), acciones repetidas y controles "por si no cargó tal archivo" (siempre cargan todos).
- El asistente quedó en una sola pieza ordenada: entender la pregunta → armar respuestas → responder (1 preguntas de uso, 2 cómo se hace / sí o no / filtros, 3 lo de siempre).
- Prueba: "foto" de todo lo que muestra la app antes y después (2.323 controles: 7 pantallas, 9 categorías, 76 fichas, formularios, sanidad de cada caballo, preñeces, tareas, genealogías y 1.429 respuestas del asistente): **0 diferencias**. La recorrida completa, el lector de chip, el atrás, los cambios de nombre y categoría dan exactamente lo mismo que antes.
- Los AJUSTES de datos (19) se sacan después del 29, cuando la app publicada los aplique a los datos reales y se confirme que quedaron.

## V. Publicación del 29/10
- Netlify revisado por Tomás con Claude en Chrome: 300 de 300 créditos (renovados el 28/10, hasta el 28/11), publicaciones activas, rama de producción claude/happy-davinci-ekp0k5, carpeta app. En línea estaba la versión del 1/10 (8ee830f).
- El pull request #1 sale de la rama de producción y armaba una vista previa por cada cambio: ahora el netlify.toml las saltea siempre (solo publica producción y solo con [publicar]).
- Publicado todo junto en un solo cambio con [publicar].
