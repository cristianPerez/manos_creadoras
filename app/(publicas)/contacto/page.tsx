import type { Metadata } from "next";
import Link from "next/link";
import { FormularioContacto } from "@/components/app/FormularioContacto";
import { listarBolsos } from "@/lib/bolsos";
import { GARANTIA } from "@/lib/planes";
import { preciosDeLaPagina } from "@/lib/precios";

export const metadata: Metadata = { title: "Contacto — Manos Creadoras" };

export default async function Contacto() {
  const pr = await preciosDeLaPagina();
  /* El gratis sale de la BASE: aquí decía "Cristal Brillante" a mano cuando el
     regalo ya era Nácar Soñado (corregido el 2026-11-02). */
  const gratis = (await listarBolsos()).find((b) => b.gratis) ?? null;

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
          ⚠️ ESTE BLOQUE DECÍA "TE ENVIAMOS EL ENLACE DE PAGO A TU CORREO, LO
          HACEMOS A MANO" (corregido el 2026-11-02). Era de antes de OnePay,
          cuando los botones de pagar caían aquí. Hoy se paga directo en Mi
          plan, y ese texto hacía creer que no se podía pagar en el momento.
          Lo que queda aquí es para quien viene a preguntar, no a pagar.
        */}
        <aside
          className="h-fit rounded-[var(--radius-xl)] p-7 text-white lg:sticky lg:top-8"
          style={{ backgroundImage: "var(--card-destacada)" }}
        >
          <h2 className="font-display text-2xl text-balance" style={{ fontWeight: 500 }}>
            ¿Ya quieres entrar?
          </h2>
          <p className="mt-3 text-sm text-white/75">
            No hace falta escribirnos: eliges tu plan, pagas con tarjeta y entras al momento. Desde{" "}
            {pr.desde}/mes · {GARANTIA.titulo.toLowerCase()}.
          </p>
          <Link
            href="/app/plan"
            className="text-espresso bg-cream mt-5 inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold"
          >
            Ver los planes
          </Link>
          {gratis && (
            <p className="mt-5 text-sm text-white/60">
              ¿Prefieres probar antes?{" "}
              <Link href={`/app/bolsos/${gratis.slug}`} className="text-white underline underline-offset-4">
                El bolso {gratis.nombre} es gratis
              </Link>{" "}
              y no necesitas cuenta.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
