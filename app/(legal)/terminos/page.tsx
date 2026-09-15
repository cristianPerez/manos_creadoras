import Link from "next/link";
import { LEY_DATOS, PAIS } from "@/lib/legal";

export default function Terminos() {
  return (
    <article className="px-4 py-16 max-w-2xl mx-auto md:px-8 prose-legal">
      <Link href="/" className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
        ← Volver
      </Link>
      <h1 className="font-display font-normal text-text-primary mt-6" style={{ fontSize: "var(--text-3xl)" }}>
        Términos y condiciones
      </h1>
      <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
        Última actualización: 31 de julio de 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-text-secondary" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>1. Quiénes somos</h2>
          <p className="mt-2">
            &ldquo;Bolsos de Lujo en Cuentas&rdquo; es un programa digital de Manos Creadoras
            (Elizabeth Valencia). Al comprar el programa o usar esta app, aceptas estos
            términos.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>2. Qué incluye tu compra</h2>
          <p className="mt-2">
            Una membresía de acceso al programa mientras esté activa: los tutoriales, los
            patrones descargables, los modelos que se agreguen durante tu membresía, y el
            asistente de mentoría con IA (el &ldquo;Ojo Experto&rdquo;) dentro de los límites de
            uso justo mensual vigentes. Al cancelar, el acceso continúa hasta el final del
            período ya pagado.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>3. El Ojo Experto (asistente de IA) — aviso importante</h2>
          <p className="mt-2">
            El Ojo Experto es una herramienta de inteligencia artificial que da{" "}
            <strong className="text-text-primary">orientación general</strong> sobre tu
            tejido a partir de las fotos que subas. No es una revisión humana, no sustituye el
            criterio de una mentora real, y puede equivocarse. Es un apoyo adicional al
            programa, no una garantía de resultado.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>4. Resultados</h2>
          <p className="mt-2">
            Los resultados (calidad del tejido, ventas de tus propias creaciones) dependen de
            tu práctica y dedicación. No garantizamos un resultado económico específico.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>5. Pagos y renovación</h2>
          <p className="mt-2">
            Es una suscripción de renovación automática: el plan mensual se cobra cada mes
            ($19.99) y el anual una vez al año ($199), hasta que la canceles. El pago se procesa
            de forma segura a través de Hotmart; nosotros no almacenamos los datos de tu tarjeta.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>5b. Cancelación</h2>
          <p className="mt-2">
            Puedes cancelar en cualquier momento, sin penalización — instrucciones en{" "}
            <Link href="/cancelar" className="text-brand-primary">Cómo cancelar</Link>. Al
            cancelar se detienen los cobros futuros y conservas el acceso hasta el final del
            período ya pagado. Si cambiamos el precio, te avisaremos antes de que aplique a tu
            renovación.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>6. Uso indebido</h2>
          <p className="mt-2">
            El contenido del curso es para tu uso personal. No está permitido revenderlo,
            compartirlo ni redistribuirlo.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>7. Ley aplicable</h2>
          <p className="mt-2">
            Estos términos se rigen por las leyes de {PAIS}. El tratamiento de tus datos
            personales sigue la {LEY_DATOS} — el detalle está en la{" "}
            <Link href="/privacidad" className="text-brand-primary">Política de privacidad</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>8. Contacto</h2>
          <p className="mt-2">
            Dudas sobre estos términos: ver la página de{" "}
            <Link href="/contacto" className="text-brand-primary">Contacto</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
