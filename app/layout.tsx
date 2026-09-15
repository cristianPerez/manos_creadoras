import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Analitica } from "@/components/app/Analitica";
import { MotionProvider } from "@/components/app/MotionProvider";
import { RegistrarSW } from "@/components/app/RegistrarSW";
import { COLOR_FONDO_SISTEMA } from "@/lib/marca";
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

const jost = Jost({
  variable: "--font-body-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Manos Creadoras — Crea bolsos de lujo en cuentas desde casa",
  description:
    "El programa completo para tejer bolsos en cuentas y malla plástica con acabados de boutique, con mentoría real y un asistente de IA que revisa fotos de tu bolso.",
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
  // Tiñe la barra del sistema con el fondo de la marca cuando está instalada.
  themeColor: COLOR_FONDO_SISTEMA,
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

    Se le pasa el ID, nunca el correo: el ID permite cruzar el panel con la base
    cuando haga falta y no identifica a nadie fuera de aquí. Mandarle el correo
    a un tercero sería regalar dato personal que no hace falta para medir.
  */
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col bg-surface-base text-text-primary font-body">
        <MotionProvider>{children}</MotionProvider>
        <RegistrarSW />
        <Analitica userId={user?.id ?? null} />
      </body>
    </html>
  );
}
