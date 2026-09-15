"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { IconChip } from "@/components/app/IconChip";
import { reportarFallo } from "@/lib/fallos";

/**
 * Error Boundary de la app interna: si algo revienta, la alumna ve un mensaje humano
 * con salida — nunca una pantalla en blanco (regla de UX del SO).
 */
export default function ErrorApp({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /*
    ⚠️ ESTA PANTALLA YA EXISTÍA PERO NO REPORTABA NADA (2026-09-15). Le enseñaba
    a la alumna un mensaje amable y el fallo se perdía: nadie se enteraba nunca
    de que su app se había roto. Un error boundary sin registro convierte cada
    fallo en un cliente molesto y cero información para arreglarlo.

    ⚠️ Se manda el `digest` —el código que Next genera para cruzar este fallo con
    el registro del servidor— y NO el mensaje del error, que puede llevar dentro
    datos de la persona.
  */
  useEffect(() => {
    reportarFallo("navegador", "una pantalla de la app reventó", {
      digest: error.digest ?? "sin-digest",
    });
  }, [error]);

  return (
    <section className="mt-10 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
      <div className="flex justify-center">
        <IconChip icon={RefreshCw} size={52} />
      </div>
      <h1
        className="font-display font-normal text-text-primary mt-3"
        style={{ fontSize: "var(--text-2xl)" }}
      >
        Algo se nos trabó
      </h1>
      <p
        className="text-text-secondary mt-2"
        style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
      >
        No pudimos cargar esta parte. No perdiste nada de tu avance — vuelve a intentar y
        normalmente entra a la primera.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
          fontSize: "var(--text-sm)",
        }}
      >
        <RefreshCw size={16} aria-hidden="true" /> Volver a intentar
      </button>

      <p className="mt-4">
        <Link href="/contacto" className="text-brand-primary" style={{ fontSize: "var(--text-xs)" }}>
          Sigue fallando — quiero avisarles
        </Link>
      </p>
    </section>
  );
}
