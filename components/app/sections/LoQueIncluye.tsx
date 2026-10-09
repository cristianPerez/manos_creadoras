import { FileText, MapPin, PlaySquare, Users } from "lucide-react";
import { Reveal } from "@/components/app/Reveal";

/**
 * Lo que incluye la membresía, en rejilla tipo bento.
 *
 * Las cuatro piezas NO son iguales a propósito: la tarjeta oscura de los videos
 * es la más grande porque los +50 tutoriales son el grueso de lo que se compra.
 * Si las cuatro midieran lo mismo, la rejilla diría que las cuatro valen lo
 * mismo, y no es verdad.
 */
export function LoQueIncluye() {
  return (
    <section className="px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <header>
          <p className="eyebrow">Lo que incluye</p>
          <h2 className="titulo-seccion mt-3 max-w-xl text-balance">
            Todo lo que necesitas, paso a paso.
          </h2>
        </header>

        <div className="mt-12 grid gap-5 md:grid-cols-12">
          {/* La pieza principal: los videos. */}
          <Reveal className="md:col-span-7">
            <article
              className="flex h-full min-h-72 flex-col justify-end rounded-[var(--radius-xl)] p-8 text-white"
              style={{ backgroundImage: "var(--card-destacada)" }}
            >
              <Chip oscuro>
                <PlaySquare size={20} aria-hidden="true" />
              </Chip>
              <h3 className="font-display mt-auto pt-10 text-2xl" style={{ fontWeight: 500 }}>
                +50 tutoriales en video HD
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/75">
                Desde la base del bolso hasta los acabados finos, con tomas de cerca para que no se
                te escape ningún paso.
              </p>
            </article>
          </Reveal>

          {/* Las dos piezas de apoyo, en columna partida. */}
          <div className="grid gap-5 md:col-span-5 md:grid-cols-2">
            <Tarjeta
              icono={<FileText size={20} aria-hidden="true" />}
              titulo="50 patrones y plantillas"
              texto="Descargables, con medidas exactas para 25 modelos."
              retraso={0.08}
            />
            <Tarjeta
              icono={<MapPin size={20} aria-hidden="true" />}
              titulo="Directorio de proveedores"
              texto="Cuentas, mallas y herrajes con precios al por mayor por país."
              retraso={0.16}
            />
          </div>

          {/* La franja ancha de la comunidad, bajo la tarjeta oscura. */}
          <Reveal className="md:col-span-7" delay={0.24}>
            <article className="bg-sand flex items-center gap-5 rounded-[var(--radius-xl)] p-6">
              <Chip>
                <Users size={20} aria-hidden="true" />
              </Chip>
              <div>
                <h3 className="text-espresso font-semibold">Comunidad privada y mentoría mensual</h3>
                <p className="text-ink-body mt-1 text-sm">
                  Grupo exclusivo, retos cada mes y feedback directo de tu mentora.
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Tarjeta({
  icono,
  titulo,
  texto,
  retraso,
}: {
  icono: React.ReactNode;
  titulo: string;
  texto: string;
  retraso: number;
}) {
  return (
    <Reveal delay={retraso}>
      <article className="bg-ivory border-line h-full rounded-[var(--radius-xl)] border p-6">
        <Chip>{icono}</Chip>
        <h3 className="text-espresso mt-4 font-semibold">{titulo}</h3>
        <p className="text-ink-body mt-2 text-sm">{texto}</p>
      </article>
    </Reveal>
  );
}

/**
 * El contenedor del ícono.
 *
 * Sin fondo ni borde: en el diseño los íconos van sueltos, solo en dorado. Un
 * chip con fondo aquí sumaría cuatro rectángulos de color a una rejilla que ya
 * tiene cuatro tarjetas, y la ensuciaría.
 */
function Chip({ children, oscuro = false }: { children: React.ReactNode; oscuro?: boolean }) {
  return <span className={oscuro ? "text-gold-light" : "text-gold"}>{children}</span>;
}
