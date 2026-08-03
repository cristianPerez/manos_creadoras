-- Datos REALES tomados del área de miembros de Hotmart (capturas del 2026-08-03).
-- Las secciones están completas; las lecciones solo las que se alcanzaban a ver.
-- El resto se completa cuando la dueña pase el listado (o al conectar la API de Hotmart).
-- Aplicada en la base el 2026-08-03 (version 20260803143545).

insert into secciones (id, numero, titulo, titulo_en, orden) values
  ('s1', 1, 'La estructura del bolso',   'The Bag Structure',     1),
  ('s2', 2, 'Bolsos en cuentas',         'Beaded bag',            2),
  ('s3', 3, 'Accesorios en cuentas',     'Beaded accessories',    3),
  ('s4', 4, 'Bolsos en malla plástica',  'Plastic canvas bags',   4);

-- Sección 1 — 4 ítems, ninguno es tutorial: son bienvenida y recursos.
insert into lecciones (id, seccion_id, numero, titulo, titulo_en, tipo, duracion_seg, orden) values
  ('s1-l01','s1',1,'Empieza aquí','Start here','texto',null,1),
  ('s1-l02','s1',2,'Únete a nuestra comunidad','Join our community','enlace',null,2),
  ('s1-l03','s1',3,'Aviso importante','Important Notice','texto',null,3),
  ('s1-l04','s1',4,'Patrones de los bolsos en cuentas','The beaded bag patterns','pdf',null,4);

-- Sección 2 — 19 tutoriales. Los 5 primeros con su duración real vista en pantalla.
insert into lecciones (id, seccion_id, numero, titulo, tipo, duracion_seg, orden) values
  ('s2-l01','s2',1,'Tutorial 1 (malla plástica y cuentas)','video', 562,1),  -- 09:22
  ('s2-l02','s2',2,'Tutorial 2','video',1750,2),                             -- 29:10
  ('s2-l03','s2',3,'Tutorial 3','video',2554,3),                             -- 42:34
  ('s2-l04','s2',4,'Tutorial 4','video',1946,4),                             -- 32:26
  ('s2-l05','s2',5,'Tutorial 5','video',2291,5);                             -- 38:11
