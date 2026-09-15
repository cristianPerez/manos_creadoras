import Link from "next/link";
import {
  AUTORIDAD_DATOS,
  DOMICILIO,
  IDENTIFICACION,
  LEY_DATOS,
  PAIS,
  RESPONSABLE,
} from "@/lib/legal";

/**
 * ⚠️ CADA FRASE DE ESTA PÁGINA DESCRIBE ALGO QUE EL CÓDIGO HACE DE VERDAD. Se
 * reescribió el 2026-09-15 porque había dejado de ser cierta:
 *
 *   · Decía que el nombre y el correo se recogen "al comprar, vía Hotmart". Desde
 *     la migración 0012 cualquiera puede crear una cuenta gratis sin comprar.
 *   · No mencionaba Mixpanel, que desde hoy recibe eventos de uso y pone
 *     cookies. Una política que no nombra a quien recibe los datos no cumple su
 *     función, que es justamente esa.
 *   · No decía dónde se guardan los datos ni cuánto tiempo.
 *
 * ⚠️ SI SE CAMBIA UN PROVEEDOR O SE ENCIENDE UNA FUNCIÓN NUEVA, ESTA PÁGINA SE
 * ACTUALIZA EN EL MISMO COMMIT. En particular: si algún día se enciende la
 * grabación de sesión de Mixpanel (hoy está en 0, ver `lib/analitica/mixpanel.ts`),
 * hay que decirlo aquí ANTES de encenderla.
 */
export default function Privacidad() {
  return (
    <article className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Link href="/" className="text-brand-primary" style={{ fontSize: "var(--text-sm)" }}>
        ← Volver
      </Link>
      <h1
        className="font-display font-normal text-text-primary mt-6"
        style={{ fontSize: "var(--text-3xl)" }}
      >
        Política de privacidad
      </h1>
      <p className="text-text-tertiary mt-1" style={{ fontSize: "var(--text-xs)" }}>
        Última actualización: 15 de septiembre de 2026
      </p>

      <div
        className="mt-8 flex flex-col gap-6 text-text-secondary"
        style={{ fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)" }}
      >
        <p>
          En pocas palabras: guardamos lo mínimo para que el programa funcione, no vendemos tus
          datos a nadie, y puedes pedirnos que los borremos cuando quieras.
        </p>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            Quién responde por tus datos
          </h2>
          <p className="mt-2">
            <strong className="text-text-primary">{RESPONSABLE}</strong>
            {IDENTIFICACION ? `, identificado con ${IDENTIFICACION}` : ""}
            {DOMICILIO ? `, con domicilio en ${DOMICILIO}` : ""}. Puedes escribirnos desde{" "}
            <Link href="/contacto" className="text-brand-primary">
              Contacto
            </Link>{" "}
            para cualquier asunto relacionado con tu información.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            1. Qué datos guardamos
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-text-primary">Tu correo.</strong> Es con lo que entras — no
              usamos contraseñas. Si creas una cuenta gratuita, es lo único que necesitamos.
            </li>
            <li>
              <strong className="text-text-primary">Tu nombre y los datos de tu compra</strong>{" "}
              (plan, fecha), si compras el programa. Nos los pasa Hotmart cuando el pago se
              aprueba. <strong className="text-text-primary">Nunca vemos tu tarjeta</strong>: esa
              la maneja Hotmart y no nos la entrega.
            </li>
            <li>
              <strong className="text-text-primary">Tu avance en el curso</strong>: qué tutoriales
              marcaste como terminados.
            </li>
            <li>
              <strong className="text-text-primary">
                Tus preguntas y fotos al Ojo Experto
              </strong>
              , junto con sus respuestas. Se guardan para que puedas volver a leerlas y para que el
              Ojo Experto recuerde en qué ibas.
            </li>
            <li>
              <strong className="text-text-primary">Cómo usas la app</strong>: qué pantallas abres
              y qué botones tocas. Sin nombre ni correo — ver el punto 4.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            2. Para qué los usamos
          </h2>
          <p className="mt-2">
            Para darte acceso, para que el Ojo Experto pueda responderte sobre tu tejido, para
            avisarte de novedades del programa y para entender qué partes de la app sirven y cuáles
            no. Nada más. <strong className="text-text-primary">No vendemos tus datos</strong> ni
            se los pasamos a nadie para publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            3. Las fotos de tu tejido
          </h2>
          <p className="mt-2">
            Cuando le mandas una foto al Ojo Experto, esa foto se envía a{" "}
            <strong className="text-text-primary">Google (Gemini)</strong>, que es la inteligencia
            artificial que la analiza y escribe la respuesta. Es el único sitio fuera de nuestra app
            al que va tu foto, y solo para generar esa respuesta.
          </p>
          <p className="mt-2">
            La foto y la respuesta quedan guardadas en tu historial para que puedas volver a
            consultarlas. Si quieres que las borremos, escríbenos.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            4. Quién más ve tus datos
          </h2>
          <p className="mt-2">
            Solo los servicios que hacen funcionar el programa, y cada uno recibe únicamente lo que
            necesita:
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-text-primary">Hotmart</strong> — cobra el pago y nos avisa
              cuando se aprueba.
            </li>
            <li>
              <strong className="text-text-primary">Supabase</strong> — es donde vive tu cuenta, tu
              avance y tu historial del Ojo Experto.
            </li>
            <li>
              <strong className="text-text-primary">Google (Gemini)</strong> — analiza tus fotos y
              preguntas del Ojo Experto.
            </li>
            <li>
              <strong className="text-text-primary">Bunny</strong> — guarda y reproduce los videos
              del curso.
            </li>
            <li>
              <strong className="text-text-primary">Resend</strong> — envía tus correos de acceso.
            </li>
            <li>
              <strong className="text-text-primary">Mixpanel</strong> — mide cómo se usa la app.{" "}
              <strong className="text-text-primary">
                No recibe tu correo, ni tu nombre, ni tus fotos, ni tus preguntas
              </strong>
              : solo un código interno que no dice quién eres, qué pantallas abres y tu tipo de
              dispositivo. Tampoco guardamos tu dirección IP ni grabamos lo que haces en pantalla.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            5. Cookies
          </h2>
          <p className="mt-2">
            Usamos dos tipos y ninguno sirve para perseguirte por internet:
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-text-primary">Las necesarias</strong>, que mantienen tu sesión
              abierta para que no tengas que entrar en cada pantalla. Sin ellas la app no funciona.
            </li>
            <li>
              <strong className="text-text-primary">Las de medición</strong> (Mixpanel), que sirven
              para contar cuánta gente usa cada parte de la app. Puedes bloquearlas desde tu
              navegador o con cualquier bloqueador; si lo haces, la app sigue funcionando
              exactamente igual.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            6. Cuánto tiempo los guardamos
          </h2>
          <p className="mt-2">
            Mientras tengas cuenta. Si nos pides que la borremos, eliminamos tu cuenta y todo lo que
            cuelga de ella —tu avance y tu historial del Ojo Experto— y no se puede recuperar.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            7. Tus derechos
          </h2>
          <p className="mt-2">
            Esta app se rige por la ley de {PAIS} ({LEY_DATOS} de protección de datos personales).
            Como dueña de tus datos puedes, en cualquier momento:
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-text-primary">Saber qué tenemos tuyo</strong> y de dónde salió.
            </li>
            <li>
              <strong className="text-text-primary">Corregirlo</strong> si algo está mal o
              incompleto.
            </li>
            <li>
              <strong className="text-text-primary">Pedir que lo borremos</strong>, salvo lo que la
              ley nos obligue a conservar (por ejemplo, el registro de una compra).
            </li>
            <li>
              <strong className="text-text-primary">Retirar tu autorización</strong> para que lo
              usemos.
            </li>
          </ul>
          <p className="mt-2">
            Escríbenos desde{" "}
            <Link href="/contacto" className="text-brand-primary">
              Contacto
            </Link>{" "}
            y te respondemos. Si no lo hacemos o no quedas conforme, puedes acudir a la{" "}
            {AUTORIDAD_DATOS}.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold" style={{ fontSize: "var(--text-lg)" }}>
            8. Si esto cambia
          </h2>
          <p className="mt-2">
            Si empezamos a usar otro servicio o a recoger algo distinto, actualizamos esta página y
            cambiamos la fecha de arriba.
          </p>
        </section>
      </div>
    </article>
  );
}
