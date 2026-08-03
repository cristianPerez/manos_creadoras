"use client";

import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/app/AuthShell";
import { Eyebrow } from "@/components/app/Eyebrow";
import { GoldSubmitButton } from "@/components/app/GoldButton";
import { IconChip } from "@/components/app/IconChip";
import { Reveal } from "@/components/app/Reveal";
import { requestMagicLink } from "@/lib/auth";

type Status = "idle" | "loading" | "sent" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mensajes de los enlaces que ya no sirven, en palabras de la alumna. */
const ERRORES_DEL_ENLACE: Record<string, string> = {
  enlace_vencido:
    "Ese enlace ya venció o se usó. Pide uno nuevo — tarda un segundo.",
  enlace_invalido: "Ese enlace no era válido. Pide uno nuevo aquí abajo.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell>{null}</AuthShell>}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const searchParams = useSearchParams();
  const errorDelEnlace = ERRORES_DEL_ENLACE[searchParams.get("error") ?? ""] ?? "";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const emailLooksValid = EMAIL_PATTERN.test(email);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    const result = await requestMagicLink(email);
    if (result.ok) {
      setStatus("sent");
    } else {
      setErrorMsg(result.error);
      setStatus("error");
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (status === "error") setStatus("idle");
  }

  if (status === "sent") {
    return (
      <AuthShell>
        <Reveal className="text-center">
          <div className="flex justify-center">
            <IconChip icon={MailCheck} size={56} />
          </div>
          <Eyebrow>Casi listo</Eyebrow>
          <h1 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-2xl)" }}>
            Revisa tu correo
          </h1>
          <p className="text-text-secondary mt-3" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-base)" }}>
            Te mandamos un link a <strong className="text-text-primary font-medium">{email}</strong>{" "}
            para entrar sin contraseña. Si no lo ves en unos minutos, revisa spam.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-center text-text-tertiary mt-6" style={{ fontSize: "var(--text-xs)" }}>
            ¿No te llegó?{" "}
            <button onClick={() => setStatus("idle")} className="text-brand-primary p-1 -m-1">
              Reenviar o cambiar correo
            </button>
          </p>
        </Reveal>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Reveal className="text-center">
        <div className="flex justify-center">
          <IconChip icon={KeyRound} size={56} />
        </div>
        <Eyebrow>Tu cuenta</Eyebrow>
        <h1 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-2xl)" }}>
          Entra a tu cuenta
        </h1>
        <p className="text-text-secondary mt-3" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
          Te mandamos un link a tu correo — así guardamos tu progreso y tus conversaciones con
          el Ojo Experto, sin que tengas que recordar una contraseña.
        </p>
      </Reveal>

      {errorDelEnlace && (
        <Reveal delay={0.04}>
          <p
            className="mt-4 rounded-lg border border-border-default bg-surface-tertiary p-3 text-status-warning"
            style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
            role="alert"
          >
            {errorDelEnlace}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.08}>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            disabled={status === "loading"}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="tu@correo.com"
            aria-label="Tu correo electrónico"
            className="h-13 rounded-lg border border-border-default bg-surface-tertiary px-4 text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-strong disabled:opacity-60"
            style={{ fontSize: "var(--text-base)" }}
          />
          {status === "error" && (
            <p className="text-status-error" style={{ fontSize: "var(--text-xs)" }} role="alert">
              {errorMsg}
            </p>
          )}
          <GoldSubmitButton className="w-full" disabled={status === "loading" || !emailLooksValid}>
            {status === "loading" ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Enviando...
              </>
            ) : (
              "Mandarme el link →"
            )}
          </GoldSubmitButton>
        </form>
      </Reveal>

      <Reveal delay={0.14}>
        <p className="text-center text-text-tertiary mt-6" style={{ fontSize: "var(--text-xs)" }}>
          ¿Todavía no compraste?{" "}
          <a href="/#oferta" className="text-brand-primary">
            Ver el programa
          </a>
        </p>
      </Reveal>
    </AuthShell>
  );
}
