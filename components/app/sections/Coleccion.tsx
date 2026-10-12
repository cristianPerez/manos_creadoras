import Image from "next/image";
import { Reveal } from "@/components/app/Reveal";
import { listarBolsos, ordenCatalogo } from "@/lib/bolsos";

/**
 * La colección: la única sección a pantalla completa sobre espresso.
 *
 * Es el respiro oscuro en mitad de la página y hace un trabajo concreto: las
 * fotos de los bolsos están tomadas sobre fondo negro, así que sobre crema
 * flotarían como recortes. Sobre espresso se funden con la página y parecen
 * una vitrina.
 *
 * ⚠️ LEE EL CATÁLOGO DE VERDAD. Antes tenía su propia lista de ocho nombres y
 * ocho fotos escrita a mano, y eso duró lo que tardó en divergir: cinco bolsos
 * acabaron con una foto en el home y otra distinta dentro de la app. Quien ve
 * un bolso en la portada y luego no lo reconoce en su cuenta no piensa "qué
 * raro", piensa que compró otra cosa.
 *
 * Ahora la fuente es la misma que la de `/app`: la base.
 */
export async function Coleccion() {
  const todos = ordenCatalogo(await listarBolsos());

  /*
   * Solo los que tienen foto, y como mucho ocho. La rejilla del diseño son dos
   * filas de cuatro; meter aquí los que todavía enseñan la inicial sobre
   * espresso dejaría huecos en la parte más visual de la página de ventas.
   */
  const conFoto = todos.filter((b) => b.portadaUrl).slice(0, 8);

  if (conFoto.length === 0) return null;

  return (
    <section id="coleccion" className="bg-espresso px-5 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-12 md:items-start">
          <header className="md:col-span-7">
            <p className="eyebrow text-gold-light">La colección crece cada mes</p>
            <h2
              className="font-display mt-3 text-balance text-white"
              style={{
                fontWeight: 500,
                fontSize: "clamp(36px, 4vw, 54px)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
              }}
            >
              Un modelo nuevo,{" "}
              <em className="text-gold-light italic" style={{ fontWeight: 400 }}>
                cada mes
              </em>
              .
            </h2>
          </header>
          <p className="text-sm text-white/70 md:col-span-4 md:col-start-9 md:pt-2">
            Mientras sigas en la membresía, tu biblioteca no deja de crecer. Estos son algunos de los
            {" "}
            {todos.length} modelos que ya puedes tejer.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5">
          {conFoto.map((bolso, i) => (
            <Reveal key={bolso.id} delay={Math.min(i, 4) * 0.06}>
              <li>
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)]">
                  <Image
                    src={bolso.portadaUrl!}
                    alt={`Bolso ${bolso.nombre}, tejido en cuentas`}
                    fill
                    sizes="(min-width: 768px) 280px, 45vw"
                    className="object-cover"
                  />
                  <span className="bg-ivory text-espresso absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold tracking-[0.1em] uppercase">
                    {bolso.gratis ? "Gratis" : "Biblioteca"}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <p className="font-display truncate text-lg text-white" style={{ fontWeight: 500 }}>
                    {bolso.nombre}
                  </p>
                  <span
                    className={`shrink-0 text-xs ${
                      bolso.gratis ? "text-gold-light font-semibold" : "text-gold"
                    }`}
                  >
                    {bolso.gratis ? "Gratis" : `${bolso.videos} videos`}
                  </span>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
