import Image from "next/image";
import { CountUp } from "@/components/app/CountUp";
import { Eyebrow } from "@/components/app/Eyebrow";
import { GoldButton } from "@/components/app/GoldButton";
import { Reveal } from "@/components/app/Reveal";

export function Hero() {
  return (
    <section className="relative">
      <div className="relative h-[70vh] w-full grain">
        <Image
          src="/images/bag-champagne-facetado.jpg"
          alt="Bolso de lujo en cuentas color champagne, tejido a mano"
          fill
          priority
          className="object-cover brightness-[.55]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(9,7,6,.1) 0%, rgba(9,7,6,.25) 45%, var(--surface-base) 96%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-8 max-w-3xl mx-auto md:px-8">
          <Reveal>
            <Eyebrow>Programa premium · Edición 2026</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <h1
              className="font-display font-normal text-text-primary mt-2"
              style={{ fontSize: "clamp(2.75rem, 9vw, 3.5rem)", lineHeight: "var(--leading-tight)" }}
            >
              Teje bolsos de lujo{" "}
              <em className="italic text-brand-primary">sin miedo a fallar</em>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-text-secondary mt-3 max-w-md" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
              El programa de bolsos en cuentas y malla plástica con <strong className="text-text-primary font-medium">el Ojo Experto</strong>: sube una foto de tu tejido y tu asistente de IA te dice qué ajustar, antes de que sea tarde.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-6 flex flex-col gap-4">
            <GoldButton href="#oferta">Quiero tejer sin miedo →</GoldButton>
            <p className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
              <span className="text-brand-primary tracking-wider">★★★★★</span>{" "}
              +<CountUp to={1200} /> alumnas · 4.9/5 · Garantía 7 días
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
