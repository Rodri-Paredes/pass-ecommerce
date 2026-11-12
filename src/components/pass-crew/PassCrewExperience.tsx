import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePassCrewStore } from '../../store/passCrewStore';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import CrewBenefitsList from './CrewBenefitsList';
import CrewFAQ from './CrewFAQ';
import MembershipCardPreview from './MembershipCardPreview';
import { fadeUp, staggerContainer } from '../../lib/motion';

function ReservedPrice({ amount }: { amount: number }) {
  return (
    <div className="mt-3">
      <p aria-hidden="true" className="pointer-events-none select-none text-5xl font-black tracking-[-.08em] blur-[9px] sm:text-7xl">
        {amount.toFixed(0)} <span className="text-base font-medium tracking-normal">BS</span>
      </p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[.22em] text-white/40">Precio reservado</p>
    </div>
  );
}

export default function PassCrewExperience({ onNavigate }: { onNavigate?: () => void }) {
  const { plans, selectedPlan, benefits, membership, loadLandingData, loadMyStatus, selectPlan } = usePassCrewStore();
  const { customer } = useCustomerAuthStore();

  useEffect(() => { loadLandingData(); }, [loadLandingData]);
  useEffect(() => { if (customer) loadMyStatus(customer.id); }, [customer, loadMyStatus]);

  return (
    <div className="bg-[#0d0d0c] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-5 py-20 sm:px-8 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(201,169,97,.13),transparent_32%),linear-gradient(115deg,transparent_0%,rgba(255,255,255,.025)_50%,transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-champagne"><span className="h-px w-8 bg-champagne" /> PASS CREW</motion.div>
            <motion.h1 variants={fadeUp} className="mt-8 max-w-3xl text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-[.78] tracking-[-.085em]">La tarjeta que<br /><span className="text-white/35">te abre la puerta.</span></motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-lg text-sm leading-6 text-white/55">Una membresía para quienes quieren vivir PASS más cerca: puntos x2, acceso anticipado y beneficios especiales.</motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
              <span className="inline-flex items-center border border-champagne/40 px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-champagne/75">Inscripciones cerradas</span>
              <Link onClick={onNavigate} to="/pass-crew/recompensas" className="inline-flex items-center gap-3 border border-white/20 px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-white/70">Ver beneficios</Link>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex justify-center lg:justify-end">
            <MembershipCardPreview memberName={customer?.full_name} memberNumber={customer?.customer_code || membership?.member_number} planName={membership?.plan_name_snapshot || 'PASS CREW'} memberSince={membership?.started_at ? new Date(membership.started_at).toLocaleDateString('es-BO', { month: 'short', year: 'numeric' }) : 'al activar'} />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="mb-12 flex items-end justify-between border-b border-white/10 pb-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-champagne">Tu membresía PASS</p><h2 className="mt-3 text-4xl font-black uppercase leading-[.85] tracking-[-.07em] sm:text-7xl">Elige tu acceso.</h2></div>
          <span className="hidden text-xs text-white/30 sm:block">DETALLES RESERVADOS</span>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {plans.map((plan, index) => (
            <button key={plan.id} type="button" onClick={() => selectPlan(plan)} className={`group flex w-full flex-col gap-5 py-7 text-left transition-colors sm:flex-row sm:items-end sm:justify-between sm:py-10 ${selectedPlan?.id === plan.id ? 'text-champagne' : 'text-white hover:text-champagne'}`}>
              <div className="flex items-start gap-6"><span className="pt-2 font-mono text-xs text-white/30">0{index + 1}</span><div><p className="text-[10px] uppercase tracking-[.3em] text-white/40">{plan.name} / {plan.code}</p><ReservedPrice amount={Number(plan.price)} /></div></div>
              <div className="flex items-center justify-between gap-8 sm:justify-end"><span className="text-xs uppercase tracking-[.2em] text-white/45">{plan.duration_months} meses</span><span className="text-2xl transition-transform group-hover:translate-x-2">→</span></div>
            </button>
          ))}
        </div>
        {selectedPlan && <div className="mt-16"><div className="mb-8 flex items-end justify-between"><h2 className="text-[10px] font-bold uppercase tracking-[.3em] text-white/45">Beneficios / {selectedPlan.name}</h2><span className="font-mono text-xs text-white/30">{benefits.length.toString().padStart(2, '0')}</span></div>{benefits.length ? <CrewBenefitsList benefits={benefits} /> : <p className="border-y border-white/10 py-8 text-sm text-white/40">Beneficios exclusivos configurados para miembros PASS Crew.</p>}</div>}
      </section>

      <section className="border-y border-white/10 bg-[#11110f] px-5 py-14 sm:px-6 sm:py-20"><div className="mx-auto max-w-5xl"><div className="mb-8"><p className="text-[10px] uppercase tracking-[.25em] text-champagne">PASS Crew</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-.05em] sm:text-5xl">Beneficios en preparación.</h2></div><p className="max-w-xl text-sm leading-6 text-white/55">Los detalles de inscripción y precio se anunciarán cuando la membresía esté lista para abrirse.</p></div></section>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20"><h2 className="mb-8 text-center text-[10px] uppercase tracking-[.25em] text-white/40 sm:mb-10 sm:text-xs sm:tracking-[.35em]">Preguntas frecuentes</h2><CrewFAQ /></section>
    </div>
  );
}
