import { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductWithVariants } from '../../types';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';
import { useCachedQuery } from '../../hooks/useCachedQuery';

interface ProductGridProps {
  category?: string;
  dropId?: string;
  searchQuery?: string;
  priceRange?: { min: number; max: number };
  sortBy?: string;
}

const PRODUCTS_PER_PAGE = 12;

// Memoizar ProductGrid para evitar re-renders innecesarios
const ProductGrid = memo(function ProductGrid({ category, dropId, searchQuery, priceRange, sortBy }: ProductGridProps) {
  const [displayedProducts, setDisplayedProducts] = useState<ProductWithVariants[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Crear clave de caché única basada en los filtros
  const cacheKey = useMemo(() => {
    const parts = ['products'];
    if (category) parts.push(`cat:${category}`);
    if (dropId) parts.push(`drop:${dropId}`);
    if (searchQuery) parts.push(`q:${searchQuery}`);
    if (sortBy) parts.push(`sort:${sortBy}`);
    return parts.join('|');
  }, [category, dropId, searchQuery, sortBy]);

  // Función de fetch memoizada
  const fetchProducts = useCallback(async () => {
    let query = supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          id,
          size,
          stock(
            quantity,
            branch:branches(name, address)
          )
        ),
        drop:drops(*)
      `);

    if (category) query = query.eq('category', category);
    if (dropId) query = query.eq('drop_id', dropId);
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);
    if (!sortBy || sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }, [category, dropId, searchQuery, sortBy]);

  // Usar caché para productos
  const { data: rawProducts, isLoading } = useCachedQuery<ProductWithVariants[]>(
    cacheKey,
    fetchProducts,
    {
      cacheTime: 3 * 60 * 1000, // 3 minutos
      staleTime: 60 * 1000, // 1 minuto
    }
  );

  // Filtrar y ordenar productos en el cliente (memoizado)
  const products = useMemo(() => {
    if (!rawProducts) return [];

    let filtered = [...rawProducts];

    // Filtro de precio
    if (priceRange && (priceRange.min > 0 || priceRange.max < 10000)) {
      filtered = filtered.filter(
        (p) => p.price >= priceRange.min && p.price <= priceRange.max
      );
    }

    // Ordenamiento
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [rawProducts, priceRange, sortBy]);

  useEffect(() => {
    if (products.length > 0) {
      setPage(1);
      setDisplayedProducts(products.slice(0, PRODUCTS_PER_PAGE));
      setHasMore(products.length > PRODUCTS_PER_PAGE);
    }
  }, [products]);

  useEffect(() => {
    // Reset pagination when filters change
    setPage(1);
    setDisplayedProducts(products.slice(0, PRODUCTS_PER_PAGE));
    setHasMore(products.length > PRODUCTS_PER_PAGE);
  }, [products]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, page, products]);

  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const start = 0;
      const end = nextPage * PRODUCTS_PER_PAGE;
      const newDisplayed = products.slice(start, end);
      
      setDisplayedProducts(newDisplayed);
      setPage(nextPage);
      setHasMore(end < products.length);
      setLoadingMore(false);
    }, 500); // Simula un pequeño delay para mejor UX
  }, [page, products, loadingMore, hasMore]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {displayedProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Intersection Observer Target */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center items-center py-12">
          {loadingMore && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <p className="text-xs text-gray-500 tracking-wider uppercase">Cargando más productos...</p>
            </div>
          )}
        </div>
      )}

      {!hasMore && displayedProducts.length > PRODUCTS_PER_PAGE && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400 tracking-wider uppercase">Has visto todos los productos</p>
        </div>
      )}
    </div>
  );
});

export default ProductGrid;
