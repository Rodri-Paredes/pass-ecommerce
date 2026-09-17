export interface ShopFilters {
  sizes: string[];
  colors: string[];
  fits: string[];
  styles: string[];
  price: { min: number; max: number };
  availableOnly: boolean;
}

export interface FilterFacets {
  sizes: string[];
  colors: string[];
  fits: string[];
  styles: string[];
}

export const EMPTY_FILTERS: ShopFilters = { sizes: [], colors: [], fits: [], styles: [], price: { min: 0, max: 10000 }, availableOnly: false };
