import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, MapPin } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useBranchStore } from '../../store/branchStore';
import { useState, useEffect } from 'react';
import { CATEGORIES } from '../../types';
import SearchBar from './SearchBar';
import Logo from '../common/Logo';
import { supabase } from '../../lib/supabase';
import type { Branch } from '../../types';
import BranchSelectorModal from './BranchSelectorModal';

export default function Header() {
  const { openCart, getItemCount } = useCartStore();
  const { selectedBranch, setSelectedBranch } = useBranchStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const itemCount = getItemCount();

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase.from('branches').select('*').order('name');
      if (data) {
        // Filtrar cualquier sucursal que contenga 'Sucre' en el nombre
        const filtered = data.filter(branch => !branch.name.toLowerCase().includes('sucre'));
        setBranches(filtered);
        
        // Si la sucursal seleccionada es Sucre, limpiar la selección
        if (selectedBranch) {
          const selectedBranchData = data.find(b => b.id === selectedBranch);
          if (selectedBranchData && selectedBranchData.name.toLowerCase().includes('sucre')) {
            setSelectedBranch(null);
          }
        }
      }
    };
    fetchBranches();
  }, [selectedBranch, setSelectedBranch]);

  const getBranchAbbreviation = (branchName: string): string => {
    if (branchName === 'Todas las sucursales') return 'ALL';
    
    // Si el nombre contiene "Sucursal", extraer solo el nombre de la ciudad
    const cityName = branchName.replace(/^Sucursal\s+/i, '').trim().toLowerCase();
    
    // Abreviaciones específicas por ciudad
    const abbreviations: { [key: string]: string } = {
      'cochabamba': 'CBBA',
      'tarija': 'TJA'
    };
    
    return abbreviations[cityName] || cityName.substring(0, 3).toUpperCase();
  };

  const selectedBranchName = selectedBranch 
    ? branches.find(b => b.id === selectedBranch)?.name || 'Todas las sucursales'
    : 'Todas las sucursales';

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="group flex items-center gap-3 hover:opacity-80 transition-all duration-300"
          >
            <Logo className="h-9 sm:h-11 group-hover:scale-105 transition-transform duration-300" />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-10">
            <Link
              to="/drops"
              className="group relative text-xs xl:text-sm font-medium tracking-[0.15em] text-gray-700 hover:text-black transition-colors duration-300"
            >
              <span>ÚLTIMO DROP</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
            </Link>
            {CATEGORIES.slice(0, 4).map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="group relative text-xs xl:text-sm font-medium tracking-[0.15em] text-gray-700 hover:text-black transition-colors duration-300"
              >
                <span>{category.toUpperCase()}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <SearchBar />

            {/* Branch Selector - Mobile */}
            <button
              onClick={() => setShowBranchModal(true)}
              className="sm:hidden flex items-center justify-center px-2 py-1 text-[10px] font-black tracking-[0.05em] text-white bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 shadow-sm hover:shadow-md transition-all duration-300 rounded"
              aria-label="Cambiar sucursal"
            >
              {getBranchAbbreviation(selectedBranchName)}
            </button>

            {/* Branch Selector - Desktop */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowBranchSelector(!showBranchSelector)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 transition-all duration-300 rounded-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">{selectedBranchName}</span>
              </button>
              
              {showBranchSelector && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowBranchSelector(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl z-50 rounded-sm">
                    <button
                      onClick={() => {
                        setSelectedBranch(null);
                        setShowBranchSelector(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                        selectedBranch === null ? 'bg-gray-50 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Todas las sucursales
                      </div>
                    </button>
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch.id);
                          setShowBranchSelector(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                          selectedBranch === branch.id ? 'bg-gray-50 font-semibold' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {branch.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => openCart()}
              className="group relative p-2.5 hover:bg-gray-50 rounded-full transition-all duration-300 hover:scale-110"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5 group-hover:stroke-black transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
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

      {/* Branch Selector Modal */}
      <BranchSelectorModal 
        isOpen={showBranchModal} 
        onClose={() => setShowBranchModal(false)} 
      />
    </header>
  );
}
