-- Doña Cecilia: activa las notificaciones en el celular (como las de WhatsApp).
-- Se pega entero en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
-- Necesita haber corrido antes recordatorios.sql (usa la misma clave secreta).

-- Cada celular que activa las notificaciones queda anotado acá.
create table if not exists public.push_suscripciones (
  endpoint text primary key,
  p256dh   text not null,
  auth     text not null,
  usuario  uuid default auth.uid(),
  aparato  text,
  creado   timestamptz not null default now()
);
alter table public.push_suscripciones enable row level security;
drop policy if exists "usuarios anotan su celular"  on public.push_suscripciones;
drop policy if exists "usuarios ven sus celulares"  on public.push_suscripciones;
drop policy if exists "usuarios cambian su celular" on public.push_suscripciones;
drop policy if exists "usuarios borran su celular"  on public.push_suscripciones;
create policy "usuarios anotan su celular"  on public.push_suscripciones for insert to authenticated with check (usuario = auth.uid());
create policy "usuarios ven sus celulares"  on public.push_suscripciones for select to authenticated using (usuario = auth.uid());
create policy "usuarios cambian su celular" on public.push_suscripciones for update to authenticated using (true) with check (usuario = auth.uid());
create policy "usuarios borran su celular"  on public.push_suscripciones for delete to authenticated using (usuario = auth.uid());

-- El aviso diario (en Netlify) lee los celulares con la clave secreta.
create or replace function public.suscripciones_push(p_clave text)
returns setof public.push_suscripciones
language sql stable security definer set search_path = public
as $$
  select s.* from public.push_suscripciones s
  where exists (select 1 from public.calendario_clave k where k.clave = p_clave);
$$;
revoke all on function public.suscripciones_push(text) from public;
grant execute on function public.suscripciones_push(text) to anon, authenticated;

-- Y borra los celulares que ya no existen (app desinstalada, permiso sacado).
create or replace function public.borrar_suscripcion_push(p_clave text, p_endpoint text)
returns void
language sql security definer set search_path = public
as $$
  delete from public.push_suscripciones s
  where s.endpoint = p_endpoint
    and exists (select 1 from public.calendario_clave k where k.clave = p_clave);
$$;
revoke all on function public.borrar_suscripcion_push(text, text) from public;
grant execute on function public.borrar_suscripcion_push(text, text) to anon, authenticated;
