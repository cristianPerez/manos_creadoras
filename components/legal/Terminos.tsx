import Link from "next/link";
import { LEY_DATOS, PAIS } from "@/lib/legal";

/**
 * Términos y condiciones.
 *
 * ⚠️ EL TEXTO ES EL MISMO QUE YA ESTABA, PALABRA POR PALABRA. Se movió aquí
 * desde `app/(legal)/terminos/page.tsx` para que los cuatro documentos compartan
 * una sola plantilla, pero NO se reescribió: es texto legal, redactado para la
 * normativa colombiana,
 * y parafrasearlo para que "suene mejor" es la forma más fácil de cambiar lo
 * que promete sin darse cuenta.
 *
 * Lo único que cambió son las clases de color —de la paleta oscura vieja a los
 * tokens nuevos— y los enlaces internos, que ahora viven bajo /legal.
 */
export function ContenidoTerminos() {
  return (
    <div className="flex flex-col gap-6 text-ink-body">
        <section>
          <h2 className="text-espresso font-semibold">1. Quiénes somos</h2>
          <p className="mt-2">
            &ldquo;Bolsos de Lujo en Cuentas&rdquo; es un programa digital de Manos Creadoras
            (Elizabeth Valencia). Al comprar el programa o usar esta app, aceptas estos
            términos.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">2. Qué incluye tu compra</h2>
          <p className="mt-2">
            Una membresía de acceso al programa mientras esté activa: los tutoriales, los
            patrones descargables, los modelos que se agreguen durante tu membresía, y el
            asistente de mentoría con IA (el &ldquo;Ojo Experto&rdquo;) dentro de los límites de
            uso justo mensual vigentes. Al cancelar, el acceso continúa hasta el final del
            período ya pagado.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">3. El Ojo Experto (asistente de IA) — aviso importante</h2>
          <p className="mt-2">
            El Ojo Experto es una herramienta de inteligencia artificial que da{" "}
            <strong className="text-espresso">orientación general</strong> sobre tu
            tejido a partir de las fotos que subas. No es una revisión humana, no sustituye el
            criterio de una mentora real, y puede equivocarse. Es un apoyo adicional al
            programa, no una garantía de resultado.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">4. Resultados</h2>
          <p className="mt-2">
            Los resultados (calidad del tejido, ventas de tus propias creaciones) dependen de
            tu práctica y dedicación. No garantizamos un resultado económico específico.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">5. Pagos y renovación</h2>
          <p className="mt-2">
            Es una suscripción de renovación automática: el plan mensual se cobra cada mes y el
            anual una vez al año, hasta que la canceles. Los precios de cada plan son los que
            aparecen en la página de planes en el momento de contratar. Nosotros no almacenamos
            los datos de tu tarjeta: el cobro lo procesa la pasarela de pago.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">5b. Cancelación</h2>
          <p className="mt-2">
            Puedes cancelar en cualquier momento, sin penalización — instrucciones en{" "}
            <Link href="/legal/cancelar" className="text-gold">Cómo cancelar</Link>. Al
            cancelar se detienen los cobros futuros y conservas el acceso hasta el final del
            período ya pagado. Si cambiamos el precio, te avisaremos antes de que aplique a tu
            renovación.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">6. Uso indebido</h2>
          <p className="mt-2">
            El contenido del curso es para tu uso personal. No está permitido revenderlo,
            compartirlo ni redistribuirlo.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">7. Ley aplicable</h2>
          <p className="mt-2">
            Estos términos se rigen por las leyes de {PAIS}. El tratamiento de tus datos
            personales sigue la {LEY_DATOS} — el detalle está en la{" "}
            <Link href="/legal/privacidad" className="text-gold">Política de privacidad</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-espresso font-semibold">8. Contacto</h2>
          <p className="mt-2">
            Dudas sobre estos términos: ver la página de{" "}
            <Link href="/contacto" className="text-gold">Contacto</Link>.
          </p>
        </section>
      </div>
  );
}
