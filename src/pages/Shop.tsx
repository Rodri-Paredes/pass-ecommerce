import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import { CATEGORIES } from '../types';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');

  // Scroll to top when entering shop page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    const newParams: Record<string, string> = {};
    if (category) newParams.category = category;
    if (searchQuery) newParams.search = searchQuery;
    setSearchParams(newParams);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 tracking-tight">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'TODAS LAS PRENDAS'}
          </h1>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchParams(selectedCategory ? { category: selectedCategory } : {});
              }}
              className="text-sm text-gray-600 hover:text-black mb-4 underline"
            >
              Limpiar búsqueda
            </button>
          )}

          {/* Category Pills - Mobile Optimized */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
              <button
                onClick={() => handleCategoryChange('')}
                className={`snap-start flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all shadow-sm ${
                  !selectedCategory
                    ? 'bg-black text-white shadow-md scale-105'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-400 active:scale-95'
                }`}
              >
                TODOS
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`snap-start flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all shadow-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-black text-white shadow-md scale-105'
                      : 'bg-white border-2 border-gray-200 hover:border-gray-400 active:scale-95'
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ProductFilters
          onPriceRangeChange={handlePriceRangeChange}
          onSortChange={handleSortChange}
        />

        <ProductGrid
          category={selectedCategory}
          searchQuery={searchQuery}
          priceRange={priceRange}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
}
