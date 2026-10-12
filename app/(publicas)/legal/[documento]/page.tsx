import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOCUMENTOS, type ClaveDocumento } from "@/lib/legal-textos";

type Props = { params: Promise<{ documento: string }> };

export function generateStaticParams() {
  return Object.keys(DOCUMENTOS).map((documento) => ({ documento }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documento } = await params;
  const doc = DOCUMENTOS[documento as ClaveDocumento];
  return { title: doc ? `${doc.titulo} — Manos Creadoras` : "Manos Creadoras" };
}

/**
 * Los cuatro documentos legales, con UNA sola plantilla.
 *
 * ⚠️ ANTES ERAN CUATRO PÁGINAS CON SU PROPIO MAQUETADO. Cuatro sitios donde
 * cambiar el mismo pie, y cuatro oportunidades de que uno se quede con la
 * tipografía vieja. Ahora el texto vive en `lib/legal-textos.ts` y la forma
 * aquí: cambiar la forma los cambia los cuatro.
 */
export default async function Legal({ params }: Props) {
  const { documento } = await params;
  const doc = DOCUMENTOS[documento as ClaveDocumento];
  if (!doc) notFound();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* El selector: barra lateral en escritorio, píldoras con scroll en móvil. */}
        <nav aria-label="Documentos legales" className="lg:sticky lg:top-8 lg:h-fit">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {Object.entries(DOCUMENTOS).map(([clave, d]) => {
              const activo = clave === documento;
              return (
                <li key={clave} className="shrink-0">
                  <Link
                    href={`/legal/${clave}`}
                    aria-current={activo ? "page" : undefined}
                    className={`flex h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors lg:w-full ${
                      activo ? "bg-espresso text-white" : "text-ink-body hover:text-espresso"
                    }`}
                  >
                    {d.titulo}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <article className="min-w-0">
          <p className="eyebrow">Legal</p>
          <h1 className="titulo-seccion mt-2">{doc.titulo}</h1>

          {/* "En pocas palabras": el resumen honesto arriba del todo. Nadie lee
              estos documentos enteros, así que lo importante va donde sí se mira. */}
          <div className="bg-sand mt-6 rounded-[var(--radius-lg)] p-5">
            <p className="text-espresso text-sm font-semibold">En pocas palabras</p>
            <p className="text-ink-body mt-1 text-sm">{doc.resumen}</p>
          </div>

          <div className="prose-legal mt-8">
            <doc.Contenido />
          </div>

          <div className="border-line mt-10 border-t pt-6">
            <p className="text-ink-body text-sm">¿Dudas con algo de esto?</p>
            <Link
              href="/contacto"
              className="text-espresso mt-3 inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold"
              style={{ backgroundImage: "var(--boton-dorado)" }}
            >
              Escríbenos
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
