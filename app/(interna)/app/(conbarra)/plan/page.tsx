import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegistrarPais } from "@/components/app/RegistrarPais";
import { SelectorDePago } from "@/components/app/SelectorDePago";
import { Entrada } from "@/components/home/Entrada";
import { alumnaActual } from "@/lib/alumna";
import { listarBolsos } from "@/lib/bolsos";
import { enlacesDeCobro } from "@/lib/checkout";
import { estadoDeLaOferta } from "@/lib/oferta-servidor";
import { INCLUYE } from "@/lib/planes";

export const metadata: Metadata = {
  title: "Mi plan — Manos Creadoras",
  robots: { index: false },
};

/**
 * Los planes, DENTRO de la app.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ESTA PANTALLA ERA `/pagar`, UNA PÁGINA PÚBLICA, Y SE MUDÓ AQUÍ
 * ════════════════════════════════════════════════════════════════════════════
 * Tenía dos trabajos incompatibles y hacía mal los dos:
 *
 *   · Vender a quien llega de la landing. Ese trabajo ya lo hace la landing
 *     mejor que nadie —con las fotos, el bolso gratis y el Ojo Experto—, y
 *     mandar a otra página en el momento de más intención solo añadía una
 *     carga y un botón de "atrás". Ahora los CTA del home BAJAN a `#precio`.
 *
 *   · Cobrar a quien ya está dentro con el plan gratis. Ese sí necesita una
 *     pantalla propia, y necesita la barra de navegación para no sentir que se
 *     salió de la app — que es exactamente lo que pasaba en `/pagar`.
 *
 * `/pagar` sigue existiendo y redirige aquí: puede estar pegado en un correo o
 * en un mensaje viejo, y un 404 en un enlace de pago es dinero perdido.
 * ════════════════════════════════════════════════════════════════════════════
 */
export default async function MiPlan({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string }>;
}) {
  const { ciclo } = await searchParams;
  const [alumna, cobro, bolsos, oferta] = await Promise.all([
    alumnaActual(),
    enlacesDeCobro(),
    listarBolsos(),
    estadoDeLaOferta(),
  ]);
  // Del catálogo, no a mano: el día que entre el bolso 17 esta frase no miente.
  const totalBolsos = bolsos.length;

  // Esta pantalla vive dentro de la app: sin sesión no hay a quién darle nada.
  if (!alumna) redirect("/entrar?next=/app/plan");

  return (
    <main className="min-h-dvh flex-1 px-5 py-10 pb-28 lg:pb-10">
      <div className="mx-auto max-w-3xl">
        <RegistrarPais />

        {alumna.tieneAcceso ? (
          <YaTienePlan ciclo={alumna.ciclo} venceEl={alumna.venceEl} estado={alumna.estado} />
        ) : (
          <>
            {/* Escalonado de 70ms: el titular primero, los planes después. Es la
                animación baseline del sistema — sin ella la pantalla "aparece"
                de golpe y se siente estática. `Entrada` ya respeta
                `prefers-reduced-motion`. */}
            <Entrada>
              <header className="text-center">
                <p className="eyebrow">Tu plan</p>
                <h1 className="titulo-seccion mt-2 text-balance">
                  Desbloquea los {totalBolsos} bolsos
                </h1>
                {/*
                  ⚠️ ANCLADO AL DOLOR Nº4 DE LA FICHA DE AVATAR: "ya gasté plata
                  en cuentas y herrajes que terminé tirando porque el bolso no
                  quedó bien".

                  El revisor marcó que el texto anterior —"tienes el bolso
                  gratis y 2 preguntas"— describía el inventario del plan, no lo
                  que le duele a ella. Y comparar los US$25 con el material
                  desperdiciado es lo que convierte el precio en una cuenta a
                  favor: ya se gastó eso, y sin que le quedara el bolso.
                */}
                <p className="text-ink-body mt-3 text-balance">
                  Un bolso que no queda bien cuesta más que esto en cuentas y herrajes. Aquí tienes
                  el paso a paso de los {totalBolsos}, y el Ojo Experto revisando el tuyo.
                </p>
              </header>
            </Entrada>

            <Entrada retraso={0.07}>
              <SelectorDePago
                enlaces={cobro.url}
                frecuenciaInicial={ciclo === "mensual" ? "mensual" : "anual"}
                correo={alumna.email}
                enOferta={oferta.activa}
              />
            </Entrada>
          </>
        )}
      </div>
    </main>
  );
}

/**
 * Lo que ve quien YA paga.
 *
 * ⚠️ NO SE LE ENSEÑAN LOS PLANES. Ofrecerle comprar lo que ya tiene es la forma
 * más rápida de hacerle dudar de si le están cobrando dos veces.
 */
function YaTienePlan({
  ciclo,
  venceEl,
  estado,
}: {
  ciclo: "mensual" | "anual" | null;
  venceEl: string | null;
  estado: "activa" | "vencida" | "cancelada";
}) {
  const fecha = venceEl
    ? new Date(venceEl).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
      <header className="text-center">
        <p className="eyebrow">Tu plan</p>
        <h1 className="titulo-seccion mt-2 text-balance">Tienes el curso completo</h1>
      </header>

      <section
        className="mt-8 rounded-[var(--radius-xl)] p-8 text-center text-white md:p-10"
        style={{ backgroundImage: "var(--card-destacada)" }}
      >
        <span
          aria-hidden="true"
          className="bg-gold-light/15 text-gold-light mx-auto flex size-14 items-center justify-center rounded-full"
        >
          <Check size={26} strokeWidth={2.5} />
        </span>

        <p className="font-display mt-5 text-2xl" style={{ fontWeight: 500 }}>
          Curso completo{ciclo ? `, plan ${ciclo}` : ""}
        </p>

        <p className="mt-3 text-sm text-white/70">
          {estado === "cancelada" && fecha
            ? /* Canceló pero pagó el período: se dice la verdad completa, que es
                 buena noticia —conserva el acceso— y evita el "pero si cancelé". */
              `Cancelaste la renovación. Conservas el acceso hasta el ${fecha}.`
            : estado === "vencida"
              ? "Tu último cobro no pasó. Revisa tu tarjeta para no perder el acceso."
              : fecha
                ? `Se renueva el ${fecha}.`
                : "Tu acceso está activo."}
        </p>
      </section>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href="/app"
          className="bg-espresso flex h-12 items-center rounded-full px-7 font-semibold text-white transition-transform active:scale-[0.98]"
        >
          Ir a mis bolsos
        </Link>
        <Link
          href="/app/cuenta"
          className="border-line text-ink-body flex h-12 items-center rounded-full border px-7 font-semibold"
        >
          Mi cuenta
        </Link>
      </div>

      {/*
        ⚠️ ESTO LLENA LO QUE ERA MEDIA PANTALLA EN BLANCO. Con solo la tarjeta y
        dos botones, por debajo quedaban ~400px de crema vacía — justo lo que el
        archivo 32 llama "aire muerto".

        Y no se rellena con adorno: se le recuerda a la alumna QUÉ tiene pagado.
        Quien ve su plan suele venir con la pregunta "¿y esto para qué me
        sirve?", que es la antesala de cancelar.
      */}
      <div className="mt-10">
        <p className="text-gold text-xs font-bold tracking-[0.18em] uppercase">Tu plan incluye</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {INCLUYE.map((b) => (
            <li
              key={b}
              className="bg-ivory border-line text-ink-body flex items-center gap-3 rounded-[var(--radius-lg)] border p-4 text-sm"
            >
              <span
                aria-hidden="true"
                className="bg-sand text-gold flex size-8 shrink-0 items-center justify-center rounded-full"
              >
                <Check size={15} strokeWidth={2.5} />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
