import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Crown, LogOut, Mail, Phone, UserRound } from 'lucide-react';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { usePassCrewStore } from '../../store/passCrewStore';
import { CREW_MEMBERSHIP_LABELS, CREW_REQUEST_LABELS } from '../../lib/crewLabels';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { passCrewService } from '../../services/passCrewService';
import type { CrewBenefit } from '../../types';

export default function AccountPage() {
  const { customer, signOut } = useCustomerAuthStore();
  const { membership, scheduledMembership, activeRequest, requests, isLoading, loadMyStatus } = usePassCrewStore();
  const [crewBenefits, setCrewBenefits] = useState<CrewBenefit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (customer) {
      loadMyStatus(customer.id);
    }
  }, [customer, loadMyStatus]);

  useEffect(() => {
    if (membership?.plan_id) passCrewService.getCrewBenefits(membership.plan_id).then(setCrewBenefits).catch(() => setCrewBenefits([]));
    else setCrewBenefits([]);
  }, [membership?.plan_id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-[#f3f1ec] pb-16 text-black sm:pb-24">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
        <motion.div variants={fadeUp} className="flex items-center justify-between border-b border-black/10 pb-5">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-black/45 transition-colors hover:text-black"><ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio</Link>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[.25em] text-black/35 sm:block">PASS / Account</span>
        </motion.div>

        <motion.header variants={fadeUp} className="flex flex-col justify-between gap-6 py-10 sm:flex-row sm:items-end sm:py-16">
          <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[.3em] text-black/40">Tu espacio PASS</p><h1 className="text-[clamp(3.4rem,9vw,7.5rem)] font-black uppercase leading-[.78] tracking-[-.075em]">Mi cuenta</h1></div>
          <div className="flex items-center gap-3 text-xs text-black/50"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Cuenta activa</div>
        </motion.header>

        <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
          <motion.section variants={fadeUp} className="flex flex-col justify-between bg-white p-6 shadow-[0_18px_50px_rgba(20,18,14,.06)] sm:p-8">
            <div>
              <div className="mb-8 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-black/40">Perfil</p><h2 className="mt-2 text-2xl font-bold tracking-[-.04em]">Datos personales</h2></div><div className="grid h-10 w-10 place-items-center rounded-full bg-[#f3f1ec]"><UserRound className="h-4 w-4" /></div></div>
              <div className="border-y border-black/10 py-5"><p className="text-[10px] uppercase tracking-[.2em] text-black/40">Mi código PASS</p><p className="mt-2 font-mono text-2xl tracking-[-.04em]">{customer?.customer_code}</p><p className="mt-2 text-xs leading-5 text-black/45">Usa este código en tienda para identificar tu cuenta y tus beneficios.</p></div>
              <div className="mt-6 space-y-5"><div className="flex gap-3"><UserRound className="mt-0.5 h-4 w-4 text-black/35" /><div><p className="text-[10px] uppercase tracking-[.18em] text-black/40">Nombre</p><p className="mt-1 text-sm font-medium">{customer?.full_name}</p></div></div><div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 text-black/35" /><div className="min-w-0"><p className="text-[10px] uppercase tracking-[.18em] text-black/40">Email</p><p className="mt-1 truncate text-sm font-medium">{customer?.email}</p></div></div>{customer?.phone && <div className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 text-black/35" /><div><p className="text-[10px] uppercase tracking-[.18em] text-black/40">Teléfono</p><p className="mt-1 text-sm font-medium">{customer.phone}</p></div></div>}</div>
            </div>
            <motion.button variants={fadeUp} onClick={handleSignOut} className="mt-10 inline-flex w-fit items-center gap-2 border-b border-black/20 pb-1 text-[10px] font-bold uppercase tracking-[.18em] text-black/45 transition-colors hover:border-black hover:text-black"><LogOut className="h-3.5 w-3.5" /> Cerrar sesión</motion.button>
          </motion.section>

          <motion.section variants={fadeUp} className="relative min-h-[390px] overflow-hidden bg-[#11110f] p-6 text-white shadow-[0_18px_50px_rgba(20,18,14,.12)] sm:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-champagne/15 blur-3xl" /><div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-champagne/10 blur-3xl" />
            <div className="relative flex h-full flex-col"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-champagne">Membresía</p><h2 className="mt-2 text-3xl font-black uppercase tracking-[-.06em]">PASS Crew</h2></div><Crown className="h-7 w-7 text-champagne" /></div>
              {isLoading ? <p className="mt-12 text-sm text-white/40">Cargando membresía...</p> : membership && membership.status === 'active' ? <div className="mt-auto pt-12"><div className="mb-6 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-champagne" /><span className="text-xs font-semibold uppercase tracking-[.18em] text-champagne">{CREW_MEMBERSHIP_LABELS[membership.status]}</span></div><div className="grid grid-cols-2 gap-5 border-y border-white/15 py-5"><div><p className="text-[10px] uppercase tracking-[.18em] text-white/40">Miembro</p><p className="mt-2 font-mono text-sm">{membership.member_number}</p></div><div><p className="text-[10px] uppercase tracking-[.18em] text-white/40">Plan</p><p className="mt-2 text-sm font-medium">{membership.plan_name_snapshot}</p></div><div className="col-span-2"><p className="text-[10px] uppercase tracking-[.18em] text-white/40">Vencimiento</p><p className="mt-2 text-sm font-medium">{new Date(membership.expires_at).toLocaleDateString('es-BO')}</p></div></div>{crewBenefits.length > 0 && <div className="mt-5"><p className="mb-3 text-[10px] uppercase tracking-[.2em] text-white/40">Tus beneficios</p><div className="flex flex-wrap gap-2">{crewBenefits.map(item => <span key={item.id} className="border border-white/15 px-3 py-2 text-xs text-white/75">{item.name}</span>)}</div></div>}{scheduledMembership ? <p className="mt-5 text-xs text-champagne">Renovación {scheduledMembership.plan_name_snapshot} programada.</p> : !activeRequest && <Link to="/pass-crew/join" className="mt-6 inline-flex w-fit items-center gap-2 border-b border-champagne pb-1 text-[10px] font-bold uppercase tracking-[.18em] text-champagne">Renovar membresía <ArrowUpRight className="h-3.5 w-3.5" /></Link>}</div> : activeRequest ? <div className="mt-auto pt-16"><p className="text-xs font-semibold uppercase tracking-[.18em] text-champagne">{CREW_REQUEST_LABELS[activeRequest.status]}</p><p className="mt-3 max-w-sm text-sm leading-6 text-white/55">Tu solicitud está siendo revisada por el equipo PASS.</p><Link to="/pass-crew/status" className="mt-6 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[10px] font-bold uppercase tracking-[.18em]">Ver estado <ArrowUpRight className="h-3.5 w-3.5" /></Link></div> : <div className="mt-auto pt-16"><p className="text-sm text-white/55">Accede a beneficios exclusivos, precios especiales y tu membresía digital.</p><Link to="/pass-crew" className="mt-6 inline-flex items-center gap-2 bg-champagne px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-black transition-colors hover:bg-white"><Crown className="h-3.5 w-3.5" /> Conocer PASS Crew</Link></div>}
              {!activeRequest && requests[0]?.status === 'rejected' && <p className="relative mt-5 text-xs text-red-300">La última solicitud fue rechazada. Puedes iniciar una nueva.</p>}
            </div>
          </motion.section>
        </div>
        <motion.div variants={fadeUp} className="mt-5 flex items-center justify-between border-t border-black/10 pt-5 text-[10px] uppercase tracking-[.18em] text-black/35"><span>PASS Clothing · Bolivia</span><Link to="/pass-crew" className="transition-colors hover:text-black">Descubre PASS Crew →</Link></motion.div>
      </motion.div>
    </main>
  );
}
