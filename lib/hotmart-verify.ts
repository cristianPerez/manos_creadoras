import crypto from "node:crypto";
import { hotmartEnv } from "@/lib/env";

/**
 * Comparación en tiempo constante (anti timing-attack). `!==` corta en el primer byte
 * distinto y filtra cuántos acertó el atacante.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Defensa 1 — AUTENTICIDAD: ¿viene de verdad de Hotmart? */
export function verifyHotmart(hottok?: string | null): boolean {
  if (!hottok) return false;
  return timingSafeEqualStr(hottok, hotmartEnv().HOTMART_HOTTOK);
}

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

/** Defensa 2 — FRESCURA: rechaza reenvíos viejos capturados por un atacante. */
export function isFresh(eventTimestampMs?: number): boolean {
  if (!eventTimestampMs) return true; // sin fecha fiable, no bloqueamos por esto
  const age = Date.now() - eventTimestampMs;
  return age >= 0 && age <= REPLAY_WINDOW_MS;
}

export function hashPayload(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
