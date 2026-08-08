"use client";

import { Bell, BellOff, Check, Loader2, Share, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { IconChip } from "@/components/app/IconChip";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Permiso de avisos. NUNCA se pide solo al entrar: eso es el anti-patrón que hace
 * que la gente bloquee las notificaciones para siempre. Se explica el valor y ella
 * decide tocando el botón.
 */
type Estado =
  | "cargando"
  | "no-soportado"
  | "ios-sin-instalar"
  | "disponible"
  | "activando"
  | "activo"
  | "bloqueado"
  | "error";

/**
 * La clave pública viene en base64url y el navegador la pide como bytes.
 * Se reserva el ArrayBuffer explícitamente: `Uint8Array.from` devuelve un buffer
 * genérico que no satisface el tipo que exige `applicationServerKey`.
 */
function aBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const relleno = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + relleno).replace(/-/g, "+").replace(/_/g, "/");
  const crudo = atob(base64);

  const buffer = new ArrayBuffer(crudo.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < crudo.length; i++) bytes[i] = crudo.charCodeAt(i);
  return bytes;
}

export function ActivarAvisos() {
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    let vigente = true;

    // Toda la detección va dentro de la promesa: así el estado nunca se fija de
    // forma síncrona dentro del efecto (evita renders en cascada) y además se
    // descarta si el componente se desmontó mientras tanto.
    (async () => {
      const soporta =
        "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

      // En iPhone los avisos SOLO existen si la app está en la pantalla de inicio.
      // Si no lo detectamos, el botón fallaría sin explicación y parecería roto.
      const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const instalada =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true;

      if (esIOS && !instalada) return "ios-sin-instalar" as const;
      if (!soporta) return "no-soportado" as const;
      if (Notification.permission === "denied") return "bloqueado" as const;

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        return sub ? ("activo" as const) : ("disponible" as const);
      } catch {
        return "disponible" as const;
      }
    })().then((resultado) => {
      if (vigente) setEstado(resultado);
    });

    return () => {
      vigente = false;
    };
  }, []);

  async function activar() {
    setEstado("activando");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "disponible");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: aBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""),
      });

      const {
        data: { session },
      } = await supabaseBrowser().auth.getSession();
      if (!session) {
        setEstado("error");
        return;
      }

      const res = await fetch("/api/push/suscribir", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        // Si el servidor no lo guardó, tampoco dejamos la suscripción viva en el
        // navegador: quedaría diciendo "activo" sin que nunca llegue nada.
        await sub.unsubscribe().catch(() => {});
        setEstado("error");
        return;
      }
      setEstado("activo");
    } catch {
      setEstado("error");
    }
  }

  async function desactivar() {
    setEstado("activando");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const {
          data: { session },
        } = await supabaseBrowser().auth.getSession();
        if (session) {
          await fetch(`/api/push/suscribir?endpoint=${encodeURIComponent(sub.endpoint)}`, {
            method: "DELETE",
            headers: { authorization: `Bearer ${session.access_token}` },
          }).catch(() => {});
        }
        await sub.unsubscribe();
      }
      setEstado("disponible");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "cargando" || estado === "no-soportado") return null;

  // ── iPhone sin instalar: instrucción, no un botón que va a fallar ──
  if (estado === "ios-sin-instalar") {
    return (
      <Tarjeta icono={Smartphone} titulo="Instala la app para recibir avisos">
        <span className="flex flex-wrap items-center gap-1">
          En iPhone toca <Share size={13} className="inline text-brand-primary" aria-hidden="true" />
          <span className="text-text-primary">Compartir</span> y luego
          <span className="text-text-primary">Agregar a inicio</span>. Desde ahí podrás activarlos.
        </span>
      </Tarjeta>
    );
  }

  if (estado === "bloqueado") {
    return (
      <Tarjeta icono={BellOff} titulo="Los avisos están bloqueados">
        Los bloqueaste en tu navegador. Para volver a recibirlos, actívalos en los ajustes del sitio
        y vuelve a esta pantalla.
      </Tarjeta>
    );
  }

  const activo = estado === "activo";
  const ocupado = estado === "activando";

  return (
    <Tarjeta
      icono={activo ? Check : Bell}
      titulo={activo ? "Avisos activados" : "Avísame cuando haya modelo nuevo"}
    >
      {activo
        ? "Te escribiremos solo cuando se suma un modelo nuevo a tu membresía. Nada más."
        : "Cada mes se suman modelos nuevos. Activa los avisos y te enteras el día que llegan, sin revisar la app."}

      <button
        type="button"
        onClick={activo ? desactivar : activar}
        disabled={ocupado}
        className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold transition-transform active:scale-[0.98] disabled:opacity-60 [touch-action:manipulation] ${
          activo ? "border border-border-strong text-text-secondary" : "text-text-inverse"
        }`}
        style={{
          backgroundImage: activo
            ? undefined
            : "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
          fontSize: "var(--text-sm)",
        }}
      >
        {ocupado ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <Bell size={15} aria-hidden="true" />
        )}
        {activo ? "Desactivar los avisos" : "Activar los avisos"}
      </button>

      {estado === "error" && (
        <span className="text-status-error mt-2 block" role="alert">
          No pudimos activarlos. Revisa tu conexión y vuelve a intentar.
        </span>
      )}
    </Tarjeta>
  );
}

function Tarjeta({
  icono,
  titulo,
  children,
}: {
  icono: typeof Bell;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label="Avisos"
      className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <IconChip icon={icono} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
            {titulo}
          </p>
          <div
            className="text-text-tertiary mt-0.5"
            style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
