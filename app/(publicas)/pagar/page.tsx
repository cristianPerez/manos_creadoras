import type { Metadata } from "next";
import { SelectorDePago } from "@/components/app/SelectorDePago";
import { alumnaActual } from "@/lib/alumna";

export const metadata: Metadata = {
  title: "Elige tu plan — Manos Creadoras",
  // No se indexa: es un paso del embudo, no una página que deba salir en Google.
  // La que vende es la landing; esta solo cobra.
  robots: { index: false },
};

/**
 * La página de pago. PROVISIONAL Y A PROPÓSITO.
 *
 * ⚠️ ESTÁ SIN DISEÑAR PORQUE CRISTIAN LA VA A DISEÑAR. Lleva lo imprescindible
 * —los planes, su precio y un botón por plan— con los tokens de la marca pero
 * sin composición propia. No se le puso más trabajo encima del que va a
 * reemplazarse.
 *
 * ⚠️ TODAVÍA NO COBRA. OnePay no está integrado: los botones llevan a contacto,
 * donde se explica que el enlace de pago llega por correo. El día que exista,
 * se rellena `checkout` en `lib/planes.ts` y estos botones apuntan solos — no
 * hay que tocar esta pantalla.
 */
export default async function Pagar({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ciclo?: string }>;
}) {
  const { plan, ciclo } = await searchParams;
  const alumna = await alumnaActual();

  return (
    <main className="px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="text-center">
          <p className="eyebrow">Tu plan</p>
          <h1 className="titulo-seccion mt-2 text-balance">Elige cómo quieres crear</h1>
          <p className="text-ink-body mt-3">
            Puedes cambiar de plan o cancelar cuando quieras.
          </p>
        </header>

        <SelectorDePago
          planInicial={plan ?? null}
          cicloInicial={ciclo === "mensual" ? "mensual" : "anual"}
          /*
            Si ya entró, no se le vuelve a pedir el correo después de pagar.
            Si no, hace falta saber a quién darle el acceso — por eso el aviso.
          */
          correo={alumna?.email ?? null}
        />
      </div>
    </main>
  );
}
