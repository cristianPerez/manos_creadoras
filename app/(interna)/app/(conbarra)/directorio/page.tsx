import type { Metadata } from "next";
import { Directorio } from "@/components/app/Directorio";
import { accesoDirectorio, listarDirectorio } from "@/lib/bolsos";

export const metadata: Metadata = {
  title: "Directorio de proveedores — Manos Creadoras",
};

export default async function PaginaDirectorio({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ categorias, items }, acceso, q] = await Promise.all([
    listarDirectorio(),
    accesoDirectorio(),
    searchParams,
  ]);

  /* La ruta `/app/directorio/ir/<id>` devuelve aquí cuando no hay derecho
     (p. ej. al llegar desde la ficha de un bolso): se abre el aviso. */
  const avisoInicial = q.bloqueado ? "membresia" : null;

  /* La cabecera (franja arena con el buscador) la pinta `Directorio`: el
     buscador vive en su estado y tiene que ir dentro de la franja. */
  return (
    <main className="min-w-0 flex-1">
      <Directorio categorias={categorias} items={items} acceso={acceso} avisoInicial={avisoInicial} />
    </main>
  );
}
