"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function BotonCerrarSesion() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    if (saliendo) return;
    setSaliendo(true);
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-text-secondary disabled:opacity-60 [touch-action:manipulation]"
      style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}
    >
      {saliendo ? (
        <>
          <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Cerrando…
        </>
      ) : (
        <>
          <LogOut size={16} aria-hidden="true" /> Cerrar sesión
        </>
      )}
    </button>
  );
}
