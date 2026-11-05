"use client";

import { usePrecios } from "@/components/app/Precios";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { NumeroQueCuenta } from "@/components/home/NumeroQueCuenta";
import type { FotoHero } from "@/components/home/HeroSlider";
import { TextoQueRota } from "@/components/home-b/TextoQueRota";
import { fotoTopo } from "@/lib/fotos-topo";
import { TESTIMONIOS } from "@/lib/landing";
import { FRECUENCIA_POR_DEFECTO, GARANTIA } from "@/lib/planes";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LA PORTADA DEL HOME B v2 — "vendedor" (2026-11-05)
 * ════════════════════════════════════════════════════════════════════════════
 * Contrato: `design-ref/home-b-v2-claude-code/screenshots/movil-375/
 * 00-primera-vista-medidas.png`.
 *
 * ⚠️ LA PRIMERA PANTALLA DEL TELÉFONO TIENE QUE VENDER SIN SCROLL. Es el
 * reparo nº 1 del revisor a la B anterior: a 375×812 solo se veían cabecera,
 * cápsulas y foto. Ahora, sin mover el dedo, entran titular completo, línea de
 * dolor, botón, precio con garantía y prueba social — todo termina en 696px y
 * quedan 40 libres antes de la barra fija (76). Para que quepa, la foto bajó de
 * 440 a 300 y las cápsulas se fueron más abajo. Las medidas de cada bloque
 * están escritas al lado de su clase; si se tocan, se vuelve a medir.
 *
 *   cabecera 56 · foto 300 · barra 20 · (12) titular 118 · (10) dolor 44 ·
 *   (16) botón 52 · (10) precio 20 · (14) prueba social 24  →  696
 *
 * ⚠️ AHORA SÍ HAY AUTOAVANCE, y es una decisión de Cristian con condiciones:
 * cada 3,5 s, y SE DETIENE PARA SIEMPRE al primer toque (flecha, segmento,
 * teclado o swipe) — quien tocó ya está mirando a su ritmo y que la foto se le
 * cambie sola sería quitarle el control. Además se pausa mientras el dedo o el
 * ratón están encima, no corre con la pestaña oculta y no existe con
 * `prefers-reduced-motion`.
 */

/** Las cuatro palabras que rotan. Arranca SIEMPRE en "bolsos". */
const PALABRAS = ["bolsos", "accesorios", "adornos", "velas"];

/**
 * ⚠️ CON "VELAS" CAMBIA EL RESTO DE LA FRASE, no solo el verbo. "Velas de
 * perlas" no existe: con esa palabra la línea dice "aromáticas de lujo" y el
 * verbo concuerda en femenino ("conviértelas"). Las otras tres son masculinas
 * y de perlas.
 */
const ES_VELA = (palabra: string | undefined) => palabra === "velas";

/**
 * Milisegundos entre foto y foto mientras nadie toque el carrusel. 3,5 s y no
 * los 5 del prompt: decisión de Cristian (2026-11-05) para que la galería
 * enseñe más proyectos en el rato que se queda mirando el titular.
 */
const AVANCE_MS = 3500;

/**
 * La vela no es un bolso de la base: es un taller que todavía no está grabado.
 * ⚠️ FOTO Y NOMBRE PROVISIONALES hasta que Cristian dé los reales (ver
 * ESTADO.md). `lib/proximamente.ts` tiene el curso de velas pero sin foto ni
 * detalle, así que de ahí solo se toma que existe.
 *
 * ⚠️ SIN "PRÓXIMAMENTE" NI "EN CAMINO" (Cristian, 2026-11-05). El revisor vio
 * que "Taller en camino" en la primera pantalla hacía dudar ("¿pago por algo
 * que no existe?"). Que el taller aún no está grabado lo descubre quien ya
 * entró y pagó, dentro de la app; aquí la vela se enseña como lo que es: otra
 * pieza que se aprende a crear.
 */
const VELA: FotoHero = {
  slug: "velas",
  nombre: "Velas aromáticas",
  subtitulo: "Aromáticas de lujo",
  url: "/images/topo/vela-osos-auto.webp",
};

/**
 * Tres bolsos de alumnas para la prueba social: son las mismas fotos del
 * mosaico de la comunidad, así que la cifra "+1.200" tiene cara desde arriba.
 */
const MINIATURAS = [TESTIMONIOS[0], TESTIMONIOS[1], TESTIMONIOS[4]].filter(
  (t): t is (typeof TESTIMONIOS)[number] & { foto: string } => Boolean(t?.foto),
);

export function PortadaB({
  fotos,
  gratis,
}: {
  /** Los cuatro bolsos de la B, ya en orden (`fotosB` de `lib/datos-home`). */
  fotos: FotoHero[];
  /** El bolso de regalo. Abre el carrusel. */
  gratis: { slug: string; nombre: string; portadaUrl: string | null } | null;
}) {
  const pr = usePrecios();
  const quieto = useReducedMotion();
  const [i, setI] = useState(0);
  const [palabra, setPalabra] = useState(0);
  /* `parado`: alguien tocó el carrusel y ya no avanza nunca más en esta visita.
     `encima`: el dedo o el ratón está sobre la foto; vuelve a correr al salir. */
  const [parado, setParado] = useState(false);
  const [encima, setEncima] = useState(false);
  const tocado = useRef<number | null>(null);

  /* `useCallback`: si cambiara en cada render, el intervalo de `TextoQueRota`
     se reiniciaría y la palabra no llegaría a rotar nunca. */
  const alRotar = useCallback((n: number) => setPalabra(n), []);

  /*
   * El orden: el bolso gratis abre (su etiqueta dice "TU PRIMER BOLSO,
   * GRATIS", igual que el botón de debajo), luego un bolso del catálogo, la
   * vela TERCERA —cuenta que la membresía no es solo bolsos, pero ya no es lo
   * segundo que se ve (Cristian, 2026-11-05; el prompt la ponía segunda)— y
   * detrás el resto. El gratis sale de la BASE, no de un slug escrito aquí.
   */
  const deRegalo: FotoHero[] = gratis?.portadaUrl
    ? [{ slug: gratis.slug, nombre: gratis.nombre, subtitulo: "Tu primer bolso, gratis", url: gratis.portadaUrl }]
    : [];

  /* Las fotos con fondo café se cambian por su versión topo: sobre el lavanda
     se verían "durazno". Ver `lib/fotos-topo.ts`. */
  const delCatalogo = fotos.filter((f) => f.slug !== gratis?.slug);
  const visibles = [...deRegalo, ...delCatalogo.slice(0, 1), VELA, ...delCatalogo.slice(1)].map(
    (f) => ({ ...f, url: fotoTopo(f.url) ?? f.url }),
  );
  const total = visibles.length;

  /* Circular: llegar al final y que la flecha deje de responder se siente como
     si algo se hubiera roto. */
  const ir = useCallback((n: number) => setI((n + total) % total), [total]);

  /** Lo que hace cualquier gesto de la persona: mover Y parar para siempre. */
  const irAMano = (n: number) => {
    setParado(true);
    ir(n);
  };

  useEffect(() => {
    if (quieto || parado || encima || total < 2) return;
    /* `setTimeout` encadenado al índice y no `setInterval`: cada foto cuenta
       sus 3,5 s desde que aparece, aunque la anterior haya llegado tarde. */
    const id = setTimeout(() => {
      // Con la pestaña oculta no se avanza: volvería con la galería "a mitad".
      if (document.hidden) {
        setI((n) => n);
        return;
      }
      ir(i + 1);
    }, AVANCE_MS);
    return () => clearTimeout(id);
  }, [i, quieto, parado, encima, total, ir]);

  /* Al volver a la pestaña, el `setTimeout` de arriba ya se gastó sin avanzar:
     esto lo rearma. */
  const [, setDespertar] = useState(0);
  useEffect(() => {
    const alVolver = () => {
      if (!document.hidden) setDespertar((n) => n + 1);
    };
    document.addEventListener("visibilitychange", alVolver);
    return () => document.removeEventListener("visibilitychange", alVolver);
  }, []);

  /* El carrusel está corriendo solo ahora mismo (para el relleno de la barra). */
  const avanzando = !quieto && !parado && !encima && total > 1;

  if (total === 0) return null;
  const actual = visibles[i];

  const destinoGratis = gratis ? `/app/bolsos/${gratis.slug}` : "/app";
  const vela = ES_VELA(PALABRAS[palabra]);

  const carrusel = (
    <div className="min-w-0">
      <div
        className="relative"
        tabIndex={0}
        role="group"
        aria-roledescription="carrusel"
        aria-label="Proyectos del programa"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") irAMano(i - 1);
          if (e.key === "ArrowRight") irAMano(i + 1);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setEncima(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setEncima(false)}
        onTouchStart={(e) => {
          tocado.current = e.touches[0].clientX;
          setEncima(true);
        }}
        onTouchEnd={(e) => {
          setEncima(false);
          if (tocado.current === null) return;
          const d = e.changedTouches[0].clientX - tocado.current;
          // 50px de umbral: por debajo suele ser un scroll vertical torcido.
          if (Math.abs(d) > 50) irAMano(d < 0 ? i + 1 : i - 1);
          tocado.current = null;
        }}
      >
        {/*
          ⚠️ EN PANTALLAS BAJAS LA FOTO CEDE, EL TITULAR NO — PERO SIN
          ENCOGERSE DE MÁS (ajustado el 2026-11-05 con capturas reales de
          Cristian: iPhone 11 Pro, Galaxy S21 y MacBook Pro de 13").

          MÓVIL. La foto mide `alto de pantalla − 486`, entre 246 y 330. Antes
          restaba 512 con suelo en 220, y el resultado era que en un iPhone con
          Safari —donde las barras dejan unos 635 de alto— la cuenta daba 123 y
          la foto caía al suelo de 220: el bolso, que es lo que vende, se veía
          más pequeño que en un Android con la misma pantalla. Ahora crece con
          lo que haya: 248 en ese iPhone, ~270 a 750, 330 a 810 o más. `svh` y
          no `vh`: no cambia cuando la barra del navegador aparece y desaparece.

          ESCRITORIO. Dos límites, y manda el más pequeño:
            · la proporción 1:1,08 (antes 5:6, que a 1280 daba 603px de alto
              contra 475 del texto de al lado — la foto se veía desplomada);
            · `alto de pantalla − 200`, que es lo que ocupan la cabecera y el
              aire de arriba y abajo. Sin esto, en un MacBook de 13" la foto
              terminaba 19px POR DEBAJO del borde de la pantalla: había que
              hacer scroll para ver un bolso que es lo primero que se mira.
          Recorta alto, nunca ancho, así que la foto no se deforma: la caja se
          achata y `object-cover` se queda con el centro. ⚠️ `lg:w-full` es
          justo lo que hace que recorte el ALTO: la columna usa `items-center`,
          así que sin un ancho propio el ancho lo decidía la proporción y, al
          bajarle el techo de alto, la foto se iba estrechando (463 en vez de
          los 503 de su columna) y dejaba un hueco al lado.
        */}
        <div className="bg-sand relative h-[clamp(246px,calc(100svh-486px),330px)] overflow-hidden lg:aspect-[1/1.08] lg:h-auto lg:max-h-[calc(100svh-200px)] lg:w-full lg:rounded-foto-b">
          <Image
            /* `key` por slug: al cambiar de proyecto React monta una imagen
               nueva y `animate-[aparecer]` funde el cambio en vez de saltar. */
            key={actual.slug}
            src={actual.url}
            alt={`${actual.nombre}, tejido en cuentas`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 540px, 100vw"
            className="animate-[aparecer_.45s_var(--ease-out)] object-cover object-[center_55%] lg:object-center"
          />

          {/* ⚠️ RADIO 8 EN LOS TRES CONTROLES, igual que la foto: el reparo
              del revisor era que convivían píldoras y cuadrados. */}
          <span className="bg-espresso-2 text-gold-light rounded-foto-b cifra absolute top-3 right-3 px-2.5 py-1.5 text-xs font-bold tracking-[0.08em] lg:top-4 lg:right-4 lg:px-2.75 lg:py-1.75">
            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>

          <span
            className="bg-ivory rounded-foto-b absolute bottom-3 left-3 px-3 pt-2 pb-2.25 lg:bottom-4 lg:left-4 lg:px-4 lg:pt-3 lg:pb-3.25"
            style={{ boxShadow: "var(--sombra-etiqueta)" }}
          >
            <span className="font-display text-espresso block text-xl leading-[1.05] font-semibold lg:text-[26px]">
              {actual.nombre}
            </span>
            <span className="text-ink-body mt-0.5 block text-[10px] font-bold tracking-[0.12em] uppercase lg:mt-0.75 lg:text-[11px]">
              {actual.subtitulo}
            </span>
          </span>

          <div className="absolute right-3 bottom-3 flex gap-1.5 lg:right-4 lg:bottom-4 lg:gap-2">
            <Flecha lado="izquierda" onClick={() => irAMano(i - 1)} />
            <Flecha lado="derecha" onClick={() => irAMano(i + 1)} />
          </div>
        </div>
      </div>

      {/*
        Barra de segmentos: con seis proyectos dice a la vez cuántos hay y en
        cuál estás. ⚠️ La barra ocupa 20px en el teléfono (es lo que mide el
        contrato) pero cada botón mide 24 de alto: el margen negativo deja que
        lo que se toca sea más grande que lo que se ve sin mover nada debajo.
      */}
      <div className="flex h-5 items-center gap-1.5 px-4 lg:mt-1 lg:h-6 lg:gap-2 lg:px-0">
        {visibles.map((f, n) => (
          <button
            key={f.slug}
            type="button"
            onClick={() => irAMano(n)}
            aria-label={`Ver ${f.nombre}`}
            aria-current={n === i ? "true" : undefined}
            className="-my-0.5 flex h-6 flex-1 cursor-pointer items-center [touch-action:manipulation] lg:my-0"
          >
            {/*
              3px: a 2 la barra desaparece sobre el fondo lavanda.

              ⚠️ MIENTRAS AVANZA SOLO, EL SEGMENTO ACTIVO SE LLENA en los 3,5 s
              que dura la foto (revisor: "la barra no acompaña el autoavance").
              Dice sin palabras que la foto va a cambiar y cuándo. En cuanto
              alguien toca el carrusel —o con movimiento reducido— el activo
              sale lleno y quieto. El `key` con `encima` reinicia el relleno al
              soltar, igual que se reinicia el temporizador.
            */}
            <span
              style={{ height: 3 }}
              className="bg-line relative block w-full overflow-hidden rounded-full"
            >
              {n === i &&
                (avanzando ? (
                  <motion.span
                    key={`${i}-${encima}`}
                    className="bg-espresso absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AVANCE_MS / 1000, ease: "linear" }}
                  />
                ) : (
                  <span className="bg-espresso absolute inset-0 rounded-full" />
                ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const texto = (
    <div className="min-w-0">
      <h1
        /* La frase COMPLETA para quien usa lector de pantalla, con las dos
           variantes: las letras que saltan van `aria-hidden`. */
        aria-label="Crea bolsos, accesorios y adornos de perlas de lujo, o velas aromáticas de lujo, y conviértelos en tu negocio."
        className="font-display text-espresso font-medium"
      >
        {/*
          LÍNEA 1 — la de la animación, en grande: 54px en el teléfono (56 de
          caja). ⚠️ El `clamp` baja a 46 en pantallas más estrechas que 375:
          la caja de la palabra mide "accesorios" (la más larga) y a 360px, con
          54, la línea no cabía y abría scroll horizontal.
        */}
        <span className="block h-14 text-[clamp(46px,14.4vw,54px)] leading-14 tracking-[-0.015em] whitespace-nowrap lg:h-auto lg:text-[clamp(56px,7.2vw,104px)] lg:leading-none lg:tracking-[-0.02em]">
          Crea <TextoQueRota palabras={PALABRAS} onCambio={alRotar} className="text-apoyo italic" />
        </span>

        {/* LÍNEAS 2-3 — a la mitad de tamaño. En móvil, dos renglones fijos;
            en escritorio, un solo bloque que se parte donde quepa. El
            `clamp` de móvil da 28 a 375 y no deja que "conviértelas en tu
            negocio." se parta en tres a 360. */}
        <span className="block text-[clamp(25px,7.47vw,28px)] leading-[31px] lg:mt-1.5 lg:text-[clamp(30px,3.3vw,46px)] lg:leading-[1.1]">
          <span className="max-lg:block">
            <Cambia texto={vela ? "aromáticas" : "de perlas"} quieto={Boolean(quieto)} /> de lujo y
          </span>{" "}
          <span className="max-lg:block">
            <Cambia texto={vela ? "conviértelas" : "conviértelos"} quieto={Boolean(quieto)} /> en tu
            negocio.
          </span>
        </span>
      </h1>

      {/*
        ⚠️ LA LÍNEA DE DOLOR. El reparo nº 2: el titular prometía producto y no
        nombraba el problema de la ficha de avatar (tutoriales que se saltan
        pasos, bolsos que quedan deformes). 44px: dos renglones exactos a 375.

        v2.1: la segunda mitad pasó de "todo paso a paso, desde cero" a nombrar
        el Ojo Experto (revisor, objeción 2 de FICHA-AVATAR: "ya probé con
        YouTube" se responde con el mecanismo — algo que revisa TU bolso — y la
        ficha manda que viva en el héroe). Se reescribió en vez de añadir para
        no pasar a tres renglones y romper la primera pantalla; "desde cero"
        sigue en la primera tarjeta de dolores y en las preguntas. "la foto del
        tuyo" y no "el tuyo": la visitante aún no sabe qué es el Ojo Experto, y
        "revisa la foto" le dice cómo funciona (revisor, 2ª ronda).
      */}
      <p className="text-ink-body mt-2.5 text-[15.5px] leading-5.5 lg:mt-5 lg:max-w-130 lg:text-[19px] lg:leading-[1.55]">
        Ni pasos saltados ni bolsos deformes: el Ojo Experto revisa la foto del tuyo.
      </p>

      <div className="mt-4 lg:mt-7 lg:flex lg:flex-wrap lg:items-center lg:gap-x-5.5 lg:gap-y-3">
        {/*
          ⚠️ EL BOTÓN LLEVA AL BOLSO GRATIS DENTRO DE LA APP, no a `#gratis`:
          el valor se prueba en la plataforma, que es además donde se ve que hay
          mucho más detrás. `data-cta` lo separa en Mixpanel del botón igual
          del cierre (ver `MedirHome`).
        */}
        <Link
          href={destinoGratis}
          data-cta="heroe_gratis"
          className="boton-accion-b flex h-13 items-center justify-center gap-2.5 rounded-full text-[17px] font-bold transition-transform active:scale-[0.98] lg:h-14 lg:px-7.5"
          style={{ boxShadow: "var(--sombra-accion-b)" }}
        >
          <Play size={17} fill="currentColor" aria-hidden="true" />
          Empezar mi bolso gratis
        </Link>

        {/* ⚠️ LA OFERTA ARRIBA, COMO TEXTO Y NO COMO OTRO BOTÓN (reparo nº 3):
            un segundo botón competiría con el de arriba; una línea responde
            "¿y cuánto cuesta?" sin pedir nada. El precio sale de la base. */}
        <p className="text-ink-body mt-2.5 text-center text-[13.5px] leading-5 lg:mt-0 lg:text-left lg:text-[15px]">
          Plan desde{" "}
          <EnlaceCompra
            href="#precio"
            origen="banner_precio"
            plan={FRECUENCIA_POR_DEFECTO}
            className="text-apoyo font-bold underline underline-offset-3"
          >
            {pr.desde}/mes
          </EnlaceCompra>{" "}
          · {GARANTIA.titulo.toLowerCase()}
        </p>
      </div>

      <div className="mt-3.5 flex h-6 items-center justify-center gap-2.5 lg:border-line lg:mt-7.5 lg:h-auto lg:justify-start lg:gap-3 lg:border-t lg:pt-5.5">
        <span className="flex shrink-0" aria-hidden="true">
          {MINIATURAS.map((t, n) => (
            <Image
              key={t.foto}
              src={t.foto}
              alt=""
              width={64}
              height={64}
              /* Sin carga diferida: están en la primera pantalla, y en
                 diferido llegaban tarde y la prueba social se veía sin caras. */
              loading="eager"
              sizes="32px"
              className={`border-cream size-6 rounded-[6px] border-2 object-cover lg:size-8 ${
                n > 0 ? "-ml-2 lg:-ml-2.5" : ""
              }`}
            />
          ))}
        </span>
        <span className="text-ink-body text-sm lg:text-[15px]">
          <strong className="font-display text-gold text-xl font-semibold lg:text-[26px]">
            +
            <NumeroQueCuenta
              hasta={1200}
              formato={(n) => Math.round(n).toLocaleString("es-CO")}
              duracion={1.3}
            />
          </strong>{" "}
          alumnas en Latinoamérica
        </span>
      </div>
    </div>
  );

  return (
    <section id="banner" className="lg:contenedor-b lg:pt-11 lg:pb-16">
      {/* Móvil: foto a sangre arriba, texto debajo. Escritorio: dos columnas
          con el texto a la izquierda (más ancho: 1.1 contra 1). */}
      <div className="lg:flex lg:items-center lg:gap-16">
        <div className="lg:order-2 lg:flex-1">{carrusel}</div>
        <div className="px-4 pt-3 pb-6 md:px-(--aire-b) lg:order-1 lg:flex-[1.1] lg:p-0">
          {texto}
        </div>
      </div>
    </section>
  );
}

/**
 * Un trozo de la frase que cambia con la palabra ("de perlas" ↔ "aromáticas",
 * "conviértelos" ↔ "conviértelas"). Fundido simple de 200ms en total: 100 de
 * salida y 100 de entrada, sincronizado con la palabra que rota.
 */
function Cambia({ texto, quieto }: { texto: string; quieto: boolean }) {
  if (quieto) return <span>{texto}</span>;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={texto}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {texto}
      </motion.span>
    </AnimatePresence>
  );
}

function Flecha({ lado, onClick }: { lado: "izquierda" | "derecha"; onClick: () => void }) {
  const Icono = lado === "izquierda" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={lado === "izquierda" ? "Proyecto anterior" : "Proyecto siguiente"}
      /* 44px es el mínimo táctil del sistema; 48 en escritorio. */
      className="bg-ivory text-espresso rounded-foto-b shadow-sm flex size-11 cursor-pointer items-center justify-center transition-transform active:scale-95 [touch-action:manipulation] lg:size-12"
    >
      <Icono size={20} />
    </button>
  );
}
