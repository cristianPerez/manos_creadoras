"use client";

import { useEffect, useState } from "react";
import { GoldButton } from "@/components/app/GoldButton";
import { CHECKOUT_ANUAL, PRECIO_ANUAL_POR_MES } from "@/lib/config";

export function StickyBuyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-(--z-sticky) flex items-center justify-between gap-4 px-4 py-3 bg-surface-base/95 backdrop-blur-sm border-t border-border-default transition-transform duration-300 md:hidden"
      style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
    >
      <div>
        <p className="font-display text-text-primary tabular" style={{ fontSize: "var(--text-xl)" }}>
          ${PRECIO_ANUAL_POR_MES}
          <span className="font-body text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}> /mes</span>
        </p>
        <p className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>Plan anual</p>
      </div>
      <GoldButton href={CHECKOUT_ANUAL} size="md">
        Empezar →
      </GoldButton>
    </div>
  );
}
