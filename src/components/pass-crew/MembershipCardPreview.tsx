import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
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
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="flex justify-center"
    >
      <div className="relative aspect-[1.586/1] w-full max-w-[520px] overflow-hidden border border-[#d7bc78]/80 bg-[linear-gradient(135deg,#f1d995_0%,#b9954d_48%,#e6ca86_100%)] p-6 text-[#1b1710] shadow-[0_24px_70px_-25px_rgba(214,177,92,.6)] sm:p-8 lg:max-w-[560px]">
        <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div><p className="text-[9px] font-bold uppercase tracking-[.35em] opacity-55">Membresía</p><p className="mt-1 font-display text-xl tracking-wide sm:text-2xl">PASS CREW</p></div>
            <Crown className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <div>
            <p className="mb-1 text-[9px] uppercase tracking-[.3em] opacity-55">Titular</p>
            <p className="truncate text-sm font-bold tracking-wide sm:text-base">{memberName}</p>
            <div className="mt-3 flex items-end justify-between gap-3"><div><p className="text-[8px] uppercase tracking-[.22em] opacity-55">Código PASS</p><p className="mt-1 font-mono text-sm tracking-[.16em] sm:text-base">{memberNumber}</p></div><div className="text-right"><p className="text-[8px] uppercase tracking-[.22em] opacity-55">Plan</p><p className="mt-1 text-[10px] font-bold uppercase">{planName}</p></div></div>
            <p className="mt-2 text-[8px] uppercase tracking-[.2em] opacity-55">Miembro desde {memberSince}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
