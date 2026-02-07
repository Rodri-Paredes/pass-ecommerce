import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Discount } from '../types';

interface DiscountStore {
  discounts: Discount[];
  activeDiscountsMap: Map<string, {
    percentage: number;
    name: string;
    source: 'product' | 'drop';
  }>;
  isLoading: boolean;
  error: string | null;
  
  loadActiveDiscountsMap: () => Promise<void>;
  refreshDiscounts: () => Promise<void>;
}

export const useDiscountStore = create<DiscountStore>((set, get) => ({
  discounts: [],
  activeDiscountsMap: new Map(),
  isLoading: false,
  error: null,

  loadActiveDiscountsMap: async () => {
    try {
      set({ isLoading: true, error: null });

      // Usar la vista que ya existe en la base de datos
      const { data: productsWithDiscount, error } = await supabase
        .from('products_with_active_discount')
        .select('*');

      if (error) {
        console.error('Error cargando descuentos:', error);
        throw error;
      }

      const newMap = new Map<string, { percentage: number; name: string; source: 'product' | 'drop' }>();

      if (productsWithDiscount) {
        for (const item of productsWithDiscount) {
          newMap.set(item.product_id, {
            percentage: item.percentage,
            name: item.discount_name,
            source: item.discount_source
          });
        }
      }

      console.log('Productos con descuento cargados:', newMap.size);

      set({ 
        activeDiscountsMap: newMap, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading active discounts:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false 
      });
    }
  },

  refreshDiscounts: async () => {
    await get().loadActiveDiscountsMap();
  }
}));
