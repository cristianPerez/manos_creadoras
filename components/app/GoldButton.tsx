"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  size?: "lg" | "md";
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold transition-colors";

function sizeClasses(size: "lg" | "md") {
  return size === "lg" ? "h-13 px-8 text-base" : "h-11 px-6 text-sm";
}

const goldGradientStyle = {
  backgroundImage: "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
};

/**
 * Estado "en espera" (32 — CTAs VIVOS): un primario deshabilitado NUNCA es el pill dorado al 50%
 * (se ve roto). Es una superficie neutra con texto tenue que sigue invitando a actuar.
 */
const waitingClasses = "bg-surface-tertiary text-text-tertiary border border-border-default";

export function GoldButton({
  href,
  children,
  size = "lg",
  variant = "primary",
  className = "",
}: SharedProps & { href: string }) {
  const variants =
    variant === "primary"
      ? "text-text-inverse shadow-[var(--shadow-gold)]"
      : "border border-border-strong text-text-primary bg-transparent";

  return (
    <motion.div whileTap={{ scale: 0.97 }} className={`inline-block ${className}`}>
      <Link
        href={href}
        className={`${BASE} ${sizeClasses(size)} ${variants}`}
        style={variant === "primary" ? goldGradientStyle : undefined}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function GoldSubmitButton({
  children,
  size = "lg",
  variant = "primary",
  className = "",
  disabled = false,
}: SharedProps) {
  const activeVariant =
    variant === "primary"
      ? "text-text-inverse shadow-[var(--shadow-gold)]"
      : "border border-border-strong text-text-primary bg-transparent";

  return (
    <motion.div whileTap={disabled ? undefined : { scale: 0.97 }} className={`inline-block ${className}`}>
      <button
        type="submit"
        disabled={disabled}
        className={`w-full ${BASE} ${sizeClasses(size)} ${disabled ? waitingClasses : activeVariant}`}
        style={!disabled && variant === "primary" ? goldGradientStyle : undefined}
      >
        {children}
      </button>
    </motion.div>
  );
}
