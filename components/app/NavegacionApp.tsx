"use client";

import { LogIn, Sparkles, Store, ShoppingBag, Tag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConSesion } from "@/components/app/SesionContexto";

/**
 * La navegación de la app, en sus dos formas.
 *
 * ⚠️ NO SON LOS MISMOS DESTINOS NI EN EL MISMO ORDEN. En escritorio van los
 * cinco (Mis bolsos, Directorio, Ojo Experto, Mi plan y la cuenta). En móvil,
 * desde el Ojo v5 (2026-10-21), cuatro: Mis bolsos, Ojo Experto, Directorio y
 * Cuenta — el Ojo al lado de los bolsos porque es lo que más se abre, y "Mi
 * plan" fuera: se llega desde Cuenta y desde el medidor de preguntas del Ojo.
 * A 390px, cuatro pestañas de 97px caben con etiquetas de 12px sin partirse.
 */

export const DESTINOS = [
  { href: "/app", texto: "Mis bolsos", Icono: ShoppingBag, ordenMovil: 1 },
  { href: "/app/directorio", texto: "Directorio", Icono: Store, ordenMovil: 3 },
  { href: "/app/ojo", texto: "Ojo Experto", Icono: Sparkles, ordenMovil: 2 },
  { href: "/app/plan", texto: "Mi plan", Icono: Tag, ordenMovil: null },
  { href: "/app/cuenta", texto: "Mi cuenta", Icono: User, ordenMovil: 4 },
] as const;

/**
 * `/app` solo está activo en su propia página, no en todo lo que cuelga de él.
 * Si no, al abrir una ficha se encenderían "Mis bolsos" y nada más, perdiendo
 * la pista de dónde estás.
 */
/**
 * La última pestaña dice "Entrar" a quien no ha iniciado sesión y "Mi cuenta" a
 * quien sí (2026-10-21, pedido de Cristian). Es el ÚNICO sitio de la app donde
 * aparece el formulario de entrar: el resto de pestañas se ven sin cuenta.
 */
function useDestinos() {
  const conSesion = useConSesion();
  return DESTINOS.map((d) =>
    d.href === "/app/cuenta" && !conSesion ? { ...d, texto: "Entrar", Icono: LogIn } : d,
  );
}

function estaActivo(href: string, ruta: string): boolean {
  return href === "/app" ? ruta === "/app" || ruta.startsWith("/app/bolsos") : ruta.startsWith(href);
}

/**
 * Los mismos destinos, en vertical, para reutilizarlos dentro de la barra del
 * Ojo Experto — que tiene su propia barra pero necesita la misma navegación.
 */
export function EnlacesApp() {
  const ruta = usePathname();
  const destinos = useDestinos();
  return (
    <nav className="flex flex-col gap-1">
      {destinos.map(({ href, texto, Icono }) => {
        const activo = estaActivo(href, ruta);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`flex h-12 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors ${
              activo ? "bg-espresso text-white" : "text-ink-body hover:text-espresso"
            }`}
          >
            <Icono size={18} aria-hidden="true" />
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Los destinos en fila, en píldoras, para la cabecera de escritorio del Ojo
 * Experto (v5). Sin la cuenta: esa va a la derecha, como "Entrar" o el avatar.
 */
export function EnlacesSuperiores() {
  const ruta = usePathname();
  return (
    <nav aria-label="Navegación principal" className="flex items-center gap-1">
      {DESTINOS.filter((d) => d.href !== "/app/cuenta").map(({ href, texto, Icono }) => {
        const activo = estaActivo(href, ruta);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`flex h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors duration-150 ${
              activo ? "bg-sand text-espresso font-semibold" : "text-ink-muted hover:text-espresso"
            }`}
          >
            <Icono size={16} aria-hidden="true" />
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}

/** La barra lateral de 260 px. Solo en escritorio. */
export function BarraLateral() {
  return (
    <aside className="bg-sand hidden w-(--barra-lateral) shrink-0 flex-col gap-1 px-4 py-6 lg:flex">
      <Link href="/app" className="mb-6 flex items-center gap-3 px-3">
        <span
          aria-hidden="true"
          className="bg-espresso flex size-9 shrink-0 items-center justify-center rounded-full"
        >
          <span
            className="font-display text-gold-light text-lg italic"
            style={{ fontWeight: 500, lineHeight: 1 }}
          >
            M
          </span>
        </span>
        <span className="font-display text-espresso text-lg" style={{ fontWeight: 500 }}>
          Manos Creadoras
        </span>
      </Link>

      <EnlacesApp />
    </aside>
  );
}

/**
 * La barra de abajo. Solo en móvil.
 *
 * Va fija y por encima de todo (`z-sticky`), así que el contenido necesita
 * dejarle sitio — eso lo hace el `pb` del contenedor en el layout, no aquí:
 * una barra fija que además empuja el contenido es una barra que no es fija.
 */
export function BarraInferior() {
  const ruta = usePathname();
  const conSesion = useConSesion();
  const destinos = useDestinos()
    .filter((d) => d.ordenMovil !== null)
    .sort((a, b) => (a.ordenMovil ?? 0) - (b.ordenMovil ?? 0))
    /* "Mi cuenta" no cabe con las otras tres a 12px: en móvil, "Cuenta". */
    .map((d) => (d.href === "/app/cuenta" && conSesion ? { ...d, texto: "Cuenta" } : d));

  return (
    <nav
      aria-label="Navegación principal"
      /* Ojo v5: marfil y plano. El crema translúcido con desenfoque era el
         único vidrio de la app y bajo él el contenido se veía sucio. */
      className="border-line bg-ivory fixed inset-x-0 bottom-0 z-(--z-sticky) border-t lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-(--alto-barra-inferior) max-w-md">
        {destinos.map(({ href, texto, Icono }) => {
          const activo = estaActivo(href, ruta);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
                activo ? "text-gold font-semibold" : "text-ink-muted"
              }`}
            >
              {/* La línea de 2px sobre el destino activo, a todo el ancho de la
                  pestaña como en la referencia. */}
              {activo && <span aria-hidden="true" className="bg-gold absolute inset-x-0 top-0 h-0.5" />}
              <Icono size={22} strokeWidth={1.75} aria-hidden="true" />
              {texto}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
