import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductWithVariants } from '../../types';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  category?: string;
  dropId?: string;
  searchQuery?: string;
  priceRange?: { min: number; max: number };
  sortBy?: string;
}

export default function ProductGrid({ category, dropId, searchQuery, priceRange, sortBy }: ProductGridProps) {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [category, dropId, searchQuery, priceRange, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
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

      if (category) {
        query = query.eq('category', category);
      }

      if (dropId) {
        query = query.eq('drop_id', dropId);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      // Ordenamiento por defecto
      if (!sortBy || sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let filteredProducts = data || [];

      // Filtro de precio
      if (priceRange && (priceRange.min > 0 || priceRange.max < 10000)) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= priceRange.min && p.price <= priceRange.max
        );
      }

      // Ordenamiento
      if (sortBy === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'name-asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      }

      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
