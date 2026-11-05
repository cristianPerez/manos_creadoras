"use client";

import { usePrecios } from "@/components/app/Precios";
import {
  ArrowUpRight,
  Gem,
  Gift,
  LockKeyhole,
  Magnet,
  Package,
  Scissors,
  Search,
  Spool,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EyebrowLinea } from "@/components/home/EyebrowLinea";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { rutaCompra, type AccesoDirectorio, type ItemDirectorio } from "@/lib/bolsos-logica";
import { EVENTOS } from "@/lib/analitica/eventos";
import { medir } from "@/lib/analitica/mixpanel";
import { GARANTIA } from "@/lib/planes";

/** Qué aviso está abierto: ninguno o "esto es de la membresía". */
type Aviso = null | "membresia";

const ICONO_CATEGORIA: Record<string, LucideIcon> = {
  cuentas: Gem,
  hilos: Spool,
  herrajes: Magnet,
  herramientas: Scissors,
};

/**
 * El directorio de proveedores.
 *
 * El buscador filtra en el navegador y no en la base: son 33 productos y caben
 * de sobra en memoria. Una consulta por cada letra tecleada sería más lento y
 * más frágil que esto, y encima necesitaría un estado de carga.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * ⚠️ EL DIRECTORIO SE VE ENTERO; EL CLIC ES DE QUIEN PAGA (2026-11-02, 0042)
 * ════════════════════════════════════════════════════════════════════════════
 * Pedido de Cristian: UN producto (`gratis`, va primero) lo abre cualquiera,
 * con cuenta o sin ella; los demás, solo con la membresía, y sin ella muestran
 * el candado y el aviso. Esta pantalla NUNCA recibe las
 * URL de Temu —solo `tieneEnlace`—: el botón lleva a `/app/directorio/ir/<id>`,
 * que comprueba en el servidor. Lo de aquí es solo para avisar ANTES de
 * navegar, no el control: si se saltara, la ruta devuelve aquí con
 * `?bloqueado=` y el aviso sale igual.
 */
export function Directorio({
  categorias,
  items,
  acceso,
  avisoInicial,
}: {
  categorias: { id: string; nombre: string }[];
  items: ItemDirectorio[];
  acceso: AccesoDirectorio;
  avisoInicial: Aviso;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso>(avisoInicial);

  const conEnlace = useMemo(() => items.filter((i) => i.tieneEnlace).length, [items]);
  const gratis = items.find((i) => i.gratis && i.tieneEnlace);
  const conFotos = useMemo(() => items.some((i) => i.imagenUrl), [items]);

  const cerrarAviso = () => {
    setAviso(null);
    /* Si vino de la ruta (`?bloqueado=`), que recargar no lo vuelva a abrir. */
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  };

  const porCategoria = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const i of items) cuenta.set(i.categoria, (cuenta.get(i.categoria) ?? 0) + 1);
    return cuenta;
  }, [items]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter((i) => {
      if (categoria && i.categoria !== categoria) return false;
      if (!q) return true;
      return i.nombre.toLowerCase().includes(q) || i.categoria.toLowerCase().includes(q);
    });
  }, [items, busqueda, categoria]);

  return (
    <div className="w-full">
      {/*
        ⚠️ LA CABECERA VA EN UNA FRANJA ARENA A TODO EL ANCHO (app interna,
        2026-10-23), con el buscador dentro: buscar es lo primero que se hace
        aquí, y en la franja se ve como parte del título, no como un campo más.
      */}
      <header className="bg-sand border-line border-b px-4 py-6 lg:px-8 lg:py-10">
        <div className="mx-auto flex max-w-310 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="min-w-0">
            <EyebrowLinea>Directorio</EyebrowLinea>
            <h1 className="titulo-seccion mt-3 text-balance">
              Todo lo que necesitas, <em className="clave">en un clic</em>
            </h1>
            <p className="text-ink-body mt-3 max-w-2xl max-lg:hidden">
              Los mismos materiales que usamos en los cursos, con el enlace directo para comprarlos.
            </p>
          </div>

          <div className="relative w-full shrink-0 lg:w-110">
            <Search
              size={18}
              className="text-ink-muted pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar cuentas, hilo, cierres…"
              aria-label="Buscar en el directorio"
              className="bg-ivory border-line-strong text-espresso placeholder:text-ink-muted h-14 w-full rounded-full border pr-5 pl-13 outline-none focus-visible:border-(--gold)"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-310 px-4 pt-6 pb-24 lg:px-8 lg:py-8">
        {!acceso.conAcceso && gratis && (
          <FranjaGratis gratis={gratis.nombre} conEnlace={conEnlace} />
        )}

        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="sin-barra -mx-4 flex gap-2.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
        >
          <Chip activo={categoria === null} onClick={() => setCategoria(null)} cuenta={items.length}>
            Todo
          </Chip>
          {categorias.map((c) => (
            <Chip
              key={c.id}
              activo={categoria === c.nombre}
              onClick={() => setCategoria(c.nombre)}
              cuenta={porCategoria.get(c.nombre) ?? 0}
            >
              {c.nombre}
            </Chip>
          ))}
        </div>

        {visibles.length === 0 ? (
          <p className="text-ink-muted mt-10 text-sm">
            No encontramos nada con «{busqueda}».{" "}
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setCategoria(null);
              }}
              className="text-gold font-semibold underline"
            >
              Ver todo
            </button>
            .
          </p>
        ) : (
          /*
            ⚠️ TARJETA SOLO SI HAY FOTO (pedido de Cristian, 2026-11-02). Una
            tarjeta con un ícono suelto en vez de foto es una caja vacía: a
            cuatro columnas en escritorio se veía como un catálogo sin cargar.
            Sin fotos, el directorio es una LISTA de filas (ícono pequeño,
            nombre, botón), que es lo que de verdad es. En cuanto haya fotos en
            `imagen_url`, vuelve la cuadrícula de tarjetas.
          */
          conFotos ? (
            <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-4 lg:gap-4">
              {visibles.map((item, n) => (
                <li
                  key={item.id}
                  style={{ "--reveal-delay": `${Math.min(n, 8) * 50}ms` } as CSSProperties}
                  className="reveal motion-reduce:animate-none bg-ivory border-line flex items-center gap-3.5 rounded-lg border p-3 pr-3.5 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-hidden lg:p-0"
                >
                  <Miniatura item={item} />
                  <div className="min-w-0 flex-1 lg:px-6 lg:pt-5">
                    <p className="eyebrow">{item.categoria}</p>
                    <h3
                      className="font-display text-espresso mt-1 text-[21px] leading-[1.15] lining-nums lg:mt-1.5 lg:text-2xl"
                      style={{ fontWeight: 500 }}
                    >
                      {item.nombre}
                    </h3>
                    <p className="text-ink-muted mt-1 text-sm">
                      Se usa en {item.bolsos} {item.bolsos === 1 ? "bolso" : "bolsos"}
                    </p>
                  </div>
                  <div className="shrink-0 lg:mt-auto lg:px-6 lg:pt-5 lg:pb-6">
                    <BotonCompra item={item} conAcceso={acceso.conAcceso} onBloqueado={() => setAviso("membresia")} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            /* Una sola superficie con filas separadas por una línea fina; en
               escritorio, dos columnas para que la fila no mida 1200px. */
            <ul className="bg-ivory border-line mt-6 overflow-hidden rounded-lg border lg:grid lg:grid-cols-2 [&>li:last-child]:border-b-0 lg:[&>li:nth-last-child(2):nth-child(odd)]:border-b-0">
              {visibles.map((item, n) => {
                const Icono = ICONO_CATEGORIA[item.categoriaId] ?? Package;
                return (
                  <li
                    key={item.id}
                    style={{ "--reveal-delay": `${Math.min(n, 10) * 40}ms` } as CSSProperties}
                    className="reveal motion-reduce:animate-none border-line flex min-h-18 items-center gap-3.5 border-b px-4 py-3 lg:px-6 lg:odd:border-r"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                        item.gratis && !acceso.conAcceso ? "bg-gold-pale text-cacao" : "bg-sand text-cacao/80"
                      }`}
                    >
                      <Icono size={20} strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-display text-espresso text-[19px] leading-tight lining-nums lg:text-xl"
                        style={{ fontWeight: 500 }}
                      >
                        {item.nombre}
                      </h3>
                      <p className="text-ink-muted mt-0.5 truncate text-[13px]">
                        {item.categoria} · {item.bolsos} {item.bolsos === 1 ? "bolso" : "bolsos"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <BotonCompra
                        item={item}
                        conAcceso={acceso.conAcceso}
                        onBloqueado={() => setAviso("membresia")}
                        compacto
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        )}

        <p className="text-ink-muted mt-8 text-xs">
          Los precios y la disponibilidad dependen de Temu y pueden cambiar. Algunos enlaces son de
          afiliado: a ti no te cuesta más y nos ayuda a seguir haciendo cursos.
        </p>
      </div>

      <AvisoDirectorio aviso={aviso} conEnlace={conEnlace} onCerrar={cerrarAviso} />
    </div>
  );
}

/**
 * El botón de cada producto: comprar (con membresía o si es el gratis),
 * desbloquear (abre el aviso) o "Pronto" si aún no hay enlace.
 *
 * ⚠️ SIN ENLACE, EL BOTÓN SE VE PERO NO MIENTE. Esconderlo dejaría la fila coja
 * y sin explicar por qué; un botón activo que no lleva a ningún sitio es peor.
 */
function BotonCompra({
  item,
  conAcceso,
  onBloqueado,
  compacto = false,
}: {
  item: ItemDirectorio;
  conAcceso: boolean;
  onBloqueado: () => void;
  compacto?: boolean;
}) {
  const alto = compacto ? "h-10 px-3.5" : "h-11 px-4";
  if (!item.tieneEnlace) {
    return (
      <span
        aria-disabled="true"
        className={`border-line-strong text-ink-muted flex ${alto} cursor-not-allowed items-center justify-center rounded-full border border-dashed text-sm font-semibold`}
      >
        <span className={compacto ? "" : "lg:hidden"}>Pronto</span>
        {!compacto && <span className="max-lg:hidden">Enlace pronto</span>}
      </span>
    );
  }
  if (conAcceso || item.gratis) {
    return (
      <a
        href={rutaCompra(item.id)}
        target="_blank"
        /* `sponsored`: pueden ser de afiliado y decirlo es lo correcto.
           `noopener`: la pestaña nueva no toca la nuestra. */
        rel="sponsored noopener"
        onClick={() =>
          medir(EVENTOS.directorioClic, {
            producto: item.nombre,
            categoria: item.categoria,
            gratis: item.gratis,
            con_acceso: conAcceso,
          })
        }
        className={`bg-cacao text-ivory flex ${alto} items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-transform duration-100 [touch-action:manipulation] active:scale-[0.97]`}
      >
        {/* Sin membresía, el abierto se dice: es la muestra gratis. */}
        {conAcceso ? "Comprar" : "Gratis"}
        <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onBloqueado}
      aria-haspopup="dialog"
      aria-label={`Desbloquear el enlace de ${item.nombre}`}
      /* En la fila de móvil, solo el candado (44px): la palabra entera le
         quitaba al nombre del producto el ancho que necesita para leerse. La
         franja de arriba ya explica qué abre la membresía. */
      className={`border-cacao text-cacao hover:bg-sand flex items-center justify-center gap-1.5 rounded-full border text-sm font-semibold transition-[background-color,transform] duration-100 [touch-action:manipulation] active:scale-[0.97] ${
        compacto ? "size-11 lg:h-10 lg:w-auto lg:px-3.5" : "h-11 px-4 lg:w-full"
      }`}
    >
      <LockKeyhole size={compacto ? 17 : 15} aria-hidden="true" />
      <span className={compacto ? "max-lg:hidden" : ""}>Desbloquear</span>
    </button>
  );
}

/**
 * Foto del producto o, si todavía no hay, el ícono de su categoría sobre arena.
 * `unoptimized`: las fotos vienen del CDN de la tienda y no hay que dar de alta
 * cada dominio para servirlas tal cual.
 */
function Miniatura({ item }: { item: ItemDirectorio }) {
  const Icono = ICONO_CATEGORIA[item.categoriaId] ?? Package;
  return (
    <div className="bg-sand relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md lg:aspect-[4/3] lg:size-auto lg:w-full lg:rounded-none">
      {item.imagenUrl ? (
        <Image
          src={item.imagenUrl}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 300px, 64px"
          className="object-cover"
        />
      ) : (
        <Icono className="text-cacao/70 size-6 lg:size-10" strokeWidth={1.5} aria-hidden="true" />
      )}
    </div>
  );
}

/** La línea que dice cuál es el enlace gratis y qué abre la membresía. */
function FranjaGratis({ gratis, conEnlace }: { gratis: string; conEnlace: number }) {
  return (
    <div className="bg-gold-pale/50 border-line mb-5 flex items-center gap-3 rounded-lg border px-4 py-3 lg:px-5">
      <span aria-hidden="true" className="bg-ivory text-cacao flex size-10 shrink-0 items-center justify-center rounded-full">
        <Gift size={18} />
      </span>
      <p className="text-espresso min-w-0 flex-1 text-sm leading-snug lg:text-[15px]">
        <strong className="font-semibold">«{gratis}» va gratis.</strong>{" "}
        <span className="max-lg:hidden">Con la membresía abres los {conEnlace} enlaces de compra.</span>
        <span className="lg:hidden">Los demás, con la membresía.</span>
      </p>
      <Link href="/app/plan" className="text-cacao shrink-0 text-sm font-semibold underline underline-offset-2">
        Ver plan
      </Link>
    </div>
  );
}

/**
 * El aviso de "este enlace es de la membresía" (o "crea tu cuenta").
 *
 * `<dialog>` nativo con `showModal()`: el foco entra y no se escapa, Escape
 * cierra y la página de atrás queda inerte sin escribir nada de eso a mano.
 */
function AvisoDirectorio({
  aviso,
  conEnlace,
  onCerrar,
}: {
  aviso: Aviso;
  conEnlace: number;
  onCerrar: () => void;
}) {
  const pr = usePrecios();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aviso && !d.open) d.showModal();
    if (!aviso && d.open) d.close();
  }, [aviso]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => {
        /* Tocar el fondo (fuera de la caja) cierra. */
        if (e.target === e.currentTarget) onCerrar();
      }}
      aria-labelledby="aviso-directorio-titulo"
      className="bg-cream text-espresso m-auto w-[calc(100%-2rem)] max-w-105 rounded-lg p-0 backdrop:bg-(--surface-overlay) open:animate-[aparecer_220ms_var(--ease-out)] motion-reduce:open:animate-none"
    >
      <div className="relative px-6 pt-7 pb-6">
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="text-ink-body hover:bg-sand absolute top-3 right-3 flex size-11 items-center justify-center rounded-full"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <span aria-hidden="true" className="bg-gold-pale text-cacao flex size-12 items-center justify-center rounded-full">
          <LockKeyhole size={22} />
        </span>

        <h2
          id="aviso-directorio-titulo"
          className="font-display mt-4 text-balance"
          style={{ fontWeight: 500, fontSize: 28, lineHeight: 1.1 }}
        >
          Este enlace es de la <em className="clave">membresía</em>
        </h2>

        <p className="text-ink-body mt-3 text-[15px] leading-relaxed">
          Sin dar vueltas entre mil tiendas: cada material del curso, con su enlace directo. La
          membresía abre los {conEnlace} enlaces de compra, todos los proyectos y el Ojo Experto.
        </p>

        <p className="text-ink-muted mt-3 text-sm">
          {pr.desde} al mes · {GARANTIA.titulo}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/app/plan"
            className="bg-cacao text-ivory flex h-12 items-center justify-center rounded-full font-semibold transition-transform duration-100 active:scale-[0.97]"
          >
            Quiero abrir todos los enlaces
          </Link>
          <button
            type="button"
            onClick={onCerrar}
            className="text-ink-body hover:bg-sand flex h-12 items-center justify-center rounded-full font-semibold"
          >
            Ahora no
          </button>
        </div>
      </div>
    </dialog>
  );
}

function Chip({
  children,
  activo,
  cuenta,
  onClick,
}: {
  children: React.ReactNode;
  activo: boolean;
  cuenta: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-5 text-base whitespace-nowrap transition-colors [touch-action:manipulation] ${
        activo
          ? "bg-espresso border-espresso text-cream font-semibold"
          : "border-line-strong text-espresso hover:bg-sand"
      }`}
    >
      {children}
      <span className="cifra">{cuenta}</span>
    </button>
  );
}
