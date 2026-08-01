"use client";

import { GraduationCap, Sparkles, UserRound } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/cursos", label: "Mis cursos", icono: GraduationCap },
  { href: "/ojo-experto", label: "Ojo Experto", icono: Sparkles },
  { href: "/cuenta", label: "Mi cuenta", icono: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

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
              className="relative flex min-w-16 flex-1 flex-col items-center justify-center gap-1 [touch-action:manipulation]"
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
                style={{ fontSize: "11px", fontWeight: 500 }}
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
