import { Info, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ConsultaOjoExperto } from "@/components/app/ConsultaOjoExperto";
import { Reveal } from "@/components/app/Reveal";
import { cargarOjoExperto } from "@/lib/ojo-experto";

export const metadata: Metadata = { title: "El Ojo Experto — Manos Creadoras" };

export default async function OjoExperto() {
  // `cargarOjoExperto` ya nunca devuelve null: sin sesión trae el estado de
  // visitante (cupo `regalo`), porque la pantalla es la misma para todos.
  const estado = await cargarOjoExperto();
  if (!estado) return null;

  return (
    <>
      <Reveal>
        <header>
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            TU MENTORA DE BOLSILLO
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            El Ojo Experto
          </h1>
          <p
            className="text-text-secondary mt-2"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            Sube una foto de tu tejido o cuéntame qué se te complica — te digo qué ajustar antes de
            que sigas.
          </p>
        </header>
      </Reveal>

      {/*
        ⚠️ AQUÍ HABÍA UNA PANTALLA APARTE PARA VISITANTES (`MuroDeCortesia`) con
        un ejemplo de conversación y un botón de desbloqueo. Se quitó el
        2026-09-15 a pedido de Cristian, y la razón es buena: enseñarle a alguien
        un EJEMPLO de lo que hace el producto le obliga a imaginárselo. Ahora ve
        el producto de verdad —su caja, su medidor, su botón— y la cuenta se le
        pide en el segundo en que va a usarlo, con su duda ya escrita.

        La pantalla es LA MISMA para las tres situaciones. Lo único que cambia:
          · sin cuenta  → al enviar aparece el muro (dentro del propio chat)
          · con cuenta  → 3 consultas al mes
          · con programa→ 40
      */}
      {estado.sinCuenta ? null : !estado.tieneAcceso ? (
        <Reveal delay={0.06}>
          <section className="mt-6 flex items-start gap-3 rounded-xl border border-brand-primary/35 bg-brand-primary-soft p-4">
            <Sparkles size={18} className="text-brand-primary mt-0.5 shrink-0" aria-hidden="true" />
            <p
              className="text-text-secondary min-w-0"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              Tienes{" "}
              <span className="text-text-primary cifra" style={{ fontWeight: 600 }}>
                {estado.cupo.preguntas}
              </span>{" "}
              consultas al mes con tu cuenta. Con el programa completo son{" "}
              <span className="cifra">{estado.cupoMiembro.preguntas}</span> al mes y{" "}
              <Link href="/" className="text-brand-primary underline underline-offset-4">
                todos los tutoriales
              </Link>
              .
            </p>
          </section>
        </Reveal>
      ) : null}

      <ConsultaOjoExperto
        historialInicial={estado.historial}
        usoInicial={estado.uso}
        cupo={estado.cupo}
        sinCuenta={estado.sinCuenta}
      />

      <Reveal delay={0.24}>
        <p
          className="mt-6 flex items-start gap-2 text-text-tertiary"
          style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
        >
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          El Ojo Experto es orientación con inteligencia artificial, no una revisión humana — puede
          equivocarse. Tu criterio y el método del curso mandan.
        </p>
      </Reveal>
    </>
  );
}
