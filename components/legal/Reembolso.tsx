import Link from "next/link";

/**
 * Política de reembolso.
 *
 * ⚠️ EL TEXTO ES EL MISMO QUE YA ESTABA, PALABRA POR PALABRA. Se movió desde
 * `app/(legal)/reembolso/page.tsx` para que los cuatro documentos compartan una
 * sola plantilla, pero NO se reescribió: es texto legal y parafrasearlo para
 * que "suene mejor" es la forma más fácil de cambiar lo que promete sin darse
 * cuenta.
 *
 * Lo único que cambió son las clases de color —de la paleta oscura a los
 * tokens nuevos— y los enlaces internos, que ahora viven bajo /legal.
 */
export function ContenidoReembolso() {
  return (
    <div className="flex flex-col gap-6 text-ink-body">
        <section>
          <h2 className="text-espresso font-semibold">La Garantía del Primer Bolso Bien Hecho</h2>
          <p className="mt-2">
            Tienes 7 días desde tu primer pago para pedir el reembolso completo, sin preguntas.
            Escríbenos desde la página de Contacto dentro de esos 7 días y te devolvemos el
            dinero íntegro.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">Cómo pedirlo</h2>
          <p className="mt-2">
            Escríbenos desde la página de{" "}
            <Link href="/contacto" className="text-gold">Contacto</Link> y te
            respondemos. No hace falta que expliques por qué.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">Después de los 7 días</h2>
          <p className="mt-2">
            Pasado ese plazo, los pagos ya realizados no son reembolsables. Lo que sí puedes
            hacer en cualquier momento es{" "}
            <Link href="/legal/cancelar" className="text-gold">cancelar tu membresía</Link>{" "}
            para que no se te cobre otra vez: conservas el acceso hasta el final del período que
            ya pagaste.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">Renovaciones</h2>
          <p className="mt-2">
            Las renovaciones automáticas (el cobro mensual o anual siguiente) no son
            reembolsables una vez procesadas. Para evitarlas, cancela antes de la fecha de
            renovación que aparece en tu cuenta.
          </p>
        </section>
      </div>
  );
}
