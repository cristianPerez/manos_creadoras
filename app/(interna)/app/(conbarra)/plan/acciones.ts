"use server";

import { revalidatePath } from "next/cache";
import { alumnaActual } from "@/lib/alumna";
import { fechaLarga, finDelCicloEnCurso } from "@/lib/ciclo";
import { enviarCorreo } from "@/lib/correo";
import { correoDeCancelacion } from "@/lib/correos/cancelacion";
import { reportarAviso, reportarFallo } from "@/lib/fallos";
import { eliminarSuscripcion } from "@/lib/onepay";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Darse de baja.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ POR QUÉ ESTO EXISTE, Y POR QUÉ NO ES UN "NICE TO HAVE"
 * ════════════════════════════════════════════════════════════════════════════
 * Hasta el 2026-10-19 la única forma de cancelar era escribir un correo. Una
 * suscripción que se contrata en dos clics y se cancela escribiendo es lo que
 * produce devoluciones y quejas — y en varios países de LATAM obligar a
 * contactar para cancelar es directamente ILEGAL.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL ORDEN DE LOS DOS PASOS NO ES INTERCAMBIABLE
 * ════════════════════════════════════════════════════════════════════════════
 * 1º OnePay (detener el cobro) · 2º nuestra base (marcar cancelada).
 *
 * Al revés, si OnePay falla, tendríamos a una alumna marcada como cancelada en
 * la app y cobrándole igual, sin nada que lo delate. En este orden, el fallo de
 * OnePay se detecta ANTES de prometerle nada, y aun así se la cancela aquí
 * —porque su voluntad ya está expresada y no se la va a mandar a escribir un
 * correo— pero con el aviso urgente saliendo a Cristian y Elizabeth.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ CANCELAR NO CORTA EL ACCESO
 * ════════════════════════════════════════════════════════════════════════════
 * `vence_el` NO se toca. La alumna conserva lo que ya pagó hasta esa fecha, y
 * `plan_efectivo()` la baja sola a `gratis` cuando pase. Cortar en el acto
 * sería cobrarle un mes y no dárselo. Decisión de Cristian del 2026-10-19.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type ResultadoBaja =
  | { ok: true; accesoHasta: string | null }
  | { ok: false; error: string };

export async function cancelarMiMembresia(): Promise<ResultadoBaja> {
  const alumna = await alumnaActual();

  /*
   * ⚠️ LA SESIÓN SE COMPRUEBA AQUÍ, EN EL SERVIDOR, NO EN EL BOTÓN. Una Server
   * Action es un endpoint público: cualquiera puede invocarla con un fetch sin
   * pasar por la pantalla. Si confiáramos en que el botón solo se enseña a
   * quien tiene plan, bastaría un `POST` a mano para cancelarle la membresía a
   * otra persona.
   *
   * Y no se recibe NINGÚN parámetro a propósito: el `user_id` sale de la
   * sesión. Si llegara por argumento, quien llamase podría poner el de otra.
   */
  if (!alumna) return { ok: false, error: "Tienes que iniciar sesión." };

  if (alumna.estado === "cancelada") {
    // Doble pulsación, o dos pestañas abiertas. No es un error que enseñarle:
    // el resultado que quería ya está.
    return { ok: true, accesoHasta: alumna.venceEl };
  }

  if (!alumna.tieneAcceso) {
    return { ok: false, error: "No tienes una suscripción activa que cancelar." };
  }

  const db = supabaseAdmin();

  /*
   * El id de la suscripción en OnePay. Lo guardó el webhook con el primer pago
   * (`suscripcion_externa_id`). Puede faltar en cuentas activadas a mano con
   * `npm run membresia:dar`: en ese caso no hay nada que cancelar en la
   * pasarela —no hay cobro automático— y se sigue solo con nuestra base.
   */
  const { data: fila } = await db
    .from("membresias")
    .select("suscripcion_externa_id")
    .eq("user_id", alumna.id)
    .maybeSingle();

  const suscripcionId: string | null = fila?.suscripcion_externa_id ?? null;

  let bajaEnPasarela: "eliminada" | "ya-no-estaba" | "fallo" | "sin-suscripcion" = "sin-suscripcion";
  let motivo: string | undefined;

  if (suscripcionId) {
    const r = await eliminarSuscripcion(suscripcionId);
    if (r.ok) {
      bajaEnPasarela = "yaNoEstaba" in r ? "ya-no-estaba" : "eliminada";
    } else {
      bajaEnPasarela = "fallo";
      motivo = r.motivo;
    }
  }

  /*
   * Se marca cancelada SIEMPRE, incluso si OnePay falló: la alumna pulsó el
   * botón y su voluntad no depende de que un tercero responda. El hueco que
   * deja un fallo de OnePay lo cierra el aviso urgente de abajo, no dejándola
   * sin cancelar.
   *
   * `cancelar_membresia` es `security definer` y solo la puede llamar el
   * `service_role`: desde el navegador esta tabla no se escribe.
   */
  /*
   * ⚠️ `p_vence_el: null` NO ES "deja la fecha que tenía". LO COMPROBÉ Y CORTA.
   *
   * `cancelar_membresia` hace `coalesce(p_vence_el, vence_el, now())`. Con los
   * dos primeros en null cae en `now()`, así que una membresía SIN fecha de
   * vencimiento queda cortada EL MISMO DÍA de cancelar. Probado el 2026-10-19:
   * la alumna pulsó cancelar, leyó "sigues entrando hasta el final del
   * período" y en el siguiente repintado ya tenía delante la página de ventas.
   *
   * Pasa en dos casos reales, y el segundo da miedo:
   *   · Membresías dadas a mano (`npm run membresia:dar` sin días).
   *   · Membresías de OnePay a las que el webhook no les puso fecha: su código
   *     deja `vence_el` como estaba —preferible a borrarla— así que puede
   *     seguir en null después de un pago DE VERDAD.
   *
   * Por eso la fecha se calcula aquí y se pasa explícita: hasta el final del
   * ciclo que ya está corriendo, contado desde que empezó la membresía. Nunca
   * se corta en el acto, y nunca se regala más de un ciclo.
   */
  const hasta = alumna.venceEl ?? finDelCicloEnCurso(alumna.miembroDesde, alumna.ciclo);

  const { error } = await db.rpc("cancelar_membresia", {
    p_user_id: alumna.id,
    p_vence_el: hasta,
  });

  if (error) {
    /*
     * Esto sí es un error que se le enseña, y es el único caso en que conviene:
     * si OnePay ya quedó cancelada pero nuestra base no, la alumna ve su plan
     * como activo y dejará de recibir cobros sin saberlo. Hace falta mano
     * humana, así que el aviso sale igual.
     */
    reportarFallo("pago", "no se pudo marcar la membresía como cancelada", {
      usuario: alumna.id,
      pasarela: bajaEnPasarela,
      detalle: error.message.slice(0, 200),
    });
    await avisar({
      correoAlumna: alumna.email,
      suscripcionId,
      accesoHasta: fechaLarga(alumna.venceEl),
      bajaEnPasarela: "fallo",
      motivo: `OnePay: ${bajaEnPasarela}. Nuestra base NO se pudo actualizar: ${error.message.slice(0, 120)}`,
    });
    return { ok: false, error: "No pudimos completar la cancelación. Escríbenos y lo resolvemos hoy." };
  }

  reportarAviso("pago", "membresía cancelada por la alumna", {
    usuario: alumna.id,
    pasarela: bajaEnPasarela,
  });

  // El correo va DESPUÉS de que todo esté guardado, y su fallo no se le cuenta
  // a la alumna: su baja ya es efectiva. `enviarCorreo` nunca lanza.
  await avisar({
    correoAlumna: alumna.email,
    suscripcionId,
    accesoHasta: fechaLarga(alumna.venceEl),
    bajaEnPasarela: bajaEnPasarela === "sin-suscripcion" ? "ya-no-estaba" : bajaEnPasarela,
    motivo,
  });

  /*
   * ════════════════════════════════════════════════════════════════════════
   * ⚠️ ESTE `revalidatePath` SE QUITÓ Y SE VOLVIÓ A PONER EL MISMO DÍA
   * ════════════════════════════════════════════════════════════════════════
   * Se quitó porque la pantalla saltaba a la PÁGINA DE VENTAS justo después
   * de cancelar. Pero esa no era culpa del revalidate: era del bug de
   * `vence_el`, que cortaba el acceso en el acto y hacía que el componente
   * cambiara a la rama de quien NO tiene plan. Arreglado aquel, revalidar
   * lleva a la rama correcta —la de quien tiene plan, con estado 'cancelada'
   * y su fecha— que es exactamente lo que hay que enseñar.
   *
   * Y hace falta: sin él, `router.refresh()` en el cliente se encuentra el
   * RSC ya cacheado y la tarjeta de arriba sigue diciendo "Se renueva el…"
   * mientras abajo dice "Cancelamos tu renovación". Probado el 2026-10-19: la
   * pantalla se contradecía a sí misma hasta que la alumna navegaba.
   *
   * La confirmación pasa a ser la tarjeta ("Cancelaste la renovación.
   * Conservas el acceso hasta el …"), que además PERMANECE. Un panel de
   * felicitación no es lo que toca en una baja; lo que toca es que, al
   * volver mañana, siga diciéndole que no le van a cobrar.
   */
  revalidatePath("/app/plan");
  revalidatePath("/app/cuenta");

  return { ok: true, accesoHasta: hasta };
}

async function avisar(datos: Parameters<typeof correoDeCancelacion>[0]): Promise<void> {
  await enviarCorreo(correoDeCancelacion(datos));
}

