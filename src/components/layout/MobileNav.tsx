import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, UserRound, X } from 'lucide-react';
import { CATEGORIES } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onBranchClick: () => void;
}

export default function MobileNav({ open, onClose, onBranchClick }: Props) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open) return null;
  const nav = (to: string, label: string) => <Link to={to} onClick={onClose} className="flex items-center justify-between border-b border-black/10 py-4 text-2xl font-black uppercase tracking-[-0.04em]"><span>{label}</span><span className="text-base font-normal">→</span></Link>;

  return <div className="fixed inset-0 z-[70] bg-white lg:hidden"><div className="flex h-full flex-col"><header className="flex h-16 items-center justify-between border-b border-black/10 px-4"><span className="text-xl font-black tracking-[-0.05em]">PASS</span><button type="button" onClick={onClose} className="p-2" aria-label="Cerrar menú"><X className="h-6 w-6"/></button></header><nav className="flex-1 overflow-y-auto px-5 py-5">{nav('/shop','Shop')}{nav('/shop?sort=newest','New')}{nav('/drops','Drops')}<p className="mt-8 pb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-black/40">Categorías</p>{CATEGORIES.map(category => <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`} onClick={onClose} className="block border-b border-black/10 py-3 text-sm font-medium uppercase tracking-[0.12em]">{category}</Link>)}</nav><div className="grid grid-cols-3 border-t border-black/10"><Link to="/account" onClick={onClose} className="flex flex-col items-center gap-2 border-r border-black/10 py-5 text-[10px] uppercase tracking-wider"><UserRound className="h-5 w-5"/>Cuenta</Link><Link to="/favorites" onClick={onClose} className="flex flex-col items-center gap-2 border-r border-black/10 py-5 text-[10px] uppercase tracking-wider"><Heart className="h-5 w-5"/>Favoritos</Link><button type="button" onClick={() => { onClose(); onBranchClick(); }} className="flex flex-col items-center gap-2 py-5 text-[10px] uppercase tracking-wider"><MapPin className="h-5 w-5"/>Sucursal</button></div></div></div>;
}
