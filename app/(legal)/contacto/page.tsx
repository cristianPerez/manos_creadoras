import Link from "next/link";

export default function Contacto() {
  return (
    <article className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Link href="/" className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
        ← Volver
      </Link>
      <h1 className="font-display font-normal text-text-primary mt-6" style={{ fontSize: "var(--text-3xl)" }}>
        Contacto
      </h1>
      <p className="text-text-secondary mt-4" style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}>
        ¿Dudas sobre el programa, tu compra o un reembolso? Escríbenos y te respondemos en un
        plazo de 24 a 48 horas hábiles.
      </p>
      <a
        href="mailto:hola@manoscreadoras.com"
        className="inline-block mt-6 text-brand-primary font-medium"
        style={{ fontSize: "var(--text-lg)" }}
      >
        hola@manoscreadoras.com
      </a>
    </article>
  );
}
