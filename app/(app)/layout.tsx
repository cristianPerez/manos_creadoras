import { Suspense } from "react";
import { RegistrarEntrada } from "@/components/app/Analitica";
import { BottomNav } from "@/components/app/BottomNav";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: Promise<{ entrada?: string }>;
}) {
  // `?entrada=nueva|vuelve` lo pone `/auth/callback`: es el ÚNICO momento en que
  // se puede saber si una cuenta acaba de nacer (ver el comentario de allí).
  const params = await searchParams;
  /*
    La barra de abajo necesita saber si hay alguien dentro para no ofrecer "Mi
    cuenta" a quien no tiene ninguna. Se pregunta AQUÍ, en el servidor, y no en
    la barra: es un componente de cliente y preguntarlo allí significaría pintar
    primero la versión equivocada y corregirla al hidratar — el usuario vería la
    pestaña cambiar de nombre sola.
  */
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col">
      {/* `grain` = el dispositivo ownable de la Opción B (FICHA-ARTE): grano de papel al
          5%. Estaba solo en la landing; sin él la app interna perdía la identidad. */}
      <main className="grain relative mx-auto w-full max-w-md flex-1 px-4 pt-6 pb-10">
        {children}
      </main>
      <BottomNav haySesion={user !== null} />
      <Suspense fallback={null}>
        <RegistrarEntrada entrada={params?.entrada ?? null} />
      </Suspense>
    </div>
  );
}
