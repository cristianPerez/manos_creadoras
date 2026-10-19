"use client";

import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { NumeroQueCuenta } from "@/components/home/NumeroQueCuenta";

export type FotoHero = { slug: string; nombre: string; subtitulo: string; url: string };

/**
 * El banner del home, con el carrusel de bolsos.
 *
 * ⚠️ SIN AUTOPLAY, Y ES DELIBERADO. Una foto que se mueve sola mientras alguien
 * lee el titular le roba el ojo justo en la frase que tiene que convencerle. Se
 * mueve cuando ella quiere: flecha, puntito, dedo o teclado.
 */
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
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
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
            <div className="bg-espresso relative aspect-square overflow-hidden rounded-(--radius-foto) shadow-[0_24px_60px_-24px_rgba(42,31,25,0.45)] max-md:aspect-[1/1.05] max-md:rounded-(--radius-lg)">
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

              <span className="bg-cream/92 absolute top-4 left-4 rounded-xl px-4 py-3 backdrop-blur-sm">
                <span className="font-display text-espresso block text-lg" style={{ fontWeight: 500 }}>
                  {actual.nombre}
                </span>
                <span className="text-gold block text-xs font-bold tracking-[0.14em] uppercase">
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
          <div className="mt-2 flex items-center justify-center gap-1 md:mt-5">
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
            ⚠️ EN MÓVIL TODO VA MÁS APRETADO, y por una razón medida: con los
            márgenes de escritorio el botón dorado caía en y=781 de una pantalla
            de 844 — exactamente bajo la barra fija, que se quedaba con el toque.
            Comprobado con `elementFromPoint`: quien recibía el clic era "Ojo
            Experto", no el botón.

            Aun así NO CABE TODO sobre la línea de flotación, y no es un fallo
            de ajuste: header (76) + cápsulas (136) + foto + titular + botón no
            entran en 844px, y menos en los 667 de un teléfono pequeño. El
            diseño de referencia tampoco lo resuelve.

            La salida no es seguir recortando la foto hasta dejar el bolso
            irreconocible: es que la BARRA FIJA lleva "Bolso gratis" y apunta al
            mismo sitio. En móvil, el botón siempre visible es ese — y lo está
            en todo momento, que es más de lo que consigue un héroe apretado.
          */}
          <span className="bg-sand text-ink-body inline-block rounded-full px-4 py-2 text-xs font-semibold">
            5 cápsulas + 1 bolso completo gratis
          </span>

          <h1
            className="font-display text-espresso mt-4 text-balance md:mt-5"
            style={{ fontWeight: 500, fontSize: "clamp(33px, 5vw, 62px)", lineHeight: 1.04, letterSpacing: "-0.015em" }}
          >
            Crea bolsos de <em className="text-gold italic" style={{ fontWeight: 400 }}>perlas</em> de lujo y
            conviértelos en tu negocio.
          </h1>

          {/*
            ⚠️ EL PÁRRAFO NO SE ENSEÑA EN MÓVIL. La referencia móvil tampoco lo
            trae, y hay un motivo práctico: sus cuatro líneas empujaban el botón
            dorado fuera de la pantalla. En un teléfono, lo que convence es la
            foto y el titular; el párrafo explica algo que ya se entendió.
          */}
          <p className="text-ink-body mt-5 hidden max-w-lg md:block">
            Aprende desde cero con Elizabeth Valencia. Mira las cápsulas, teje tu primer bolso gratis
            y pregúntale al Ojo Experto cuando algo no te salga.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-7">
            <a
              href="#gratis"
              className="text-espresso flex h-14 items-center justify-center gap-2 rounded-full px-8 font-semibold transition-transform active:scale-[0.98]"
              style={{ backgroundImage: "var(--boton-dorado)" }}
            >
              <Play size={16} fill="currentColor" aria-hidden="true" />
              Empezar mi bolso gratis
            </a>
            {/* ⚠️ EL NÚMERO SE CALCULA. Estaba escrito a mano ("los 14 bolsos")
                y al entrar Zafiro Perlado y Nácar Soñado el botón siguió
                diciendo 14 mientras el cierre de la página ya decía 16. Dos
                cifras distintas en la misma pantalla para lo mismo. */}
            <Link
              href="/app"
              className="border-line text-espresso flex h-14 items-center justify-center rounded-full border px-8 font-semibold"
            >
              Ver los {totalBolsos} bolsos
            </Link>
          </div>

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
            <span>Sin tarjeta para empezar</span>
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
