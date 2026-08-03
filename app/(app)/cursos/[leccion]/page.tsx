import { ArrowLeft, ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BotonCompletar } from "@/components/app/BotonCompletar";
import { ContenidoLeccion } from "@/components/app/ContenidoLeccion";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import { cargarCurso, ETIQUETA_TIPO, formatearDuracion } from "@/lib/curso";

type Props = { params: Promise<{ leccion: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leccion } = await params;
  const curso = await cargarCurso();
  const l = curso?.planas.find((x) => x.id === leccion);
  return { title: l ? `${l.titulo} — Manos Creadoras` : "Lección — Manos Creadoras" };
}

export default async function Leccion({ params }: Props) {
  const { leccion } = await params;
  const curso = await cargarCurso();
  if (!curso) redirect("/login");
  if (!curso.alumna.tieneAcceso) redirect("/cursos");

  const i = curso.planas.findIndex((x) => x.id === leccion);
  if (i === -1) notFound();

  const l = curso.planas[i];
  const seccion = curso.secciones.find((s) => s.id === l.seccionId);
  const siguiente = i < curso.planas.length - 1 ? curso.planas[i + 1] : null;
  const duracion = formatearDuracion(l.duracionSeg);

  return (
    <>
      <Reveal>
        <Link
          href="/cursos"
          className="inline-flex items-center gap-1.5 text-text-secondary p-2.5 -m-2.5"
          style={{ fontSize: "var(--text-sm)" }}
        >
          <ArrowLeft size={15} aria-hidden="true" /> Mis cursos
        </Link>
      </Reveal>

      <Reveal delay={0.06}>
        <header className="mt-6">
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            {seccion ? `${seccion.titulo.toUpperCase()} · ` : ""}
            {`LECCIÓN ${l.numero}`}
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-2xl)", lineHeight: "var(--leading-tight)" }}
          >
            {l.titulo}
          </h1>
          <p
            className="text-text-secondary mt-1 flex items-center gap-1.5"
            style={{ fontSize: "var(--text-sm)" }}
          >
            {duracion ? (
              <>
                <Clock size={13} aria-hidden="true" /> {duracion}
              </>
            ) : (
              ETIQUETA_TIPO[l.tipo]
            )}
          </p>
        </header>
      </Reveal>

      {/* Misma envoltura que en Mis cursos: la pieza protagonista conserva su elevación */}
      <Reveal delay={0.12}>
        <div className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]">
          <ContenidoLeccion tipo={l.tipo} hotmartId={l.hotmartId} titulo={l.titulo} />
        </div>
      </Reveal>

      <Reveal delay={0.18}>
        <BotonCompletar
          leccionId={l.id}
          completada={l.completada}
          siguiente={siguiente ? { id: siguiente.id, titulo: siguiente.titulo } : null}
        />
      </Reveal>

      {/* Puente al diferenciador: la duda se resuelve donde aparece */}
      <Reveal delay={0.22}>
        <Link
          href="/ojo-experto"
          className="mt-6 flex items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm [touch-action:manipulation]"
        >
          <IconChip icon={Sparkles} size={44} />
          <span className="min-w-0 flex-1">
            <span className="block text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
              ¿Se te complicó este paso?
            </span>
            <span
              className="mt-0.5 block text-text-tertiary"
              style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
            >
              Súbele una foto al Ojo Experto y te dice qué ajustar.
            </span>
          </span>
          <ArrowRight size={16} className="text-brand-primary shrink-0" aria-hidden="true" />
        </Link>
      </Reveal>

      {/* Resto de la sección: cambiar de lección sin volver a la lista */}
      {seccion && seccion.lecciones.length > 1 && (
        <Reveal delay={0.26}>
          <section aria-label={`Más de ${seccion.titulo}`} className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-text-primary min-w-0" style={{ fontSize: "var(--text-lg)" }}>
                Más de {seccion.titulo}
              </h2>
              <span className="text-text-tertiary shrink-0 cifra" style={{ fontSize: "var(--text-xs)" }}>
                {seccion.completadas}/{seccion.lecciones.length}
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {seccion.lecciones.map((otra) => {
                const esEsta = otra.id === l.id;
                const dur = formatearDuracion(otra.duracionSeg);
                return (
                  <li key={otra.id}>
                    <Link
                      href={`/cursos/${otra.id}`}
                      aria-current={esEsta ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 shadow-sm transition-transform active:scale-[0.99] [touch-action:manipulation] ${
                        esEsta
                          ? "border-brand-primary/60 bg-brand-primary-soft"
                          : "border-border-default bg-surface-primary"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          otra.completada
                            ? "bg-brand-primary-soft text-brand-primary"
                            : "bg-surface-tertiary text-text-tertiary"
                        }`}
                      >
                        {otra.completada ? <Check size={15} strokeWidth={2.5} /> : <span className="cifra" style={{ fontSize: "var(--text-xs)" }}>{otra.numero}</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block line-clamp-2 text-text-primary"
                          style={{ fontSize: "var(--text-sm)", fontWeight: esEsta ? 600 : 500 }}
                        >
                          {otra.titulo}
                        </span>
                        <span className="mt-0.5 block text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
                          {esEsta ? "Vas aquí" : (dur ?? ETIQUETA_TIPO[otra.tipo])}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </Reveal>
      )}

    </>
  );
}
