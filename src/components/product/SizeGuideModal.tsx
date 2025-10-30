import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const SIZE_GUIDE_IMAGES: Record<string, string> = {
  'Pantalones': 'https://jbdiidhseumjqdfxyzop.supabase.co/storage/v1/object/public/drops/guia-size/guia-pant.jpeg',
  'Shorts': 'https://jbdiidhseumjqdfxyzop.supabase.co/storage/v1/object/public/drops/guia-size/guia-pant.jpeg',
  // Puedes agregar más guías aquí cuando las tengas
  // 'Hoodies': 'url_de_guia_hoodies',
  // 'Camisas': 'url_de_guia_camisas',
};

export default function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
  const guideImage = SIZE_GUIDE_IMAGES[category];

  if (!guideImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-semibold tracking-wide">
                  GUÍA DE TALLAS - {category.toUpperCase()}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <img
                  src={guideImage}
                  alt={`Guía de tallas para ${category}`}
                  className="w-full h-auto rounded-lg"
                />
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Tip:</strong> Si tienes dudas sobre tu talla, contáctanos por WhatsApp 
                    y te ayudaremos a elegir la talla perfecta.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
