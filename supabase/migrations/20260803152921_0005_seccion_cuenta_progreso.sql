-- La sección 1 es bienvenida + recursos (avisos, comunidad, PDF de patrones): no enseña
-- a tejer. Si contara como avance, una alumna vería "4 de 58" sin haber tejido nada.
-- Se marca por DATO (no hardcodeado en el código) para que la dueña pueda cambiarlo.
alter table secciones
  add column cuenta_progreso boolean not null default true;

update secciones set cuenta_progreso = false where id = 's1';
