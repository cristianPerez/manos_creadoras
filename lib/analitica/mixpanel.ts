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
export function iniciarMixpanel(contexto: Propiedades = {}): void {
  if (listo || typeof window === "undefined" || TOKEN === "") return;

  mixpanel.init(TOKEN, {
    /*
     * ⚠️ TODO EL AUTOCAPTURE MENOS LA VISTA DE PÁGINA (2026-11-05). La vista
     * automática sale DENTRO de `init`, antes de que se pueda registrar nada
     * —ni siquiera en `loaded`—, así que llegaba sin variante ni país (medido
     * con una visitante nueva). La mandamos a mano: al encender, justo después
     * de registrar el contexto, y en cada cambio de página dentro de la app
     * (`medirVistaDePagina`, desde `<Analitica>`). Clics, campos, envíos y
     * scroll siguen automáticos.
     */
    autocapture: { pageview: false },
    track_pageview: false,

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

    /*
      Sin esto, Mixpanel usa la IP. La IP es dato personal y no hace falta:
      país, departamento y ciudad los da Vercel y `<Analitica>` los manda con
      los nombres OFICIALES de Mixpanel (`mp_country_code`, `$region`,
      `$city`), así que sus columnas Country/Region/City se llenan igual que
      en El Charcu sin entregarle la IP (2026-11-04).
    */
    ip: false,
  });

  /*
   * ⚠️ EL CONTEXTO (VARIANTE DEL A/B, PAÍS) SE REGISTRA AQUÍ, ANTES DE SOLTAR
   * LA COLA Y ANTES DE LA VISTA DE PÁGINA (arreglado el 2026-11-05, el día del
   * primer tráfico al experimento).
   *
   * React corre los efectos de los hijos antes que los del padre: el
   * `<Medir evento="pagina_ventas_vista">` de la página disparaba ANTES de que
   * `<Analitica>` registrara `experimento_precio`, el evento quedaba en la
   * cola, y la cola salía al encender… todavía sin variante. Resultado medido
   * en local: `pagina_ventas_vista` salía con la variante de la VISITA
   * ANTERIOR (la que Mixpanel guardó en el navegador) o, en una visitante
   * nueva, sin ninguna. Era el primer paso del embudo: sin variante, el
   * embudo no se podía partir en A y B.
   */
  registrarSinComprobar(contexto);
  try {
    mixpanel.track_pageview();
  } catch {
    // idem
  }

  listo = true;

  // Lo que llegó mientras tanto sale ahora, en orden, ya con el contexto.
  while (enEspera.length > 0) {
    const pendiente = enEspera.shift();
    if (pendiente) enviar(pendiente.evento, pendiente.propiedades);
  }
}

/**
 * La vista de página al navegar DENTRO de la app (el autocapture de vistas
 * está apagado, ver `iniciarMixpanel`). La primera de cada carga la manda el
 * propio encendido.
 */
export function medirVistaDePagina(): void {
  if (!listo) return;
  try {
    mixpanel.track_pageview();
  } catch {
    // idem
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
 * Ata los eventos a la cuenta cuando la alumna entra: su ID de Supabase y su
 * correo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL CORREO SÍ VA A MIXPANEL DESDE EL 2026-11-04 (pedido de Cristian)
 * ════════════════════════════════════════════════════════════════════════════
 * Antes solo iba el ID, para no entregarle un dato personal a un tercero. El
 * costo se vio con la primera venta real: para saber qué hizo diliar… hubo que
 * buscar su ID en la base, y un pago que entró ANTES de existir la cuenta no
 * se podía reconciliar con nadie. Con el correo, el panel se lee por persona.
 *
 * La política de privacidad se cambió en el MISMO cambio (punto de Mixpanel en
 * `components/legal/Privacidad.tsx`): mandar el correo sin decirlo habría sido
 * desmentir por escrito lo que la app promete. Lo que escriben y las fotos
 * siguen tapados en las grabaciones.
 *
 * Tres sitios, cada uno por una razón:
 *   · `identify(userId)`  → el recorrido anónimo de antes se une a la cuenta.
 *   · `people.set($email)` → la ficha de la persona en "Users" lleva el correo.
 *   · `register(correo)`  → CADA evento lo lleva, para filtrar sin abrir fichas.
 */
export function identificar(userId: string, correo?: string | null): void {
  if (!listo || userId === "") return;
  try {
    mixpanel.identify(userId);
    if (correo) {
      mixpanel.people.set({ $email: correo, user_id: userId });
      mixpanel.register({ correo, user_id: userId });
    }
  } catch {
    // idem
  }
}

/**
 * Datos que van a la FICHA de la persona (la pestaña "Users" de Mixpanel), no
 * a los eventos. Solo con sesión: una ficha sin identidad no se puede unir a
 * nada.
 *
 * ⚠️ HACE FALTA PARA LEER EL A/B EN LOS PAGOS (2026-11-05). `pago_confirmado`
 * lo manda el SERVIDOR (el webhook de OnePay), que no hereda las super
 * propiedades del navegador: sin esto, ese evento no tiene `experimento_precio`
 * y un reporte de pagos no se podría partir en las dos versiones. Con la
 * variante en la ficha, cualquier reporte —pagos incluidos— se parte con
 * "Breakdown → User property → experimento_precio".
 */
export function fijarEnFicha(props: Propiedades): void {
  if (!listo) return;
  try {
    const limpias = Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined && v !== ""),
    );
    if (Object.keys(limpias).length > 0) mixpanel.people.set(limpias);
  } catch {
    // idem
  }
}

/**
 * Al cerrar sesión: que lo siguiente que se mida en este navegador no se le
 * atribuya a ella (un celular compartido en casa es lo normal aquí).
 */
export function olvidarIdentidad(): void {
  if (!listo) return;
  try {
    mixpanel.reset();
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
 * ⚠️ AQUÍ SOLO VA EL CONTEXTO DEL LUGAR. La identidad (ID y correo) la pone
 * `identificar`, que es quien sabe si hay sesión.
 */
export function registrarContexto(props: Propiedades): void {
  if (!listo) return;
  registrarSinComprobar(props);
}

/** `register` de verdad, sin mirar `listo` (lo usa también `iniciarMixpanel`). */
function registrarSinComprobar(props: Propiedades): void {
  try {
    const limpias = Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined && v !== ""),
    );
    mixpanel.register(limpias);
    /*
     * ⚠️ EL A/B DE PALETA TERMINÓ EL 2026-11-07. Mixpanel guarda las super
     * propiedades en el navegador para siempre: quien ya había visitado
     * seguiría mandando `experimento_paleta: "actual"` en cada evento y
     * ensuciaría los informes. Se borra aquí, en cada registro de contexto.
     */
    mixpanel.unregister("experimento_paleta");
  } catch {
    // Igual que el resto: la analítica nunca interrumpe a quien está usando la app.
  }
}
