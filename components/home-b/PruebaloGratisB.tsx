import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EntradaB, PiezaB } from "@/components/home-b/EntradaB";

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
 * Los clics los recoge `boton_click` de `MedirHome`. Cada tarjeta lleva su
 * `data-cta` (`tarjeta_bolso_gratis`, `tarjeta_ojo_gratis`) para que en
 * Mixpanel salgan separadas del botón del héroe y del cierre, que llevan al
 * mismo sitio.
 *
 * v2 (2026-11-05): titular "Compruébalo antes de pagar." y tarjetas ELEVADAS
 * (marfil + sombra) en vez de con borde — es el nivel de lo que se toca.
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
      <EntradaB className="contenedor-b" escalonado={0.1}>
        {/* El eyebrow solo en el teléfono: en escritorio el titular comparte
            fila con la nota de la derecha y una línea más arriba sobra. */}
        <p className="eyebrow-b flex items-center gap-3 lg:hidden">Pruébalo gratis</p>
        <div className="lg:flex lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-6 lg:gap-y-2">
          <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-0">
            Compruébalo antes <em className="clave">de pagar.</em>
          </h2>
          <p className="text-ink-body mt-1.5 lg:mt-0 lg:text-base">Sin tarjeta y sin crear cuenta.</p>
        </div>

        <div className="mt-5 grid gap-2.5 lg:mt-7 lg:grid-cols-2 lg:gap-5">
          <PiezaB>
          <Tarjeta
            href={destinoBolso}
            cta="tarjeta_bolso_gratis"
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
                className="rounded-dentro-b h-26.5 w-22 shrink-0 object-cover lg:h-40 lg:w-33"
              />
            }
          />
          </PiezaB>

          <PiezaB>
          <Tarjeta
            href="/app/ojo"
            cta="tarjeta_ojo_gratis"
            eyebrow="Ojo Experto"
            titulo="¿Te atascaste? Pregúntale"
            pie="2 preguntas gratis, sin crear cuenta"
            accion="Hacer una pregunta →"
            medio={
              /* El Ojo no tiene foto que enseñar: su "producto" es la
                 respuesta. Un bloque oscuro con el símbolo pesa lo mismo en la
                 composición que la foto de al lado y no finge ser una captura
                 de algo que no existe. */
              <span className="bg-espresso-2 text-gold-light rounded-dentro-b flex h-26.5 w-22 shrink-0 items-center justify-center lg:h-40 lg:w-33">
                <Eye size={32} strokeWidth={1.4} aria-hidden="true" className="lg:size-10.5" />
              </span>
            }
          />
          </PiezaB>
        </div>
      </EntradaB>
    </section>
  );
}

function Tarjeta({
  href,
  cta,
  eyebrow,
  titulo,
  pie,
  accion,
  medio,
}: {
  href: string;
  /** Nombre del clic en Mixpanel (`boton_click.cta`). */
  cta: string;
  eyebrow: string;
  titulo: string;
  pie: string;
  accion: string;
  medio: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      data-cta={cta}
      className="elevado-b rounded-tarjeta-b flex items-center gap-3.5 p-2.5 pr-3.5 transition-transform active:scale-[0.99] lg:gap-5.5 lg:p-3.5 lg:pr-6"
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
