import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';

const SESSION_KEY = 'pass-friday-welcome-shown';
const EXCLUDED_PATHS = new Set(['/pass-friday', '/signup', '/login', '/activate']);

export default function PassFridayWelcomeModal() {
  const location = useLocation();
  const customer = useCustomerAuthStore((state) => state.customer);
  const isLoading = useCustomerAuthStore((state) => state.isLoading);
  const [isOpen, setIsOpen] = useState(false);

  const canShow = !EXCLUDED_PATHS.has(location.pathname);

  useEffect(() => {
    if (!canShow || isLoading || sessionStorage.getItem(SESSION_KEY)) return;

    const timer = window.setTimeout(() => setIsOpen(true), 2_400);
    return () => window.clearTimeout(timer);
  }, [canShow, isLoading]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsOpen(false);
  };

  const accountHref = customer ? '/pass-friday' : '/signup?redirect=/pass-friday';

  return (
    <AnimatePresence>
      {isOpen && canShow && (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar bienvenida de PASS Friday"
            className="fixed inset-0 z-40 cursor-default bg-black/70 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <div className="fixed inset-0 z-[45] flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="pass-friday-welcome-title">
            <motion.section
              initial={{ opacity: 0, y: 28, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: 20, rotate: 1 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[520px] overflow-hidden bg-[#ef442f] text-[#0b0c0a] shadow-[12px_12px_0_#0b0c0a] sm:shadow-[18px_18px_0_#0b0c0a]"
            >
              <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-16 select-none text-[220px] font-black leading-none tracking-[-0.14em] text-black/[0.09]">P</div>
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-14 -left-4 select-none text-[166px] font-black leading-none tracking-[-0.14em] text-white/[0.13]">F</div>

              <button type="button" onClick={close} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center border border-black/30 transition hover:bg-black hover:text-white" aria-label="Cerrar"><X className="h-4 w-4" /></button>

              <div className="relative p-6 sm:p-9">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">PASS Friday · 27.11</p>
                <h2 id="pass-friday-welcome-title" className="mt-8 max-w-[420px] text-[46px] font-black uppercase leading-[0.82] tracking-[-0.075em] sm:text-[62px]">
                  Tu compra<br />abre la puerta.
                </h2>
                <p className="mt-6 max-w-[370px] text-sm leading-6 text-black/75 sm:text-[15px]">
                  Crea tu cuenta PASS y recibe 20 puntos de bienvenida. Luego registra tus compras y llega a 300 para entrar a PASS Friday.
                </p>

                <div className="mt-7 grid grid-cols-2 border-y border-black/35 py-4">
                  <div className="border-r border-black/35 pr-4">
                    <strong className="block text-2xl font-black tracking-[-0.06em]">+20</strong>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-black/65">puntos al crearla</span>
                  </div>
                  <div className="pl-4">
                    <strong className="block text-2xl font-black tracking-[-0.06em]">300</strong>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-black/65">puntos para entrar</span>
                  </div>
                </div>
                <Link to={accountHref} onClick={close} className="mt-7 flex min-h-14 items-center justify-between bg-black px-5 text-[11px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-black">
                  <span>{customer ? 'Ver mi PASS Friday' : 'Crear mi cuenta PASS'}</span>
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
                <button type="button" onClick={close} className="mt-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] underline decoration-black/40 underline-offset-4 transition hover:decoration-black">Ver después</button>
              </div>
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
