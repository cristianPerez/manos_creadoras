"use client";

import { ShoppingBag, Sparkle, Store, Tag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSesion } from "@/components/app/SesionContexto";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * LA NAVEGACIÓN DE LA APP, UNA SOLA (2026-10-23)
 * ════════════════════════════════════════════════════════════════════════════
 * Referencia: `design-ref/app-interna-claude-code`. Antes había una barra
 * lateral arena en escritorio y el Ojo tenía su propia cabecera con otro logo
 * y otro menú: dos apps pegadas. Ahora:
 *
 *   · Escritorio: una cabecera arriba, la del home (logo "M", píldoras, y a la
 *     derecha "Entrar"/"Inscribirme" o el plan y el avatar).
 *   · Móvil: la cabecera de marca arriba y cinco pestañas abajo, con el Ojo
 *     al centro en un círculo que sobresale — es lo que más se abre.
 *
 * ⚠️ "Mi plan" VUELVE A LA BARRA DE MÓVIL. Con cuatro pestañas se había
 * quedado fuera; la referencia la pide y cabe a 390px con etiquetas de 11px.
 */

type Destino = { href: string; texto: string; Icono: typeof ShoppingBag };

/** Las píldoras de escritorio, en el orden de la referencia. */
const DESTINOS_ESCRITORIO: Destino[] = [
  { href: "/app", texto: "Mis bolsos", Icono: ShoppingBag },
  { href: "/app/ojo", texto: "Ojo Experto", Icono: Sparkle },
  { href: "/app/directorio", texto: "Directorio", Icono: Store },
  { href: "/app/plan", texto: "Mi plan", Icono: Tag },
];

/** Las pestañas de móvil: el Ojo en el medio (va aparte, en su círculo). */
const IZQUIERDA: Destino[] = [
  { href: "/app", texto: "Mis bolsos", Icono: ShoppingBag },
  { href: "/app/directorio", texto: "Directorio", Icono: Store },
];
const DERECHA: Destino[] = [
  { href: "/app/plan", texto: "Mi plan", Icono: Tag },
  { href: "/app/cuenta", texto: "Cuenta", Icono: User },
];

/**
 * `/app` solo está activo en su propia página y en las fichas de bolso, no en
 * todo lo que cuelga de él. Si no, al abrir el Ojo se encendería también
 * "Mis bolsos".
 */
function estaActivo(href: string, ruta: string): boolean {
  return href === "/app" ? ruta === "/app" || ruta.startsWith("/app/bolsos") : ruta.startsWith(href);
}

/** El logo del home: la "M" en Cormorant cursiva dentro del círculo espresso. */
function Logo({ tamano }: { tamano: "chico" | "grande" }) {
  const grande = tamano === "grande";
  return (
    <Link href="/app" className="flex shrink-0 items-center gap-3">
      <span
        aria-hidden="true"
        className={`bg-espresso flex shrink-0 items-center justify-center rounded-full ${
          grande ? "size-9" : "size-8.5"
        }`}
      >
        <span
          className="font-display text-gold-light italic"
          style={{ fontWeight: 500, fontSize: grande ? 20 : 19, lineHeight: 1 }}
        >
          M
        </span>
      </span>
      <span
        className="font-display text-espresso whitespace-nowrap"
        style={{ fontWeight: 500, fontSize: grande ? 21 : 20 }}
      >
        Manos Creadoras
      </span>
    </Link>
  );
}

/** El avatar redondo con las iniciales: lleva a la cuenta. */
function Avatar({ iniciales }: { iniciales: string | null }) {
  return (
    <Link
      href="/app/cuenta"
      aria-label="Mi cuenta"
      className="flex size-11 shrink-0 items-center justify-center"
    >
      <span className="bg-cacao text-gold-pale flex size-10 items-center justify-center rounded-full text-sm font-semibold">
        {iniciales ?? "·"}
      </span>
    </Link>
  );
}

/**
 * La cabecera: en escritorio, la misma en todas las páginas; en móvil, la de
 * marca SOLO donde la pantalla no trae la suya (la ficha, la lección y el Ojo
 * tienen su propia barra arriba).
 */
export function CabeceraApp() {
  const ruta = usePathname();
  const { conSesion, iniciales, plan } = useSesion();
  const enCuenta = ruta.startsWith("/app/cuenta");
  const conBarraPropia = ruta.startsWith("/app/ojo") || ruta.startsWith("/app/bolsos");

  return (
    <>
      {/* ── Escritorio ── */}
      <header className="bg-cream border-line sticky top-0 z-(--z-sticky) hidden h-(--alto-cabecera-app) shrink-0 items-center gap-8 border-b px-8 lg:flex">
        <Logo tamano="grande" />

        <nav aria-label="Navegación principal" className="flex items-center gap-1">
          {DESTINOS_ESCRITORIO.map(({ href, texto }) => {
            const activo = estaActivo(href, ruta);
            return (
              <Link
                key={href}
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex h-11 items-center rounded-full px-4.5 text-sm transition-colors duration-150 ${
                  activo
                    ? "bg-espresso text-cream font-semibold"
                    : "text-ink-body hover:text-espresso"
                }`}
              >
                {texto}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {conSesion ? (
            <>
              {plan && (
                <span className="bg-sand text-cacao rounded-full px-4 py-2 text-sm font-medium">
                  {plan}
                </span>
              )}
              <Avatar iniciales={iniciales} />
            </>
          ) : (
            <>
              <Link
                href="/app/cuenta"
                aria-current={enCuenta ? "page" : undefined}
                className={`text-espresso flex h-11 items-center rounded-full px-5 text-sm font-semibold transition-colors ${
                  enCuenta ? "bg-sand" : "hover:bg-sand"
                }`}
              >
                Entrar
              </Link>
              <Inscribirme />
            </>
          )}
        </div>
      </header>

      {/* ── Móvil: la de marca ── */}
      {!conBarraPropia && (
        <header className="bg-cream border-line sticky top-0 z-(--z-sticky) flex h-15 shrink-0 items-center justify-between gap-3 border-b px-4 lg:hidden">
          <Logo tamano="chico" />
          {conSesion ? (
            <Avatar iniciales={iniciales} />
          ) : ruta.startsWith("/app/plan") ? (
            /* En Mi plan el plan ya está a la vista: arriba, "Entrar". */
            <Link
              href="/app/cuenta"
              className="text-espresso flex h-11 items-center px-2 text-base font-semibold"
            >
              Entrar
            </Link>
          ) : (
            <Inscribirme />
          )}
        </header>
      )}
    </>
  );
}

/**
 * "Inscribirme" lleva a Mi plan, no directo al pago: ahí está el selector
 * mensual/anual y el botón de pagar con el enlace del país.
 */
function Inscribirme() {
  return (
    <Link
      href="/app/plan"
      className="bg-cacao text-ivory flex h-11 shrink-0 items-center rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-transform active:scale-[0.97]"
    >
      Inscribirme
    </Link>
  );
}

/**
 * La barra de abajo. Solo en móvil.
 *
 * Va fija y por encima de todo (`z-sticky`), así que el contenido necesita
 * dejarle sitio — eso lo hace `.hueco-barra-inferior` en el layout, contando
 * también lo que sobresale el círculo del Ojo.
 */
export function BarraInferior() {
  const ruta = usePathname();
  const enOjo = ruta.startsWith("/app/ojo");

  const pestana = ({ href, texto, Icono }: Destino) => {
    const activo = estaActivo(href, ruta);
    return (
      <Link
        key={href}
        href={href}
        aria-current={activo ? "page" : undefined}
        className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs ${
          activo ? "text-espresso font-semibold" : "text-ink-muted"
        }`}
        style={{ fontSize: 11 }}
      >
        {/* La activa lleva una píldora arena detrás del ícono. */}
        <span
          aria-hidden="true"
          className={`flex h-8 w-13 items-center justify-center rounded-full ${activo ? "bg-sand" : ""}`}
        >
          <Icono size={22} strokeWidth={1.75} />
        </span>
        {texto}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="border-line bg-ivory fixed inset-x-0 bottom-0 z-(--z-sticky) border-t lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-(--alto-barra-inferior) max-w-md items-stretch">
        {IZQUIERDA.map(pestana)}

        {/*
          ⚠️ EL OJO AL CENTRO, EN UN CÍRCULO QUE SOBRESALE. Es la función que
          más se usa y la que más vende; las otras cuatro son lugares, esta es
          una acción. En el Ojo, el borde y el destello pasan a `--gold-pale`.
        */}
        <Link
          href="/app/ojo"
          aria-current={enOjo ? "page" : undefined}
          className="text-espresso relative flex flex-1 flex-col items-center justify-end gap-1 pb-2.5 font-semibold"
          style={{ fontSize: 11 }}
        >
          <span
            aria-hidden="true"
            className={`bg-espresso absolute -top-(--elevacion-ojo) left-1/2 flex size-14.5 -translate-x-1/2 items-center justify-center rounded-full border-4 ${
              enOjo ? "border-gold-pale text-gold-pale" : "border-cream text-gold-light"
            }`}
          >
            <Sparkle size={22} strokeWidth={1.75} />
          </span>
          Ojo Experto
        </Link>

        {DERECHA.map(pestana)}
      </div>
    </nav>
  );
}
