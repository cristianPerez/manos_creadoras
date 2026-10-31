"use client";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { CODIGO_MAX, CODIGO_MIN } from "@/lib/auth";

/**
 * La casilla donde se escribe el código de 6 dígitos del correo.
 *
 * ⚠️ UNA SOLA CASILLA, NO SEIS. El celular ofrece el código encima del teclado
 * (`autocomplete="one-time-code"`) y lo pega ENTERO; en seis cajas separadas ese
 * pegado falla en más de un teclado y la alumna acaba escribiéndolo a mano. Seis
 * cajitas se ven más "de app", pero aquí lo bonito estorba.
 *
 * Al llegar a 6 números se envía sola: nadie quiere escribir el código y además
 * buscar un botón. El botón se queda para quien lo escribe despacio y para los
 * códigos de 8 (ver `CODIGO_MAX` en `lib/auth.ts`).
 */
export function CasillaCodigo({
  onEnviar,
  verificando,
  error,
}: {
  onEnviar: (codigo: string) => void;
  verificando: boolean;
  error: string;
}) {
  const [codigo, setCodigo] = useState("");

  function cambiar(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, CODIGO_MAX);
    setCodigo(numeros);
    if (numeros.length === CODIGO_MIN && !verificando) onEnviar(numeros);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    onEnviar(codigo);
  }

  return (
    <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
      <label htmlFor="codigo-acceso" className="text-espresso text-sm font-semibold">
        El código del correo
      </label>
      <input
        id="codigo-acceso"
        name="codigo"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        autoFocus
        maxLength={CODIGO_MAX}
        value={codigo}
        onChange={(e) => cambiar(e.target.value)}
        disabled={verificando}
        placeholder="000000"
        aria-invalid={error !== ""}
        aria-describedby={error !== "" ? "codigo-error" : undefined}
        className="bg-ivory border-line-strong text-espresso placeholder:text-ink-muted h-16 rounded-full border text-center font-mono text-2xl tracking-[0.4em] outline-none focus-visible:border-(--gold) disabled:opacity-60"
      />
      {error !== "" && (
        <p id="codigo-error" className="text-status-error text-sm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={verificando || codigo.length < CODIGO_MIN}
        className="bg-cacao text-ivory mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {verificando ? (
          <>
            <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}
