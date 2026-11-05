import { Gift } from "lucide-react";
import Image from "next/image";
import { EnlaceCompra } from "@/components/home/EnlaceCompra";
import { Entrada } from "@/components/home/Entrada";
import { FRECUENCIA_POR_DEFECTO } from "@/lib/planes";

/**
 * La edición navideña, en la paleta B.
 *
 * ⚠️ MUCHO MÁS CORTA QUE LA DEL HOME DE SIEMPRE, y es el cambio con intención.
 * Aquella listaba los doce adornos y traía un párrafo largo; aquí queda el
 * chip, el titular, UNA foto, dos cajitas de dato y el botón. La lista de doce
 * nombres no vende nada que la foto no diga mejor, y empujaba el resto de la
 * página media pantalla hacia abajo justo donde la visitante todavía está
 * decidiendo si sigue leyendo.
 *
 * ⚠️ EL ORDEN CAMBIA ENTRE MÓVIL Y ESCRITORIO Y SE RESUELVE CON `order`, NO
 * PINTANDO LA FOTO DOS VECES. En móvil: chip → titular → foto → datos → botón;
 * en escritorio, foto a la izquierda y todo el texto a la derecha. Por eso el
 * contenedor es `flex` ya en móvil (en columna): con un `div` normal el `order`
 * no hace nada y la foto se queda donde esté escrita, que es el fallo fácil.
 */
const DATOS = [
  { cifra: "12", pie: "adornos en video" },
  { cifra: "Dic.", pie: "incluidos en tu plan" },
];

export function NavidadB() {
  const foto = (
    <Image
      src="/images/navidad-accesorios.webp"
      alt="Doce adornos navideños tejidos en perla y cristal sobre una bandeja"
      width={840}
      height={560}
      loading="lazy"
      sizes="(min-width: 1024px) 520px, 100vw"
      className="rounded-foto-b h-57.5 w-full object-cover lg:h-100"
      style={{ objectPosition: "center 40%" }}
    />
  );

  return (
    <section
      id="navidad"
      data-seccion="navidad"
      className="bg-espresso-2 sobre-oscuro grain-oscuro"
    >
      <Entrada className="contenedor-b flex flex-col py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-18">
        {/* Escritorio: la columna de la foto. En móvil no se pinta aquí —la
            foto va entre el titular y los datos, más abajo. */}
        <div className="max-lg:hidden lg:flex-1">{foto}</div>

        <div className="flex flex-col lg:flex-1">
          <div className="flex max-lg:justify-center">
            <span className="border-gold-light text-gold-light inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-micro font-bold tracking-[0.2em] uppercase lg:text-xs">
              <Gift size={15} aria-hidden="true" />
              Edición navideña
            </span>
          </div>

          <h2 className="titulo-seccion-b mt-4.5 text-balance max-lg:text-center lg:mt-5">
            Accesorios <em className="clave">navideños</em> en cuentas
          </h2>

          <div className="mt-5.5 lg:hidden">{foto}</div>

          <ul className="mt-3 grid grid-cols-2 gap-2.5 lg:mt-7 lg:max-w-105 lg:gap-3">
            {DATOS.map((d) => (
              <li
                key={d.pie}
                className="border-espresso-line rounded-foto-b border px-3.5 py-3 lg:px-4.5 lg:py-4"
              >
                <span
                  className="font-display text-ivory block"
                  style={{ fontWeight: 500, fontSize: "clamp(28px, 2.6vw, 36px)", lineHeight: 1 }}
                >
                  {d.cifra}
                </span>
                <span className="text-on-dark-muted text-nota mt-1 block lg:text-sm">{d.pie}</span>
              </li>
            ))}
          </ul>

          <EnlaceCompra
            href="#precio"
            origen="navidad"
            plan={FRECUENCIA_POR_DEFECTO}
            className="bg-ivory text-espresso-2 mt-5 flex h-13 items-center justify-center rounded-full font-bold transition-transform active:scale-[0.98] max-lg:w-full lg:mt-7 lg:h-13.5 lg:self-start lg:px-7.5"
          >
            Ver planes y precio
          </EnlaceCompra>
        </div>
      </Entrada>
    </section>
  );
}
