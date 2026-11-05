import Image from "next/image";
import { Entrada } from "@/components/home/Entrada";
import { PROFESORA } from "@/lib/landing";

/**
 * "Hola, soy Elizabeth Valencia."
 *
 * ⚠️ EN UN CURSO DE OFICIO SE COMPRA A LA PERSONA QUE ENSEÑA. Es la primera
 * objeción de la ficha de avatar ("¿y esta quién es?"), y por eso la foto es
 * grande y va antes que el precio: cuando llegue el número, ya sabe de quién
 * está comprando.
 *
 * Las dos cifras: videos (crece sola cada semana, juega a favor) y días de
 * garantía. ⚠️ NO VA EL NÚMERO DE BOLSOS: contar el catálogo le pone techo a
 * una suscripción que promete clases nuevas — la cifra diría "esto es lo que
 * hay", justo lo contrario de lo que se quiere contar.
 */
export function ProfesoraB({ videos }: { videos: number }) {
  const cifras = [
    { valor: String(videos), pie: "videos" },
    { valor: "7", pie: "días de garantía" },
  ];

  return (
    <section
      id="elizabeth"
      data-seccion="elizabeth"
      className="bg-espresso-2 sobre-oscuro grain-oscuro"
    >
      <Entrada className="contenedor-b py-11 lg:flex lg:items-center lg:gap-18 lg:py-20">
        <Image
          src={PROFESORA.foto}
          alt={PROFESORA.alt}
          width={960}
          height={1200}
          loading="lazy"
          sizes="(min-width: 1024px) 480px, 100vw"
          className="rounded-foto-b h-102.5 w-full object-cover lg:h-140 lg:max-w-120 lg:flex-1"
          style={{ objectPosition: "center 20%" }}
        />

        <div className="mt-7 lg:mt-0 lg:flex-1">
          <p className="eyebrow-b flex items-center gap-3">Tu profesora</p>
          <h2 className="titulo-seccion-b mt-2.5 text-balance lg:mt-3.5">
            Hola, soy <em className="clave">{PROFESORA.nombre}.</em>
          </h2>

          <p className="text-on-dark-muted mt-3.5 max-w-130 text-base leading-relaxed lg:mt-5 lg:text-lg">
            {PROFESORA.texto}
          </p>

          {/* Cajitas de borde, sin relleno: sobre el morado oscuro un bloque
              más claro pesaría más que la foto. La línea basta para agrupar. */}
          <ul className="mt-5.5 grid grid-cols-2 gap-2.5 lg:mt-8 lg:flex lg:gap-3">
            {cifras.map((c) => (
              <li
                key={c.pie}
                className="border-espresso-line rounded-foto-b border p-4 lg:w-37.5 lg:p-4.5"
              >
                <span
                  className="font-display text-ivory block"
                  style={{ fontWeight: 500, fontSize: "clamp(38px, 3.4vw, 44px)", lineHeight: 1 }}
                >
                  {c.valor}
                </span>
                <span className="text-on-dark-muted mt-1.5 block text-sm">{c.pie}</span>
              </li>
            ))}
          </ul>
        </div>
      </Entrada>
    </section>
  );
}
