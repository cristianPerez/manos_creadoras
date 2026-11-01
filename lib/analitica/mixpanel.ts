import mixpanel from "mixpanel-browser";

/**
 * La conexión con Mixpanel. Un solo sitio por donde sale todo evento.
 *
 * ⚠️ ESTO REVIERTE LA DECISIÓN E6 DEL PLAN, y conviene que quede escrito. Al
 * portar el embudo de El Charcu se decidió NO traer Mixpanel —una cuenta más,
 * un costo más y un banner de cookies— y quedarse solo con el catálogo de
 * nombres. Cristian pidió Mixpanel explícitamente el 2026-09-15. Se ejecuta.
 */

export type Propiedades = Record<string, string | number | boolean | undefined>;

let listo = false;

/**
 * Eventos que llegaron ANTES de que Mixpanel estuviera encendido.
 *
 * ⚠️ ESTO TAPA UN FALLO REAL Y SILENCIOSO (2026-09-15). `medir()` devolvía sin
 * hacer nada si Mixpanel no estaba listo, y resulta que eso pasaba de verdad:
 * `<Medir>` vive dentro de la pantalla y `<Analitica>` —que es quien enciende—
 * está después en el layout raíz. React ejecuta los efectos de dentro hacia
 * fuera, así que el evento de la pantalla salía primero y se tiraba a la basura.
 *
 * Se detectó porque `pagina_ventas_vista` NO llegaba a Mixpanel mientras
 * `cortesia_vista` sí — el mismo código, dos resultados, según cómo cayera el
 * orden. Un fallo así no da ningún error: simplemente falta el evento MÁS
 * importante del embudo, el denominador de todo el negocio, y el panel enseña
 * unos números perfectamente creíbles que están mal.
 *
 * Con la cola, el orden deja de importar: lo que llegue antes espera aquí y
 * sale en cuanto hay con qué mandarlo.
 */
const enEspera: { evento: string; propiedades?: Propiedades }[] = [];

/** Tope de la cola. Si algo va tan mal que se acumulan 50 eventos sin poder
 *  mandarlos, el problema no es la analítica y no vale la pena comerse la
 *  memoria del teléfono de una alumna guardándolos. */
const TOPE_COLA = 50;

/** El token es público a propósito: va en el navegador y solo sirve para ESCRIBIR. */
const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "";

/**
 * Enciende Mixpanel. Idempotente y solo en el navegador.
 *
 * Sin token no hace nada y no revienta: en desarrollo, en las pruebas y en
 * cualquier despliegue donde no se haya configurado, la app funciona igual y los
 * eventos se pierden en silencio. Una analítica que tumba la app es peor que no
 * tener analítica.
 */
export function iniciarMixpanel(): void {
  if (listo || typeof window === "undefined" || TOKEN === "") return;

  mixpanel.init(TOKEN, {
    autocapture: true,
    track_pageview: true,

    /*
      ⚠️ GRABACIÓN DE SESIÓN ENCENDIDA EL 2026-11-01, Y CON CONDICIONES.

      Estuvo apagada a propósito mientras El Charcu grababa el 100%, porque
      aquí lo que se graba son mujeres subiendo FOTOS de su trabajo y
      escribiendo dudas sobre lo que hacen en su casa: material personal de una
      forma que un sitio de recetas no lo es. Cristian pidió encenderla para
      entender dónde se traba la gente antes de pagar.

      Se enciende CON LAS DOS CONDICIONES QUE LA HACEN ACEPTABLE, y ninguna es
      opcional:

        1. LA POLÍTICA DE PRIVACIDAD SE CAMBIÓ PRIMERO. Decía literalmente "ni
           grabamos lo que haces en pantalla" — encenderla sin tocar esa frase
           no habría sido una omisión, habría sido desmentir por escrito algo
           que la app promete. Ahora dice qué se graba, qué se tapa y cuánto
           dura. Ver `components/legal/Privacidad.tsx`.
        2. TODO LO QUE ELLA ESCRIBE O SUBE VA TAPADO. `record_mask_text_selector:
           "*"` tapa TODOS los textos de la pantalla y `record_block_selector`
           las imágenes y videos. Se graba por dónde se mueve, no lo que dice.

      ⚠️ SI ALGUIEN AFLOJA EL ENMASCARADO para "ver mejor qué escribió", rompe
      la promesa de la política y convierte esto en un problema legal. El valor
      está en ver DÓNDE se traba, y para eso no hace falta leerla.
    */
    record_sessions_percent: 100,
    /* `*` = todos los textos. Mixpanel por defecto solo tapa los campos de
       formulario, y aquí las preguntas al Ojo Experto se ven en pantalla como
       texto normal, no dentro de un input. */
    record_mask_text_selector: "*",
    /* Las fotos que sube y los videos del curso: fuera de la grabación. */
    record_block_selector: "img,video,canvas,[data-privado]",

    // Sin esto, Mixpanel guarda la IP completa. La IP es dato personal y para
    // este embudo no aporta nada: el país lo da igual la agregación.
    ip: false,
  });

  listo = true;

  // Lo que llegó mientras tanto sale ahora, en orden.
  while (enEspera.length > 0) {
    const pendiente = enEspera.shift();
    if (pendiente) enviar(pendiente.evento, pendiente.propiedades);
  }
}

/** El envío de verdad. Separado para que la cola pueda reutilizarlo. */
function enviar(evento: string, propiedades?: Propiedades): void {
  try {
    mixpanel.track(evento, propiedades);
  } catch {
    // Un fallo de analítica jamás interrumpe lo que la usuaria estaba haciendo.
  }
}

/**
 * Manda un evento.
 *
 * No revienta nunca: si Mixpanel no está encendido, no hace nada. Ninguna
 * pantalla debe dejar de funcionar porque la analítica falle.
 */
export function medir(evento: string, propiedades?: Propiedades): void {
  if (typeof window === "undefined") return;

  // Todavía no hay con qué mandarlo: se guarda y sale al encender.
  if (!listo) {
    if (enEspera.length < TOPE_COLA) enEspera.push({ evento, propiedades });
    return;
  }

  enviar(evento, propiedades);
}

/**
 * Ata los eventos a la cuenta cuando la alumna entra.
 *
 * ⚠️ Se le pasa el ID de Supabase, NO el correo. El correo es dato personal y
 * mandarlo a un tercero sin necesidad es regalar algo que no hace falta: el ID
 * permite cruzar el panel con la base cuando haga falta, y no identifica a
 * nadie por sí solo fuera de aquí.
 */
export function identificar(userId: string): void {
  if (!listo || userId === "") return;
  try {
    mixpanel.identify(userId);
  } catch {
    // idem
  }
}

/**
 * Propiedades que se pegan SOLAS a todos los eventos, también a los futuros.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ EL PAÍS NO ESTABA EN NINGÚN EVENTO (arreglado el 2026-11-01)
 * ════════════════════════════════════════════════════════════════════════════
 * El país se calcula en el SERVIDOR —Vercel lo saca de la conexión y
 * `detectarPais()` lo lee— y Mixpanel vive en el NAVEGADOR. Nadie había hecho
 * el puente entre los dos, así que el dato existía, se guardaba en
 * `sesiones_pais`… y no llegaba al panel. Cristian lo notó al preguntar por qué
 * no podía segmentar por país.
 *
 * Se registran como SUPER PROPIEDADES y no se pasan evento por evento: así van
 * en todo lo que se mida de ahora en adelante sin que nadie tenga que
 * acordarse. Mixpanel las guarda en el navegador de la persona y las repite en
 * cada envío.
 *
 * ⚠️ NO ARREGLA EL PASADO. Los eventos que ya se mandaron no tienen país y no
 * se les puede añadir; esto empieza a contar desde que se despliega.
 *
 * ⚠️ NADA DE DATOS PERSONALES AQUÍ. País y región son agregados; el `user_id`
 * va por `identify`, no por aquí, y el correo no sale nunca de casa.
 */
export function registrarContexto(props: Propiedades): void {
  if (!listo) return;
  try {
    const limpias = Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined && v !== ""),
    );
    mixpanel.register(limpias);
  } catch {
    // Igual que el resto: la analítica nunca interrumpe a quien está usando la app.
  }
}
