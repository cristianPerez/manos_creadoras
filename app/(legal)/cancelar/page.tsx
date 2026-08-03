import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cómo cancelar — Manos Creadoras" };

export default function Cancelar() {
  return (
    <article className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Link href="/cuenta" className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
        ← Volver
      </Link>
      <h1 className="font-display font-normal text-text-primary mt-6" style={{ fontSize: "var(--text-3xl)" }}>
        Cómo cancelar tu membresía
      </h1>

      <div className="mt-8 flex flex-col gap-6 text-text-secondary" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
        <p>
          Puedes cancelar cuando quieras, sin llamadas y sin dar explicaciones. Tu cobro se
          detiene y conservas el acceso hasta que termine el período que ya pagaste.
        </p>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            Desde tu cuenta de Hotmart (lo más rápido)
          </h2>
          <ol className="mt-3 flex flex-col gap-2 list-decimal pl-5">
            <li>Entra a tu cuenta en Hotmart, donde hiciste el pago.</li>
            <li>Abre la sección de tus compras o suscripciones.</li>
            <li>Busca &ldquo;Manos Creadoras&rdquo; y elige cancelar la suscripción.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            O escríbenos y lo hacemos por ti
          </h2>
          <p className="mt-2">
            Si no encuentras la opción, mándanos un correo desde la página de{" "}
            <Link href="/contacto" className="text-brand-primary">Contacto</Link> y lo
            gestionamos. No te vamos a pedir que expliques por qué.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            Qué pasa con tu progreso
          </h2>
          <p className="mt-2">
            Tu cuenta, tus módulos completados y tus consultas con el Ojo Experto se conservan.
            Si vuelves más adelante, retomas donde quedaste.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            ¿Y si quiero que me devuelvan el dinero?
          </h2>
          <p className="mt-2">
            Dentro de los primeros 7 días aplica la garantía completa — mira la{" "}
            <Link href="/reembolso" className="text-brand-primary">política de reembolso</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
