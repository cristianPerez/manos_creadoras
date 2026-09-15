import { supabaseBrowser } from "@/lib/supabase/client";

export type MagicLinkResult = { ok: true } | { ok: false; error: string };

/**
 * Manda el enlace de acceso al correo.
 *
 * ⚠️ AQUÍ HABÍA `shouldCreateUser: false` Y SE QUITÓ (2026-09-15, opción B de
 * Cristian). El razonamiento viejo era "las cuentas solo las crea el webhook al
 * pagar; si cualquiera pudiera entrar, el programa sería gratis". La primera
 * mitad ya no es cierta y la segunda nunca lo fue:
 *
 *   · Tener cuenta y tener el programa son cosas distintas desde la migración
 *     0009. Las lecciones las entrega la base según `es_libre` y `tiene_acceso()`,
 *     no según si hay sesión. Una cuenta recién creada no tiene ninguna
 *     concesión, así que ve exactamente lo mismo que un visitante: los 3
 *     tutoriales de cortesía. El programa NO se regala por registrarse.
 *   · Lo que sí gana es probar el Ojo Experto 3 veces (cupo `regalo` de la
 *     migración 0012) y que le podamos escribir después. Ese es el negocio.
 *
 * Y cerraba un agujero peor del que abría: las pantallas del visitante invitan
 * a "entrar con tu correo", y con la creación bloqueada esa invitación mandaba
 * un correo que NUNCA llegaba. La pantalla decía "revisa tu correo" igual, por
 * anti-enumeración, así que la persona se quedaba esperando sin saber por qué.
 */
export async function requestMagicLink(email: string): Promise<MagicLinkResult> {
  const limpio = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
    return { ok: false, error: "Ese correo no parece válido." };
  }

  const { error } = await supabaseBrowser().auth.signInWithOtp({
    email: limpio,
    options: {
      // Sin `shouldCreateUser: false` → si el correo no tiene cuenta, se crea.
      // El disparador de la 0012 le monta su perfil; sin concesiones, así que
      // entra al mismo sitio que un visitante pero con sus 3 consultas.
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    // Anti-enumeración (26): nunca revelar si ese correo tiene cuenta o no.
    // Un atacante no debe poder averiguar quiénes son tus alumnas.
    if (/not found|signups not allowed|invalid/i.test(error.message)) {
      return { ok: true };
    }
    if (/rate|too many/i.test(error.message)) {
      return { ok: false, error: "Pediste varios enlaces seguidos. Espera un minuto." };
    }
    return { ok: false, error: "No pudimos enviar el enlace. Inténtalo de nuevo." };
  }

  return { ok: true };
}
