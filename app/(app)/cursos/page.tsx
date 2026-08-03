import { Check, Clock, FileText, Link2, Play, ScrollText, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarraProgreso } from "@/components/app/BarraProgreso";
import { ContenidoLeccion } from "@/components/app/ContenidoLeccion";
import { CountUp } from "@/components/app/CountUp";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import {
  cargarCurso,
  formatearDuracion,
  primerNombre,
  type Leccion,
  type TipoLeccion,
} from "@/lib/curso";

export const metadata: Metadata = { title: "Mis cursos — Manos Creadoras" };

const ICONO_TIPO: Record<TipoLeccion, typeof Play> = {
  video: Play,
  pdf: FileText,
  enlace: Link2,
  texto: ScrollText,
};

export default async function Cursos() {
  const curso = await cargarCurso();
  if (!curso) redirect("/login");

  const { alumna, secciones, completadas, totalLecciones, pct, siguiente } = curso;

  if (!alumna.tieneAcceso) return <MembresiaInactiva />;

  const arrancando = completadas === 0;

  return (
    <>
      <Reveal>
        <header>
          {alumna.diasEnPrograma !== null && (
            <p className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
              Día {alumna.diasEnPrograma} en el programa
            </p>
          )}
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Hola, {primerNombre(alumna)}
          </h1>
        </header>
      </Reveal>

      {/* OBJETO PRINCIPAL — retomar donde quedó */}
      <Reveal delay={0.06}>
        {siguiente ? (
          <section
            aria-label="Continuar el curso"
            className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]"
          >
            <ContenidoLeccion
              tipo={siguiente.tipo}
              hotmartId={siguiente.hotmartId}
              titulo={siguiente.titulo}
            />
            <p
              className="text-brand-primary mt-4"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
            >
              {arrancando ? "EMPIEZA AQUÍ" : "SIGUES AQUÍ"}
            </p>
            <h2
              className="font-display font-normal text-text-primary mt-1 text-balance"
              style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
            >
              {siguiente.titulo}
            </h2>
            <SubtituloLeccion leccion={siguiente} />

            <Link
              href={`/cursos/${siguiente.id}`}
              className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                fontSize: "var(--text-base)",
              }}
            >
              <Play size={18} aria-hidden="true" />
              {arrancando ? "Empezar" : "Seguir tejiendo"}
            </Link>
          </section>
        ) : (
          <section
            aria-label="Programa completo"
            className="mt-6 rounded-xl border border-border-default bg-surface-primary p-5 text-center shadow-[var(--shadow-gold)]"
          >
            <div className="celebrate flex justify-center">
              <IconChip icon={Sparkles} size={52} />
            </div>
            <h2 className="font-display font-normal text-text-primary mt-3" style={{ fontSize: "var(--text-xl)" }}>
              Terminaste todo el programa
            </h2>
            <p className="text-text-secondary mt-1" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
              Cada mes se suman modelos nuevos a tu membresía — te avisamos cuando lleguen.
            </p>
          </section>
        )}
      </Reveal>

      {/* PROGRESO */}
      <Reveal delay={0.12}>
        <section aria-label="Tu avance" className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
              Tu avance
            </p>
            <p className="font-display text-text-primary" style={{ fontSize: "var(--text-xl)" }}>
              <CountUp to={completadas} duration={600} />
              <span className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
                {" "}
                de {totalLecciones} lecciones
              </span>
            </p>
          </div>
          <div className="mt-3">
            <BarraProgreso pct={pct} label={`${pct}% del programa completado`} />
          </div>
          <p className="text-text-tertiary mt-2" style={{ fontSize: "var(--text-xs)" }}>
            {completadas === 0
              ? "Marca cada lección al terminarla y verás crecer tu avance."
              : `Te faltan ${totalLecciones - completadas} para terminar el programa.`}
          </p>
        </section>
      </Reveal>

      {/* SECCIONES */}
      {secciones.map((s, i) => (
        <Reveal key={s.id} delay={0.18 + i * 0.04}>
          <section aria-label={s.titulo} className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-text-primary min-w-0" style={{ fontSize: "var(--text-lg)" }}>
                {s.numero}. {s.titulo}
              </h2>
              {s.lecciones.length > 0 && (
                <span className="text-text-tertiary shrink-0 tabular" style={{ fontSize: "var(--text-xs)" }}>
                  {s.completadas}/{s.lecciones.length}
                </span>
              )}
            </div>

            {!s.cuentaProgreso && (
              <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
                Bienvenida y recursos — no cuenta para tu avance.
              </p>
            )}

            {s.lecciones.length === 0 ? (
              <p
                className="mt-3 rounded-xl border border-dashed border-border-strong bg-surface-primary px-4 py-6 text-center text-text-tertiary"
                style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
              >
                Estamos subiendo estas lecciones a la app. Mientras tanto las tienes en tu área de
                Hotmart.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {s.lecciones.map((l) => (
                  <li key={l.id}>
                    <FilaLeccion leccion={l} esSiguiente={l.id === siguiente?.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      ))}

      <Reveal delay={0.34}>
        <p className="mt-8 text-center text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
          Avanzas a tu ritmo — y cada mes se suman modelos nuevos a tu membresía.
        </p>
      </Reveal>
    </>
  );
}

function SubtituloLeccion({ leccion }: { leccion: Leccion }) {
  const duracion = formatearDuracion(leccion.duracionSeg);
  if (!duracion) return null;
  return (
    <p className="text-text-secondary mt-1 flex items-center gap-1.5" style={{ fontSize: "var(--text-sm)" }}>
      <Clock size={13} aria-hidden="true" /> {duracion}
    </p>
  );
}

function FilaLeccion({ leccion, esSiguiente }: { leccion: Leccion; esSiguiente: boolean }) {
  const Icono = ICONO_TIPO[leccion.tipo];
  const duracion = formatearDuracion(leccion.duracionSeg);

  return (
    <Link
      href={`/cursos/${leccion.id}`}
      className="flex w-full items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-3 text-left shadow-sm transition-transform active:scale-[0.99] [touch-action:manipulation]"
    >
      <span
        aria-hidden="true"
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
          leccion.completada
            ? "bg-status-success/15 text-status-success"
            : esSiguiente
              ? "bg-brand-primary-soft text-brand-primary"
              : "bg-surface-tertiary text-text-tertiary"
        }`}
      >
        {leccion.completada ? <Check size={16} strokeWidth={2.5} /> : <Icono size={15} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block line-clamp-2 text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
          {leccion.numero}. {leccion.titulo}
        </span>
        <span className="mt-0.5 block text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
          {duracion ?? ETIQUETA_CORTA[leccion.tipo]}
        </span>
      </span>

      {(leccion.completada || esSiguiente) && (
        <span
          className={`inline-flex w-fit shrink-0 items-center rounded-lg px-2 py-1 ${
            leccion.completada
              ? "bg-status-success/15 text-status-success"
              : "bg-brand-primary-soft text-brand-primary"
          }`}
          style={{ fontSize: "11px", fontWeight: 500 }}
        >
          {leccion.completada ? "Listo" : "Vas aquí"}
        </span>
      )}
    </Link>
  );
}

const ETIQUETA_CORTA: Record<TipoLeccion, string> = {
  video: "Video",
  pdf: "PDF de patrones",
  enlace: "Enlace",
  texto: "Lectura",
};

function MembresiaInactiva() {
  return (
    <Reveal>
      <section className="mt-10 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
        <h1 className="font-display font-normal text-text-primary" style={{ fontSize: "var(--text-2xl)" }}>
          Tu membresía no está activa
        </h1>
        <p className="text-text-secondary mt-2" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
          Por eso no podemos mostrarte las lecciones. Si crees que es un error, escríbenos y lo
          revisamos contigo — normalmente se resuelve el mismo día.
        </p>
        <Link
          href="/contacto"
          className="mt-5 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-text-inverse [touch-action:manipulation]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
            fontSize: "var(--text-sm)",
          }}
        >
          Escribirle a Manos Creadoras
        </Link>
      </section>
    </Reveal>
  );
}
