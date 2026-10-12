"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * El último tramo del acceso, cuando la sesión llega en el fragmento de la URL.
 *
 * ⚠️ POR QUÉ EXISTE ESTA PANTALLA. Supabase tiene dos formas de devolver la
 * sesión: como `?code=` —que el servidor lee sin problema— o como
 * `#access_token=…`. La segunda NUNCA llega al servidor: el navegador no manda
 * el fragmento en la petición. `app/auth/callback` es código de servidor, así
 * que ante esa forma veía una petición vacía y respondía "enlace inválido",
 * aunque la sesión fuera buena.
 *
 * Aquí ya estamos en el navegador, que sí tiene el fragmento. El cliente de
 * Supabase lo detecta solo al arrancar y deja la sesión guardada; lo único que
 * hace esta pantalla es esperar a que termine y apartarse.
 *
 * No se le enseña nada a la alumna más que un "un momento": si todo va bien
 * dura menos de un segundo, y poner aquí una marca o una ilustración haría
 * parpadear una pantalla que no aporta nada.
 */
export default function Completar() {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let vivo = true;

    (async () => {
      const supabase = supabaseBrowser();

      /*
       * El cliente procesa el fragmento al construirse, pero no de forma
       * instantánea. Se consulta unas cuantas veces en vez de una sola: con un
       * único intento, una red lenta daría "enlace inválido" con la sesión ya
       * en camino.
       */
      for (let intento = 0; intento < 12; intento++) {
        const { data } = await supabase.auth.getSession();
        if (!vivo) return;
        if (data.session) {
          // `replace` y no `push`: si vuelve atrás no debe volver al enlace ya gastado.
          window.location.replace("/cursos?entrada=vuelve");
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      if (vivo) setFallo(true);
    })();

    return () => {
      vivo = false;
    };
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-center">
      {fallo ? (
        <div>
          <h1 className="font-display text-espresso text-2xl" style={{ fontWeight: 500 }}>
            Ese enlace ya no sirve
          </h1>
          <p className="text-ink-body mx-auto mt-3 max-w-sm text-sm">
            Los enlaces de acceso vencen y solo se pueden usar una vez. Pide uno nuevo y entras
            enseguida.
          </p>
          <a
            href="/login"
            className="bg-espresso mt-6 inline-flex h-12 items-center rounded-full px-6 font-semibold text-white"
          >
            Pedir otro enlace
          </a>
        </div>
      ) : (
        <p className="text-ink-muted text-sm">Un momento, estamos abriendo tu sesión…</p>
      )}
    </main>
  );
}
