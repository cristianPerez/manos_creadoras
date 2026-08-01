import { Mail, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/app/AuthShell";
import { Eyebrow } from "@/components/app/Eyebrow";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";

export const metadata: Metadata = {
  title: "¡Bienvenida! — Manos Creadoras",
};

export default function Bienvenida() {
  return (
    <AuthShell>
      <Reveal className="text-center">
        <div className="flex justify-center">
          <div className="celebrate rounded-xl">
            <IconChip icon={PartyPopper} size={56} />
          </div>
        </div>
        <Eyebrow>Compra confirmada</Eyebrow>
        <h1 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          ¡Bienvenida a Manos Creadoras!
        </h1>
        <p className="text-text-secondary mt-3" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
          Ya eres parte de las alumnas que están creando su primera colección. Te mandamos un
          correo con tu acceso — puede tardar un par de minutos.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-8 rounded-xl border border-border-default bg-surface-primary p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Mail className="text-brand-primary shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-text-primary font-medium" style={{ fontSize: "var(--text-sm)" }}>
                Revisa tu correo (y la carpeta de spam)
              </p>
              <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}>
                Ahí te esperan tu primer video, el Ojo Experto y todos tus bonos — sin
                contraseñas que recordar.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="text-center text-text-tertiary mt-6" style={{ fontSize: "var(--text-xs)" }}>
          ¿No te llegó nada en unos minutos?{" "}
          <a href="/login" className="text-brand-primary">
            Pide tu acceso de nuevo
          </a>
        </p>
      </Reveal>
    </AuthShell>
  );
}
