import { Camera, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ConsultaOjoExperto } from "@/components/app/ConsultaOjoExperto";
import { OfertaEnUnaLinea } from "@/components/app/OfertaEnUnaLinea";
import { Reveal } from "@/components/app/Reveal";
import { cargarOjoExperto } from "@/lib/ojo-experto";

export const metadata: Metadata = { title: "El Ojo Experto — Manos Creadoras" };

export default async function OjoExperto() {
  const estado = await cargarOjoExperto();

  return (
    <>
      <Reveal>
        <header>
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            TU MENTORA DE BOLSILLO
          </p>
          <h1
            className="font-display font-normal text-text-primary mt-1 text-balance"
            style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}
          >
            El Ojo Experto
          </h1>
          <p
            className="text-text-secondary mt-2"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            Sube una foto de tu tejido o cuéntame qué se te complica — te digo qué ajustar antes de
            que sigas.
          </p>
        </header>
      </Reveal>

      {estado === null ? (
        <MuroDeCortesia />
      ) : estado.tieneAcceso ? (
        <ConsultaOjoExperto historialInicial={estado.historial} usoInicial={estado.uso} />
      ) : (
        <Reveal delay={0.06}>
          <section className="mt-6 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm">
            <h2 className="font-display font-normal text-text-primary" style={{ fontSize: "var(--text-xl)" }}>
              El Ojo Experto está en pausa
            </h2>
            <p
              className="text-text-secondary mt-2"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              Vuelve a estar disponible cuando reactives tu membresía. Tus consultas anteriores te
              esperan aquí.
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
      )}

      <Reveal delay={0.24}>
        <p
          className="mt-6 flex items-start gap-2 text-text-tertiary"
          style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
        >
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          El Ojo Experto es orientación con inteligencia artificial, no una revisión humana — puede
          equivocarse. Tu criterio y el método del curso mandan.
        </p>
      </Reveal>
    </>
  );
}

/**
 * Lo que ve alguien SIN cuenta al tocar el Ojo Experto.
 *
 * ⚠️ POR QUÉ NO ES UN MODAL QUE SE CIERRA, que es como funciona en El Charcu.
 * Allí el muro cae encima de una receta que la persona estaba leyendo, así que
 * si no se pudiera cerrar la dejaría sin poder seguir leyendo — de ahí la
 * lección de que tenga salida. Aquí no hay nada debajo: esta pantalla ES el
 * Ojo Experto, y sin cuenta no hay conversación que tapar. Un modal encima de
 * una pantalla vacía es una puerta en mitad del campo.
 *
 * La salida existe igual y es la de siempre: la barra de abajo lo devuelve a los
 * tutoriales de cortesía sin pedirle nada.
 *
 * Y se le ENSEÑA un ejemplo real en vez de describirlo. "Te digo qué ajustar" no
 * significa nada hasta que se ve la respuesta; la muestra hace el trabajo que
 * haría la primera pregunta gratis, sin costar ni un centavo de IA.
 */
function MuroDeCortesia() {
  return (
    <section className="mt-6">
      {/*
        Los bloques entran ESCALONADOS (60-80 ms entre uno y otro) en vez de
        aparecer los tres a la vez. Es lo que hace que la conversación se lea
        como algo que está pasando —pregunta, respuesta— y no como una captura
        de pantalla pegada. La pantalla entera colgaba de un solo `Reveal`.
      */}
      {/*
        ⚠️ UNA SOLA CARD. En la ronda anterior esto eran DOS cards cosidas con
        `-mt-px` para que el escalonado de entrada pudiera animarlas por separado.
        A 375px se veía la costura y la burbuja de respuesta se salía del
        contorno de arriba. El escalonado no necesitaba dos contenedores: los
        `Reveal` van DENTRO de la card, sobre cada burbuja.
      */}
      <div className="rounded-xl border border-border-default bg-surface-primary p-4 shadow-[var(--shadow-gold)]">
        <Reveal delay={0.06}>
          <p
            className="text-brand-primary"
            style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
          >
            ASÍ RESPONDE
          </p>
        </Reveal>

        {/*
          Las dos burbujas NO comparten superficie: con el mismo fondo no se sabe
          quién habla, que es lo único que esta muestra tiene que comunicar. La
          de la alumna va hundida y sin borde; la del Ojo Experto va elevada y
          con un hilo dorado — el acento marca quién es el producto.
        */}
        <Reveal delay={0.12}>
          <div className="mt-3 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-surface-tertiary px-3.5 py-2.5">
            <p
              className="text-text-secondary"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              Se me está abriendo la base del bolso, ¿qué hago?
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-2.5 mr-auto w-fit rounded-2xl rounded-bl-sm border border-brand-primary/35 bg-surface-elevated px-3.5 py-2.5 shadow-sm">
            <p
              className="text-brand-primary"
              style={{ fontSize: "var(--text-xs)", letterSpacing: "var(--tracking-eyebrow)" }}
            >
              EL OJO EXPERTO
            </p>
            <p
              className="text-text-primary mt-1.5"
              style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
            >
              Vas bien con el ritmo de cuentas — lo que se abre es la tensión, no el patrón. Aprieta
              medio punto más al cerrar cada vuelta de la base y sostén el hilo con el pulgar antes
              de pasar a la siguiente.
            </p>
          </div>
        </Reveal>

        {/*
          El botón que dice lo que de verdad va a pasar.

          ⚠️ AQUÍ HABÍA UNA TRAMPA, y la puse yo. Era una caja con forma exacta
          de campo de texto —cámara a la izquierda, "Sube la foto de tu bolso…"
          en gris— que al tocarla sacaba a la página de ventas. El revisor la
          leyó como cebo y tenía razón: la visitante espera que se le abra la
          galería y acaba en un argumento de venta. Un elemento que parece una
          cosa y hace otra cuesta más confianza de la que gana (regla UX 11).

          Ahora es un botón secundario con borde dorado que anuncia el
          desbloqueo. Sigue dando algo tocable —que era el motivo de ponerlo, la
          pantalla no tenía ni un elemento vivo— sin prometer lo que no hace.
        */}
        <Reveal delay={0.28}>
          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 rounded-full border border-brand-primary/45 bg-brand-primary-soft px-4 py-3 text-brand-primary transition-transform active:scale-[0.98] [touch-action:manipulation]"
            style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}
          >
            <Camera size={16} className="shrink-0" aria-hidden="true" />
            Desbloquear para subir mi foto
          </Link>
        </Reveal>

        <Reveal delay={0.34}>
          <p
            className="text-text-tertiary mt-3"
            style={{ fontSize: "var(--text-xs)", lineHeight: "var(--leading-base)" }}
          >
            Ejemplo de una consulta real. Con tu cuenta le mandas la foto de tu bolso y te responde
            sobre tu tejido, no sobre uno de muestra.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.22}>
        <div className="mt-6 rounded-xl border border-border-default bg-surface-primary p-5 text-center shadow-sm">
          <h2
            className="font-display font-normal text-text-primary text-balance"
            style={{ fontSize: "var(--text-xl)", lineHeight: "var(--leading-snug)" }}
          >
            El Ojo Experto viene con el programa
          </h2>
          <p
            className="text-text-secondary mt-2"
            style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-base)" }}
          >
            Es la parte que no cabe en un video: alguien que mira tu bolso y te dice qué ajustar
            antes de que sigas tejiendo mal.
          </p>

          {/* `active:scale` — el feedback al tocar que sí tenía la otra pantalla
              y a esta se le había olvidado. Sin él el botón se siente muerto. */}
          <Link
            href="/"
            className="mt-5 inline-flex h-13 w-full items-center justify-center rounded-full px-6 font-semibold text-text-inverse transition-transform active:scale-[0.98] [touch-action:manipulation]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--brand-gradient-start), var(--brand-gradient-end))",
              fontSize: "var(--text-base)",
            }}
          >
            Quiero mi Ojo Experto
          </Link>

          <OfertaEnUnaLinea />

          <p className="mt-4 text-text-tertiary" style={{ fontSize: "var(--text-sm)" }}>
            ¿Ya eres alumna?{" "}
            <Link href="/login" className="text-brand-primary underline underline-offset-4">
              Entra con tu correo
            </Link>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
