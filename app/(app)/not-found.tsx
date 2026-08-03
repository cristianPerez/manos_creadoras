import { Compass } from "lucide-react";
import Link from "next/link";
import { IconChip } from "@/components/app/IconChip";

/** 404 dentro de la app, en español y con salida (el de Next viene en inglés). */
export default function NoEncontrado() {
  return (
    <section className="mt-10 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
      <div className="flex justify-center">
        <IconChip icon={Compass} size={52} />
      </div>
      <h1
        className="font-display font-normal text-text-primary mt-3"
        style={{ fontSize: "var(--text-2xl)" }}
      >
        Esta lección no existe
      </h1>
      <p
        className="text-text-secondary mt-2"
        style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
      >
        Puede que el enlace esté viejo o que esa lección se haya movido de sección.
      </p>
      <Link
        href="/cursos"
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
          fontSize: "var(--text-sm)",
        }}
      >
        Volver a mis cursos
      </Link>
    </section>
  );
}
