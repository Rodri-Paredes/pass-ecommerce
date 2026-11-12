import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  LockKeyhole,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { passCrewService } from '../services/passCrewService';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import type { CustomerProfile, LoyaltySummary } from '../types';

const ACCESS_POINTS = 300;
const WELCOME_POINTS = 20;

function PassFridayCard({ customer, points }: { customer: CustomerProfile; points: number }) {
  const [copied, setCopied] = useState(false);
  const remaining = Math.max(ACCESS_POINTS - points, 0);
  const unlocked = remaining === 0;
  const progress = Math.min((points / ACCESS_POINTS) * 100, 100);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(customer.customer_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="relative overflow-hidden border border-[#f0442f]/80 bg-[#f0442f] p-6 text-black shadow-[0_28px_60px_-35px_rgba(240,68,47,.8)] sm:p-8">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[28px] border-black/10" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.3em] text-black/55">Tu tarjeta</p>
            <p className="mt-1 text-2xl font-black uppercase tracking-[-.06em]">PASS Friday</p>
          </div>
          <span className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] ${unlocked ? 'border-black bg-black text-white' : 'border-black/30 text-black/70'}`}>
            {unlocked ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
            {unlocked ? 'Acceso habilitado' : 'En progreso'}
          </span>
        </div>

        <div className="mt-12">
          <p className="truncate text-xl font-bold tracking-[-.03em]">{customer.full_name}</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[.22em] text-black/55">Titular de la cuenta</p>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4 border-t border-black/25 pt-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.22em] text-black/55">Código PASS</p>
            <p className="mt-1 font-mono text-lg font-bold tracking-[.16em]">{customer.customer_code}</p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 border-b border-black pb-1 text-[9px] font-bold uppercase tracking-[.16em]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className="mt-8 border-t border-black/25 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-black/55">Puntos acumulados</p>
              <p className="mt-1 font-mono text-5xl font-bold tracking-[-.1em]">{points.toLocaleString('es-BO')}</p>
            </div>
            <p className="pb-1 text-right text-xs font-bold">de {ACCESS_POINTS} pts</p>
          </div>
          <div className="mt-4 h-2 bg-black/15" aria-label={`${points} de ${ACCESS_POINTS} puntos`}>
            <div className="h-full bg-black transition-[width] duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-xs leading-5 text-black/70">
            {unlocked
              ? 'Ya puedes comprar con los beneficios de PASS Friday.'
              : `Te faltan ${remaining.toLocaleString('es-BO')} puntos para habilitar tu acceso.`}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PassFridayPage() {
  const { customer, isAuthenticated, isLoading } = useCustomerAuthStore();
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (!customer) {
      setLoyalty(null);
      return;
    }

    setLoadingPoints(true);
    passCrewService
      .getMyLoyaltySummary(customer.id)
      .then(setLoyalty)
      .catch(() => setLoyalty(null))
      .finally(() => setLoadingPoints(false));
  }, [customer]);

  const points = loyalty?.points_balance ?? 0;
  return (
    <main className="min-h-screen bg-[#0a0a09] text-white">
      <section className="border-b border-white/10 bg-[#f0442f] text-black">
        <div className="pass-container py-6 sm:py-9">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-black/65 transition hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Volver a PASS
          </Link>
          <div className="grid gap-10 pb-10 pt-14 sm:pb-14 sm:pt-20 lg:grid-cols-[1.18fr_.82fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.24em] text-black/60">PASS Friday / Tu acceso</p>
              <h1 className="mt-5 max-w-3xl text-[clamp(3.8rem,9vw,8.5rem)] font-black uppercase leading-[.78] tracking-[-.08em]">
                Suma.<br />
                <span className="text-white">Entra.</span>
              </h1>
            </div>
            <p className="max-w-md text-sm font-medium leading-6 text-black/70 sm:text-base">
              Crea tu cuenta PASS, recibe {WELCOME_POINTS} puntos de bienvenida y acumula en cada compra. Al llegar a {ACCESS_POINTS} puntos, tu acceso a PASS Friday queda habilitado.
            </p>
          </div>
        </div>
      </section>

      <section className="pass-container grid gap-12 py-14 sm:py-20 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div className="order-2 lg:order-1">
          <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#f0442f]">La regla de puntos</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[.84] tracking-[-.065em] sm:text-6xl">
            Tu compra<br />
            <span className="text-white/35">te acerca.</span>
          </h2>

          <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
            <div className="grid grid-cols-[58px_1fr] gap-4 py-5">
              <span className="font-mono text-sm font-bold text-[#f0442f]">01</span>
              <div>
                <p className="text-lg font-semibold">Crea tu cuenta y recibe {WELCOME_POINTS} puntos</p>
                <p className="mt-1 text-sm leading-6 text-white/50">Es tu bono de bienvenida para empezar a sumar.</p>
              </div>
            </div>
            <div className="grid grid-cols-[58px_1fr] gap-4 py-5">
              <span className="font-mono text-sm font-bold text-[#f0442f]">02</span>
              <div>
                <p className="text-lg font-semibold">Compra y suma puntos</p>
                <p className="mt-1 text-sm leading-6 text-white/50">Cada compra registrada te acerca a tu acceso.</p>
              </div>
            </div>
            <div className="grid grid-cols-[58px_1fr] gap-4 py-5">
              <span className="font-mono text-sm font-bold text-[#f0442f]">03</span>
              <div>
                <p className="text-lg font-semibold">Di tu código, celular o CI</p>
                <p className="mt-1 text-sm leading-6 text-white/50">En caja asociamos tu compra a tu cuenta PASS.</p>
              </div>
            </div>
            <div className="grid grid-cols-[58px_1fr] gap-4 py-5">
              <span className="font-mono text-sm font-bold text-[#f0442f]">04</span>
              <div>
                <p className="text-lg font-semibold">{ACCESS_POINTS} puntos activan PASS Friday</p>
                <p className="mt-1 text-sm leading-6 text-white/50">Suma hasta desbloquear tu acceso a la campaña.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-l-2 border-[#f0442f] pl-5">
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f0442f]">PASS Crew / Membresía pagada</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/65">
              Si quieres más, PASS Crew suma puntos x2, acceso anticipado a drops, más días de PASS Friday y envíos gratis.
            </p>
            <Link to="/pass-crew" className="mt-5 inline-flex items-center gap-2 border-b border-white/35 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/80 transition hover:border-[#f0442f] hover:text-[#f0442f]">
              Conocer PASS Crew <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          {isLoading || loadingPoints ? (
            <div className="min-h-[420px] animate-pulse border border-white/10 bg-white/[.03]" aria-label="Cargando tu PASS Friday" />
          ) : isAuthenticated && customer ? (
            <PassFridayCard customer={customer} points={points} />
          ) : (
            <div className="border border-white/15 bg-white/[.035] p-7 sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#f0442f]">Tu PASS Friday empieza aquí</p>
              <h2 className="mt-5 max-w-lg text-4xl font-black uppercase leading-[.86] tracking-[-.065em] sm:text-6xl">
                Crea tu cuenta.<br />
                <span className="text-white/35">Suma desde hoy.</span>
              </h2>
              <p className="mt-7 max-w-md text-sm leading-6 text-white/55">
                Tu cuenta te da un código PASS único, {WELCOME_POINTS} puntos de bienvenida y un lugar donde ver tus puntos acumulados antes de Black Friday.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup?redirect=/pass-friday" className="inline-flex items-center justify-center gap-3 bg-[#f0442f] px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-black transition hover:bg-white">
                  Crear mi PASS <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" state={{ from: '/pass-friday' }} className="inline-flex items-center justify-center border border-white/25 px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-white/75 transition hover:border-white hover:text-white">
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
