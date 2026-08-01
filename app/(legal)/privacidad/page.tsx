import Link from "next/link";

export default function Privacidad() {
  return (
    <article className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Link href="/" className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
        ← Volver
      </Link>
      <h1 className="font-display font-normal text-text-primary mt-6" style={{ fontSize: "var(--text-3xl)" }}>
        Política de privacidad
      </h1>
      <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
        Última actualización: 31 de julio de 2026
      </p>

      <div className="mt-8 flex flex-col gap-6 text-text-secondary" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>1. Qué datos recolectamos</h2>
          <p className="mt-2">
            Tu nombre y correo (al comprar, vía Hotmart), y las fotos que decidas subir al
            Ojo Experto para recibir orientación sobre tu tejido.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>2. Para qué los usamos</h2>
          <p className="mt-2">
            Para darte acceso a tu cuenta, enviarte novedades del programa, y para que el Ojo
            Experto pueda analizar tus fotos y darte una respuesta. No vendemos tus datos a
            terceros.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>3. Fotos que subes al Ojo Experto</h2>
          <p className="mt-2">
            Se usan únicamente para generar tu respuesta y mejorar el servicio. Puedes pedir
            que se eliminen en cualquier momento escribiéndonos.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>4. Con quién compartimos datos</h2>
          <p className="mt-2">
            Con los proveedores que hacen posible el servicio (procesamiento de pago vía
            Hotmart, envío de correos, y el proveedor de inteligencia artificial que procesa
            las fotos del Ojo Experto), solo lo necesario para que funcione.
          </p>
        </section>
        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>5. Tus derechos</h2>
          <p className="mt-2">
            Puedes pedir acceso, corrección o eliminación de tus datos en cualquier momento
            desde la página de{" "}
            <Link href="/contacto" className="text-brand-primary">Contacto</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
