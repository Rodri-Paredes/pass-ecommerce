import { memo, useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { useBranchStore } from '../../store/branchStore';
import type { ProductWithVariants } from '../../types';
import type { ShopFilters } from './productFilterTypes';
import ProductCard from './ProductCard';

interface ProductGridProps { category?: string; dropId?: string; searchQuery?: string; filters?: ShopFilters; sortBy?: string }

const ProductGrid = memo(function ProductGrid({ category, dropId, searchQuery, filters, sortBy = 'newest' }: ProductGridProps) {
  const [visible, setVisible] = useState(12);
  const selectedBranch = useBranchStore((state) => state.selectedBranch);
  const cacheKey = ['products', category, dropId, searchQuery, selectedBranch].filter(Boolean).join('|');

  const fetchProducts = useCallback(async () => {
    let query = supabase.from('products').select('*, variants:product_variants(*, stock(*, branch:branches(*))), drop:drops(*)');
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
    if (filters?.sizes.length) result = result.filter((product) => (product.variants || []).some((variant) => filters.sizes.includes(variant.size) && (variant.stock || []).some((stock) => (!selectedBranch || stock.branch_id === selectedBranch) && stock.quantity > 0)));
    if (filters?.colors.length) result = result.filter((product) => product.color && filters.colors.includes(product.color));
    if (filters?.fits.length) result = result.filter((product) => product.fit && filters.fits.includes(product.fit));
    if (filters?.styles.length) result = result.filter((product) => product.product_style && filters.styles.includes(product.product_style));
    if (filters?.availableOnly) result = result.filter((product) => stockFor(product) > 0);
    if (filters) result = result.filter((product) => product.price >= filters.price.min && product.price <= filters.price.max);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [rawProducts, filters, sortBy, selectedBranch]);

  if (isLoading) return <div className="grid min-h-[40vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!products.length) return <div className="grid min-h-[40vh] place-items-center border-y border-black/10 text-center"><div><p className="text-lg font-bold uppercase">No encontramos productos</p><p className="mt-2 text-sm text-black/50">Prueba quitando algunos filtros.</p></div></div>;

  return <><div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">{products.slice(0, visible).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>{visible < products.length && <div className="mt-14 text-center"><button type="button" onClick={() => setVisible((count) => count + 12)} className="border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-black hover:text-white">Cargar más</button><p className="mt-3 text-[10px] uppercase tracking-wider text-black/40">{visible} de {products.length}</p></div>}</>;
});

export default ProductGrid;
