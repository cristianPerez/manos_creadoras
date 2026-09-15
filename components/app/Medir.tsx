"use client";

import { useEffect, useState } from "react";
import { medir, type Propiedades } from "@/lib/analitica/mixpanel";

/**
 * Manda un evento cuando se pinta una pantalla. No dibuja nada.
 *
 * Existe porque las pantallas de este proyecto son de SERVIDOR y Mixpanel vive
 * en el navegador. En vez de convertir media app en componentes de cliente solo
 * para medir, se cuelga esta pieza minúscula donde haga falta.
 *
 * ⚠️ EL EVENTO SE MANDA UNA VEZ POR MONTAJE, no en cada render. Sin este freno,
 * cada re-render con la pantalla abierta contaría otra vez y el DENOMINADOR del
 * embudo saldría inflado — que es la peor forma de romper una métrica, porque el
 * número sigue pareciendo razonable y nadie lo revisa. Es la misma precaución
 * que `useLeadWall` de El Charcu tomó con `lead_wall_shown`.
 */
export function Medir({ evento, props }: { evento: string; props?: Propiedades }) {
  /*
    `useState` sin `set` congela las propiedades del PRIMER render.

    Es lo que hace que el efecto se dispare una sola vez: el padre construye un
    objeto nuevo en cada render (`props={{ leccion: l.id }}`), y si ese objeto
    entrara en las dependencias, cada re-render contaría otro evento. El
    denominador del embudo saldría inflado — la peor forma de romper una
    métrica, porque el número sigue pareciendo razonable y nadie lo revisa.

    ⚠️ Antes esto usaba una ref y la escribía DURANTE el render, que es lo que
    React prohíbe y el lint cazó. Congelar el valor consigue lo mismo sin tocar
    nada fuera de tiempo.
  */
  const [datos] = useState(props);

  useEffect(() => {
    medir(evento, datos);
  }, [evento, datos]);

  return null;
}
