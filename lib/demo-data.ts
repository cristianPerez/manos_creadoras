// Datos semilla del mundo del avatar (32 — "la app nunca se enseña vacía").
// Se usan para enseñar la app y para los screenshots del carrusel de la landing.
// NUNCA se muestran en producción real: se reemplazan por datos de Supabase en la Sesión 6.

export type EstadoModulo = "completado" | "en-curso" | "pendiente";

export type Modulo = {
  id: string;
  numero: number;
  titulo: string;
  duracionMin: number;
  estado: EstadoModulo;
  /** ID del video en Hotmart Player. Vacío hasta que la dueña confirme su cuenta (ver lib/config.ts). */
  hotmartVideoId: string;
};

export const ALUMNA = {
  nombre: "Marcela",
  desdeDias: 24,
};

export const MODULOS: Modulo[] = [
  { id: "m1", numero: 1, titulo: "Bases y tensión del tejido", duracionMin: 14, estado: "completado", hotmartVideoId: "" },
  { id: "m2", numero: 2, titulo: "Aumentos y disminuciones", duracionMin: 18, estado: "completado", hotmartVideoId: "" },
  { id: "m3", numero: 3, titulo: "Tu primer bolso: cuerpo y forma", duracionMin: 22, estado: "completado", hotmartVideoId: "" },
  { id: "m4", numero: 4, titulo: "Asas, cadenas y herrajes", duracionMin: 16, estado: "en-curso", hotmartVideoId: "" },
  { id: "m5", numero: 5, titulo: "Forro interior y acabados de boutique", duracionMin: 25, estado: "pendiente", hotmartVideoId: "" },
  { id: "m6", numero: 6, titulo: "Malla plástica: estructura firme", duracionMin: 20, estado: "pendiente", hotmartVideoId: "" },
  { id: "m7", numero: 7, titulo: "Cierres y remates invisibles", duracionMin: 15, estado: "pendiente", hotmartVideoId: "" },
  { id: "m8", numero: 8, titulo: "Fotografía y precio de tu bolso", duracionMin: 19, estado: "pendiente", hotmartVideoId: "" },
];

export const moduloActual = MODULOS.find((m) => m.estado === "en-curso") ?? MODULOS[0];

export const completados = MODULOS.filter((m) => m.estado === "completado").length;
export const progresoPct = Math.round((completados / MODULOS.length) * 100);

export type Consulta = {
  id: string;
  tipo: "foto" | "texto";
  pregunta: string;
  respuesta: string;
  haceDias: number;
};

export const CONSULTAS: Consulta[] = [
  {
    id: "c1",
    tipo: "foto",
    pregunta: "¿Por qué se me abomba la base del bolso?",
    respuesta:
      "Vas bien encaminada. La base se abomba porque estás dejando la tensión muy suelta en las primeras vueltas: aprieta un poco más el hilo cada 3-4 cuentas y vas a ver cómo se aplana sola.",
    haceDias: 2,
  },
  {
    id: "c2",
    tipo: "texto",
    pregunta: "¿Qué hilo me conviene para el modelo Pearl Bow?",
    respuesta:
      "Para el Pearl Bow usa hilo de nylon del 0.8 mm — aguanta el peso de las perlas sin estirarse. El de algodón se afloja con el uso y el bolso pierde forma.",
    haceDias: 5,
  },
  {
    id: "c3",
    tipo: "foto",
    pregunta: "¿Está parejo el borde antes de poner el herraje?",
    respuesta:
      "El borde está parejo, sí. Antes de coser el herraje, pasa una vuelta de remate para que no se abra con el peso de la cadena.",
    haceDias: 9,
  },
];

// Uso justo mensual decidido en ESTADO.md (Sesión 1)
export const LIMITE_PREGUNTAS = 40;
export const LIMITE_FOTOS = 8;
export const USADAS_PREGUNTAS_INICIAL = 12;
export const USADAS_FOTOS_INICIAL = 3;
