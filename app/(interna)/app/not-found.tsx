import type { Metadata } from "next";
import { NoEncontrada } from "@/components/app/NoEncontrada";

export const metadata: Metadata = { title: "Página no encontrada — Manos Creadoras" };

export default function NoEncontradaApp() {
  return <NoEncontrada volver={{ href: "/app", texto: "Volver a mis bolsos" }} />;
}
