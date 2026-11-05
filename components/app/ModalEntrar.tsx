"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FormularioAcceso } from "@/components/app/FormularioAcceso";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ENTRAR ES UN MODAL, NO UNA PÁGINA (2026-11-05, pedido de Cristian)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Mismo patrón que El Charcu (`shared/ui/Dialog.tsx` + `SignupDialog`): una
 * HOJA DESDE ABAJO en el celular y un MODAL CENTRADO desde 768px, sobre la
 * página donde estaba. Antes "Entrar" llevaba a `/entrar`, una pantalla
 * entera: quien solo quería mirar un bolso perdía la página en la que estaba y
 * tenía que volver a buscarla.
 *
 * Tres piezas:
 *   · `ProveedorEntrar` (en el layout raíz) guarda si está abierto y pinta el
 *     modal una sola vez para toda la app.
 *   · `useEntrar()` → `abrir(origen)`: lo usa cualquier botón.
 *   · `BotonEntrar`: el botón ya hecho, con la clase que pida cada cabecera.
 *
 * ⚠️ `/entrar` SIGUE EXISTIENDO, pero ya no es una pantalla: redirige al home
 * con `?entrar=1`, y este proveedor abre el modal al ver ese parámetro (y lo
 * borra, para que recargar no lo vuelva a abrir). Así siguen sirviendo los
 * enlaces viejos, los de los correos y el "Pedir otro enlace" de
 * `/auth/completar`.
 *
 * Un `<dialog>` NATIVO con `showModal()`, como en El Charcu: trae gratis el
 * foco atrapado, Escape para cerrar y el fondo inerte, que es justo lo que un
 * modal hecho a mano suele olvidar. Tocar el fondo también cierra.
 */

/**
 * ════════════════════════════════════════════════════════════════════════════
 * EL CORREO QUE LLEGA EN LA DIRECCIÓN (`?email=`), DESDE EL CORREO DE BIENVENIDA
 * ════════════════════════════════════════════════════════════════════════════
 * El botón "Entrar al curso" del correo de bienvenida lleva a
 * `/app?entrar=1&desde=correo_bienvenida&email=<su correo>`: el modal se abre
 * con el correo escrito y pide el código solo (2026-11-05, pedido de Cristian).
 *
 * ⚠️ SE LEE Y SE BORRA DE LA DIRECCIÓN AL CARGAR ESTE ARCHIVO, antes de que
 * React pinte nada y, sobre todo, antes de que arranque Mixpanel. Un correo en
 * la URL es un dato personal: Mixpanel guarda la dirección de cada vista
 * (`$current_url`) y lo habría mandado a un tercero en cada evento, además de
 * dejarlo en el historial del navegador. Por eso no espera a un efecto (que
 * corre después de que la analítica ya leyó la dirección).
 *
 * Lo que NO se puede evitar: el servidor recibe la petición con el correo en
 * la dirección, así que queda en los registros de Vercel de esa visita.
 */
function tomarCorreoDeLaUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const correo = url.searchParams.get("email");
    if (correo === null) return null;
    url.searchParams.delete("email");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    const limpio = correo.trim().toLowerCase().slice(0, 254);
    return limpio === "" ? null : limpio;
  } catch {
    return null;
  }
}
const CORREO_DE_LA_URL = tomarCorreoDeLaUrl();

type ValorEntrar = {
  abierto: boolean;
  /**
   * Abre el modal. `origen` va a la medición: "header", "app", "bienvenida"…
   * Con `correo`, lo deja escrito y pide el código solo.
   */
  abrir: (origen: string, correo?: string | null) => void;
  cerrar: () => void;
};

const ContextoEntrar = createContext<ValorEntrar | null>(null);

export function ProveedorEntrar({
  children,
  conSesion,
}: {
  children: ReactNode;
  /**
   * Si ya hay sesión, `?entrar=1` NO abre nada: quien pagó con la sesión
   * abierta también recibe el correo de bienvenida, y abrirle el modal (y
   * pedirle un código que no necesita) sería mandarle un correo de más.
   */
  conSesion: boolean;
}) {
  const [origen, setOrigen] = useState<string | null>(null);
  /** El correo que trajo la dirección, solo para la apertura que lo usa. */
  const [correo, setCorreo] = useState<string | null>(null);

  const abrir = useCallback((desde: string, correoDado?: string | null) => {
    setOrigen(desde);
    setCorreo(correoDado ?? null);
    medir(EVENTOS.entrarAbierto, { origen: desde, con_correo: Boolean(correoDado) });
  }, []);
  const cerrar = useCallback(() => {
    setOrigen(null);
    setCorreo(null);
  }, []);

  const valor = useMemo(
    () => ({ abierto: origen !== null, abrir, cerrar }),
    [origen, abrir, cerrar],
  );

  return (
    <ContextoEntrar.Provider value={valor}>
      {children}
      {/* `useSearchParams` necesita su propio Suspense: sin él, toda página
          estática pasaría a renderizarse en el cliente. */}
      <Suspense fallback={null}>
        <AbrirDesdeLaUrl abrir={abrir} conSesion={conSesion} />
      </Suspense>
      <DialogoEntrar
        abierto={origen !== null}
        origen={origen ?? ""}
        correo={correo}
        alCerrar={cerrar}
      />
    </ContextoEntrar.Provider>
  );
}

/** `abrir` y compañía. Fuera del proveedor no hace nada (no rompe). */
export function useEntrar(): ValorEntrar {
  return useContext(ContextoEntrar) ?? { abierto: false, abrir: () => {}, cerrar: () => {} };
}

/**
 * El botón "Entrar" de cualquier cabecera. Es un `<button>` y no un enlace:
 * ya no lleva a ninguna parte, abre el modal encima de donde está.
 */
export function BotonEntrar({
  origen,
  className,
  children = "Entrar",
}: {
  origen: string;
  className?: string;
  children?: ReactNode;
}) {
  const { abrir } = useEntrar();
  return (
    <button
      type="button"
      onClick={() => abrir(origen)}
      aria-haspopup="dialog"
      className={`cursor-pointer ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

/** Abre el modal si la URL trae `?entrar=1` (lo pone la redirección de `/entrar`). */
function AbrirDesdeLaUrl({
  abrir,
  conSesion,
}: {
  abrir: (origen: string, correo?: string | null) => void;
  conSesion: boolean;
}) {
  const parametros = useSearchParams();
  const router = useRouter();
  const ruta = usePathname();
  const pedido = parametros.get("entrar");

  useEffect(() => {
    if (pedido === null) return;
    /* Con sesión no se abre: ya está dentro (ver `conSesion`). Solo se limpia
       la dirección. */
    if (!conSesion) abrir(parametros.get("desde") ?? "enlace_entrar", CORREO_DE_LA_URL);
    /* Se borra en el acto: si se quedara, cada recarga —o compartir el enlace—
       volvería a abrirlo y contaría otra apertura que no lo es. */
    const resto = new URLSearchParams(parametros.toString());
    resto.delete("entrar");
    resto.delete("desde");
    /* El router de Next aún guarda la dirección con la que llegó la página:
       sin esto, el correo volvería a aparecer al reescribirla. */
    resto.delete("email");
    const consulta = resto.toString();
    router.replace(`${ruta}${consulta ? `?${consulta}` : ""}${window.location.hash}`, {
      scroll: false,
    });
  }, [pedido, parametros, abrir, router, ruta, conSesion]);

  return null;
}

function DialogoEntrar({
  abierto,
  origen,
  correo,
  alCerrar,
}: {
  abierto: boolean;
  origen: string;
  /** El correo de la dirección: se deja escrito y se pide el código solo. */
  correo: string | null;
  alCerrar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  /*
   * ⚠️ YA SE MANDÓ EL CÓDIGO: tocar el fondo deja de cerrar (revisor visual,
   * 2026-11-05). En el paso "revisa tu correo" la persona va y vuelve de su
   * buzón, y un toque sin querer fuera de la hoja cerraba el modal y borraba
   * la casilla del código: había que pedir otro. La X y Escape siguen
   * cerrando, que son gestos que nadie hace sin querer.
   */
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  /*
   * El ancla de ESTA página a la que hay que bajar en cuanto el diálogo se
   * cierre del todo (la deja puesta un clic en un enlace del modal).
   * Ver `irAlDestino`, abajo, para por qué no se puede hacer antes.
   */
  const destinoPendiente = useRef<string | null>(null);
  /* Todo cierre pasa por aquí: así la próxima apertura vuelve a cerrarse con
     un toque fuera hasta que se mande el código. */
  const cerrar = () => {
    setCodigoEnviado(false);
    alCerrar();
  };

  /*
   * ⚠️ EL SALTO AL ANCLA VA DESPUÉS DEL CIERRE, NUNCA EN EL CLIC. Un modal
   * deja inerte todo lo de detrás, scroll incluido, así que mientras está
   * abierto el navegador no puede saltar a `#precio`: el salto se pierde y la
   * dirección queda en `/#precio` con la página arriba del todo (medido:
   * scrollY 0 con el precio a 3.502px).
   *
   * Dos intentos que NO funcionaron, por si alguien los vuelve a probar:
   *   · pedir el scroll en el siguiente frame tras cerrar — el cierre pasa por
   *     el estado de React y el frame llega antes;
   *   · colgarlo del evento `close` del `<dialog>` — medido: al cerrar desde
   *     React ese evento NO se dispara (el diálogo queda `open: false` sin
   *     emitirlo), así que el salto no corría nunca.
   * Lo que sí sirve: el efecto que cierra el diálogo, justo después de
   * `close()`, que es código de React y corre siempre.
   */
  const irAlDestino = useCallback(() => {
    const marca = destinoPendiente.current;
    if (marca === null) return;
    destinoPendiente.current = null;
    /*
     * Sin `behavior`: manda el `scroll-behavior: smooth` que `globals.css` ya
     * le pone a la página, que es el que usan todos los demás enlaces de ancla
     * del sitio. Pedir `behavior: "smooth"` a mano no es equivalente —hay
     * navegadores que ignoran el suave programático (comprobado aquí mismo: el
     * instantáneo movía la página y el suave no) y iOS lo ha traído y quitado
     * varias veces—, y el precio de que lo ignoren es que no pasa nada.
     */
    document.querySelector(marca)?.scrollIntoView({ block: "start" });
  }, []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) {
      d.showModal();
      /*
       * El foco al correo, que es lo único que hay que hacer aquí. Va DESPUÉS
       * de `showModal()`: el `autoFocus` de React corre antes y el diálogo, al
       * abrirse, lo mandaba a la X.
       *
       * ⚠️ SOLO CON RATÓN. En un iPhone, enfocar la casilla levanta el teclado
       * al instante y el teclado tapa la hoja: se ve media pantalla de teclado
       * y un trozo de modal sin el botón, así que la persona no entiende qué
       * tiene que hacer ni cómo salir (2026-11-05, reportado por Cristian).
       * En el celular la casilla ya está a la vista: se toca cuando se quiere
       * escribir, y el teclado sube entonces, que es lo que la persona espera.
       * `pointer: fine` es ratón o lápiz; un táctil es `coarse`.
       */
      if (window.matchMedia("(pointer: fine)").matches) {
        d.querySelector<HTMLInputElement>('input[type="email"]')?.focus();
      }
    }
    if (!abierto && d.open) d.close();
    /* Ya cerrado: si un enlace del modal pedía bajar a una sección, ahora sí.
       Ver `irAlDestino` para por qué este es el único momento bueno. */
    if (!abierto) irAlDestino();
  }, [abierto, irAlDestino]);

  return (
    <dialog
      ref={ref}
      onClose={cerrar}
      onClick={(e) => {
        // El clic que cae en el propio <dialog> (y no en su contenido) es el fondo.
        if (e.target === e.currentTarget && !codigoEnviado) cerrar();
      }}
      aria-label="Entrar a Manos Creadoras"
      /*
       * Hoja desde abajo en el celular (pegada abajo, a todo el ancho, esquinas
       * de arriba redondeadas, máximo 92% de alto con scroll propio) y modal
       * centrado de 480px desde 768. Las medidas son las de El Charcu.
       */
      /* El radio sale de `.hoja-entrar` (globals.css): 24px con la paleta de
         siempre y 16px con la B, que es "menos redonda" (FICHA-ARTE). */
      className="hoja-entrar bg-cream text-espresso backdrop:bg-espresso/45 open:animate-[hoja-sube_.32s_var(--ease-out)] mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto p-0 md:m-auto md:w-[min(92vw,480px)] md:open:animate-[aparecer_.24s_var(--ease-out)]"
    >
      {/* Solo se monta abierto: así cada apertura empieza en el paso 1 (el
          correo) y no en "revisa tu correo" de la vez anterior. */}
      {abierto && (
        <div
          /*
           * ⚠️ UN ENLACE DE DENTRO DEL MODAL TAMBIÉN LO CIERRA (2026-11-05).
           * "Ver el programa" lleva a `/#precio`, que casi siempre es la MISMA
           * página: la navegación ocurría por debajo, el modal seguía abierto
           * encima y, como un `<dialog>` modal bloquea todo lo que hay detrás,
           * la persona se quedaba mirando el formulario sin poder ver el
           * programa que acababa de pedir. Se captura aquí, en el contenedor,
           * y no enlace por enlace: así cualquier enlace que se añada mañana
           * —contacto, legales— hereda el comportamiento correcto sin que
           * nadie se acuerde de ponérselo.
           */
          onClick={(e) => {
            const enlace = (e.target as HTMLElement).closest("a[href]");
            if (!enlace) return;
            cerrar();
            /*
             * ⚠️ Y ADEMÁS HAY QUE LLEVARLA AL SITIO A MANO. Cerrar no bastaba:
             * el navegador intenta saltar al ancla MIENTRAS el diálogo sigue
             * abierto —y un modal deja inerte todo lo de detrás, scroll
             * incluido—, así que el salto se perdía. Medido: la dirección
             * quedaba en `/#precio` con la página en lo más alto (scrollY 0) y
             * el precio a 3.502px. O sea: pedía ver el programa, el modal
             * desaparecía y no pasaba nada más.
             * Se hace en el siguiente frame, ya cerrado, y solo cuando el
             * ancla está en ESTA página; para otra ruta navega Next.
             */
            const destino = enlace.getAttribute("href") ?? "";
            /* Solo las anclas de esta misma página; a otra ruta navega Next. */
            if (destino.startsWith("/#")) destinoPendiente.current = destino.slice(1);
          }}
          className="relative px-5 pt-3 pb-8 md:px-8 md:pt-8 md:pb-9"
          /* La franja de abajo del iPhone (la barra de gestos) no tapa el
             último enlace de la hoja. */
          style={{ paddingBottom: "max(2rem, calc(1.25rem + env(safe-area-inset-bottom)))" }}
        >
          {/* El asa de la hoja: dice "esto se arrastra/cierra" en el celular. */}
          <span
            aria-hidden="true"
            className="bg-espresso/15 mx-auto mb-5 block h-1 w-10 rounded-full md:hidden"
          />
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            /*
             * `active:` además de `hover:`: en el celular no hay hover, y sin
             * respuesta al toque la X parecía no hacer nada.
             *
             * ⚠️ `z-10` NO ES ADORNO: SIN ESTO LA X NO CERRABA EN ESCRITORIO
             * (2026-11-05). El primer bloque del formulario es un `.reveal`
             * animado que ocupa todo el ancho, empieza más arriba que el final
             * de la X y —al ir después en el DOM— se pintaba ENCIMA. Medido:
             * un clic en el tercio de abajo del icono caía en el `div`, no en
             * el botón. Parecía intermitente ("a veces cierra"), que es lo
             * peor: la persona cree que el modal la tiene atrapada.
             */
            className="text-ink-body hover:bg-sand active:bg-sand absolute top-2 right-2 z-10 grid size-11 cursor-pointer place-items-center rounded-full transition-[background-color,transform] active:scale-95 md:top-5 md:right-5"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <FormularioAcceso
            lugar={`modal_${origen}`}
            enModal
            alEnviarCorreo={() => setCodigoEnviado(true)}
            correoInicial={correo ?? ""}
            pedirAlMontar={Boolean(correo)}
          />
        </div>
      )}
    </dialog>
  );
}
