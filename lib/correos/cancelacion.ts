import type { Correo } from "@/lib/correo";

/**
 * El aviso INTERNO de que una alumna se dio de baja. No lo lee ella.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ESTE CORREO ES LA RED DE SEGURIDAD, NO EL MECANISMO
 * ════════════════════════════════════════════════════════════════════════════
 * Lo normal es que el botón ya haya eliminado la suscripción en OnePay por API
 * y aquí solo haya que enterarse. Pero si esa llamada falla —OnePay caído, la
 * clave mal puesta, un 500 suyo— la alumna queda cancelada en NUESTRA base y
 * el cobro sigue vivo en la pasarela. Si nadie entra al panel a cancelarla,
 * **se le vuelve a cobrar a alguien a quien le dijimos que había cancelado**.
 *
 * Por eso el correo tiene dos caras y se distinguen desde el asunto: cuando
 * hace falta mano humana, el asunto empieza por "ACCIÓN" y el cuerpo dice qué
 * hacer, con el id de la suscripción listo para buscar en el panel. Cuando no
 * hace falta nada, es un aviso tranquilo.
 *
 * Va en texto, sin diseño: lo leen dos personas conocidas, no una clienta.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type DatosCancelacion = {
  /** El correo de la alumna. Va aquí porque es un correo interno, NUNCA a un log. */
  correoAlumna: string;
  /** El id de la suscripción en OnePay, para buscarla en el panel. */
  suscripcionId: string | null;
  /** Hasta cuándo conserva el acceso (ya formateada, en español). */
  accesoHasta: string | null;
  /** Qué pasó con la llamada a la API de OnePay. */
  bajaEnPasarela: "eliminada" | "ya-no-estaba" | "fallo";
  /** El motivo técnico, solo cuando falló. */
  motivo?: string;
};

export function correoDeCancelacion(d: DatosCancelacion): Correo {
  const hayQueHacerAlgo = d.bajaEnPasarela === "fallo";

  const lineas: string[] = [
    hayQueHacerAlgo
      ? "La alumna canceló desde la app, pero NO pudimos dar de baja su suscripción en OnePay."
      : "Una alumna canceló su membresía desde la app.",
    "",
    `Alumna: ${d.correoAlumna}`,
    `Suscripción en OnePay: ${d.suscripcionId ?? "(no tenemos el id — pagó antes de que lo guardáramos, o la activamos a mano)"}`,
    `Conserva el acceso hasta: ${d.accesoHasta ?? "(sin fecha registrada)"}`,
    "",
  ];

  if (hayQueHacerAlgo) {
    lineas.push(
      "⚠️ HAY QUE CANCELARLA A MANO EN EL PANEL DE ONEPAY.",
      "",
      `Motivo del fallo: ${d.motivo ?? "desconocido"}`,
      "",
      "Si no se hace, se le volverá a cobrar a alguien a quien la app ya le dijo",
      "que había cancelado. En su cuenta ya aparece como cancelada, así que para",
      "ella el asunto está cerrado: el hueco está solo en la pasarela.",
      "",
      "Pasos: entrar a OnePay → Suscripciones → buscar el id de arriba → eliminar.",
    );
  } else if (d.bajaEnPasarela === "ya-no-estaba") {
    lineas.push(
      "La suscripción ya no existía en OnePay (seguramente se canceló antes a",
      "mano, o pulsó el botón dos veces). No hay nada que hacer.",
    );
  } else {
    lineas.push(
      "La suscripción ya está eliminada en OnePay. No hay nada que hacer.",
      "",
      "El acceso NO se le cortó: conserva hasta la fecha de arriba el período",
      "que ya pagó.",
    );
  }

  const texto = lineas.join("\n");

  return {
    para: DESTINATARIOS,
    asunto: hayQueHacerAlgo
      ? `ACCIÓN: cancelar a mano en OnePay — ${d.correoAlumna}`
      : `Cancelación: ${d.correoAlumna}`,
    texto,
    /*
     * `<pre>` y no un diseño: es un correo operativo entre dos personas, y el
     * monoespaciado mantiene alineado el id de la suscripción, que es lo que
     * hay que copiar y pegar en el panel.
     */
    html: `<pre style="font:14px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;">${escapar(texto)}</pre>`,
  };
}

/**
 * Quién se entera. Los dos, a propósito (decisión de Cristian del 2026-10-19):
 * si dependiera de una sola persona de vacaciones, el aviso de "cancelar a
 * mano" se quedaría sin leer y la alumna acabaría con un cobro de más.
 */
const DESTINATARIOS = ["cperez354@gmail.com", "elizabethvalenciahenao24@gmail.com"];

/** Para que un "<" en un correo raro no rompa el HTML. */
function escapar(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
