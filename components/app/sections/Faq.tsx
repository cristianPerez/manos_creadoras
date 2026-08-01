import { Accordion } from "@/components/app/Accordion";
import { Eyebrow } from "@/components/app/Eyebrow";
import { Reveal } from "@/components/app/Reveal";

const preguntas = [
  {
    q: "¿Necesito saber tejer o tener experiencia previa?",
    a: "No. El método empieza desde cero: bases, tensión y acabados, paso a paso. Más de 1.200 alumnas empezaron sin experiencia.",
  },
  {
    q: "Ya intenté con tutoriales sueltos de YouTube y no me funcionó, ¿esto es distinto?",
    a: "Sí — la diferencia no es el talento, es que ahí nadie te corrige a mitad de camino. Con el Ojo Experto subes una foto de tu tejido y te dice qué ajustar antes de seguir, no al final cuando ya es tarde.",
  },
  {
    q: "¿El asistente de IA (el Ojo Experto) de verdad sirve, o es solo un anuncio?",
    a: "Es un asistente entrenado con el método de Elizabeth: revisa tu foto y te da un consejo concreto sobre tensión, firmeza o acabado — no es un chatbot genérico. Es orientación, no reemplaza tu criterio.",
  },
  {
    q: "¿Voy a poder vender los bolsos que haga?",
    a: "Sí. El programa incluye la plantilla de costos y precios y el método de ventas boutique para que sepas qué cobrar y cómo mostrarlo.",
  },
  {
    q: "¿Es caro? ¿Vale la pena el precio?",
    a: "Hoy es un pago único de $25 — menos de lo que ya gastaste en materiales de un solo intento fallido. El acceso es de por vida, no mensual.",
  },
  {
    q: "¿El acceso es limitado o es para siempre?",
    a: "Es de por vida. Avanzas a tu ritmo, sin fecha de vencimiento.",
  },
];

export function Faq() {
  return (
    <section className="px-4 py-16 max-w-2xl mx-auto md:px-8">
      <Reveal className="text-center">
        <Eyebrow>Preguntas frecuentes</Eyebrow>
        <h2 className="font-display font-normal text-text-primary mt-2" style={{ fontSize: "var(--text-3xl)", lineHeight: "var(--leading-tight)" }}>
          Antes de que preguntes
        </h2>
      </Reveal>
      <Reveal delay={0.08} className="mt-8">
        <Accordion items={preguntas} />
      </Reveal>
    </section>
  );
}
