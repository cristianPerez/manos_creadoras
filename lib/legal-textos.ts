import type { ComponentType } from "react";
import { ContenidoCancelar } from "@/components/legal/Cancelar";
import { ContenidoPrivacidad } from "@/components/legal/Privacidad";
import { ContenidoReembolso } from "@/components/legal/Reembolso";
import { ContenidoTerminos } from "@/components/legal/Terminos";

/**
 * Los cuatro documentos legales, en un índice.
 *
 * El TEXTO vive en `components/legal/`, tal cual estaba. Aquí solo está el
 * índice: qué documentos hay, cómo se llaman y qué resumen honesto va arriba.
 *
 * ⚠️ El resumen NO sustituye al documento, lo anuncia. Nadie lee estas páginas
 * enteras, así que lo que de verdad importa va donde sí se mira — pero el texto
 * completo sigue abajo, entero y sin recortar.
 */

export type ClaveDocumento = "terminos" | "privacidad" | "reembolso" | "cancelar";

export const DOCUMENTOS: Record<
  ClaveDocumento,
  { titulo: string; resumen: string; Contenido: ComponentType }
> = {
  terminos: {
    titulo: "Términos y condiciones",
    resumen:
      "Qué incluye tu plan, que el Ojo Experto es una ayuda y no una mentora humana, y que puedes cancelar cuando quieras conservando lo que ya pagaste.",
    Contenido: ContenidoTerminos,
  },
  privacidad: {
    titulo: "Política de privacidad",
    resumen:
      "Guardamos lo mínimo para que el programa funcione, no vendemos tus datos a nadie, y puedes pedirnos que los borremos cuando quieras.",
    Contenido: ContenidoPrivacidad,
  },
  reembolso: {
    titulo: "Política de reembolso",
    resumen:
      "Tienes 7 días desde tu primer pago para pedir el reembolso completo, sin preguntas. Después puedes cancelar para que no se te cobre otra vez.",
    Contenido: ContenidoReembolso,
  },
  cancelar: {
    titulo: "Cómo cancelar",
    resumen:
      "Se cancela escribiéndonos. Conservas el acceso hasta el final del período que ya pagaste, y los cursos que descargaste siguen siendo tuyos.",
    Contenido: ContenidoCancelar,
  },
};
