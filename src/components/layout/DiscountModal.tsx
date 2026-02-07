import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, ArrowRight } from 'lucide-react';
import { useDiscountedProducts } from '../../hooks/useDiscountedProducts';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiscountModal({ isOpen, onClose }: DiscountModalProps) {
  const navigate = useNavigate();
  const { count, isLoading } = useDiscountedProducts();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Verificar si ya se mostró hoy
    const lastShown = localStorage.getItem('pass-discount-modal-shown');
    const today = new Date().toDateString();
    
    if (lastShown !== today && count > 0) {
      setShouldShow(true);
    } else {
      setShouldShow(false);
      onClose();
    }
  }, [count, onClose]);

  const handleViewDiscounts = () => {
    const today = new Date().toDateString();
    localStorage.setItem('pass-discount-modal-shown', today);
    navigate('/pass-off');
    onClose();
  };

  const handleClose = () => {
    const today = new Date().toDateString();
    localStorage.setItem('pass-discount-modal-shown', today);
    onClose();
  };

  if (!shouldShow || isLoading || count === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-black/5 rounded-full blur-xl"></div>
                    <div className="relative bg-black rounded-full p-4">
                      <Tag className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Productos en Descuento
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Tenemos <span className="font-semibold text-gray-900">{count} {count === 1 ? 'producto' : 'productos'}</span> con descuentos especiales disponibles por tiempo limitado.
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleViewDiscounts}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                  >
                    <span>Ver Productos en Oferta</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors border border-gray-200"
                  >
                    Continuar navegando
                  </button>
                </div>

                {/* Footer note */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  Este mensaje se mostrará una vez al día
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
