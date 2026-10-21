"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelarMiMembresia } from "@/app/(interna)/app/(conbarra)/plan/acciones";

/**
 * El botón de darse de baja.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ SE CONFIRMA, NO SE DESHACE
 * ════════════════════════════════════════════════════════════════════════════
 * La regla del sistema es "undo para lo reversible, confirmación solo para lo
 * irreversible" — y esto es irreversible de verdad: eliminar la suscripción en
 * OnePay no se revierte con un botón, hay que volver a pasar por el checkout.
 * Así que se pregunta antes, en el sitio, sin modal: un modal para esto obliga
 * a un segundo salto y en móvil tapa la pantalla entera.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL BOTÓN NO COMPITE CON NADA
 * ════════════════════════════════════════════════════════════════════════════
 * Va al final, en texto y sin fondo. No porque se quiera esconder —esconderlo
 * sería el patrón oscuro que esta pantalla existe para NO tener— sino porque
 * la misión de la pantalla es "ver tu plan", no "darte de baja". Se encuentra
 * cuando se busca, y no se pulsa por accidente.
 *
 * Y lo primero que dice la confirmación es la buena noticia: NO pierde el
 * acceso que ya pagó. Ese dato es el que evita la mitad de las bajas por
 * malentendido ("si cancelo hoy, ¿pierdo el mes?").
 * ════════════════════════════════════════════════════════════════════════════
 */
/** La fecha como la leería ella. `null` cuando todavía no hay ninguna. */
function formatear(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CancelarMembresia({ accesoHasta }: { accesoHasta: string | null }) {
  const router = useRouter();
  const [fase, setFase] = useState<"cerrado" | "confirmando" | "cancelando" | "hecho">("cerrado");
  const [error, setError] = useState<string | null>(null);
  /*
   * La fecha definitiva la dice el SERVIDOR al cancelar, no la que traía la
   * pantalla. Una membresía sin `vence_el` llega aquí con `accesoHasta` en
   * null y aun así conserva acceso: el servidor calcula hasta cuándo. Si nos
   * quedáramos con el prop, la confirmación sería vaga ("hasta el final del
   * período") teniendo el dato exacto a mano.
   */
  const [confirmada, setConfirmada] = useState<string | null>(null);

  const fecha = formatear(confirmada ?? accesoHasta);

  async function cancelar() {
    // Doble-tap: sin esto, dos toques rápidos mandan dos bajas.
    if (fase === "cancelando") return;
    setFase("cancelando");
    setError(null);

    const r = await cancelarMiMembresia();

    if (r.ok) {
      setConfirmada(r.accesoHasta);
      setFase("hecho");
      /*
       * ⚠️ SIN ESTO LA PANTALLA SE CONTRADECÍA A SÍ MISMA. El revisor visual
       * lo marcó como defecto nº1 el 2026-10-19: la confirmación salía abajo,
       * pero la tarjeta de arriba seguía diciendo "Tu acceso está activo". Al
       * subir, la alumna leía que su plan sigue igual justo después de
       * cancelarlo, y el enlace de cancelar había desaparecido sin explicación.
       *
       * `router.refresh()` y NO el `revalidatePath` del servidor: aquí la
       * confirmación ya está pintada y el refresco llega después, así que lo
       * que ve es su mensaje y LUEGO la tarjeta actualizada. Ahora es seguro
       * porque la baja ya no corta el acceso: la rama sigue siendo la de quien
       * tiene plan, con el estado "cancelada" y su fecha.
       */
      router.refresh();
    } else {
      setFase("confirmando");
      setError(r.error);
    }
  }

  if (fase === "hecho") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="border-line bg-ivory mt-10 rounded-[var(--radius-lg)] border p-5 text-center"
        role="status"
      >
        <span
          aria-hidden="true"
          className="bg-sand text-gold mx-auto flex size-10 items-center justify-center rounded-full"
        >
          <Check size={18} strokeWidth={2.5} />
        </span>
        <p className="text-espresso mt-3 font-semibold">Cancelamos tu renovación</p>
        <p className="text-ink-body mt-1 text-sm">
          {fecha
            ? `No se te volverá a cobrar, y conservas el acceso hasta el ${fecha}.`
            : "No se te volverá a cobrar. Conservas el acceso del período que ya pagaste."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mt-10 text-center">
      <AnimatePresence mode="wait" initial={false}>
        {fase === "cerrado" ? (
          <motion.button
            key="abrir"
            type="button"
            onClick={() => setFase("confirmando")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            whileTap={{ scale: 0.98 }}
            /* 44px de alto mínimo: es un control táctil, aunque se vea como texto. */
            className="text-ink-muted hover:text-ink-body inline-flex h-11 items-center px-4 text-sm underline underline-offset-4 transition-colors"
          >
            Cancelar mi membresía
          </motion.button>
        ) : (
          <motion.div
            key="confirmar"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            /*
             * Esc cierra, como cualquier cosa que se abre. Sin esto, quien lo
             * abrió sin querer y no usa ratón se quedaba dentro — el revisor
             * lo apuntó como parte de por qué la heurística de control de
             * usuario se quedaba en 2.
             */
            onKeyDown={(e) => {
              if (e.key === "Escape" && fase !== "cancelando") {
                setFase("cerrado");
                setError(null);
              }
            }}
            /* `-1`: no entra en el orden de tabulación, pero puede recibir el
               foco para que Esc llegue y el lector de pantalla lo anuncie. */
            tabIndex={-1}
            /* El bloque acaba de abrirse por una acción suya: el foco lo sigue,
               o quien navega con teclado se queda donde ya no hay nada. */
            autoFocus
            role="group"
            aria-label="Confirmar cancelación de la membresía"
            className="border-line bg-ivory rounded-[var(--radius-lg)] border p-5 text-left"
          >
            <p className="text-espresso font-semibold">¿Cancelar tu membresía?</p>
            <p className="text-ink-body mt-2 text-sm">
              {fecha
                ? `No pierdes lo que ya pagaste: sigues entrando hasta el ${fecha}. Lo que se detiene es el siguiente cobro.`
                : "No pierdes lo que ya pagaste: sigues entrando hasta el final del período. Lo que se detiene es el siguiente cobro."}
            </p>
            <p className="text-ink-muted mt-2 text-sm">
              Tus bolsos completados y tus consultas al Ojo Experto se conservan. Si vuelves,
              retomas donde quedaste.
            </p>

            {error ? (
              /* El error dice qué pasó Y qué hacer, no un código. */
              <p role="alert" className="text-status-error mt-3 text-sm font-medium">
                {error}
              </p>
            ) : null}

            {/*
              ⚠️ AQUÍ "MEJOR ME QUEDO" IBA EN ESPRESSO SÓLIDO Y "SÍ, CANCELAR"
              EN OUTLINE, Y ESO ERA UN DARK PATTERN DE MANUAL.

              El razonamiento al escribirlo fue "quedarse es lo que la mayoría
              quiere". Pero el efecto real es otro: en una pantalla de baja, el
              botón que pesa más es el que empuja a no darse de baja, y eso es
              exactamente lo que la ley de varios países de LATAM persigue — la
              cancelación tiene que ser tan fácil como la contratación. Lo marcó
              el revisor visual el 2026-10-19.

              Ahora los dos pesan igual: el mismo alto, el mismo radio y el
              mismo borde. Quien viene a cancelar encuentra su botón a la
              primera, y quien dudaba tiene la salida al lado.

              ⚠️ PERO IGUAL DE VISIBLE NO ES INDISTINGUIBLE. Al equilibrarlos
              quedaron ópticamente idénticos y se perdió toda señal de cuál es
              la acción que no tiene vuelta atrás (segundo apunte del revisor).
              Por eso "Sí, cancelar" lleva el color semántico de error en el
              TEXTO, y el borde solo al 40%: no pesa más ni menos, se lee como
              lo que es, y no grita más fuerte que los hairlines del resto de
              la pantalla (lo segundo también lo marcó el revisor).
            */}
            <div className="mt-4 flex flex-wrap gap-3">
              <motion.button
                type="button"
                onClick={cancelar}
                disabled={fase === "cancelando"}
                whileTap={{ scale: 0.98 }}
                className="border-status-error/40 text-status-error flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold disabled:opacity-60"
              >
                {fase === "cancelando" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    Cancelando…
                  </>
                ) : (
                  "Sí, cancelar"
                )}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => {
                  setFase("cerrado");
                  setError(null);
                }}
                disabled={fase === "cancelando"}
                whileTap={{ scale: 0.98 }}
                className="border-line text-espresso flex h-11 items-center rounded-full border px-5 text-sm font-semibold disabled:opacity-60"
              >
                Mejor me quedo
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
