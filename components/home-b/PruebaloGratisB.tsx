import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Entrada } from "@/components/home/Entrada";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * "PRUÉBALO GRATIS" — dos puertas a la plataforma
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ⚠️ ESTA SECCIÓN REEMPLAZA A `CursoGratis` Y A `OjoDemo`, QUE SALEN DEL HOME.
 * No desaparecen: siguen vivos dentro de la app, que es donde se usan de
 * verdad. Lo que cambia es la apuesta, y conviene que quede escrita porque es
 * lo más discutible de la rama B:
 *
 *   · El home de hoy mete el reproductor del bolso gratis Y un chat con la IA
 *     dentro de la página de ventas. Eso son dos piezas pesadas, con estado,
 *     que empujan el precio muy abajo y que entretienen en vez de vender.
 *   · La B dice en una línea qué hay gratis y manda a la plataforma. Quien
 *     entra ve de una el catálogo entero —veintipico proyectos— que es el
 *     argumento que ninguna sección del home puede dar.
 *
 * El riesgo también está dicho: se pierde el "valor en 30 segundos sin salir
 * de la página". Es justo lo que el experimento tiene que medir.
 *
 * Los clics los recoge `boton_click` de `MedirHome` (texto + sección), así que
 * no hace falta instrumentar nada a mano: en el panel se verán como "Empezar
 * el bolso →" y "Hacer una pregunta →" dentro de la sección `gratis`.
 */
export function PruebaloGratisB({
  slugGratis,
  nombreGratis,
  pasos,
}: {
  slugGratis: string | null;
  nombreGratis: string | null;
  /** Cuántos pasos tiene el bolso gratis, sin contar los materiales. */
  pasos: number;
}) {
  const destinoBolso = slugGratis ? `/app/bolsos/${slugGratis}` : "/app";

  return (
    <section id="gratis" data-seccion="gratis" className="py-12 lg:py-20">
      <Entrada className="contenedor-b">
        <p className="eyebrow-b flex items-center gap-3">Pruébalo gratis</p>
        <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-3">
          Empieza sin pagar, <em className="clave">en la plataforma.</em>
        </h2>
        <p className="text-ink-body mt-2 lg:hidden">Sin tarjeta y sin crear cuenta.</p>

        <div className="mt-5.5 grid gap-2.5 lg:mt-8 lg:grid-cols-2 lg:gap-5">
          <Tarjeta
            href={destinoBolso}
            eyebrow="Curso gratuito"
            titulo="Tu primer bolso, gratis"
            pie={
              nombreGratis
                ? `${nombreGratis} · materiales + ${pasos} paso${pasos === 1 ? "" : "s"}`
                : "Materiales y pasos en video"
            }
            accion="Empezar el bolso →"
            medio={
              <Image
                src="/images/bolso-nacar-sonado.webp"
                alt=""
                width={264}
                height={320}
                loading="lazy"
                sizes="(min-width: 1024px) 132px, 92px"
                className="rounded-dentro-b h-28 w-23 shrink-0 object-cover lg:h-40 lg:w-33"
              />
            }
          />

          <Tarjeta
            href="/app/ojo"
            eyebrow="Ojo Experto"
            titulo="¿Te atascaste? Pregúntale"
            pie="2 preguntas gratis, sin crear cuenta"
            accion="Hacer una pregunta →"
            medio={
              /* El Ojo no tiene foto que enseñar: su "producto" es la
                 respuesta. Un bloque oscuro con el símbolo pesa lo mismo en la
                 composición que la foto de al lado y no finge ser una captura
                 de algo que no existe. */
              <span className="bg-espresso-2 text-gold-light rounded-dentro-b flex h-28 w-23 shrink-0 items-center justify-center lg:h-40 lg:w-33">
                <Sparkles size={34} strokeWidth={1.4} aria-hidden="true" className="lg:size-10.5" />
              </span>
            }
          />
        </div>
      </Entrada>
    </section>
  );
}

function Tarjeta({
  href,
  eyebrow,
  titulo,
  pie,
  accion,
  medio,
}: {
  href: string;
  eyebrow: string;
  titulo: string;
  pie: string;
  accion: string;
  medio: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="bg-ivory border-line rounded-tarjeta-b flex items-center gap-3.5 border p-2.5 pr-3.5 transition-colors hover:border-line-strong lg:gap-5.5 lg:p-3.5 lg:pr-6"
    >
      {medio}
      <span className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-1.5">
        <span className="text-ink-body text-micro font-bold tracking-[0.16em] uppercase">
          {eyebrow}
        </span>
        <span
          className="font-display text-espresso block leading-tight text-balance"
          style={{ fontWeight: 600, fontSize: "clamp(23px, 2vw, 28px)" }}
        >
          {titulo}
        </span>
        <span className="text-ink-body text-nota leading-snug lg:text-sm">{pie}</span>
        <span className="text-apoyo mt-1 text-sm font-bold lg:mt-1.5 lg:text-base">{accion}</span>
      </span>
    </Link>
  );
}
