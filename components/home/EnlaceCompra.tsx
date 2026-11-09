"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { usePrecios } from "@/components/app/Precios";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { WHATSAPP_URL } from "@/lib/landing";
import { useContextoPago } from "@/components/pago/ContextoPago";
import type { OrigenCompra } from "@/lib/origen-compra";
import { yaVioPagar, type PosicionPago } from "@/lib/pago-textos";
import type { Frecuencia } from "@/lib/planes";

/* La lista de orígenes vive en `lib/origen-compra.ts` (la valida también la
   página `/pagar`, que es de servidor). Se re-exporta el tipo para no tocar a
   quien ya lo importaba de aquí. */
export type { OrigenCompra } from "@/lib/origen-compra";

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
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ DESDE EL 2026-11-06 NINGÚN BOTÓN VA DIRECTO A ONEPAY: PASA POR `/pagar`
 * ════════════════════════════════════════════════════════════════════════════
 * Embudo de 30 días: 285 vieron el precio, 17 abrieron OnePay, 1 pagó. OnePay
 * pide primero el WhatsApp con +57 puesto y enseña "$14.60" sin decir de qué
 * moneda; quien llegaba ahí sin aviso se iba. Ahora todo botón de compra con
 * `abrePago` lleva a la página intermedia (`app/(publicas)/pagar`), que dice
 * qué se compra, cuánto en su moneda y qué va a pedir OnePay. El ÚNICO que
 * abre OnePay es el botón de esa página, con `directo`.
 *
 * Así no hubo que tocar ni un botón de los homes, Mi plan o la app: el cambio
 * vive aquí. `checkout_abierto` se sigue midiendo al abrir OnePay de verdad
 * (desde la intermedia), así que el embudo viejo sigue significando lo mismo.
 */
export function EnlaceCompra({
  href,
  origen,
  plan,
  abrePago = false,
  directo = false,
  conRuta = false,
  posicion,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  origen: OrigenCompra;
  plan: Frecuencia;
  abrePago?: boolean;
  /** Solo el botón de `/pagar`: abre OnePay sin pasar por la intermedia. */
  directo?: boolean;
  /**
   * Solo los botones dorados del home (tarjeta de precio y barra fija): obedecen
   * la flag `ruta_pago` y saltan `/pagar` si ya la vio en esta visita.
   * El resto de botones de la app no cambian con la flag.
   */
  conRuta?: boolean;
  /** Dónde está el botón, para el embudo (`posicion`). */
  posicion?: PosicionPago;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const ctx = useContextoPago();
  /* Con la flag en "directo", el botón del home abre OnePay en el mismo toque. */
  const directoPorRuta = conRuta && ctx?.rutaPago === "directo";
  const vaDirecto = directo || directoPorRuta;
  const alPuente = abrePago && !vaDirecto;
  /* Activo en los dos caminos: el puente también puede acabar abriendo OnePay
     (si ya vio `/pagar`), y entonces necesita su "Abriendo el pago seguro…". */
  const { estado, alTocar } = useAbrirPago(abrePago && (vaDirecto || conRuta));
  /* Qué precio estaba enseñando ESTE botón: moneda y monto del ciclo. */
  const { moneda, precios } = usePrecios();
  const precio = precios[plan];
  const ocupado = estado !== "quieto";

  /* Lo que viaja en el clic y en `checkout_abierto`. País, variante y ruta ya
     van como super propiedades; se repiten aquí porque el embudo de pago se
     lee por evento y así no depende de que el registro haya llegado antes. */
  const propiedades = (saltoPuente: boolean) => ({
    origen,
    /* DÓNDE EMPEZÓ LA COMPRA, no dónde se tocó. En el home los dos son el
       mismo botón; desde `/pagar` este conserva el del home (ver `desde` en
       `ContextoPago`). Es el que responde "¿qué botón vende?". */
    origen_inicial: ctx?.desde ?? origen,
    plan,
    moneda,
    precio,
    ...(posicion ? { posicion } : {}),
    ...(ctx
      ? { pais: ctx.pais, variante_precio: ctx.variantePrecio, ruta_pago: ctx.rutaPago, salto_puente: saltoPuente }
      : {}),
  });

  const abrirOnePay = (saltoPuente: boolean) => {
    const p = propiedades(saltoPuente);
    medir(EVENTOS.ctaInscribirmeClick, p);
    medir(EVENTOS.checkoutAbierto, p);
    guardarContextoCheckout({ ...p, ciclo: plan });
  };

  const contenido = ocupado ? <TextoAbriendoPago tardo={estado === "tardo"} /> : children;
  const conEstados = (enlace: ReactNode) => (
    <>
      {enlace}
      <AnuncioPago estado={estado} />
      {estado === "tardo" && <AvisoTarda />}
    </>
  );

  /*
   * A la intermedia con `<Link>`: es navegación de la app, se precarga y su
   * esqueleto (`pagar/loading.tsx`) sale en el mismo toque. Se pasa el origen
   * para que `checkout_abierto` siga diciendo desde qué botón se empezó.
   *
   * ⚠️ SI YA PASÓ POR `/pagar` EN ESTA VISITA (y el botón es de los del home,
   * `conRuta`), no se le hace pasar otra vez: va directo a OnePay con
   * `salto_puente: true`. Se decide en el toque, no al pintar, porque la marca
   * vive en `sessionStorage` y en el servidor no existe.
   */
  if (alPuente) {
    const link = (
      <Link
        href={`/pagar?ciclo=${plan}&desde=${origen}`}
        aria-label={ocupado ? undefined : ariaLabel}
        aria-busy={estado === "abriendo" || undefined}
        className={`${className ?? ""} ${estado === "abriendo" ? "cursor-progress" : ""}`}
        onClick={(e) => {
          if (conRuta && yaVioPagar()) {
            e.preventDefault();
            if (!alTocar(e)) return;
            abrirOnePay(true);
            window.location.assign(href);
            return;
          }
          medir(EVENTOS.ctaInscribirmeClick, propiedades(false));
        }}
      >
        {contenido}
      </Link>
    );
    return conRuta ? conEstados(link) : link;
  }

  const enlace = (
    <a
      href={href}
      aria-label={ocupado ? undefined : ariaLabel}
      aria-busy={estado === "abriendo" || undefined}
      className={`${className ?? ""} ${estado === "abriendo" ? "cursor-progress" : ""}`}
      onClick={(e) => {
        // El segundo toque mientras carga OnePay no cuenta: ni navega ni mide.
        if (!alTocar(e)) return;
        if (abrePago) abrirOnePay(false);
        else medir(EVENTOS.ctaInscribirmeClick, propiedades(false));
      }}
    >
      {contenido}
    </a>
  );

  /* Sin `abrePago` no hay estados de pago: el enlace sale solo, como siempre,
     y no se añade nada al lado que pueda descuadrar a quien lo contiene. */
  if (!abrePago) return enlace;
  return conEstados(enlace);
}

/**
 * Lo que se sabía al abrir OnePay, guardado en esta pestaña (`mc_checkout_ctx`).
 *
 * ⚠️ LOS ENLACES DE ONEPAY NO LLEVAN REFERENCIA EXTERNA (son planes fijos de
 * `plan_checkout`), así que la variante, la ruta y las UTM no viajan al pago.
 * El pago se une a esto por el CORREO: el webhook lo trae y
 * `lib/pagos-huerfanos.ts` ya reconcilia por correo; `checkout_abierto` va al
 * mismo `distinct_id` (`mc_vid`). Si un día OnePay acepta metadatos, se añaden
 * al enlace y esto sobra.
 */
function guardarContextoCheckout(datos: Record<string, unknown>) {
  try {
    const utm: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v;
    });
    sessionStorage.setItem("mc_checkout_ctx", JSON.stringify({ ...datos, ...utm, ts: Date.now() }));
  } catch {
    /* Sin almacenamiento: el evento de Mixpanel ya salió igual. */
  }
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
