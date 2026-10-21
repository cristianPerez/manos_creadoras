-- ============================================================================
-- 0029 · UN VIDEO PROVISIONAL PARA LAS CINCO CÁPSULAS
--
-- ⚠️ LAS CINCO APUNTAN AL MISMO VIDEO Y ESO ES TEMPORAL. Los videos definitivos
-- están por llegar; mientras tanto Cristian pidió usar este en las cinco para
-- poder trabajar el visor con contenido real en vez de con un hueco.
--
-- Se deja escrito aquí porque desde fuera no se nota: cinco cápsulas con cinco
-- títulos distintos que reproducen lo mismo parece un error de datos, no una
-- decisión. Cuando lleguen los definitivos, cada `video_id` se cambia por el
-- suyo y los subtítulos vuelven a describir su propia técnica.
--
-- El subtítulo pasa a "Tipo de hilo" en las cinco por el mismo motivo: que lo
-- que se lee coincida con lo que se ve. Un subtítulo que promete "el nudo que
-- no se suelta" sobre un video de hilos es peor que uno genérico.
--
-- ⚠️ LOS TÍTULOS NO SE TOCAN: son los de la sección del home ("Cuentas", "El
-- hilo"…) y cambiarlos obligaría a rehacer esa fila de círculos. Lo provisional
-- debe poder deshacerse con un UPDATE, no con un rediseño.
-- ============================================================================

update capsulas
   set video_id  = 'cecd18a8-15a0-4a60-aa88-2162b543050d',
       subtitulo = 'Tipo de hilo';
