-- Migración para agregar tallas de pantalones
-- Fecha: 2025-10-30

-- Modificar la restricción de tallas para incluir tallas numéricas de pantalones
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_size_check;

-- Agregar nueva restricción que incluye tallas de ropa y pantalones
ALTER TABLE product_variants 
  ADD CONSTRAINT product_variants_size_check 
  CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38'));

-- Comentario sobre las tallas
COMMENT ON COLUMN product_variants.size IS 'Tallas disponibles: XS-XXL para ropa general, 28-38 para pantalones y shorts';
