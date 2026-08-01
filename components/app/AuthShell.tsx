import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh flex flex-col bg-surface-base grain">
      <header className="px-4 py-4">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-text-primary p-2.5 -m-2.5">
          Manos Creadoras
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
