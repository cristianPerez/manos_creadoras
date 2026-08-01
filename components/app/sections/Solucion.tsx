import { Camera, Sparkles, ThumbsUp } from "lucide-react";
import { Eyebrow } from "@/components/app/Eyebrow";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";

const pasos = [
  {
    icon: Camera,
    n: "1",
    titulo: "Tejes tu paso",
    texto: "Avanzas con el video como siempre, a tu ritmo.",
  },
  {
    icon: Sparkles,
    n: "2",
    titulo: "Le sacas una foto",
    texto: "Antes de seguir, subes una foto de cómo va tu tejido.",
  },
  {
    icon: ThumbsUp,
    n: "3",
    titulo: "El Ojo Experto te responde",
    texto: "En segundos, tu asistente de IA te dice qué ajustar — antes de que sigas y sea tarde.",
  },
];

export function Solucion() {
  return (
    <section className="px-4 py-16 max-w-3xl mx-auto md:px-8">
      <Reveal className="text-center">
        <Eyebrow>El mecanismo</Eyebrow>
        <h2 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          No es que te falte talento — es que nadie te corregía a tiempo
        </h2>
        <p className="text-text-secondary mt-3 max-w-lg mx-auto" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
          <strong className="text-text-primary font-medium">El Ojo Experto</strong> es tu
          asistente de mentoría con IA, entrenado con el método boutique de Elizabeth: revisa
          tu tejido en cada paso, no solo al final.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {pasos.map((p, i) => (
          <Reveal key={p.titulo} delay={i * 0.08}>
            <div className="rounded-xl border border-border-default bg-surface-primary p-6 h-full shadow-sm">
              <div className="flex items-center gap-3">
                <IconChip icon={p.icon} size={40} />
                <span className="font-display text-brand-primary" style={{ fontSize: "var(--text-2xl)" }}>
                  {p.n}
                </span>
              </div>
              <h3 className="font-body font-semibold text-text-primary mt-4" style={{ fontSize: "var(--text-lg)" }}>
                {p.titulo}
              </h3>
              <p className="text-text-secondary mt-1" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
                {p.texto}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
