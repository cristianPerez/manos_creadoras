import { AppCarousel } from "@/components/app/AppCarousel";
import { CountUp } from "@/components/app/CountUp";
import { Eyebrow } from "@/components/app/Eyebrow";
import { Reveal } from "@/components/app/Reveal";

export function AppPorDentro() {
  return (
    <section className="px-4 py-16 max-w-3xl mx-auto md:px-8 text-center">
      <Reveal>
        <Eyebrow>Tu app de Manos Creadoras</Eyebrow>
        <h2 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          Así se ve por dentro
        </h2>
        <p className="text-text-secondary mt-3 max-w-md mx-auto" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
          Tus cursos, el Ojo Experto y todos los modelos, en un solo lugar — en tu celular.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <AppCarousel />
      </Reveal>

      <Reveal delay={0.16} className="mt-10">
        <p className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
          <span className="text-brand-primary tracking-wider">★★★★★</span> Más de{" "}
          <CountUp to={1200} /> alumnas ya crearon su primera colección — 4.9/5 de valoración.
        </p>
      </Reveal>
    </section>
  );
}
