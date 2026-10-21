import type { Metadata } from "next";
import { OjoExperto, type BolsoBreve, type Conversacion } from "@/components/app/OjoExperto";
import { alumnaActual, cupoActual, iniciales } from "@/lib/alumna";
import { agruparEnPasos, listarBolsos } from "@/lib/bolsos";
import { supabaseServer } from "@/lib/supabase/server";
import { enlacesDeCobro } from "@/lib/checkout";

export const metadata: Metadata = { title: "El Ojo Experto — Manos Creadoras" };

/** Agrupa el historial como lo pide el diseño: hoy, esta semana, antes. */
function cuando(fecha: string): Conversacion["cuando"] {
  const dias = (Date.now() - new Date(fecha).getTime()) / 86_400_000;
  if (dias < 1) return "hoy";
  return dias < 7 ? "semana" : "antes";
}

export default async function PaginaOjo({
  searchParams,
}: {
  searchParams: Promise<{ bolso?: string; paso?: string }>;
}) {
  const alumna = await alumnaActual();

  /*
    ⚠️ SIN CUENTA EL OJO SE ABRE IGUAL (2026-10-21, pedido de Cristian). Antes
    aquí había un formulario de entrar: "sin cuenta no hay Ojo". Pero la ruta
    del Ojo ya atendía visitantes en el home —2 preguntas gratis por huella,
    contadas en la base y con su propio bolsillo de presupuesto—, así que el
    muro solo frenaba a quien venía a probarlo. Ahora prueba, y al agotar las 2
    se le ofrece el plan. El formulario de entrar vive SOLO en "Entrar".
  */
  const { bolso, paso } = await searchParams;
  const bolsos = await listarBolsos();
  const breves: BolsoBreve[] = bolsos.map((b) => ({
    slug: b.slug,
    nombre: b.nombre,
    pasos: agruparEnPasos(b.lecciones).map((p) => p.titulo),
  }));

  if (!alumna) {
    const cobro = await enlacesDeCobro();
    return (
      <OjoExperto
        visitante
        enlaces={cobro.url}
        historial={[]}
        cupo={null}
        bolsos={breves}
        bolsoInicial={bolso ?? null}
        pasoInicial={paso ? Number(paso) : null}
      />
    );
  }

  const supabase = await supabaseServer();

  const [cupo, cobro, { data: conversaciones }] = await Promise.all([
    cupoActual(alumna.id),
    enlacesDeCobro(),
    supabase
      .from("ojo_conversaciones")
      .select("id, titulo, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const historial: Conversacion[] = (conversaciones ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    cuando: cuando(c.created_at),
  }));

  // Solo lo que el selector necesita: nombre y títulos de los pasos.
  return (
    <OjoExperto
      iniciales={iniciales(alumna)}
      historial={historial}
      cupo={cupo}
      bolsos={breves}
      bolsoInicial={bolso ?? null}
      pasoInicial={paso ? Number(paso) : null}
      enlaces={cobro.url}
    />
  );
}
