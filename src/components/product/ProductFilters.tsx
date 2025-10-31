import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterProps {
  onPriceRangeChange: (min: number, max: number) => void;
  onSortChange: (sort: string) => void;
}

export default function ProductFilters({ onPriceRangeChange, onSortChange }: FilterProps) {
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    const newRange = { ...priceRange, [type]: numValue };
    setPriceRange(newRange);
    onPriceRangeChange(newRange.min, newRange.max);
  };

  const sortOptions = [
    { value: 'newest', label: 'Más Recientes' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Sort Filter - Minimalist */}
      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-black transition-colors"
        >
          <span>Ordenar</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isSortOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsSortOpen(false)}
            />
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-56 bg-white border border-gray-200 shadow-lg z-20 max-h-64 overflow-y-auto">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Price Filter - Minimalist */}
      <div className="relative">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium tracking-wider uppercase text-gray-700 hover:text-black transition-colors"
        >
          <span>Precio</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isPriceOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsPriceOpen(false)}
            />
            <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white border border-gray-200 shadow-lg z-20 p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">Mínimo (Bs.)</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-700">Máximo (Bs.)</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
