import { ChevronDown, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../types';

const TikTokIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>;

export default function Footer() {
  return (
    <footer className="bg-[#080808] text-white">
      <div className="pass-container py-10 md:hidden">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-4xl font-black leading-none tracking-[-0.075em]">PASS</p>
            <p className="mt-3 max-w-[250px] text-xs leading-5 text-white/50">Streetwear boliviano con identidad propia.</p>
          </div>
          <div className="flex gap-2">
            <SocialLink href="https://instagram.com/pass.clothing" label="Instagram"><Instagram className="h-4 w-4" /></SocialLink>
            <SocialLink href="https://www.tiktok.com/@pass.clothing" label="TikTok"><TikTokIcon className="h-4 w-4" /></SocialLink>
            <SocialLink href="https://www.facebook.com/pass.clothing" label="Facebook"><Facebook className="h-4 w-4" /></SocialLink>
          </div>
        </div>

        <div className="mt-9 border-t border-white/15">
          <FooterAccordion title="Shop">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 pb-6 text-sm text-white/65">
              {CATEGORIES.map((category) => <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`} className="hover:text-white">{category}</Link>)}
              <Link to="/drops" className="hover:text-white">Drops</Link>
            </div>
          </FooterAccordion>
          <FooterAccordion title="Ayuda">
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 pb-6 text-sm text-white/65">
              <Link to="/shipping" className="hover:text-white">Envíos</Link>
              <Link to="/returns" className="hover:text-white">Cambios</Link>
              <Link to="/size-guide" className="hover:text-white">Guía de tallas</Link>
              <Link to="/contact" className="hover:text-white">Contacto</Link>
            </div>
          </FooterAccordion>
        </div>

        <div className="flex items-center justify-between border-t border-white/15 pt-5 text-[9px] uppercase tracking-[0.16em] text-white/35"><p>© {new Date().getFullYear()} PASS</p><p>Bolivia</p></div>
      </div>

      <div className="pass-container hidden py-16 md:block">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-8 border-b border-white/15 pb-14">
          <div><p className="text-7xl font-black tracking-[-0.075em]">PASS</p><p className="mt-4 max-w-xs text-sm leading-6 text-white/55">Streetwear boliviano. Prendas diseñadas para llevar la calle con identidad propia.</p></div>
          <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Shop</p><ul className="space-y-3 text-sm">{CATEGORIES.slice(0, 5).map((category) => <li key={category}><Link className="hover:text-white/55" to={`/shop?category=${encodeURIComponent(category)}`}>{category}</Link></li>)}<li><Link className="hover:text-white/55" to="/drops">Drops</Link></li></ul></div>
          <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Ayuda</p><ul className="space-y-3 text-sm"><li><Link className="hover:text-white/55" to="/shipping">Envíos</Link></li><li><Link className="hover:text-white/55" to="/returns">Cambios y devoluciones</Link></li><li><Link className="hover:text-white/55" to="/size-guide">Guía de tallas</Link></li><li><Link className="hover:text-white/55" to="/contact">Contacto</Link></li></ul></div>
          <div><p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Social</p><div className="flex gap-3"><SocialLink href="https://instagram.com/pass.clothing" label="Instagram"><Instagram className="h-5 w-5" /></SocialLink><SocialLink href="https://www.tiktok.com/@pass.clothing" label="TikTok"><TikTokIcon className="h-5 w-5" /></SocialLink><SocialLink href="https://www.facebook.com/pass.clothing" label="Facebook"><Facebook className="h-5 w-5" /></SocialLink></div></div>
        </div>
        <div className="flex items-center justify-between pt-6 text-[10px] uppercase tracking-[0.18em] text-white/40"><p>© {new Date().getFullYear()} PASS Clothing</p><p>Bolivia</p></div>
      </div>
    </footer>
  );
}

function FooterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  return <details className="group border-b border-white/15"><summary className="flex cursor-pointer list-none items-center justify-between py-5 text-xs font-semibold uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">{title}<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>{children}</details>;
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-black">{children}</a>;
}
