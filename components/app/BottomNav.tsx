"use client";

import { GraduationCap, Sparkles, UserRound } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * La tercera pestaña cambia según quién mire.
 *
 * Para una alumna es "Mi cuenta". Para alguien sin sesión, esa pantalla está
 * cerrada y tocarla la rebotaría al login sin explicación — un enlace que no
 * hace lo que dice. Se convierte en "Entrar", que es exactamente lo que va a
 * pasar cuando lo toque.
 *
 * Las otras dos no cambian: los tutoriales de cortesía y el Ojo Experto sí
 * tienen algo que enseñarle a un visitante.
 */
function nav(haySesion: boolean) {
  return [
    { href: "/cursos", label: haySesion ? "Mis cursos" : "Tutoriales", icono: GraduationCap },
    { href: "/ojo-experto", label: "Ojo Experto", icono: Sparkles },
    /*
      ⚠️ SIEMPRE `/cuenta`, tenga sesión o no. Esa pantalla sabe qué enseñar en
      cada caso: la membresía si hay cuenta, el formulario de acceso si no.
      Antes, sin sesión, esto llevaba a `/login` — una página a pantalla completa
      SIN esta barra, así que tocar una pestaña hacía desaparecer la app entera.
      Una pestaña que te saca de la app no es una pestaña.
    */
    { href: "/cuenta", label: haySesion ? "Mi cuenta" : "Entrar", icono: UserRound },
  ];
}

export function BottomNav({ haySesion }: { haySesion: boolean }) {
  const pathname = usePathname();
  const NAV = nav(haySesion);

  return (
    <nav
      aria-label="Navegación principal"
      className="sticky bottom-0 border-t border-border-default bg-surface-elevated pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-2">
        {NAV.map(({ href, label, icono: Icono }) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={activo ? "page" : undefined}
              className="relative flex min-w-16 flex-1 flex-col items-center justify-center gap-1 transition-transform active:scale-[0.94] [touch-action:manipulation]"
            >
              {activo && (
                <motion.span
                  layoutId="tab-activa"
                  aria-hidden="true"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-primary"
                />
              )}
              <Icono
                size={22}
                aria-hidden="true"
                color={activo ? "var(--brand-primary)" : "var(--text-tertiary)"}
                strokeWidth={activo ? 2.2 : 1.8}
              />
              <span
                className={activo ? "text-brand-primary" : "text-text-tertiary"}
                style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
