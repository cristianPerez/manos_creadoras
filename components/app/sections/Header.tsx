import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-(--z-sticky) flex items-center justify-between px-4 py-4 bg-surface-base/90 backdrop-blur-sm border-b border-border-default">
      <Link href="/" className="font-display text-lg font-semibold tracking-tight p-2.5 -m-2.5">
        Manos Creadoras
      </Link>
      <Link
        href="#oferta"
        className="text-sm text-text-secondary hover:text-text-primary transition-colors p-2.5 -m-2.5"
      >
        Ver programa
      </Link>
    </header>
  );
}
