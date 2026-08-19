import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { fadeUp, easeOut } from '../../lib/motion';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel oscuro */}
      <div className="relative w-full lg:w-[55%] min-h-[32vh] lg:min-h-screen bg-pass-black flex items-center justify-center overflow-hidden px-6 py-16 lg:py-0">
        <motion.div
          className="absolute -top-32 -left-32 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-champagne/10 blur-[100px]"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: easeOut }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-72 h-72 sm:w-[28rem] sm:h-[28rem] rounded-full bg-white/5 blur-[120px]"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: easeOut }}
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative text-center lg:text-left max-w-md"
        >
          <Link to="/" className="inline-block font-display text-2xl sm:text-3xl tracking-[0.3em] text-pass-white mb-6 sm:mb-10">
            PASS
          </Link>
          <p className="font-display text-3xl sm:text-5xl lg:text-6xl text-pass-white leading-[1.1]">
            ÚNETE A LA<br />COMUNIDAD
          </p>
          <p className="text-white/40 text-sm sm:text-base mt-5 max-w-xs mx-auto lg:mx-0">
            Acceso anticipado a drops, beneficios exclusivos y una membresía pensada para quienes visten distinto.
          </p>
        </motion.div>
      </div>

      {/* Panel de formulario */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-12 lg:py-0 bg-white">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-pass-black transition-colors mb-10">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>

          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-pass-black mb-2">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 mb-8">{subtitle}</p>}
          {!subtitle && <div className="mb-8" />}

          {children}

          <div className="mt-8 text-sm text-gray-400">{footer}</div>
        </motion.div>
      </div>
    </div>
  );
}
