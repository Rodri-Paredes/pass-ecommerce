import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { fadeUp, viewportOnce } from '../../lib/motion';

interface MembershipCardPreviewProps {
  memberNumber?: string;
  memberName?: string;
}

export default function MembershipCardPreview({
  memberNumber = 'CREW-000001',
  memberName = 'MIEMBRO PASS',
}: MembershipCardPreviewProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="flex justify-center"
    >
      <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl border border-champagne/30 bg-gradient-to-br from-pass-black via-pass-black to-[#1a1408] p-6 sm:p-8 overflow-hidden shadow-[0_0_60px_-15px_rgba(201,169,97,0.35)]">
        {/* Decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-champagne/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-champagne/5 rounded-full blur-3xl" />

        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-champagne/70 uppercase">Membresía</p>
              <p className="font-display text-xl sm:text-2xl text-pass-white tracking-wide mt-1">PASS CREW</p>
            </div>
            <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-champagne" />
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] text-pass-white/40 uppercase mb-1">Titular</p>
            <p className="text-sm sm:text-base text-pass-white font-medium tracking-wide truncate">{memberName}</p>
            <p className="font-mono text-champagne/90 text-sm sm:text-base tracking-[0.2em] mt-3">{memberNumber}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
