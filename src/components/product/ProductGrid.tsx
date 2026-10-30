import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { useBranchStore } from '../../store/branchStore';
import type { ProductWithVariants } from '../../types';
import type { ShopFilters } from './productFilterTypes';
import ProductCard from './ProductCard';

interface ProductGridProps { category?: string; dropId?: string; searchQuery?: string; filters?: ShopFilters; sortBy?: string }

const ProductGrid = memo(function ProductGrid({ category, dropId, searchQuery, filters, sortBy = 'newest' }: ProductGridProps) {
  const selectedBranch = useBranchStore((state) => state.selectedBranch);
  const cacheKey = ['published-products-v1', category, dropId, searchQuery, selectedBranch].filter(Boolean).join('|');
  const paginationKey = useMemo(() => `pass-grid:${cacheKey}:${sortBy}:${JSON.stringify(filters || {})}`, [cacheKey, filters, sortBy]);
  const [visible, setVisible] = useState(() => Math.max(12, Number(sessionStorage.getItem(paginationKey) || 12)));
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async () => {
    let query = supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)').eq('is_visible', true);
    if (category) query = query.eq('category', category);
    if (dropId) query = query.eq('drop_id', dropId);
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }, [category, dropId, searchQuery]);

  const { data: rawProducts, isLoading } = useCachedQuery<ProductWithVariants[]>(cacheKey, fetchProducts, { cacheTime: 600000, staleTime: 180000 });
  const products = useMemo(() => {
    let result = [...(rawProducts || [])];
    const stockFor = (product: ProductWithVariants) => (product.variants || []).reduce((total, variant) => total + (variant.stock || []).reduce((sum, stock) => selectedBranch && stock.branch_id !== selectedBranch ? sum : sum + stock.quantity, 0), 0);
    if (selectedBranch) result = result.filter((product) => stockFor(product) > 0);
    if (filters?.sizes.length) result = result.filter((product) => (product.variants || []).some((variant) => filters.sizes.includes(variant.size.trim().toUpperCase()) && (variant.stock || []).some((stock) => (!selectedBranch || stock.branch_id === selectedBranch) && stock.quantity > 0)));
    if (filters?.colors.length) result = result.filter((product) => product.color && filters.colors.includes(product.color));
    if (filters?.fits.length) result = result.filter((product) => product.fit && filters.fits.includes(product.fit));
    if (filters?.styles.length) result = result.filter((product) => product.product_style && filters.styles.includes(product.product_style));
    if (filters?.availableOnly) result = result.filter((product) => stockFor(product) > 0);
    if (filters) result = result.filter((product) => product.price >= filters.price.min && product.price <= filters.price.max);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [rawProducts, filters, sortBy, selectedBranch]);

  useEffect(() => {
    setVisible(Math.max(12, Number(sessionStorage.getItem(paginationKey) || 12)));
  }, [paginationKey]);

  useEffect(() => {
    sessionStorage.setItem(paginationKey, String(visible));
  }, [paginationKey, visible]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visible >= products.length) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible((count) => Math.min(count + 12, products.length));
    }, { rootMargin: '500px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [visible, products.length]);

  if (isLoading) return <ProductGridSkeleton />;
  if (!products.length) return <div className="grid min-h-[40vh] place-items-center border-y border-black/10 text-center"><div><p className="text-lg font-bold uppercase">No encontramos productos</p><p className="mt-2 text-sm text-black/50">Prueba quitando algunos filtros.</p></div></div>;

  return <><div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">{products.slice(0, visible).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>{visible < products.length && <div ref={loadMoreRef} className="grid h-32 place-items-center" aria-live="polite"><div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45"><Loader2 className="h-4 w-4 animate-spin" /> Cargando productos</div></div>}</>;
});

export default ProductGrid;

function ProductGridSkeleton() {
  return <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4" aria-label="Cargando productos">{Array.from({ length: 8 }, (_, index) => <div key={index} className="animate-pulse"><div className="aspect-[3/4] bg-black/[0.06]" /><div className="mt-3 h-3 w-4/5 bg-black/[0.08]" /><div className="mt-2 h-3 w-1/3 bg-black/[0.06]" /></div>)}</div>;
}
