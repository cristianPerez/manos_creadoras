"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { EVENTOS } from "@/lib/analitica/eventos";
import {
  fijarEnFicha,
  identificar,
  iniciarMixpanel,
  medir,
  medirVistaDePagina,
  registrarContexto,
} from "@/lib/analitica/mixpanel";

/**
 * Enciende la analítica una sola vez, en toda la app.
 *
 * Va en el layout raíz, así que corre tanto en la landing como dentro de la app.
 * Sin esto, `medir()` no manda nada — es a propósito: así ningún componente
 * puede empezar a mandar eventos por su cuenta sin pasar por aquí.
 */
export function Analitica({
  userId,
  correo,
  pais,
  region,
  fuentePais,
  ciudad,
  subdivision,
  experimentoPaleta,
}: {
  userId: string | null;
  /** El correo de la sesión, para identificarla en Mixpanel (ver `identificar`). */
  correo?: string | null;
  /** "CO", "MX"… lo da Vercel desde la conexión. Ver `lib/pais.ts`. */
  pais?: string;
  /** "colombia" | "internacional": de qué pasarela cobra ese país. */
  region?: string;
  /** De dónde salió el país: "vercel" (fiable), "idioma" o "defecto". */
  fuentePais?: string;
  /**
   * La ciudad, cuando Vercel la sabe.
   *
   * ⚠️ SE MANDA DESDE AQUÍ PORQUE LA COLUMNA "City" DE MIXPANEL SALE VACÍA, y
   * no es un fallo suyo: la calcula desde la IP, y nosotros no se la damos
   * (`ip: false`) porque es dato personal y la política promete no guardarla.
   * Así se tiene la ciudad sin entregar la IP.
   */
  ciudad?: string | null;
  /** Departamento o estado en código, de `x-vercel-ip-country-region`. */
  subdivision?: string | null;
  /**
   * Qué rama del experimento de paleta le tocó: "b" (lavanda) o "actual".
   *
   * ⚠️ VA COMO SUPER PROPIEDAD, NO COMO UN EVENTO NUEVO, y esa es la pieza que
   * hace que el experimento se pueda leer. Al registrarla aquí, TODOS los
   * eventos que ya existen —`pagina_ventas_vista`, `cta_inscribirme_click`,
   * `checkout_abierto`, `pago_confirmado`…— la llevan pegada, así que cualquier
   * embudo del panel se puede partir en dos con un "Breakdown" y comparar las
   * dos versiones sin instrumentar ni un botón más.
   *
   * Un evento tipo `paleta_vista` habría servido solo para contar cuántas la
   * vieron, que es justo lo que menos importa: lo que se quiere saber es cuál
   * de las dos VENDE.
   */
  experimentoPaleta?: string;
}) {
  useEffect(() => {
    /*
     * ⚠️ EL ORDEN IMPORTA: primero encender, luego registrar el contexto y
     * solo después identificar. `registrarContexto` no hace nada si Mixpanel
     * no está listo, y los eventos en cola salen al identificar — si el
     * contexto llegara después, esos primeros eventos irían sin país, que es
     * justo lo que se venía a arreglar.
     */
    /*
     * ⚠️ LOS TRES ÚLTIMOS SON LOS NOMBRES RESERVADOS DE MIXPANEL, y por eso
     * existen además de `pais` y `ciudad`. Con nombres propios el dato llegaba
     * pero las columnas Country/Region/City del panel seguían vacías: Mixpanel
     * solo las llena desde la IP (que no le damos) o desde estos nombres. Se
     * dejan los propios para no romper los reportes que ya los usan.
     */
    const conocido = fuentePais === "vercel";
    const contexto = {
      pais,
      region,
      fuente_pais: fuentePais,
      ciudad: ciudad ?? undefined,
      mp_country_code: conocido ? pais : undefined,
      $region: subdivision ?? undefined,
      $city: ciudad ?? undefined,
      experimento_paleta: experimentoPaleta,
    };
    /* El contexto va DENTRO del encendido: así los eventos que ya esperaban
       en cola (la vista del home, que se dispara antes que este efecto) salen
       con la variante. Ver la nota en `iniciarMixpanel`. Si Mixpanel ya
       estaba encendido (navegación dentro de la app), `registrarContexto`
       actualiza lo que haya cambiado. */
    iniciarMixpanel(contexto);
    registrarContexto(contexto);
    if (userId) {
      identificar(userId, correo);
      /* La variante también en la ficha: ver `fijarEnFicha` (los pagos los
         manda el servidor y no llevan las super propiedades). */
      fijarEnFicha({ experimento_paleta: experimentoPaleta });
    }
  }, [userId, correo, pais, region, fuentePais, ciudad, subdivision, experimentoPaleta]);

  /*
   * La vista de página en cada navegación dentro de la app. La de la carga la
   * manda el encendido (con el contexto ya puesto); aquí solo las siguientes.
   * Va DESPUÉS del efecto de arriba: en la misma pasada, React corre los
   * efectos de un componente en el orden en que están escritos.
   */
  const ruta = usePathname();
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    medirVistaDePagina();
  }, [ruta]);

  return null;
}

/**
 * Dispara el evento que dice si esta entrada ESTRENA cuenta o es alguien que
 * vuelve.
 *
 * ⚠️ ESTE ES EL ÚNICO MOMENTO EN QUE SE PUEDE SABER, y no es una limitación
 * técnica sino una decisión de seguridad: preguntarle al servidor "¿existe este
 * correo?" mientras alguien lo escribe es exactamente lo que permite enumerar a
 * las alumnas de un sitio, y Supabase se niega a contestarlo. Al abrir el enlace
 * que le llegó al buzón ya demostró que la cuenta es suya, así que aquí sí se
 * puede decir sin abrirle la puerta a nadie.
 *
 * Lo decide el servidor en `/auth/callback` y lo pasa en la URL como
 * `?entrada=nueva|vuelve`. Aquí solo se lee y se manda.
 *
 * ⚠️ Y es el contador REAL de contactos nuevos, no `correo_enviado`: el muro le
 * sale a cualquiera sin sesión, así que quien vuelve tras cerrar sesión queda
 * contado ahí igual.
 */
export function RegistrarEntrada() {
  /*
   * ⚠️ ESTUVO ESCRITO Y SIN MONTAR HASTA EL 2026-11-04: `cuenta_creada` y
   * `cuenta_iniciada` no llegaron NUNCA a Mixpanel. Ahora vive en el layout
   * raíz y lee la URL él mismo, así que no depende de que cada página se
   * acuerde de pasárselo.
   *
   * ⚠️ Y BORRA EL PARÁMETRO EN EL ACTO (lección de El Charcu): mientras siga
   * en la dirección, cada recarga —o cada vez que alguien comparta ese
   * enlace— contaría otra cuenta nueva que no lo es.
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    const entrada = url.searchParams.get("entrada");
    if (entrada !== "nueva" && entrada !== "vuelve") return;
    medir(entrada === "nueva" ? EVENTOS.cuentaCreada : EVENTOS.cuentaIniciada, {
      donde: url.pathname,
    });
    url.searchParams.delete("entrada");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return null;
}
