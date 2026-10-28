-- Doña Cecilia: notificaciones sin claves para copiar a mano.
-- Se pega entero en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
-- Necesita haber corrido antes recordatorios.sql y notificaciones.sql.
--
-- 1) La app genera sola su par de claves de notificaciones la primera vez y lo guarda acá.
--    La clave privada no la puede leer nadie desde afuera: solo la usan las funciones de abajo.
create table if not exists public.push_config (
  id      int  primary key default 1 check (id = 1),
  publica text not null,
  privada text not null,
  creado  timestamptz not null default now()
);
alter table public.push_config enable row level security;   -- sin políticas: nadie la lee directo

create or replace function public.vapid_publica()
returns text language sql stable security definer set search_path = public
as $$ select publica from public.push_config where id = 1 $$;
revoke all on function public.vapid_publica() from public;
grant execute on function public.vapid_publica() to authenticated;

-- Guarda las claves solo si todavía no hay; devuelve la pública que quedó guardada.
create or replace function public.guardar_vapid(p_publica text, p_privada text)
returns text language plpgsql security definer set search_path = public
as $$
begin
  insert into public.push_config (id, publica, privada) values (1, p_publica, p_privada) on conflict (id) do nothing;
  return (select publica from public.push_config where id = 1);
end $$;
revoke all on function public.guardar_vapid(text, text) from public;
grant execute on function public.guardar_vapid(text, text) to authenticated;

-- 2) Todo lo que necesita el aviso diario, solo con la clave secreta del calendario.
create or replace function public.push_datos(p_clave text)
returns jsonb language sql stable security definer set search_path = public
as $$
  select case when exists (select 1 from public.calendario_clave k where k.clave = p_clave) then
    jsonb_build_object(
      'publica', (select publica from public.push_config where id = 1),
      'privada', (select privada from public.push_config where id = 1),
      'subs',    coalesce((select jsonb_agg(to_jsonb(s)) from public.push_suscripciones s), '[]'::jsonb),
      'filas',   coalesce((select jsonb_agg(jsonb_build_object('coleccion', r.coleccion, 'id', r.id, 'data', r.data))
                           from public.registros r
                           where not r.borrado and r.coleccion in ('caballos','eventos','servicios','config')), '[]'::jsonb))
  end
$$;
revoke all on function public.push_datos(text) from public;
grant execute on function public.push_datos(text) to anon, authenticated;

-- 3) Lo mismo para "Mandarme una de prueba": solo los celulares del usuario que lo pide.
create or replace function public.push_datos_mios()
returns jsonb language sql stable security definer set search_path = public
as $$
  select case when auth.uid() is not null then
    jsonb_build_object(
      'publica', (select publica from public.push_config where id = 1),
      'privada', (select privada from public.push_config where id = 1),
      'subs',    coalesce((select jsonb_agg(to_jsonb(s)) from public.push_suscripciones s where s.usuario = auth.uid()), '[]'::jsonb),
      'filas',   coalesce((select jsonb_agg(jsonb_build_object('coleccion', r.coleccion, 'id', r.id, 'data', r.data))
                           from public.registros r
                           where not r.borrado and r.coleccion in ('caballos','eventos','servicios','config')), '[]'::jsonb))
  end
$$;
revoke all on function public.push_datos_mios() from public;
grant execute on function public.push_datos_mios() to authenticated;

-- 4) El despertador: todos los días a las 8:00 de Argentina (11:00 UTC) le avisa a la app que mande el aviso.
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'dona-cecilia-avisos';
select cron.schedule(
  'dona-cecilia-avisos',
  '0 11 * * *',
  $$ select net.http_post(
       url := 'https://donacecilia.netlify.app/api/avisos',
       body := jsonb_build_object('clave', (select clave from public.calendario_clave limit 1)),
       headers := '{"Content-Type": "application/json"}'::jsonb,
       timeout_milliseconds := 30000) $$
);

-- Comprobación: tiene que mostrar el despertador con horario "0 11 * * *"
select jobname, schedule, active from cron.job where jobname = 'dona-cecilia-avisos';
