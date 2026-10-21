"use client";

import { LogIn, Sparkles, Store, ShoppingBag, Tag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConSesion } from "@/components/app/SesionContexto";

/**
 * La navegación de la app, en sus dos formas.
 *
 * ⚠️ NO SON LOS MISMOS DESTINOS. La barra lateral de escritorio lleva CUATRO
 * (Mis bolsos, Directorio, Ojo Experto, Mi cuenta) y la de móvil solo TRES: el
 * Directorio se cae. No es un olvido del diseño — a cuatro destinos, cada uno
 * se queda en 93px y el texto empieza a partirse. El Directorio se abre desde
 * la ficha del bolso y desde Mi cuenta, que es donde de verdad se necesita:
 * cuando estás mirando qué materiales comprar.
 */

export const DESTINOS = [
  { href: "/app", texto: "Mis bolsos", Icono: ShoppingBag, enMovil: true },
  { href: "/app/directorio", texto: "Directorio", Icono: Store, enMovil: false },
  { href: "/app/ojo", texto: "Ojo Experto", Icono: Sparkles, enMovil: true },
  /*
   * ⚠️ `enMovil: false` NO ES UN OLVIDO, por el mismo motivo que el Directorio.
   * La barra de abajo ya va con tres y a cuatro el texto empieza a partirse.
   *
   * En móvil se llega igual: "Mi cuenta" lleva aquí, y la ficha de un bolso
   * bloqueado también — que es justo cuando interesa, no cuando se mira el menú.
   */
  { href: "/app/plan", texto: "Mi plan", Icono: Tag, enMovil: false },
  { href: "/app/cuenta", texto: "Mi cuenta", Icono: User, enMovil: true },
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
  const destinos = useDestinos();

  return (
    <nav
      aria-label="Navegación principal"
      className="border-line bg-cream/95 fixed inset-x-0 bottom-0 z-(--z-sticky) border-t backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md">
        {destinos.filter((d) => d.enMovil).map(({ href, texto, Icono }) => {
          const activo = estaActivo(href, ruta);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 pt-3 pb-2 text-xs font-semibold transition-colors ${
                activo ? "text-gold" : "text-ink-muted"
              }`}
            >
              {/* La línea de 2px sobre el destino activo. Va dentro del enlace
                  y pegada al borde superior para que no dependa del alto. */}
              {activo && <span aria-hidden="true" className="bg-gold absolute inset-x-5 top-0 h-0.5" />}
              <Icono size={20} aria-hidden="true" />
              {texto}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
