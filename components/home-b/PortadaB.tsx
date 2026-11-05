"use client";

import { usePrecios } from "@/components/app/Precios";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { NumeroQueCuenta } from "@/components/home/NumeroQueCuenta";
import type { FotoHero } from "@/components/home/HeroSlider";
import { TextoQueRota } from "@/components/home-b/TextoQueRota";
import { fotoTopo } from "@/lib/fotos-topo";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * La portada del home B.
 *
 * ⚠️ SIN AUTOPLAY, igual que el banner de siempre y por el mismo motivo: una
 * foto que se mueve sola mientras alguien lee el titular le roba el ojo justo
 * en la frase que tiene que convencerle. Se mueve con la flecha, con el dedo,
 * con el teclado o tocando un segmento de la barra.
 *
 * ⚠️ LA ÚNICA COSA QUE SE MUEVE SOLA ES LA PALABRA DEL TITULAR, y está medida:
 * es una palabra de seis letras dentro de una caja de ancho fijo. No reacomoda
 * la página ni compite con la foto — cuenta en tres segundos que la membresía
 * no son solo bolsos, que es exactamente la objeción de quien llega pensando
 * "ya sé hacer bolsos".
 *
 * En móvil la foto va A SANGRE (375×440, sin márgenes) y el texto debajo: lo
 * que para el scroll en un teléfono es la imagen del bolso, no el titular. En
 * escritorio, dos columnas con el texto a la izquierda.
 */

/** Las cuatro palabras que rotan. El orden es el de la referencia. */
const PALABRAS = ["bolsos", "accesorios", "adornos", "velas"];

/**
 * ⚠️ EL VERBO SE CONJUGA CON LA PALABRA. "Crea velas … y conviértelos" está
 * mal escrito, y en una página que vende a mujeres que enseñan oficio, una
 * concordancia rota se lee como descuido. "velas" es femenino; las otras tres
 * son masculinas.
 */
const FEMENINAS = new Set(["velas"]);

/** Cuántas fotos entran en el carrusel de la portada B. */
const CUANTAS = 5;

export function PortadaB({
  fotos,
  gratis,
}: {
  fotos: FotoHero[];
  /** El bolso de regalo. Abre el carrusel. */
  gratis: { slug: string; nombre: string; portadaUrl: string | null } | null;
}) {
  const pr = usePrecios();
  const [i, setI] = useState(0);
  const [palabra, setPalabra] = useState(0);
  const tocado = useRef<number | null>(null);

  /* `useCallback`: si cambiara en cada render, el `useEffect` del intervalo de
     `TextoQueRota` se reiniciaría y la palabra no llegaría a rotar nunca. */
  const alRotar = useCallback((n: number) => setPalabra(n), []);

  /*
   * ⚠️ EL CARRUSEL ABRE CON EL BOLSO GRATIS, y su etiqueta lo dice ("TU PRIMER
   * BOLSO, GRATIS"). Es la diferencia con el banner del control, que abre con
   * el más vistoso del catálogo: aquí la primera foto y el botón de debajo
   * cuentan lo mismo, así que la promesa y la acción apuntan al mismo sitio.
   *
   * Sale de la BASE (`gratis = true`), no de un slug escrito aquí: el día que
   * el regalo sea otro bolso, esto lo sigue solo.
   */
  const deRegalo: FotoHero[] =
    gratis?.portadaUrl
      ? [
          {
            slug: gratis.slug,
            nombre: gratis.nombre,
            subtitulo: "Tu primer bolso, gratis",
            url: gratis.portadaUrl,
          },
        ]
      : [];

  /* Las fotos con fondo café se cambian por su versión topo: sobre el lavanda
     se verían "durazno". Ver `lib/fotos-topo.ts`. */
  const visibles = [...deRegalo, ...fotos.filter((f) => f.slug !== gratis?.slug)]
    .slice(0, CUANTAS)
    .map((f) => ({ ...f, url: fotoTopo(f.url) ?? f.url }));

  if (visibles.length === 0) return null;

  /* Circular: llegar al final y que la flecha deje de responder se siente como
     si algo se hubiera roto. */
  const ir = (n: number) => setI((n + visibles.length) % visibles.length);
  const actual = visibles[i];

  const destinoGratis = gratis ? `/app/bolsos/${gratis.slug}` : "/app";
  const verbo = FEMENINAS.has(PALABRAS[palabra] ?? "") ? "conviértelas" : "conviértelos";

  const carrusel = (
    <div className="min-w-0">
      <div
        className="relative"
        tabIndex={0}
        role="group"
        aria-roledescription="carrusel"
        aria-label="Proyectos del programa"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") ir(i - 1);
          if (e.key === "ArrowRight") ir(i + 1);
        }}
        onTouchStart={(e) => (tocado.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (tocado.current === null) return;
          const d = e.changedTouches[0].clientX - tocado.current;
          // 50px de umbral: por debajo suele ser un scroll vertical torcido.
          if (Math.abs(d) > 50) ir(d < 0 ? i + 1 : i - 1);
          tocado.current = null;
        }}
      >
        {/* A sangre en móvil (sin radio: toca los bordes de la pantalla) y con
            radio 8 desde tableta, donde ya tiene márgenes a los lados. */}
        <div className="bg-sand relative aspect-[375/440] overflow-hidden md:rounded-foto-b lg:aspect-9/10">
          <Image
            /* `key` por slug: al cambiar de proyecto React monta una imagen
               nueva y `animate-[aparecer]` funde el cambio en vez de saltar. */
            key={actual.slug}
            src={actual.url}
            alt={`${actual.nombre}, tejido en cuentas`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="animate-[aparecer_.45s_var(--ease-out)] object-cover"
          />

          <span className="bg-espresso-2 text-gold-light rounded-chip-b cifra absolute top-4 right-4 px-2.5 py-1.5 text-xs font-bold tracking-[0.08em] lg:top-4.5 lg:right-4.5">
            {String(i + 1).padStart(2, "0")} / {String(visibles.length).padStart(2, "0")}
          </span>

          <span className="bg-ivory rounded-foto-b absolute bottom-4 left-4 max-w-50 px-3.5 py-2.5 lg:bottom-4.5 lg:left-4.5">
            <span
              className="font-display text-espresso block leading-tight"
              style={{ fontWeight: 500, fontSize: 23 }}
            >
              {actual.nombre}
            </span>
            <span className="text-ink-body mt-1 block text-[10.5px] font-bold tracking-[0.12em] uppercase">
              {actual.subtitulo}
            </span>
          </span>

          <div className="absolute right-4 bottom-4 flex gap-2 lg:right-4.5 lg:bottom-4.5">
            <Flecha lado="izquierda" onClick={() => ir(i - 1)} />
            <Flecha lado="derecha" onClick={() => ir(i + 1)} />
          </div>
        </div>
      </div>

      {/*
        Barra de segmentos y no puntitos: con cinco proyectos, un segmento
        ancho dice a la vez cuántos hay y en cuál estás, y se toca sin apuntar.
        El botón mide 24px de alto aunque la raya se vea de 3: lo que se toca
        no tiene por qué medir lo que se ve.
      */}
      <div className="flex gap-1.5 px-4 pt-1 md:px-0 lg:gap-2 lg:pt-1.5">
        {visibles.map((f, n) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => ir(n)}
            aria-label={`Ver ${f.nombre}`}
            aria-current={n === i ? "true" : undefined}
            className="flex h-6 flex-1 items-center [touch-action:manipulation]"
          >
            <span
              /* 3px: a 2 la barra desaparece sobre el fondo lavanda y a 4
                 pesa más que los puntos del carrusel de al lado. */
              style={{ height: 3 }}
              className={`block w-full rounded-full transition-colors ${
                n === i ? "bg-espresso" : "bg-sand"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const texto = (
    <div className="min-w-0">
      {/* El eyebrow solo en escritorio: en móvil el titular va pegado a la
          foto y meter una línea más lo empuja fuera de la primera pantalla. */}
      <p className="eyebrow-b flex items-center gap-3 max-lg:hidden">Con Elizabeth Valencia</p>

      <h1
        /* La frase COMPLETA para quien usa lector de pantalla: las letras que
           saltan van `aria-hidden` dentro de `TextoQueRota`. */
        aria-label="Crea bolsos, accesorios, adornos y velas de perlas de lujo y conviértelos en tu negocio."
        className="font-display text-espresso lg:mt-4.5"
        style={{
          fontWeight: 500,
          fontSize: "clamp(44px, 5.4vw, 76px)",
          lineHeight: 1.03,
          letterSpacing: "-0.012em",
        }}
      >
        <span className="block">
          Crea{" "}
          <TextoQueRota
            palabras={PALABRAS}
            onCambio={alRotar}
            className="text-apoyo italic"
          />
        </span>
        <span className="block">de perlas de lujo</span>
        <span className="block">
          y {verbo} <span className="max-lg:hidden">en tu negocio.</span>
        </span>
        <span className="block lg:hidden">en tu negocio.</span>
      </h1>

      {/* En escritorio el párrafo va antes del botón; en móvil, después de la
          prueba social (ver el orden de abajo). */}
      <p className="text-ink-body mt-5.5 hidden max-w-125 text-lg leading-relaxed lg:block">
        Bolsos, accesorios y adornos paso a paso, clase nueva cada semana y, en diciembre,
        velas. Empieza con un bolso gratis.
      </p>

      <div className="mt-6 flex flex-col gap-3 lg:mt-7.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
        {/*
          ⚠️ EL BOTÓN LLEVA AL BOLSO GRATIS DENTRO DE LA APP, no a una sección
          de esta página. En la B el curso gratis ya no se reproduce en el home
          (ver `PruebaloGratisB`): el valor se prueba en la plataforma, que es
          además donde la visitante ve que hay mucho más detrás.
        */}
        <Link
          href={destinoGratis}
          className="boton-accion-b flex h-13 items-center justify-center gap-2.5 rounded-full font-bold transition-transform active:scale-[0.98] lg:h-14 lg:px-7.5"
          style={{ fontSize: 17 }}
        >
          <Play size={17} fill="currentColor" aria-hidden="true" />
          Empezar mi bolso gratis
        </Link>

        <p className="text-center lg:text-left">
          <EnlaceCompra
            href="#precio"
            origen="banner_precio"
            plan={FRECUENCIA_POR_DEFECTO}
            className="text-apoyo inline-flex min-h-11 items-center font-semibold underline underline-offset-4 lg:text-base"
          >
            o la membresía desde {pr.desde}/mes →
          </EnlaceCompra>
        </p>
      </div>

      <p className="border-line text-ink-body mt-5.5 border-t pt-5 text-base leading-relaxed lg:hidden">
        Bolsos, accesorios y adornos paso a paso con Elizabeth Valencia, clase nueva cada
        semana y, en diciembre, velas. Empieza con un bolso gratis y pregúntale al Ojo Experto
        cuando algo no te salga.
      </p>

      <div className="mt-4.5 flex items-baseline gap-2.5 lg:mt-9 lg:border-line lg:border-t lg:pt-6">
        <strong
          className="font-display text-gold shrink-0"
          style={{ fontWeight: 600, fontSize: "clamp(28px, 2.4vw, 32px)", lineHeight: 1 }}
        >
          +
          <NumeroQueCuenta
            hasta={1200}
            formato={(n) => Math.round(n).toLocaleString("es-CO")}
            duracion={1.3}
          />
        </strong>
        <span className="text-ink-body text-sm lg:text-base">alumnas en Latinoamérica</span>
      </div>
    </div>
  );

  return (
    <section id="banner" className="pb-9 lg:pt-14 lg:pb-18">
      {/* Móvil: foto a sangre arriba, texto debajo. Escritorio: dos columnas
          con el texto primero. */}
      <div className="lg:contenedor-b lg:flex lg:items-center lg:gap-16">
        <div className="lg:order-2 lg:flex-1">{carrusel}</div>
        <div className="px-4 pt-3.5 md:px-(--aire-b) lg:order-1 lg:flex-1 lg:px-0 lg:pt-0">
          {texto}
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
      aria-label={lado === "izquierda" ? "Proyecto anterior" : "Proyecto siguiente"}
      /* Cuadradas con radio 8: el gesto de "menos redondez" de la paleta B.
         44px es el mínimo táctil del sistema; 48 en escritorio. */
      className="bg-ivory text-espresso rounded-foto-b flex size-11 items-center justify-center transition-transform active:scale-95 [touch-action:manipulation] lg:size-12"
    >
      <Icono size={20} />
    </button>
  );
}
