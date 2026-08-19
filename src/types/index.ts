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

export interface Discount {
  id: string;
  name: string;
  percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface DiscountProduct {
  id: string;
  discount_id: string;
  product_id: string;
  created_at: string;
}

export interface DiscountDrop {
  id: string;
  discount_id: string;
  drop_id: string;
  created_at: string;
}

// =============================================
// PASS CREW
// =============================================

export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrewPlan {
  id: string;
  code: string;
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  is_active: boolean;
  sort_order: number;
}

export interface CrewSettings {
  id: number;
  payment_qr_url: string | null;
  payment_instructions: string | null;
}

export interface CrewBenefit {
  id: string;
  plan_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

export type CrewRequestStatus = 'pending' | 'approved' | 'rejected';
export type CrewMembershipStatus = 'active' | 'expired' | 'suspended' | 'cancelled';

export interface CrewMembershipRequest {
  id: string;
  request_number: string;
  customer_id: string;
  plan_id: string;
  status: CrewRequestStatus;
  amount: number;
  currency: string;
  receipt_url: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  plan?: CrewPlan;
}

export interface CrewMembership {
  id: string;
  member_number: string;
  customer_id: string;
  plan_id: string;
  status: CrewMembershipStatus;
  started_at: string;
  expires_at: string;
  cancelled_at: string | null;
  source_request_id: string | null;
  created_at: string;
  updated_at: string;
  plan?: CrewPlan;
}

export interface ProductWithDiscount extends Product {
  discount: {
    percentage: number;
    name: string;
    source: 'product' | 'drop';
  };
  originalPrice: number;
  finalPrice: number;
  savings: number;
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

// Categorías que usan tallas numéricas (solo pantalones)
// Nota: Shorts puede tener ambos tipos de tallas, se determina dinámicamente por producto
export const NUMERIC_SIZE_CATEGORIES = ['Pantalones'] as const;
