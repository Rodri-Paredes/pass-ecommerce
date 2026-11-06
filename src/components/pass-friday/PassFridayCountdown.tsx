import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PASS_FRIDAY_START = new Date('2026-11-27T00:00:00-04:00').getTime();

type RemainingTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasStarted: boolean;
};

function getRemainingTime(): RemainingTime {
  const remaining = Math.max(0, PASS_FRIDAY_START - Date.now());
  const hasStarted = remaining === 0;

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    hasStarted,
  };
}

function useRemainingTime() {
  const [remainingTime, setRemainingTime] = useState(getRemainingTime);

  useEffect(() => {
    const timer = window.setInterval(() => setRemainingTime(getRemainingTime()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  return remainingTime;
}

function Unit({ value, label, compact = false, labelClassName }: { value: number; label: string; compact?: boolean; labelClassName: string }) {
  return (
    <span className="flex flex-col">
      <strong className={compact ? 'text-sm leading-none tabular-nums' : 'text-3xl leading-none tabular-nums sm:text-5xl'}>{String(value).padStart(2, '0')}</strong>
      <span className={compact ? `mt-1 text-[7px] font-bold uppercase tracking-[.12em] ${labelClassName}` : `mt-2 text-[8px] font-bold uppercase tracking-[.2em] ${labelClassName}`}>{label}</span>
    </span>
  );
}

export function PassFridayTime({ compact = false, tone = 'light' }: { compact?: boolean; tone?: 'light' | 'dark' }) {
  const { days, hours, minutes, seconds, hasStarted } = useRemainingTime();
  const labelClassName = tone === 'dark' ? 'text-black/55' : 'text-white/50';

  if (hasStarted) return <span className={`${compact ? 'text-[9px] font-bold uppercase tracking-[.14em]' : 'text-sm font-bold uppercase tracking-[.18em]'} ${tone === 'dark' ? 'text-black' : 'text-white'}`}>Ya comenzó</span>;

  return (
    <span className={compact ? 'grid grid-cols-4 gap-2 text-center' : 'grid grid-cols-4 gap-3 text-center sm:gap-5'} aria-label={`Faltan ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos para PASS Friday`}>
      <Unit value={days} label="días" compact={compact} labelClassName={labelClassName} />
      <Unit value={hours} label="horas" compact={compact} labelClassName={labelClassName} />
      <Unit value={minutes} label="min" compact={compact} labelClassName={labelClassName} />
      <Unit value={seconds} label="seg" compact={compact} labelClassName={labelClassName} />
    </span>
  );
}

export default function PassFridayCountdown() {
  const location = useLocation();
  const { days, hours, minutes, seconds, hasStarted } = useRemainingTime();
  const units = [
    { value: days, label: 'días' },
    { value: hours, label: 'horas' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'seg' },
  ];

  if (location.pathname === '/pass-friday') return null;

  return (
    <Link
      to="/pass-friday"
      aria-label="Abrir PASS Friday y ver la cuenta regresiva"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40 flex items-end gap-2 border-t border-current pt-2 text-white mix-blend-difference transition-transform duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:gap-3"
    >
      {hasStarted ? <span className="mb-1 text-sm font-black uppercase tracking-[.14em]">Hoy abre</span> : units.map((unit) => <span key={unit.label} className="flex flex-col"><strong className="text-xl leading-none tabular-nums sm:text-2xl">{String(unit.value).padStart(2, '0')}</strong><span className="mt-1 text-[6px] font-bold uppercase tracking-[.09em] opacity-70">{unit.label}</span></span>)}
    </Link>
  );
}
