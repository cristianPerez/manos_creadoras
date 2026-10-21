/**
 * Hasta cuándo llega el ciclo que la alumna está usando AHORA.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EXISTE PORQUE `membresias.vence_el` PUEDE ESTAR VACÍO EN GENTE QUE PAGA
 * ════════════════════════════════════════════════════════════════════════════
 * Dos caminos lo dejan en null: una membresía dada a mano
 * (`npm run membresia:dar` sin días) y un pago de OnePay cuyo evento no trajo
 * fecha — el webhook, a propósito, deja la que hubiera antes que borrarla.
 *
 * Esa columna vacía mordió dos veces el 2026-10-19:
 *   · Al cancelar, `cancelar_membresia` hace `coalesce(…, now())` y CORTABA el
 *     acceso el mismo día, justo después de prometer lo contrario en pantalla.
 *   · En "Mi plan", la tarjeta decía "Tu acceso está activo" y nada más: la
 *     pantalla que existe para responder "¿cuándo me cobran?" no lo respondía.
 *
 * Se avanza desde el alta de ciclo en ciclo hasta pasar de hoy. Alguien con
 * plan mensual que entró el día 3 y mira el día 20 ve el 3 del mes que viene:
 * lo que le toca, ni un día menos ni un mes de regalo.
 * ════════════════════════════════════════════════════════════════════════════
 */

/** Tope de vueltas: una fecha corrupta no puede colgar el servidor. */
const MAX_CICLOS = 200;

/** Cuando no se sabe nada, 30 días. Ver el aviso de abajo. */
const DIAS_DE_RESPALDO = 30;

export function finDelCicloEnCurso(
  desde: string | null,
  ciclo: "mensual" | "anual" | null,
): string {
  const ahora = new Date();

  /*
   * ⚠️ EL RESPALDO ES DELIBERADAMENTE GENEROSO. Si no sabemos qué pagó, el
   * error barato es dejarla entrar de más; el caro es cortarle algo que pagó,
   * porque eso termina en una disputa de pago con la pasarela.
   */
  if (!desde || !ciclo) return enDias(ahora, DIAS_DE_RESPALDO);

  const fin = new Date(desde);
  if (Number.isNaN(fin.getTime())) return enDias(ahora, DIAS_DE_RESPALDO);

  for (let i = 0; i < MAX_CICLOS && fin <= ahora; i++) {
    if (ciclo === "mensual") fin.setMonth(fin.getMonth() + 1);
    else fin.setFullYear(fin.getFullYear() + 1);
  }

  // Fecha de alta absurda (muy antigua): no se corta hoy.
  if (fin <= ahora) return enDias(ahora, DIAS_DE_RESPALDO);

  return fin.toISOString();
}

function enDias(desde: Date, dias: number): string {
  const d = new Date(desde);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
}

/** La fecha como la leería una persona en Colombia. */
export function fechaLarga(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
}
