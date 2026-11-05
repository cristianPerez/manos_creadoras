import { EVENTOS } from "@/lib/analitica/eventos";
import { medirServidor } from "@/lib/analitica/mixpanel-servidor";
import { reportarAviso } from "@/lib/fallos";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { aplicar } from "@/lib/webhooks/aplicar";
import { abrirRastro } from "@/lib/webhooks/rastro";
import { proveedorPorNombre } from "@/lib/webhooks/registro";

/**
 * Activa los pagos de alguien que pagó ANTES de tener cuenta (2026-11-04).
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL HUECO QUE CIERRA
 * ════════════════════════════════════════════════════════════════════════════
 * El enlace de pago de OnePay no lleva nada nuestro: lo único que une un pago
 * con una cuenta es el correo. Si alguien paga desde la página sin haber
 * creado su cuenta, el webhook no encuentra a nadie con ese correo y guarda el
 * evento como 'huerfano'. Y el webhook busca UNA sola vez. Pasó con la primera
 * venta real (diliar…, 2026-11-04): pagó a las 18:30 UTC, creó su cuenta a las
 * 18:32 con el mismo correo, y quedó pagando sin poder ver los videos.
 *
 * Esto se llama cuando alguien NUEVO pide su código de ingreso
 * (`lib/acciones/ingreso.ts`). Si hay eventos huérfanos con su correo, crea su
 * cuenta en ese momento y los pasa por `aplicar()` —el mismo camino del
 * webhook—, en el orden en que llegaron: membresía activa con su número de
 * suscripción, evento cerrado como 'procesado' y correo de bienvenida.
 *
 * NO regala nada: solo activa lo que OnePay ya cobró (eventos que pasaron la
 * firma del webhook). Y quien escriba un correo ajeno no gana acceso: la
 * cuenta se abre con el código que llega a ESE buzón.
 *
 * Devuelve cuántos eventos aplicó. Nunca lanza: un fallo aquí no puede impedir
 * que alguien pida su código.
 */
export async function activarPagosHuerfanos(correo: string, origen: string): Promise<number> {
  const limpio = correo.trim().toLowerCase();
  const db = supabaseAdmin();

  try {
    const { data: huerfanos, error } = await db
      .from("webhook_eventos")
      .select("id, proveedor, cuerpo, recibido_en")
      .eq("estado", "huerfano")
      .order("recibido_en", { ascending: true });
    if (error || !huerfanos?.length) return 0;

    /* El correo vive dentro del cuerpo, con la forma de cada pasarela: se lee
       con el mismo traductor que usó el webhook al recibirlo. */
    const suyos = huerfanos.flatMap((fila) => {
      const proveedor = proveedorPorNombre(fila.proveedor);
      const evento = proveedor?.leer(fila.cuerpo) ?? null;
      return evento?.correo === limpio ? [{ fila, evento }] : [];
    });
    if (suyos.length === 0) return 0;

    /*
     * La cuenta se crea AQUÍ, antes de mandarle el código: `aplicar()` busca a
     * la alumna por correo en `profiles`, y el perfil lo monta el disparador de
     * la 0012 al crearse el usuario. `email_confirm`: el correo ya lo usó para
     * pagar, y de todas formas solo entra con el código que llega a ese buzón.
     */
    const { error: errorCrear } = await db.auth.admin.createUser({ email: limpio, email_confirm: true });
    if (errorCrear && !/already|registered|exists/i.test(errorCrear.message)) {
      reportarAviso("webhook", "no se pudo crear la cuenta de un pago huérfano", {
        correo: limpio,
        motivo: errorCrear.message,
      });
      return 0;
    }

    for (const { fila, evento } of suyos) {
      const rastro = abrirRastro(fila.proveedor);
      rastro.paso("huérfano reclamado al pedir el código", { evento: evento.evento });
      await aplicar(db, fila.id, fila.proveedor, evento, origen, rastro);
      /* La nota decía "nadie con el correo…": que diga cómo se resolvió, para
         quien lea `webhook:ver` después. Solo si `aplicar` lo cerró bien. */
      await db
        .from("webhook_eventos")
        .update({ nota: "activado al crear su cuenta: había pagado antes de registrarse" })
        .eq("id", fila.id)
        .eq("estado", "procesado");
      rastro.cerrar("procesado");
    }

    /*
     * ⚠️ LA RECONCILIACIÓN, TAMBIÉN EN MIXPANEL (2026-11-04). El webhook dejó
     * el pago sin dueño y `aplicar()` acaba de mandar `pago_confirmado` con su
     * `user_id` y su correo. Este evento dice además QUE fue un huérfano
     * reclamado y cuántos minutos estuvo pagando sin acceso: si esa cifra se
     * repite, el hueco de "pagar antes de tener cuenta" es un problema de la
     * página de ventas, no un caso raro.
     */
    const { data: perfil } = await db.from("profiles").select("id").eq("email", limpio).maybeSingle();
    if (perfil?.id) {
      const primero = suyos[0].fila.recibido_en as string | null;
      const minutos = primero ? Math.round((Date.now() - new Date(primero).getTime()) / 60000) : undefined;
      await medirServidor(
        EVENTOS.pagoReconciliado,
        perfil.id,
        { correo: limpio, eventos: suyos.length, minutos_sin_acceso: minutos },
        `${EVENTOS.pagoReconciliado}:${suyos[0].fila.id}`,
      );
    }
    return suyos.length;
  } catch (e) {
    reportarAviso("webhook", "falló la activación de pagos huérfanos", {
      correo: limpio,
      motivo: e instanceof Error ? e.message : String(e),
    });
    return 0;
  }
}
