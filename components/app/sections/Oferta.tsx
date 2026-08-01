import { Check, Lock } from "lucide-react";
import { Eyebrow } from "@/components/app/Eyebrow";
import { GoldButton } from "@/components/app/GoldButton";
import { Reveal } from "@/components/app/Reveal";
import { CHECKOUT_URL } from "@/lib/config";

const stack = [
  { item: "Curso de bolsos en cuentas + malla plástica (+50 tutoriales)", valor: 97 },
  { item: "50 patrones exclusivos descargables", valor: 45 },
  { item: "Directorio de proveedores premium", valor: 29 },
  { item: "Plantilla de costos y precios", valor: 19 },
  { item: "Método de ventas boutique", valor: 39 },
  { item: "Comunidad privada de alumnas", valor: 25 },
];

const total = stack.reduce((acc, s) => acc + s.valor, 0);

export function Oferta() {
  return (
    <section id="oferta" className="px-4 py-16 max-w-lg mx-auto md:px-8">
      <Reveal className="text-center">
        <Eyebrow>La oferta</Eyebrow>
        <h2 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          Todo lo que recibes hoy
        </h2>
      </Reveal>

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
            <ul className="flex flex-col gap-3">
              {stack.map((s) => (
                <li key={s.item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft">
                    <Check className="text-brand-primary" size={12} strokeWidth={3} />
                  </span>
                  <span className="flex-1 text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
                    {s.item}
                  </span>
                  <span className="text-text-tertiary tabular" style={{ fontSize: "var(--text-sm)" }}>
                    ${s.valor}
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft">
                  <Check className="text-brand-primary" size={12} strokeWidth={3} />
                </span>
                <span className="flex-1 text-text-primary font-medium" style={{ fontSize: "var(--text-sm)" }}>
                  El Ojo Experto — tu asistente de mentoría con IA
                </span>
                <span className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
                  incluido
                </span>
              </li>
            </ul>

            <div className="mt-6 border-t border-border-default pt-6 text-center">
              <p className="text-text-tertiary tabular" style={{ fontSize: "var(--text-sm)" }}>
                Valor total: <span className="line-through">${total}</span>
              </p>
              <p className="font-display text-text-primary mt-1 tabular" style={{ fontSize: "var(--text-4xl)" }}>
                $25{" "}
                <span className="font-body text-text-tertiary line-through" style={{ fontSize: "var(--text-lg)" }}>
                  $55
                </span>
              </p>
              <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
                Pago único · acceso de por vida
              </p>
              <GoldButton href={CHECKOUT_URL} className="mt-6 w-full">
                Quiero acceder ahora →
              </GoldButton>
              <p className="text-text-tertiary mt-3 flex items-center justify-center gap-1.5" style={{ fontSize: "var(--text-xs)" }}>
                <Lock size={12} /> Pago seguro vía Hotmart · Garantía de 7 días
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
