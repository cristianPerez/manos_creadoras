import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Analitica, RegistrarEntrada } from "@/components/app/Analitica";
import { PreciosProvider } from "@/components/app/Precios";
import { preciosDeLaPagina } from "@/lib/precios";
import { MotionProvider } from "@/components/app/MotionProvider";
import { ProveedorEntrar } from "@/components/app/ModalEntrar";
import { RegistrarSW } from "@/components/app/RegistrarSW";
import { COLOR_FONDO_SISTEMA_B } from "@/lib/marca";
import { enlacesDeCobro } from "@/lib/checkout";
import { detectarPais, regionDe } from "@/lib/pais";
import { supabaseServer } from "@/lib/supabase/server";
import "./globals.css";

// Los nombres llevan sufijo -src para NO chocar con los tokens --font-display/--font-body
// de globals.css: si coinciden, la variable se referencia a sí misma, queda inválida y las
// fuentes caen silenciosamente a la del sistema.
const cormorant = Cormorant_Garamond({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

/*
  Manrope reemplaza a Jost (2026-10-09, paleta nueva).

  Pesos: la guía de marca pide 400, 600 y 700. Se añade el 500 porque las 12
  pantallas que ya existen lo usan en decenas de sitios; quitarlo las haría caer
  al 400 y perderían jerarquía sin que nadie tocara nada.
*/
const manrope = Manrope({
  variable: "--font-body-src",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Manos Creadoras — Crea bolsos, accesorios y adornos de lujo en cuentas",
  description:
    "La escuela de manualidades de Elizabeth Valencia: bolsos, accesorios y adornos en cuentas con acabados de boutique, y pronto velas. Con mentoría real y un asistente de IA que revisa fotos de tu trabajo.",
  // iPhone ignora el manifiesto para estas dos cosas: necesita sus propias etiquetas
  // para abrirse sin barra del navegador y para mostrar el icono correcto.
  appleWebApp: {
    capable: true,
    title: "Manos Creadoras",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-icon.png",
  },
};

export const viewport: Viewport = {
  // Tiñe la barra del sistema con el fondo de la marca (lavanda) cuando está instalada.
  themeColor: COLOR_FONDO_SISTEMA_B,
  // Evita que el contenido quede bajo el notch al abrirse a pantalla completa.
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
    Se lee la sesión AQUÍ, en el servidor, para atarle los eventos a su cuenta.

    Se le pasan el ID y el correo (desde el 2026-11-04, pedido de Cristian):
    con el correo el panel se lee por persona y un pago que llegó antes de la
    cuenta se puede reconciliar. La política de privacidad lo dice.
  */
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
    El país viaja al navegador PARA LA ANALÍTICA. Se calcula aquí porque solo
    el servidor ve la cabecera de Vercel; sin este puente, el dato existía en
    la base pero no llegaba a Mixpanel y no se podía segmentar por país.
    `detectarPais` está cacheada por petición, así que esto no cuesta nada
    aunque la página ya lo haya pedido para resolver el enlace de pago.
  */
  const { pais, fuente, ciudad, subdivision } = await detectarPais();
  /* El precio de la base (misma fila que el enlace de pago) para todos los
     componentes de navegador: ver `components/app/Precios.tsx`. */
  const { precios } = await preciosDeLaPagina();

  /*
    La variante del experimento de precio (A/B/C), para la analítica. Se toma
    de `enlacesDeCobro` y no de la flag a secas: es la variante cuyos precios
    se enseñaron DE VERDAD (si a una le faltara un plan, se enseña la "a" y
    así lo registra). Cacheada por petición: es la misma consulta de arriba.
  */
  const { variante: variantePrecio } = await enlacesDeCobro();

  return (
    <html
      lang="es"
      /* ⚠️ FIJO EN "b" DESDE EL 2026-11-07: el home morado ganó el A/B de
         paleta y es el único. Los tokens de `globals.css` siguen escritos como
         base crema + `html[data-paleta="b"]` encima; quitar el atributo
         volvería a pintar todo en crema. */
      data-paleta="b"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-surface-base text-text-primary font-body">
        <PreciosProvider precios={precios}>
          <MotionProvider>
            {/* El modal de entrar, una sola vez para toda la app (ver
                `ModalEntrar.tsx`). Dentro de Precios y Motion porque el
                formulario usa los dos. */}
            <ProveedorEntrar conSesion={Boolean(user)}>{children}</ProveedorEntrar>
          </MotionProvider>
        </PreciosProvider>
        <RegistrarSW />
        <Analitica
          userId={user?.id ?? null}
          correo={user?.email ?? null}
          pais={pais}
          region={regionDe(pais)}
          fuentePais={fuente}
          ciudad={ciudad}
          subdivision={subdivision}
          experimentoPrecio={variantePrecio}
          moneda={precios.moneda}
          precioMensual={precios.mensual}
          precioAnual={precios.anual}
        />
        <RegistrarEntrada />
      </body>
    </html>
  );
}
