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
    <div className="min-h-screen pt-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section - Minimalist */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-light tracking-[0.2em] uppercase text-gray-900">
                {searchQuery ? `"${searchQuery}"` : 'Colección'}
              </h1>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchParams(selectedCategory ? { category: selectedCategory } : {});
                  }}
                  className="text-xs text-gray-500 hover:text-black mt-2 underline underline-offset-2"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
            
            <ProductFilters
              onPriceRangeChange={handlePriceRangeChange}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* Category Tabs - Luxury Style */}
        <div className="mb-8 border-b border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mb-px">
            <button
              onClick={() => handleCategoryChange('')}
              className={`group flex-shrink-0 px-5 py-3.5 text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap border-b-2 ${
                !selectedCategory
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
              }`}
            >
              Todo
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`group flex-shrink-0 px-5 py-3.5 text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 whitespace-nowrap border-b-2 ${
                  selectedCategory === category
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

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
