import { Instagram, Facebook, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PASS CLOTHING</h3>
            <p className="text-gray-400 text-sm">
              Ropa urbana de calidad premium para expresar tu estilo único.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">COMPRAR</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/drops" className="hover:text-white transition-colors">
                  Drops
                </a>
              </li>
              <li>
                <a href="/shop" className="hover:text-white transition-colors">
                  Todas las Prendas
                </a>
              </li>
              <li>
                <a href="/shop?category=Hoodies" className="hover:text-white transition-colors">
                  Hoodies
                </a>
              </li>
              <li>
                <a href="/shop?category=Accesorios" className="hover:text-white transition-colors">
                  Accesorios
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm tracking-wide">AYUDA</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Envíos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Guía de Tallas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contacto
                </a>
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
