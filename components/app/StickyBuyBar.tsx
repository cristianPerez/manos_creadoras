"use client";

import { useEffect, useState } from "react";
import { GoldButton } from "@/components/app/GoldButton";
import { CHECKOUT_URL } from "@/lib/config";

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
        <p className="font-display text-text-primary" style={{ fontSize: "var(--text-xl)" }}>
          $25 <span className="font-body text-text-tertiary line-through" style={{ fontSize: "var(--text-sm)" }}>$55</span>
        </p>
        <p className="text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>Pago único</p>
      </div>
      <GoldButton href={CHECKOUT_URL} size="md">
        Quiero acceder →
      </GoldButton>
    </div>
  );
}
