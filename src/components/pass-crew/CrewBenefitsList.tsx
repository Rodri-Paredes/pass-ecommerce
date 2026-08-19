import { motion } from 'framer-motion';
import { Star, Tag, Truck, Gift, Crown, Sparkles, Percent, Heart, type LucideIcon } from 'lucide-react';
import type { CrewBenefit } from '../../types';
import { fadeUp, staggerContainer, viewportOnce } from '../../lib/motion';

const ICON_MAP: Record<string, LucideIcon> = {
  Star,
  Tag,
  Truck,
  Gift,
  Crown,
  Sparkles,
  Percent,
  Heart,
};

interface CrewBenefitsListProps {
  benefits: CrewBenefit[];
}

export default function CrewBenefitsList({ benefits }: CrewBenefitsListProps) {
  if (benefits.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="flex gap-4 overflow-x-auto scroll-snap-x scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible"
    >
      {benefits.map((benefit) => {
        const Icon = (benefit.icon && ICON_MAP[benefit.icon]) || Star;

        return (
          <motion.div
            key={benefit.id}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="flex-shrink-0 w-[78%] sm:w-auto snap-start flex items-start gap-4 p-5 sm:p-6 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 transition-colors hover:border-champagne/30"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-champagne/15 border border-champagne/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-champagne" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-wide text-pass-white">{benefit.title}</h3>
              {benefit.description && (
                <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{benefit.description}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
