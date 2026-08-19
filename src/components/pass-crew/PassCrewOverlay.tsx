import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useCrewOverlayStore } from '../../store/crewOverlayStore';
import { easeOut } from '../../lib/motion';
import PassCrewExperience from './PassCrewExperience';

export default function PassCrewOverlay() {
  const { isOpen, close } = useCrewOverlayStore();

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="fixed inset-0 bg-pass-black/70 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="fixed inset-0 z-[101] overflow-y-auto bg-pass-black"
          >
            <button
              onClick={close}
              className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[102] p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-pass-white transition-colors"
              aria-label="Cerrar PASS CREW"
            >
              <X className="w-5 h-5" />
            </button>

            <PassCrewExperience onNavigate={close} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
