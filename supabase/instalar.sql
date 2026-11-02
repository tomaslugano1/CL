-- Doña Cecilia: prepara la base de datos.
-- Se pega entero en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez sin problema.

-- 1) Una sola tabla guarda todo: caballos, eventos, servicios, padrillos, notas, configuración y usuarios.
create table if not exists public.registros (
  coleccion   text        not null,
  id          text        not null,
  data        jsonb,
  borrado     boolean     not null default false,
  actualizado timestamptz not null default now(),
  por         uuid,
  primary key (coleccion, id)
);
create index if not exists registros_actualizado on public.registros (actualizado);

-- 2) Cada vez que alguien guarda algo, se anota la hora del servidor y quién fue.
create or replace function public.registros_tocar() returns trigger
language plpgsql as $$
begin
  new.actualizado := clock_timestamp();
  new.por := auth.uid();
  return new;
end $$;
drop trigger if exists registros_tocar on public.registros;
create trigger registros_tocar before insert or update on public.registros
  for each row execute function public.registros_tocar();

-- 3) Seguridad: solo los usuarios que vos creaste pueden leer y cargar. Nadie puede borrar
--    de verdad (lo "borrado" queda marcado), así siempre se puede recuperar.
alter table public.registros enable row level security;
drop policy if exists "usuarios leen"      on public.registros;
drop policy if exists "usuarios cargan"    on public.registros;
drop policy if exists "usuarios modifican" on public.registros;
create policy "usuarios leen"      on public.registros for select to authenticated using (true);
create policy "usuarios cargan"    on public.registros for insert to authenticated with check (true);
create policy "usuarios modifican" on public.registros for update to authenticated using (true) with check (true);

-- 4) Lugar para las fotos de los caballos.
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
  on conflict (id) do nothing;
drop policy if exists "usuarios suben fotos"  on storage.objects;
drop policy if exists "usuarios borran fotos" on storage.objects;
create policy "usuarios suben fotos"  on storage.objects for insert to authenticated with check (bucket_id = 'fotos');
create policy "usuarios borran fotos" on storage.objects for delete to authenticated using (bucket_id = 'fotos');
