/*
  # PASS CLOTHING E-commerce Database Schema
  
  ## Overview
  Complete database schema for PASS CLOTHING online store including products, 
  variants, stock management, drops, and branches.
  
  ## Tables Created
  
  ### 1. branches
  - Stores physical store locations across Bolivia
  - Fields: id, name, address, city, created_at
  
  ### 2. drops
  - Limited edition product collections/launches
  - Fields: id, name, description, launch_date, end_date, status, is_featured, image_url, banner_url
  - Status values: ACTIVO, INACTIVO, FINALIZADO
  
  ### 3. products
  - Core product catalog
  - Fields: id, name, description, category, price, image_url, images (array), drop_id
  - Categories: Hoodies, Camisas, Pantalones, Shorts, Accesorios, Poleras, Gorras, Tops, TrackSuit Basic
  
  ### 4. product_variants
  - Product size variations
  - Fields: id, product_id, size
  - Sizes: XS, S, M, L, XL, XXL
  
  ### 5. stock
  - Inventory tracking per variant per branch
  - Fields: id, variant_id, branch_id, quantity
  
  ### 6. drop_products
  - Links products to drops with display order
  - Fields: id, drop_id, product_id, is_featured, sort_order
  
  ## Security
  - RLS enabled on all tables
  - Public read access for anonymous users (required for public store)
  - No write access from frontend (orders handled via WhatsApp)
  
  ## Indexes
  - Optimized for common queries (by category, drop, stock availability)
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create drops table
CREATE TABLE IF NOT EXISTS drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  launch_date timestamptz NOT NULL,
  end_date timestamptz,
  status text DEFAULT 'INACTIVO' CHECK (status IN ('ACTIVO', 'INACTIVO', 'FINALIZADO')),
  is_featured boolean DEFAULT false,
  image_url text,
  banner_url text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  images text[] DEFAULT ARRAY[]::text[],
  drop_id uuid REFERENCES drops(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size)
);

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(variant_id, branch_id)
);

-- Create drop_products junction table
CREATE TABLE IF NOT EXISTS drop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(drop_id, product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_drop_id ON products(drop_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_variant_id ON stock(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_branch_id ON stock(branch_id);
CREATE INDEX IF NOT EXISTS idx_drops_status ON drops(status);
CREATE INDEX IF NOT EXISTS idx_drops_featured ON drops(is_featured);
CREATE INDEX IF NOT EXISTS idx_drop_products_drop_id ON drop_products(drop_id);
CREATE INDEX IF NOT EXISTS idx_branches_city ON branches(city);

-- Enable Row Level Security
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anon users can browse the store)
CREATE POLICY "Public can read branches"
  ON branches FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can read drops"
  ON drops FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can read products"
  ON products FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can read product_variants"
  ON product_variants FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can read stock"
  ON stock FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can read drop_products"
  ON drop_products FOR SELECT
  TO anon
  USING (true);

-- Create function to update drop status automatically
CREATE OR REPLACE FUNCTION update_drop_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE drops
  SET status = 'ACTIVO'
  WHERE launch_date <= now()
    AND (end_date IS NULL OR end_date > now())
    AND status = 'INACTIVO';
  
  UPDATE drops
  SET status = 'FINALIZADO'
  WHERE end_date IS NOT NULL
    AND end_date <= now()
    AND status = 'ACTIVO';
END;
$$;

-- Create function to get products with stock info
CREATE OR REPLACE FUNCTION get_products_with_stock()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  price decimal,
  image_url text,
  images text[],
  drop_id uuid,
  total_stock bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.price,
    p.image_url,
    p.images,
    p.drop_id,
    COALESCE(SUM(s.quantity), 0) as total_stock
  FROM products p
  LEFT JOIN product_variants pv ON p.id = pv.product_id
  LEFT JOIN stock s ON pv.id = s.variant_id
  GROUP BY p.id, p.name, p.description, p.category, p.price, p.image_url, p.images, p.drop_id
  HAVING COALESCE(SUM(s.quantity), 0) > 0;
$$;