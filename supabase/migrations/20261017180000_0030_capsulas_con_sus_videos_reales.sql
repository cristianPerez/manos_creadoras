-- ============================================================================
-- 0030 · LAS CÁPSULAS, CON SUS VIDEOS REALES
--
-- Sustituye al provisional de la 0029, donde las cinco apuntaban al mismo video
-- y todas decían "Tipo de hilo". Ahora cada una tiene su técnica y su título.
--
-- ⚠️ SOLO HAY CUATRO VIDEOS Y LAS CÁPSULAS SON CINCO. Cristian pidió repetir
-- uno para completar, así que la quinta vuelve a ser "Tipo de grosor". Se deja
-- escrito porque desde fuera parece un error de datos —dos círculos iguales al
-- principio y al final— y no lo es: es un hueco esperando su video.
-- Cuando llegue el quinto: un UPDATE a la fila de `orden = 5` y ya.
--
-- ⚠️ DICE "GROSOR" Y NO "GRUESOR". El título llegó como "Tipo de gruesor", que
-- no es palabra del español —la correcta es grosor—. Se corrige porque esto lo
-- lee una clienta antes de pagar, y una falta en el primer texto que ve resta
-- más de lo que parece. Si Cristian prefiere su versión, es un UPDATE.
--
-- Los TÍTULOS son los que mandó, tal cual. Las ETIQUETAS CORTAS se derivan de
-- ellos: van bajo los círculos del home, donde no caben más de una o dos
-- palabras sin partirse a 375px.
-- ============================================================================

update capsulas set
  titulo         = 'Tipo de grosor',
  etiqueta_corta = 'Grosor',
  subtitulo      = 'Qué hilo usar y por qué',
  video_id       = 'cecd18a8-15a0-4a60-aa88-2162b543050d'
where orden = 1;

update capsulas set
  titulo         = 'Cómo iniciar una nueva columna',
  etiqueta_corta = 'Columna',
  subtitulo      = 'El arranque, paso a paso',
  video_id       = '6ec5a172-41f2-4351-9fce-7b077a490f5b'
where orden = 2;

update capsulas set
  titulo         = 'Cómo unir un hilo nuevo cuando se acaba',
  etiqueta_corta = 'Unir hilo',
  subtitulo      = 'Sin que se note el empate',
  video_id       = 'd9a5da50-0e4f-4d0c-8355-035af724f28b'
where orden = 3;

update capsulas set
  titulo         = 'Técnica para tener firmeza en los bolsos',
  etiqueta_corta = 'Firmeza',
  subtitulo      = 'Para que el bolso guarde su forma',
  video_id       = '63ee786b-0707-4b73-9baa-23491ceb0fa4'
where orden = 4;

-- ⚠️ REPETIDA A PROPÓSITO (ver cabecera). Es la quinta que falta por grabar.
update capsulas set
  titulo         = 'Tipo de grosor',
  etiqueta_corta = 'Grosor',
  subtitulo      = 'Qué hilo usar y por qué',
  video_id       = 'cecd18a8-15a0-4a60-aa88-2162b543050d'
where orden = 5;
