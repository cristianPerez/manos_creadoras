# AUTH MODERNO — Login Sin Fricción y Seguro (2026)

> **Cuándo cargar este archivo:**
> - Al diseñar el registro/login de cualquier app con cuentas (junto con `02B-ONBOARDING-Y-PAYWALL.md` y `09-SEGURIDAD.md`)
> - Cuando la conversión de registro es baja (la fricción de auth es la causa #1)
> - Antes de manejar datos sensibles o dinero (MFA, recuperación segura)

## Objetivo
El login es la primera muralla y a la vez el primer punto de abandono. Mal hecho, espanta usuarios (fricción) o regala cuentas (inseguro). Este archivo da el auth de 2026: el mínimo de fricción posible con la máxima seguridad, usando lo que el proveedor ya resuelve y endureciendo lo que no.

---

## PRINCIPIO: No construyas auth propio — pero entiende lo que el proveedor hace

Implementar criptografía de contraseñas, rotación de tokens y flujos de recuperación a mano es la receta perfecta para una brecha. **Usar Supabase Auth, Clerk o Auth.js.** Pero "usar el proveedor" no es "ignorar la seguridad": hay que **configurarlo bien** y endurecer lo que viene abierto por defecto. Este archivo es esa configuración.

---

## JERARQUÍA DE MÉTODOS DE AUTENTICACIÓN (de preferido a último recurso)

Menos contraseñas = menos fricción y menos riesgo. Ofrecer en este orden:

```
1. PASSKEYS / WebAuthn  → el estándar 2026: biométrico, sin contraseña, anti-phishing por diseño.
2. OAuth social         → "Entrar con Google/Apple". Cero contraseña que recordar. Mínimo: Google.
3. Magic link / OTP     → enlace o código al email. Sin contraseña, fricción media.
4. Email + contraseña   → último recurso. Solo si el público lo exige. Con las reglas de abajo.
```

> Regla de UX (archivo 15): mostrar **valor antes de pedir registro**. El mejor login es el que el usuario hace *después* de ya querer la app, no antes de entenderla.

> **DECISIÓN HOTMART-FIRST (el default del SO):** si la app se vende por Hotmart con webhook (`18-VENTA-HOTMART.md`), el método PRIMARIO de login es **magic link / OTP por email** — el webhook crea usuarios *passwordless* (`createUser` sin contraseña) y el email de bienvenida trae el magic link; el comprador entra con el correo con el que compró. Passkeys y OAuth son mejoras POSTERIORES (se añaden encima, no reemplazan el camino por email: el flujo de compra siempre necesita "entrar con el correo de la compra"). La jerarquía de arriba sigue valiendo como aspiración; esta regla fija por dónde EMPEZAR.

---

## PASSKEYS / WebAuthn — el estándar de 2026

Una passkey es un par de claves criptográficas ligado al dispositivo y desbloqueado por biometría (Face ID, huella, PIN). El usuario no tiene contraseña que olvidar o que le roben, y es **resistente a phishing por diseño** (la clave está atada al dominio).

```
Librerías: @simplewebauthn/browser + @simplewebauthn/server (versión vigente — verificar en npm antes de instalar)
```

**Configuración de registro (clave):**
```typescript
// Servidor: opciones de creación de credencial
generateRegistrationOptions({
  rpName: 'Tu App', rpID: 'tuapp.com',
  userName: email,
  authenticatorSelection: {
    residentKey: 'preferred',
    userVerification: 'preferred',
    authenticatorAttachment: 'platform', // 'platform' = Face ID/huella del dispositivo
    // OMITIR authenticatorAttachment para permitir passkeys cross-device (QR/híbrido con el móvil)
  },
});
```

**Reglas de seguridad de passkeys:**
```
- Guardar SOLO la clave pública y el credential_id. La clave privada NUNCA sale del dispositivo.
- El contador (counter) debe INCREMENTAR en cada uso. Si llega un counter menor o igual al
  guardado → posible clonación/replay → rechazar.
- Challenge con TTL corto (5 min) y de un solo uso.
- Permitir múltiples passkeys por usuario (un dispositivo se pierde; debe haber otra forma de entrar).
- UX de confianza: al registrar una passkey, decir "tu huella/Face ID nunca sale de tu dispositivo"
  (baja el miedo a la biometría). Reflejarlo en la política de privacidad: la biometría se procesa
  localmente; el servidor solo guarda una clave pública, jamás datos biométricos.
```

**Esquema de DB mínimo:**
```sql
create table passkey_credentials (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key    bytea not null,
  counter       bigint not null default 0,
  device_name   text,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz
);
create index passkey_user_idx on passkey_credentials(user_id);
alter table passkey_credentials enable row level security;
-- `for all` SIEMPRE con `using` + `with check` (sin with check, un INSERT/UPDATE
-- podría escribir filas con user_id ajeno — la forma ingenua que 09/25 prohíben):
create policy "own_passkeys" on passkey_credentials
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

---

## OAuth, Magic Links y Email+Password

```
OAUTH (Google mínimo, +30-50% de conversión de registro):
- Botón claro "Continuar con Google". Solicitar los scopes MÍNIMOS (email, perfil).
- Tras el callback, el token va a cookie httpOnly (Supabase lo hace automático).

MAGIC LINK / OTP:
- Enlace/código de un solo uso, expiración 5-10 min.
- Rate limit estricto (ver tabla abajo) — es un vector de spam/abuso.

EMAIL + CONTRASEÑA (último recurso, reglas):
- El proveedor hashea (Argon2/bcrypt). NUNCA implementar el hash uno mismo.
- Mínimo 8 caracteres. LONGITUD > COMPLEJIDAD: no exigir "mayúscula+símbolo+sangre de unicornio"
  (NIST 2024+ desaconseja las reglas de composición; empujan a contraseñas peores y reusadas).
- Comparar contra listas de contraseñas filtradas (haveibeenpwned k-anonymity) si es viable.
- Verificación de email obligatoria antes de acciones sensibles.
```

---

## GESTIÓN DE SESIÓN Y TOKENS

El error clásico: tokens de larga vida en `localStorage` (los roba cualquier XSS). La configuración correcta:

```
- Access token: vida corta (~1 hora).
- Refresh token: vida más larga (~7 días) y ROTADO en cada uso (rotación de refresh tokens):
  cada vez que se usa, se emite uno nuevo y el viejo se invalida → un token robado sirve poco.
- Almacenamiento:
    Web    → cookies HttpOnly + Secure + SameSite (inaccesibles a JS, inmunes a XSS).
             NUNCA localStorage/sessionStorage para tokens.
    Mobile → Keychain (iOS) / Keystore (Android), nunca en texto plano.
- Logout invalida la sesión en el SERVIDOR, no solo borra la cookie local.
- Sesiones con expiración por inactividad + refresh automático (default de Supabase: correcto).
```

---

## MIDDLEWARE CANÓNICO DE SUPABASE SSR (Next.js) — sin esto "el usuario se desloguea solo"

Los Server Components **no pueden escribir cookies**. Si nadie refresca el access token (vida ~1 hora),
expira, el refresh nunca se persiste, y el síntoma clásico aparece: *el usuario vuelve a la app y está
deslogueado sin razón*, o se desloguea a mitad de sesión. El refresh y la rotación de tokens se hacen
en el **middleware**, que corre en cada request y SÍ puede escribir cookies. Este es el patrón canónico
de `@supabase/ssr` — copiar tal cual, no "optimizar":

```typescript
// middleware.ts (raíz del proyecto)
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Todo excepto estáticos e imágenes — que el refresh no corra por cada .png
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // anon/publishable key: pública por diseño (la protección real es RLS)
    {
      // API actual de @supabase/ssr: getAll/setAll (la vieja get/set/remove está deprecada)
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: NO poner lógica entre createServerClient y getUser().
  // getUser() valida el JWT contra Supabase y dispara el refresh si el token expiró.
  const { data: { user } } = await supabase.auth.getUser();

  // RUTAS PÚBLICAS del funnel (modelo onboarding-first anónimo, el default de 02C):
  // el usuario recorre / → /onboarding → /paywall → /login SIN sesión. Redirigir a /login
  // a todo anónimo ROMPE el funnel de venta completo. Se protege SOLO /app y las API privadas.
  const PUBLIC_PATHS = ['/', '/onboarding', '/paywall', '/login', '/auth', '/pricing', '/terminos', '/privacidad'];
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || (p !== '/' && path.startsWith(p + '/')) || (p === '/auth' && path.startsWith('/auth'))
  );

  if (!user && !isPublic) {
    // Sin usuario en ruta protegida (/app, API privadas) → al login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANTE: devolver supabaseResponse TAL CUAL (contiene las cookies refrescadas).
  // Si necesitas otra response, copia las cookies de supabaseResponse a la tuya —
  // si no, la sesión se corta y el usuario queda deslogueado aleatoriamente.
  return supabaseResponse;
}
```

**Reglas de este middleware:**
- ⚠️ **El matcher/redirect se adapta al MODELO DE MONETIZACIÓN de ESTADO.md.** En onboarding-first anónimo (el default de 02C), el funnel completo (`/`, `/onboarding`, `/paywall`, `/login`, `/auth/*`, páginas legales) es PÚBLICO y solo `/app` + las API privadas exigen sesión. En hard paywall (Modelo 1), casi todo tras `/` puede ser protegido. Copiar el patrón, ajustar la lista `PUBLIC_PATHS` al modelo real — nunca al revés.
- El refresh de sesión (`updateSession`) corre igual en TODAS las rutas (públicas y privadas): un usuario logueado que visita `/paywall` también necesita su token fresco. Lo público es no-redirigir, no saltarse el refresh.
- El `matcher` excluye estáticos (`_next/static`, `_next/image`, imágenes) — sin eso, cada asset dispara una validación de sesión.
- `getUser()` (que valida contra el servidor de Supabase), **nunca** `getSession()` en este punto — `getSession()` no revalida el JWT.
- Si además implementas la **CSP con nonce** de `09-SEGURIDAD.md`: Next solo permite UN `middleware.ts`, así que la CSP se añade dentro de este mismo archivo.
- Este middleware complementa (no reemplaza) el `createServerClient` de los Route Handlers/Server Components (ver el BFF de `09-SEGURIDAD.md`).

---

## USUARIO ANÓNIMO → CUENTA (modelo onboarding-first)

En el modelo default del SO (02C: `/` → `/onboarding` → `/paywall` → `/login` → `/app`), el usuario responde el quiz y ve su plan **SIN cuenta**. La cuenta nace después (webhook de Hotmart → primer login por magic link, o registro free en Modelo 2B). Este seam — migrar lo anónimo a la cuenta — se diseña, no se improvisa:

```
(a) EL ESTADO ANÓNIMO VIVE EN localStorage, VERSIONADO:
    localStorage.setItem('onboarding_state', JSON.stringify({ v: 1, respuestas, plan }));
    El campo `v` permite migrar/descartar shapes viejos si el quiz cambia entre deploys.
    Guardar tras CADA respuesta (no solo al final): un refresh no borra 20 preguntas.

(b) MIGRACIÓN AL CREAR LA CUENTA:
    Al detectar sesión nueva (onAuthStateChange → SIGNED_IN) + estado local presente, el cliente
    lo envía a un endpoint BFF (ej. POST /api/onboarding/migrate). El servidor:
    1. VALIDA con zod el payload completo (es input NO confiable: viene del navegador —
       enums de respuestas, rangos, tamaño máximo; rechazar lo que no cuadre).
    2. Inserta con el user_id DEL SERVIDOR ((select auth.uid()) / el user del JWT) —
       nunca un user_id que venga en el body.

(c) CONFLICTO (la cuenta YA tenía datos de onboarding/plan): conservar lo del SERVIDOR y
    ofrecer fusión explícita ("Encontramos un plan anterior en tu cuenta — ¿usar el nuevo?").
    Nunca pisar en silencio datos existentes con el estado local de un navegador.

(d) LIMPIAR localStorage tras migrar con éxito (y solo entonces): si el endpoint falla,
    el estado local se conserva y se reintenta en la próxima sesión.

(e) OTRO DISPOSITIVO (compró en el móvil, abre en desktop): ahí NO hay localStorage que migrar.
    Honesto: el plan solo se regenera si las respuestas VIAJARON con la compra (payload en
    `sck`/parámetros del checkout que el webhook guardó — ver 18, Modelo 2A); si no viajaron,
    se le pide re-correr un onboarding CORTO al primer login ("2 preguntas para recuperar tu
    plan"), nunca fingir que el plan se sincronizó solo.
```

> Cross-refs: `18-VENTA-HOTMART.md` → "LOS DOS MODELOS DE CREACIÓN DE USUARIO" (el webhook crea la cuenta; el checkout lleva `?email=` + `sck`) · `02C-PRICING-Y-MODELO-DE-NEGOCIO.md` → la variante "preview anónimo → paywall → login/auth" que este flujo implementa.

---

## RATE LIMITING POR ENDPOINT DE AUTH (no negociable)

Los endpoints de auth son blanco de fuerza bruta, relleno de credenciales y spam. Límites por endpoint:

| Endpoint | Límite | Notas |
|---|---|---|
| `signIn` | 5 / 15 min | por cuenta + por IP; espera incremental tras fallos |
| `signUp` | 3 / 60 min | por IP; frena creación masiva de cuentas |
| `passwordReset` | 3 / 60 min | por cuenta; siempre responde igual (ver anti-enumeración) |
| `magicLink` / OTP | 3 / 5 min | un solo uso, expiración 5-10 min |
| `passkey` (auth) | 10 / 15 min | más permisivo (no hay secreto que adivinar) |
| `verifyMFA` | 5 / 15 min | tras agotar, bloquear y exigir recuperación |

Supabase Auth trae rate limiting integrado — **verificar que está activo y ajustar los límites**, no asumir.

---

## MFA / 2FA — cuándo y cómo

```
CUÁNDO ofrecerlo (no obligar salvo necesidad):
- Apps que manejan dinero, datos de salud, o datos sensibles → ofrecer y recomendar.
- App B2C normal → opcional, en ajustes.

MÉTODO: TOTP (app autenticadora) por defecto. SMS solo como respaldo y SIEMPRE marcando el
riesgo de SIM-swap (el atacante porta tu número y recibe el código). Nunca SMS como único factor
para algo crítico.

JERARQUÍA DE RECUPERACIÓN (de más a menos seguro):
  1. Passkey de respaldo en otro dispositivo
  2. Códigos de respaldo (generados al activar MFA, guardados por el usuario)
  3. Email verificado + preguntas
  4. Email
  5. SMS (último recurso, con aviso de SIM-swap)
```

---

## ANTI-ENUMERACIÓN DE CUENTAS

Revelar si un email existe le da al atacante la mitad del trabajo. **Respuestas idénticas** pase lo que pase:

```
- Login fallido: "Credenciales inválidas" — NUNCA "el email no existe" ni "contraseña incorrecta".
- Registro y reset: SIEMPRE el mismo mensaje "Revisa tu correo" exista o no la cuenta
  (si no existe, simplemente no se envía nada, pero el usuario ve lo mismo).
- Tiempos de respuesta similares (no responder más rápido cuando la cuenta no existe).
- Exigir email_confirmed_at antes de permitir acciones sensibles o de pago.
  (Matiz Hotmart/Modelo 2A: ahí el PAGO ocurre en Hotmart ANTES de que exista la cuenta —
  esta regla aplica a acciones sensibles IN-APP (cambiar email, borrar cuenta, disparar
  gasto de IA), no al checkout externo. Los usuarios creados por el webhook nacen con
  email_confirm: true porque el email quedó verificado por la compra misma.)
```

---

## IMPLEMENTACIÓN CON SUPABASE AUTH

```
LO QUE YA TRAE (no reinventar):
- Hash de contraseñas, cookies httpOnly, refresh con rotación, rate limiting base,
  OAuth providers, magic links, OTP, MFA (TOTP), verificación de email.

LO QUE HAY QUE ACTIVAR / CONFIGURAR:
[ ] RLS en todas las tablas con `(select auth.uid())` — sin esto, auth no protege los DATOS (archivo 09/25)
[ ] Verificación de email obligatoria activada
[ ] Plantillas de email (reset, verificación) con expiración corta y un solo uso
[ ] Rate limits revisados y ajustados
[ ] Redirect URLs en allowlist (no permitir redirects abiertos post-login)
[ ] Passkeys vía @simplewebauthn si el público lo soporta (o el provider nativo cuando exista)
[ ] MFA habilitado si la app lo amerita
```

---

## CHECKLIST DE CIERRE — Auth

```
FRICCIÓN (conversión)
[ ] Valor mostrado antes de pedir registro (archivo 15)
[ ] OAuth (Google mínimo) disponible; passkeys si el público lo soporta
[ ] Registro pide los datos MÍNIMOS (email + nada más obligatorio al inicio)

SEGURIDAD
[ ] Tokens en cookies httpOnly/Secure/SameSite (web) — NUNCA en localStorage
[ ] Refresh tokens con rotación; logout invalida en el servidor
[ ] Rate limiting activo y verificado por endpoint (tabla de arriba)
[ ] Mensajes de error genéricos (anti-enumeración) en login, registro y reset
[ ] Verificación de email antes de acciones sensibles
[ ] Passkeys: solo clave pública guardada, counter validado, challenge con TTL
[ ] MFA ofrecido si la app maneja dinero/datos sensibles; recuperación con jerarquía segura
[ ] Sin contraseñas/tokens/códigos en logs ni en Sentry (archivo 09)
```

---

## CÓMO SE CONECTA CON EL RESTO DEL SISTEMA

- **`09-SEGURIDAD.md`**: este archivo profundiza el *auth*; el 09 cubre el resto de la superficie técnica (BFF, RLS, headers). El endurecimiento de login del 09 es el resumen; aquí está el detalle.
- **`27-REVISION-SEGURIDAD.md`**: la auditoría OWASP revisa que estas reglas de auth se cumplan (A07 Fallas de Identificación y Autenticación).
- **`02B-ONBOARDING-Y-PAYWALL.md`**: el método y momento del registro es parte de la estrategia de conversión.
- **`15-PATRONES-UX.md`**: auth sin fricción (passwordless/OAuth, valor antes del registro) = +30-50% de registro.
