"use client";

import { ArrowUp, Camera, Sparkles } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Las piezas que comparten los DOS Ojo Experto: el de la app (`OjoExperto`) y
 * el mini del home (`OjoDemo`).
 *
 * ⚠️ VIVEN EN UN SOLO SITIO A PROPÓSITO (2026-10-22, pedido de Cristian:
 * "unifica los colores y el estilo de los dos"). Antes cada uno tenía su copia
 * de la burbuja, el avatar y el composer, y en una semana ya eran de tres
 * colores distintos: burbuja espresso en uno y cacao en otro, avatar cuadrado
 * dorado en uno y redondo oscuro en otro. Con una sola pieza no pueden
 * separarse. Lo único que cambia entre los dos es el TAMAÑO (`compacto`).
 *
 * La paleta del Ojo:
 *   · cacao + marfil → lo que dice la alumna y el botón de enviar;
 *   · espresso + `--gold-light` → el Ojo (su avatar);
 *   · arena → el botón de la cámara y la tarjeta de fondo.
 */

/** El avatar del Ojo: círculo espresso con el destello en `--gold-light`. */
export function AvatarOjo({ tamano = "chico" }: { tamano?: "chico" | "grande" }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-espresso text-gold-light flex shrink-0 items-center justify-center rounded-full ${
        tamano === "grande" ? "size-8.5 lg:size-10" : "size-7"
      }`}
    >
      <Sparkles size={tamano === "grande" ? 16 : 14} />
    </span>
  );
}

/** Lo que pregunta la alumna: burbuja cacao, con la esquina de la cola a 6px. */
export function BurbujaAlumna({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`bg-cacao text-ivory ml-auto max-w-[85%] rounded-lg rounded-br-(--radius-cola) px-4 py-3 lg:px-4.5 ${className}`}
    >
      {children}
    </p>
  );
}

/** Tres puntos y no un texto: "pensando…" se lee una vez y cansa a la tercera. */
export function Escribiendo({ tamano = "chico" }: { tamano?: "chico" | "grande" }) {
  return (
    <div className="flex items-center gap-2.5">
      <AvatarOjo tamano={tamano} />
      <div className="flex items-center gap-1.5" role="status" aria-label="Escribiendo">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="bg-ink-muted/50 size-1.5 animate-bounce rounded-full"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Una duda sugerida: píldora con borde, sin relleno. */
export function PildoraSugerencia({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border-line-strong text-espresso hover:bg-sand flex min-h-11 shrink-0 items-center rounded-full border px-4 py-2.5 text-sm whitespace-nowrap transition-colors duration-150 active:scale-[0.97] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * El composer: una sola píldora con la cámara, el texto y enviar.
 *
 * La cámara puede ser un botón (la app: abre el selector de foto) o un enlace
 * (el home: la foto es del plan, así que lleva al precio). Por eso entra como
 * `camara` y no como un callback.
 *
 * `fondo`: el de la píldora tiene que separarse de lo que hay detrás — marfil
 * sobre la crema de la app, crema sobre la tarjeta marfil del home.
 */
export function ComposerOjo({
  texto,
  setTexto,
  enviando,
  onEnviar,
  placeholder,
  camara,
  grande = false,
  fondo = "ivory",
}: {
  texto: string;
  setTexto: (t: string) => void;
  enviando: boolean;
  onEnviar: () => void;
  placeholder: string;
  camara: ReactNode;
  grande?: boolean;
  fondo?: "ivory" | "cream";
}) {
  const boton = grande ? "size-12" : "size-11";

  /* El alto sigue al texto en cada cambio —al escribir, al vaciarse tras
     enviar y al llenarlo una sugerencia—. Si solo se mide al teclear, tras
     enviar el campo se queda con el alto de la pregunta anterior. */
  const campo = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = campo.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [texto]);

  return (
    <div
      className={`${fondo === "cream" ? "bg-cream" : "bg-ivory"} border-line-strong focus-within:border-gold flex items-end gap-2 rounded-xl border p-1.5 transition-colors duration-150 lg:p-2`}
    >
      {camara}

      <textarea
        ref={campo}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          // Enter envía, Mayús+Enter salta de línea: lo que ya hace todo chat.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEnviar();
          }
        }}
        rows={1}
        placeholder={placeholder}
        aria-label="Tu pregunta"
        /* Sin anillo propio: el foco lo marca el borde dorado de la píldora.
           16px como mínimo: con menos, Safari hace zoom al tocar el campo. */
        className={`text-espresso placeholder:text-ink-muted foco-en-contenedor max-h-32 flex-1 resize-none bg-transparent px-1 outline-none ${
          grande ? "min-h-12 py-3 text-lg" : "min-h-11 py-2.5"
        }`}
        style={{ fontSize: grande ? undefined : "1rem" }}
      />

      <button
        type="button"
        onClick={onEnviar}
        disabled={enviando || texto.trim().length < 3}
        aria-label="Enviar"
        className={`bg-cacao text-ivory flex ${boton} shrink-0 items-center justify-center rounded-full transition-[opacity,transform] duration-150 active:scale-[0.94] disabled:cursor-not-allowed`}
      >
        <ArrowUp size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Las clases de la cámara, para el botón de la app y el enlace del home. */
export function claseCamara(grande = false): string {
  return `bg-sand text-cacao hover:bg-sand-hover flex ${
    grande ? "size-12" : "size-11"
  } shrink-0 items-center justify-center rounded-full transition-colors duration-150`;
}

export function IconoCamara() {
  return <Camera size={20} aria-hidden="true" />;
}
