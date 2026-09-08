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

- **El `Site URL` manda.** Todos estos correos arman el enlace con `{{ .SiteURL }}`.
  Si en *Authentication → URL Configuration* sigue puesto `http://localhost:3000`, los
  correos saldrán con enlaces a `localhost`, que **en el celular de la alumna no existe**.
  Al publicar hay que cambiarlo a la dirección real.

- **Los enlaces usan `token_hash`, no `?code=`.** Es a propósito: con `?code=` el enlace
  solo funciona si se abre en el mismo navegador donde se pidió, y la alumna casi siempre
  lo pide en Chrome y lo abre desde Gmail. Con `token_hash` funciona en cualquiera.
  Si alguien "arregla" la plantilla volviendo al enlace por defecto de Supabase, se rompe eso.

- **No hace falta tocar código** para cambiar estos correos: `app/auth/callback` ya acepta
  todos los tipos (`magiclink`, `signup`, `invite`, `email_change`, `recovery`).

- **Cada ambiente tiene su propio panel.** Cuando exista el Supabase de producción, estas
  plantillas hay que volver a pegarlas allí — no se copian solas entre proyectos.
