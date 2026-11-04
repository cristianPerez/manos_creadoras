import { medirPagoConfirmado } from "@/lib/analitica/mixpanel-servidor";
import { enviarCorreo } from "@/lib/correo";
import { correoDeBienvenida } from "@/lib/correos/bienvenida";
import { reportarAviso } from "@/lib/fallos";
import type { supabaseAdmin } from "@/lib/supabase/admin";
import type { Rastro } from "@/lib/webhooks/rastro";
import type { EventoNormalizado } from "@/lib/webhooks/tipos";

/*
 * Lo que se HACE con un evento de pago ya verificado: encontrar a la alumna,
 * activar o cortar su membresía y darle la bienvenida.
 *
 * Vive aparte de la ruta del webhook (2026-11-04) porque hay DOS sitios que lo
 * usan: el webhook, cuando llega el aviso de la pasarela, y
 * `lib/pagos-huerfanos.ts`, cuando alguien que ya había pagado crea su cuenta
 * después. Los dos tienen que hacer exactamente lo mismo.
 */

/**
 * Le manda el correo de "ya estás dentro" — una sola vez en la vida.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ SE RESERVA EL ENVÍO ANTES DE ENVIAR, Y ESE ORDEN IMPORTA
 * ════════════════════════════════════════════════════════════════════════════
 * El `update ... where bienvenida_enviada_el is null` es lo que decide quién
 * manda: si devuelve una fila, esta ejecución se lo ha quedado; si devuelve
 * cero, otra ya iba por ello. Comprobar-y-luego-enviar dejaría una ventana en
 * la que dos reintentos simultáneos de OnePay mandan dos correos.
 *
 * Y si después el envío falla, la marca se DEVUELVE a null: de lo contrario la
 * alumna se quedaría sin su correo para siempre, porque el sistema creería que
 * ya se lo mandó. Se prefiere el riesgo de un correo repetido —molesto— al de
 * uno que nunca llega, que es alguien que pagó y no sabe cómo entrar.
 * ════════════════════════════════════════════════════════════════════════════
 */
async function darLaBienvenida(
  db: ReturnType<typeof supabaseAdmin>,
  userId: string,
  origen: string,
  rastro: Rastro,
) {
  const { data: reservada } = await db
    .from("membresias")
    .update({ bienvenida_enviada_el: new Date().toISOString() })
    .eq("user_id", userId)
    .is("bienvenida_enviada_el", null)
    .select("user_id");

  // Ya se la mandamos antes: esto es una renovación, no una entrada.
  if (!reservada || reservada.length === 0) {
    rastro.paso("sin bienvenida (ya se mandó)");
    return;
  }

  const devolverLaMarca = () =>
    db.from("membresias").update({ bienvenida_enviada_el: null }).eq("user_id", userId);

  /*
   * ⚠️ SE ESCRIBE AL CORREO DE SU CUENTA, NO AL DEL CHECKOUT. Son el mismo en
   * el caso normal, pero cuando no lo son el de la cuenta es el único por el
   * que puede entrar — mandarle el acceso al otro sería decirle "entra con un
   * correo que no tiene cuenta".
   */
  const { data: perfil } = await db
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (!perfil?.email) {
    await devolverLaMarca();
    reportarAviso("correo", "activada sin correo al que escribir", {
      traza: rastro.traza,
      userId,
    });
    return;
  }

  const resultado = await enviarCorreo(
    correoDeBienvenida({ para: perfil.email, inicio: `${origen}/app` }),
  );

  if (!resultado.enviado) {
    await devolverLaMarca();
    reportarAviso("correo", "la bienvenida no salió", {
      traza: rastro.traza,
      userId,
      motivo: resultado.motivo,
    });
    rastro.paso("bienvenida NO salió", { motivo: resultado.motivo });
    return;
  }

  rastro.paso("bienvenida enviada");
}

/**
 * Lleva el evento a la membresía de la alumna.
 *
 * ⚠️ TODAVÍA NO SABEMOS DE QUIÉN ES CADA PAGO. El webhook trae el id de cliente
 * de la pasarela, no nuestro `user_id`, y el enlace de cobro es genérico: no
 * lleva ninguna referencia nuestra. Mientras eso no se resuelva con OnePay, un
 * pago de alguien a quien no reconocemos queda como 'huerfano' — guardado,
 * visible y avisado, para activarlo a mano y no perderlo.
 */
export async function aplicar(
  db: ReturnType<typeof supabaseAdmin>,
  eventoId: string,
  proveedor: string,
  evento: EventoNormalizado,
  /** El origen de la app, para componer el enlace del correo de bienvenida. */
  origen: string,
  rastro: Rastro,
) {
  const cerrar = (estado: string, nota?: string) =>
    db
      .from("webhook_eventos")
      .update({ estado, nota, procesado_en: new Date().toISOString() })
      .eq("id", eventoId);

  if (evento.tipo === "desconocido") {
    await cerrar("procesado", "evento que no nos afecta");
    return;
  }

  /*
   * ── ¿DE QUIÉN ES ESTE PAGO? ────────────────────────────────────────────
   *
   * Dos intentos, en este orden:
   *
   * 1. Por la suscripción, si ya la habíamos visto. Es el camino fiable: el id
   *    no cambia aunque la alumna cambie de correo.
   *
   * 2. ⚠️ POR CORREO, que es el ÚNICO puente la primera vez. El enlace de cobro
   *    es genérico y no lleva nada nuestro, así que cuando alguien paga por
   *    primera vez lo único que los une es el correo que escribió en el
   *    checkout. Si ahí puso otro distinto al de su cuenta, no hay forma de
   *    saberlo y el evento queda huérfano — por eso se guarda y se avisa en vez
   *    de descartarse.
   */
  let userId: string | null = null;

  const { data: porSuscripcion } = await db
    .from("membresias")
    .select("user_id")
    .eq("proveedor", proveedor)
    .eq("suscripcion_externa_id", evento.recursoId)
    .maybeSingle();

  if (porSuscripcion) {
    userId = porSuscripcion.user_id;
    // Qué camino identificó a la alumna importa: si casi todo entra "por
    // correo" significa que no estamos guardando bien la suscripción y
    // dependemos de que escriba siempre el mismo correo en el checkout.
    rastro.paso("identificada", { por: "suscripcion" });
  } else if (evento.correo) {
    const { data: perfil } = await db
      .from("profiles")
      .select("id")
      .eq("email", evento.correo)
      .maybeSingle();
    userId = perfil?.id ?? null;
    rastro.paso(userId ? "identificada" : "correo sin cuenta", { por: "correo" });
  }

  if (!userId) {
    rastro.paso("huerfano", { motivo: evento.correo ? "correo desconocido" : "sin correo" });
    await cerrar(
      "huerfano",
      evento.correo
        ? `nadie con el correo ${evento.correo} (suscripción ${evento.recursoId})`
        : `la pasarela no mandó correo (suscripción ${evento.recursoId})`,
    );
    reportarAviso("webhook", "pago sin dueño conocido", {
      traza: rastro.traza,
      proveedor,
      suscripcion: evento.recursoId,
      correo: evento.correo ?? "(no vino)",
      cliente: evento.clienteId ?? "(sin id)",
    });
    return;
  }

  if (evento.tipo === "suscripcion.pagada") {
    /*
     * `upsert`: la primera vez que alguien paga puede no tener fila de
     * membresía todavía. Y de paso se guarda el id de la suscripción, que es lo
     * que hará que el PRÓXIMO evento se encuentre sin depender del correo.
     */
    await db.from("membresias").upsert(
      {
        user_id: userId,
        plan: "completo",
        estado: "activa",
        proveedor,
        suscripcion_externa_id: evento.recursoId,
        cliente_externo_id: evento.clienteId,
        // Si la pasarela no dijo hasta cuándo, se deja la fecha que hubiera: es
        // preferible a borrarla y dejar a la alumna sin acceso.
        ...(evento.venceEl ? { vence_el: evento.venceEl } : {}),
      },
      { onConflict: "user_id" },
    );
    rastro.paso("membresia activada", { vence_el: evento.venceEl ?? "sin cambio" });
    await cerrar("procesado");
    /*
     * ⚠️ CIERRA EL EMBUDO, Y ESTE ES EL ÚNICO SITIO DESDE DONDE SE PUEDE. La
     * alumna paga en OnePay, en otro dominio: el navegador solo vio que se
     * iba. Sin este evento no se sabe cuántas de las que abren la pasarela
     * acaban pagando, que es el salto donde más gente se pierde.
     * Va DESPUÉS de cerrar el evento y no bloquea nada: si Mixpanel falla, se
     * traga el error (ver el módulo) y la membresía ya quedó activa igual.
     */
    /* Sin `ciclo`: el evento de la pasarela no dice si es mensual o anual, y
       no se inventa. Para separarlos en el panel está `checkout_abierto`, que
       sí lleva el plan que tocó la alumna. */
    await medirPagoConfirmado(userId, {
      proveedor,
      suscripcion: evento.recursoId ?? undefined,
    });
    await darLaBienvenida(db, userId, origen, rastro);
    return;
  }

  if (evento.tipo === "suscripcion.cancelada") {
    /*
     * ⚠️ CANCELAR NO ES CORTAR. Se marca 'cancelada' y NO se toca `vence_el`:
     * quien canceló ya pagó ese período y lo conserva hasta el final.
     * `plan_efectivo()` baja sola a 'gratis' cuando la fecha pase.
     */
    await db.from("membresias").update({ estado: "cancelada" }).eq("user_id", userId);
    // Conserva el acceso hasta `vence_el`: se apunta para que nadie lo lea
    // como "le cortamos hoy".
    rastro.paso("cancelada (conserva acceso hasta vencer)");
    await cerrar("procesado");
    return;
  }

  if (evento.tipo === "suscripcion.impagada" || evento.tipo === "suscripcion.vencida") {
    /*
     * ⚠️ AQUÍ SÍ SE CORTA, PERO NO DE GOLPE. Se marca 'vencida' y se deja
     * `vence_el` como está: si todavía quedan días pagados, los conserva; si ya
     * pasaron, `plan_efectivo()` la baja sola.
     *
     * Y SE AVISA, porque un cobro rebotado casi siempre es una tarjeta caducada,
     * no alguien que se quiere ir: un mensaje a tiempo recupera la suscripción,
     * y el silencio la pierde.
     */
    await db.from("membresias").update({ estado: "vencida" }).eq("user_id", userId);
    rastro.paso("cobro fallido o vencida");
    await cerrar("procesado", "cobro fallido o suscripción vencida");
    reportarAviso("webhook", "a una alumna le falló el cobro", {
      traza: rastro.traza,
      proveedor,
      suscripcion: evento.recursoId,
      correo: evento.correo ?? "(no vino)",
    });
  }
}
