import { CircleOff, HelpCircle, Video, Wallet } from "lucide-react";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";

const dolores = [
  {
    icon: CircleOff,
    texto: "¿Te pasa que tus bolsos no se ven profesionales — se nota que los hiciste tú?",
  },
  {
    icon: HelpCircle,
    texto: "¿No sabes qué materiales comprar, ni a quién comprárselos?",
  },
  {
    icon: Video,
    texto: "¿Empezaste un tutorial de YouTube y a la mitad te perdiste porque saltó un paso?",
  },
  {
    icon: Wallet,
    texto: "¿Ya gastaste plata en cuentas y herrajes que terminaste tirando?",
  },
];

export function Problema() {
  return (
    <section className="px-4 py-16 max-w-3xl mx-auto md:px-8">
      <Reveal>
        <h2 className="font-display font-normal text-text-primary text-center" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          ¿Te suena familiar?
        </h2>
      </Reveal>
      <div className="mt-8 flex flex-col gap-4">
        {dolores.map((d, i) => (
          <Reveal key={d.texto} delay={i * 0.06}>
            <div className="flex items-center gap-4 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
              <IconChip icon={d.icon} />
              <p className="text-text-secondary" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
                {d.texto}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
