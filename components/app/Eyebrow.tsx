export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-body font-medium uppercase text-brand-primary"
      style={{ fontSize: "11px", letterSpacing: "var(--tracking-eyebrow)" }}
    >
      {children}
    </span>
  );
}
