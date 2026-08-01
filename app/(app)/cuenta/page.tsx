import { BadgeCheck, HelpCircle, LogOut, Mail, ShieldCheck, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import { ALUMNA, MODULOS, completados } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Mi cuenta — Manos Creadoras" };

export default function Cuenta() {
  return (
    <>
      <Reveal>
        <header>
          <h1
            className="font-display font-normal text-text-primary text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Mi cuenta
          </h1>
        </header>
      </Reveal>

      {/* OBJETO PRINCIPAL — estado de acceso */}
      <Reveal delay={0.06}>
        <section
          aria-label="Tu acceso"
          className="mt-6 rounded-xl border border-border-default bg-surface-primary p-5 text-center shadow-[var(--shadow-gold)]"
        >
          <div className="flex justify-center">
            <IconChip icon={BadgeCheck} size={52} />
          </div>
          <h2 className="font-display font-normal text-text-primary mt-3" style={{ fontSize: "var(--text-xl)" }}>
            Acceso de por vida
          </h2>
          <p className="text-text-secondary mt-1" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
            Programa completo · sin renovaciones ni cobros mensuales
          </p>
          <p className="text-text-tertiary mt-3 flex items-center justify-center gap-1.5" style={{ fontSize: "var(--text-xs)" }}>
            <Mail size={12} aria-hidden="true" /> marcela@correo.com
          </p>
        </section>
      </Reveal>

      {/* HITO — capa emocional (32/24), un logro que nunca se pierde */}
      <Reveal delay={0.12}>
        <section aria-label="Tu logro" className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconChip icon={Trophy} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
                {completados} módulos terminados
              </p>
              <p className="text-text-tertiary mt-0.5" style={{ fontSize: "var(--text-xs)" }}>
                Llevas {ALUMNA.desdeDias} días creando — te faltan {MODULOS.length - completados} para
                tu colección completa.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* AJUSTES */}
      <Reveal delay={0.18}>
        <section aria-label="Ajustes y ayuda" className="mt-8">
          <h2 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
            Ayuda y legal
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            <FilaEnlace href="/contacto" icon={HelpCircle} label="Escribirle a Manos Creadoras" />
            <FilaEnlace href="/terminos" icon={ShieldCheck} label="Términos y privacidad" />
            <FilaEnlace href="/reembolso" icon={ShieldCheck} label="Política de reembolso" />
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.24}>
        <Link
          href="/login"
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-text-secondary [touch-action:manipulation]"
          style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
        >
          <LogOut size={16} aria-hidden="true" /> Cerrar sesión
        </Link>
      </Reveal>
    </>
  );
}

function FilaEnlace({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof HelpCircle;
  label: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-3.5 shadow-sm [touch-action:manipulation]"
      >
        <Icon className="text-brand-primary shrink-0" size={17} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-text-primary" style={{ fontSize: "var(--text-sm)" }}>
          {label}
        </span>
      </Link>
    </li>
  );
}
