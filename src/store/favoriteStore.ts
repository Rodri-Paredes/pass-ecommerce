import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteStore {
  productIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(persist((set, get) => ({
  productIds: [],
  toggleFavorite: (productId) => set((state) => ({ productIds: state.productIds.includes(productId) ? state.productIds.filter((id) => id !== productId) : [...state.productIds, productId] })),
  isFavorite: (productId) => get().productIds.includes(productId),
}), { name: 'pass-favorites' }));
