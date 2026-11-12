import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Crown,
  Lock,
  PackageOpen,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { passCrewService } from '../services/passCrewService';
import { useCustomerAuthStore } from '../store/customerAuthStore';
import type { LoyaltyReward, LoyaltySummary } from '../types';

type PassFridayBenefit = {
  title: string;
  label: string;
  description: string;
  note: string;
  icon: LucideIcon;
};

const passFridayBenefits: PassFridayBenefit[] = [
  {
    title: 'Black Friday habilitado',
    label: 'CUENTA PASS GRATUITA',
    description:
      'Regístrate, acumula 300 puntos o más y accede a los precios especiales de PASS Friday.',
    note: '300 puntos mínimo',
    icon: BadgeCheck,
  },
  {
    title: 'Puntos x2',
    label: 'MEMBRESÍA PASS CREW',
    description:
      'Tus compras acumulan el doble de puntos mientras tu membresía esté activa.',
    note: 'Beneficio adicional',
    icon: Sparkles,
  },
  {
    title: 'Drops antes que todos',
    label: 'MEMBRESÍA PASS CREW',
    description:
      'Conoce y compra las nuevas colecciones antes de que se abran al resto.',
    note: 'Beneficio adicional',
    icon: PackageOpen,
  },
  {
    title: 'Más días de PASS Friday',
    label: 'MEMBRESÍA PASS CREW',
    description:
      'Tu acceso a la campaña se abre antes y se mantiene por más tiempo.',
    note: 'Beneficio adicional',
    icon: CalendarDays,
  },
  {
    title: 'Envío gratis',
    label: 'MEMBRESÍA PASS CREW',
    description:
      'Recibe tus pedidos sin costo de envío dentro de Bolivia.',
    note: 'Beneficio adicional',
    icon: Truck,
  },
];

export default function RewardsCatalogPage() {
  const { customer, isAuthenticated } = useCustomerAuthStore();
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);

  useEffect(() => {
    passCrewService.getPublicRewards().then(setRewards).catch(() => setRewards([]));
  }, []);

  useEffect(() => {
    if (!customer) {
      setLoyalty(null);
      return;
    }

    passCrewService.getMyLoyaltySummary(customer.id).then(setLoyalty).catch(() => setLoyalty(null));
  }, [customer]);

  return (
    <main className="min-h-[75vh] bg-[#0d0d0c] px-5 py-20 text-white sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col justify-between gap-10 border-b border-white/10 pb-12 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.3em] text-[#f34a36]">
              <Sparkles className="h-4 w-4" /> PASS Friday / Beneficios
            </p>
            <h1 className="mt-6 text-[clamp(3.6rem,9vw,8rem)] font-black uppercase leading-[.8] tracking-[-.08em]">
              Tus puntos<br />
              <span className="text-white/35">abren más.</span>
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
              Crea tu cuenta PASS gratis y llega a 300 puntos para habilitar Black Friday. PASS
              Crew es una suscripción aparte con ventajas adicionales.
            </p>
          </div>

          {loyalty?.enabled && (
            <div className="border-l border-[#f34a36] pl-5 sm:text-right">
              <p className="font-mono text-6xl font-bold tracking-[-.1em]">
                {loyalty.points_balance.toLocaleString('es-BO')}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[.25em] text-white/35">
                Puntos disponibles
              </p>
            </div>
          )}
        </header>

        <section className="mt-16" aria-labelledby="pass-friday-benefits">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#f34a36]">
                27.11 / Campaña especial
              </p>
              <h2
                id="pass-friday-benefits"
                className="mt-3 text-3xl font-black uppercase tracking-[-.06em] sm:text-5xl"
              >
                Tu acceso y tus extras.
              </h2>
            </div>
            <span className="hidden font-mono text-xs text-white/30 sm:block">{passFridayBenefits.length.toString().padStart(2, '0')} BENEFICIOS</span>
          </div>

          <div className="grid border-y border-white/10 sm:grid-cols-2">
            {passFridayBenefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className={`group relative min-h-64 overflow-hidden px-6 py-7 sm:px-8 sm:py-9 ${
                    index % 2 === 0 ? 'sm:border-r sm:border-white/10' : ''
                  } ${index < passFridayBenefits.length - 1 ? 'border-b border-white/10' : ''}`}
                >
                  <div className="absolute right-5 top-4 font-mono text-7xl font-black tracking-[-.12em] text-white/[.035] transition-colors group-hover:text-[#f34a36]/10">
                    0{index + 1}
                  </div>
                  <BenefitIcon className="relative h-5 w-5 text-[#f34a36]" strokeWidth={1.5} />
                  <p className="relative mt-8 text-[10px] font-bold uppercase tracking-[.24em] text-[#f34a36]">
                    {benefit.label}
                  </p>
                  <h3 className="relative mt-3 text-2xl font-semibold tracking-[-.04em]">
                    {benefit.title}
                  </h3>
                  <p className="relative mt-4 max-w-md text-sm leading-6 text-white/50">
                    {benefit.description}
                  </p>
                  <p className="relative mt-7 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-white/35">
                    {benefit.note}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {rewards.length > 0 && (
          <section className="mt-20" aria-labelledby="points-rewards">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.3em] text-champagne">
                  Catálogo permanente
                </p>
                <h2
                  id="points-rewards"
                  className="mt-3 text-3xl font-black uppercase tracking-[-.06em] sm:text-5xl"
                >
                  Canjea tus puntos.
                </h2>
              </div>
              <span className="font-mono text-xs text-white/30">
                {rewards.length.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {rewards.map((reward, index) => (
                <article
                  key={reward.id}
                  className="grid gap-5 py-7 sm:grid-cols-[70px_1fr_auto] sm:items-center"
                >
                  <span className="font-mono text-xs text-champagne">0{index + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{reward.name}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-5 text-white/45">{reward.description}</p>
                    <p className="mt-4 font-mono text-xs tracking-[.15em] text-champagne">
                      {reward.points_cost.toLocaleString('es-BO')} PTS
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-3 border border-champagne/50 px-5 py-3 text-[10px] font-bold uppercase tracking-[.16em] text-champagne opacity-90"
                  >
                    Canjear <Lock className="h-3.5 w-3.5" />
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-white/65">
              {isAuthenticated
                ? 'Tu código PASS, celular o CI permite validar tus compras en caja.'
                : 'Crea tu cuenta PASS ahora y deja listo tu código para la campaña.'}
            </p>
            <p className="mt-2 text-xs text-white/35">
              Para habilitar PASS Friday necesitas una cuenta PASS y 300 puntos o más.
            </p>
          </div>
          <Link
            to={isAuthenticated ? '/account' : '/signup?redirect=/pass-crew/recompensas'}
            className="inline-flex items-center gap-3 bg-[#f34a36] px-6 py-4 text-[10px] font-bold uppercase tracking-[.18em] text-black transition-colors hover:bg-white"
          >
            {isAuthenticated ? 'Ver mis puntos' : 'Crear mi PASS'} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mt-5 flex items-center gap-2 text-xs text-white/30">
          <Crown className="h-3.5 w-3.5 text-champagne" /> PASS Crew es una suscripción pagada con beneficios adicionales al acceso Black Friday.
        </p>
      </div>
    </main>
  );
}
