/**
 * Service worker de Manos Creadoras.
 *
 * Hace DOS cosas y nada más: permitir que la app se instale y recibir las
 * notificaciones. NO cachea nada a propósito — es una app de curso pagado: una
 * caché mal invalidada serviría lecciones viejas, o dejaría contenido en el
 * dispositivo de alguien que ya canceló. El costo de no cachear es que necesita
 * internet; el de cachear mal es mucho peor.
 */

self.addEventListener("install", () => {
  // Activar de una la versión nueva, sin esperar a que cierre todas las pestañas.
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(self.clients.claim());
});

// Passthrough: el navegador exige un manejador de `fetch` para ofrecer instalar.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (evento) => {
  let datos = {};
  try {
    datos = evento.data ? evento.data.json() : {};
  } catch {
    // Si el cuerpo no es JSON, al menos mostramos el texto plano.
    datos = { cuerpo: evento.data ? evento.data.text() : "" };
  }

  const titulo = datos.titulo || "Manos Creadoras";
  const opciones = {
    body: datos.cuerpo || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    // Agrupa: un aviso nuevo del mismo tipo reemplaza al anterior en vez de apilarse.
    tag: datos.etiqueta || "manos-creadoras",
    renotify: true,
    data: { url: datos.url || "/cursos" },
  };

  evento.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url) || "/cursos";

  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      // Si ya tiene la app abierta, la trae al frente en vez de abrir otra.
      for (const ventana of ventanas) {
        if (ventana.url.includes(destino) && "focus" in ventana) return ventana.focus();
      }
      if (ventanas.length > 0 && "navigate" in ventanas[0]) {
        return ventanas[0].navigate(destino).then((v) => v && v.focus());
      }
      return self.clients.openWindow(destino);
    }),
  );
});
