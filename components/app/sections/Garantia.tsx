import { ShieldCheck } from "lucide-react";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";

export function Garantia() {
  return (
    <section className="px-4 py-16 max-w-lg mx-auto md:px-8">
      <Reveal>
        <div className="rounded-xl border border-border-default bg-surface-primary p-6 md:p-8 text-center shadow-sm">
          <div className="flex justify-center">
            <IconChip icon={ShieldCheck} size={52} />
          </div>
          <h2 className="font-display font-normal text-text-primary mt-4" style={{ fontSize: "var(--text-2xl)" }}>
            La Garantía del Primer Bolso Bien Hecho
          </h2>
          <p className="text-text-secondary mt-3" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
            Si en 7 días no lograste tejer tu primer bolso con acabado firme siguiendo el
            método, nos escribes y te devolvemos el 100% — sin preguntas, sin formularios. Y
            los patrones y bonos son tuyos igual.
          </p>
          <p className="text-text-tertiary mt-3" style={{ fontSize: "var(--text-xs)" }}>
            Procesado directamente por Hotmart.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
