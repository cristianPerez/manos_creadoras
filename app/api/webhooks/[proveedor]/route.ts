import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enviarCorreo } from "@/lib/correo";
import { correoDeBienvenida } from "@/lib/correos/bienvenida";
import { reportarAviso } from "@/lib/fallos";
import { abrirRastro, type Rastro } from "@/lib/webhooks/rastro";
import { proveedorPorNombre } from "@/lib/webhooks/registro";
import type { EventoNormalizado } from "@/lib/webhooks/tipos";

/**
 * La puerta de entrada de los webhooks de CUALQUIER pasarela.
 *
 * `/api/webhooks/onepay` hoy; `/api/webhooks/loquesea` mañana, sin tocar este
 * archivo. Lo específico de cada una vive en `lib/webhooks/<proveedor>.ts`.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ CASI TODO DEVUELVE 200
 * ════════════════════════════════════════════════════════════════════════════
 * La documentación de OnePay dice dos cosas que juntas obligan a esto:
 *
 *   · «Un 4xx de tu lado también dispara reintentos.»
 *   · «Un endpoint que falla de forma sostenida se desactiva solo.»
 *
 * Es decir: responder 400 a un evento que nunca vamos a poder procesar —uno de
 * un tipo que no nos interesa, o de una suscripción que no reconocemos— hace
 * que lo reintenten seis veces y, si se repite, que APAGUEN EL ENDPOINT. Y con
 * el endpoint apagado dejamos de enterarnos de los pagos buenos.
 *
 * Así que: 200 a casi todo, y el problema queda ANOTADO en `webhook_eventos`
 * con su estado. Lo único que devuelve 401 es un mensaje que no pasa la firma —
 * ahí sí queremos que falle y se note.
 * ════════════════════════════════════════════════════════════════════════════
 */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ proveedor: string }> },
) {
  const { proveedor: nombre } = await params;
  const rastro = abrirRastro(nombre);
  const proveedor = proveedorPorNombre(nombre);

  if (!proveedor) {
    rastro.cerrar("proveedor desconocido");
    // Esta sí es 404: nadie legítimo llama a una pasarela que no existe.
    return NextResponse.json({ error: "proveedor desconocido" }, { status: 404 });
  }

  /*
   * ⚠️ EL CUERPO SE LEE CRUDO Y NO SE VUELVE A SERIALIZAR. La firma se calcula
   * sobre estos bytes exactos: `JSON.parse` + `JSON.stringify` reordena claves y
   * normaliza espacios, y la firma deja de coincidir por un motivo que no se ve
   * leyendo el código.
   */
  const cuerpoCrudo = await req.text();
  rastro.paso("recibido", { bytes: cuerpoCrudo.length });

  const verificacion = proveedor.verificar(req.headers, cuerpoCrudo);
  if (!verificacion.valido) {
    /*
     * La traza va TAMBIÉN en el aviso: una firma rechazada es lo primero que se
     * investiga cuando alguien dice "pagué y no me llegó", y sin ella no hay
     * forma de atar este rechazo con la petición que lo provocó.
     */
    reportarAviso("webhook", `firma rechazada (${nombre})`, {
      traza: rastro.traza,
      motivo: verificacion.motivo,
    });
    rastro.cerrar("rechazado", { motivo: verificacion.motivo });
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  rastro.paso("firma correcta");

  let cuerpo: unknown;
  try {
    cuerpo = JSON.parse(cuerpoCrudo);
  } catch {
    await anotar(nombre, "error", "cuerpo que no es JSON", cuerpoCrudo, undefined, rastro.traza);
    rastro.cerrar("cuerpo no es JSON");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const evento = proveedor.leer(cuerpo);
  if (!evento) {
    /*
     * Pasó la firma —así que es suyo— pero no tiene la forma esperada. Eso es
     * un cambio en su API o un formato que no previmos: hay que mirarlo, no
     * descartarlo.
     */
    await anotar(nombre, "error", "cuerpo con forma desconocida", cuerpoCrudo, cuerpo, rastro.traza);
    reportarAviso("webhook", `cuerpo no reconocido de ${nombre}`, { traza: rastro.traza });
    rastro.cerrar("forma desconocida");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  rastro.paso("entendido", {
    evento: evento.evento,
    tipo: evento.tipo,
    recurso: evento.recursoId,
    // Si trae correo o no es LA pregunta clave: sin él, un pago de alguien
    // desconocido se queda huérfano. Se apunta si viene, no cuál.
    con_correo: Boolean(evento.correo),
  });

  const db = supabaseAdmin();
  const huella = createHash("sha256")
    .update(`${evento.evento}:${evento.recursoId}:${evento.marca ?? ""}`)
    .digest("hex");

  /*
   * ⚠️ SE GUARDA ANTES DE PROCESAR, y el `insert` es el que decide si seguimos.
   *
   * Si la fila ya existía, es un reintento o un reenvío —su documentación avisa
   * de que recibir el mismo evento dos veces "es normal, no una excepción"— y
   * no se vuelve a aplicar. Dejar que la base decida esto con una clave única
   * evita la carrera que tendría comprobar-y-luego-insertar.
   */
  const { data: fila, error: errorInsert } = await db
    .from("webhook_eventos")
    .insert({
      proveedor: nombre,
      evento: evento.evento,
      tipo: evento.tipo,
      recurso_id: evento.recursoId,
      huella,
      cuerpo,
      estado: "recibido",
      traza: rastro.traza,
    })
    .select("id")
    .single();

  if (errorInsert) {
    // 23505 = clave única repetida: ya lo teníamos. Es el camino normal.
    if (errorInsert.code === "23505") {
      rastro.cerrar("repetido");
      return NextResponse.json({ ok: true, repetido: true }, { status: 200 });
    }
    reportarAviso("webhook", "no se pudo guardar el evento", {
      traza: rastro.traza,
      error: errorInsert.message,
    });
    rastro.cerrar("no se pudo guardar", { error: errorInsert.message });
    // 500 a propósito: aquí SÍ queremos el reintento, porque el fallo es nuestro
    // y puede ser pasajero.
    return NextResponse.json({ error: "no se pudo guardar" }, { status: 500 });
  }

  /*
   * El origen de ESTA petición es el sitio donde vive la app (QA o producción),
   * así que el enlace del correo apunta solo al entorno correcto sin tener que
   * configurar un dominio a mano — que es justo la clase de variable que se
   * olvida en un entorno y manda a las alumnas de QA a producción.
   */
  await aplicar(db, fila.id, nombre, evento, new URL(req.url).origin, rastro);

  /*
   * ⚠️ LA DURACIÓN SE GUARDA EN LA FILA, no solo en el log. El log de Vercel
   * caduca; la fila no. Y es lo que permite responder "¿esto siempre tardó
   * tanto o empezó esta semana?" sin tener los logs delante.
   */
  const ms = rastro.cerrar("procesado");
  await db.from("webhook_eventos").update({ duracion_ms: ms }).eq("id", fila.id);

  return NextResponse.json({ ok: true }, { status: 200 });
}

/** Deja constancia de un cuerpo que no se pudo entender. */
async function anotar(
  proveedor: string,
  estado: "error",
  nota: string,
  crudo: string,
  cuerpo?: unknown,
  traza?: string,
) {
  const db = supabaseAdmin();
  await db.from("webhook_eventos").insert({
    proveedor,
    evento: "(desconocido)",
    tipo: "desconocido",
    recurso_id: "(desconocido)",
    huella: createHash("sha256").update(crudo).digest("hex"),
    cuerpo: cuerpo ?? { crudo: crudo.slice(0, 4000) },
    estado,
    nota,
    traza,
  });
}

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
async function aplicar(
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
