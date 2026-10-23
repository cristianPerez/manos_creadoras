"use client";

import { Loader2, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Eyebrow } from "@/components/app/Eyebrow";
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
      {/* App interna (2026-10-23): alineado a la izquierda, con el sobre en un
          círculo arena y la palabra clave en cursiva, como el resto de la app. */}
      <Reveal>
        <span
          aria-hidden="true"
          className="bg-sand text-cacao hidden size-13 items-center justify-center rounded-full md:flex"
        >
          <Mail size={22} />
        </span>
        <p className="eyebrow md:mt-6">Tu cuenta</p>
        {/* Más chico que el titular de sección: va dentro de media tarjeta y,
            a 54px, "correo" se iba solo a una segunda línea. */}
        <h1 className="titulo-seccion mt-3" style={{ fontSize: "clamp(36px, 3vw, 44px)" }}>
          Entra con tu <em className="clave">correo</em>
        </h1>
        <p className="text-ink-body mt-4 text-base">
          Te mandamos un enlace — así guardamos tu avance y tus conversaciones con el Ojo Experto,
          sin que tengas que recordar ninguna contraseña.
        </p>
      </Reveal>

      {avisoDelEnlace && (
        <Reveal delay={0.04}>
          <p className="bg-sand text-espresso mt-4 rounded-md p-3 text-sm" role="alert">
            {avisoDelEnlace}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.08}>
        <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
          {/* Etiqueta VISIBLE: el placeholder desaparece al escribir y no sirve
              de etiqueta. */}
          <label htmlFor="correo-acceso" className="text-espresso text-sm font-semibold">
            Correo
          </label>
          <input
            id="correo-acceso"
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
            placeholder="tucorreo@ejemplo.com"
            className="bg-ivory border-line-strong text-espresso placeholder:text-ink-muted h-14 rounded-full border px-6 outline-none focus-visible:border-(--gold) disabled:opacity-60"
            style={{ fontSize: "1rem" }}
          />
          {estado === "error" && (
            <p className="text-status-error text-sm" role="alert">
              {mensajeError}
            </p>
          )}
          <button
            type="submit"
            disabled={estado === "loading" || !correoValido}
            className="bg-cacao text-ivory mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {estado === "loading" ? (
              <>
                <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Enviando…
              </>
            ) : (
              "Mandarme el enlace"
            )}
          </button>
        </form>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="text-ink-body mt-5 text-sm max-md:text-center">
          ¿Todavía no compraste?{" "}
          <Link href="/#precio" className="text-gold font-semibold underline underline-offset-4">
            Ver el programa
          </Link>
        </p>
      </Reveal>
    </>
  );
}
