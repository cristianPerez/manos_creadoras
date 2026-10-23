import Link from "next/link";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";

/**
 * La página que no existe, en el idioma y los colores de la app. La usan el
 * 404 de la app interna y el del sitio público: solo cambia a dónde se vuelve.
 */
export function NoEncontrada({ volver }: { volver: { href: string; texto: string } }) {
  return (
    <main className="flex min-w-0 flex-1 items-center justify-center px-5 py-16">
      <div className="max-w-md text-center">
        <EyebrowLinea centrado>Página no encontrada</EyebrowLinea>
        <h1 className="titulo-seccion mt-3 text-balance">
          Este hilo no lleva a <em className="clave">ningún lado</em>
        </h1>
        <p className="text-ink-body mt-3">
          La dirección cambió o se escribió mal. Tus bolsos y tu avance siguen donde los dejaste.
        </p>
        <Link
          href={volver.href}
          className="bg-cacao text-ivory mx-auto mt-7 flex h-13 w-fit items-center rounded-full px-7 font-semibold transition-transform active:scale-[0.98]"
        >
          {volver.texto}
        </Link>
      </div>
    </main>
  );
}
