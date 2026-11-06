import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown, RotateCcw } from 'lucide-react';
import { fadeUp, viewportOnce } from '../../lib/motion';

interface MembershipCardPreviewProps {
  memberNumber?: string;
  memberName?: string;
  planName?: string;
  memberSince?: string;
}

export default function MembershipCardPreview({
  memberNumber = 'CREW-000001',
  memberName = 'MIEMBRO PASS',
  planName = 'PASS CREW',
  memberSince = '—',
}: MembershipCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const reduceMotion = useReducedMotion();
  const actionLabel = isFlipped ? 'Ver el frente de la tarjeta PASS Crew' : 'Ver el reverso de la tarjeta PASS Crew';

  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce} className="flex w-full justify-center">
      <motion.button
        type="button"
        aria-label={actionLabel}
        aria-pressed={isFlipped}
        onClick={() => setIsFlipped((value) => !value)}
        whileHover={reduceMotion ? undefined : { y: -6, scale: 1.012 }}
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        className="group w-full max-w-[560px] cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-4 focus-visible:ring-offset-[#0d0d0c] [perspective:1400px]"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 23, mass: 0.9 }}
          className="relative aspect-[1.586/1] w-full [transform-style:preserve-3d]"
        >
          <div className="absolute inset-0 overflow-hidden border border-[#d7bc78]/80 bg-[linear-gradient(135deg,#f1d995_0%,#b9954d_48%,#e6ca86_100%)] p-6 text-[#1b1710] shadow-[0_24px_70px_-25px_rgba(214,177,92,.6)] [backface-visibility:hidden] sm:p-8">
            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-black/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.35em] opacity-55">Membresía</p><p className="mt-1 font-display text-xl tracking-wide sm:text-2xl">PASS CREW</p></div><Crown className="h-6 w-6 sm:h-7 sm:w-7" /></div><div><p className="mb-1 text-[9px] uppercase tracking-[.3em] opacity-55">Titular</p><p className="truncate text-sm font-bold tracking-wide sm:text-base">{memberName}</p><div className="mt-3 flex items-end justify-between gap-3"><div><p className="text-[8px] uppercase tracking-[.22em] opacity-55">Código PASS</p><p className="mt-1 font-mono text-sm tracking-[.16em] sm:text-base">{memberNumber}</p></div><div className="text-right"><p className="text-[8px] uppercase tracking-[.22em] opacity-55">Plan</p><p className="mt-1 text-[10px] font-bold uppercase">{planName}</p></div></div><p className="mt-2 text-[8px] uppercase tracking-[.2em] opacity-55">Miembro desde {memberSince}</p></div></div>
            <span className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.16em] opacity-50 sm:bottom-4 sm:right-5"><RotateCcw className="h-3 w-3" /> Toca para girar</span>
          </div>

          <div aria-hidden="true" className="absolute inset-0 overflow-hidden border border-[#d7bc78]/80 bg-[#16130e] p-6 text-[#f1d995] shadow-[0_24px_70px_-25px_rgba(214,177,92,.45)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(115deg,transparent_0%,rgba(241,217,149,.24)_48%,transparent_49%,transparent_100%)]" />
            <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full border border-[#d7bc78]/30" />
            <div className="relative flex h-full flex-col justify-between"><div className="flex items-start justify-between"><p className="text-[9px] font-bold uppercase tracking-[.35em] text-[#f1d995]/55">PASS / MEMBER ACCESS</p><Crown className="h-6 w-6 sm:h-7 sm:w-7" /></div><div><p className="font-display text-[clamp(2rem,7vw,4.2rem)] leading-none tracking-[-.06em]">CREW<br/>ONLY</p><div className="mt-5 flex items-center justify-between border-t border-[#d7bc78]/35 pt-3 text-[8px] font-bold uppercase tracking-[.22em] text-[#f1d995]/60"><span>Acceso + beneficios</span><span>PASS BOLIVIA</span></div></div></div>
            <span className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[.16em] text-[#f1d995]/55 sm:bottom-4 sm:right-5"><RotateCcw className="h-3 w-3" /> Ver frente</span>
          </div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
