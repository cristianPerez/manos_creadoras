import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { reportarAviso } from "@/lib/fallos";
import { aplicar } from "@/lib/webhooks/aplicar";
import { abrirRastro } from "@/lib/webhooks/rastro";
import { proveedorPorNombre } from "@/lib/webhooks/registro";

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
