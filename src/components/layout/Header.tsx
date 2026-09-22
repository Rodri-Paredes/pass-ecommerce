import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Menu, ShoppingBag, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useBranchStore } from '../../store/branchStore';
import { useCartStore } from '../../store/cartStore';
import type { Branch } from '../../types';
import AnnouncementBar from './AnnouncementBar';
import BranchSelectorModal from './BranchSelectorModal';
import MobileNav from './MobileNav';
import SearchBar from './SearchBar';

export default function Header() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { selectedBranch, setSelectedBranch } = useBranchStore();
  const { getItemCount, openCart } = useCartStore();

  useEffect(() => {
    supabase.from('branches').select('id, name, address, created_at').order('name').then(({ data }) => {
      if (!data) return;
      const available = data.filter((branch) => !branch.name.toLowerCase().includes('sucre'));
      setBranches(available);
      if (selectedBranch && !available.some((branch) => branch.id === selectedBranch)) setSelectedBranch(null);
    });
  }, [selectedBranch, setSelectedBranch]);

  const branchName = useMemo(
    () => branches.find((branch) => branch.id === selectedBranch)?.name.replace(/^Sucursal\s+/i, '') || 'Todas',
    [branches, selectedBranch],
  );
  const itemCount = getItemCount();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <AnnouncementBar />
        <div className="pass-container grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 lg:h-[72px]">
          <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Navegación principal">
            <Link className="pass-link text-[11px] font-semibold uppercase tracking-[0.15em]" to="/shop">Shop</Link>
            <Link className="pass-link text-[11px] font-semibold uppercase tracking-[0.15em]" to="/shop?sort=newest">New</Link>
            <Link className="pass-link text-[11px] font-semibold uppercase tracking-[0.15em]" to="/shop?category=Hoodies">Hoodies</Link>
            <Link className="pass-link text-[11px] font-semibold uppercase tracking-[0.15em]" to="/shop?category=Poleras">Poleras</Link>
            <Link className="pass-link text-[11px] font-semibold uppercase tracking-[0.15em]" to="/drops">Drops</Link>
            <Link className="pass-link text-[11px] font-semibold uppercase tracking-[0.15em] text-champagne" to="/pass-crew">PASS Crew</Link>
          </nav>
          <button type="button" onClick={() => setMobileNavOpen(true)} className="justify-self-start p-2 lg:hidden" aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
          <Link to="/" className="text-[24px] font-black leading-none tracking-[-0.07em] sm:text-[28px]" aria-label="PASS Clothing, inicio">PASS</Link>
          <div className="flex items-center justify-end gap-0.5 sm:gap-2">
            <div className="relative hidden xl:block">
              <button type="button" onClick={() => setBranchMenuOpen((value) => !value)} className="flex items-center gap-1.5 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/60 hover:text-black"><MapPin className="h-3.5 w-3.5" /> {branchName}</button>
              {branchMenuOpen && <><button type="button" aria-label="Cerrar selector" className="fixed inset-0 z-40 cursor-default" onClick={() => setBranchMenuOpen(false)} /><div className="absolute right-0 top-full z-50 w-56 border border-black/10 bg-white py-2 shadow-xl"><button type="button" onClick={() => { setSelectedBranch(null); setBranchMenuOpen(false); }} className="w-full px-4 py-3 text-left text-xs uppercase tracking-wider hover:bg-black hover:text-white">Todas las sucursales</button>{branches.map((branch) => <button key={branch.id} type="button" onClick={() => { setSelectedBranch(branch.id); setBranchMenuOpen(false); }} className="w-full px-4 py-3 text-left text-xs uppercase tracking-wider hover:bg-black hover:text-white">{branch.name}</button>)}</div></>}
            </div>
            <SearchBar />
            <Link to="/favorites" className="hidden p-2 sm:block" aria-label="Favoritos"><Heart className="h-[19px] w-[19px] stroke-[1.6]" /></Link>
            <Link to="/account" className="hidden p-2 sm:block" aria-label="Cuenta"><UserRound className="h-[19px] w-[19px] stroke-[1.6]" /></Link>
            <button type="button" onClick={openCart} className="relative p-2" aria-label={`Carrito, ${itemCount} productos`}><ShoppingBag className="h-5 w-5 stroke-[1.6]" />{itemCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">{itemCount}</span>}</button>
          </div>
        </div>
      </header>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onBranchClick={() => setBranchModalOpen(true)} />
      <BranchSelectorModal isOpen={branchModalOpen} onClose={() => setBranchModalOpen(false)} />
    </>
  );
}
