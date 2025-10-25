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
  drop_id: string | null;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
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
  'Camisas',
  'Pantalones',
  'Shorts',
  'Accesorios',
  'Poleras',
  'Gorras',
  'Tops',
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

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
