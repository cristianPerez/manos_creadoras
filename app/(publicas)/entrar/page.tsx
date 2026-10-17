import type { Metadata } from "next";
import Link from "next/link";
import { FormularioAcceso } from "@/components/app/FormularioAcceso";
import { precioDesde } from "@/lib/planes";
import { estadoDeLaOferta } from "@/lib/oferta-servidor";

export const metadata: Metadata = {
  title: "Entrar — Manos Creadoras",
  robots: { index: false },
};

/**
 * La puerta. Sustituye a `/login`.
 *
 * En escritorio va partida en dos: un panel oscuro a la izquierda que recuerda
 * a qué vuelves, y el formulario a la derecha. En móvil el panel desaparece —
 * ahí lo único que importa es el campo del correo, y un bloque decorativo
 * empujándolo hacia abajo sería trabajo extra para quien solo quiere entrar.
 */
export default async function Entrar() {
  const oferta = await estadoDeLaOferta();

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <aside className="bg-espresso grain relative hidden flex-col justify-end p-12 lg:flex">
        <p className="text-gold-light text-xs font-bold tracking-[0.18em] uppercase">
          Manos Creadoras
        </p>
        <h2
          className="font-display mt-4 text-4xl text-balance text-white"
          style={{ fontWeight: 500, lineHeight: 1.1 }}
        >
          Tu taller te espera donde lo dejaste.
        </h2>
        <p className="mt-4 max-w-sm text-white/60">
          Tus bolsos, tu avance y tus conversaciones con el Ojo Experto siguen justo como los
          dejaste.
        </p>
      </aside>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <FormularioAcceso lugar="entrar" />

          <p className="text-ink-muted mt-8 text-center text-sm">
            ¿Todavía no tienes plan?{" "}
            {/* Al HOME, no a `/app/plan`: quien lee esto no ha entrado, y la
                pantalla interna lo mandaría de vuelta aquí a iniciar sesión —
                un círculo. En el home ve los planes sin tener que registrarse. */}
            <Link href="/#precio" className="text-gold font-semibold underline">
              Míralos desde {precioDesde(oferta.activa)} al mes
            </Link>
          </p>
          <p className="text-ink-muted mt-2 text-center text-sm">
            O{" "}
            <Link href="/app" className="text-gold font-semibold underline">
              prueba un bolso gratis
            </Link>{" "}
            sin crear cuenta.
          </p>
        </div>
      </div>
    </main>
  );
}
