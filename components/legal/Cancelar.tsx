import Link from "next/link";

/**
 * Cómo cancelar.
 *
 * ⚠️ EL TEXTO ES EL MISMO QUE YA ESTABA, PALABRA POR PALABRA. Se movió desde
 * `app/(legal)/cancelar/page.tsx` para que los cuatro documentos compartan una
 * sola plantilla, pero NO se reescribió: es texto legal y parafrasearlo para
 * que "suene mejor" es la forma más fácil de cambiar lo que promete sin darse
 * cuenta.
 *
 * Lo único que cambió son las clases de color —de la paleta oscura a los
 * tokens nuevos— y los enlaces internos, que ahora viven bajo /legal.
 */
export function ContenidoCancelar() {
  return (
    <div className="flex flex-col gap-6 text-ink-body">
        <p>
          Puedes cancelar cuando quieras, sin llamadas y sin dar explicaciones. Tu cobro se
          detiene y conservas el acceso hasta que termine el período que ya pagaste.
        </p>

        <section>
          <h2 className="text-espresso font-semibold">
            Escríbenos y lo hacemos nosotros
          </h2>
          <ul className="mt-2 flex flex-col gap-2 pl-5" style={{ listStyleType: "disc" }}>
            <li>Escríbenos desde la página de Contacto diciendo que quieres cancelar.</li>
            <li>Te confirmamos por correo y detenemos la renovación.</li>
            <li>Conservas el acceso hasta el final del período que ya pagaste.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            O escríbenos y lo hacemos por ti
          </h2>
          <p className="mt-2">
            Si no encuentras la opción, mándanos un correo desde la página de{" "}
            <Link href="/contacto" className="text-gold">Contacto</Link> y lo
            gestionamos. No te vamos a pedir que expliques por qué.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            Qué pasa con tu progreso
          </h2>
          <p className="mt-2">
            Tu cuenta, tus módulos completados y tus consultas con el Ojo Experto se conservan.
            Si vuelves más adelante, retomas donde quedaste.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            ¿Y si quiero que me devuelvan el dinero?
          </h2>
          <p className="mt-2">
            Dentro de los primeros 7 días aplica la garantía completa — mira la{" "}
            <Link href="/legal/reembolso" className="text-gold">política de reembolso</Link>.
          </p>
        </section>
      </div>
  );
}
