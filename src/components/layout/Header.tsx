import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';
import { CATEGORIES } from '../../types';
import SearchBar from './SearchBar';
import Logo from '../common/Logo';

export default function Header() {
  const { openCart, getItemCount } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const itemCount = getItemCount();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="hover:opacity-80 transition-all duration-300 transform hover:scale-105"
          >
            <Logo className="h-10 sm:h-12" />
          </Link>

          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/drops"
              className="group relative text-sm font-semibold tracking-[0.1em] uppercase text-gray-900 transition-colors"
            >
              <span className="relative z-10">Último Drop</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {CATEGORIES.slice(0, 4).map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="group relative text-sm font-medium tracking-[0.05em] text-gray-700 hover:text-black transition-colors"
              >
                <span className="relative z-10">{category}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SearchBar />

            <button
              onClick={() => openCart()}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col p-3">
              <Link
                to="/drops"
                className="group relative py-3 px-3 text-sm font-medium tracking-wide transition-all hover:bg-gray-50 rounded-lg active:scale-98"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span className="group-hover:translate-x-1 transition-transform">ÚLTIMO DROP</span>
                  <span className="text-gray-400 group-hover:text-black transition-colors text-xs">→</span>
                </div>
              </Link>
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  to={`/shop?category=${encodeURIComponent(category)}`}
                  className="group relative py-3 px-3 text-sm font-medium tracking-wide transition-all hover:bg-gray-50 rounded-lg active:scale-98"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-between">
                    <span className="group-hover:translate-x-1 transition-transform">{category.toUpperCase()}</span>
                    <span className="text-gray-400 group-hover:text-black transition-colors text-xs">→</span>
                  </div>
                </Link>
              ))}
              
              <div className="h-px bg-gray-100 my-1"></div>
              
              <Link
                to="/shop"
                className="mt-2 py-2.5 px-3 bg-black text-white text-center text-sm font-medium tracking-wide rounded-lg hover:bg-gray-800 active:scale-98 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                VER TODO
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
