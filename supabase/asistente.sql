-- Doña Cecilia: la "puerta" del asistente (Claude), para cargar lo que Tomás cuenta por audio.
-- Se pega entero en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez sin problema.
-- Necesita haber corrido antes instalar.sql.
--
-- Qué puede hacer el asistente con esta puerta (y nada más):
--   · CREAR eventos (herradas, desparasitaciones, vacunas, movimientos…), servicios, partos (potrillos nuevos), notas y padrillos.
--   · CAMBIAR datos de caballos, servicios, eventos, notas y padrillos (por ejemplo una seña, una fecha mal cargada).
--     Nunca puede borrar un dato (poner algo vacío) ni tocar fotos, videos ni premios.
--   · ANULAR un evento cargado por error (queda en la papelera: se puede recuperar).
--   · LEER los datos para revisar antes de cargar.
-- Qué NO puede: borrar caballos, servicios ni nada que no sea un evento; tocar usuarios, la configuración ni las claves.
-- Todo lo que carga queda a nombre de Toto (el usuario que activó la puerta desde la app) y anotado en un registro,
-- con cómo estaba antes, para poder deshacerlo.
--
-- La clave se crea desde la app (Configuración → Asistente por audio → Activar). Acá solo se guarda su huella (hash),
-- así que ni leyendo la base se puede saber la clave. Para cerrar la puerta: Configuración → Asistente por audio → Apagar.

create extension if not exists pgcrypto with schema extensions;

-- 1) La clave del asistente (solo la huella) y a nombre de quién quedan las cargas.
create table if not exists public.asistente_clave (
  id     int         primary key default 1 check (id = 1),
  huella text        not null,
  por    uuid        not null,
  activa boolean     not null default true,
  creado timestamptz not null default now()
);
alter table public.asistente_clave enable row level security;   -- sin políticas: nadie la lee directo

-- 2) Registro de todo lo que hace el asistente (los usuarios de la app lo pueden leer).
create table if not exists public.asistente_registro (
  n         bigserial   primary key,
  cuando    timestamptz not null default now(),
  coleccion text        not null,
  id        text        not null,
  accion    text        not null,
  antes     jsonb,
  despues   jsonb,
  nota      text
);
alter table public.asistente_registro enable row level security;
drop policy if exists "usuarios leen el registro del asistente" on public.asistente_registro;
create policy "usuarios leen el registro del asistente" on public.asistente_registro for select to authenticated using (true);

-- 3) Quién cargó: el usuario de la app y, si es el asistente, a nombre de quien lo activó.
create or replace function public.registros_tocar() returns trigger
language plpgsql as $$
begin
  new.actualizado := clock_timestamp();
  new.por := coalesce(auth.uid(), nullif(current_setting('dc.por', true), '')::uuid);
  return new;
end $$;

-- 4) Activar / apagar (desde la app, con tu usuario). Activar crea una clave nueva y la devuelve una sola vez.
create or replace function public.asistente_activar() returns text
language plpgsql security definer set search_path = public, extensions
as $$
declare k text := encode(gen_random_bytes(24), 'hex');
begin
  if auth.uid() is null then raise exception 'Hay que estar dentro de la app'; end if;
  insert into public.asistente_clave (id, huella, por, activa, creado)
    values (1, encode(digest(k, 'sha256'), 'hex'), auth.uid(), true, now())
    on conflict (id) do update set huella = excluded.huella, por = excluded.por, activa = true, creado = now();
  return k;
end $$;
revoke all on function public.asistente_activar() from public, anon;
grant execute on function public.asistente_activar() to authenticated;

create or replace function public.asistente_apagar() returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Hay que estar dentro de la app'; end if;
  update public.asistente_clave set activa = false where id = 1;
end $$;
revoke all on function public.asistente_apagar() from public, anon;
grant execute on function public.asistente_apagar() to authenticated;

create or replace function public.asistente_estado() returns jsonb
language sql stable security definer set search_path = public
as $$ select coalesce((select jsonb_build_object('activa', activa, 'desde', creado) from public.asistente_clave where id = 1), '{"activa":false}'::jsonb) $$;
revoke all on function public.asistente_estado() from public, anon;
grant execute on function public.asistente_estado() to authenticated;

-- 5) Control de la clave (viene en el encabezado X-DC-Asistente-Key). Devuelve a nombre de quién se carga.
create or replace function public.asistente_controlar() returns uuid
language plpgsql stable security definer set search_path = public, extensions
as $$
declare
  k text := (nullif(current_setting('request.headers', true), '')::json) ->> 'x-dc-asistente-key';
  c public.asistente_clave;
begin
  select * into c from public.asistente_clave where id = 1 and activa;
  if c.huella is null or k is null or encode(digest(k, 'sha256'), 'hex') <> c.huella then
    raise exception 'Clave del asistente incorrecta o puerta apagada';
  end if;
  return c.por;
end $$;
revoke all on function public.asistente_controlar() from public, anon;

-- 6) Leer (para revisar antes de cargar): todo menos usuarios y configuración privada.
create or replace function public.asistente_leer()
returns table (coleccion text, id text, data jsonb)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.asistente_controlar();
  return query select r.coleccion, r.id, r.data from public.registros r
    where not r.borrado and r.coleccion in ('caballos', 'eventos', 'servicios', 'padrillos', 'notas', 'config');
end $$;
revoke all on function public.asistente_leer() from public;
grant execute on function public.asistente_leer() to anon, authenticated;

-- 7) Cargar. p_cambios = lista de {accion, coleccion, id, data}. Todo o nada: si uno falla, no se carga ninguno.
create or replace function public.asistente_cargar(p_cambios jsonb, p_nota text default '')
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  quien uuid := public.asistente_controlar();
  x jsonb; acc text; col text; did text; datos jsonb; antes jsonb; nuevo jsonb; k text; hecho jsonb := '[]'::jsonb;
begin
  perform set_config('dc.por', quien::text, true);   -- el trigger lo anota a nombre de Toto
  if jsonb_typeof(p_cambios) <> 'array' or jsonb_array_length(p_cambios) = 0 then raise exception 'No hay cambios'; end if;
  if jsonb_array_length(p_cambios) > 80 then raise exception 'Demasiados cambios juntos (máximo 80)'; end if;
  for x in select * from jsonb_array_elements(p_cambios) loop
    acc := x ->> 'accion'; col := x ->> 'coleccion'; did := x ->> 'id'; datos := coalesce(x -> 'data', '{}'::jsonb);
    if did is null or did !~ '^[A-Za-z0-9_-]{1,80}$' then raise exception 'Identificador inválido: %', did; end if;
    if col not in ('caballos', 'eventos', 'servicios', 'padrillos', 'notas') then raise exception 'No puede tocar %', col; end if;
    if jsonb_typeof(datos) <> 'object' then raise exception 'Datos inválidos en %/%', col, did; end if;

    if acc = 'crear' then
      if exists (select 1 from public.registros r where r.coleccion = col and r.id = did) then
        raise exception 'Ya existe %/%', col, did; end if;
      nuevo := datos || case when col = 'eventos' then jsonb_build_object('por', quien::text) else '{}'::jsonb end;
      insert into public.registros (coleccion, id, data) values (col, did, nuevo);
      insert into public.asistente_registro (coleccion, id, accion, antes, despues, nota) values (col, did, 'crear', null, nuevo, p_nota);

    elsif acc = 'cambiar' then
      select r.data into antes from public.registros r where r.coleccion = col and r.id = did and not r.borrado for update;
      if antes is null then raise exception 'No existe %/%', col, did; end if;
      for k in select jsonb_object_keys(datos) loop
        if k in ('fotos', 'videos', 'premios', 'encuadres', 'id') then raise exception 'No puede cambiar % en %/%', k, col, did; end if;
        if jsonb_typeof(datos -> k) = 'null' or (jsonb_typeof(antes -> k) = 'string' and antes ->> k <> '' and datos ->> k = '') then
          raise exception 'No puede borrar el dato % de %/%', k, col, did; end if;
      end loop;
      nuevo := antes || datos;
      update public.registros set data = nuevo where coleccion = col and id = did;
      insert into public.asistente_registro (coleccion, id, accion, antes, despues, nota) values (col, did, 'cambiar', antes, nuevo, p_nota);

    elsif acc = 'anular' then
      if col <> 'eventos' then raise exception 'Solo se pueden anular eventos (no %)', col; end if;
      select r.data into antes from public.registros r where r.coleccion = col and r.id = did and not r.borrado for update;
      if antes is null then raise exception 'No existe %/%', col, did; end if;
      update public.registros set borrado = true where coleccion = col and id = did;   -- queda en la papelera
      insert into public.asistente_registro (coleccion, id, accion, antes, despues, nota) values (col, did, 'anular', antes, null, p_nota);

    else
      raise exception 'Acción no permitida: %', acc;
    end if;
    hecho := hecho || jsonb_build_object('accion', acc, 'coleccion', col, 'id', did);
  end loop;
  return hecho;
end $$;
revoke all on function public.asistente_cargar(jsonb, text) from public;
grant execute on function public.asistente_cargar(jsonb, text) to anon, authenticated;

-- 8) Deshacer un cambio del asistente (por su número en el registro): vuelve todo como estaba.
create or replace function public.asistente_deshacer(p_n bigint)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare quien uuid := public.asistente_controlar(); g public.asistente_registro;
begin
  perform set_config('dc.por', quien::text, true);
  select * into g from public.asistente_registro where n = p_n;
  if g.n is null then raise exception 'No existe el cambio %', p_n; end if;
  if g.accion = 'crear' then
    update public.registros set borrado = true where coleccion = g.coleccion and id = g.id;
  elsif g.accion = 'cambiar' then
    update public.registros set data = g.antes where coleccion = g.coleccion and id = g.id;
  elsif g.accion = 'anular' then
    update public.registros set borrado = false where coleccion = g.coleccion and id = g.id;
  else
    raise exception 'Ese cambio ya es un deshacer';
  end if;
  insert into public.asistente_registro (coleccion, id, accion, antes, despues, nota)
    values (g.coleccion, g.id, 'deshacer ' || g.n, g.despues, g.antes, 'Deshace el cambio ' || g.n);
  return jsonb_build_object('deshecho', g.n, 'coleccion', g.coleccion, 'id', g.id);
end $$;
revoke all on function public.asistente_deshacer(bigint) from public;
grant execute on function public.asistente_deshacer(bigint) to anon, authenticated;
