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
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="hover:opacity-70 transition-opacity"
          >
            <Logo className="h-8 sm:h-10" />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/drops"
              className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
            >
              DROPS
            </Link>
            {CATEGORIES.slice(0, 4).map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
              >
                {category.toUpperCase()}
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/drops"
                className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
                onClick={() => setIsMenuOpen(false)}
              >
                DROPS
              </Link>
              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  to={`/shop?category=${encodeURIComponent(category)}`}
                  className="text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.toUpperCase()}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
