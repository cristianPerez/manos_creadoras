"use client";

import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { NumeroQueCuenta } from "@/components/home/NumeroQueCuenta";
import { FRECUENCIA_POR_DEFECTO, GARANTIA, precioDesde } from "@/lib/planes";

export type FotoHero = { slug: string; nombre: string; subtitulo: string; url: string };

/**
 * El banner del home, con el carrusel de bolsos.
 *
 * ⚠️ SIN AUTOPLAY, Y ES DELIBERADO. Una foto que se mueve sola mientras alguien
 * lee el titular le roba el ojo justo en la frase que tiene que convencerle. Se
 * mueve cuando ella quiere: flecha, puntito, dedo o teclado.
 */
/** El párrafo del banner. Uno solo para los dos anchos, que solo cambian de sitio. */
const PARRAFO =
  "Aprende desde cero con Elizabeth Valencia: mira las cápsulas, teje tu primer bolso gratis y pregúntale al Ojo Experto cuando algo no te salga.";

export function HeroSlider({ fotos, totalBolsos }: { fotos: FotoHero[]; totalBolsos: number }) {
  const [i, setI] = useState(0);
  const tocado = useRef<number | null>(null);

  if (fotos.length === 0) return null;

  /* Circular: después de la última vuelve a la primera. Llegar al final y que
     la flecha deje de responder se siente como si algo se hubiera roto. */
  const ir = (n: number) => setI((n + fotos.length) % fotos.length);
  const actual = fotos[i];

  return (
    /*
      ⚠️ `px-3` EN MÓVIL Y NO `px-5` (pedido de Cristian, 2026-10-19). Con 20px
      a cada lado la foto se quedaba en 335px de ancho en un teléfono de 375, y
      el bolso —que es lo único que para el scroll— salía pequeño. Bajando a
      12px gana 16px de ancho útil sin pegarse al borde.

      El resto de la página mantiene sus 20px: esto es SOLO el banner, donde la
      foto manda. Si algún día se unifica, se unifica a propósito y en todas.
    */
    <section className="px-3 pt-2 pb-8 md:px-5 md:pt-6 md:pb-10">
      <div className="mx-auto grid max-w-6xl items-center gap-2 md:grid-cols-2 md:gap-14">
        {/* ⚠️ En móvil la FOTO va primero (order-1) y el texto debajo: lo que
            para y convence en un teléfono es la imagen del bolso, no el titular. */}
        <div className="order-1 md:order-2">
          <div
            className="relative"
            tabIndex={0}
            role="group"
            aria-roledescription="carrusel"
            aria-label="Bolsos del programa"
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") ir(i - 1);
              if (e.key === "ArrowRight") ir(i + 1);
            }}
            onTouchStart={(e) => (tocado.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (tocado.current === null) return;
              const d = e.changedTouches[0].clientX - tocado.current;
              // 50px de umbral: por debajo suele ser un scroll vertical torcido,
              // no un gesto de pasar foto.
              if (Math.abs(d) > 50) ir(d < 0 ? i + 1 : i - 1);
              tocado.current = null;
            }}
          >
            {/*
              ⚠️ EN MÓVIL LA FOTO ERA UNA FRANJA (4/2.75 ≈ 1,45:1) Y SE VEÍA
              DIMINUTA. Pedido de Cristian el 2026-10-19: más alta, menos
              redondeada y con menos margen.

              Pasa a 1/1,05 —casi cuadrada, ligeramente vertical— porque es la
              proporción en la que un bolso se reconoce: con la franja se veía
              un recorte del centro y se perdían el asa y la base.

              ⚠️ EL COSTE, DICHO: esto empuja el botón dorado más abajo, y el
              comentario de la columna de texto ya avisaba de que no cabía todo
              sobre la línea de flotación ni con la franja. Sigue sin caber, y
              sigue valiendo lo mismo: la barra fija lleva "Bolso gratis" al
              mismo destino y está visible SIEMPRE.

              El radio baja de 28px (`--radius-foto`) a 20px (`--radius-lg`) en
              móvil: a este tamaño, 28px se comían visiblemente las esquinas
              del bolso.

              ⚠️ NO USAR `rounded-2xl` AQUÍ. Parece lo obvio y hace lo
              contrario: este proyecto remapea `--radius-2xl` a
              `--radius-device` (32px, el marco de teléfono), así que la foto
              salía MÁS redondeada que antes. Los radios se piden siempre con
              los tokens del sistema, no con los nombres de Tailwind.
            */}
            {/*
              ⚠️ HOME V3 (2026-10-20): EN MÓVIL LA FOTO PASA A 4:3, radio 16.
              El criterio de la v3 es medible —a 390×844 tienen que verse el
              titular, el botón dorado y la línea de precio sin bajar— y con la
              foto casi cuadrada de antes no cabían. 4:3 sigue enseñando el
              bolso entero (asa incluida) y libera ~90px.
            */}
            <div className="bg-espresso relative aspect-square overflow-hidden rounded-(--radius-foto) shadow-[0_24px_60px_-24px_rgba(42,31,25,0.45)] max-md:aspect-[4/3] max-md:rounded-bloque">
              {/* `key` por slug: al cambiar de bolso React monta una imagen
                  nueva, y con `animate-[aparecer]` el cambio se funde en vez de
                  saltar. */}
              <Image
                key={actual.slug}
                src={actual.url}
                alt={`Bolso ${actual.nombre}, tejido en cuentas`}
                fill
                priority={i === 0}
                sizes="(min-width: 768px) 560px, 100vw"
                className="animate-[aparecer_.45s_var(--ease-out)] object-cover"
              />

              {/*
                ⚠️ EL CHIP ERA MÁS REDONDO QUE LA FOTO QUE LO CONTIENE, y por
                eso se veía descolgado: `rounded-xl` son 30px en este proyecto
                y la foto tiene 20px en móvil. Un elemento metido dentro de
                otro nunca puede tener MÁS radio que su contenedor: la curva
                del hijo pelea con la del padre en vez de acompañarla.

                12px (`--radius-md`) es claramente menor que los 20 de la foto
                y sigue leyéndose redondeado. Lo pidió Cristian el 2026-10-20.
              */}
              <span className="bg-cream/92 absolute top-4 left-4 rounded-(--radius-md) px-4 py-2.5 backdrop-blur-sm">
                {/*
                  ⚠️ LA JERARQUÍA SE ARREGLA SUBIENDO EL TÍTULO, NO HUNDIENDO
                  EL SUBTÍTULO. Cristian pidió el 2026-10-20 que el subtítulo
                  pesara menos: a 12px con 0.14em de tracking ocupaba casi
                  tanto ancho como el nombre del bolso y los dos competían.

                  El primer intento fue bajarlo a 10-11px y el linter de
                  diseño lo rechazó con razón: la guía fija las etiquetas en
                  12-13px y por debajo dejan de leerse en un teléfono. Así que
                  el salto se abre por arriba (18 → 20px) y al subtítulo se le
                  quita el tracking ancho, que era lo que de verdad lo hacía
                  ocupar toda la línea.
                */}
                <span
                  className="font-display text-espresso block text-xl leading-tight"
                  style={{ fontWeight: 500 }}
                >
                  {actual.nombre}
                </span>
                <span className="text-gold mt-1 block text-xs font-bold tracking-[0.08em] uppercase">
                  {actual.subtitulo}
                </span>
              </span>
            </div>

            <Flecha lado="izquierda" onClick={() => ir(i - 1)} />
            <Flecha lado="derecha" onClick={() => ir(i + 1)} />
          </div>

          {/*
            Puntitos, sin miniaturas. Nueve miniaturas compiten con la foto
            grande y convierten el banner en una parrilla; los puntitos solo
            dicen "hay más" y dónde estás.
          */}
          <div className="flex items-center justify-center gap-1 md:mt-5">
            {fotos.map((f, n) => (
              <button
                key={f.slug}
                type="button"
                onClick={() => ir(n)}
                aria-label={`Ver ${f.nombre}`}
                aria-current={n === i ? "true" : undefined}
                /*
                  ⚠️ EL PROMPT DEL DISEÑO SE CONTRADECÍA AQUÍ: pedía puntitos de
                  24×28 y, tres líneas después, que ningún objetivo táctil
                  bajara de 44. Se cumplen los dos: el PUNTO se ve de 8px como
                  pide el diseño, y el BOTÓN que lo envuelve mide 44 de alto.
                  Lo que se toca no tiene por qué medir lo que se ve.

                  El ancho se queda en 24: nueve puntos a 44 serían 396px y no
                  caben en una pantalla de 390.
                */
                className="flex h-11 w-6 items-center justify-center [touch-action:manipulation]"
              >
                <span
                  className={`block h-2 rounded-full transition-[width,background-color] duration-200 ${
                    n === i ? "bg-gold w-6" : "bg-punto-inactivo w-2"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="order-2 md:order-1">
          {/*
            ⚠️ EN MÓVIL TODO VA APRETADO, y el listón es medible (home v3): a
            390×844 tienen que verse el titular, el botón dorado y la línea de
            precio sin bajar, y por encima de la barra fija de compra. Por eso
            en móvil no van la etiqueta de arriba ni el segundo botón, y el
            párrafo baja debajo del precio.
          */}
          {/* En móvil no va: la v3 pone el titular justo bajo los puntos, y
              las historias de arriba ya dicen "cápsulas gratis" con imágenes. */}
          <span className="bg-sand text-ink-body hidden rounded-full px-4 py-2 text-xs font-semibold md:inline-block">
            5 cápsulas + 1 bolso completo gratis
          </span>

          <h1
            className="font-display text-espresso text-balance md:mt-5"
            style={{ fontWeight: 500, fontSize: "clamp(36px, 5vw, 62px)", lineHeight: 1.04, letterSpacing: "-0.015em" }}
          >
            Crea bolsos de <em className="text-gold italic" style={{ fontWeight: 400 }}>perlas</em> de lujo y
            conviértelos en tu negocio.
          </h1>


          {/* En escritorio el párrafo va ANTES de los botones, como siempre; en
              móvil va después de la línea de precio (ver abajo). */}
          <p className="text-ink-body mt-5 hidden max-w-lg md:block">{PARRAFO}</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-7">
            <a
              href="#gratis"
              className="text-cream flex h-14 items-center justify-center gap-2 rounded-full px-8 font-semibold transition-transform active:scale-[0.98] max-md:rounded-md"
              style={{ backgroundImage: "var(--boton-bronce)" }}
            >
              <Play size={16} fill="currentColor" aria-hidden="true" />
              Empezar mi bolso gratis
            </a>
            {/* ⚠️ EL NÚMERO SE CALCULA. Estaba escrito a mano ("los 14 bolsos")
                y al entrar Zafiro Perlado y Nácar Soñado el botón siguió
                diciendo 14 mientras el cierre de la página ya decía 16. Dos
                cifras distintas en la misma pantalla para lo mismo. */}
            {/* En móvil no va (v3): ahí el segundo paso es la línea de precio,
                y dos botones grandes seguidos empujaban el precio fuera. */}
            <Link
              href="/app"
              className="border-line text-espresso hidden h-14 items-center justify-center rounded-full border px-8 font-semibold sm:flex"
            >
              Ver los {totalBolsos} bolsos
            </Link>
          </div>

          {/*
            ⚠️ LA LÍNEA DE PRECIO (home v3, 2026-10-20). Hasta la v2 el banner no
            decía cuánto cuesta el curso, y quien ya venía decidida tenía que
            bajar media página para saberlo. No compite con el botón dorado: es
            texto, no botón, y el gratis sigue siendo lo primero.
          */}
          <p className="text-center md:mt-4 md:text-left">
            <EnlaceCompra
              href="#precio"
              origen="banner_precio"
              plan={FRECUENCIA_POR_DEFECTO}
              className="text-ink-body hover:text-espresso border-line-strong inline-flex min-h-11 items-center border-b text-base transition-colors"
            >
              <span>
                o el curso completo desde{" "}
                <strong className="text-espresso font-bold">{precioDesde()}/mes</strong>
                <span className="max-md:hidden"> · {GARANTIA.titulo.toLowerCase()}</span> →
              </span>
            </EnlaceCompra>
          </p>

          <p className="text-ink-body mt-4 md:hidden">{PARRAFO}</p>

          <p className="text-ink-muted mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm md:mt-6">
            {/*
              ⚠️ LA VALORACIÓN "4,9/5" SE QUITÓ EL 2026-10-17 POR DECISIÓN DE
              CRISTIAN: no hay un sistema de reseñas detrás que la sostenga, así
              que era una cifra sin respaldo. Las +1.200 alumnas SÍ son reales y
              se quedan.

              Una prueba social que no se puede demostrar es peor que ninguna:
              basta que alguien pregunte "¿dónde están esas reseñas?" para
              perder la confianza en todo lo demás de la página.
            */}
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-gold" fill="currentColor" aria-hidden="true" />
              <strong className="text-espresso font-semibold">
                +
                <NumeroQueCuenta
                  hasta={1200}
                  formato={(n) => Math.round(n).toLocaleString("es-CO")}
                  duracion={1.3}
                />
              </strong>
              <span>alumnas en Latinoamérica</span>
            </span>
            {/* ⚠️ VUELVE EN LA V3 (2026-10-20): el diseño nuevo de Cristian lo
                repone. Sigue siendo cierto —el bolso gratis no pide tarjeta—. */}
            <span>Sin tarjeta para empezar</span>
            {/*
              ⚠️ "SIN TARJETA PARA EMPEZAR" SE QUITÓ EL 2026-10-19 (decisión de
              Cristian). Queda anotado para que nadie lo reponga creyendo que
              se perdió: es el segundo recorte de esta línea, después del
              "4,9/5" del 17-oct, y la línea se queda SOLO con las +1.200
              alumnas.

              El dato sigue siendo cierto y se sigue diciendo donde toca —el
              botón promete el bolso gratis y el paywall no aparece hasta
              intentar más—, así que no se pierde la promesa: se deja de
              repetir en el héroe.
            */}
          </p>
        </div>
      </div>
    </section>
  );
}

function Flecha({ lado, onClick }: { lado: "izquierda" | "derecha"; onClick: () => void }) {
  const Icono = lado === "izquierda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lado === "izquierda" ? "Bolso anterior" : "Bolso siguiente"}
      className={`bg-cream/90 text-espresso absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-transform active:scale-95 [touch-action:manipulation] ${
        lado === "izquierda" ? "left-3" : "right-3"
      }`}
    >
      <Icono size={20} />
    </button>
  );
}
