"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { WHATSAPP_URL } from "@/lib/landing";
import type { Frecuencia } from "@/lib/planes";

/** Desde dónde se tocó un botón de compra. Son los seis del home v3. */
export type OrigenCompra =
  | "header"
  | "banner_precio"
  | "banda_1de16"
  // El panel navideño (2026-10-31): su botón del pie.
  | "navidad"
  /* La FOTO del panel navideño, enlazada a `#precio`. Entre el 2026-11-02 y
     el 2026-11-06 no tuvo enlace (de 4 fotos se pasó a una sola) y acumuló 40
     toques en vacío: volvió a ser tocable con el mismo origen de antes, así
     que el embudo viejo y el nuevo se leen juntos. */
  | "navidad_pieza"
  | "precio"
  | "cierre"
  | "barra_movil"
  // Dentro de la app (2026-10-21): los que antes decían "Crear mi cuenta gratis".
  | "catalogo"
  | "ficha_bolso"
  | "ojo_agotado"
  // Cabecera de escritorio del Ojo v5, para quien entra sin cuenta.
  | "ojo_cabecera"
  /* La pantalla Mi plan (`SelectorDePago`). Hasta el 2026-11-06 su botón era un
     `<Link>` suelto: abría OnePay SIN medir `checkout_abierto`. */
  | "pagina_plan";

/**
 * Cuánto se espera a OnePay antes de decir "Está tardando, reintenta". Si en
 * ese tiempo la página no se fue, algo la frenó (sin señal, un navegador que
 * bloquea), y se le da salida: reintentar o escribir por WhatsApp.
 *
 * 4 s y no 8 (revisor visual, 2026-11-06): la regla de la app es dar progreso
 * y una salida desde los 3 s. Con 8, eran 5 s de giro sin poder hacer nada,
 * justo donde la gente tocaba 3 y 4 veces.
 */
const ESPERA_PAGO_MS = 4000;

/**
 * El estado "Abriendo el pago seguro…" de un botón que sale a OnePay.
 *
 * ⚠️ POR QUÉ EXISTE (Mixpanel, 30 días al 2026-11-06): de las 18 personas que
 * abrieron el pago, a 12 el botón NO REACCIONÓ al tocarlo —23 "toques en
 * vacío", seis personas tocándolo 2, 3 y hasta 4 veces—. OnePay tarda en
 * cargar y el botón no decía nada mientras tanto: parecía roto justo en el
 * momento de pagar. Ahora cambia en el mismo toque y no deja tocarlo dos veces.
 *
 * Al volver con "Atrás" el navegador puede restaurar la página CONGELADA tal
 * como quedó (bfcache), con el botón aún en "Abriendo…": `pageshow` lo suelta.
 */
export function useAbrirPago(activo: boolean) {
  /* `tardo`: pasaron 4 s y la página no se fue. El botón NO vuelve callado a
     su texto (revisor visual, 2026-11-06): soltarlo sin explicar es lo que
     hacía tocar 3 y 4 veces. Dice que tarda y que se puede reintentar. */
  const [estado, setEstado] = useState<"quieto" | "abriendo" | "tardo">("quieto");

  useEffect(() => {
    if (estado !== "abriendo") return;
    const reloj = window.setTimeout(() => setEstado("tardo"), ESPERA_PAGO_MS);
    return () => window.clearTimeout(reloj);
  }, [estado]);

  useEffect(() => {
    if (estado === "quieto") return;
    const soltar = () => setEstado("quieto");
    window.addEventListener("pageshow", soltar);
    return () => window.removeEventListener("pageshow", soltar);
  }, [estado]);

  /** Devuelve `false` si el toque se debe ignorar (ya se está abriendo). */
  const alTocar = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!activo) return true;
    if (estado === "abriendo") {
      e.preventDefault();
      return false;
    }
    setEstado("abriendo");
    return true;
  };

  return { estado: activo ? estado : "quieto", alTocar };
}

/**
 * Lo que dice el botón mientras sale a OnePay, o si tarda demasiado.
 *
 * Entra con un fundido corto (no salta de golpe). Lo que oye un lector de
 * pantalla NO sale de aquí: ver `AnuncioPago`.
 */
export function TextoAbriendoPago({ tardo = false }: { tardo?: boolean }) {
  return (
    <span
      key={tardo ? "tardo" : "abriendo"}
      className="inline-flex animate-[aparecer_.15s_var(--ease-out)] items-center gap-2 motion-reduce:animate-none"
    >
      {tardo ? (
        <RotateCw size={18} aria-hidden="true" />
      ) : (
        <LoaderCircle size={18} className="animate-spin motion-reduce:animate-pulse" aria-hidden="true" />
      )}
      <span className="whitespace-nowrap opacity-90">{tardo ? "Está tardando, reintenta" : "Abriendo el pago seguro…"}</span>
    </span>
  );
}

/**
 * La región viva que anuncia el estado del pago a un lector de pantalla.
 *
 * ⚠️ EXISTE SIEMPRE, también en reposo, y solo cambia su texto (revisor
 * visual, 2026-11-06): casi ningún lector anuncia una región `role="status"`
 * que nace ya con contenido, así que montarla junto con "Abriendo…" no se oía.
 */
function AnuncioPago({ estado }: { estado: "quieto" | "abriendo" | "tardo" }) {
  return (
    <span role="status" className="sr-only">
      {estado === "abriendo"
        ? "Abriendo el pago seguro"
        : estado === "tardo"
          ? "El pago está tardando. No se te cobró nada. Puedes tocar de nuevo o escribirnos por WhatsApp."
          : ""}
    </span>
  );
}

/**
 * Si el pago tarda: dice que no se cobró nada y da otra salida.
 *
 * Responde el miedo de reintentar un pago ("¿me cobrará dos veces?") y, si
 * vuelve a fallar, no la deja sin camino. Es CIERTO que no se cobró: este
 * estado solo existe si la página nunca salió hacia OnePay.
 *
 * `w-full` y NO `basis-full`: en una fila flex con wrap baja a su propia línea,
 * y en una COLUMNA flex (la tarjeta del home de siempre) `basis-full` era
 * ocupar todo el ALTO — aplastaba el botón y dejaba un hueco (2026-11-06).
 */
function AvisoTarda() {
  return (
    <p className="aviso-pago text-ink-body mt-2 w-full animate-[aparecer_.15s_var(--ease-out)] text-center text-sm motion-reduce:animate-none">
      No se te cobró nada. Si no abre,{" "}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline underline-offset-2"
        onClick={() => medir(EVENTOS.whatsappClick, { origen: "pago_tarda" })}
      >
        escríbenos por WhatsApp
      </a>
      .
    </p>
  );
}

/**
 * Un enlace de compra que deja dicho desde dónde se tocó.
 *
 * ⚠️ ES UN `<a>` Y NO UN `<Link>`, por dos motivos. Casi todos apuntan a
 * `#precio` —un ancla de esta misma página, donde `<Link>` intercepta el clic y
 * rompe el scroll suave— y los que no, abren OnePay: un dominio de fuera, que
 * tampoco es navegación de la app.
 *
 * Si va directo al pago (`abrePago`), se mide también `checkout_abierto`, que es
 * el evento que ya usa el embudo para "abrió el pago". Así el panel viejo sigue
 * contando bien y el nuevo dice además desde qué botón.
 */
export function EnlaceCompra({
  href,
  origen,
  plan,
  abrePago = false,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  origen: OrigenCompra;
  plan: Frecuencia;
  abrePago?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const { estado, alTocar } = useAbrirPago(abrePago);
  const ocupado = estado !== "quieto";

  const enlace = (
    <a
      href={href}
      aria-label={ocupado ? undefined : ariaLabel}
      aria-busy={estado === "abriendo" || undefined}
      className={`${className ?? ""} ${estado === "abriendo" ? "cursor-progress" : ""}`}
      onClick={(e) => {
        // El segundo toque mientras carga OnePay no cuenta: ni navega ni mide.
        if (!alTocar(e)) return;
        medir(EVENTOS.ctaInscribirmeClick, { origen, plan });
        if (abrePago) medir(EVENTOS.checkoutAbierto, { plan });
      }}
    >
      {ocupado ? <TextoAbriendoPago tardo={estado === "tardo"} /> : children}
    </a>
  );

  /* Sin `abrePago` no hay estados de pago: el enlace sale solo, como siempre,
     y no se añade nada al lado que pueda descuadrar a quien lo contiene. */
  if (!abrePago) return enlace;
  return (
    <>
      {enlace}
      <AnuncioPago estado={estado} />
      {estado === "tardo" && <AvisoTarda />}
    </>
  );
}

/**
 * El botón de WhatsApp, medido. Abre en otra pestaña: en el móvil salta a la
 * app de WhatsApp, y en escritorio no se pierde la página que estaba leyendo.
 */
export function EnlaceWhatsApp({
  href,
  origen,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  origen: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => medir(EVENTOS.whatsappClick, { origen })}
    >
      {children}
    </a>
  );
}
