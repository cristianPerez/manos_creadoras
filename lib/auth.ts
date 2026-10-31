import { supabaseBrowser } from "@/lib/supabase/client";

export type MagicLinkResult = { ok: true } | { ok: false; error: string };

/**
 * Largo del código que viaja en el correo. Son 6 (ajuste «Email OTP Length» del
 * panel de Supabase), pero se aceptan hasta 8 para que la app no dependa del
 * orden en que se cambie ese ajuste en cada entorno: si QA ya está en 6 y
 * producción todavía en 8, los dos entran.
 */
export const CODIGO_MIN = 6;
export const CODIGO_MAX = 8;

/**
 * Manda el CÓDIGO de acceso al correo.
 *
 * ⚠️ SE LLAMA `requestMagicLink` POR HISTORIA, pero desde el 2026-10-31 lo que
 * llega al buzón es un código de 6 dígitos y NO un enlace. El nombre se conserva
 * para no tocar sus dos llamadas; la llamada a Supabase es la misma
 * (`signInWithOtp`): lo que decide si la alumna recibe enlace o número es la
 * PLANTILLA del panel, no este archivo.
 *
 * Por qué se cambió, con los números de El Charcu —misma pasarela, mismo
 * público— que lo estrenó el 2026-10-30: de 8 personas que tocaron el enlace
 * mágico en una semana, **7 no consiguieron entrar**. Dos causas:
 *
 *   · El enlace abre en OTRO navegador. Se pide desde el navegador de Instagram
 *     y el correo se abre en Safari: la sesión se pide en un sitio y se contesta
 *     en otro, y el enlace se rechaza (PKCE).
 *   · Un FILTRO se lo gasta. Outlook/Hotmail abren los enlaces de los correos
 *     para comprobarlos. Como son de un solo uso, cuando la alumna toca el suyo
 *     ya está usado.
 *
 * El código no tiene ninguno de los dos problemas: se escribe en la misma
 * pantalla donde se pidió, y un filtro que lea el correo no lo gasta.
 *
 * ⚠️ AQUÍ HABÍA `shouldCreateUser: false` Y SE QUITÓ (2026-09-15, opción B de
 * Cristian). El razonamiento viejo era "las cuentas solo las crea el webhook al
 * pagar; si cualquiera pudiera entrar, el programa sería gratis". La primera
 * mitad ya no es cierta y la segunda nunca lo fue:
 *
 *   · Tener cuenta y tener el programa son cosas distintas desde la migración
 *     0009. Las lecciones las entrega la base según `es_libre` y `tiene_acceso()`,
 *     no según si hay sesión. Una cuenta recién creada no tiene ninguna
 *     concesión, así que ve exactamente lo mismo que un visitante: los 3
 *     tutoriales de cortesía. El programa NO se regala por registrarse.
 *   · Lo que sí gana es probar el Ojo Experto 3 veces (cupo `regalo` de la
 *     migración 0012) y que le podamos escribir después. Ese es el negocio.
 *
 * Y cerraba un agujero peor del que abría: las pantallas del visitante invitan
 * a "entrar con tu correo", y con la creación bloqueada esa invitación mandaba
 * un correo que NUNCA llegaba. La pantalla decía "revisa tu correo" igual, por
 * anti-enumeración, así que la persona se quedaba esperando sin saber por qué.
 */
export async function requestMagicLink(email: string): Promise<MagicLinkResult> {
  const limpio = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
    return { ok: false, error: "Ese correo no parece válido." };
  }

  const { error } = await supabaseBrowser().auth.signInWithOtp({
    email: limpio,
    options: {
      // Sin `shouldCreateUser: false` → si el correo no tiene cuenta, se crea.
      // El disparador de la 0012 le monta su perfil; sin concesiones, así que
      // entra al mismo sitio que un visitante pero con sus 8 consultas.
      /*
       * El destino sale del navegador, así que entrar desde localhost manda a
       * localhost y desde QA manda a QA. Esto funciona porque la plantilla del
       * correo lo respeta: `supabase/templates/magic-link.html` arma el enlace
       * con `{{ .RedirectTo }}`, no con el `Site URL` fijo (ver su README).
       *
       * ⚠️ SIN `?` NI PARÁMETROS. La plantilla pega `?token_hash=…` justo
       * detrás; si aquí viniera ya una interrogación saldrían dos y el enlace
       * llegaría roto al buzón de la alumna.
       */
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    // Anti-enumeración (26): nunca revelar si ese correo tiene cuenta o no.
    // Un atacante no debe poder averiguar quiénes son tus alumnas.
    if (/not found|signups not allowed|invalid/i.test(error.message)) {
      return { ok: true };
    }
    if (/rate|too many/i.test(error.message)) {
      return { ok: false, error: "Pediste varios códigos seguidos. Espera un minuto." };
    }
    return { ok: false, error: "No pudimos enviar el código. Inténtalo de nuevo." };
  }

  return { ok: true };
}

/** Lo que devuelve verificar el código: a dónde ir, o qué decirle. */
export type CodigoResult = { ok: true; destino: string } | { ok: false; error: string };

/**
 * Comprueba el código del correo y abre la sesión.
 *
 * ⚠️ LO VERIFICA EL NAVEGADOR, NO NUESTRO SERVIDOR, y es a propósito. Supabase
 * limita los intentos POR IP: hecho desde el navegador, esa IP es la de cada
 * alumna y el límite la protege a ella sola. Hecho desde nuestro servidor,
 * todas saldrían por la IP de Vercel y una sola persona equivocándose dejaría
 * fuera a las demás.
 *
 * Devuelve el destino ya marcado con `?entrada=nueva|vuelve`, igual que hacía
 * el callback del enlace, para que la app sepa si estrena cuenta o vuelve.
 */
export async function verificarCodigo(email: string, codigo: string): Promise<CodigoResult> {
  const token = codigo.replace(/\D/g, "");
  if (token.length < CODIGO_MIN) {
    return { ok: false, error: `Escribe los ${CODIGO_MIN} números del correo.` };
  }

  const { data, error } = await supabaseBrowser().auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: "email",
  });

  if (error) {
    if (/rate|too many/i.test(error.message)) {
      return { ok: false, error: "Demasiados intentos. Espera un minuto y vuelve a probar." };
    }
    /*
     * Supabase contesta lo mismo (`otp_expired`) si el código está mal escrito
     * y si venció, así que el mensaje cubre las dos cosas sin mentir en ninguna.
     */
    return { ok: false, error: "Ese código no sirve: revisa los números o pide uno nuevo." };
  }

  return { ok: true, destino: conEntrada("/cursos", data.user) };
}

/**
 * Marca en la URL si esta entrada ESTRENA cuenta o es alguien que vuelve.
 *
 * Es la misma regla del callback del enlace (`app/auth/callback/route.ts`), que
 * sigue viva para los correos viejos: `created_at` de hace menos de una hora es
 * una cuenta recién nacida, porque el código caduca antes de eso y no hay zona
 * gris. Está duplicada a propósito en los dos sitios —son cuatro líneas— en vez
 * de crear un módulo compartido entre un `route.ts` de servidor y este archivo
 * de navegador.
 */
function conEntrada(destino: string, usuario: { created_at?: string } | null): string {
  if (!usuario?.created_at) return destino;

  const nacio = new Date(usuario.created_at).getTime();
  const esNueva = Number.isFinite(nacio) && Date.now() - nacio < 60 * 60 * 1000;

  // Base de mentira: solo se usa para manipular la ruta, nunca se navega a ella.
  const url = new URL(destino, "https://x.invalid");
  url.searchParams.set("entrada", esNueva ? "nueva" : "vuelve");
  return `${url.pathname}${url.search}`;
}
