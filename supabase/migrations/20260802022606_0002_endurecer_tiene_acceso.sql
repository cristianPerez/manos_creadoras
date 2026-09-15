-- Aplicada en producción el 2026-08-02.
--
-- PROBLEMA (detectado por el linter de seguridad de Supabase):
-- `tiene_acceso(uid)` era ejecutable por CUALQUIERA, incluso sin iniciar sesión, vía
-- /rest/v1/rpc/tiene_acceso. Alguien podía probar UUIDs y averiguar qué alumnas tienen
-- membresía activa — fuga de información sobre las clientas.
--
-- ARREGLO: dos funciones con permisos distintos.

-- 1) La lógica real. SOLO el servidor puede preguntar por CUALQUIER usuaria.
create or replace function tiene_acceso_de(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.id = uid
      and (
        p.status in ('active', 'past_due')
        or (p.status = 'cancelled' and p.access_until is not null and p.access_until > now())
      )
  );
$$;

revoke all on function tiene_acceso_de(uuid) from public, anon, authenticated;
grant execute on function tiene_acceso_de(uuid) to service_role;

-- 2) Versión sin parámetro: solo responde sobre QUIEN LLAMA (usa auth.uid() internamente),
--    así que aunque la llame una alumna no puede espiar a otra.
create or replace function tiene_acceso()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select tiene_acceso_de((select auth.uid()));
$$;

revoke all on function tiene_acceso() from public, anon;
grant execute on function tiene_acceso() to authenticated, service_role;

-- 3) La política de módulos usa la versión segura.
drop policy if exists "catalogo: leer si tiene acceso" on modulos;
create policy "catalogo: leer si tiene acceso" on modulos
  for select using (tiene_acceso());

-- 4) Eliminar la versión filtrable.
drop function if exists tiene_acceso(uuid);
