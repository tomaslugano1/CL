# Doña Cecilia: app para el equipo

Es la misma app de siempre, con tres cosas nuevas:

- **Cada uno entra con su mail y contraseña.** Todos ven y cargan los mismos datos.
- **Funciona sin señal.** Lo que se carga queda guardado en el celular y se sube solo cuando vuelve la señal. Abajo a la izquierda hay un cartelito que dice si está todo subido o si hay cambios esperando.
- **Completa los abuelos solo.** Cuando escribís el padre o la madre, si ese caballo ya está cargado (en una ficha, en Padrillos o en un hermano), completa los abuelos vacíos.

No hay que instalar nada en ninguna compu, ni configurar firewalls. Se usan dos servicios gratuitos:

| Servicio | Para qué | Costo |
|---|---|---|
| **Supabase** (supabase.com) | Guarda los datos y las contraseñas | Gratis (alcanza de sobra para 6 personas) |
| **Netlify** (netlify.com) | Publica la app en una dirección web | Gratis |

---

## Paso 1: crear la base de datos (unos 10 minutos)

1. Entrá a **supabase.com** → *Start your project* → registrate con tu cuenta de GitHub o con tu mail.
2. *New project*:
   - Nombre: `dona-cecilia`.
   - *Database password*: inventá una y **guardala** (no la vas a usar seguido).
   - Región: **South America (São Paulo)**.
   - *Create new project*. Tarda uno o dos minutos.
3. Menú de la izquierda → **SQL Editor** → *New query*. Pegá todo el contenido de `supabase/instalar.sql` y tocá **Run**. Tiene que decir *Success*.
4. Otra *New query*: pegá el archivo **`datos-iniciales.sql`** (te lo mando por el chat, no está en GitHub porque tiene los datos del campo) → **Run**. Así se suben los 68 caballos, los eventos, los servicios, etc.
5. **Muy importante, para que nadie de afuera se pueda registrar**: menú izquierdo → **Authentication** → **Sign In / Providers** (o *Settings*) → apagá **"Allow new users to sign up"** → *Save*.
6. Menú izquierdo → **Project Settings** → **API** (o *Data API* / *API Keys*). Copiá estos dos datos y mandámelos por el chat:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)

   Estos dos datos **se pueden compartir**: no alcanzan para entrar sin usuario y contraseña. **No** me mandes la *service_role key* ni la contraseña de la base.

## Paso 2: crear los usuarios

En Supabase → **Authentication** → **Users** → **Add user** → **Create new user**:
- El mail del empleado y una contraseña que le vas a pasar.
- Tildá **Auto Confirm User**.

Repetilo para cada persona, incluido vos. Para sacarle el acceso a alguien, lo borrás de esa lista.
Para cambiarle la contraseña a alguien: tres puntitos al lado del usuario → *Reset password* (o borralo y crealo de nuevo).

## Paso 3: publicar la app (esto lo hacemos juntos)

Cuando me pases los datos del paso 1, yo completo `app/config.js`. Después:

1. Entrá a **netlify.com** → registrate con tu cuenta de GitHub.
2. *Add new site* → *Import an existing project* → **GitHub** → elegí el repositorio **CL**.
3. En *Branch to deploy* elegí `claude/happy-davinci-ekp0k5`. Lo demás dejalo como está (ya viene configurado) → **Deploy**.
4. Te da una dirección tipo `algo-raro.netlify.app`. En *Site configuration* → *Change site name* la podés cambiar a `donacecilia` → queda **donacecilia.netlify.app**.

Cada vez que yo haga un cambio y lo suba a GitHub, Netlify actualiza la app sola.

## Paso 4: ponerla en el celular

- **Android (Chrome):** abrí la dirección → menú ⋮ → **Agregar a pantalla de inicio** / *Instalar app*.
- **iPhone (Safari):** abrí la dirección → botón compartir ⬆ → **Agregar a inicio**.
- **Compu (Windows):** abrila en Chrome o Edge. Se puede instalar con el iconito ⊕ de la barra de direcciones.

La primera vez cada uno entra con su mail y contraseña **con señal**. Después abre aunque no haya señal.

## Paso 5: activar los recordatorios en el calendario (una sola vez)

1. En Supabase → **SQL Editor** → *New query*: pegá todo `supabase/recordatorios.sql` → **Run** → tiene que decir *Success*.
2. En la app: **Inicio → Herramientas → Recordatorios → Activar**.
3. **Desde la compu** tocá **"Agregar a Google Calendar"** → en Google Calendar tocá **Agregar**. En iPhone usá el botón de iPhone.
4. En Google Calendar, en la configuración de ese calendario ("Doña Cecilia"), poné una notificación **"1 día antes a las 8:00"**, así te avisa en el celular.

El calendario muestra, por día y por lugar, qué hay que desparasitar, desvasar y herrar, y los partos probables. Se actualiza solo (Google tarda unas horas en refrescar).
Para que funcione, el sitio de Netlify tiene que estar en **público** ("Make public").

## Paso 6: notificaciones en el celular (una sola vez)

Cada mañana a las 8:00 llega un aviso como los de WhatsApp: lo que vence hoy, lo atrasado y los partos de la semana.

1. En Supabase → **SQL Editor**: pegá `supabase/notificaciones.sql` → **Run** (necesita haber hecho el Paso 5).
2. En Netlify → el sitio → **Site configuration → Environment variables → Add a variable**, cargá dos:
   - `VAPID_PRIVATE_KEY`: la clave privada que te pasé aparte (**no la publiques en ningún lado**).
   - `CLAVE_CALENDARIO`: la clave del calendario (lo que va después de `k=` en el link de Recordatorios).
3. Netlify → **Deploys → Trigger deploy → Deploy site**, para que tome las variables.
4. En **cada celular**: abrí la app (en iPhone, desde el ícono de la pantalla de inicio) → **Inicio → Herramientas → Notificaciones → Activar** → **Permitir**. Después tocá **"Mandarme una de prueba"**.

---

## Preguntas frecuentes

**¿Qué pasa si dos personas cambian el mismo caballo sin señal?** Queda el último que se sincronizó. Cada evento (parición, práctica, herraje) es un registro aparte, así que esos nunca se pisan.

**¿Se puede borrar algo sin querer y perderlo?** En la base nada se borra de verdad: queda marcado como borrado y se puede recuperar desde Supabase (tabla `registros`, columna `borrado`).

**¿Cómo hago una copia de seguridad?** Inicio → Herramientas → **Excel**. Baja un archivo con todos los caballos, eventos, servicios, padrillos y notas. Conviene hacerlo una vez por mes (la app te avisa).

**¿Y las fotos?** Se suben solo con señal. El resto de los datos sí se carga sin señal.

**¿Y Polo Argentino?** Es una app de otra empresa (Symphony Technology), sin una forma pública de conectarse. Por ahora la app completa los abuelos con lo que ya está cargado, y cada caballo nuevo que cargás suma para la próxima. Si ellos dan acceso, se agrega.

**Recomendación:** poné el repositorio de GitHub como **privado** (GitHub → CL → Settings → abajo de todo *Change visibility* → *Private*). Netlify sigue funcionando igual.

---

## Para el técnico (si algún día hace falta)

- `app/`: la app (HTML + JS, sin compilación). `nube.js` reemplaza al guardado local: mantiene una copia en `localStorage`, una cola de cambios pendientes y sincroniza con la tabla `registros` de Supabase (push con upsert y pull incremental por `actualizado`, con 2 minutos de solapamiento; gana la última escritura por documento).
- `app/sw.js`: service worker para abrir sin señal. Subir `VERSION` al cambiar archivos.
- `supabase/instalar.sql`: tabla, trigger, políticas RLS (solo `authenticated`) y bucket `fotos`.
- `app/extras.js`: Excel, "Para hacer esta semana", nombres parecidos, genealogía de 3 generaciones, compartir ficha de venta y recordatorios.
- `netlify/functions/calendario.mjs`: arma el calendario `.ics` (`/calendario.ics?k=clave`) leyendo `datos_calendario` de `supabase/recordatorios.sql`.
- `netlify/functions/avisos-diarios.mjs` (todos los días 11:00 UTC) y `push-prueba.mjs` (`/api/push-prueba`), con la lógica en `netlify/lib/avisos.mjs`: notificaciones Web Push (librería `web-push`, ver `package.json`). Tabla y funciones en `supabase/notificaciones.sql`.
- `netlify.toml`: publica la carpeta `app` y las funciones.
