import { BottomNav } from "@/components/app/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* `grain` = el dispositivo ownable de la Opción B (FICHA-ARTE): grano de papel al
          5%. Estaba solo en la landing; sin él la app interna perdía la identidad. */}
      <main className="grain relative mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
