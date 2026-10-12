import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { CountUp } from "@/components/app/CountUp";
import { Reveal } from "@/components/app/Reveal";
import { CIFRAS_HERO } from "@/lib/landing";
import { listarBolsos, ordenCatalogo } from "@/lib/bolsos";

/**
 * El héroe: dos columnas en escritorio, apiladas en móvil.
 *
 * El diseño pone el texto a la izquierda y una foto grande del bolso del mes a
 * la derecha, con una tarjeta flotante encima de la esquina inferior izquierda
 * de la foto.
 */
export async function Hero() {
  /*
   * El bolso del héroe sale del CATÁLOGO, no de una lista aparte. Se enseña el
   * gratis: es el único que quien llega puede abrir ahí mismo, así que la foto
   * grande de la portada debe ser la de lo que sí puede tejer hoy.
   */
  const bolsos = ordenCatalogo(await listarBolsos());
  const destacado = bolsos.find((b) => b.portadaUrl) ?? null;

  /*
   * `grain` es el dispositivo ownable de la marca y no se estaba aplicando en
   * ningún sitio. Va en el héroe —la primera pantalla— porque es donde el papel
   * tiene que notarse; regado por toda la página solo ensucia.
   */
  return (
    <section className="grain relative px-5 pt-10 pb-16 md:pt-16 md:pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ── Columna de texto ── */}
        <div>
          <Reveal>
            <p className="flex items-center gap-3">
              {/* La rayita dorada antes del eyebrow es un gesto del diseño: marca
                  el inicio de la página sin pesar como un título. */}
              <span aria-hidden="true" className="bg-gold h-px w-8" />
              <span className="eyebrow">Membresía · Edición 2026</span>
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="titulo-hero mt-5 text-balance">
              Cada mes, un bolso de <em className="clave">lujo</em> nuevo en tus manos.
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="text-ink-body mt-6 max-w-lg text-lg">
              Únete a la membresía y recibe cada mes un bolso nuevo: los videos paso a paso, la ficha
              de materiales y dónde comprarlos. Aprende desde casa y convierte cada colección en
              ingresos.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#planes"
                className="text-espresso flex h-14 items-center justify-center gap-2 rounded-full px-8 font-semibold transition-transform active:scale-[0.98]"
                style={{ backgroundImage: "var(--boton-dorado)" }}
              >
                Tomar el curso gratis
                <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a
                href="#como-funciona"
                className="border-line text-espresso flex h-14 items-center justify-center rounded-full border px-8 font-semibold transition-colors"
              >
                Cómo funciona
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="border-line mt-10 grid grid-cols-3 gap-4 border-t pt-6">
              {CIFRAS_HERO.map((c) => (
                <div key={c.pie}>
                  <dt className="sr-only">{c.pie}</dt>
                  <dd>
                    {/* `whitespace-nowrap` y un escalón menos en móvil: a 375px
                        las tres columnas miden ~105px y "US$ 9,74" se partía
                        justo por el espacio, dejando el precio en dos líneas. */}
                    <span
                      className="font-display text-espresso block text-xl whitespace-nowrap md:text-2xl"
                      style={{ fontWeight: 500 }}
                    >
                      {"animar" in c ? <CountUp to={c.animar} prefix={c.prefijo} agruparSiempre /> : c.valor}
                    </span>
                    <span className="text-ink-muted mt-0.5 block text-xs">{c.pie}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ── Columna de la foto ── */}
        <Reveal delay={0.1}>
          {/*
            `pb-16` deja sitio bajo la foto para que la tarjeta flotante pueda
            sobresalir sin que su sombra se corte ni empuje la sección siguiente.
          */}
          <div className="relative pb-16 lg:pb-20">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)]">
              <Image
                src={destacado?.portadaUrl ?? "/images/bag-champagne-facetado.webp"}
                alt={`${destacado?.nombre ?? "Bolso"}, en cuentas, del curso de este mes`}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>

            {/* La tarjeta flotante. En móvil se centra; en escritorio muerde la
                esquina inferior izquierda de la foto, como en el diseño. */}
            <div className="bg-ivory absolute bottom-0 left-1/2 flex w-[min(20rem,90%)] -translate-x-1/2 items-center gap-4 rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-lg)] lg:left-0 lg:translate-x-0">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[var(--radius-lg)]">
                <Image
                  src={destacado?.portadaUrl ?? "/images/bag-champagne-facetado.webp"}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">Curso de este mes</p>
                <p
                  className="font-display text-espresso mt-0.5 truncate text-lg"
                  style={{ fontWeight: 500 }}
                >
                  {destacado?.nombre ?? "Cristal Brillante"}
                </p>
                <p className="text-ink-muted text-xs">Video + patrón + materiales</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
