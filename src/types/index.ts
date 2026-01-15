export interface Branch {
  id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export interface Drop {
  id: string;
  name: string;
  description: string | null;
  launch_date: string;
  end_date: string | null;
  status: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO';
  is_featured: boolean;
  image_url: string | null;
  banner_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string;
  images: string[];
  drop_id: string | null;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string; // Puede ser 'S' | 'M' | 'L' (poleras/hoodies) | '28' | '30' | '32' | '34' | '36' | '38' (pantalones)
  created_at: string;
}

export interface Stock {
  id: string;
  variant_id: string;
  branch_id: string;
  quantity: number;
  updated_at: string;
}

export interface DropProduct {
  id: string;
  drop_id: string;
  product_id: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductWithVariants extends Product {
  variants?: (ProductVariant & {
    stock?: (Stock & {
      branch?: Branch;
    })[];
    total_stock?: number;
  })[];
  drop?: Drop | null;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  availableStock: number;
}

export const CATEGORIES = [
  'Hoodies',
  'Poleras',
  'Pantalones',
  'Shorts',
  'Gorras',
  'TrackSuit Basic'
] as const;

export const CITIES = [
  'La Paz',
  'Cochabamba',
  'Santa Cruz',
  'Tarija',
  'Sucre',
  'Potosí',
  'Oruro',
  'Pando',
  'Beni'
] as const;

export const SIZES = ['S', 'M', 'L'] as const;

export const PANT_SIZES = ['28', '30', '32', '34', '36', '38'] as const;

// Categorías que usan tallas numéricas (pantalones y shorts)
export const NUMERIC_SIZE_CATEGORIES = ['Pantalones', 'Shorts'] as const;
