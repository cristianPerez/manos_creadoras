import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CancelarMembresia } from "@/components/app/CancelarMembresia";
import { RegistrarPais } from "@/components/app/RegistrarPais";
import { SelectorDePago } from "@/components/app/SelectorDePago";
import { Entrada } from "@/components/home/Entrada";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { alumnaActual } from "@/lib/alumna";
import { esLlavero, listarBolsos } from "@/lib/bolsos";
import { fechaLarga, finDelCicloEnCurso } from "@/lib/ciclo";
import { enlacesDeCobro } from "@/lib/checkout";
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
  const [alumna, cobro, bolsos] = await Promise.all([
    alumnaActual(),
    enlacesDeCobro(),
    listarBolsos(),
  ]);
  // Del catálogo, no a mano: el día que entre el bolso 17 esta frase no miente.
  // Solo bolsos: los llaveros también están en el catálogo pero no lo son.
  const totalBolsos = bolsos.filter((b) => !esLlavero(b)).length;

  /*
   * ⚠️ SIN SESIÓN YA NO SE MANDA A ENTRAR (2026-10-21, pedido de Cristian). Antes
   * aquí había un `redirect("/entrar")`: quien tocaba "Mi plan" sin cuenta
   * acababa en un formulario que no pidió. Ahora ve el plan y su botón de pagar;
   * el formulario de entrar vive SOLO en la pestaña "Entrar".
   */

  /*
   * ⚠️ `pb-28` DEJABA ~190px DE CREMA MUERTA sobre la barra inferior, que el
   * revisor visual descontó dos veces. La barra mide 72px: con `pb-20` el
   * contenido respira sin que el pie quede flotando en el vacío.
   */
  return (
    /* Página en ARENA (app interna, 2026-10-23), como la sección de precio
       del home: la tarjeta marfil/espresso se separa del fondo sin sombras. */
    <main className="bg-sand flex-1 px-4 py-8 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-270">
        <RegistrarPais />

        {alumna?.tieneAcceso ? (
          <YaTienePlan
            ciclo={alumna.ciclo}
            venceEl={alumna.venceEl}
            estado={alumna.estado}
            miembroDesde={alumna.miembroDesde}
            // Quien YA canceló no ve el botón: su renovación está detenida y
            // ofrecerle cancelar otra vez solo le haría dudar de si funcionó.
            puedeCancelar={alumna.estado !== "cancelada"}
          />
        ) : (
          <>
            {/* Escalonado de 70ms: el titular primero, los planes después. Es la
                animación baseline del sistema — sin ella la pantalla "aparece"
                de golpe y se siente estática. `Entrada` ya respeta
                `prefers-reduced-motion`. */}
            <Entrada>
              <header className="text-center">
                <EyebrowLinea centrado>Tu plan</EyebrowLinea>
                <h1 className="titulo-seccion mt-3 text-balance">
                  Desbloquea <em className="clave">todos los bolsos</em>
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
                <p className="text-ink-body mx-auto mt-3 max-w-2xl text-balance max-md:hidden">
                  Un bolso que no queda bien cuesta más que esto en cuentas y herrajes. Aquí
                  tienes el paso a paso de todos, clases nuevas cada semana y el Ojo Experto
                  revisando el tuyo.
                </p>
              </header>
            </Entrada>

            <Entrada retraso={0.07}>
              <SelectorDePago
                enlaces={cobro.url}
                frecuenciaInicial={ciclo === "mensual" ? "mensual" : "anual"}
                correo={alumna?.email ?? null}
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
  miembroDesde,
  puedeCancelar,
}: {
  ciclo: "mensual" | "anual" | null;
  venceEl: string | null;
  estado: "activa" | "vencida" | "cancelada";
  miembroDesde: string | null;
  puedeCancelar: boolean;
}) {
  /*
   * ⚠️ ANTES ERA `venceEl` A SECAS Y CUANDO VENÍA VACÍO LA TARJETA SOLO DECÍA
   * "Tu acceso está activo".
   *
   * Es decir: la pantalla que existe para responder "¿cuándo y cuánto me
   * vuelven a cobrar?" no lo respondía justo a quien no tiene fecha guardada
   * —membresías dadas a mano, y pagos de OnePay cuyo evento no trajo fecha—.
   * Lo marcó el revisor visual el 2026-10-19. `finDelCicloEnCurso` calcula la
   * misma fecha que usa la cancelación, así que las dos pantallas no pueden
   * decir cosas distintas.
   */
  /* La fecha en ISO: la lee la tarjeta y TAMBIÉN el botón de cancelar, para que
     su confirmación diga el mismo día exacto y no un vago "final del período". */
  const hastaISO = venceEl ?? finDelCicloEnCurso(miembroDesde, ciclo);
  const fecha = fechaLarga(hastaISO);

  return (
    <>
      {/*
        ⚠️ LA ENTRADA ESCALONADA FALTABA EN ESTA RAMA. `Entrada` solo envolvía
        la rama de venta, así que a quien YA paga la pantalla le aparecía de
        golpe — una de las siete animaciones baseline del sistema, ausente en
        la mitad de la pantalla. Lo marcó el revisor visual el 2026-10-19.
        70ms entre bloques; `Entrada` ya respeta `prefers-reduced-motion`.
      */}
      <Entrada>
        <header className="text-center">
          <EyebrowLinea centrado>Tu plan</EyebrowLinea>
          <h1 className="titulo-seccion mt-3 text-balance">
            Tienes el curso <em className="clave">completo</em>
          </h1>
        </header>
      </Entrada>

      <Entrada retraso={0.07}>
      {/* Espresso plano (2026-10-23): sin el degradado de `--card-destacada`. */}
      <section className="bg-espresso sobre-oscuro mx-auto mt-8 max-w-3xl rounded-(--radius-foto) p-8 text-center text-cream md:p-10">
        <span
          aria-hidden="true"
          className="bg-espresso-2 text-gold-pale mx-auto flex size-14 items-center justify-center rounded-full"
        >
          <Check size={26} strokeWidth={2.5} />
        </span>

        <p className="font-display mt-5 text-2xl" style={{ fontWeight: 500 }}>
          Curso completo{ciclo ? `, plan ${ciclo}` : ""}
        </p>

        {/* 85% y no 70%: sobre el marrón de la tarjeta, el 70% se quedaba
            justo en el límite de contraste y esta línea es la que dice si le
            van a cobrar o no. */}
        <p className="text-on-dark-muted mt-3 text-sm">
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
      </Entrada>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href="/app"
          className="bg-cacao text-ivory flex h-12 items-center rounded-full px-7 font-semibold transition-transform active:scale-[0.98]"
        >
          Ir a mis bolsos
        </Link>
        <Link
          href="/app/cuenta"
          className="border-line-strong text-espresso flex h-12 items-center rounded-full border px-7 font-semibold"
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
      {/*
        ⚠️ FONDO ARENA Y NO CREMA: ES EL NIVEL HUNDIDO QUE FALTABA.
        El revisor visual contó una sola profundidad en toda la pantalla el
        2026-10-19 — crema plano con cards marfil encima, y el único
        tratamiento real en la tarjeta héroe. Con la lista hundida quedan los
        tres niveles del sistema: hundido (arena) · base (crema) · elevado
        (marfil). El `-mx-5 px-5` la saca a sangre en móvil, donde una banda
        con márgenes flotando se ve como un parche.
      */}
      {/* Marfil con línea: la página ya es arena, así que la lista sube un
          nivel en vez de hundirse. */}
      <div className="bg-ivory border-line mx-auto mt-10 max-w-3xl rounded-(--radius-foto) border px-6 py-7">
        <p className="eyebrow">Tu plan incluye</p>
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

      {/*
        ⚠️ LA BAJA VIVE AQUÍ, NO EN UNA PÁGINA APARTE NI EN UN CORREO.
        Hasta el 2026-10-19 cancelar era escribir a contacto. Además de ser el
        patrón que produce devoluciones, en varios países de LATAM obligar a
        contactar para darse de baja es ILEGAL. Va al final, en texto: se
        encuentra quien la busca y no se pulsa por accidente.
      */}
      {/*
        ⚠️ CANCELAR Y EL PIE SON EL MISMO GRUPO: "administrar mi plan". Antes
        había ~90px entre la lista y el enlace y otros tantos hasta el pie, así
        que el enlace flotaba solo, sin pertenecer a nada (proximidad = relación,
        y el revisor lo marcó el 2026-10-19). Ahora 32px lo separan de la lista
        y el pie viene pegado detrás.
      */}
      <div className="mt-8">
        {puedeCancelar ? <CancelarMembresia accesoHasta={hastaISO} /> : null}

      {/*
        ⚠️ ESTO CIERRA ~180px DE CREMA MUERTA al final de la pantalla, que el
        revisor visual marcó el 2026-10-19. Y no es relleno: en una pantalla de
        plan, la duda que queda después de leerlo todo es "¿y si tengo un
        problema con mi cobro?". Tenerlo aquí evita que la única salida sea
        buscar el pie de página de la landing.
      */}
        <footer className="border-line mt-6 border-t pt-6 text-center">
          <p className="text-ink-muted text-sm">
            ¿Algo no cuadra con tu cobro o tu acceso?{" "}
            <Link href="/contacto" className="text-gold font-semibold underline underline-offset-4">
              Escríbenos
            </Link>{" "}
            y lo resolvemos.
          </p>
          <p className="text-ink-muted mt-3 text-xs">
            <Link href="/legal/reembolso" className="underline underline-offset-4">
              Reembolsos
            </Link>
            {" · "}
            <Link href="/legal/cancelar" className="underline underline-offset-4">
              Cómo cancelar
            </Link>
            {" · "}
            <Link href="/legal/terminos" className="underline underline-offset-4">
              Términos
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}
