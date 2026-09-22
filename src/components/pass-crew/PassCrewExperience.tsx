import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { usePassCrewStore } from '../../store/passCrewStore';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import CrewBenefitsList from './CrewBenefitsList';
import CrewFAQ from './CrewFAQ';
import MembershipCardPreview from './MembershipCardPreview';
import { fadeUp, staggerContainer } from '../../lib/motion';

export default function PassCrewExperience({ onNavigate }: { onNavigate?: () => void }) {
  const { plans, selectedPlan, benefits, membership, activeRequest, isLoading, loadLandingData, loadMyStatus, selectPlan } = usePassCrewStore();
  const { customer, isAuthenticated } = useCustomerAuthStore();
  useEffect(() => { loadLandingData(); }, [loadLandingData]);
  useEffect(() => { if (customer) loadMyStatus(customer.id); }, [customer, loadMyStatus]);
  const destination = !isAuthenticated ? '/signup?redirect=/pass-crew/join' : membership?.status === 'active' ? '/account' : activeRequest ? '/pass-crew/status' : '/pass-crew/join';
  const label = membership?.status === 'active' ? 'Ver mi membresía' : activeRequest ? 'Ver mi solicitud' : 'Elegir este plan';
  return <div className="bg-pass-black text-pass-white">
    <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden px-5 py-20 text-center sm:min-h-[78svh] sm:px-6 sm:py-28"><div className="absolute h-[22rem] w-[22rem] rounded-full bg-champagne/10 blur-[100px] sm:h-[34rem] sm:w-[34rem] sm:blur-[120px]"/><motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative max-w-4xl"><motion.div variants={fadeUp} className="mb-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.28em] text-champagne sm:mb-6 sm:text-xs sm:tracking-[.4em]"><Crown className="h-4 w-4 sm:h-5 sm:w-5"/> Membresía PASS</motion.div><motion.h1 variants={fadeUp} className="font-display text-[clamp(3.5rem,18vw,6rem)] leading-[.88] tracking-tight sm:text-8xl lg:text-9xl">PASS CREW</motion.h1><motion.p variants={fadeUp} className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/55 sm:mt-6">Elige la duración de tu membresía. Los beneficios visibles son los que PASS haya configurado para cada plan.</motion.p></motion.div></section>
    <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20"><div className="grid gap-3 md:grid-cols-2">{plans.map(plan => <button key={plan.id} onClick={() => selectPlan(plan)} className={`p-5 text-left transition-colors sm:p-7 ${selectedPlan?.id === plan.id ? 'border border-champagne bg-white/[.06]' : 'border border-white/10 bg-white/[.02] hover:border-white/25'}`}><p className="text-[10px] uppercase tracking-[.25em] text-white/40 sm:text-xs sm:tracking-[.3em]">{plan.name}</p><p className="mt-4 font-display text-4xl sm:mt-5 sm:text-5xl">Bs {Number(plan.price).toFixed(0)}</p><p className="mt-2 text-sm text-white/45">{plan.duration_months} meses</p></button>)}</div>{selectedPlan && <div className="mt-10 sm:mt-14"><h2 className="mb-6 text-center text-[10px] uppercase tracking-[.25em] text-white/40 sm:mb-8 sm:text-xs sm:tracking-[.35em]">Beneficios configurados · {selectedPlan.name}</h2>{benefits.length ? <CrewBenefitsList benefits={benefits}/> : <p className="text-center text-sm text-white/40">Los beneficios de este plan serán publicados por PASS.</p>}<div className="mt-9 text-center sm:mt-12"><Link onClick={onNavigate} to={destination} className="inline-flex max-w-full justify-center bg-champagne px-7 py-4 text-center text-[10px] font-bold uppercase tracking-[.15em] text-black hover:bg-white sm:px-10 sm:text-xs sm:tracking-[.18em]">{isLoading ? 'Cargando…' : label}</Link></div></div>}</section>
    <section className="border-y border-white/10 px-5 py-14 sm:px-6 sm:py-20"><MembershipCardPreview memberName={customer?.full_name} memberNumber={membership?.member_number}/></section>
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20"><h2 className="mb-8 text-center text-[10px] uppercase tracking-[.25em] text-white/40 sm:mb-10 sm:text-xs sm:tracking-[.35em]">Preguntas frecuentes</h2><CrewFAQ/></section>
  </div>;
}
