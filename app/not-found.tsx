import type { Metadata } from "next";
import { NoEncontrada } from "@/components/app/NoEncontrada";

export const metadata: Metadata = { title: "Página no encontrada — Manos Creadoras" };

export default function NoEncontradaSitio() {
  return (
    <div className="bg-cream flex min-h-dvh">
      <NoEncontrada volver={{ href: "/", texto: "Ir al inicio" }} />
    </div>
  );
}
