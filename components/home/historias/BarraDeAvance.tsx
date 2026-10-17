"use client";

/**
 * Las rayitas de arriba, como en Instagram.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ LA RAYA SE RELLENA CON CSS, NO REPINTANDO EN REACT
 * ════════════════════════════════════════════════════════════════════════════
 * La tentación es guardar el progreso en estado y actualizarlo muchas veces por
 * segundo. Eso vuelve a montar el componente —y con él el iframe del video—
 * decenas de veces por minuto, y en un móvil de gama media se nota: la barra se
 * mueve a tirones justo mientras el video intenta arrancar.
 *
 * Aquí la raya es un `transform: scaleX()` con una transición lineal de la
 * duración que queda. El navegador la anima en el hilo del compositor, sin
 * pasar por React ni una sola vez.
 *
 * `transform-origin: left` para que crezca desde la izquierda; con el origen
 * por defecto se abriría desde el centro hacia los dos lados.
 * ════════════════════════════════════════════════════════════════════════════
 */
export function BarraDeAvance({
  total,
  indice,
  /** Lo que dura esta cápsula, en ms. La raya tarda eso en llenarse. */
  duracionMs,
  /** En pausa la raya se congela donde esté. */
  enPausa,
}: {
  total: number;
  indice: number;
  duracionMs: number;
  enPausa: boolean;
}) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }, (_, n) => (
        <span key={n} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
          {/*
            Las YA VISTAS se pintan llenas sin animar, y las que faltan vacías.
            Solo la actual lleva animación: así, al volver atrás, las anteriores
            aparecen completas de golpe, que es lo que hace Instagram.
          */}
          {n < indice && <span className="absolute inset-0 bg-white" />}
          {n === indice && (
            <span
              /* ⚠️ `key` CON LA DURACIÓN, no solo con el índice: cuando Bunny
                 dice cuánto dura de verdad el video, la raya tiene que empezar
                 de cero con el tiempo nuevo. Sin esto seguiría corriendo con
                 los 15s de por defecto y acabaría antes o después que el video. */
              key={`${indice}-${duracionMs}`}
              className="absolute inset-0 origin-left bg-white"
              style={{
                animation: `avanceHistoria ${duracionMs}ms linear forwards`,
                animationPlayState: enPausa ? "paused" : "running",
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
