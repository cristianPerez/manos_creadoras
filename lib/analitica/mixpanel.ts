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
      ⚠️ GRABACIÓN DE SESIÓN APAGADA, a diferencia de El Charcu, que graba el
      100%. Aquí no se activa y no es un olvido:

        · Lo que se grabaría son mujeres subiendo FOTOS de su trabajo y
          escribiendo dudas sobre lo que están haciendo en su casa. Es material
          personal de una forma que un sitio de recetas no lo es.
        · La política de privacidad de la app no menciona ninguna grabación. Si
          se enciende, hay que actualizarla ANTES, no después.

      Si algún día hace falta para depurar un embudo concreto, se enciende a
      propósito, por un tiempo acotado y con el aviso legal puesto — no por
      defecto y para siempre.
    */
    record_sessions_percent: 0,

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
