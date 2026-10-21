import type { Metadata } from "next";
import { FormularioContacto } from "@/components/app/FormularioContacto";

export const metadata: Metadata = { title: "Contacto — Manos Creadoras" };

export default function Contacto() {
  return (
    <main className="px-5 py-12">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <p className="eyebrow">Contacto</p>
          <h1 className="titulo-seccion mt-2 text-balance">¿Hablamos?</h1>
          <p className="text-ink-body mt-3">
            Escríbenos y te respondemos en 24 a 48 horas hábiles.
          </p>
          <div className="mt-8">
            <FormularioContacto />
          </div>
        </div>

        {/*
          ⚠️ ESTE BLOQUE EXISTE PORQUE LOS BOTONES "SUSCRIBIRME" LLEGAN AQUÍ.
          Mientras no haya pasarela, quien venía decidido a pagar aterriza en
          esta página — y si no le explicamos qué pasa ahora, se va. Decirle que
          le mandamos el enlace de pago convierte un callejón sin salida en el
          siguiente paso.
        */}
        <aside
          className="h-fit rounded-[var(--radius-xl)] p-7 text-white lg:sticky lg:top-8"
          style={{ backgroundImage: "var(--card-destacada)" }}
        >
          <h2 className="font-display text-2xl text-balance" style={{ fontWeight: 500 }}>
            Te enviamos el enlace de pago a tu correo
          </h2>
          <p className="mt-3 text-sm text-white/75">
            Elige tu plan en el formulario y te escribimos con el enlace para pagar y tu acceso. Lo
            hacemos a mano, así que tardamos unas horas — pero así puedes preguntar lo que quieras
            antes de pagar.
          </p>
          <p className="mt-4 text-sm text-white/60">
            ¿Prefieres probar antes? El bolso Cristal Brillante es gratis y no necesitas cuenta.
          </p>
        </aside>
      </div>
    </main>
  );
}
