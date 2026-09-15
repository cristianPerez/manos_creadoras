"use client";

import { KeyRound, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eyebrow } from "@/components/app/Eyebrow";
import { GoldSubmitButton } from "@/components/app/GoldButton";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { requestMagicLink } from "@/lib/auth";

/**
 * El formulario de acceso, SIN envoltura.
 *
 * ⚠️ Vive aquí porque lo usan DOS sitios: la página `/login` (a donde llegan los
 * enlaces del correo y las redirecciones del middleware) y la pestaña "Entrar"
 * de la barra de abajo, que lo pinta dentro de la app sin sacar a nadie de ella.
 * Tenerlo duplicado sería tener dos formularios de acceso que el día que cambie
 * uno se comportarán distinto — y en la puerta de entrada eso se nota rápido.
 *
 * Cada sitio pone su propia envoltura: `/login` la centra a pantalla completa,
 * la pestaña lo deja dentro del carril de la app con su navegación visible.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Estado = "idle" | "loading" | "sent" | "error";

export function FormularioAcceso({
  avisoDelEnlace = "",
  lugar = "login",
}: {
  /** Mensaje de por qué falló el enlace del correo, si viene de ahí. */
  avisoDelEnlace?: string;
  /** De dónde salió, para la medición. */
  lugar?: string;
}) {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensajeError, setMensajeError] = useState("");
  const correoValido = EMAIL_PATTERN.test(email);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (estado === "loading") return;
    setEstado("loading");

    const r = await requestMagicLink(email);
    if (r.ok) {
      /*
        ⚠️ ESTO NO ES "CONTACTO NUEVO", aunque lo parezca. Se dispara igual para
        una alumna de siempre que volvió tras cerrar sesión, porque la pantalla
        NO sabe si el correo existe — y no lo sabe a propósito: preguntarlo es lo
        que permite enumerar a las usuarias de un sitio.

        Quién es nueva de verdad lo dicen `cuenta_creada` / `cuenta_iniciada`,
        al abrir el enlace.
      */
      medir(EVENTOS.correoEnviado, { lugar });
      setEstado("sent");
    } else {
      setMensajeError(r.error);
      setEstado("error");
    }
  }

  if (estado === "sent") {
    return (
      <>
        <Reveal className="text-center">
          <div className="flex justify-center">
            <IconChip icon={MailCheck} size={56} />
          </div>
          <Eyebrow>Casi listo</Eyebrow>
          <h1
            className="font-display font-normal text-text-primary mt-2"
            style={{ fontSize: "var(--text-2xl)" }}
          >
            Revisa tu correo
          </h1>
          <p
            className="text-text-secondary mt-3"
            style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}
          >
            Te mandamos un enlace a{" "}
            <strong className="text-text-primary font-medium">{email}</strong> para entrar sin
            contraseña. Si no lo ves en unos minutos, revisa spam.
          </p>
        </Reveal>

        {/*
          ⚠️ ESTE AVISO ES LA CAPA 2 DEL PROBLEMA DEL CORREO DISTINTO. Quien
          compró con un correo y entra con otro no recibe nada —y la pantalla le
          dice "revisa tu correo" igual, por anti-enumeración—, así que se queda
          esperando algo que nunca llega y cree que le robaron. Decirlo aquí
          convierte un reembolso en un mensaje a soporte.
        */}
        <Reveal delay={0.08}>
          <p
            className="text-center text-text-tertiary mt-6"
            style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
          >
            ¿No te llega? Puede que hayas comprado con otro correo —{" "}
            <Link href="/contacto" className="text-brand-primary">
              escríbenos
            </Link>{" "}
            y lo arreglamos el mismo día. O{" "}
            <button
              type="button"
              onClick={() => setEstado("idle")}
              className="text-brand-primary p-1 -m-1"
            >
              prueba con otro correo
            </button>
            .
          </p>
        </Reveal>
      </>
    );
  }

  return (
    <>
      <Reveal className="text-center">
        <div className="flex justify-center">
          <IconChip icon={KeyRound} size={56} />
        </div>
        <Eyebrow>Tu cuenta</Eyebrow>
        <h1
          className="font-display font-normal text-text-primary mt-2"
          style={{ fontSize: "var(--text-2xl)" }}
        >
          Entra con tu correo
        </h1>
        <p
          className="text-text-secondary mt-3"
          style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
        >
          Te mandamos un enlace — así guardamos tu avance y tus conversaciones con el Ojo Experto,
          sin que tengas que recordar ninguna contraseña.
        </p>
      </Reveal>

      {avisoDelEnlace && (
        <Reveal delay={0.04}>
          <p
            className="mt-4 rounded-lg border border-border-default bg-surface-tertiary p-3 text-status-warning"
            style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
            role="alert"
          >
            {avisoDelEnlace}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.08}>
        <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            disabled={estado === "loading"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (estado === "error") setEstado("idle");
            }}
            placeholder="tu@correo.com"
            aria-label="Tu correo electrónico"
            className="h-13 rounded-lg border border-border-default bg-surface-tertiary px-4 text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-strong disabled:opacity-60"
            style={{ fontSize: "var(--text-base)" }}
          />
          {estado === "error" && (
            <p className="text-status-error" style={{ fontSize: "var(--text-xs)" }} role="alert">
              {mensajeError}
            </p>
          )}
          <GoldSubmitButton className="w-full" disabled={estado === "loading" || !correoValido}>
            {estado === "loading" ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Enviando…
              </>
            ) : (
              "Mandarme el enlace →"
            )}
          </GoldSubmitButton>
        </form>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="text-center text-text-tertiary mt-6" style={{ fontSize: "var(--text-xs)" }}>
          ¿Todavía no compraste?{" "}
          <Link href="/#oferta" className="text-brand-primary">
            Ver el programa
          </Link>
        </p>
      </Reveal>
    </>
  );
}
