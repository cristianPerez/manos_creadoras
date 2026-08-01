"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  duration = 700,
  prefix = "",
  suffix = "",
  locale = "es",
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }

    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * to));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to, duration]);

  return (
    <span className="tabular">
      {prefix}
      {value.toLocaleString(locale)}
      {suffix}
    </span>
  );
}
