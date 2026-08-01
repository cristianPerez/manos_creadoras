import { Reveal } from "@/components/app/Reveal";

export function Agitacion() {
  return (
    <section className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Reveal>
        <div className="rounded-xl border border-border-default bg-surface-primary p-6 md:p-8 shadow-sm">
          <p className="text-text-secondary" style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-relaxed)" }}>
            Cada mes que sigues probando sola, gastas otra vez en cuentas y herrajes que
            terminan en la basura —{" "}
            <strong className="text-text-primary font-medium">
              entre $15 y $20 en materiales desperdiciados
            </strong>
            . En un año, son más de $200 tirados en intentos que no llegaron a nada.
          </p>
          <p className="text-text-secondary mt-4" style={{ fontSize: "var(--text-lg)", lineHeight: "var(--leading-relaxed)" }}>
            Y si nada cambia, en 6 meses vas a estar exactamente donde estás hoy —
            con más cuentas gastadas y el mismo bolso a medio terminar. No es que te
            falte talento: es que ningún tutorial suelto te dice{" "}
            <em className="font-display italic text-brand-primary">a mitad de camino</em>{" "}
            si vas bien o vas mal.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
