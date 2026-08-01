import { GoldButton } from "@/components/app/GoldButton";
import { Reveal } from "@/components/app/Reveal";

export function CtaFinal() {
  return (
    <section className="px-4 py-16 max-w-lg mx-auto md:px-8 text-center">
      <Reveal>
        <p className="font-display italic text-brand-primary" style={{ fontSize: "var(--text-xl)" }}>
          Imagínate mostrando tu primer bolso terminado
        </p>
        <h2 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          Con ese brillo de boutique — y que te pregunten &ldquo;¿dónde lo compraste?&rdquo;
        </h2>
        <p className="text-text-secondary mt-4" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
          Esa es la mujer en la que te conviertes cuando dejas de intentarlo sola. $25 hoy,
          acceso de por vida, con el Ojo Experto guiándote y la Garantía del Primer Bolso Bien
          Hecho respaldándote.
        </p>
        <GoldButton href="#oferta" className="mt-6">
          Quiero tejer sin miedo →
        </GoldButton>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="text-text-tertiary text-left mt-10 border-t border-border-default pt-6" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)" }}>
          <strong className="text-text-secondary">PS:</strong> Manos Creadoras te lleva de
          tejer a ciegas a crear bolsos de boutique, con el Ojo Experto revisando cada paso.
          Hoy entras por $25 (antes $55), acceso de por vida, con los 50 patrones y el método
          de ventas incluidos — y la Garantía del Primer Bolso Bien Hecho.
        </p>
      </Reveal>
    </section>
  );
}
