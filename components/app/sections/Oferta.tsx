import { Check, Lock, Sparkles } from "lucide-react";
import { Eyebrow } from "@/components/app/Eyebrow";
import { GoldButton } from "@/components/app/GoldButton";
import { Reveal } from "@/components/app/Reveal";
import {
  CHECKOUT_ANUAL,
  CHECKOUT_MENSUAL,
  MESES_GRATIS_ANUAL,
  PRECIO_ANUAL,
  PRECIO_ANUAL_POR_MES,
  PRECIO_MENSUAL,
} from "@/lib/config";

const incluye = [
  "El Ojo Experto: tu mentora de IA, 24/7",
  "+50 tutoriales paso a paso (bolsos en cuentas y malla plástica)",
  "50 patrones exclusivos descargables",
  "Directorio de proveedores premium",
  "Plantilla de costos y precios",
  "Método de ventas boutique",
  "Comunidad privada de alumnas",
  "Modelos nuevos cada mes",
];

export function Oferta() {
  return (
    <section id="oferta" className="px-4 py-16 max-w-lg mx-auto md:px-8">
      <Reveal className="text-center">
        <Eyebrow>Tu membresía</Eyebrow>
        <h2 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          Elige cómo quieres empezar
        </h2>
        <p className="text-text-secondary mt-3" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
          Todo el programa, el Ojo Experto y los modelos nuevos de cada mes — en un solo lugar.
        </p>
      </Reveal>

      {/* PLAN ANUAL — el recomendado */}
      <Reveal delay={0.08} className="mt-8">
        <div
          className="rounded-xl"
          style={{
            border: "1px solid transparent",
            backgroundImage:
              "linear-gradient(var(--surface-primary), var(--surface-primary)), linear-gradient(135deg, var(--brand-gradient-start), transparent 40%, var(--brand-gradient-end))",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <div className="rounded-xl bg-surface-primary p-6 md:p-8 shadow-[var(--shadow-gold)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-text-primary font-medium" style={{ fontSize: "var(--text-lg)" }}>
                Plan anual
              </p>
              <span
                className="rounded-lg px-2.5 py-1 text-text-inverse"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  backgroundImage:
                    "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                }}
              >
                {MESES_GRATIS_ANUAL} MESES GRATIS
              </span>
            </div>

            <p className="font-display text-text-primary mt-3 tabular" style={{ fontSize: "var(--text-4xl)", lineHeight: 1 }}>
              ${PRECIO_ANUAL_POR_MES}
              <span className="font-body text-text-secondary" style={{ fontSize: "var(--text-lg)" }}>
                {" "}/mes
              </span>
            </p>
            <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
              Se cobra ${PRECIO_ANUAL} una vez al año · cancela cuando quieras
            </p>

            <GoldButton href={CHECKOUT_ANUAL} plan="anual" className="mt-6 w-full">
              Empezar con el plan anual →
            </GoldButton>
          </div>
        </div>
      </Reveal>

      {/* PLAN MENSUAL */}
      <Reveal delay={0.12} className="mt-4">
        <div className="rounded-xl border border-border-default bg-surface-primary p-6 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-text-primary font-medium" style={{ fontSize: "var(--text-lg)" }}>
              Plan mensual
            </p>
            <p className="font-display text-text-primary tabular" style={{ fontSize: "var(--text-2xl)" }}>
              ${PRECIO_MENSUAL}
              <span className="font-body text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
                {" "}/mes
              </span>
            </p>
          </div>
          <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
            Sin permanencia · cancela cuando quieras
          </p>
          <GoldButton href={CHECKOUT_MENSUAL} plan="mensual" variant="secondary" className="mt-5 w-full">
            Empezar mes a mes
          </GoldButton>
        </div>
      </Reveal>

      {/* QUÉ INCLUYE — igual en los dos planes */}
      <Reveal delay={0.16} className="mt-6">
        <div className="rounded-xl border border-border-default bg-surface-primary p-6 shadow-sm">
          <p className="text-text-secondary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
            Los dos planes incluyen todo:
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {incluye.map((item, i) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft">
                  {i === 0 ? (
                    <Sparkles className="text-brand-primary" size={11} strokeWidth={2.5} />
                  ) : (
                    <Check className="text-brand-primary" size={12} strokeWidth={3} />
                  )}
                </span>
                <span
                  className={i === 0 ? "flex-1 text-text-primary font-medium" : "flex-1 text-text-secondary"}
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-text-tertiary mt-5 flex items-center justify-center gap-1.5" style={{ fontSize: "var(--text-xs)" }}>
            <Lock size={12} /> Pago seguro vía Hotmart · Garantía de 7 días
          </p>
        </div>
      </Reveal>
    </section>
  );
}
