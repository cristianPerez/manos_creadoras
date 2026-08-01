export type MagicLinkResult = { ok: true } | { ok: false; error: string };

export async function requestMagicLink(email: string): Promise<MagicLinkResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (!email.includes("@")) {
    return { ok: false, error: "Ese correo no parece válido." };
  }
  return { ok: true };
}
