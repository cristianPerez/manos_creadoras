import {
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
  CircleSlash,
  Clock3,
  FileText,
  HelpCircle,
  Lock,
  Mail,
  MessageCircle,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActivarAvisos } from "@/components/app/ActivarAvisos";
import { BotonCerrarSesion } from "@/components/app/BotonCerrarSesion";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import { PRECIO_ANUAL, PRECIO_MENSUAL } from "@/lib/config";
import { cargarCurso, type Alumna } from "@/lib/curso";

export const metadata: Metadata = { title: "Mi cuenta — Manos Creadoras" };

export default async function Cuenta() {
  const curso = await cargarCurso();
  /*
    `alumna` es null cuando no hay sesión. El middleware ya manda al login antes
    de llegar aquí, así que esto no debería pasar nunca — pero la comprobación se
    queda: el día que alguien saque `/cuenta` de la lista de privadas por error,
    lo que pasa es un redirect, no una pantalla rota enseñando "undefined".
  */
  if (!curso?.alumna) redirect("/login");

  const { alumna, completadas, totalLecciones, siguiente } = curso;
  const estado = estadoDeMembresia(alumna);

  return (
    <>
      <Reveal>
        <header>
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            MANOS CREADORAS · MEMBRESÍA
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
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

      {/* HITO — un logro que nunca se pierde. Es tappable de verdad (regla UX 11):
          antes se veía igual que las tarjetas-enlace y no hacía nada. */}
      <Reveal delay={0.12}>
        <Link
          href={siguiente ? `/cursos/${siguiente.id}` : "/cursos"}
          aria-label="Tu avance — ir a tus cursos"
          className="mt-6 flex items-center gap-3 rounded-xl border border-brand-primary/40 bg-surface-primary p-4 shadow-[var(--shadow-gold)] transition-transform active:scale-[0.99] [touch-action:manipulation]"
        >
          <IconChip icon={Trophy} size={52} />
          <div className="min-w-0 flex-1">
            <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
              {completadas === 0
                ? "Empieza aquí tu primer tutorial"
                : `${completadas} ${completadas === 1 ? "tutorial terminado" : "tutoriales terminados"}`}
            </p>
            <p className="text-text-tertiary mt-0.5" style={{ fontSize: "var(--text-xs)" }}>
              {completadas === 0
                ? "Empieza por el primer tutorial y márcalo al terminar."
                : `${alumna.diasEnPrograma !== null ? `Llevas ${dias(alumna.diasEnPrograma)} creando — t` : "T"}e faltan ${totalLecciones - completadas} para el programa completo.`}
            </p>
          </div>
          <ChevronRight size={16} className="text-brand-primary shrink-0" aria-hidden="true" />
        </Link>
      </Reveal>

      {/* AVISOS — el permiso se pide aquí, nunca de golpe al entrar */}
      <Reveal delay={0.15}>
        <ActivarAvisos />
      </Reveal>

      {/* AYUDA — lo que de verdad necesita rápido, arriba y separado de lo legal */}
      <Reveal delay={0.18}>
        <section aria-label="Ayuda" className="mt-8">
          <h2 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
            ¿Necesitas ayuda?
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            <FilaEnlace href="/contacto" icon={MessageCircle} label="Escribirle a Manos Creadoras" />
            <FilaEnlace href="/cancelar" icon={CircleSlash} label="Cómo cancelar mi membresía" />
          </ul>
        </section>
      </Reveal>

      <Reveal delay={0.22}>
        <section aria-label="Documentos legales" className="mt-8">
          <h2 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
            Legal
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            <FilaEnlace href="/terminos" icon={ShieldCheck} label="Términos del servicio" />
            <FilaEnlace href="/privacidad" icon={Lock} label="Privacidad de mis datos" />
            <FilaEnlace href="/reembolso" icon={FileText} label="Política de reembolso" />
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
  // El importe sale de la fuente única de precios: la alumna merece saber CUÁNTO se le
  // cobra sin salir de la app (es la pregunta #1 de cualquier suscripción).
  // Moneda explícita: la audiencia es MX/CO/PE/CL y "$199" significa cosas muy
  // distintas en cada país. El cobro de Hotmart es en dólares.
  const nombrePlan =
    a.plan === "anual"
      ? `Plan anual · USD ${PRECIO_ANUAL} al año`
      : a.plan === "mensual"
        ? `Plan mensual · USD ${PRECIO_MENSUAL} al mes`
        : "Membresía";

  switch (a.status) {
    case "active":
      return {
        icono: BadgeCheck,
        titulo: "Membresía activa",
        detalle: `${nombrePlan}, se renueva sola`,
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
        className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-3.5 shadow-sm transition-transform active:scale-[0.99] [touch-action:manipulation]"
      >
        <Icon className="text-brand-primary shrink-0" size={17} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-text-primary" style={{ fontSize: "var(--text-sm)" }}>
          {label}
        </span>
        <ChevronRight size={15} className="text-text-tertiary shrink-0" aria-hidden="true" />
      </Link>
    </li>
  );
}
