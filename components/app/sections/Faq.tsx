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
    q: "¿Me van a cobrar todos los meses? ¿Puedo cancelar?",
    a: "Sí, es una membresía: el plan anual se cobra una vez al año ($199) y el mensual todos los meses ($19.99). Cancelas cuando quieras desde tu panel de Hotmart, sin llamadas ni explicaciones.",
  },
  {
    q: "¿Es caro? ¿Vale la pena?",
    a: "El plan anual sale $16.58 al mes — menos que los materiales que desperdicias en un solo intento fallido. Y a diferencia de un curso suelto, incluye al Ojo Experto revisando tu tejido siempre que lo necesites.",
  },
  {
    q: "¿Por qué es membresía y no un pago único?",
    a: "Porque no es solo un curso grabado: cada mes se suman modelos nuevos, y el Ojo Experto trabaja para ti cada vez que subes una foto. La membresía es lo que mantiene ambas cosas vivas.",
  },
  {
    q: "¿Qué pasa con mi progreso si cancelo?",
    a: "Tu cuenta y tu historial se conservan. Si vuelves más adelante, retomas donde quedaste — no empiezas de cero.",
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
