"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="rounded-xl border border-border-default bg-surface-primary overflow-hidden shadow-sm">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-text-primary font-body font-medium" style={{ fontSize: "var(--text-base)" }}>
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0"
              >
                <ChevronDown className="text-brand-primary" size={18} />
              </motion.span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="px-4 pb-4 text-text-secondary" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
                {item.a}
              </p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
