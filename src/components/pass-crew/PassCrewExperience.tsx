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
    <section className="relative flex min-h-[78svh] items-center justify-center overflow-hidden px-6 py-28 text-center"><div className="absolute h-[34rem] w-[34rem] rounded-full bg-champagne/10 blur-[120px]"/><motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative max-w-4xl"><motion.div variants={fadeUp} className="mb-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[.4em] text-champagne"><Crown className="h-5 w-5"/> Membresía PASS</motion.div><motion.h1 variants={fadeUp} className="font-display text-6xl tracking-tight sm:text-8xl lg:text-9xl">PASS CREW</motion.h1><motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-white/55">Elige la duración de tu membresía. Los beneficios visibles son los que PASS haya configurado para cada plan.</motion.p></motion.div></section>
    <section className="mx-auto max-w-5xl px-6 py-20"><div className="grid gap-4 md:grid-cols-2">{plans.map(plan => <button key={plan.id} onClick={() => selectPlan(plan)} className={`p-7 text-left transition-colors ${selectedPlan?.id === plan.id ? 'border border-champagne bg-white/[.06]' : 'border border-white/10 bg-white/[.02] hover:border-white/25'}`}><p className="text-xs uppercase tracking-[.3em] text-white/40">{plan.name}</p><p className="mt-5 font-display text-5xl">Bs {Number(plan.price).toFixed(0)}</p><p className="mt-2 text-sm text-white/45">{plan.duration_months} meses</p></button>)}</div>{selectedPlan && <div className="mt-14"><h2 className="mb-8 text-center text-xs uppercase tracking-[.35em] text-white/40">Beneficios configurados · {selectedPlan.name}</h2>{benefits.length ? <CrewBenefitsList benefits={benefits}/> : <p className="text-center text-sm text-white/40">Los beneficios de este plan serán publicados por PASS.</p>}<div className="mt-12 text-center"><Link onClick={onNavigate} to={destination} className="inline-flex bg-champagne px-10 py-4 text-xs font-bold uppercase tracking-[.18em] text-black hover:bg-white">{isLoading ? 'Cargando…' : label}</Link></div></div>}</section>
    <section className="border-y border-white/10 px-6 py-20"><MembershipCardPreview memberName={customer?.full_name} memberNumber={membership?.member_number}/></section>
    <section className="mx-auto max-w-3xl px-6 py-20"><h2 className="mb-10 text-center text-xs uppercase tracking-[.35em] text-white/40">Preguntas frecuentes</h2><CrewFAQ/></section>
  </div>;
}
