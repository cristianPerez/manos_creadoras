/**
 * Esqueleto con la FORMA del contenido (15-PATRONES-UX): la espera se siente más
 * corta que con un spinner y no hay salto de layout al llegar los datos.
 */
export default function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="animate-pulse">
      <div className="h-4 w-28 rounded bg-surface-tertiary" />
      <div className="mt-3 h-8 w-48 rounded bg-surface-tertiary" />

      <div className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4">
        <div className="aspect-video w-full rounded-xl bg-surface-tertiary" />
        <div className="mt-4 h-3 w-24 rounded bg-surface-tertiary" />
        <div className="mt-2 h-5 w-3/4 rounded bg-surface-tertiary" />
        <div className="mt-4 h-13 w-full rounded-full bg-surface-tertiary" />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-3">
            <div className="size-9 shrink-0 rounded-lg bg-surface-tertiary" />
            <div className="flex-1">
              <div className="h-3 w-4/5 rounded bg-surface-tertiary" />
              <div className="mt-2 h-2.5 w-16 rounded bg-surface-tertiary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
