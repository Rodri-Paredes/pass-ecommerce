import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { easeOut } from '../../lib/motion';

const FAQ_ITEMS = [
  {
    question: '¿Cómo funciona el pago de PASS CREW?',
    answer:
      'Eliges un plan, realizas el pago con las instrucciones disponibles, subes el comprobante y el equipo de PASS revisa la solicitud antes de activar la membresía.',
  },
  {
    question: '¿Cuánto dura mi membresía?',
    answer:
      'Puedes elegir el plan semestral de 6 meses o el plan anual de 12 meses. El periodo comienza cuando el equipo aprueba la solicitud.',
  },
  {
    question: '¿Qué pasa si mi comprobante es rechazado?',
    answer:
      'Si tu comprobante no puede ser validado, te lo notificaremos en la sección "Mi cuenta" y podrás generar una nueva solicitud con un comprobante válido.',
  },
];

export default function CrewFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className={`rounded-xl border overflow-hidden transition-colors ${
              isOpen ? 'border-champagne/40 bg-white/5' : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className={`font-medium text-sm ${isOpen ? 'text-champagne' : 'text-pass-white'}`}>
                {item.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                  isOpen ? 'rotate-180 text-champagne' : 'text-white/40'
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed">{item.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
