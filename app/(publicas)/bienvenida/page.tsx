import { Mail, MousePointerClick, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "¡Bienvenida! — Manos Creadoras",
  robots: { index: false },
};

const PASOS = [
  { Icono: Mail, titulo: "Revisa tu correo", texto: "Te mandamos el enlace de acceso al correo con el que pagaste." },
  { Icono: MousePointerClick, titulo: "Abre el enlace", texto: "Con eso entras. No hay contraseña que recordar." },
  { Icono: ShoppingBag, titulo: "Elige tu primer bolso", texto: "Te recomendamos empezar por Cristal Brillante." },
];

export default function Bienvenida() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow">Ya estás dentro</p>
        <h1 className="titulo-seccion mt-2 text-balance">Bienvenida a Manos Creadoras</h1>
        <p className="text-ink-body mt-3">Te faltan tres pasos para empezar a tejer.</p>

        <ol className="mt-10 flex flex-col gap-4 text-left">
          {PASOS.map(({ Icono, titulo, texto }, i) => (
            <li
              key={titulo}
              className="bg-ivory border-line flex items-start gap-4 rounded-[var(--radius-lg)] border p-5"
            >
              <span
                aria-hidden="true"
                className="bg-espresso text-gold-light flex size-10 shrink-0 items-center justify-center rounded-full"
              >
                <Icono size={18} />
              </span>
              <span>
                <span className="text-espresso block font-semibold">
                  {i + 1}. {titulo}
                </span>
                <span className="text-ink-body block text-sm">{texto}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="text-ink-muted mt-8 text-sm">
          ¿No te llegó?{" "}
          <Link href="/entrar" className="text-gold font-semibold underline">
            Pide tu acceso de nuevo
          </Link>
        </p>
      </div>
    </main>
  );
}
