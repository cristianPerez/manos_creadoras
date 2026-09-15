-- Dónde vive cada permiso de notificación que da una alumna.
-- Una misma alumna puede tener varios dispositivos (celular + tablet), por eso la
-- llave es el endpoint que devuelve el navegador, no el usuario.

create table push_subscriptions (
  endpoint   text primary key,
  user_id    uuid not null references profiles(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  -- Para saber desde dónde se suscribió si hay que depurar.
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- La alumna solo ve y borra lo suyo. El envío lo hace el servidor con la clave
-- secreta (salta RLS), igual que el resto de tareas de servidor.
create policy "avisos propios: leer" on push_subscriptions
  for select using ((select auth.uid()) = user_id);
create policy "avisos propios: insertar" on push_subscriptions
  for insert with check ((select auth.uid()) = user_id);
create policy "avisos propios: borrar" on push_subscriptions
  for delete using ((select auth.uid()) = user_id);
