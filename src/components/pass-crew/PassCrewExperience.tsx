import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, ChevronDown } from 'lucide-react';
import { usePassCrewStore } from '../../store/passCrewStore';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { CREW_MEMBERSHIP_LABELS, CREW_REQUEST_LABELS } from '../../lib/crewLabels';
import CrewBenefitsList from './CrewBenefitsList';
import CrewFAQ from './CrewFAQ';
import MembershipCardPreview from './MembershipCardPreview';
import { fadeUp, fadeIn, staggerContainer, viewportOnce, easeOut } from '../../lib/motion';

interface PassCrewExperienceProps {
  /** Llamado cuando el usuario navega a otra ruta desde dentro de la experiencia (ej. cerrar el overlay). */
  onNavigate?: () => void;
}

export default function PassCrewExperience({ onNavigate }: PassCrewExperienceProps) {
  const { plan, benefits, membership, activeRequest, isLoading, loadLandingData, loadMyStatus } = usePassCrewStore();
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useCustomerAuthStore();

  useEffect(() => {
    loadLandingData();
  }, [loadLandingData]);

  useEffect(() => {
    if (customer) {
      loadMyStatus(customer.id);
    }
  }, [customer, loadMyStatus]);

  const ctaButtonClass =
    'inline-flex items-center justify-center gap-2 bg-champagne text-pass-black px-10 py-4 rounded-full font-medium tracking-[0.15em] text-sm uppercase hover:bg-champagne-light transition-colors duration-300 shadow-[0_0_30px_-8px_rgba(201,169,97,0.6)]';

  const renderCTA = () => {
    if (isAuthLoading || isLoading) {
      return (
        <span className="inline-block bg-white/10 text-white/40 px-10 py-4 rounded-full font-medium tracking-[0.15em] text-sm uppercase">
          Cargando...
        </span>
      );
    }

    if (!isAuthenticated) {
      return (
        <Link to="/signup?redirect=/pass-crew/join" onClick={onNavigate} className={ctaButtonClass}>
          <Crown className="w-4 h-4" />
          Quiero ser PASS CREW
        </Link>
      );
    }

    if (membership && membership.status === 'active') {
      return (
        <div className="space-y-4">
          <p className="text-champagne text-sm font-medium tracking-wide">{CREW_MEMBERSHIP_LABELS[membership.status]}</p>
          <Link to="/account" onClick={onNavigate} className={ctaButtonClass}>
            Ver mi cuenta
          </Link>
        </div>
      );
    }

    if (activeRequest) {
      return (
        <div className="space-y-4">
          <p className="text-champagne text-sm font-medium tracking-wide">{CREW_REQUEST_LABELS[activeRequest.status]}</p>
          <Link to="/pass-crew/status" onClick={onNavigate} className={ctaButtonClass}>
            Ver estado de mi solicitud
          </Link>
        </div>
      );
    }

    return (
      <Link to="/pass-crew/join" onClick={onNavigate} className={ctaButtonClass}>
        <Crown className="w-4 h-4" />
        Quiero ser PASS CREW
      </Link>
    );
  };

  return (
    <div className="bg-pass-black text-pass-white">
      {/* Hero */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-champagne/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative space-y-6"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-champagne" />
            <span className="text-xs tracking-[0.4em] uppercase text-champagne/80">Membresía exclusiva</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-6xl sm:text-8xl lg:text-9xl tracking-tight leading-none"
          >
            PASS CREW
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base sm:text-lg text-white/60 max-w-md mx-auto">
            La membresía para quienes visten distinto.
          </motion.p>

          {plan && (
            <motion.p variants={fadeUp} className="text-xs tracking-[0.3em] uppercase text-white/30">
              Bs {plan.price.toFixed(2)} / {plan.duration_days} días
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: easeOut }}
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* Manifiesto */}
      <section className="py-24 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-3xl mx-auto text-center space-y-8"
        >
          <div className="w-12 h-px bg-champagne mx-auto" />
          <p className="font-display text-2xl sm:text-4xl leading-snug text-pass-white/90">
            No es solo ropa. Es pertenecer a algo más grande.
          </p>
          <p className="text-sm sm:text-base text-white/40 max-w-xl mx-auto leading-relaxed">
            PASS CREW reúne a quienes entienden que la ropa es identidad. Acceso anticipado, precios preferenciales
            y una comunidad que se mueve antes que el resto.
          </p>
        </motion.div>
      </section>

      {/* Beneficios */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center text-xs tracking-[0.4em] uppercase text-white/40 mb-10"
        >
          Beneficios
        </motion.h2>
        <CrewBenefitsList benefits={benefits} />
      </section>

      {/* Tarjeta de membresía */}
      <section className="py-16 px-6">
        <MembershipCardPreview
          memberName={customer?.full_name}
          memberNumber={membership?.member_number}
        />
      </section>

      {/* Precio + CTA */}
      <section className="py-24 px-6 text-center border-t border-white/10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="space-y-8"
        >
          {plan && (
            <div>
              <p className="font-display text-5xl sm:text-6xl text-pass-white">
                Bs {plan.price.toFixed(2)}
              </p>
              <p className="text-xs tracking-[0.3em] uppercase text-white/30 mt-2">
                cada {plan.duration_days} días
              </p>
            </div>
          )}
          {renderCTA()}
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-3xl mx-auto pb-24">
        <motion.h2
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="text-center text-xs tracking-[0.4em] uppercase text-white/40 mb-10"
        >
          Preguntas frecuentes
        </motion.h2>
        <CrewFAQ />
      </section>
    </div>
  );
}
