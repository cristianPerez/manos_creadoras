import { Check, Clock, FileText, Hourglass, Link2, Play, ScrollText, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarraProgreso } from "@/components/app/BarraProgreso";
import { ContenidoLeccion } from "@/components/app/ContenidoLeccion";
import { CountUp } from "@/components/app/CountUp";
import { IconChip } from "@/components/app/IconChip";
import { Medir } from "@/components/app/Medir";
import { OfertaEnUnaLinea } from "@/components/app/OfertaEnUnaLinea";
import { Reveal } from "@/components/app/Reveal";
import { EVENTOS } from "@/lib/analitica/eventos";
import {
  cargarCurso,
  formatearDuracion,
  primerNombre,
  type Curso,
  type Leccion,
  type TipoLeccion,
} from "@/lib/curso";

export const metadata: Metadata = { title: "Mis cursos — Manos Creadoras" };

const ICONO_TIPO: Record<TipoLeccion, typeof Play> = {
  video: Play,
  pdf: FileText,
  enlace: Link2,
  texto: ScrollText,
};

export default async function Cursos() {
  const curso = await cargarCurso();
  if (!curso) redirect("/login");

  const { alumna, secciones, completadas, totalLecciones, pct, siguiente } = curso;

  // Sin cuenta: la base ya entregó SOLO lo libre, así que esta rama no tapa
  // nada — solo cuenta otra historia, la de quien todavía no compró.
  if (!alumna) return <CursoDeVisita curso={curso} />;

  if (!alumna.tieneAcceso) return <MembresiaInactiva />;

  const arrancando = completadas === 0;
  const conLecciones = secciones.filter((s) => s.lecciones.length > 0);
  const pendientes = secciones.filter((s) => s.lecciones.length === 0);

  return (
    <>
      <Reveal>
        <header>
          {alumna.diasEnPrograma !== null && (
            <p className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
              Día {alumna.diasEnPrograma} en el programa
            </p>
          )}
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Hola, {primerNombre(alumna)}
          </h1>
        </header>
      </Reveal>

      {/* OBJETO PRINCIPAL — retomar donde quedó */}
      <Reveal delay={0.06}>
        {siguiente ? (
          <section
            aria-label="Continuar el curso"
            className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]"
          >
            <ContenidoLeccion leccion={siguiente} />
            <p
              className="text-brand-primary mt-4"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
            >
              {arrancando ? "EMPIEZA AQUÍ" : "SIGUES AQUÍ"}
            </p>
            <h2
              className="font-display font-normal text-text-primary mt-1 text-balance"
              style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
            >
              {siguiente.titulo}
            </h2>
            <SubtituloLeccion leccion={siguiente} />

            <Link
              href={`/cursos/${siguiente.id}`}
              className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                fontSize: "var(--text-base)",
              }}
            >
              <Play size={18} aria-hidden="true" />
              {arrancando ? "Empezar" : "Seguir tejiendo"}
            </Link>
          </section>
        ) : (
          <section
            aria-label="Programa completo"
            className="mt-6 rounded-xl border border-border-default bg-surface-primary p-5 text-center shadow-[var(--shadow-gold)]"
          >
            <div className="celebrate flex justify-center">
              <IconChip icon={Sparkles} size={52} />
            </div>
            <h2 className="font-display font-normal text-text-primary mt-3" style={{ fontSize: "var(--text-xl)" }}>
              Terminaste todo el programa
            </h2>
            <p className="text-text-secondary mt-1" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
              Cada mes se suman modelos nuevos a tu membresía — te avisamos cuando lleguen.
            </p>
          </section>
        )}
      </Reveal>

      {/* PROGRESO */}
      <Reveal delay={0.12}>
        <section aria-label="Tu avance" className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-text-secondary" style={{ fontSize: "var(--text-sm)" }}>
              Tu avance
            </p>
            <p className="font-display text-text-primary cifra" style={{ fontSize: "var(--text-xl)" }}>
              <CountUp to={completadas} duration={600} />
              <span className="text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
                {" "}
                de {totalLecciones} tutoriales
              </span>
            </p>
          </div>
          <div className="mt-3">
            <BarraProgreso pct={pct} label={`${pct}% del programa completado`} />
          </div>
          <p className="text-text-tertiary mt-2" style={{ fontSize: "var(--text-xs)" }}>
            {completadas === 0
              ? "Marca cada tutorial al terminarlo y verás crecer tu avance (la sección de bienvenida no cuenta)."
              : `Te faltan ${totalLecciones - completadas} para terminar el programa.`}
          </p>
        </section>
      </Reveal>

      {/* SECCIONES con contenido cargado */}
      {conLecciones.map((s, i) => (
        <Reveal key={s.id} delay={0.18 + i * 0.04}>
          <section aria-label={s.titulo} className="mt-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-text-primary min-w-0" style={{ fontSize: "var(--text-lg)" }}>
                <span className="cifra">{s.numero}.</span> {s.titulo}
              </h2>
              {/* La sección de bienvenida NO lleva contador: tener "0/4" al lado de
                  "0 de 5 tutoriales" hacía convivir dos cuentas distintas en pantalla. */}
              {s.cuentaProgreso && (
                <span className="text-text-tertiary shrink-0 cifra" style={{ fontSize: "var(--text-xs)" }}>
                  {s.completadas}/{s.lecciones.length}
                </span>
              )}
            </div>

            {!s.cuentaProgreso && (
              <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
                Bienvenida y recursos — no cuenta para tu avance.
              </p>
            )}

            <ul className="mt-3 flex flex-col gap-2">
              {s.lecciones.map((l) => (
                <li key={l.id}>
                  <FilaLeccion leccion={l} esSiguiente={l.id === siguiente?.id} />
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      ))}

      {/* Un solo aviso para todo lo que falta subir — no uno por sección */}
      {pendientes.length > 0 && (
        <Reveal delay={0.3}>
          <section aria-label="Secciones en camino" className="mt-8">
            <div className="rounded-xl border border-dashed border-border-strong bg-surface-primary p-4">
              <div className="flex items-center gap-3">
                <IconChip icon={Hourglass} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
                    {pendientes.map((s) => `${s.numero}. ${s.titulo}`).join(" · ")}
                  </p>
                  <p
                    className="text-text-tertiary mt-0.5"
                    style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
                  >
                    Estamos subiendo estas lecciones a la app. Mientras tanto las tienes completas en
                    tu área de Hotmart.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.34}>
        <p className="mt-8 text-center text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
          Avanzas a tu ritmo — y cada mes se suman modelos nuevos a tu membresía.
        </p>
      </Reveal>
    </>
  );
}

function SubtituloLeccion({ leccion }: { leccion: Leccion }) {
  const duracion = formatearDuracion(leccion.duracionSeg);
  if (!duracion) return null;
  return (
    <p className="text-text-secondary mt-1 flex items-center gap-1.5" style={{ fontSize: "var(--text-sm)" }}>
      <Clock size={13} aria-hidden="true" /> {duracion}
    </p>
  );
}

function FilaLeccion({ leccion, esSiguiente }: { leccion: Leccion; esSiguiente: boolean }) {
  const Icono = ICONO_TIPO[leccion.tipo];
  const duracion = formatearDuracion(leccion.duracionSeg);

  return (
    <Link
      href={`/cursos/${leccion.id}`}
      className="flex w-full items-center gap-3 rounded-xl border border-border-default bg-surface-primary p-3 text-left shadow-sm transition-transform active:scale-[0.99] [touch-action:manipulation]"
    >
      <span
        aria-hidden="true"
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
          leccion.completada || esSiguiente
            ? "bg-brand-primary-soft text-brand-primary"
            : "bg-surface-tertiary text-text-tertiary"
        }`}
      >
        {leccion.completada ? <Check size={16} strokeWidth={2.5} /> : <Icono size={15} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block line-clamp-2 text-text-primary" style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
          {leccion.numero}. {leccion.titulo}
        </span>
        <span className="mt-0.5 block text-text-tertiary" style={{ fontSize: "var(--text-xs)" }}>
          {duracion ?? ETIQUETA_CORTA[leccion.tipo]}
        </span>
      </span>

      {(leccion.completada || esSiguiente) && (
        <span
          className={`inline-flex w-fit shrink-0 items-center rounded-lg px-2 py-1 ${
            leccion.completada
              ? "border border-border-strong text-text-tertiary"
              : "bg-brand-primary-soft text-brand-primary"
          }`}
          style={{ fontSize: "var(--text-xs)", fontWeight: 500 }}
        >
          {leccion.completada ? "Listo" : "Vas aquí"}
        </span>
      )}
    </Link>
  );
}

const ETIQUETA_CORTA: Record<TipoLeccion, string> = {
  video: "Video",
  pdf: "PDF de patrones",
  enlace: "Enlace",
  texto: "Lectura",
};

/**
 * Lo que ve alguien que entró SIN cuenta.
 *
 * No es una versión recortada de la pantalla de la alumna: es otra pantalla, con
 * otro trabajo que hacer. La de la alumna sirve para retomar donde quedó; esta
 * sirve para que alguien que no conoce el programa vea que funciona.
 *
 * Tres decisiones que importan:
 *
 *  · NO lleva barra de avance. Sin cuenta el progreso no se guarda en ninguna
 *    parte, y pintar un 0% que nunca sube es prometer algo que no ocurre.
 *  · NO dice cuántas lecciones faltan por desbloquear. Un "3 de 58" convierte el
 *    regalo en una muestra ridícula; lo que se enseña es lo que SÍ tiene.
 *  · El botón principal NO es "comprar", es "ver el primer tutorial". Quien
 *    acaba de llegar todavía no tiene motivo para pagar — el motivo es el video.
 */
function CursoDeVisita({ curso }: { curso: Curso }) {
  const { planas, siguiente } = curso;

  // La duración real de lo que se regala, sumada de la base. Escrita a mano
  // envejecería el día que la dueña cambie qué tutoriales son libres.
  const segundos = planas.reduce((t, l) => t + (l.duracionSeg ?? 0), 0);
  const duracionTotal = formatearDuracion(segundos);

  return (
    <>
      {/* El denominador del embudo nuevo: de cada 100 que llegan aquí, cuántas
          ven un video, cuántas dejan el correo y cuántas compran. */}
      <Medir evento={EVENTOS.cortesiaVista} props={{ tutoriales: planas.length }} />

      <Reveal>
        <header>
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            ACCESO DE CORTESÍA
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            Tu primer bolso empieza aquí
          </h1>
          <p
            className="text-text-secondary mt-2"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            {planas.length === 1 ? "Este tutorial es tuyo" : `Estos ${planas.length} tutoriales son tuyos`}
            {duracionTotal ? ` — ${duracionTotal} de clase completa` : ""}, sin pagar y sin crear
            ninguna cuenta.
          </p>
        </header>
      </Reveal>

      {siguiente ? (
        <>
          {/* OBJETO PRINCIPAL — el video, que es el argumento de venta */}
          <Reveal delay={0.06}>
            <section
              aria-label="Empezar por el primer tutorial"
              className="mt-6 rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]"
            >
              <ContenidoLeccion leccion={siguiente} />
              <p
                className="text-brand-primary mt-4"
                style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
              >
                EMPIEZA AQUÍ
              </p>
              <h2
                className="font-display font-normal text-text-primary mt-1 text-balance"
                style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
              >
                {siguiente.titulo}
              </h2>
              <SubtituloLeccion leccion={siguiente} />

              <Link
                href={`/cursos/${siguiente.id}`}
                className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
                  fontSize: "var(--text-base)",
                }}
              >
                <Play size={18} aria-hidden="true" />
                Ver el primer tutorial
              </Link>
            </section>
          </Reveal>

          {planas.length > 1 && (
            <Reveal delay={0.12}>
              <section aria-label="Tutoriales de cortesía" className="mt-8">
                <h2 className="font-display text-text-primary" style={{ fontSize: "var(--text-lg)" }}>
                  Y estos dos también
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {planas.slice(1).map((l) => (
                    <li key={l.id}>
                      <FilaLeccion leccion={l} esSiguiente={false} />
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}
        </>
      ) : (
        /*
          Estado vacío honesto. Pasa si la dueña quita la marca de "libre" a las
          tres lecciones: la base devuelve cero y esta pantalla tiene que decir
          algo, no quedarse en blanco.
        */
        <Reveal delay={0.06}>
          <section className="mt-6 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
            <div className="flex justify-center">
              <IconChip icon={Hourglass} size={52} />
            </div>
            <h2 className="font-display font-normal text-text-primary mt-3" style={{ fontSize: "var(--text-xl)" }}>
              Los tutoriales de cortesía vuelven pronto
            </h2>
            <p
              className="text-text-secondary mt-2"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              Mientras tanto puedes ver de qué se trata el programa completo.
            </p>
          </section>
        </Reveal>
      )}

      {/* La invitación va AL FINAL, después de que vio el contenido. Arriba sería
          pedir dinero antes de dar nada. */}
      <Reveal delay={0.18}>
        <section
          aria-label="El programa completo"
          className="mt-8 rounded-xl border border-border-default bg-surface-primary p-5 shadow-[var(--shadow-gold)]"
        >
          <div className="flex items-center gap-3">
            <IconChip icon={Sparkles} size={44} />
            <h2
              className="font-display font-normal text-text-primary min-w-0 text-balance"
              style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
            >
              ¿Y si sigues hasta el bolso terminado?
            </h2>
          </div>

          {/*
            La línea de identificación, antes de la lista. El copy hablaba del
            producto y no de su noche: FICHA-AVATAR dice que el dolor nº1 de
            Marcela es "mis bolsos no se ven profesionales", y que ya lo intentó
            con tutoriales sueltos. Nombrar eso es lo que hace que la lista de
            abajo deje de ser un catálogo y pase a ser una respuesta.
          */}
          <p
            className="text-text-secondary mt-3"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            Si ya seguiste tutoriales sueltos y el bolso te quedó blando o torcido, no es que no
            tengas manos: es que nadie te corrigió a tiempo.
          </p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {VENTAJAS.map((v) => (
              <li key={v} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary"
                >
                  <Check size={12} strokeWidth={2.5} />
                </span>
                <span
                  className="text-text-secondary"
                  style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
                >
                  {v}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-5 flex h-13 w-full items-center justify-center rounded-full font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
              fontSize: "var(--text-base)",
            }}
          >
            Quiero terminar mi bolso
          </Link>

          <OfertaEnUnaLinea />
        </section>
      </Reveal>

      {/* Quien ya compró y solo quiere entrar no debería tener que buscar dónde */}
      <Reveal delay={0.24}>
        <p className="mt-6 text-center text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
          ¿Ya eres alumna?{" "}
          <Link href="/login" className="text-brand-primary underline underline-offset-4">
            Entra con tu correo
          </Link>
        </p>
      </Reveal>
    </>
  );
}

/**
 * Lo que se suma al comprar. Está en la app y no solo en la landing porque este
 * es el momento en que la pregunta aparece de verdad: acaba de ver un tutorial y
 * quiere saber qué más hay.
 *
 * ⚠️ El CTA manda a la página de ventas, NO al checkout. Hoy `CHECKOUT_URL`
 * apunta al producto viejo de pago único y cobraría lo que no es (anotado en
 * ESTADO.md); poner aquí otro botón de compra sería multiplicar ese error.
 */
const VENTAJAS = [
  "Todos los tutoriales del programa, paso a paso hasta el bolso terminado",
  "El Ojo Experto: le mandas una foto y te dice qué ajustar",
  "Los patrones en PDF y la comunidad de tejedoras",
  "Modelos nuevos cada mes, incluidos en tu membresía",
];

function MembresiaInactiva() {
  return (
    <Reveal>
      <section className="mt-10 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
        <h1 className="font-display font-normal text-text-primary" style={{ fontSize: "var(--text-2xl)" }}>
          Tu membresía no está activa
        </h1>
        <p className="text-text-secondary mt-2" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}>
          Por eso no podemos mostrarte las lecciones. Si crees que es un error, escríbenos y lo
          revisamos contigo — normalmente se resuelve el mismo día.
        </p>
        <Link
          href="/contacto"
          className="mt-5 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold text-text-inverse [touch-action:manipulation]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
            fontSize: "var(--text-sm)",
          }}
        >
          Escribirle a Manos Creadoras
        </Link>
      </section>
    </Reveal>
  );
}
