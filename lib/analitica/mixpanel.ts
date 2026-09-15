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
}

/**
 * Manda un evento.
 *
 * No revienta nunca: si Mixpanel no está encendido, no hace nada. Ninguna
 * pantalla debe dejar de funcionar porque la analítica falle.
 */
export function medir(evento: string, propiedades?: Propiedades): void {
  if (!listo) return;
  try {
    mixpanel.track(evento, propiedades);
  } catch {
    // Un fallo de analítica jamás interrumpe lo que la usuaria estaba haciendo.
  }
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
