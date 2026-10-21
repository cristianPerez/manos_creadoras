# Correos de Supabase — cuál va en cuál

Estos archivos son los correos que Supabase le manda a las alumnas. Se copian y se pegan
en: **Supabase → Authentication → Emails → Templates**.

Se pega **todo el contenido del archivo**, desde la primera línea hasta la última.
En el campo **Subject** (asunto) va el texto de la columna "Asunto".

| Casilla en Supabase | Archivo | Asunto sugerido | ¿Sale de verdad? |
|---|---|---|---|
| **Magic Link** | `magic-link.html` | Tu acceso a Manos Creadoras | ✅ **Sí, es EL correo importante** — el que recibe la alumna cada vez que entra |
| **Confirm signup** | `confirmar-registro.html` | Confirma tu correo | Casi nunca (las cuentas las crea el webhook ya confirmadas), pero conviene tenerlo bien |
| **Invite user** | `invitacion.html` | Tu lugar en Manos Creadoras está listo | Solo si se invita a alguien a mano desde el panel |
| **Change Email Address** | `cambio-de-correo.html` | Confirma el cambio de correo | Solo si una alumna cambia su correo |
| **Reset Password** | `restablecer-clave.html` | Recupera tu acceso | No (aquí no hay contraseñas) — está solo para que no quede con otra marca |
| **Reauthentication** | `reautenticacion.html` | Tu código de confirmación | No — está solo para que no quede con otra marca |

## Cosas que conviene saber antes de tocar el panel

- **El `magic-link.html` ya NO depende del `Site URL`** (cambiado el 2026-10-11).
  Arma el enlace con `{{ .RedirectTo }}`, que es la dirección que pidió la app al
  mandar el correo, y solo cae a `{{ .SiteURL }}` si no viene ninguna.

  **El problema que esto resuelve:** con `{{ .SiteURL }}` fijo, el enlace salía
  SIEMPRE hacia donde apuntara ese ajuste. Pedías entrar desde `localhost:3000`
  para desarrollar y el correo te llevaba a QA. No había manera de probar el
  acceso normal en local.

  **Por qué es seguro:** Supabase solo rellena `{{ .RedirectTo }}` si la
  dirección está en la lista de *Redirect URLs* del panel. Una dirección que no
  esté en la lista se descarta — nadie puede usar esto para mandar a una alumna
  a una web ajena.

  ⚠️ **Los demás correos de esta carpeta siguen usando `{{ .SiteURL }}`** y está
  bien: casi nunca salen, y los que se disparan a mano desde el panel no llevan
  destino que respetar.

- ⚠️ **`emailRedirectTo` no puede llevar `?` en `lib/auth.ts`.** La plantilla pega
  `?token_hash=…` justo detrás, así que si la app enviara un destino que ya
  tuviera signo de interrogación saldrían dos y el enlace se rompería. Hoy manda
  `${origin}/auth/callback` limpio. Si algún día hace falta pasarle algo, va como
  `&` dentro de la plantilla, no colgado del destino.

- **Los enlaces usan `token_hash`, no `?code=`.** Es a propósito: con `?code=` el enlace
  solo funciona si se abre en el mismo navegador donde se pidió, y la alumna casi siempre
  lo pide en Chrome y lo abre desde Gmail. Con `token_hash` funciona en cualquiera.
  Si alguien "arregla" la plantilla volviendo al enlace por defecto de Supabase, se rompe eso.

- **No hace falta tocar código** para cambiar estos correos: `app/auth/callback` ya acepta
  todos los tipos (`magiclink`, `signup`, `invite`, `email_change`, `recovery`).

- **Cada ambiente tiene su propio panel.** Cuando exista el Supabase de producción, estas
  plantillas hay que volver a pegarlas allí — no se copian solas entre proyectos.
