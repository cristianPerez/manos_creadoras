import {
  AlertTriangle,
  BadgeCheck,
  CircleSlash,
  Clock3,
  HelpCircle,
  Mail,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotonCerrarSesion } from "@/components/app/BotonCerrarSesion";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import { cargarCurso, type Alumna } from "@/lib/curso";

export const metadata: Metadata = { title: "Mi cuenta — Manos Creadoras" };

export default async function Cuenta() {
  const curso = await cargarCurso();
  if (!curso) redirect("/login");

  const { alumna, completadas, totalLecciones } = curso;
  const estado = estadoDeMembresia(alumna);

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
            <IconChip icon={estado.icono} size={52} />
          </div>
          <h2 className="font-display font-normal text-text-primary mt-3" style={{ fontSize: "var(--text-xl)" }}>
            {estado.titulo}
          </h2>
          <p
            className="text-text-secondary mt-1"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            {estado.detalle}
          </p>
          {estado.accion && (
            <Link
              href={estado.accion.href}
              className="mt-4 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-text-inverse [touch-action:manipulation]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                fontSize: "var(--text-sm)",
              }}
            >
              {estado.accion.label}
            </Link>
          )}
          {estado.pie && (
            <p className="text-text-tertiary mt-3" style={{ fontSize: "var(--text-xs)" }}>
              {estado.pie}
            </p>
          )}
          <p
            className="text-text-tertiary mt-1.5 flex items-center justify-center gap-1.5"
            style={{ fontSize: "var(--text-xs)" }}
          >
            <Mail size={12} aria-hidden="true" />
            <span className="min-w-0 truncate">{alumna.email}</span>
          </p>
        </section>
      </Reveal>

      {/* HITO — un logro que nunca se pierde */}
      <Reveal delay={0.12}>
        <section aria-label="Tu logro" className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconChip icon={Trophy} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
                {completadas === 0
                  ? "Tu primera lección te espera"
                  : `${completadas} ${completadas === 1 ? "lección terminada" : "lecciones terminadas"}`}
              </p>
              <p className="text-text-tertiary mt-0.5" style={{ fontSize: "var(--text-xs)" }}>
                {completadas === 0
                  ? "Empieza por el primer tutorial y márcalo al terminar."
                  : `${alumna.diasEnPrograma !== null ? `Llevas ${dias(alumna.diasEnPrograma)} creando — t` : "T"}e faltan ${totalLecciones - completadas} para el programa completo.`}
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
            <FilaEnlace href="/cancelar" icon={CircleSlash} label="Cómo cancelar mi membresía" />
            <FilaEnlace href="/contacto" icon={HelpCircle} label="Escribirle a Manos Creadoras" />
            <FilaEnlace href="/terminos" icon={ShieldCheck} label="Términos y privacidad" />
            <FilaEnlace href="/reembolso" icon={ShieldCheck} label="Política de reembolso" />
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.24}>
        <BotonCerrarSesion />
      </Reveal>
    </>
  );
}

type EstadoMembresia = {
  icono: typeof BadgeCheck;
  titulo: string;
  detalle: string;
  /** Línea chica de contexto (ej. desde cuándo es miembro). */
  pie?: string;
  accion?: { href: string; label: string };
};

/**
 * Traduce el estado técnico de la membresía a algo que la alumna entienda,
 * y cuando algo va mal le dice QUÉ HACER (no solo qué pasó).
 */
function estadoDeMembresia(a: Alumna): EstadoMembresia {
  const nombrePlan = a.plan === "anual" ? "Plan anual" : a.plan === "mensual" ? "Plan mensual" : "Membresía";

  switch (a.status) {
    case "active":
      return {
        icono: BadgeCheck,
        titulo: "Membresía activa",
        detalle: `${nombrePlan} · se renueva automáticamente`,
        pie: a.primerPagoEn ? `Miembro desde el ${fecha(a.primerPagoEn)}` : undefined,
      };

    case "past_due":
      return {
        icono: AlertTriangle,
        titulo: "No pudimos cobrar tu renovación",
        detalle:
          "Sigues con acceso unos días. Actualiza tu tarjeta en Hotmart y todo vuelve a la normalidad — te llegó un correo con el enlace.",
        accion: { href: "/contacto", label: "Necesito ayuda" },
      };

    case "cancelled":
      return {
        icono: Clock3,
        titulo: "Membresía cancelada",
        detalle: a.accessUntil
          ? `Conservas todo tu acceso hasta el ${fecha(a.accessUntil)}. Después de esa fecha las lecciones se cierran.`
          : "Tu acceso se cierra al terminar el período que ya pagaste.",
        accion: { href: "/contacto", label: "Quiero volver" },
      };

    case "expired":
      return {
        icono: CircleSlash,
        titulo: "Tu acceso terminó",
        detalle: "Puedes volver cuando quieras y retomas justo donde lo dejaste — guardamos tu avance.",
        accion: { href: "/contacto", label: "Quiero volver" },
      };

    default:
      // refunded · chargeback
      return {
        icono: CircleSlash,
        titulo: "Sin acceso al programa",
        detalle:
          "Si crees que es un error, escríbenos y lo revisamos contigo — normalmente se resuelve el mismo día.",
        accion: { href: "/contacto", label: "Escribirnos" },
      };
  }
}

function dias(n: number): string {
  return n === 1 ? "1 día" : `${n} días`;
}

function fecha(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
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
