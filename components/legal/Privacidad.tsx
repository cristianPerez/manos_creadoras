import Link from "next/link";
import { AUTORIDAD_DATOS, DOMICILIO, IDENTIFICACION, LEY_DATOS, PAIS, RESPONSABLE } from "@/lib/legal";

/**
 * Política de privacidad.
 *
 * ⚠️ EL TEXTO ES EL MISMO QUE YA ESTABA, PALABRA POR PALABRA. Se movió desde
 * `app/(legal)/privacidad/page.tsx` para que los cuatro documentos compartan una
 * sola plantilla, pero NO se reescribió: es texto legal y parafrasearlo para
 * que "suene mejor" es la forma más fácil de cambiar lo que promete sin darse
 * cuenta.
 *
 * Lo único que cambió son las clases de color —de la paleta oscura a los
 * tokens nuevos— y los enlaces internos, que ahora viven bajo /legal.
 */
export function ContenidoPrivacidad() {
  return (
    <div
        className="flex flex-col gap-6 text-ink-body"
      >
        <p>
          En pocas palabras: guardamos lo mínimo para que el programa funcione, no vendemos tus
          datos a nadie, y puedes pedirnos que los borremos cuando quieras.
        </p>

        <section>
          <h2 className="text-espresso font-semibold">
            Quién responde por tus datos
          </h2>
          <p className="mt-2">
            <strong className="text-espresso">{RESPONSABLE}</strong>
            {IDENTIFICACION ? `, identificado con ${IDENTIFICACION}` : ""}
            {DOMICILIO ? `, con domicilio en ${DOMICILIO}` : ""}. Puedes escribirnos desde{" "}
            <Link href="/contacto" className="text-gold">
              Contacto
            </Link>{" "}
            para cualquier asunto relacionado con tu información.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            1. Qué datos guardamos
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-espresso">Tu correo.</strong> Es con lo que entras — no
              usamos contraseñas. Si creas una cuenta gratuita, es lo único que necesitamos.
            </li>
            <li>
              <strong className="text-espresso">Tu nombre y los datos de tu compra</strong>{" "}
              (plan, fecha), si compras el programa. Nos los pasa la pasarela de pago cuando el cobro se
              aprueba. <strong className="text-espresso">Nunca vemos tu tarjeta</strong>: esa
              la maneja la pasarela de pago y no nos la entrega.
            </li>
            <li>
              <strong className="text-espresso">Tu avance en el curso</strong>: qué tutoriales
              marcaste como terminados.
            </li>
            <li>
              <strong className="text-espresso">
                Tus preguntas y fotos al Ojo Experto
              </strong>
              , junto con sus respuestas. Se guardan para que puedas volver a leerlas y para que el
              Ojo Experto recuerde en qué ibas.
            </li>
            <li>
              <strong className="text-espresso">Cómo usas la app</strong>: qué pantallas abres
              y qué botones tocas. Sin nombre ni correo — ver el punto 4.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            2. Para qué los usamos
          </h2>
          <p className="mt-2">
            Para darte acceso, para que el Ojo Experto pueda responderte sobre tu tejido, para
            avisarte de novedades del programa y para entender qué partes de la app sirven y cuáles
            no. Nada más. <strong className="text-espresso">No vendemos tus datos</strong> ni
            se los pasamos a nadie para publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            3. Las fotos de tu tejido
          </h2>
          <p className="mt-2">
            Cuando le mandas una foto al Ojo Experto, esa foto se envía a{" "}
            <strong className="text-espresso">Google (Gemini)</strong>, que es la inteligencia
            artificial que la analiza y escribe la respuesta. Es el único sitio fuera de nuestra app
            al que va tu foto, y solo para generar esa respuesta.
          </p>
          <p className="mt-2">
            La foto y la respuesta quedan guardadas en tu historial para que puedas volver a
            consultarlas. Si quieres que las borremos, escríbenos.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            4. Quién más ve tus datos
          </h2>
          <p className="mt-2">
            Solo los servicios que hacen funcionar el programa, y cada uno recibe únicamente lo que
            necesita:
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-espresso">La pasarela de pago</strong> — cobra y nos avisa
              cuando el pago se aprueba. Nunca nos entrega los datos de tu tarjeta.
            </li>
            <li>
              <strong className="text-espresso">Supabase</strong> — es donde vive tu cuenta, tu
              avance y tu historial del Ojo Experto.
            </li>
            <li>
              <strong className="text-espresso">Google (Gemini)</strong> — analiza tus fotos y
              preguntas del Ojo Experto.
            </li>
            <li>
              <strong className="text-espresso">Bunny</strong> — guarda y reproduce los videos
              del curso.
            </li>
            <li>
              <strong className="text-espresso">Resend</strong> — envía tus correos de acceso.
            </li>
            <li>
              <strong className="text-espresso">Mixpanel</strong> — mide cómo se usa la app.{" "}
              <strong className="text-espresso">
                No recibe tu correo, ni tu nombre, ni tus fotos, ni tus preguntas
              </strong>
              : solo un código interno que no dice quién eres, qué pantallas abres, desde qué país
              entras y tu tipo de dispositivo. No guardamos tu dirección IP.
              <br />
              <span className="mt-2 block">
                Para entender dónde se traba la gente, Mixpanel también{" "}
                <strong className="text-espresso">graba cómo te mueves por la app</strong>: los
                toques, el desplazamiento y las pantallas por las que pasas.{" "}
                <strong className="text-espresso">
                  Lo que escribes y las fotos que subes salen tapados en esa grabación
                </strong>{" "}
                — ni tus preguntas al Ojo Experto ni tus imágenes quedan registradas. Las
                grabaciones se usan solo para arreglar la app y se borran solas al mes.
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            5. Cookies
          </h2>
          <p className="mt-2">
            Usamos dos tipos y ninguno sirve para perseguirte por internet:
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-espresso">Las necesarias</strong>, que mantienen tu sesión
              abierta para que no tengas que entrar en cada pantalla. Sin ellas la app no funciona.
            </li>
            <li>
              <strong className="text-espresso">Las de medición</strong> (Mixpanel), que sirven
              para contar cuánta gente usa cada parte de la app. Puedes bloquearlas desde tu
              navegador o con cualquier bloqueador; si lo haces, la app sigue funcionando
              exactamente igual.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            6. Cuánto tiempo los guardamos
          </h2>
          <p className="mt-2">
            Mientras tengas cuenta. Si nos pides que la borremos, eliminamos tu cuenta y todo lo que
            cuelga de ella —tu avance y tu historial del Ojo Experto— y no se puede recuperar.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            7. Tus derechos
          </h2>
          <p className="mt-2">
            Esta app se rige por la ley de {PAIS} ({LEY_DATOS} de protección de datos personales).
            Como dueña de tus datos puedes, en cualquier momento:
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            <li>
              <strong className="text-espresso">Saber qué tenemos tuyo</strong> y de dónde salió.
            </li>
            <li>
              <strong className="text-espresso">Corregirlo</strong> si algo está mal o
              incompleto.
            </li>
            <li>
              <strong className="text-espresso">Pedir que lo borremos</strong>, salvo lo que la
              ley nos obligue a conservar (por ejemplo, el registro de una compra).
            </li>
            <li>
              <strong className="text-espresso">Retirar tu autorización</strong> para que lo
              usemos.
            </li>
          </ul>
          <p className="mt-2">
            Escríbenos desde{" "}
            <Link href="/contacto" className="text-gold">
              Contacto
            </Link>{" "}
            y te respondemos. Si no lo hacemos o no quedas conforme, puedes acudir a la{" "}
            {AUTORIDAD_DATOS}.
          </p>
        </section>

        <section>
          <h2 className="text-espresso font-semibold">
            8. Si esto cambia
          </h2>
          <p className="mt-2">
            Si empezamos a usar otro servicio o a recoger algo distinto, actualizamos esta página y
            cambiamos la fecha de arriba.
          </p>
        </section>
      </div>
  );
}
