import { Instagram, Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white mt-16 sm:mt-20 md:mt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
          {/* Logo & Description - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:block">
            <div className="mb-4">
              <Logo className="h-10" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Streetwear premium que define tu identidad urbana.
            </p>
          </div>

          {/* Comprar */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-5 text-sm tracking-[0.15em] uppercase text-white">Comprar</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/drops" className="hover:text-white transition-colors inline-block">
                  Último Drop
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors inline-block">
                  Todo
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Hoodies" className="hover:text-white transition-colors inline-block">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Pantalones" className="hover:text-white transition-colors inline-block">
                  Pantalones
                </Link>
              </li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-5 text-sm tracking-[0.15em] uppercase text-white">Ayuda</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors inline-block">
                  Envíos
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors inline-block">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover:text-white transition-colors inline-block">
                  Guía de Tallas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors inline-block">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Síguenos */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-5 text-sm tracking-[0.15em] uppercase text-white">Síguenos</h4>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="https://instagram.com/pass.clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@pass.clothing"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="mailto:info@passclothing.com"
                className="hover:text-gray-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
            {/* Corporate phone for Cochabamba */}
            <div className="mt-4 text-xs text-gray-400">
              <a href="tel:+59174563943" className="block hover:text-white">
                Cochabamba (Corporativo): +591 74563943
              </a>
            </div>
            {/* Mobile logo - shown only on mobile */}
            <div className="md:hidden mt-6">
              <Logo className="h-6 opacity-50" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 sm:pt-10">
          <p className="text-center text-xs sm:text-sm text-gray-500 tracking-wider">
            &copy; {new Date().getFullYear()} PASS CLOTHING. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
