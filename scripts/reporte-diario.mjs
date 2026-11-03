/**
 * El reporte diario de PRODUCCIÓN: quién entró, desde qué país, en qué
 * dispositivo, y cuánto de eso se convirtió en cuenta o en pago.
 *
 *   npm run reporte:diario            → reporte de ayer (hora de Bogotá)
 *   npm run reporte:diario -- 2026-11-02   → reporte de ese día
 *
 * Lo usa la skill `reporte-diario` y la tarea programada de las 7 am. Imprime
 * el reporte en Markdown y lo guarda en `reportes/AAAA-MM-DD.md` (fuera de git).
 *
 * ── LAS DOS FUENTES, Y QUÉ MIDE CADA UNA ─────────────────────────────────────
 * · `sesiones_pais` (Supabase): UNA FILA POR NAVEGADOR, no por visita. La crea
 *   `lib/registrar-pais.ts` con una cookie de 30 días; si vuelve, solo mueve
 *   `visto_en`. Por eso aquí se habla de VISITANTES (navegadores nuevos) y de
 *   "volvieron", no de sesiones. La huella es un hash de la IP, nunca la IP.
 * · Mixpanel: eventos (`pagina_ventas_vista`, `cta_inscribirme_click`,
 *   `checkout_abierto`, `pago_confirmado`) con la propiedad `pais` que pone
 *   nuestra app. ⚠️ NO las columnas Country/City de Mixpanel: salen vacías a
 *   propósito (`ip: false`, ver ESTADO.md). Solo se consulta si existen
 *   `MIXPANEL_SA_USUARIO`, `MIXPANEL_SA_SECRETO` y `MIXPANEL_PROYECTO_ID` en
 *   `.env.prod` (una cuenta de servicio de SOLO LECTURA). Sin ellas el reporte
 *   sale igual, con un aviso.
 *
 * ⚠️ SOLO LEE. No escribe nada en la base ni en Mixpanel.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

/* ── Entorno: SIEMPRE producción ─────────────────────────────────────────── */
const env = {};
for (const linea of readFileSync(".env.prod", "utf8").split("\n")) {
  const m = linea.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].split(" #")[0].trim().replace(/^"|"$/g, "");
}
const SUPA = env.SUPABASE_URL;
const CLAVE = env.SUPABASE_SECRET_KEY;
if (!SUPA || !CLAVE) {
  console.error("Falta SUPABASE_URL o SUPABASE_SECRET_KEY en .env.prod");
  process.exit(1);
}

/* ── Fechas en hora de Bogotá (UTC-5, sin horario de verano) ─────────────── */
const DESFASE = 5 * 3600e3;
const diaBogota = (iso) => new Date(new Date(iso).getTime() - DESFASE).toISOString().slice(0, 10);
const hoy = diaBogota(new Date().toISOString());
const sumarDias = (dia, n) => new Date(Date.parse(`${dia}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const DIA = process.argv[2] && /^\d{4}-\d{2}-\d{2}$/.test(process.argv[2]) ? process.argv[2] : sumarDias(hoy, -1);
const SEMANA_DESDE = sumarDias(DIA, -6);

/* ── Supabase ────────────────────────────────────────────────────────────── */
const cab = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` };
async function todas(tabla, select, orden) {
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    const r = await fetch(`${SUPA}/rest/v1/${tabla}?select=${select}&order=${orden}.asc`, {
      headers: { ...cab, Range: `${desde}-${desde + 999}` },
    });
    if (!r.ok) throw new Error(`${tabla}: ${r.status} ${await r.text()}`);
    const lote = await r.json();
    filas.push(...lote);
    if (lote.length < 1000) break;
  }
  return filas;
}

/*
 * Robots: el navegador sin cabeza que abre los enlaces para hacer la vista
 * previa (WhatsApp, Instagram, Vercel) entra con un user-agent de Linux de
 * escritorio sin versión de Chrome. Contarlos inflaría "Estados Unidos".
 */
const ES_ROBOT =
  /bot|crawl|spider|headless|preview|facebookexternal|whatsapp|python|curl|go-http|axios|lighthouse|meta-external|bytespider|google-/i;
const esRobot = (f) =>
  !f.user_agent || ES_ROBOT.test(f.user_agent) || /^Mozilla\/5\.0 \(X11; Linux x86_64\) AppleWebKit\/537\.36 \(KHTML, like Gecko\)$/.test(f.user_agent.trim()) || !/Chrome|Safari|Firefox|Instagram|FBAN|FBAV/.test(f.user_agent);
const dispositivo = (ua) => (/iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : "Computador");

const NOMBRE_PAIS = new Intl.DisplayNames(["es"], { type: "region" });
const pais = (c) => {
  try {
    return `${NOMBRE_PAIS.of(c)} (${c})`;
  } catch {
    return c;
  }
};
function contar(filas, clave) {
  const m = new Map();
  for (const f of filas) m.set(clave(f), (m.get(clave(f)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
const pct = (n, total) => (total ? `${((100 * n) / total).toFixed(1)}%` : "—");
function tablaPaises(filas, max = 12) {
  const total = filas.length;
  const filasT = contar(filas, (f) => f.pais);
  const top = filasT.slice(0, max);
  const resto = filasT.slice(max).reduce((s, [, n]) => s + n, 0);
  const lineas = ["| País | Visitantes | % |", "|---|---:|---:|"];
  for (const [c, n] of top) lineas.push(`| ${pais(c)} | ${n} | ${pct(n, total)} |`);
  if (resto) lineas.push(`| Otros ${filasT.length - max} países | ${resto} | ${pct(resto, total)} |`);
  return lineas.join("\n");
}

const sesiones = await todas(
  "sesiones_pais",
  "sesion_id,user_id,pais,fuente,user_agent,creado_en,visto_en",
  "creado_en",
);
const humanos = sesiones.filter((f) => !esRobot(f));
const robots = sesiones.length - humanos.length;
const delDia = humanos.filter((f) => diaBogota(f.creado_en) === DIA);
const deLaSemana = humanos.filter((f) => diaBogota(f.creado_en) >= SEMANA_DESDE && diaBogota(f.creado_en) <= DIA);
const activosDia = humanos.filter((f) => diaBogota(f.visto_en) === DIA);
const volvieronDia = activosDia.filter((f) => diaBogota(f.creado_en) < DIA).length;
const fuentesRaras = sesiones.filter((f) => f.fuente !== "vercel").length;

const membresias = await todas("membresias", "plan,estado,ciclo,creada_el", "creada_el");
const perfiles = await todas("profiles", "id", "id");
const pagos = (await todas("webhook_eventos", "tipo,estado,recurso_id,recibido_en", "recibido_en")).filter(
  (w) => w.tipo === "suscripcion.pagada" && !/verificacion|prueba|test/i.test(w.recurso_id ?? ""),
);
const contactos = await todas("contactos", "motivo,created_at", "created_at");

const pagadas = membresias.filter((m) => m.plan !== "gratis" && m.estado === "activa");
const cuentasDia = membresias.filter((m) => diaBogota(m.creada_el) === DIA).length;
const pagosDia = pagos.filter((p) => diaBogota(p.recibido_en) === DIA).length;
const contactosDia = contactos.filter((c) => diaBogota(c.created_at) === DIA).length;

/* ── Mixpanel (opcional) ─────────────────────────────────────────────────── */
const EVENTOS = ["pagina_ventas_vista", "cta_inscribirme_click", "checkout_abierto", "pago_confirmado"];
let mixpanel = null;
let avisoMixpanel = null;
if (env.MIXPANEL_SA_USUARIO && env.MIXPANEL_SA_SECRETO && env.MIXPANEL_PROYECTO_ID) {
  const auth = `Basic ${Buffer.from(`${env.MIXPANEL_SA_USUARIO}:${env.MIXPANEL_SA_SECRETO}`).toString("base64")}`;
  const host = env.MIXPANEL_REGION === "eu" ? "https://eu.mixpanel.com" : "https://mixpanel.com";
  async function seg(evento, desde, hasta, porPais) {
    const q = new URLSearchParams({
      project_id: env.MIXPANEL_PROYECTO_ID,
      event: evento,
      from_date: desde,
      to_date: hasta,
      unit: "day",
      type: "unique",
      ...(porPais ? { on: 'properties["pais"]' } : {}),
    });
    const r = await fetch(`${host}/api/query/segmentation?${q}`, { headers: { Authorization: auth } });
    if (!r.ok) throw new Error(`Mixpanel ${evento}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    const valores = (await r.json()).data?.values ?? {};
    return Object.fromEntries(
      Object.entries(valores).map(([k, porDia]) => [k, Object.values(porDia).reduce((s, n) => s + n, 0)]),
    );
  }
  try {
    const embudo = {};
    for (const e of EVENTOS) {
      const [dia, semana] = await Promise.all([seg(e, DIA, DIA, false), seg(e, SEMANA_DESDE, DIA, false)]);
      embudo[e] = { dia: dia[e] ?? 0, semana: semana[e] ?? 0 };
    }
    const paisesSemana = await seg("pagina_ventas_vista", SEMANA_DESDE, DIA, true);
    mixpanel = { embudo, paisesSemana };
  } catch (e) {
    avisoMixpanel = `No se pudo leer Mixpanel: ${e.message}`;
  }
} else {
  avisoMixpanel =
    "Mixpanel no está conectado: faltan `MIXPANEL_SA_USUARIO`, `MIXPANEL_SA_SECRETO` y `MIXPANEL_PROYECTO_ID` en `.env.prod` (cuenta de servicio de solo lectura).";
}

/* ── El reporte ──────────────────────────────────────────────────────────── */
const ultimos14 = Array.from({ length: 14 }, (_, i) => sumarDias(DIA, i - 13));
const porDia = new Map(contar(humanos, (f) => diaBogota(f.creado_en)));
const dispDia = contar(delDia, (f) => dispositivo(f.user_agent));
const instagramDia = delDia.filter((f) => /Instagram/.test(f.user_agent)).length;

const md = [];
md.push(`# Reporte de producción — ${DIA}`);
md.push(`_manoscreadoras.co · hora de Bogotá · generado ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC_`);
md.push("");
md.push("## Resumen del día");
md.push(`- **Visitantes nuevos:** ${delDia.length} (navegadores que entraron por primera vez)`);
md.push(`- **Volvieron:** ${volvieronDia} que ya habían entrado otro día`);
md.push(`- **Cuentas nuevas:** ${cuentasDia} · **Pagos:** ${pagosDia} · **Mensajes de contacto:** ${contactosDia}`);
md.push(
  `- **Dispositivos:** ${dispDia.map(([d, n]) => `${d} ${pct(n, delDia.length)}`).join(" · ") || "—"} · desde Instagram ${pct(instagramDia, delDia.length)}`,
);
md.push("");
md.push(`## Países del día (${delDia.length} visitantes)`);
md.push(delDia.length ? tablaPaises(delDia) : "_Nadie nuevo ese día._");
md.push("");
md.push(`## Últimos 7 días (${SEMANA_DESDE} a ${DIA}) — ${deLaSemana.length} visitantes`);
md.push(deLaSemana.length ? tablaPaises(deLaSemana) : "_Sin visitantes._");
md.push("");
md.push("## Visitantes nuevos por día (14 días)");
md.push(ultimos14.map((d) => `${d.slice(5)}: ${porDia.get(d) ?? 0}`).join(" · "));
md.push("");
md.push("## Acumulado desde el inicio");
md.push(
  `- ${humanos.length} visitantes reales en ${new Set(humanos.map((f) => f.pais)).size} países (desde ${diaBogota(sesiones[0]?.creado_en ?? new Date().toISOString())}); ${robots} robots descartados`,
);
md.push(`- ${perfiles.length} cuentas · ${pagadas.length} membresías pagadas activas · ${pagos.length} pagos recibidos de OnePay`);
md.push(`- Top 5 países: ${contar(humanos, (f) => f.pais).slice(0, 5).map(([c, n]) => `${c} ${pct(n, humanos.length)}`).join(" · ")}`);
md.push("");
md.push("## Mixpanel");
if (mixpanel) {
  md.push("| Paso del embudo | Personas el día | Personas en 7 días |", "|---|---:|---:|");
  for (const e of EVENTOS) md.push(`| ${e} | ${mixpanel.embudo[e].dia} | ${mixpanel.embudo[e].semana} |`);
  const totalPaises = Object.values(mixpanel.paisesSemana).reduce((s, n) => s + n, 0);
  md.push("");
  md.push(`Vieron la página de ventas en 7 días, por país (${totalPaises}):`);
  md.push(
    Object.entries(mixpanel.paisesSemana)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([c, n]) => `${c === "undefined" ? "sin país" : c} ${pct(n, totalPaises)}`)
      .join(" · "),
  );
} else {
  md.push(`⚠️ ${avisoMixpanel}`);
}
md.push("");
md.push("## Avisos");
const avisos = [];
if (fuentesRaras) avisos.push(`⚠️ ${fuentesRaras} sesiones con país adivinado (no de Vercel): la detección podría estar fallando.`);
if (delDia.length === 0) avisos.push("⚠️ Cero visitantes nuevos: revisar que el sitio esté arriba y que `registrar-pais` siga escribiendo.");
if (pagosDia > 0) avisos.push(`🎉 Entraron ${pagosDia} pagos.`);
md.push(avisos.length ? avisos.join("\n") : "Nada raro.");

const texto = md.join("\n");
mkdirSync("reportes", { recursive: true });
writeFileSync(`reportes/${DIA}.md`, `${texto}\n`);
console.log(texto);
