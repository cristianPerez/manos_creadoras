-- El soporte de Hotmart confirmó (2026-08-03) que su reproductor SOLO funciona dentro
-- de Hotmart Club: no existe código de inserción para sitios externos. Toda la columna
-- `hotmart_id` era una vía muerta (y estaba 100% vacía, 0 de 9 filas con valor).
--
-- El video pasa a ser independiente del proveedor: guardamos QUIÉN lo aloja y su ID,
-- para poder cambiar de servicio sin volver a tocar el esquema.

alter table lecciones drop column hotmart_id;

alter table lecciones
  add column video_proveedor text check (video_proveedor in ('bunny', 'vimeo', 'youtube')),
  add column video_id       text,
  -- Las lecciones de tipo `pdf` y `enlace` (patrones, comunidad) tampoco tenían dónde
  -- guardar su destino: sin esto nunca podrían funcionar.
  add column recurso_url    text;

-- Una lección de video no sirve a medias: o tiene proveedor e ID, o no tiene ninguno.
alter table lecciones
  add constraint lecciones_video_completo
    check ((video_proveedor is null) = (video_id is null));
