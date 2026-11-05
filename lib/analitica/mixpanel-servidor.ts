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

type Props = Record<string, string | number | boolean | null | undefined>;

/* 3 s de tope: el webhook entero tiene 10 antes de que OnePay lo dé por
   fallido y empiece a reintentar. La analítica no se los puede comer. */
const TOPE_MS = 3000;

/**
 * Manda un evento desde el servidor, atado al `user_id` de Supabase.
 *
 * `idUnico` es lo que lo hace IDEMPOTENTE (`$insert_id`): el webhook de OnePay
 * reintenta hasta 6 veces el mismo evento, y sin esto cada reintento contaría
 * como una venta más en el panel.
 *
 * `?ip=0`: la IP sería la del servidor de Vercel, no la de la alumna, y
 * geolocalizarla pintaría a todas en Estados Unidos (lección de El Charcu).
 */
export async function medirServidor(
  evento: string,
  userId: string,
  props: Props & { correo?: string | null },
  idUnico: string,
): Promise<void> {
  if (TOKEN === "" || userId === "") return;

  const { correo, ...resto } = props;
  const cuerpo = [
    {
      event: evento,
      properties: {
        ...resto,
        token: TOKEN,
        distinct_id: userId,
        time: Date.now(),
        $insert_id: idUnico.slice(0, 36 * 2),
        user_id: userId,
        ...(correo ? { correo } : {}),
        origen_evento: "servidor",
      },
    },
  ];

  try {
    await fetch("https://api.mixpanel.com/track?ip=0", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(TOPE_MS),
    });
  } catch {
    // Ver la cabecera: una medición perdida jamás tumba un pago.
  }

  /*
   * ⚠️ LA FICHA TAMBIÉN, NO SOLO EL EVENTO (2026-11-04). Quien paga ANTES de
   * tener cuenta nunca pasó por el navegador con sesión, así que su ficha de
   * Mixpanel no tenía correo y el pago aparecía colgado de un número que nadie
   * reconoce. Con `$set` la ficha queda con su correo desde el primer evento.
   */
  if (correo) await fijarCorreo(userId, correo);
}

/** Pone el correo en la ficha de la persona (`Users` en Mixpanel). */
async function fijarCorreo(userId: string, correo: string): Promise<void> {
  try {
    await fetch("https://api.mixpanel.com/engage?ip=0", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/plain" },
      body: JSON.stringify([
        { $token: TOKEN, $distinct_id: userId, $set: { $email: correo, user_id: userId } },
      ]),
      signal: AbortSignal.timeout(TOPE_MS),
    });
  } catch {
    // idem
  }
}

/** El pago entró y la membresía quedó activa. Cierra el embudo de venta. */
export async function medirPagoConfirmado(
  userId: string,
  datos: { proveedor: string; suscripcion?: string; correo?: string | null },
): Promise<void> {
  await medirServidor(
    EVENTOS.pagoConfirmado,
    userId,
    { ...datos, origen: "webhook" },
    `${EVENTOS.pagoConfirmado}:${userId}:${datos.suscripcion ?? ""}`,
  );
}
