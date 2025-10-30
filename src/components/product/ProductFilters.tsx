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
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Price Filter */}
      <div className="relative">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors bg-white"
        >
          <span className="text-sm font-medium">Precio</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isPriceOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isPriceOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-300 shadow-lg z-10 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Mínimo (Bs.)</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Máximo (Bs.)</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div className="relative">
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:border-black transition-colors bg-white"
        >
          <span className="text-sm font-medium">Ordenar</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isSortOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 shadow-lg z-10">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsSortOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
