import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductFilters from '../components/product/ProductFilters';
import { EMPTY_FILTERS, type FilterFacets, type ShopFilters } from '../components/product/productFilterTypes';
import ProductGrid from '../components/product/ProductGrid';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../types';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ShopFilters>(EMPTY_FILTERS);
  const [facets, setFacets] = useState<FilterFacets>({ sizes: [], colors: [], fits: [], styles: [] });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    Promise.all([supabase.from('products').select('color, fit, product_style'), supabase.from('product_variants').select('size')]).then(([products, variants]) => {
      const unique = (values: (string | null | undefined)[]) => [...new Set(values.filter(Boolean) as string[])].sort();
      setFacets({ colors: unique((products.data || []).map((item) => item.color)), fits: unique((products.data || []).map((item) => item.fit)), styles: unique((products.data || []).map((item) => item.product_style)), sizes: unique((variants.data || []).map((item) => item.size)) });
    });
  }, []);

  const activeFilters = useMemo(() => [...filters.sizes, ...filters.colors, ...filters.fits, ...filters.styles].length + (filters.availableOnly ? 1 : 0) + (filters.price.min > 0 || filters.price.max < 10000 ? 1 : 0), [filters]);
  const setCategory = (next: string) => { const params = new URLSearchParams(searchParams); if (next) params.set('category', next); else params.delete('category'); setSearchParams(params); };

  return <main className="min-h-screen pb-20"><div className="pass-container pb-7 pt-10 sm:pb-10 sm:pt-16"><p className="pass-kicker">PASS Clothing</p><h1 className="pass-heading mt-2 text-5xl sm:text-7xl">{search ? `Resultados: “${search}”` : category || 'Shop all'}</h1></div><div className="border-y border-black/10"><div className="pass-container flex gap-6 overflow-x-auto py-4 scrollbar-hide"><button type="button" onClick={() => setCategory('')} className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] ${!category ? 'underline underline-offset-8' : 'text-black/45'}`}>Todo</button>{CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] ${category === item ? 'underline underline-offset-8' : 'text-black/45'}`}>{item}</button>)}</div></div><div className="pass-container"><ProductFilters value={filters} facets={facets} sortBy={sortBy} onChange={setFilters} onSortChange={setSortBy} mobileOpen={mobileFiltersOpen} setMobileOpen={setMobileFiltersOpen} />{activeFilters > 0 && <div className="flex items-center gap-3 py-4"><span className="text-[10px] uppercase tracking-wider text-black/45">{activeFilters} filtros activos</span><button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-[10px] font-bold uppercase underline">Limpiar filtros</button></div>}<div className="pt-6 sm:pt-9"><ProductGrid category={category} searchQuery={search} filters={filters} sortBy={sortBy} /></div></div></main>;
}
