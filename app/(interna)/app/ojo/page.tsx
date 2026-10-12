import type { Metadata } from "next";
import { OjoExperto, type BolsoBreve, type Conversacion } from "@/components/app/OjoExperto";
import { alumnaActual, cupoActual } from "@/lib/alumna";
import { agruparEnPasos, listarBolsos } from "@/lib/bolsos";
import { supabaseServer } from "@/lib/supabase/server";
import { FormularioAcceso } from "@/components/app/FormularioAcceso";

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
    Sin cuenta no hay Ojo Experto, y aquí sí se pide entrar: cada consulta
    cuesta dinero de verdad y se descuenta de un cupo que necesita saber de
    quién es. No es un muro comercial, es que la función no existe sin cuenta.
  */
  if (!alumna) {
    return (
      <main className="flex min-w-0 flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <p className="eyebrow text-center">El Ojo Experto</p>
          <h1 className="titulo-seccion mt-2 text-center text-balance">
            Entra y te reviso el tejido
          </h1>
          <p className="text-ink-body mt-3 mb-8 text-center">
            Con tu correo basta. La cuenta gratis trae 3 consultas al mes.
          </p>
          <FormularioAcceso lugar="ojo" />
        </div>
      </main>
    );
  }

  const { bolso, paso } = await searchParams;
  const supabase = await supabaseServer();

  const [cupo, bolsos, { data: conversaciones }] = await Promise.all([
    cupoActual(alumna.id),
    listarBolsos(),
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
  const breves: BolsoBreve[] = bolsos.map((b) => ({
    slug: b.slug,
    nombre: b.nombre,
    pasos: agruparEnPasos(b.lecciones).map((p) => p.titulo),
  }));

  return (
    <OjoExperto
      historial={historial}
      cupo={cupo}
      bolsos={breves}
      bolsoInicial={bolso ?? null}
      pasoInicial={paso ? Number(paso) : null}
    />
  );
}
