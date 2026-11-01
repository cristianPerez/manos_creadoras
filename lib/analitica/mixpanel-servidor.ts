import { EVENTOS } from "@/lib/analitica/eventos";

/**
 * Eventos que manda el SERVIDOR a Mixpanel.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ HACE FALTA, SI YA MEDIMOS DESDE EL NAVEGADOR (2026-11-01)
 * ════════════════════════════════════════════════════════════════════════════
 * Porque el pago NO OCURRE EN NUESTRA WEB. La alumna toca "Inscribirme", se va
 * a OnePay y allí paga —o no—. El navegador se entera de que se fue
 * (`checkout_abierto`) y de nada más: quien paga lo hace en otro dominio y
 * muchas veces cierra la pestaña al terminar.
 *
 * Resultado: el embudo moría en "abrió el pago" y el salto más caro de todo el
 * negocio —de abrir la pasarela a pagar de verdad, donde se cae la mayoría—
 * era invisible. El ÚNICO que sabe que el pago entró es el webhook.
 *
 * ⚠️ SE ATA CON EL `user_id` DE SUPABASE, y por eso funciona: el navegador hace
 * `identify(user_id)` al entrar, así que Mixpanel ya conoce a esa persona por
 * ese identificador. Mandando el evento con el mismo `distinct_id`, el pago se
 * pega al recorrido que ella hizo en el home.
 *
 * ⚠️ NUNCA REVIENTA NADA. Si Mixpanel está caído o falta el token, se traga el
 * error en silencio: perder una medición es molesto, pero que una alumna que
 * acaba de pagar se quede sin acceso porque falló la analítica es inaceptable.
 * Por eso tampoco se espera la respuesta más de lo imprescindible — el webhook
 * tiene 10 segundos antes de que OnePay lo dé por fallido.
 */

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? "";

type Props = Record<string, string | number | boolean | undefined>;

async function enviar(evento: string, userId: string, props: Props): Promise<void> {
  if (TOKEN === "" || userId === "") return;

  const cuerpo = [
    {
      event: evento,
      properties: {
        token: TOKEN,
        distinct_id: userId,
        /* `$insert_id` es lo que hace a esto IDEMPOTENTE: el webhook de OnePay
           reintenta hasta 6 veces el mismo evento, y sin esto cada reintento
           contaría como una venta más en el panel. */
        $insert_id: `${evento}:${userId}:${props.suscripcion ?? ""}`,
        origen: "webhook",
        ...props,
      },
    },
  ];

  try {
    await fetch("https://api.mixpanel.com/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
      body: JSON.stringify(cuerpo),
      /* 3 s de tope: el webhook entero tiene 10 antes de que OnePay lo dé por
         fallido y empiece a reintentar. La analítica no se los puede comer. */
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Ver la cabecera: una medición perdida jamás tumba un pago.
  }
}

/** El pago entró y la membresía quedó activa. Cierra el embudo de venta. */
export async function medirPagoConfirmado(
  userId: string,
  datos: { proveedor: string; suscripcion?: string },
): Promise<void> {
  await enviar(EVENTOS.pagoConfirmado, userId, datos);
}
