-- Doña Cecilia: activa los recordatorios en el calendario (Google Calendar / iPhone).
-- Se pega entero en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Crea una clave secreta larga. El link del calendario lleva esa clave; sin ella no se ve nada.
-- Solo los usuarios de la app pueden leer la clave (para mostrar el link).

create table if not exists public.calendario_clave (
  id    int  primary key default 1 check (id = 1),
  clave text not null default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
);
insert into public.calendario_clave (id) values (1) on conflict (id) do nothing;

alter table public.calendario_clave enable row level security;
drop policy if exists "usuarios ven la clave" on public.calendario_clave;
create policy "usuarios ven la clave" on public.calendario_clave for select to authenticated using (true);

-- Devuelve los datos que necesita el calendario, solo si la clave es correcta.
create or replace function public.datos_calendario(p_clave text)
returns table (coleccion text, id text, data jsonb)
language sql stable security definer set search_path = public
as $$
  select r.coleccion, r.id, r.data
  from public.registros r
  where not r.borrado
    and r.coleccion in ('caballos', 'eventos', 'servicios', 'config')
    and exists (select 1 from public.calendario_clave k where k.clave = p_clave);
$$;
revoke all on function public.datos_calendario(text) from public;
grant execute on function public.datos_calendario(text) to anon, authenticated;

-- Para cambiar la clave (si el link se compartió de más), correr:
--   update public.calendario_clave set clave = replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
