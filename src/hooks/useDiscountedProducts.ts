import { useMemo, useEffect } from 'react';
import { useDiscountStore } from '../store/discountStore';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import { CacheManager } from '../lib/cache';
import type { Product, ProductWithDiscount } from '../types';

export const useDiscountedProducts = () => {
  const { activeDiscountsMap, loadActiveDiscountsMap } = useDiscountStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Try localStorage cache first
        const cached = CacheManager.get<Product[]>('discount_products');
        if (cached) {
          setProducts(cached);
          setIsLoading(false);
          // Still refresh discounts map in background
          loadActiveDiscountsMap();
          return;
        }
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        CacheManager.set('discount_products', data || [], 30); // Cache 30 min

        // Cargar mapa de descuentos
        await loadActiveDiscountsMap();
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadActiveDiscountsMap]);

  const discountedProducts = useMemo<ProductWithDiscount[]>(() => {
    return products
      .filter(product => activeDiscountsMap.has(product.id))
      .map(product => {
        const discountInfo = activeDiscountsMap.get(product.id)!;
        const originalPrice = product.price;
        const discountAmount = originalPrice * (discountInfo.percentage / 100);
        const finalPrice = originalPrice - discountAmount;
        
        return {
          ...product,
          discount: discountInfo,
          originalPrice,
          finalPrice,
          savings: discountAmount
        };
      })
      .sort((a, b) => b.discount.percentage - a.discount.percentage); // Mayor descuento primero
  }, [products, activeDiscountsMap]);

  return {
    discountedProducts,
    count: discountedProducts.length,
    totalSavings: discountedProducts.reduce((sum, p) => sum + p.savings, 0),
    isLoading
  };
};
