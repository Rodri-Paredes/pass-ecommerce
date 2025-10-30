import { Instagram, Facebook, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo className="h-10" />
            </div>
            <p className="text-gray-400 text-sm">
              Ropa urbana de calidad premium para expresar tu estilo único.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">COMPRAR</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/drops" className="hover:text-white transition-colors">
                  Drops
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Todas las Prendas
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Hoodies" className="hover:text-white transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Poleras" className="hover:text-white transition-colors">
                  Poleras
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Pantalones" className="hover:text-white transition-colors">
                  Pantalones
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">AYUDA</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="hover:text-white transition-colors">
                  Guía de Tallas
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">SÍGUENOS</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@passclothing.com"
                className="hover:text-gray-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} PASS CLOTHING. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
