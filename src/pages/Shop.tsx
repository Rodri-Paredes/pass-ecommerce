import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import { CATEGORIES } from '../types';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );

  useEffect(() => {
    const category = searchParams.get('category') || '';
    setSelectedCategory(category);
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">TODAS LAS PRENDAS</h1>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-4 py-2 text-sm font-medium tracking-wide transition-all ${
                !selectedCategory
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 hover:border-black'
              }`}
            >
              TODOS
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 text-sm font-medium tracking-wide transition-all ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-300 hover:border-black'
                }`}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid category={selectedCategory} />
      </div>
    </div>
  );
}
