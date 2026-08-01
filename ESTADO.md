# ESTADO — Manos Creadoras App
Última actualización: 2026-07-31 | Sesión actual: 1 (en curso)

⏸️ CHECKPOINT — Última acción completada: Sesión 4 (bienvenida post-compra + login magic link) construida y verificada — 2 rondas de `revisor-visual` con 9 defectos corregidos en total, build+tsc limpios, flujo completo probado en navegador real (escribir email → enviar → estado "revisa tu correo" → volver al formulario). Checkout real de Hotmart ya conectado desde Sesión 3 / Siguiente acción exacta: arrancar Sesión 5 — app interna con 3 secciones (Mis Cursos con video embebido de Hotmart · Asistente IA "El Ojo Experto" · Mi Cuenta), con datos semilla realistas. Esperar OK de la dueña antes de arrancar.

## Qué es esta app
App con dos zonas: (1) frente público de ventas (instalable, con notificaciones push) para clientas potenciales de Instagram, y (2) zona privada con login para alumnas que ya compraron, con sus cursos (video embebido desde Hotmart) y un asistente de IA que da feedback sobre fotos de sus bolsos en progreso. Vende el curso "Bolsos de Lujo en Cuentas" ($25 pago único vía Hotmart, ya validado con +1.200 alumnas).

## Promesa central
"Esta app ayuda a mujeres que quieren tejer bolsos de lujo en cuentas a decidir con confianza y avanzar sin trabarse, sin perder tiempo en grupos de WhatsApp o tutoriales sueltos, mediante una app con sus cursos, avisos automáticos y un asistente de IA que revisa fotos de su bolso y le dice qué mejorar."

## Reporte de validación (Sesión 1)
- Veredicto: Excelente oportunidad — el negocio ya está validado (1.200+ alumnas, 4.9/5, +1 año vendiendo); la oportunidad nueva es el FORMATO (app instalable con push, no solo landing).
- Competencia directa en el nicho (bolsos en cuentas/mostacillas): Domestika, cursosbisuteriayalambrismo.com, Pauline Caro — ninguna tiene app instalable ni asistente de IA. Brecha de formato clara.
- Evidencia de que push + app instalable convierte mejor: recuperación de carrito 37% mejor que email (Pushwoosh); casos reales con PWA+push: Lancôme +17% conversión, BMW 4x más clics a la sección de venta, Weekendesk 2x más probabilidad de compra con la app instalada.
- Precio de referencia del mercado: cursos similares $19-97 pago único; el propio ya vende a $25 (oferta de $55).

## Avatar y venta (Sesión 1 — hecho, pendiente de aprobación del usuario)
- FICHA-AVATAR.md: SÍ existe (creada 2026-07-31) — pendiente de aprobación explícita de la dueña (se le mostró resumen en el chat).
- Resumen: avatar "Marcela", 28-45, LATAM, sigue a Manos Creadoras en IG · dolor #1: "mis bolsos no se ven profesionales" · deseo #1: "que se vean de boutique, no casero" · nivel de consciencia 3-4 (audiencia orgánica caliente) · sofisticación etapa 3 (mecanismo IA al frente, nadie más lo tiene en el nicho)
- Landing: ya existe en manoscreadoras.lovable.app — se migra y se mejora (no se reinventa). Pendiente: completar respuestas de FAQ (hoy están vacías), sumar video de la creadora, unificar nombre de marca ("Manos Creadoras" en vez de "Elizabeth Valencia" / email de ateliervalencia.com).

## Estrategia de monetización (Sesión 1 — decidido)
- Modelo: NO es SaaS con paywall interno. El pago ocurre 100% en Hotmart (externo, pago único $25, "acceso de por vida"). La app interna es un beneficio post-compra (cursos + IA), no lo que se cobra.
- Justificación: el negocio ya vende así hace +1 año con datos reales; no se cambia el modelo de cobro, es lo que pidió la dueña.
- Login: se activa automáticamente tras la compra (webhook de Hotmart crea la cuenta) — no hay paywall propio dentro de la app.
- Uso justo del asistente de IA (decidido): 40 preguntas de texto + 8 fotos analizadas por mes, gratis, dentro del acceso de por vida — cálculo: ese uso cuesta centavos por alumna activa al mes, muy por debajo del pago de $25. Si el uso real en producción resulta mucho mayor a esto, se revisa (ej. renovación anual pequeña solo para seguir usando la IA) — eso sí seria una decisión de precio a validar con la dueña, no se decide ahora.

## Dirección de Arte (Sesión 2 — CERRADA, cosa juzgada)
- FICHA-ARTE.md: SÍ existe y está aprobada (2026-07-31) — opción elegida: **B, "Editorial de Revista"**.
- Resumen: fondo #090706 · superficie #120f0c · texto #f6f1e7/#c9beac · acento dorado #ebcd8c→#d48e00 · Display "Cormorant Garamond" · Body "Jost" (reemplazó a "Inter", genérico) · radio cards 20-24px, botones pill.
- Personalidad: Elegante · Cálida · Aspiracional.
- Dispositivo ownable: foto de producto a sangre completa + grano sutil + tipografía display superpuesta ("portada editorial").
- REGISTRO ANTI-REPETICIÓN: paleta (casi-negro cálido #090706 + dorado #ebcd8c-#d48e00) y par tipográfico (Cormorant Garamond + Jost) vetados para el próximo proyecto de este SO. Dirección del banco 54 usada: N/A (fue interpretación fiel de referencia, no del banco).
- Pendiente de limpieza (no urgente): borrar/mover `direcciones-abc.html` de la raíz antes de inicializar el repo público o hacer deploy.

## Secuencia maestra de construcción (adaptada — NO es la secuencia default del SO)
- Esta app NO tiene paywall interno tradicional: página de ventas (pública, con push) → checkout externo en Hotmart → login automático post-compra (vía webhook) → app interna (cursos embebidos + asistente IA), sin paywall propio.
- Landing: pendiente (Sesión 3)
- Login/Auth: pendiente (Sesión 4) — motivo: dar acceso a cursos y guardar progreso/conversaciones con la IA.
- App interna: pendiente (Sesión 5) — secciones previstas: Mis Cursos (video embebido Hotmart) · Asistente IA (texto + fotos) · Mi Progreso/Cuenta.
- Servicios externos: pendiente (Sesión 6) — Supabase (auth+RLS), Hotmart webhook, Hotmart Player (verificar con la dueña si ya lo tiene o hay que contratarlo), notificaciones push, IA (Claude con visión), Vercel, dominio.

## Decisiones técnicas (tomadas por el agente, no se re-preguntan)
- Framework: Next.js App Router (necesita SEO/landing pública + rutas privadas + API routes) — decidido 2026-07-31.
- IA: Claude vía servidor/BFF · chat de texto síncrono con streaming · análisis de fotos SIEMPRE asíncrono (job en cola, la alumna recibe el resultado en la app/notificación, no espera bloqueada) · circuit-breaker de gasto global + contador de fair-use mensual por usuario (tabla `ai_usage`).
- Videos: NO se alojan de cero — se embeben desde Hotmart (Hotmart Player o Club, a confirmar con la dueña qué tiene contratado hoy).
- Auth: Supabase Auth con enlace mágico por email (sin contraseña, mínima fricción) · cuenta creada automáticamente por el webhook de Hotmart al comprar, usando el email de la compra como llave — no hay registro manual ni paywall propio.
- Modelo de datos (borrador, se ajusta en Sesión 6): `profiles` (perfil + estado de acceso) · `courses`/`modules` (metadata + ID del video de Hotmart Player) · `user_progress` (qué módulos completó cada alumna) · `ai_conversations` (historial del asistente) · `ai_usage` (contador mensual para el fair-use). RLS en todas: política por `(select auth.uid()) = user_id`, columna indexada.

## Sesiones completadas ✅
- Sesión 1 — Validación, Constitución del Producto, Plan Maestro, FICHA-AVATAR.md, fair-use de IA, arquitectura técnica (auth/datos/RLS) — todo aprobado 2026-07-31.
- Sesión 2 — Identidad visual: protocolo A/B/C ejecutado, dueña eligió Opción B, FICHA-ARTE.md aprobada — 2026-07-31.

## Sesión en progreso 🔧
- (ninguna — Sesión 4 cerrada, esperando OK para arrancar Sesión 5)

## Sesiones completadas ✅
- Sesión 3 — Página de ventas: 10 secciones canónicas + 4 páginas legales, checkout real de Hotmart conectado (`pay.hotmart.com/S100198743F?off=f3k6k34t` en `lib/config.ts`). Testimonios con nombre quedan PENDIENTES de la dueña a propósito (ver Problemas conocidos). 3 rondas de `revisor-visual` (25→32/40 usab., 12→13/20 craft), 13 defectos reales corregidos, incluido un bug de precio parpadeando "$24→$25" a mitad de animación.
- Sesión 4 — Bienvenida + login (2026-08-01):
  - `/bienvenida` (post-compra): confirmación + instrucción de revisar correo, con celebración real (`.celebrate`, spring 0.6s) en el ícono — el único hito real del flujo hasta ahora.
  - `/login`: magic link sin contraseña, 4 estados completos (idle, loading, sent, error). `lib/auth.ts` MOCKEA el envío a propósito (el backend real de Supabase llega en Sesión 6).
  - 2 rondas de `revisor-visual`, 9 defectos corregidos: estado "enviado" sin salida · falta de `autoComplete`/`inputMode` · error que no se limpiaba al corregir · profundidad insuficiente de fondo · Eyebrow faltante en "enviado" · CTA siempre activo aunque el email fuera inválido (ahora se deshabilita hasta que el formato sea válido) · copy "Usar otro correo" que no coincidía con la acción (ahora "Reenviar o cambiar correo") · anillo de celebración circular sobre un ícono cuadrado · falta del grano de papel (dispositivo ownable) en las pantallas de auth.
  - Verificado en navegador real: flujo completo probado (email → enviar → "revisa tu correo" con el email correcto → volver al formulario precargado), botón confirmado pasando de `[disabled]` a activo. Screenshots (últimos, ya con TODOS los arreglos aplicados): `.playwright-mcp/bienvenida-v2-final.png`, `login-disabled-final.png`, `login-sent-final.png`, `login-reset-final.png`.

## Próximas sesiones 📋
- Sesión 5: App interna (Mis Cursos + Asistente IA)
- Sesión 6: Integraciones reales (Supabase, Hotmart webhook + Player, IA real, push, dominio)
- Sesión 7: Testing, pulido, rigor de entrega
- Sesión 8: Adquisición, lanzamiento, backoffice

## Problemas conocidos ⚠️
- No confirmado si "Hotmart Player" (el embebible) ya está contratado o hay que agregarlo — verificar con la dueña antes de la Sesión 5/6.
- La landing NO tiene testimonios con nombre — decisión deliberada: la dueña pidió inventarlos "mientras agregamos unos reales" y el agente se negó (riesgo real de moderación de Hotmart/publicidad engañosa, no solo regla del SO) — la dueña lo aceptó. Solo queda el agregado real (+1.200 alumnas · 4.9/5) hasta tener 2-3 reales.
- `direcciones-abc.html` sigue en la raíz del proyecto — recordar borrarlo antes de subir el repo o hacer deploy (no se sube a producción).
- Título de pestaña de `/login` no personalizado (hereda el de Home) — es "use client" y no puede exportar `metadata`; solucionable con un layout.tsx propio del grupo `(auth)` si se quiere pulir, no bloqueante.

## Pendientes del usuario
- [ ] **Mandar 2-3 testimonios reales** (las capturas de WhatsApp de alumnas que mencionaste tener) para agregarlos a la sección "La app por dentro".
- [ ] Confirmar en su panel de Hotmart si tiene "Hotmart Player" contratado (para los videos embebidos, Sesión 5/6)
- [ ] Más adelante: crear/confirmar cuentas de Supabase, Vercel y dominio (se guía paso a paso en la Sesión 6)

## Notas para la próxima sesión
- El pago sigue siendo 100% en Hotmart (pago único $25) — esta app NO tiene paywall propio, es un beneficio post-compra.
- Servidor de desarrollo: `npm run dev` (puerto 3000 o el que Next asigne libre). Screenshots de verificación en `.playwright-mcp/home-375-fullpage-v4.png` (última versión, todo corregido).
- Node local es 20.12.1; 51-STACK-PINEADO.md recomienda 22 LTS — no bloqueante, pero considerar actualizar antes del deploy.
