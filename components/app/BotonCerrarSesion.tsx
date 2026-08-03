"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function BotonCerrarSesion() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salir() {
    if (saliendo) return;
    setSaliendo(true);
    setError(null);
    try {
      await supabaseBrowser().auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      // Sin este catch, un corte de internet dejaba el botón en "Cerrando…" para
      // siempre: sin mensaje, sin salida y sin sesión cerrada.
      setSaliendo(false);
      setError("No pudimos cerrar la sesión. Revisa tu internet y vuelve a intentar.");
    }
  }

  // Se pide confirmación a propósito: se entra por enlace mágico al correo, así que
  // salir sin querer obliga a esperar un email para volver. No es una acción trivial.
  if (confirmando) {
    return (
      <div className="reveal mt-6 rounded-xl border border-border-strong bg-surface-primary p-4 text-center">
        <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
          ¿Cerrar sesión?
        </p>
        <p
          className="text-text-tertiary mt-1"
          style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
        >
          Para volver a entrar te mandaremos un enlace a tu correo.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-border-strong text-text-secondary transition-transform active:scale-[0.98] [touch-action:manipulation]"
            style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
          >
            Mejor no
          </button>
          <button
            type="button"
            onClick={salir}
            disabled={saliendo}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-strong text-text-primary transition-transform active:scale-[0.98] disabled:opacity-60 [touch-action:manipulation]"
            style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
          >
            {saliendo ? (
              <>
                <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Cerrando…
              </>
            ) : (
              "Sí, salir"
            )}
          </button>
        </div>

        {error && (
          <p className="text-status-error mt-3" style={{ fontSize: "var(--text-xs)" }} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirmando(true)}
      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-text-secondary transition-transform active:scale-[0.98] [touch-action:manipulation]"
      style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
    >
      <LogOut size={16} aria-hidden="true" /> Cerrar sesión
    </button>
  );
}
