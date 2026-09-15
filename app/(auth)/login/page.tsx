"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell } from "@/components/app/AuthShell";
import { FormularioAcceso } from "@/components/app/FormularioAcceso";

/**
 * La página de acceso a pantalla completa.
 *
 * ⚠️ SIGUE EXISTIENDO AUNQUE LA PESTAÑA "ENTRAR" YA NO VENGA AQUÍ (2026-09-15).
 * No sobra: es donde aterrizan los enlaces vencidos del correo y a donde manda
 * el middleware a quien intente una ruta privada sin sesión. Borrarla dejaría
 * esos dos caminos apuntando a una página que no existe.
 *
 * El formulario es el MISMO componente que usa la pestaña. Lo único distinto es
 * la envoltura: aquí va centrado a pantalla completa, allí dentro de la app.
 */
const AVISOS_DEL_ENLACE: Record<string, string> = {
  enlace_vencido:
    "Ese enlace ya se usó o venció. Son de un solo uso — pide uno nuevo y entra enseguida.",
  enlace_invalido: "Ese enlace no se entiende. Pide uno nuevo con tu correo.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell>{null}</AuthShell>}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const params = useSearchParams();
  const aviso = AVISOS_DEL_ENLACE[params.get("error") ?? ""] ?? "";

  return (
    <AuthShell>
      <FormularioAcceso avisoDelEnlace={aviso} lugar={params.get("next") ?? "login"} />
    </AuthShell>
  );
}
