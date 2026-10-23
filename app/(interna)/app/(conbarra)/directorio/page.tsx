import type { Metadata } from "next";
import { Directorio } from "@/components/app/Directorio";
import { listarDirectorio } from "@/lib/bolsos";

export const metadata: Metadata = {
  title: "Directorio de proveedores — Manos Creadoras",
};

export default async function PaginaDirectorio() {
  const { categorias, items } = await listarDirectorio();

  /* La cabecera (franja arena con el buscador) la pinta `Directorio`: el
     buscador vive en su estado y tiene que ir dentro de la franja. */
  return (
    <main className="min-w-0 flex-1">
      <Directorio categorias={categorias} items={items} />
    </main>
  );
}
