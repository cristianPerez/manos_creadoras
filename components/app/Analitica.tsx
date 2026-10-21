"use client";

import { useEffect } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import { identificar, iniciarMixpanel, medir } from "@/lib/analitica/mixpanel";

/**
 * Enciende la analítica una sola vez, en toda la app.
 *
 * Va en el layout raíz, así que corre tanto en la landing como dentro de la app.
 * Sin esto, `medir()` no manda nada — es a propósito: así ningún componente
 * puede empezar a mandar eventos por su cuenta sin pasar por aquí.
 */
export function Analitica({ userId }: { userId: string | null }) {
  useEffect(() => {
    iniciarMixpanel();
    if (userId) identificar(userId);
  }, [userId]);

  return null;
}

/**
 * Dispara el evento que dice si esta entrada ESTRENA cuenta o es alguien que
 * vuelve.
 *
 * ⚠️ ESTE ES EL ÚNICO MOMENTO EN QUE SE PUEDE SABER, y no es una limitación
 * técnica sino una decisión de seguridad: preguntarle al servidor "¿existe este
 * correo?" mientras alguien lo escribe es exactamente lo que permite enumerar a
 * las alumnas de un sitio, y Supabase se niega a contestarlo. Al abrir el enlace
 * que le llegó al buzón ya demostró que la cuenta es suya, así que aquí sí se
 * puede decir sin abrirle la puerta a nadie.
 *
 * Lo decide el servidor en `/auth/callback` y lo pasa en la URL como
 * `?entrada=nueva|vuelve`. Aquí solo se lee y se manda.
 *
 * ⚠️ Y es el contador REAL de contactos nuevos, no `correo_enviado`: el muro le
 * sale a cualquiera sin sesión, así que quien vuelve tras cerrar sesión queda
 * contado ahí igual.
 */
export function RegistrarEntrada({ entrada }: { entrada: string | null }) {
  useEffect(() => {
    if (entrada !== "nueva" && entrada !== "vuelve") return;
    medir(entrada === "nueva" ? EVENTOS.cuentaCreada : EVENTOS.cuentaIniciada);
  }, [entrada]);

  return null;
}
