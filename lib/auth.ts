import { supabaseBrowser } from "@/lib/supabase/client";

export type MagicLinkResult = { ok: true } | { ok: false; error: string };

/**
 * Manda el enlace de acceso al correo de la alumna.
 *
 * `shouldCreateUser: false` es DELIBERADO: las cuentas solo las crea el webhook de
 * Hotmart cuando alguien paga. Si cualquiera pudiera pedir un enlace y entrar, el
 * programa sería gratis.
 */
export async function requestMagicLink(email: string): Promise<MagicLinkResult> {
  const limpio = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
    return { ok: false, error: "Ese correo no parece válido." };
  }

  const { error } = await supabaseBrowser().auth.signInWithOtp({
    email: limpio,
    options: {
      shouldCreateUser: false,
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
