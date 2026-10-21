import type { Metadata } from "next";
import { Directorio } from "@/components/app/Directorio";
import { listarDirectorio } from "@/lib/bolsos";

export const metadata: Metadata = {
  title: "Directorio de proveedores — Manos Creadoras",
};

export default async function PaginaDirectorio() {
  const { categorias, items } = await listarDirectorio();

  return (
    <>
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">
          <header>
            <p className="eyebrow">Directorio</p>
            <h1 className="titulo-seccion mt-2 text-balance">
              Todo lo que necesitas, en un clic
            </h1>
            <p className="text-ink-body mt-3 max-w-xl">
              Los mismos materiales que usamos en los cursos, con el enlace directo para comprarlos.
            </p>
          </header>

          <Directorio categorias={categorias} items={items} />
        </div>
      </main>
    </>
  );
}
