import type { Correo } from "@/lib/correo";

/**
 * El correo que recibe una alumna cuando su pago entra.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ ESTE ES EL CORREO MÁS IMPORTANTE DEL NEGOCIO, Y POR UN MOTIVO CONCRETO
 * ════════════════════════════════════════════════════════════════════════════
 * Entre pagar en OnePay y entrar al curso hay un hueco: el cobro ocurre en la
 * pasarela, fuera de la app, y quien paga se queda mirando una pantalla que no
 * es nuestra. Si en ese momento no llega nada, la sensación no es "ya está" —
 * es "¿me habrán cobrado?". Ese silencio es el que produce las devoluciones y
 * los mensajes de "no me llegó nada" a las dos horas.
 *
 * Por eso el correo dice TRES cosas, en este orden:
 *   1. Tu pago entró (la tranquilidad primero).
 *   2. Entra por aquí (un botón, uno solo).
 *   3. Qué hacer al llegar (para que no se quede mirando el menú).
 *
 * ⚠️ NO LLEVA CONTRASEÑA NI ENLACE MÁGICO. Se entra con el mismo correo con el
 * que ya tiene cuenta. Mandar credenciales por correo es exactamente lo que
 * hacen las estafas, y además obligaría a generarlas aquí dentro — donde un
 * reintento del webhook las regeneraría y dejaría la anterior muerta.
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Los colores salen de FICHA-ARTE.md y van EN LÍNEA a propósito: los clientes
 * de correo (Gmail, Outlook) tiran las hojas de estilo y las variables CSS.
 */

const CREMA = "#FBF6EE";
const MARFIL = "#FFFDF9";
const ESPRESSO = "#2A1F19";
const TEXTO = "#5E4D40";
const APAGADO = "#6B5A4C";
const DORADO = "#8C6A2F";
const DORADO_CLARO = "#D9B97A";
const LINEA = "#E5D6BF";

/** Lo que hay que hacer al entrar. Es lo que evita el "¿y ahora qué?". */
const PRIMEROS_PASOS = [
  "Empieza por las cápsulas: son las bases que usan todos los bolsos.",
  "Elige tu primer bolso y ten a mano los materiales de su lista.",
  "Si te atascas, pregúntale al Ojo Experto desde cualquier pantalla.",
] as const;

export function correoDeBienvenida({ para, inicio }: { para: string; inicio: string }): Correo {
  const asunto = "Ya tienes acceso al curso completo 🤍";

  /*
   * El texto plano NO es un resumen del HTML: es el mismo mensaje completo.
   * Quien lea esta versión —por preferencia o porque su cliente no carga
   * imágenes— tiene que poder entrar igual, así que el enlace va escrito entero.
   */
  const texto = [
    "Tu pago entró. Ya tienes el curso completo.",
    "",
    `Entra aquí: ${inicio}`,
    `Usa este mismo correo: ${para}`,
    "",
    "Para empezar:",
    ...PRIMEROS_PASOS.map((p, i) => `${i + 1}. ${p}`),
    "",
    "Tienes 7 días de garantía: si el curso no es para ti, nos escribes y te devolvemos el dinero.",
    "",
    "Con cariño,",
    "Elizabeth · Manos Creadoras",
  ].join("\n");

  const pasos = PRIMEROS_PASOS.map(
    (p, i) => `
      <tr>
        <td style="padding:0 0 14px 0;vertical-align:top;width:30px;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;
                       border-radius:12px;background:${CREMA};color:${DORADO};
                       font-family:Georgia,serif;font-size:13px;font-weight:bold;">${i + 1}</span>
        </td>
        <td style="padding:0 0 14px 0;font-size:15px;line-height:1.55;color:${TEXTO};">${p}</td>
      </tr>`,
  ).join("");

  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${asunto}</title></head>
<body style="margin:0;padding:0;background:${CREMA};">
  <!-- El preheader: la línea que Gmail enseña junto al asunto. Si no se pone,
       enseña el primer texto que encuentre, que suele ser basura. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Tu pago entró. Entra con ${para} y empieza por las cápsulas.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:${CREMA};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:${MARFIL};border:1px solid ${LINEA};border-radius:24px;overflow:hidden;">

        <tr><td style="background:${ESPRESSO};padding:36px 32px;text-align:center;">
          <p style="margin:0 0 10px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;
                    letter-spacing:0.2em;text-transform:uppercase;color:${DORADO_CLARO};">
            Manos Creadoras
          </p>
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:500;
                     font-size:32px;line-height:1.2;color:#ffffff;">
            Ya estás dentro
          </h1>
        </td></tr>

        <tr><td style="padding:32px 32px 8px 32px;">
          <p style="margin:0 0 22px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;
                    line-height:1.6;color:${TEXTO};">
            Tu pago entró y tu acceso al <strong style="color:${ESPRESSO};">curso completo</strong>
            quedó abierto. Todos los bolsos, todas las cápsulas y el Ojo Experto para tus dudas.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:0 0 10px 0;">
              <a href="${inicio}"
                 style="display:inline-block;background:${DORADO};color:#ffffff;text-decoration:none;
                        font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;
                        padding:16px 40px;border-radius:999px;">
                Entrar al curso
              </a>
            </td></tr>
            <tr><td align="center" style="padding:0 0 26px 0;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${APAGADO};">
                Entra con este mismo correo:<br>
                <strong style="color:${ESPRESSO};">${para}</strong>
              </p>
            </td></tr>
          </table>

          <div style="border-top:1px solid ${LINEA};padding-top:24px;">
            <p style="margin:0 0 16px 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;
                      letter-spacing:0.18em;text-transform:uppercase;color:${DORADO};font-weight:bold;">
              Por dónde empezar
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="font-family:Helvetica,Arial,sans-serif;">${pasos}</table>
          </div>
        </td></tr>

        <tr><td style="padding:22px 32px 32px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="background:${CREMA};border-radius:16px;">
            <tr><td style="padding:18px 20px;font-family:Helvetica,Arial,sans-serif;
                           font-size:13.5px;line-height:1.55;color:${TEXTO};">
              <strong style="color:${ESPRESSO};">Garantía de 7 días.</strong>
              Si el curso no es para ti, respondes a este correo dentro de los primeros
              7 días y te devolvemos el dinero. Sin explicaciones.
            </td></tr>
          </table>
        </td></tr>

      </table>

      <p style="max-width:560px;margin:20px auto 0 auto;font-family:Helvetica,Arial,sans-serif;
                font-size:12px;line-height:1.5;color:${APAGADO};text-align:center;">
        Recibes este correo porque acabas de unirte al curso.<br>
        Con cariño, Elizabeth · Manos Creadoras
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  return { para, asunto, html, texto };
}
