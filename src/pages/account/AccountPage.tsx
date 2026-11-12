import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, LogOut, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCustomerAuthStore } from '../../store/customerAuthStore';
import { usePassCrewStore } from '../../store/passCrewStore';
import { CREW_MEMBERSHIP_LABELS, CREW_REQUEST_LABELS } from '../../lib/crewLabels';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { passCrewService } from '../../services/passCrewService';
import MembershipCardPreview from '../../components/pass-crew/MembershipCardPreview';
import type { CrewBenefit, LoyaltyCampaignNotice, LoyaltySummary, PurchaseHistoryItem } from '../../types';

function Purchases({ purchases, isLoading, failed }: { purchases: PurchaseHistoryItem[]; isLoading: boolean; failed: boolean }) {
  return (
    <motion.section variants={fadeUp} className="border-b border-white/10 py-12 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.3em] text-white/35">Tu historial</p>
          <h2 className="mt-4 text-4xl font-black uppercase tracking-[-.07em] sm:text-6xl">Tus prendas.</h2>
        </div>
        <span className="font-mono text-xs text-white/30">{String(purchases.length).padStart(2, '0')}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3 border-y border-white/10 py-4" aria-label="Cargando tus compras">
          {[0, 1, 2].map((row) => <div key={row} className="h-20 animate-pulse bg-white/[.04]" />)}
        </div>
      ) : failed ? (
        <p className="border-y border-white/10 py-8 text-sm leading-6 text-white/45">No pudimos cargar tu historial todavía. Vuelve a intentarlo en un momento.</p>
      ) : purchases.length ? (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {purchases.map((purchase) => (
            <Link key={`${purchase.sale_id}-${purchase.product_id}-${purchase.size || ''}`} to={`/product/${purchase.product_id}`} className="group grid grid-cols-[64px_minmax(0,1fr)_auto] gap-4 py-4 sm:grid-cols-[84px_minmax(0,1fr)_auto] sm:gap-5">
              <div className="aspect-square overflow-hidden bg-white/[.06]">
                {purchase.product_image_url ? <img src={purchase.product_image_url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <ShoppingBag className="m-auto h-full w-5 text-white/25" />}
              </div>
              <div className="min-w-0 self-center">
                <p className="truncate text-sm font-semibold uppercase tracking-[-.02em] sm:text-base">{purchase.product_name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/40">{new Date(purchase.sale_date).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}{purchase.size ? ` · Talla ${purchase.size}` : ''}{purchase.quantity > 1 ? ` · ${purchase.quantity} unidades` : ''}</p>
              </div>
              <p className="self-center text-right text-xs font-semibold text-white/75">Bs {Number(purchase.subtotal).toFixed(0)}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-y border-white/10 py-10 sm:flex sm:items-center sm:justify-between">
          <p className="max-w-sm text-sm leading-6 text-white/45">Todavía no tienes compras asociadas a esta cuenta.</p>
          <Link to="/shop" className="mt-5 inline-flex border-b border-white/30 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/80 sm:mt-0">Ver productos</Link>
        </div>
      )}
    </motion.section>
  );
}

export default function AccountPage() {
  const { customer, signOut } = useCustomerAuthStore();
  const { membership, scheduledMembership, activeRequest, isLoading, loadMyStatus } = usePassCrewStore();
  const [crewBenefits, setCrewBenefits] = useState<CrewBenefit[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [campaign, setCampaign] = useState<LoyaltyCampaignNotice | null>(null);
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [purchasesFailed, setPurchasesFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (customer) loadMyStatus(customer.id); }, [customer, loadMyStatus]);
  useEffect(() => { if (membership?.plan_id) passCrewService.getCrewBenefits(membership.plan_id).then(setCrewBenefits).catch(() => setCrewBenefits([])); else setCrewBenefits([]); }, [membership?.plan_id]);
  useEffect(() => { if (customer) passCrewService.getMyLoyaltySummary(customer.id).then(setLoyalty).catch(() => setLoyalty(null)); }, [customer]);
  useEffect(() => { if (customer) passCrewService.getLoyaltyCampaignNotice(customer.id).then(setCampaign).catch(() => setCampaign(null)); }, [customer]);
  useEffect(() => {
    if (!customer) return;
    setPurchasesLoading(true);
    setPurchasesFailed(false);
    passCrewService.getMyPurchaseHistory().then(setPurchases).catch(() => { setPurchases([]); setPurchasesFailed(true); }).finally(() => setPurchasesLoading(false));
  }, [customer]);

  const memberSince = membership?.started_at ? new Date(membership.started_at).toLocaleDateString('es-BO', { month: 'short', year: 'numeric' }) : '—';
  const handleSignOut = async () => { await signOut(); navigate('/'); };

  return <main className="min-h-screen bg-[#0d0d0c] text-white"><motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12 lg:px-12">
    <motion.div variants={fadeUp} className="flex items-center justify-between border-b border-white/10 pb-5"><Link to="/" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/45 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Volver a PASS</Link><span className="hidden text-[10px] uppercase tracking-[.3em] text-white/30 sm:block">PASS / MI CUENTA</span></motion.div>
    <motion.header variants={fadeUp} className="flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-20"><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[.3em] text-champagne">Mi PASS</p><h1 className="text-[clamp(4rem,10vw,9rem)] font-black uppercase leading-[.76] tracking-[-.09em]">Hola,<br /><span className="text-white/35">{customer?.first_name || customer?.full_name?.split(' ')[0] || 'miembro'}.</span></h1></div><button onClick={handleSignOut} className="inline-flex w-fit items-center gap-2 border-b border-white/20 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/45 hover:border-white hover:text-white"><LogOut className="h-3.5 w-3.5" /> Cerrar sesión</button></motion.header>

    <Purchases purchases={purchases} isLoading={purchasesLoading} failed={purchasesFailed} />

    {membership?.status === 'active' && <motion.section variants={fadeUp} className="grid items-center gap-12 border-b border-white/10 py-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20 lg:py-16"><div className="flex justify-center lg:justify-start"><MembershipCardPreview memberName={customer?.full_name} memberNumber={customer?.customer_code} planName={membership.plan_name_snapshot} memberSince={memberSince} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-champagne">Membresía activa / {CREW_MEMBERSHIP_LABELS[membership.status]}</p><h2 className="mt-5 text-4xl font-black uppercase leading-[.85] tracking-[-.07em] sm:text-7xl">Tu acceso<br /><span className="text-white/35">está activo.</span></h2><div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-6"><div><p className="text-[10px] uppercase tracking-[.2em] text-white/35">Plan</p><p className="mt-2 text-sm font-medium">{membership.plan_name_snapshot}</p></div><div><p className="text-[10px] uppercase tracking-[.2em] text-white/35">Vence</p><p className="mt-2 text-sm font-medium">{new Date(membership.expires_at).toLocaleDateString('es-BO')}</p></div></div><div className="mt-8 flex flex-wrap gap-5"><Link to="/pass-crew/recompensas" className="inline-flex items-center gap-3 border-b border-champagne pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-champagne">Ver recompensas <ArrowUpRight className="h-4 w-4" /></Link>{!scheduledMembership && <Link to="/pass-crew/join" className="inline-flex items-center gap-3 border-b border-white/25 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-white/55">Renovar <ArrowUpRight className="h-4 w-4" /></Link>}</div></div></motion.section>}
    {loyalty?.enabled && <motion.section variants={fadeUp} className="border-b border-white/10 py-12 sm:py-16"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-champagne">Fidelidad PASS</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-.07em] sm:text-6xl">Tus puntos.</h2>{campaign && <p className="mt-4 text-xs font-semibold uppercase tracking-[.18em] text-champagne">{campaign.audience === 'crew_only' ? 'PASS Crew · ' : ''}Hoy tus compras suman x{Number(campaign.multiplier).toLocaleString('es-BO')} puntos</p>}</div><div className="sm:text-right"><p className="font-mono text-6xl font-bold tracking-[-.1em] sm:text-8xl">{loyalty.points_balance.toLocaleString('es-BO')}</p><p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/35">Puntos disponibles</p></div></div><div className="mt-8 flex flex-col border-t border-white/10">{loyalty.transactions.slice(0, 3).map(item => <div key={item.id} className="flex items-center justify-between border-b border-white/10 py-4 text-sm"><span className="text-white/55">{item.reason}</span><strong className={item.points > 0 ? 'text-champagne' : 'text-red-300'}>{item.points > 0 ? '+' : ''}{item.points} pts</strong></div>)}</div></motion.section>}
    {membership?.status === 'active' && <motion.section variants={fadeUp} className="border-b border-white/10 py-12 sm:py-16"><div className="mb-8 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.3em] text-champagne">Tu Crew</p><h2 className="mt-4 text-4xl font-black uppercase tracking-[-.07em] sm:text-6xl">Tus beneficios.</h2></div><span className="font-mono text-xs text-white/30">{crewBenefits.length.toString().padStart(2, '0')}</span></div>{crewBenefits.length ? <div className="divide-y divide-white/10 border-y border-white/10">{crewBenefits.map((item, index) => <div key={item.id} className="grid gap-3 py-6 sm:grid-cols-[70px_1fr_auto] sm:items-center"><span className="font-mono text-xs text-champagne">0{index + 1}</span><div><p className="text-lg font-semibold">{item.name}</p>{item.description && <p className="mt-1 text-sm text-white/45">{item.description}</p>}</div><span className="text-[10px] uppercase tracking-[.2em] text-white/30">{item.benefit_type.replace(/_/g, ' ')}</span></div>)}</div> : <p className="border-y border-white/10 py-8 text-sm text-white/45">Beneficios exclusivos configurados para miembros PASS Crew.</p>}</motion.section>}
    {isLoading && <p className="border-b border-white/10 py-8 text-sm text-white/40">Cargando tu membresía...</p>}
    {!isLoading && !membership && <motion.section variants={fadeUp} className="border-y border-white/10 py-14"><p className="text-[10px] uppercase tracking-[.3em] text-champagne">PASS Crew</p><h2 className="mt-5 max-w-2xl text-4xl font-black uppercase leading-[.85] tracking-[-.07em] sm:text-7xl">Tu tarjeta<br /><span className="text-white/35">te está esperando.</span></h2>{activeRequest ? <><p className="mt-6 text-sm text-white/55">{CREW_REQUEST_LABELS[activeRequest.status]}.</p><Link to="/pass-crew/status" className="mt-8 inline-flex border-b border-champagne pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-champagne">Ver solicitud →</Link></> : <Link to="/pass-crew" className="mt-8 inline-flex border-b border-champagne pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-champagne">Conocer PASS Crew →</Link>}</motion.section>}
    <motion.div variants={fadeUp} className="flex justify-between border-t border-white/10 pt-5 text-[10px] uppercase tracking-[.18em] text-white/30"><span>{customer?.customer_code}</span><span>PASS Clothing / Bolivia</span></motion.div>
  </motion.div></main>;
}
