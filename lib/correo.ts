import { reportarAviso } from "@/lib/fallos";

/**
 * Mandar un correo. Una sola puerta para toda la app.
 *
 * ⚠️ ESTO ESTABA COPIADO DENTRO DEL FORMULARIO DE CONTACTO. Con un solo correo
 * en todo el proyecto daba igual; con el de bienvenida ya son dos, y dos copias
 * del mismo `fetch` significan que el día que haya que cambiar el remitente,
 * añadir una cabecera de entregabilidad o tocar el manejo de errores, uno de los
 * dos se queda atrás sin que nadie lo note.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ UN CORREO QUE FALLA NO PUEDE TUMBAR LO QUE LO PROVOCÓ
 * ════════════════════════════════════════════════════════════════════════════
 * Esta función NUNCA lanza. Devuelve si pudo o no, y deja el aviso.
 *
 * El motivo es concreto: quien llama es el webhook de pagos. Si Resend está
 * caído y dejáramos que la excepción subiera, la ruta devolvería 500, OnePay lo
 * tomaría por un fallo nuestro y REINTENTARÍA el mismo pago — con el riesgo de
 * que un endpoint que falla sostenidamente acabe desactivado. Es decir:
 * perderíamos los pagos siguientes por no haber podido mandar un correo.
 *
 * El acceso ya está dado cuando esto corre. El correo es la cortesía.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Correo = {
  para: string;
  asunto: string;
  html: string;
  /** La versión en texto plano. NO es opcional: ver abajo. */
  texto: string;
  responderA?: string;
};

export type ResultadoEnvio = { enviado: true } | { enviado: false; motivo: string };

export async function enviarCorreo(correo: Correo): Promise<ResultadoEnvio> {
  const clave = process.env.RESEND_API_KEY;
  const desde = process.env.RESEND_FROM;

  if (!clave || !desde) {
    // En local no suele haber claves y eso es normal: se dice y se sigue.
    return { enviado: false, motivo: "faltan RESEND_API_KEY y/o RESEND_FROM" };
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: desde,
        to: correo.para,
        subject: correo.asunto,
        html: correo.html,
        /*
         * ⚠️ SIEMPRE LAS DOS VERSIONES. Un correo solo-HTML puntúa peor en los
         * filtros de spam, y es justo el correo que MENOS se puede permitir
         * caer en spam: es el que lleva el acceso de alguien que acaba de pagar.
         */
        text: correo.texto,
        ...(correo.responderA ? { reply_to: correo.responderA } : {}),
      }),
    });

    if (!r.ok) {
      const detalle = await r.text().catch(() => "");
      reportarAviso("correo", "Resend rechazó el envío", {
        asunto: correo.asunto,
        estado: String(r.status),
        detalle: detalle.slice(0, 300),
      });
      return { enviado: false, motivo: `Resend respondió ${r.status}` };
    }

    return { enviado: true };
  } catch (e) {
    reportarAviso("correo", "no se pudo contactar con Resend", {
      asunto: correo.asunto,
      error: e instanceof Error ? e.message : String(e),
    });
    return { enviado: false, motivo: "Resend no respondió" };
  }
}
