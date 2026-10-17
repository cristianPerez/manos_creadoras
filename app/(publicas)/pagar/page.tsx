import { redirect } from "next/navigation";

/**
 * `/pagar` ya no es una pantalla: es un reenvío.
 *
 * ⚠️ NO SE BORRÓ LA RUTA A PROPÓSITO. El contenido se mudó a `/app/plan` (ver
 * el comentario de cabecera de esa página), pero `/pagar` puede estar pegado en
 * un correo enviado, en un mensaje de WhatsApp o en el historial de alguien que
 * ya lo abrió una vez. Un 404 en un enlace de pago es una venta perdida sin que
 * nadie se entere.
 *
 * Se conserva `?ciclo=` porque es lo que decide si llega viendo el plan mensual
 * o el anual.
 */
export default async function Pagar({
  searchParams,
}: {
  searchParams: Promise<{ ciclo?: string }>;
}) {
  const { ciclo } = await searchParams;
  redirect(ciclo === "mensual" ? "/app/plan?ciclo=mensual" : "/app/plan");
}
