import { Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../types';

const TikTokIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>;

export default function Footer() {
  return (
    <footer className="mt-20 bg-black text-white sm:mt-28">
      <div className="pass-container py-12 sm:py-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <p className="text-5xl font-black tracking-[-0.075em] sm:text-7xl">PASS</p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">Streetwear boliviano. Prendas diseñadas para llevar la calle con identidad propia.</p>
          </div>
          <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Shop</p><ul className="space-y-3 text-sm">{CATEGORIES.slice(0, 5).map((category) => <li key={category}><Link className="hover:text-white/55" to={`/shop?category=${encodeURIComponent(category)}`}>{category}</Link></li>)}<li><Link className="hover:text-white/55" to="/drops">Drops</Link></li></ul></div>
          <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Ayuda</p><ul className="space-y-3 text-sm"><li><Link className="hover:text-white/55" to="/shipping">Envíos</Link></li><li><Link className="hover:text-white/55" to="/returns">Cambios y devoluciones</Link></li><li><Link className="hover:text-white/55" to="/size-guide">Guía de tallas</Link></li><li><Link className="hover:text-white/55" to="/contact">Contacto</Link></li></ul></div>
          <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Social</p><div className="flex gap-4"><a href="https://instagram.com/pass.clothing" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram className="h-5 w-5" /></a><a href="https://www.tiktok.com/@pass.clothing" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokIcon className="h-5 w-5" /></a><a href="https://www.facebook.com/pass.clothing" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook className="h-5 w-5" /></a></div></div>
        </div>
        <div className="flex flex-col gap-3 pt-6 text-[10px] uppercase tracking-[0.18em] text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} PASS Clothing</p><p>Bolivia</p></div>
      </div>
    </footer>
  );
}
