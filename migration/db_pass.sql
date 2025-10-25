-- ============================================================================
-- ARCHIVO CONSOLIDADO DE TODAS LAS MIGRACIONES
-- Sistema ERP PASS CLOTHING
-- Generado: 2025-10-25 00:08:12
-- ============================================================================


-- ============================================================================
-- MIGRACIÃ“N: 20250101_fix_mixed_payment_display.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250101_fix_mixed_payment_display.sql
-- ============================================================================

-- MigraciÃ³n para corregir la visualizaciÃ³n de pagos mixtos en el flujo de caja
-- Fecha: 2025-01-01
-- DescripciÃ³n: Agrega funciÃ³n para agrupar movimientos de ventas mixtas

-- FunciÃ³n para obtener movimientos de caja agrupados por venta
CREATE OR REPLACE FUNCTION get_cash_movements_grouped(p_cash_register_id uuid)
RETURNS TABLE (
  id uuid,
  movement_type text,
  payment_type text,
  amount decimal(10,2),
  description text,
  reference_id uuid,
  reference_type text,
  user_name text,
  created_at timestamptz,
  total_amount decimal(10,2),
  is_grouped boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH grouped_movements AS (
    SELECT 
      cm.reference_id,
      cm.reference_type,
      cm.movement_type,
      cm.user_id,
      cm.created_at,
      SUM(cm.amount) as total_amount,
      COUNT(*) as movement_count,
      MIN(cm.id) as first_id,
      MIN(cm.description) as description,
      MIN(u.name) as user_name
    FROM cash_movements cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.cash_register_id = p_cash_register_id
      AND cm.reference_type = 'SALE'
    GROUP BY cm.reference_id, cm.reference_type, cm.movement_type, cm.user_id, cm.created_at
    HAVING COUNT(*) > 1
  ),
  individual_movements AS (
    SELECT 
      cm.id,
      cm.movement_type,
      cm.payment_type,
      cm.amount,
      cm.description,
      cm.reference_id,
      cm.reference_type,
      u.name as user_name,
      cm.created_at,
      cm.amount as total_amount,
      false as is_grouped
    FROM cash_movements cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.cash_register_id = p_cash_register_id
      AND (cm.reference_type != 'SALE' OR cm.reference_id NOT IN (
        SELECT reference_id FROM grouped_movements
      ))
  )
  SELECT 
    COALESCE(gm.first_id, im.id) as id,
    im.movement_type,
    CASE 
      WHEN gm.reference_id IS NOT NULL THEN 'MIXTO'
      ELSE im.payment_type
    END as payment_type,
    im.amount,
    im.description,
    im.reference_id,
    im.reference_type,
    im.user_name,
    im.created_at,
    COALESCE(gm.total_amount, im.total_amount) as total_amount,
    COALESCE(gm.reference_id IS NOT NULL, im.is_grouped) as is_grouped
  FROM individual_movements im
  LEFT JOIN grouped_movements gm ON im.reference_id = gm.reference_id
  ORDER BY im.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario sobre la funciÃ³n
COMMENT ON FUNCTION get_cash_movements_grouped IS 'Obtiene movimientos de caja agrupando ventas mixtas para mostrar el monto total correcto en el flujo de caja';


-- ============================================================================
-- MIGRACIÃ“N: 20250101_fix_stock_loss.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250101_fix_stock_loss.sql
-- ============================================================================

-- MIGRACIÃ“N: SOLUCIÃ“N DEFINITIVA PARA PÃ‰RDIDA DE STOCK
-- Fecha: 2025-01-01
-- Problema: Se pierde 1 unidad de stock al actualizar productos
-- SoluciÃ³n: FunciÃ³n transaccional que garantiza atomicidad

-- 1. ELIMINAR TRIGGER PROBLEMÃTICO
-- El trigger BEFORE UPDATE puede estar causando problemas
DROP TRIGGER IF EXISTS trigger_update_stock_updated_at ON stock;

-- 2. CREAR FUNCIÃ“N TRANSACCIONAL PARA ACTUALIZAR STOCK
CREATE OR REPLACE FUNCTION update_stock_safe(
  p_variant_id uuid,
  p_branch_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock_id uuid;
  v_current_quantity integer;
BEGIN
  -- Iniciar transacciÃ³n implÃ­cita
  -- Buscar si existe el registro de stock
  SELECT id, quantity INTO v_stock_id, v_current_quantity
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_branch_id
  FOR UPDATE; -- Bloquear la fila para evitar modificaciones concurrentes
  
  IF FOUND THEN
    -- Actualizar stock existente
    UPDATE stock 
    SET 
      quantity = p_quantity,
      updated_at = now()
    WHERE id = v_stock_id;
    
    -- Verificar que se actualizÃ³ correctamente
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Error al actualizar stock: no se pudo modificar la fila';
    END IF;
    
    -- Verificar que la cantidad se guardÃ³ correctamente
    SELECT quantity INTO v_current_quantity
    FROM stock
    WHERE id = v_stock_id;
    
    IF v_current_quantity != p_quantity THEN
      RAISE EXCEPTION 'Error de integridad: cantidad esperada % pero se guardÃ³ %', p_quantity, v_current_quantity;
    END IF;
    
  ELSE
    -- Crear nuevo registro de stock
    INSERT INTO stock (variant_id, branch_id, quantity, created_at, updated_at)
    VALUES (p_variant_id, p_branch_id, p_quantity, now(), now());
    
    -- Verificar que se creÃ³ correctamente
    SELECT id, quantity INTO v_stock_id, v_current_quantity
    FROM stock
    WHERE variant_id = p_variant_id AND branch_id = p_branch_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Error al crear stock: no se pudo insertar la fila';
    END IF;
    
    IF v_current_quantity != p_quantity THEN
      RAISE EXCEPTION 'Error de integridad: cantidad esperada % pero se guardÃ³ %', p_quantity, v_current_quantity;
    END IF;
  END IF;
  
  -- Si llegamos aquÃ­, todo saliÃ³ bien
  -- La transacciÃ³n se confirma automÃ¡ticamente
END;
$$;

-- 3. CREAR TRIGGER MEJORADO PARA updated_at
-- Solo se ejecuta si realmente hay cambios en la cantidad
CREATE OR REPLACE FUNCTION update_stock_updated_at_safe()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar updated_at si la cantidad cambiÃ³
  IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger AFTER UPDATE para evitar interferir con la lÃ³gica principal
CREATE TRIGGER trigger_update_stock_updated_at_safe
  AFTER UPDATE ON stock
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_updated_at_safe();

-- 4. CREAR ÃNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_stock_variant_branch_unique ON stock(variant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_quantity ON stock(quantity);

-- 5. VERIFICAR QUE LA FUNCIÃ“N FUNCIONA
-- Esta consulta deberÃ­a devolver true si todo estÃ¡ bien
SELECT 
  'FunciÃ³n update_stock_safe creada correctamente' as status,
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'update_stock_safe';

-- ============================================================================
-- MIGRACIÃ“N: 20250112_fix_timezone_conversion.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250112_fix_timezone_conversion.sql
-- ============================================================================

-- Fix timezone conversion in get_daily_sales_local function
-- The issue is that we're double-converting the timezone

CREATE OR REPLACE FUNCTION get_daily_sales_local(
  p_branch_id uuid,
  p_day date
)
RETURNS SETOF sales AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM sales
  WHERE branch_id = p_branch_id
    AND (sale_date AT TIME ZONE 'America/La_Paz')::date = p_day
  ORDER BY sale_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Also fix the other functions to use the same logic
CREATE OR REPLACE FUNCTION get_daily_cash_movements_local(
  p_branch_id uuid,
  p_day date
)
RETURNS SETOF cash_movements AS $$
BEGIN
  RETURN QUERY
  SELECT cm.*
  FROM cash_movements cm
  JOIN cash_registers cr ON cr.id = cm.cash_register_id
  WHERE cr.branch_id = p_branch_id
    AND cm.reference_id IS NULL
    AND (cm.created_at AT TIME ZONE 'America/La_Paz')::date = p_day
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- MIGRACIÃ“N: 20250113_add_is_visible_to_products.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250113_add_is_visible_to_products.sql
-- ============================================================================

-- MigraciÃ³n para agregar el campo is_visible a la tabla products
-- Este campo permitirÃ¡ ocultar/mostrar productos en la interfaz

-- Agregar el campo is_visible a la tabla products
ALTER TABLE products 
ADD COLUMN is_visible boolean NOT NULL DEFAULT true;

-- Crear un comentario para documentar el campo
COMMENT ON COLUMN products.is_visible IS 'Indica si el producto es visible en la interfaz de usuario. true = visible, false = oculto';

-- Actualizar productos existentes para que sean visibles por defecto
UPDATE products SET is_visible = true WHERE is_visible IS NULL;

-- Crear un Ã­ndice para optimizar las consultas por visibilidad
CREATE INDEX idx_products_is_visible ON products(is_visible);

-- Crear una funciÃ³n para obtener solo productos visibles
CREATE OR REPLACE FUNCTION get_visible_products()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  price decimal(10,2),
  image_url text,
  is_visible boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.price,
    p.image_url,
    p.is_visible,
    p.created_at
  FROM products p
  WHERE p.is_visible = true
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Crear una funciÃ³n para obtener productos visibles con paginaciÃ³n
CREATE OR REPLACE FUNCTION get_visible_products_paginated(
  page_size integer DEFAULT 20,
  page_offset integer DEFAULT 0,
  search_term text DEFAULT NULL,
  category_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  price decimal(10,2),
  image_url text,
  is_visible boolean,
  created_at timestamptz,
  total_count bigint
) AS $$
DECLARE
  total_count bigint;
BEGIN
  -- Calcular el total de productos visibles que coinciden con los filtros
  SELECT COUNT(*) INTO total_count
  FROM products p
  WHERE p.is_visible = true
    AND (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR p.description ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR p.category = category_filter);

  -- Retornar los productos con paginaciÃ³n
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.price,
    p.image_url,
    p.is_visible,
    p.created_at,
    total_count
  FROM products p
  WHERE p.is_visible = true
    AND (search_term IS NULL OR p.name ILIKE '%' || search_term || '%' OR p.description ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY p.created_at DESC
  LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Crear una funciÃ³n para alternar la visibilidad de un producto
CREATE OR REPLACE FUNCTION toggle_product_visibility(product_id uuid)
RETURNS boolean AS $$
DECLARE
  new_visibility boolean;
BEGIN
  -- Obtener el estado actual y cambiarlo
  UPDATE products 
  SET is_visible = NOT is_visible
  WHERE id = product_id
  RETURNING is_visible INTO new_visibility;
  
  -- Si no se actualizÃ³ ningÃºn registro, el producto no existe
  IF new_visibility IS NULL THEN
    RAISE EXCEPTION 'Producto con ID % no encontrado', product_id;
  END IF;
  
  RETURN new_visibility;
END;
$$ LANGUAGE plpgsql;

-- Crear una funciÃ³n para actualizar la visibilidad de un producto
CREATE OR REPLACE FUNCTION update_product_visibility(product_id uuid, visible boolean)
RETURNS boolean AS $$
DECLARE
  updated_visibility boolean;
BEGIN
  -- Actualizar la visibilidad del producto
  UPDATE products 
  SET is_visible = visible
  WHERE id = product_id
  RETURNING is_visible INTO updated_visibility;
  
  -- Si no se actualizÃ³ ningÃºn registro, el producto no existe
  IF updated_visibility IS NULL THEN
    RAISE EXCEPTION 'Producto con ID % no encontrado', product_id;
  END IF;
  
  RETURN updated_visibility;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- MIGRACIÃ“N: 20250113_add_previous_month_revenue_report.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250113_add_previous_month_revenue_report.sql
-- ============================================================================

-- MigraciÃ³n para agregar reporte de ingresos del mes anterior (VERSIÃ“N CORREGIDA)
-- Este reporte calcula el total de ingresos del mes anterior para el dashboard

-- FunciÃ³n para obtener el reporte de ingresos del mes anterior
CREATE OR REPLACE FUNCTION get_previous_month_revenue_report(
  branch_id_param uuid
)
RETURNS TABLE(
  start_date date,
  end_date date,
  total_revenue decimal(10,2),
  total_sales_count integer,
  average_sale_amount decimal(10,2),
  revenue_by_payment_type jsonb
) AS $$
DECLARE
  prev_month_start date;
  prev_month_end date;
BEGIN
  -- Calcular el primer dÃ­a del mes anterior
  prev_month_start := date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date;
  
  -- Calcular el Ãºltimo dÃ­a del mes anterior
  prev_month_end := (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day')::date;

  RETURN QUERY
  SELECT 
    prev_month_start as start_date,
    prev_month_end as end_date,
    COALESCE(SUM(s.total), 0) as total_revenue,
    COUNT(s.id) as total_sales_count,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total), 0) / COUNT(s.id)
      ELSE 0
    END as average_sale_amount,
    jsonb_build_object(
      'efectivo', COALESCE(SUM(CASE WHEN s.payment_type = 'EFECTIVO' THEN s.total ELSE 0 END), 0),
      'qr', COALESCE(SUM(CASE WHEN s.payment_type = 'QR' THEN s.total ELSE 0 END), 0),
      'tarjeta', COALESCE(SUM(CASE WHEN s.payment_type = 'TARJETA' THEN s.total ELSE 0 END), 0),
      'mixto', COALESCE(SUM(CASE WHEN s.payment_type = 'MIXTO' THEN s.total ELSE 0 END), 0)
    ) as revenue_by_payment_type
  FROM sales s
  WHERE s.branch_id = branch_id_param
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= prev_month_start
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= prev_month_end;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para obtener el reporte de ingresos de un mes especÃ­fico
CREATE OR REPLACE FUNCTION get_monthly_revenue_report(
  branch_id_param uuid,
  year_param integer,
  month_param integer
)
RETURNS TABLE(
  start_date date,
  end_date date,
  total_revenue decimal(10,2),
  total_sales_count integer,
  average_sale_amount decimal(10,2),
  revenue_by_payment_type jsonb,
  daily_revenue jsonb
) AS $$
DECLARE
  month_start date;
  month_end date;
BEGIN
  -- Calcular el primer dÃ­a del mes especificado
  month_start := make_date(year_param, month_param, 1);
  
  -- Calcular el Ãºltimo dÃ­a del mes especificado
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::date;

  RETURN QUERY
  WITH daily_sales AS (
    SELECT 
      (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date as sale_day,
      SUM(s.total) as daily_total,
      COUNT(s.id) as daily_count
    FROM sales s
    WHERE s.branch_id = branch_id_param
      AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= month_start
      AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= month_end
    GROUP BY (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date
    ORDER BY sale_day
  )
  SELECT 
    month_start as start_date,
    month_end as end_date,
    COALESCE(SUM(s.total), 0) as total_revenue,
    COUNT(s.id) as total_sales_count,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total), 0) / COUNT(s.id)
      ELSE 0
    END as average_sale_amount,
    jsonb_build_object(
      'efectivo', COALESCE(SUM(CASE WHEN s.payment_type = 'EFECTIVO' THEN s.total ELSE 0 END), 0),
      'qr', COALESCE(SUM(CASE WHEN s.payment_type = 'QR' THEN s.total ELSE 0 END), 0),
      'tarjeta', COALESCE(SUM(CASE WHEN s.payment_type = 'TARJETA' THEN s.total ELSE 0 END), 0),
      'mixto', COALESCE(SUM(CASE WHEN s.payment_type = 'MIXTO' THEN s.total ELSE 0 END), 0)
    ) as revenue_by_payment_type,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', sale_day,
          'total', daily_total,
          'count', daily_count
        )
      )
      FROM daily_sales
    ) as daily_revenue
  FROM sales s
  WHERE s.branch_id = branch_id_param
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= month_start
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= month_end;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para comparar ingresos entre el mes actual y el anterior
CREATE OR REPLACE FUNCTION get_monthly_revenue_comparison(
  branch_id_param uuid
)
RETURNS TABLE(
  current_month_start date,
  current_month_end date,
  current_month_revenue decimal(10,2),
  current_month_sales_count integer,
  previous_month_start date,
  previous_month_end date,
  previous_month_revenue decimal(10,2),
  previous_month_sales_count integer,
  revenue_change decimal(10,2),
  revenue_change_percentage decimal(5,2),
  sales_count_change integer,
  sales_count_change_percentage decimal(5,2)
) AS $$
DECLARE
  current_month_start date;
  current_month_end date;
  previous_month_start date;
  previous_month_end date;
  current_revenue decimal(10,2);
  previous_revenue decimal(10,2);
  current_count integer;
  previous_count integer;
BEGIN
  -- Calcular fechas del mes actual
  current_month_start := date_trunc('month', CURRENT_DATE)::date;
  current_month_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date;
  
  -- Calcular fechas del mes anterior
  previous_month_start := date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date;
  previous_month_end := (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day')::date;

  -- Obtener ingresos del mes actual
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(id)
  INTO current_revenue, current_count
  FROM sales
  WHERE branch_id = branch_id_param
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= current_month_start
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= current_month_end;

  -- Obtener ingresos del mes anterior
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(id)
  INTO previous_revenue, previous_count
  FROM sales
  WHERE branch_id = branch_id_param
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= previous_month_start
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= previous_month_end;

  RETURN QUERY
  SELECT 
    current_month_start,
    current_month_end,
    current_revenue,
    current_count,
    previous_month_start,
    previous_month_end,
    previous_revenue,
    previous_count,
    (current_revenue - previous_revenue) as revenue_change,
    CASE 
      WHEN previous_revenue > 0 THEN ((current_revenue - previous_revenue) / previous_revenue * 100)
      WHEN current_revenue > 0 THEN 100.00
      ELSE 0.00
    END as revenue_change_percentage,
    (current_count - previous_count) as sales_count_change,
    CASE 
      WHEN previous_count > 0 THEN ((current_count - previous_count)::decimal / previous_count * 100)
      WHEN current_count > 0 THEN 100.00
      ELSE 0.00
    END as sales_count_change_percentage;
END;
$$ LANGUAGE plpgsql;

-- Crear comentarios para documentar las funciones
COMMENT ON FUNCTION get_previous_month_revenue_report(uuid) IS 'Obtiene el reporte completo de ingresos del mes anterior para una sucursal especÃ­fica';
COMMENT ON FUNCTION get_monthly_revenue_report(uuid, integer, integer) IS 'Obtiene el reporte completo de ingresos de un mes especÃ­fico para una sucursal';
COMMENT ON FUNCTION get_monthly_revenue_comparison(uuid) IS 'Compara los ingresos del mes actual con el mes anterior, incluyendo porcentajes de cambio';

-- Crear Ã­ndice simple para consultas por tipo de pago
CREATE INDEX IF NOT EXISTS idx_sales_branch_payment_type ON sales (branch_id, payment_type);

-- ============================================================================
-- MIGRACIÃ“N: 20250113_add_previous_month_revenue_report_fixed.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250113_add_previous_month_revenue_report_fixed.sql
-- ============================================================================

-- MigraciÃ³n para agregar reporte de ingresos del mes anterior (VERSIÃ“N CORREGIDA)
-- Este reporte calcula el total de ingresos del mes anterior para el dashboard

-- FunciÃ³n para obtener el reporte de ingresos del mes anterior
CREATE OR REPLACE FUNCTION get_previous_month_revenue_report(
  branch_id_param uuid
)
RETURNS TABLE(
  start_date date,
  end_date date,
  total_revenue decimal(10,2),
  total_sales_count integer,
  average_sale_amount decimal(10,2),
  revenue_by_payment_type jsonb
) AS $$
DECLARE
  prev_month_start date;
  prev_month_end date;
BEGIN
  -- Calcular el primer dÃ­a del mes anterior
  prev_month_start := date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date;
  
  -- Calcular el Ãºltimo dÃ­a del mes anterior
  prev_month_end := (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day')::date;

  RETURN QUERY
  SELECT 
    prev_month_start as start_date,
    prev_month_end as end_date,
    COALESCE(SUM(s.total), 0) as total_revenue,
    COUNT(s.id) as total_sales_count,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total), 0) / COUNT(s.id)
      ELSE 0
    END as average_sale_amount,
    jsonb_build_object(
      'efectivo', COALESCE(SUM(CASE WHEN s.payment_type = 'EFECTIVO' THEN s.total ELSE 0 END), 0),
      'qr', COALESCE(SUM(CASE WHEN s.payment_type = 'QR' THEN s.total ELSE 0 END), 0),
      'tarjeta', COALESCE(SUM(CASE WHEN s.payment_type = 'TARJETA' THEN s.total ELSE 0 END), 0),
      'mixto', COALESCE(SUM(CASE WHEN s.payment_type = 'MIXTO' THEN s.total ELSE 0 END), 0)
    ) as revenue_by_payment_type
  FROM sales s
  WHERE s.branch_id = branch_id_param
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= prev_month_start
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= prev_month_end;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para obtener el reporte de ingresos de un mes especÃ­fico
CREATE OR REPLACE FUNCTION get_monthly_revenue_report(
  branch_id_param uuid,
  year_param integer,
  month_param integer
)
RETURNS TABLE(
  start_date date,
  end_date date,
  total_revenue decimal(10,2),
  total_sales_count integer,
  average_sale_amount decimal(10,2),
  revenue_by_payment_type jsonb,
  daily_revenue jsonb
) AS $$
DECLARE
  month_start date;
  month_end date;
BEGIN
  -- Calcular el primer dÃ­a del mes especificado
  month_start := make_date(year_param, month_param, 1);
  
  -- Calcular el Ãºltimo dÃ­a del mes especificado
  month_end := (month_start + INTERVAL '1 month' - INTERVAL '1 day')::date;

  RETURN QUERY
  WITH daily_sales AS (
    SELECT 
      (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date as sale_day,
      SUM(s.total) as daily_total,
      COUNT(s.id) as daily_count
    FROM sales s
    WHERE s.branch_id = branch_id_param
      AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= month_start
      AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= month_end
    GROUP BY (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date
    ORDER BY sale_day
  )
  SELECT 
    month_start as start_date,
    month_end as end_date,
    COALESCE(SUM(s.total), 0) as total_revenue,
    COUNT(s.id) as total_sales_count,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total), 0) / COUNT(s.id)
      ELSE 0
    END as average_sale_amount,
    jsonb_build_object(
      'efectivo', COALESCE(SUM(CASE WHEN s.payment_type = 'EFECTIVO' THEN s.total ELSE 0 END), 0),
      'qr', COALESCE(SUM(CASE WHEN s.payment_type = 'QR' THEN s.total ELSE 0 END), 0),
      'tarjeta', COALESCE(SUM(CASE WHEN s.payment_type = 'TARJETA' THEN s.total ELSE 0 END), 0),
      'mixto', COALESCE(SUM(CASE WHEN s.payment_type = 'MIXTO' THEN s.total ELSE 0 END), 0)
    ) as revenue_by_payment_type,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', sale_day,
          'total', daily_total,
          'count', daily_count
        )
      )
      FROM daily_sales
    ) as daily_revenue
  FROM sales s
  WHERE s.branch_id = branch_id_param
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= month_start
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= month_end;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para comparar ingresos entre el mes actual y el anterior
CREATE OR REPLACE FUNCTION get_monthly_revenue_comparison(
  branch_id_param uuid
)
RETURNS TABLE(
  current_month_start date,
  current_month_end date,
  current_month_revenue decimal(10,2),
  current_month_sales_count integer,
  previous_month_start date,
  previous_month_end date,
  previous_month_revenue decimal(10,2),
  previous_month_sales_count integer,
  revenue_change decimal(10,2),
  revenue_change_percentage decimal(5,2),
  sales_count_change integer,
  sales_count_change_percentage decimal(5,2)
) AS $$
DECLARE
  current_month_start date;
  current_month_end date;
  previous_month_start date;
  previous_month_end date;
  current_revenue decimal(10,2);
  previous_revenue decimal(10,2);
  current_count integer;
  previous_count integer;
BEGIN
  -- Calcular fechas del mes actual
  current_month_start := date_trunc('month', CURRENT_DATE)::date;
  current_month_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date;
  
  -- Calcular fechas del mes anterior
  previous_month_start := date_trunc('month', CURRENT_DATE - INTERVAL '1 month')::date;
  previous_month_end := (date_trunc('month', CURRENT_DATE) - INTERVAL '1 day')::date;

  -- Obtener ingresos del mes actual
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(id)
  INTO current_revenue, current_count
  FROM sales
  WHERE branch_id = branch_id_param
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= current_month_start
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= current_month_end;

  -- Obtener ingresos del mes anterior
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(id)
  INTO previous_revenue, previous_count
  FROM sales
  WHERE branch_id = branch_id_param
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date >= previous_month_start
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date <= previous_month_end;

  RETURN QUERY
  SELECT 
    current_month_start,
    current_month_end,
    current_revenue,
    current_count,
    previous_month_start,
    previous_month_end,
    previous_revenue,
    previous_count,
    (current_revenue - previous_revenue) as revenue_change,
    CASE 
      WHEN previous_revenue > 0 THEN ((current_revenue - previous_revenue) / previous_revenue * 100)
      WHEN current_revenue > 0 THEN 100.00
      ELSE 0.00
    END as revenue_change_percentage,
    (current_count - previous_count) as sales_count_change,
    CASE 
      WHEN previous_count > 0 THEN ((current_count - previous_count)::decimal / previous_count * 100)
      WHEN current_count > 0 THEN 100.00
      ELSE 0.00
    END as sales_count_change_percentage;
END;
$$ LANGUAGE plpgsql;

-- Crear comentarios para documentar las funciones
COMMENT ON FUNCTION get_previous_month_revenue_report(uuid) IS 'Obtiene el reporte completo de ingresos del mes anterior para una sucursal especÃ­fica';
COMMENT ON FUNCTION get_monthly_revenue_report(uuid, integer, integer) IS 'Obtiene el reporte completo de ingresos de un mes especÃ­fico para una sucursal';
COMMENT ON FUNCTION get_monthly_revenue_comparison(uuid) IS 'Compara los ingresos del mes actual con el mes anterior, incluyendo porcentajes de cambio';

-- Crear Ã­ndice simple para consultas por tipo de pago
CREATE INDEX IF NOT EXISTS idx_sales_branch_payment_type ON sales (branch_id, payment_type);


-- ============================================================================
-- MIGRACIÃ“N: 20250113_fix_critical_issues.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250113_fix_critical_issues.sql
-- ============================================================================

-- MIGRACIÃ“N: CORRECCIÃ“N DE PROBLEMAS CRÃTICOS
-- Fecha: 2025-01-13
-- Problemas a corregir:
-- 1. Stock fantasma entre sucursales
-- 2. Productos sin stock que aparecen con stock
-- 3. ImÃ¡genes perdidas
-- 4. Funcionalidad de eliminaciÃ³n

-- ===========================================
-- 1. LIMPIAR STOCK FANTASMA
-- ===========================================

-- Eliminar registros de stock con cantidad 0 o negativa
DELETE FROM stock WHERE quantity <= 0;

-- Eliminar registros de stock duplicados (mantener solo el mÃ¡s reciente)
WITH duplicate_stock AS (
  SELECT 
    variant_id,
    branch_id,
    id,
    ROW_NUMBER() OVER (
      PARTITION BY variant_id, branch_id 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM stock
)
DELETE FROM stock 
WHERE id IN (
  SELECT id FROM duplicate_stock WHERE rn > 1
);

-- ===========================================
-- 2. CORREGIR PRODUCTOS SIN VARIANTES
-- ===========================================

-- Crear variantes para productos que no las tienen
INSERT INTO product_variants (product_id, size)
SELECT 
  p.id,
  'M' -- Talla por defecto
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv 
  WHERE pv.product_id = p.id
);

-- ===========================================
-- 3. CORREGIR STOCK SIN VARIANTES
-- ===========================================

-- Eliminar stock que no tiene variante vÃ¡lida
DELETE FROM stock 
WHERE variant_id NOT IN (
  SELECT id FROM product_variants
);

-- ===========================================
-- 4. ACTUALIZAR FUNCIÃ“N DE ELIMINACIÃ“N SEGURA
-- ===========================================

-- FunciÃ³n para eliminar producto con todas sus dependencias
CREATE OR REPLACE FUNCTION delete_product_safe(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_name text;
  v_image_url text;
BEGIN
  -- Obtener informaciÃ³n del producto
  SELECT name, image_url INTO v_product_name, v_image_url
  FROM products 
  WHERE id = p_product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado: %', p_product_id;
  END IF;
  
  -- Log de inicio
  RAISE NOTICE 'Eliminando producto: % (ID: %)', v_product_name, p_product_id;
  
  -- Eliminar stock primero (para evitar problemas de FK)
  DELETE FROM stock 
  WHERE variant_id IN (
    SELECT id FROM product_variants WHERE product_id = p_product_id
  );
  
  -- Eliminar variantes
  DELETE FROM product_variants WHERE product_id = p_product_id;
  
  -- Eliminar el producto
  DELETE FROM products WHERE id = p_product_id;
  
  -- Log de Ã©xito
  RAISE NOTICE 'Producto eliminado exitosamente: %', v_product_name;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error eliminando producto %: %', v_product_name, SQLERRM;
END;
$$;

-- ===========================================
-- 5. MEJORAR POLÃTICAS DE STORAGE
-- ===========================================

-- Eliminar polÃ­ticas existentes de storage
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Crear polÃ­ticas mejoradas
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- ===========================================
-- 6. FUNCIÃ“N PARA LIMPIAR IMÃGENES HUÃ‰RFANAS
-- ===========================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS TABLE(
  image_name text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Buscar imÃ¡genes en storage que no estÃ¡n referenciadas en products
  FOR rec IN
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'products'
      AND name NOT IN (
        SELECT 
          CASE 
            WHEN image_url LIKE '%/products/%' THEN 
              substring(image_url from '.*/products/(.*)$')
            ELSE NULL
          END
        FROM products 
        WHERE image_url IS NOT NULL
      )
  LOOP
    -- Intentar eliminar la imagen huÃ©rfana
    BEGIN
      DELETE FROM storage.objects 
      WHERE bucket_id = 'products' AND name = rec.name;
      
      image_name := rec.name;
      status := 'ELIMINADA';
      RETURN NEXT;
      
    EXCEPTION
      WHEN OTHERS THEN
        image_name := rec.name;
        status := 'ERROR: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- ===========================================
-- 7. ÃNDICES PARA MEJOR RENDIMIENTO
-- ===========================================

-- Ãndices para bÃºsquedas de stock
CREATE INDEX IF NOT EXISTS idx_stock_variant_branch ON stock(variant_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_quantity ON stock(quantity);
CREATE INDEX IF NOT EXISTS idx_stock_branch_quantity ON stock(branch_id, quantity);

-- Ãndices para product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_size ON product_variants(product_id, size);

-- Ãndices para products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ===========================================
-- 8. TRIGGER PARA LIMPIAR IMÃGENES AL ELIMINAR PRODUCTOS
-- ===========================================

-- FunciÃ³n trigger para limpiar imÃ¡genes
CREATE OR REPLACE FUNCTION cleanup_product_image()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_image_name text;
BEGIN
  -- Si el producto tenÃ­a una imagen, intentar eliminarla del storage
  IF OLD.image_url IS NOT NULL AND OLD.image_url LIKE '%/products/%' THEN
    v_image_name := substring(OLD.image_url from '.*/products/(.*)$');
    
    IF v_image_name IS NOT NULL THEN
      BEGIN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'products' AND name = v_image_name;
        
        RAISE NOTICE 'Imagen eliminada del storage: %', v_image_name;
        
      EXCEPTION
        WHEN OTHERS THEN
          RAISE WARNING 'No se pudo eliminar imagen del storage: % - %', v_image_name, SQLERRM;
      END;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_cleanup_product_image ON products;
CREATE TRIGGER trigger_cleanup_product_image
  BEFORE DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_product_image();

-- ===========================================
-- 9. VERIFICACIÃ“N FINAL
-- ===========================================

-- Verificar que no hay productos sin variantes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM products p 
    WHERE NOT EXISTS (
      SELECT 1 FROM product_variants pv 
      WHERE pv.product_id = p.id
    )
  ) THEN
    RAISE WARNING 'AÃºn existen productos sin variantes';
  ELSE
    RAISE NOTICE 'Todos los productos tienen variantes';
  END IF;
END;
$$;

-- Verificar que no hay stock sin variantes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM stock s 
    WHERE NOT EXISTS (
      SELECT 1 FROM product_variants pv 
      WHERE pv.id = s.variant_id
    )
  ) THEN
    RAISE WARNING 'AÃºn existe stock sin variantes';
  ELSE
    RAISE NOTICE 'Todo el stock tiene variantes vÃ¡lidas';
  END IF;
END;
$$;

-- Mostrar resumen de cambios
SELECT 
  'MIGRACIÃ“N COMPLETADA' as status,
  (SELECT COUNT(*) FROM products) as total_productos,
  (SELECT COUNT(*) FROM product_variants) as total_variantes,
  (SELECT COUNT(*) FROM stock) as total_stock,
  (SELECT COUNT(*) FROM stock WHERE quantity > 0) as stock_con_cantidad;


-- ============================================================================
-- MIGRACIÃ“N: 20250114_add_drops_system.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250114_add_drops_system.sql
-- ============================================================================

-- MIGRACIÃ“N: Sistema de Drops para PASS CLOTHING
-- Agrega funcionalidad para gestionar lanzamientos y colecciones de productos

-- 1. CREAR TABLA DROPS
CREATE TABLE IF NOT EXISTS drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  launch_date timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO', 'INACTIVO', 'FINALIZADO')),
  is_featured boolean DEFAULT false,
  image_url text,
  banner_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CREAR TABLA DROP_PRODUCTS (relaciÃ³n muchos a muchos entre drops y products)
CREATE TABLE IF NOT EXISTS drop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(drop_id, product_id)
);

-- 3. AGREGAR COLUMNA DROP_ID A PRODUCTS (opcional, para drops principales)
ALTER TABLE products ADD COLUMN IF NOT EXISTS drop_id uuid REFERENCES drops(id);

-- 4. HABILITAR ROW LEVEL SECURITY
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_products ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÃTICAS RLS PARA DROPS
CREATE POLICY "Authenticated users can read drops"
  ON drops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert drops"
  ON drops FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update drops"
  ON drops FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete drops"
  ON drops FOR DELETE
  TO authenticated
  USING (true);

-- 6. CREAR POLÃTICAS RLS PARA DROP_PRODUCTS
CREATE POLICY "Authenticated users can read drop_products"
  ON drop_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert drop_products"
  ON drop_products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update drop_products"
  ON drop_products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete drop_products"
  ON drop_products FOR DELETE
  TO authenticated
  USING (true);

-- 7. CREAR ÃNDICES PARA OPTIMIZACIÃ“N
CREATE INDEX IF NOT EXISTS idx_drops_status ON drops(status);
CREATE INDEX IF NOT EXISTS idx_drops_launch_date ON drops(launch_date);
CREATE INDEX IF NOT EXISTS idx_drops_featured ON drops(is_featured);
CREATE INDEX IF NOT EXISTS idx_drop_products_drop_id ON drop_products(drop_id);
CREATE INDEX IF NOT EXISTS idx_drop_products_product_id ON drop_products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_drop_id ON products(drop_id);

-- 8. CREAR FUNCIONES ÃšTILES PARA DROPS

-- FunciÃ³n para obtener productos de un drop especÃ­fico
CREATE OR REPLACE FUNCTION get_drop_products(drop_id_param uuid)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  product_description text,
  product_category text,
  product_price decimal(10,2),
  product_image_url text,
  is_featured boolean,
  sort_order integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.price,
    p.image_url,
    dp.is_featured,
    dp.sort_order
  FROM products p
  JOIN drop_products dp ON p.id = dp.product_id
  WHERE dp.drop_id = drop_id_param
  ORDER BY dp.sort_order ASC, p.name ASC;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para obtener drops activos
CREATE OR REPLACE FUNCTION get_active_drops()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  launch_date timestamptz,
  end_date timestamptz,
  status text,
  is_featured boolean,
  image_url text,
  banner_url text,
  product_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.launch_date,
    d.end_date,
    d.status,
    d.is_featured,
    d.image_url,
    d.banner_url,
    COUNT(dp.product_id) as product_count
  FROM drops d
  LEFT JOIN drop_products dp ON d.id = dp.drop_id
  WHERE d.status = 'ACTIVO'
  GROUP BY d.id, d.name, d.description, d.launch_date, d.end_date, d.status, d.is_featured, d.image_url, d.banner_url
  ORDER BY d.is_featured DESC, d.launch_date DESC;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para obtener drops destacados
CREATE OR REPLACE FUNCTION get_featured_drops()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  launch_date timestamptz,
  end_date timestamptz,
  status text,
  is_featured boolean,
  image_url text,
  banner_url text,
  product_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.launch_date,
    d.end_date,
    d.status,
    d.is_featured,
    d.image_url,
    d.banner_url,
    COUNT(dp.product_id) as product_count
  FROM drops d
  LEFT JOIN drop_products dp ON d.id = dp.drop_id
  WHERE d.status = 'ACTIVO' AND d.is_featured = true
  GROUP BY d.id, d.name, d.description, d.launch_date, d.end_date, d.status, d.is_featured, d.image_url, d.banner_url
  ORDER BY d.launch_date DESC;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para actualizar el estado de drops basado en fechas
CREATE OR REPLACE FUNCTION update_drop_status()
RETURNS void AS $$
BEGIN
  -- Marcar drops como finalizados si han pasado su fecha de fin
  UPDATE drops 
  SET status = 'FINALIZADO', updated_at = now()
  WHERE status = 'ACTIVO' 
    AND end_date IS NOT NULL 
    AND end_date < now();
    
  -- Marcar drops como activos si han llegado a su fecha de lanzamiento
  UPDATE drops 
  SET status = 'ACTIVO', updated_at = now()
  WHERE status = 'INACTIVO' 
    AND launch_date <= now()
    AND (end_date IS NULL OR end_date > now());
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_drops_updated_at
  BEFORE UPDATE ON drops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. INSERTAR DATOS DE PRUEBA (OPCIONAL)
INSERT INTO drops (name, description, launch_date, end_date, status, is_featured, image_url) VALUES
  ('ColecciÃ³n Verano 2024', 'Nueva colecciÃ³n de verano con diseÃ±os frescos y colores vibrantes', '2024-01-15 00:00:00', '2024-03-31 23:59:59', 'ACTIVO', true, 'https://example.com/summer-collection.jpg'),
  ('Drop Limitado Streetwear', 'EdiciÃ³n limitada de streetwear con diseÃ±os exclusivos', '2024-01-20 00:00:00', '2024-02-29 23:59:59', 'ACTIVO', false, 'https://example.com/streetwear-drop.jpg'),
  ('ColecciÃ³n BÃ¡sicos', 'Piezas esenciales para el guardarropa', '2024-01-10 00:00:00', '2024-12-31 23:59:59', 'ACTIVO', false, 'https://example.com/basics-collection.jpg');

-- 11. COMENTARIOS EN LAS TABLAS
COMMENT ON TABLE drops IS 'Tabla para gestionar lanzamientos y colecciones de productos';
COMMENT ON TABLE drop_products IS 'Tabla de relaciÃ³n muchos a muchos entre drops y products';
COMMENT ON COLUMN drops.name IS 'Nombre del drop o colecciÃ³n';
COMMENT ON COLUMN drops.launch_date IS 'Fecha de lanzamiento del drop';
COMMENT ON COLUMN drops.end_date IS 'Fecha de finalizaciÃ³n del drop (opcional)';
COMMENT ON COLUMN drops.status IS 'Estado del drop: ACTIVO, INACTIVO, FINALIZADO';
COMMENT ON COLUMN drops.is_featured IS 'Indica si el drop es destacado';
COMMENT ON COLUMN drop_products.is_featured IS 'Indica si el producto es destacado dentro del drop';
COMMENT ON COLUMN drop_products.sort_order IS 'Orden de visualizaciÃ³n del producto en el drop';


-- ============================================================================
-- MIGRACIÃ“N: 20250713231922_gentle_wood.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250713231922_gentle_wood.sql
-- ============================================================================

/*
  # ERP System for Clothing Store - Complete Database Schema

  1. New Tables
    - `branches`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `created_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `email` (text)
      - `role` (text) - 'admin' or 'vendedor'
      - `branch_id` (uuid, references branches)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `size` (text)
      - `price` (decimal)
      - `image_url` (text, optional)
      - `created_at` (timestamp)
    
    - `stock`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `branch_id` (uuid, references branches)
      - `quantity` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `sales`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `branch_id` (uuid, references branches)
      - `total` (decimal)
      - `sale_date` (timestamp)
      - `created_at` (timestamp)
    
    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, references sales)
      - `product_id` (uuid, references products)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `subtotal` (decimal)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Admin can access all branches; vendedor only their assigned branch

  3. Storage
    - Create 'products' bucket for product images
    - Set appropriate access policies
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  size text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create stock table
CREATE TABLE IF NOT EXISTS stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, branch_id)
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  sale_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal decimal(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- Enable Row Level Security
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Branches policies
CREATE POLICY "Authenticated users can read branches"
  ON branches FOR SELECT
  TO authenticated
  USING (true);

-- Users policies
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Stock policies
CREATE POLICY "Users can read stock for their branch or all if admin"
  ON stock FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = stock.branch_id)
    )
  );

CREATE POLICY "Users can manage stock for their branch or all if admin"
  ON stock FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = stock.branch_id)
    )
  );

-- Sales policies
CREATE POLICY "Users can read sales for their branch or all if admin"
  ON sales FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = sales.branch_id)
    )
  );

CREATE POLICY "Users can create sales for their branch or any if admin"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = sales.branch_id)
    )
  );

-- Sale items policies
CREATE POLICY "Users can read sale items through sales"
  ON sale_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      JOIN users ON users.id = auth.uid()
      WHERE sales.id = sale_items.sale_id 
      AND (users.role = 'admin' OR users.branch_id = sales.branch_id)
    )
  );

CREATE POLICY "Users can insert sale items"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert initial data
INSERT INTO branches (name, address) VALUES 
  ('Tarija', 'Av. Las AmÃ©ricas 123, Tarija'),
  ('Cochabamba', 'Av. HeroÃ­nas 456, Cochabamba'),
  ('Sucre', 'Calle Estudiantes 789, Sucre')
ON CONFLICT DO NOTHING;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for products bucket
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'products');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_branch_product ON stock(branch_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);

-- Create function to automatically update stock updated_at
CREATE OR REPLACE FUNCTION update_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock table
DROP TRIGGER IF EXISTS trigger_update_stock_updated_at ON stock;
CREATE TRIGGER trigger_update_stock_updated_at
  BEFORE UPDATE ON stock
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_updated_at();

-- ============================================================================
-- MIGRACIÃ“N: 20250802_final_schema.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250802_final_schema.sql
-- ============================================================================

-- SCRIPT COMPLETO PARA RECREAR LA BASE DE DATOS CON LA ESTRUCTURA CORRECTA
-- Ejecuta este script en tu base de datos de Supabase

-- 1. ELIMINAR TABLAS EXISTENTES (en orden correcto para evitar errores de foreign keys)
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- 2. CREAR TABLA BRANCHES
CREATE TABLE branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. CREAR TABLA USERS
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
  branch_id uuid REFERENCES branches(id),
  created_at timestamptz DEFAULT now()
);

-- 4. CREAR TABLA PRODUCTS (con precio Ãºnico por producto)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- 5. CREAR TABLA PRODUCT_VARIANTS (solo tallas, sin precio)
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size)
);

-- 6. CREAR TABLA STOCK (con una sola foreign key por relaciÃ³n)
CREATE TABLE stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(variant_id, branch_id)
);

-- 7. CREAR TABLA SALES
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  payment_type text NOT NULL DEFAULT 'EFECTIVO' CHECK (payment_type IN ('EFECTIVO', 'QR', 'TARJETA')),
  sale_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 8. CREAR TABLA SALE_ITEMS
CREATE TABLE sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal decimal(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- 9. HABILITAR ROW LEVEL SECURITY
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- 10. CREAR POLÃTICAS RLS

-- Branches policies
CREATE POLICY "Authenticated users can read branches"
  ON branches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert branches"
  ON branches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update branches"
  ON branches FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete branches"
  ON branches FOR DELETE
  TO authenticated
  USING (true);

-- Users policies
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Product variants policies
CREATE POLICY "Authenticated users can read product variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert product variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete product variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- Stock policies
CREATE POLICY "Users can read stock for their branch or all if admin"
  ON stock FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock for their branch or all if admin"
  ON stock FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update stock for their branch or all if admin"
  ON stock FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete stock for their branch or all if admin"
  ON stock FOR DELETE
  TO authenticated
  USING (true);

-- Sales policies
CREATE POLICY "Users can read sales for their branch or all if admin"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales for their branch or all if admin"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales for their branch or all if admin"
  ON sales FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete sales for their branch or all if admin"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- Sale items policies
CREATE POLICY "Users can read sale items for their branch or all if admin"
  ON sale_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sale items for their branch or all if admin"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sale items for their branch or all if admin"
  ON sale_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete sale items for their branch or all if admin"
  ON sale_items FOR DELETE
  TO authenticated
  USING (true);

-- 11. INSERTAR DATOS DE PRUEBA (OPCIONAL)
INSERT INTO branches (name, address) VALUES
  ('Sucursal Cochabamba', ' Av. Santa Cruz, Cochabamba'),
  ('Sucursal Tarija', 'Calle Mendez, Tarija'),
  ('Sucursal Sucre', 'Calle Ravelo 6, Sucre');


-- 12. FUNCIONES PARA REPORTES (sin conversiÃ³n de zona horaria)
CREATE OR REPLACE FUNCTION sum_total_sales(payment_type_param text, sale_date_param date)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type_param IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND payment_type = payment_type_param;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_sales(sale_date_param date)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date_param);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_products_sold(sale_date_param date)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date::date = sale_date_param
  );
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para sumar ventas por tarjeta
CREATE OR REPLACE FUNCTION sum_total_sales_card(sale_date_param date)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  SELECT COALESCE(SUM(total),0) INTO total_sum 
  FROM sales 
  WHERE sale_date::date = sale_date_param AND payment_type = 'TARJETA';
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRACIÃ“N: add_payment_type_and_functions.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250802_payment_type\add_payment_type_and_functions.sql
-- ============================================================================

-- MIGRACION: Agregar campo payment_type a sales y funciones para cierre de caja

-- 1. Agregar columna payment_type a sales
ALTER TABLE sales ADD COLUMN payment_type text;

-- 2. Actualizar valores nulos a 'EFECTIVO' (si existen)
UPDATE sales SET payment_type = 'EFECTIVO' WHERE payment_type IS NULL;

-- 3. Restringir valores y no permitir nulos
ALTER TABLE sales ALTER COLUMN payment_type SET NOT NULL;
ALTER TABLE sales ADD CONSTRAINT chk_payment_type CHECK (payment_type IN ('EFECTIVO', 'QR'));

-- 4. FunciÃ³n para sumar total de ventas por tipo de pago y fecha
CREATE OR REPLACE FUNCTION sumTotalSales(paymentType text, saleDate date)
RETURNS decimal(10,2) AS $$
DECLARE
  total decimal(10,2);
BEGIN
  IF paymentType IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total FROM sales WHERE sale_date::date = saleDate;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total FROM sales WHERE sale_date::date = saleDate AND payment_type = paymentType;
  END IF;
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 5. FunciÃ³n para contar ventas por fecha
CREATE OR REPLACE FUNCTION countSales(saleDate date)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = saleDate);
END;
$$ LANGUAGE plpgsql;

-- 6. FunciÃ³n para contar productos vendidos por fecha
CREATE OR REPLACE FUNCTION countProductsSold(saleDate date)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity),0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date::date = saleDate
  );
END;
$$ LANGUAGE plpgsql;

ALTER TABLE sales ALTER COLUMN payment_type SET NOT NULL;
ALTER TABLE sales DROP CONSTRAINT IF EXISTS chk_payment_type;
ALTER TABLE sales ADD CONSTRAINT chk_payment_type CHECK (payment_type IN ('EFECTIVO', 'QR', 'TARJETA'));




-- 7. Error en el nombre de las funciones no tiene que ser pascal case

CREATE OR REPLACE FUNCTION sum_total_sales(payment_type text, sale_date date)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date AND payment_type = payment_type;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- 2. Contar nÃºmero de ventas
CREATE OR REPLACE FUNCTION count_sales(sale_date date)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date);
END;
$$ LANGUAGE plpgsql;

-- 3. Contar productos vendidos
CREATE OR REPLACE FUNCTION count_products_sold(sale_date date)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date::date = sale_date
  );
END;
$$ LANGUAGE plpgsql;


-- 8. Actualizar funciones para que no tengan date 
CREATE OR REPLACE FUNCTION sum_total_sales(payment_type_param text, sale_date_param date)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type_param IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND payment_type = payment_type_param;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;
-- 2. Contar nÃºmero de ventas
CREATE OR REPLACE FUNCTION count_sales(sale_date_param date)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date_param);
END;
$$ LANGUAGE plpgsql;

-- 3. Contar productos vendidos
CREATE OR REPLACE FUNCTION count_products_sold(sale_date_param date)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date::date = sale_date_param
  );
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION sum_total_sales_card(sale_date_param date)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  SELECT COALESCE(SUM(total), 0)
  INTO total_sum
  FROM sales
  WHERE sale_date::date = sale_date_param
    AND payment_type ILIKE 'tarjeta';

  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRACIÃ“N: 20250802_product_variants.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250802_product_variants.sql
-- ============================================================================

-- MIGRACION: Agregar tabla product_variants y actualizar stock table

-- 1. Crear tabla product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size)
);

-- 2. Agregar columna variant_id a stock table
ALTER TABLE stock ADD COLUMN variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE;

-- 3. Migrar datos existentes (si hay productos con size y price)
-- Crear variantes para productos existentes
INSERT INTO product_variants (product_id, size, price)
SELECT id, size, price FROM products
ON CONFLICT (product_id, size) DO NOTHING;

-- 4. Actualizar stock table para usar variant_id
UPDATE stock 
SET variant_id = pv.id
FROM product_variants pv
WHERE stock.product_id = pv.product_id;

-- 5. Hacer variant_id NOT NULL despuÃ©s de migrar datos
ALTER TABLE stock ALTER COLUMN variant_id SET NOT NULL;

-- 6. Remover la columna product_id de stock (opcional, pero recomendado para consistencia)
-- ALTER TABLE stock DROP COLUMN product_id;

-- 7. Actualizar la constraint UNIQUE en stock
ALTER TABLE stock DROP CONSTRAINT IF EXISTS stock_product_id_branch_id_key;
ALTER TABLE stock ADD CONSTRAINT stock_variant_id_branch_id_key UNIQUE(variant_id, branch_id);

-- 8. Habilitar RLS en product_variants
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 9. Crear polÃ­ticas RLS para product_variants
CREATE POLICY "Authenticated users can read product variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert product variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete product variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- 10. Actualizar polÃ­ticas RLS para stock (si es necesario)
-- Las polÃ­ticas existentes deberÃ­an seguir funcionando, pero puedes actualizarlas si es necesario

-- ============================================================================
-- MIGRACIÃ“N: 20250809_fix_timezone_functions.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250809_fix_timezone_functions.sql
-- ============================================================================

-- FUNCIONES CORREGIDAS PARA ZONA HORARIA Y FILTRADO POR SUCURSAL
-- Ejecuta este script en tu base de datos de Supabase

-- FunciÃ³n para sumar total de ventas por sucursal
CREATE OR REPLACE FUNCTION sum_total_sales(payment_type_param text, sale_date_param date, branch_id_param uuid)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type_param IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND branch_id = branch_id_param;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND payment_type = payment_type_param AND branch_id = branch_id_param;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para contar ventas por sucursal
CREATE OR REPLACE FUNCTION count_sales(sale_date_param date, branch_id_param uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date_param AND branch_id = branch_id_param);
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para contar productos vendidos por sucursal
CREATE OR REPLACE FUNCTION count_products_sold(sale_date_param date, branch_id_param uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date::date = sale_date_param AND s.branch_id = branch_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n para sumar ventas por tarjeta por sucursal
CREATE OR REPLACE FUNCTION sum_total_sales_card(sale_date_param date, branch_id_param uuid)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  SELECT COALESCE(SUM(total),0) INTO total_sum 
  FROM sales 
  WHERE sale_date::date = sale_date_param AND payment_type = 'TARJETA' AND branch_id = branch_id_param;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRACIÃ“N: 20250810_add_mixed_payment_and_discounts.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250810_add_mixed_payment_and_discounts.sql
-- ============================================================================

-- MIGRACIÃ“N: Agregar pago mixto y sistema de descuentos
-- Ejecuta este script en tu base de datos de Supabase

-- 1. Actualizar la tabla sales para incluir descuentos y pago mixto
ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount_amount decimal(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal decimal(10,2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- 2. Actualizar la restricciÃ³n de payment_type para incluir MIXTO
ALTER TABLE sales DROP CONSTRAINT IF EXISTS chk_payment_type;
ALTER TABLE sales ADD CONSTRAINT chk_payment_type CHECK (payment_type IN ('EFECTIVO', 'QR', 'TARJETA', 'MIXTO'));

-- 3. Actualizar el total para que sea subtotal - descuento
UPDATE sales SET subtotal = total WHERE subtotal IS NULL;
UPDATE sales SET total = subtotal - discount_amount WHERE discount_amount > 0;

-- 4. FunciÃ³n para calcular total con descuento
CREATE OR REPLACE FUNCTION calculate_sale_total(subtotal_param decimal(10,2), discount_param decimal(10,2))
RETURNS decimal(10,2) AS $$
BEGIN
  RETURN GREATEST(0, subtotal_param - discount_param);
END;
$$ LANGUAGE plpgsql;

-- 5. FunciÃ³n para obtener reporte con descuentos
CREATE OR REPLACE FUNCTION get_sales_with_discounts(branch_id_param uuid, sale_date_param date)
RETURNS TABLE(
  total_sales decimal(10,2),
  total_discounts decimal(10,2),
  net_sales decimal(10,2),
  number_of_sales integer,
  sales_with_discounts integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.subtotal), 0) as total_sales,
    COALESCE(SUM(s.discount_amount), 0) as total_discounts,
    COALESCE(SUM(s.total), 0) as net_sales,
    COUNT(s.id) as number_of_sales,
    COUNT(CASE WHEN s.discount_amount > 0 THEN 1 END) as sales_with_discounts
  FROM sales s
  WHERE s.sale_date::date = sale_date_param 
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql;

-- 6. FunciÃ³n para obtener desglose de pagos mixtos
CREATE OR REPLACE FUNCTION get_mixed_payment_breakdown(branch_id_param uuid, sale_date_param date)
RETURNS TABLE(
  payment_method text,
  total_amount decimal(10,2),
  transaction_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'EFECTIVO' as payment_method,
    COALESCE(SUM(
      CASE 
        WHEN s.payment_type = 'EFECTIVO' THEN s.total
        WHEN s.payment_type = 'MIXTO' THEN (s.payment_details->>'efectivo')::decimal(10,2)
        ELSE 0 
      END
    ), 0) as total_amount,
    COUNT(CASE WHEN s.payment_type IN ('EFECTIVO', 'MIXTO') THEN 1 END) as transaction_count
  FROM sales s
  WHERE s.sale_date::date = sale_date_param 
    AND s.branch_id = branch_id_param
  
  UNION ALL
  
  SELECT 
    'QR' as payment_method,
    COALESCE(SUM(
      CASE 
        WHEN s.payment_type = 'QR' THEN s.total
        WHEN s.payment_type = 'MIXTO' THEN (s.payment_details->>'qr')::decimal(10,2)
        ELSE 0 
      END
    ), 0) as total_amount,
    COUNT(CASE WHEN s.payment_type IN ('QR', 'MIXTO') THEN 1 END) as transaction_count
  FROM sales s
  WHERE s.sale_date::date = sale_date_param 
    AND s.branch_id = branch_id_param
  
  UNION ALL
  
  SELECT 
    'TARJETA' as payment_method,
    COALESCE(SUM(
      CASE 
        WHEN s.payment_type = 'TARJETA' THEN s.total
        WHEN s.payment_type = 'MIXTO' THEN (s.payment_details->>'tarjeta')::decimal(10,2)
        ELSE 0 
      END
    ), 0) as total_amount,
    COUNT(CASE WHEN s.payment_type IN ('TARJETA', 'MIXTO') THEN 1 END) as transaction_count
  FROM sales s
  WHERE s.sale_date::date = sale_date_param 
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear Ã­ndices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_sales_discount ON sales(discount_amount);
CREATE INDEX IF NOT EXISTS idx_sales_payment_details ON sales USING GIN(payment_details);

-- 8. Verificar que las nuevas funciones se crearon
SELECT 
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname IN ('calculate_sale_total', 'get_sales_with_discounts', 'get_mixed_payment_breakdown');

-- ============================================================================
-- MIGRACIÃ“N: 20250810_fix_sales_functions.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250810_fix_sales_functions.sql
-- ============================================================================

-- MIGRACIÃ“N: Corregir funciones de ventas para filtrado por sucursal
-- Ejecuta este script en tu base de datos de Supabase

-- 1. FunciÃ³n para sumar total de ventas por sucursal (versiÃ³n final)
CREATE OR REPLACE FUNCTION sum_total_sales(payment_type_param text, sale_date_param date, branch_id_param uuid)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type_param IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum 
    FROM sales 
    WHERE sale_date::date = sale_date_param AND branch_id = branch_id_param;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum 
    FROM sales 
    WHERE sale_date::date = sale_date_param 
      AND payment_type = payment_type_param 
      AND branch_id = branch_id_param;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- 2. FunciÃ³n para contar ventas por sucursal (versiÃ³n final)
CREATE OR REPLACE FUNCTION count_sales(sale_date_param date, branch_id_param uuid)
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date_param AND branch_id = branch_id_param);
END;
$$ LANGUAGE plpgsql;

-- 3. FunciÃ³n para contar productos vendidos por sucursal (versiÃ³n final)
CREATE OR REPLACE FUNCTION count_products_sold(sale_date_param date, branch_id_param uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE s.sale_date::date = sale_date_param AND s.branch_id = branch_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- 4. FunciÃ³n para sumar ventas por tarjeta por sucursal (versiÃ³n final)
CREATE OR REPLACE FUNCTION sum_total_sales_card(sale_date_param date, branch_id_param uuid)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  SELECT COALESCE(SUM(total),0) INTO total_sum 
  FROM sales 
  WHERE sale_date::date = sale_date_param 
    AND payment_type = 'TARJETA' 
    AND branch_id = branch_id_param;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- 5. FunciÃ³n para obtener reporte diario por sucursal
CREATE OR REPLACE FUNCTION get_daily_report(branch_id_param uuid, report_date date)
RETURNS TABLE(
  total_sales decimal(10,2),
  number_of_sales integer,
  total_items_sold integer,
  cash_sales decimal(10,2),
  qr_sales decimal(10,2),
  card_sales decimal(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total), 0) as total_sales,
    COUNT(s.id) as number_of_sales,
    COALESCE(SUM(si.quantity), 0) as total_items_sold,
    COALESCE(SUM(CASE WHEN s.payment_type = 'EFECTIVO' THEN s.total ELSE 0 END), 0) as cash_sales,
    COALESCE(SUM(CASE WHEN s.payment_type = 'QR' THEN s.total ELSE 0 END), 0) as qr_sales,
    COALESCE(SUM(CASE WHEN s.payment_type = 'TARJETA' THEN s.total ELSE 0 END), 0) as card_sales
  FROM sales s
  LEFT JOIN sale_items si ON s.id = si.sale_id
  WHERE s.sale_date::date = report_date 
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear Ã­ndices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_payment_type ON sales(payment_type);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- 7. Verificar que las funciones se crearon correctamente
SELECT 
  proname as function_name,
  proargtypes::regtype[] as parameter_types
FROM pg_proc 
WHERE proname IN ('sum_total_sales', 'count_sales', 'count_products_sold', 'sum_total_sales_card', 'get_daily_report');

-- ============================================================================
-- MIGRACIÃ“N: 20250821_cash_flow_system.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250821_cash_flow_system.sql
-- ============================================================================

-- SISTEMA COMPLETO DE FLUJO DE CAJA
-- MigraciÃ³n para implementar apertura y cierre de caja

-- 1. TABLA DE CAJAS (CASH_REGISTERS)
CREATE TABLE cash_registers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'ABIERTA' CHECK (status IN ('ABIERTA', 'CERRADA')),
  
  -- Apertura de caja
  opening_date timestamptz NOT NULL DEFAULT now(),
  opening_amount decimal(10,2) NOT NULL CHECK (opening_amount >= 0),
  opening_user_id uuid NOT NULL REFERENCES users(id),
  opening_notes text,
  
  -- Cierre de caja
  closing_date timestamptz,
  closing_amount decimal(10,2) CHECK (closing_amount >= 0),
  closing_user_id uuid REFERENCES users(id),
  closing_notes text,
  
  -- CÃ¡lculos del sistema
  expected_cash decimal(10,2) DEFAULT 0,
  expected_qr decimal(10,2) DEFAULT 0,
  expected_card decimal(10,2) DEFAULT 0,
  expected_total decimal(10,2) DEFAULT 0,
  
  -- Diferencia (sobrante/faltante)
  cash_difference decimal(10,2) DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ãndice Ãºnico parcial para asegurar solo una caja abierta por sucursal
CREATE UNIQUE INDEX idx_cash_registers_open_per_branch 
ON cash_registers (branch_id) 
WHERE status = 'ABIERTA';

-- 2. TABLA DE MOVIMIENTOS DE CAJA (CASH_MOVEMENTS)
CREATE TABLE cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_register_id uuid NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('INGRESO', 'EGRESO')),
  payment_type text NOT NULL CHECK (payment_type IN ('EFECTIVO', 'QR', 'TARJETA', 'MIXTO')),
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  reference_id uuid, -- ID de la venta o movimiento relacionado
  reference_type text, -- 'SALE', 'DEPOSIT', 'WITHDRAWAL', etc.
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- 3. HABILITAR ROW LEVEL SECURITY
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;

-- 4. POLÃTICAS RLS PARA CASH_REGISTERS
CREATE POLICY "Users can read cash registers for their branch"
  ON cash_registers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = cash_registers.branch_id)
    )
  );

CREATE POLICY "Users can insert cash registers for their branch"
  ON cash_registers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = cash_registers.branch_id)
    )
  );

CREATE POLICY "Users can update cash registers for their branch"
  ON cash_registers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.branch_id = cash_registers.branch_id)
    )
  );

-- 5. POLÃTICAS RLS PARA CASH_MOVEMENTS
CREATE POLICY "Users can read cash movements for their branch"
  ON cash_movements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cash_registers cr
      JOIN users u ON u.id = auth.uid()
      WHERE cr.id = cash_movements.cash_register_id
      AND (u.role = 'admin' OR u.branch_id = cr.branch_id)
    )
  );

CREATE POLICY "Users can insert cash movements for their branch"
  ON cash_movements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cash_registers cr
      JOIN users u ON u.id = auth.uid()
      WHERE cr.id = cash_movements.cash_register_id
      AND (u.role = 'admin' OR u.branch_id = cr.branch_id)
    )
  );

-- 6. FUNCIÃ“N PARA ABRIR CAJA
CREATE OR REPLACE FUNCTION open_cash_register(
  p_branch_id uuid,
  p_opening_amount decimal(10,2),
  p_opening_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_cash_register_id uuid;
  v_user_id uuid;
BEGIN
  -- Obtener el usuario actual
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  
  -- Verificar que no haya una caja abierta en la sucursal
  IF EXISTS (
    SELECT 1 FROM cash_registers 
    WHERE branch_id = p_branch_id AND status = 'ABIERTA'
  ) THEN
    RAISE EXCEPTION 'Ya existe una caja abierta en esta sucursal';
  END IF;
  
  -- Crear la caja
  INSERT INTO cash_registers (
    branch_id, 
    user_id, 
    opening_amount, 
    opening_user_id, 
    opening_notes
  ) VALUES (
    p_branch_id, 
    v_user_id, 
    p_opening_amount, 
    v_user_id, 
    p_opening_notes
  ) RETURNING id INTO v_cash_register_id;
  
  -- Registrar el movimiento inicial
  INSERT INTO cash_movements (
    cash_register_id,
    movement_type,
    payment_type,
    amount,
    description,
    user_id
  ) VALUES (
    v_cash_register_id,
    'INGRESO',
    'EFECTIVO',
    p_opening_amount,
    'Apertura de caja - Fondo inicial',
    v_user_id
  );
  
  RETURN v_cash_register_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÃ“N PARA CERRAR CAJA
CREATE OR REPLACE FUNCTION close_cash_register(
  p_cash_register_id uuid,
  p_closing_amount decimal(10,2),
  p_closing_notes text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_expected_cash decimal(10,2);
  v_expected_qr decimal(10,2);
  v_expected_card decimal(10,2);
  v_expected_total decimal(10,2);
  v_cash_difference decimal(10,2);
BEGIN
  -- Obtener el usuario actual
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  
  -- Calcular montos esperados
  SELECT 
    COALESCE(SUM(CASE WHEN payment_type = 'EFECTIVO' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_type = 'QR' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN payment_type = 'TARJETA' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(amount), 0)
  INTO v_expected_cash, v_expected_qr, v_expected_card, v_expected_total
  FROM cash_movements 
  WHERE cash_register_id = p_cash_register_id;
  
  -- Calcular diferencia
  v_cash_difference := p_closing_amount - v_expected_cash;
  
  -- Cerrar la caja
  UPDATE cash_registers SET
    status = 'CERRADA',
    closing_date = now(),
    closing_amount = p_closing_amount,
    closing_user_id = v_user_id,
    closing_notes = p_closing_notes,
    expected_cash = v_expected_cash,
    expected_qr = v_expected_qr,
    expected_card = v_expected_card,
    expected_total = v_expected_total,
    cash_difference = v_cash_difference,
    updated_at = now()
  WHERE id = p_cash_register_id;
  
  -- Registrar el movimiento de cierre
  INSERT INTO cash_movements (
    cash_register_id,
    movement_type,
    payment_type,
    amount,
    description,
    user_id
  ) VALUES (
    p_cash_register_id,
    'INGRESO',
    'EFECTIVO',
    p_closing_amount,
    'Cierre de caja - Conteo final',
    v_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCIÃ“N PARA REGISTRAR VENTA EN MOVIMIENTOS
CREATE OR REPLACE FUNCTION register_sale_movement(
  p_sale_id uuid
)
RETURNS void AS $$
DECLARE
  v_cash_register_id uuid;
  v_sale_total decimal(10,2);
  v_payment_type text;
  v_user_id uuid;
  v_branch_id uuid;
  v_payment_details jsonb;
  v_efectivo decimal(10,2);
  v_qr decimal(10,2);
  v_tarjeta decimal(10,2);
BEGIN
  -- Obtener datos de la venta
  SELECT 
    s.total, 
    s.payment_type, 
    s.user_id, 
    s.branch_id,
    s.payment_details
  INTO v_sale_total, v_payment_type, v_user_id, v_branch_id, v_payment_details
  FROM sales s
  WHERE s.id = p_sale_id;
  
  -- Obtener la caja abierta
  SELECT id INTO v_cash_register_id 
  FROM cash_registers 
  WHERE branch_id = v_branch_id AND status = 'ABIERTA';
  
  IF v_cash_register_id IS NULL THEN
    RAISE EXCEPTION 'No hay caja abierta en esta sucursal';
  END IF;
  
  -- Registrar movimiento segÃºn el tipo de pago
  IF v_payment_type = 'MIXTO' AND v_payment_details IS NOT NULL THEN
    -- Pago mixto - registrar cada mÃ©todo por separado
    v_efectivo := COALESCE((v_payment_details->>'efectivo')::decimal(10,2), 0);
    v_qr := COALESCE((v_payment_details->>'qr')::decimal(10,2), 0);
    v_tarjeta := COALESCE((v_payment_details->>'tarjeta')::decimal(10,2), 0);
    
    IF v_efectivo > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, reference_id, reference_type, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'EFECTIVO', v_efectivo,
        'Venta #' || substring(p_sale_id::text from 1 for 8), p_sale_id, 'SALE', v_user_id
      );
    END IF;
    
    IF v_qr > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, reference_id, reference_type, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'QR', v_qr,
        'Venta #' || substring(p_sale_id::text from 1 for 8), p_sale_id, 'SALE', v_user_id
      );
    END IF;
    
    IF v_tarjeta > 0 THEN
      INSERT INTO cash_movements (
        cash_register_id, movement_type, payment_type, amount, 
        description, reference_id, reference_type, user_id
      ) VALUES (
        v_cash_register_id, 'INGRESO', 'TARJETA', v_tarjeta,
        'Venta #' || substring(p_sale_id::text from 1 for 8), p_sale_id, 'SALE', v_user_id
      );
    END IF;
  ELSE
    -- Pago simple
    INSERT INTO cash_movements (
      cash_register_id, movement_type, payment_type, amount, 
      description, reference_id, reference_type, user_id
    ) VALUES (
      v_cash_register_id, 'INGRESO', v_payment_type, v_sale_total,
      'Venta #' || substring(p_sale_id::text from 1 for 8), p_sale_id, 'SALE', v_user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. TRIGGER PARA REGISTRAR VENTAS AUTOMÃTICAMENTE
CREATE OR REPLACE FUNCTION trigger_register_sale_movement()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM register_sale_movement(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_register_sale_movement
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION trigger_register_sale_movement();

-- 10. FUNCIÃ“N PARA OBTENER RESUMEN DE CAJA
CREATE OR REPLACE FUNCTION get_cash_register_summary(p_cash_register_id uuid)
RETURNS TABLE (
  opening_amount decimal(10,2),
  expected_cash decimal(10,2),
  expected_qr decimal(10,2),
  expected_card decimal(10,2),
  expected_total decimal(10,2),
  closing_amount decimal(10,2),
  cash_difference decimal(10,2),
  total_sales integer,
  total_movements integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.opening_amount,
    cr.expected_cash,
    cr.expected_qr,
    cr.expected_card,
    cr.expected_total,
    cr.closing_amount,
    cr.cash_difference,
    COUNT(DISTINCT cm.reference_id) FILTER (WHERE cm.reference_type = 'SALE') as total_sales,
    COUNT(cm.id) as total_movements
  FROM cash_registers cr
  LEFT JOIN cash_movements cm ON cm.cash_register_id = cr.id
  WHERE cr.id = p_cash_register_id
  GROUP BY 
    cr.opening_amount, cr.expected_cash, cr.expected_qr, 
    cr.expected_card, cr.expected_total, cr.closing_amount, cr.cash_difference;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. FUNCIÃ“N PARA OBTENER MOVIMIENTOS DE CAJA
CREATE OR REPLACE FUNCTION get_cash_movements(p_cash_register_id uuid)
RETURNS TABLE (
  id uuid,
  movement_type text,
  payment_type text,
  amount decimal(10,2),
  description text,
  reference_id uuid,
  reference_type text,
  user_name text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.movement_type,
    cm.payment_type,
    cm.amount,
    cm.description,
    cm.reference_id,
    cm.reference_type,
    u.name as user_name,
    cm.created_at
  FROM cash_movements cm
  JOIN users u ON u.id = cm.user_id
  WHERE cm.cash_register_id = p_cash_register_id
  ORDER BY cm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11.1. FUNCIÃ“N PARA OBTENER MOVIMIENTOS DE CAJA AGRUPADOS POR VENTA
CREATE OR REPLACE FUNCTION get_cash_movements_grouped(p_cash_register_id uuid)
RETURNS TABLE (
  id uuid,
  movement_type text,
  payment_type text,
  amount decimal(10,2),
  description text,
  reference_id uuid,
  reference_type text,
  user_name text,
  created_at timestamptz,
  total_amount decimal(10,2),
  is_grouped boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH grouped_movements AS (
    SELECT 
      cm.reference_id,
      cm.reference_type,
      cm.movement_type,
      cm.user_id,
      cm.created_at,
      SUM(cm.amount) as total_amount,
      COUNT(*) as movement_count,
      MIN(cm.id) as first_id,
      MIN(cm.description) as description,
      MIN(u.name) as user_name
    FROM cash_movements cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.cash_register_id = p_cash_register_id
      AND cm.reference_type = 'SALE'
    GROUP BY cm.reference_id, cm.reference_type, cm.movement_type, cm.user_id, cm.created_at
    HAVING COUNT(*) > 1
  ),
  individual_movements AS (
    SELECT 
      cm.id,
      cm.movement_type,
      cm.payment_type,
      cm.amount,
      cm.description,
      cm.reference_id,
      cm.reference_type,
      u.name as user_name,
      cm.created_at,
      cm.amount as total_amount,
      false as is_grouped
    FROM cash_movements cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.cash_register_id = p_cash_register_id
      AND (cm.reference_type != 'SALE' OR cm.reference_id NOT IN (
        SELECT reference_id FROM grouped_movements
      ))
  )
  SELECT 
    COALESCE(gm.first_id, im.id) as id,
    im.movement_type,
    CASE 
      WHEN gm.reference_id IS NOT NULL THEN 'MIXTO'
      ELSE im.payment_type
    END as payment_type,
    im.amount,
    im.description,
    im.reference_id,
    im.reference_type,
    im.user_name,
    im.created_at,
    COALESCE(gm.total_amount, im.total_amount) as total_amount,
    COALESCE(gm.reference_id IS NOT NULL, im.is_grouped) as is_grouped
  FROM individual_movements im
  LEFT JOIN grouped_movements gm ON im.reference_id = gm.reference_id
  ORDER BY im.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. ÃNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX idx_cash_registers_branch_status ON cash_registers(branch_id, status);
CREATE INDEX idx_cash_registers_opening_date ON cash_registers(opening_date);
CREATE INDEX idx_cash_movements_register_id ON cash_movements(cash_register_id);
CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at);
CREATE INDEX idx_cash_movements_reference ON cash_movements(reference_id, reference_type);

-- 13. FUNCIÃ“N PARA OBTENER CAJA ABIERTA DE UNA SUCURSAL
CREATE OR REPLACE FUNCTION get_open_cash_register(p_branch_id uuid)
RETURNS TABLE (
  id uuid,
  opening_date timestamptz,
  opening_amount decimal(10,2),
  opening_user_name text,
  opening_notes text,
  expected_cash decimal(10,2),
  expected_qr decimal(10,2),
  expected_card decimal(10,2),
  expected_total decimal(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.opening_date,
    cr.opening_amount,
    u.name as opening_user_name,
    cr.opening_notes,
    cr.expected_cash,
    cr.expected_qr,
    cr.expected_card,
    cr.expected_total
  FROM cash_registers cr
  JOIN users u ON u.id = cr.opening_user_id
  WHERE cr.branch_id = p_branch_id AND cr.status = 'ABIERTA';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. FUNCIÃ“N PARA OBTENER HISTORIAL DE CAJAS
CREATE OR REPLACE FUNCTION get_cash_register_history(p_branch_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE (
  id uuid,
  opening_date timestamptz,
  closing_date timestamptz,
  opening_amount decimal(10,2),
  closing_amount decimal(10,2),
  expected_total decimal(10,2),
  cash_difference decimal(10,2),
  opening_user_name text,
  closing_user_name text,
  status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.opening_date,
    cr.closing_date,
    cr.opening_amount,
    cr.closing_amount,
    cr.expected_total,
    cr.cash_difference,
    ou.name as opening_user_name,
    cu.name as closing_user_name,
    cr.status
  FROM cash_registers cr
  JOIN users ou ON ou.id = cr.opening_user_id
  LEFT JOIN users cu ON cu.id = cr.closing_user_id
  WHERE cr.branch_id = p_branch_id 
    AND cr.opening_date::date BETWEEN p_start_date AND p_end_date
  ORDER BY cr.opening_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRACIÃ“N: 20250821_fix_critical_issues_v2.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250821_fix_critical_issues_v2.sql
-- ============================================================================

-- CORRECCIÃ“N DE PROBLEMAS CRÃTICOS V2
-- MigraciÃ³n para arreglar inconsistencias y errores
-- Esta versiÃ³n elimina primero las funciones existentes para evitar conflictos

-- 1. CORREGIR TABLA SALES - AÃ±adir soporte para pagos mixtos
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_payment_type_check;
ALTER TABLE sales ADD CONSTRAINT sales_payment_type_check 
CHECK (payment_type IN ('EFECTIVO', 'QR', 'TARJETA', 'MIXTO'));

-- AÃ±adir campos para pagos mixtos y descuentos si no existen
DO $$
BEGIN
  -- AÃ±adir payment_details si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'sales' AND column_name = 'payment_details') THEN
    ALTER TABLE sales ADD COLUMN payment_details jsonb;
  END IF;
  
  -- AÃ±adir subtotal si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'sales' AND column_name = 'subtotal') THEN
    ALTER TABLE sales ADD COLUMN subtotal decimal(10,2);
  END IF;
  
  -- AÃ±adir discount_amount si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'sales' AND column_name = 'discount_amount') THEN
    ALTER TABLE sales ADD COLUMN discount_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- 2. ELIMINAR FUNCIONES EXISTENTES QUE PUEDEN CAUSAR CONFLICTOS
DROP FUNCTION IF EXISTS get_daily_report(uuid, date);
DROP FUNCTION IF EXISTS sum_total_sales(text, date, uuid);
DROP FUNCTION IF EXISTS sum_total_sales(text, date);
DROP FUNCTION IF EXISTS count_sales(date, uuid);
DROP FUNCTION IF EXISTS count_sales(date);
DROP FUNCTION IF EXISTS count_products_sold(date, uuid);
DROP FUNCTION IF EXISTS count_products_sold(date);
DROP FUNCTION IF EXISTS sum_total_sales_card(date, uuid);
DROP FUNCTION IF EXISTS sum_total_sales_card(date);
DROP FUNCTION IF EXISTS get_sales_with_discounts(uuid, date);
DROP FUNCTION IF EXISTS get_mixed_payment_breakdown(uuid, date);

-- 3. CREAR FUNCIONES ACTUALIZADAS CON BRANCH_ID_PARAM

-- FunciÃ³n sum_total_sales con parÃ¡metro opcional
CREATE OR REPLACE FUNCTION sum_total_sales(payment_type_param text, sale_date_param date, branch_id_param uuid DEFAULT NULL)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type_param IS NULL THEN
    IF branch_id_param IS NULL THEN
      SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param;
    ELSE
      SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND branch_id = branch_id_param;
    END IF;
  ELSE
    IF branch_id_param IS NULL THEN
      SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND payment_type = payment_type_param;
    ELSE
      SELECT COALESCE(SUM(total),0) INTO total_sum FROM sales WHERE sale_date::date = sale_date_param AND payment_type = payment_type_param AND branch_id = branch_id_param;
    END IF;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n count_sales con parÃ¡metro opcional
CREATE OR REPLACE FUNCTION count_sales(sale_date_param date, branch_id_param uuid DEFAULT NULL)
RETURNS integer AS $$
BEGIN
  IF branch_id_param IS NULL THEN
    RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date_param);
  ELSE
    RETURN (SELECT COUNT(*) FROM sales WHERE sale_date::date = sale_date_param AND branch_id = branch_id_param);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n count_products_sold con parÃ¡metro opcional
CREATE OR REPLACE FUNCTION count_products_sold(sale_date_param date, branch_id_param uuid DEFAULT NULL)
RETURNS integer AS $$
BEGIN
  IF branch_id_param IS NULL THEN
    RETURN (
      SELECT COALESCE(SUM(si.quantity), 0)
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      WHERE s.sale_date::date = sale_date_param
    );
  ELSE
    RETURN (
      SELECT COALESCE(SUM(si.quantity), 0)
      FROM sale_items si
      JOIN sales s ON s.id = si.sale_id
      WHERE s.sale_date::date = sale_date_param AND s.branch_id = branch_id_param
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- FunciÃ³n sum_total_sales_card con parÃ¡metro opcional
CREATE OR REPLACE FUNCTION sum_total_sales_card(sale_date_param date, branch_id_param uuid DEFAULT NULL)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF branch_id_param IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum 
    FROM sales 
    WHERE sale_date::date = sale_date_param AND payment_type = 'TARJETA';
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum 
    FROM sales 
    WHERE sale_date::date = sale_date_param AND payment_type = 'TARJETA' AND branch_id = branch_id_param;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCIÃ“N PARA OBTENER REPORTE DIARIO CON BRANCH_ID (nueva estructura)
CREATE OR REPLACE FUNCTION get_daily_report_new(branch_id_param uuid, report_date date)
RETURNS TABLE (
  total_sales decimal(10,2),
  number_of_sales integer,
  average_sale decimal(10,2),
  total_items_sold integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total), 0) as total_sales,
    COUNT(s.id)::integer as number_of_sales,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total), 0) / COUNT(s.id)
      ELSE 0
    END as average_sale,
    COALESCE(SUM(si.quantity), 0)::integer as total_items_sold
  FROM sales s
  LEFT JOIN sale_items si ON si.sale_id = s.id
  WHERE s.sale_date::date = report_date
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCIÃ“N PARA VENTAS CON DESCUENTOS
CREATE OR REPLACE FUNCTION get_sales_with_discounts_new(branch_id_param uuid, sale_date_param date)
RETURNS TABLE (
  total_sales decimal(10,2),
  total_discounts decimal(10,2),
  net_sales decimal(10,2),
  number_of_sales integer,
  sales_with_discounts integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total), 0) as total_sales,
    COALESCE(SUM(s.discount_amount), 0) as total_discounts,
    COALESCE(SUM(s.total), 0) - COALESCE(SUM(s.discount_amount), 0) as net_sales,
    COUNT(s.id)::integer as number_of_sales,
    COUNT(CASE WHEN s.discount_amount > 0 THEN 1 END)::integer as sales_with_discounts
  FROM sales s
  WHERE s.sale_date::date = sale_date_param
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCIÃ“N PARA DESGLOSE DE PAGOS MIXTOS
CREATE OR REPLACE FUNCTION get_mixed_payment_breakdown_new(branch_id_param uuid, sale_date_param date)
RETURNS TABLE (
  payment_method text,
  total_amount decimal(10,2),
  transaction_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'efectivo'::text as payment_method,
    COALESCE(SUM((s.payment_details->>'efectivo')::decimal), 0) as total_amount,
    COUNT(s.id)::integer as transaction_count
  FROM sales s
  WHERE s.payment_type = 'MIXTO'
    AND s.sale_date::date = sale_date_param
    AND s.branch_id = branch_id_param
    AND (s.payment_details->>'efectivo')::decimal > 0
  
  UNION ALL
  
  SELECT 
    'qr'::text as payment_method,
    COALESCE(SUM((s.payment_details->>'qr')::decimal), 0) as total_amount,
    COUNT(s.id)::integer as transaction_count
  FROM sales s
  WHERE s.payment_type = 'MIXTO'
    AND s.sale_date::date = sale_date_param
    AND s.branch_id = branch_id_param
    AND (s.payment_details->>'qr')::decimal > 0
  
  UNION ALL
  
  SELECT 
    'tarjeta'::text as payment_method,
    COALESCE(SUM((s.payment_details->>'tarjeta')::decimal), 0) as total_amount,
    COUNT(s.id)::integer as transaction_count
  FROM sales s
  WHERE s.payment_type = 'MIXTO'
    AND s.sale_date::date = sale_date_param
    AND s.branch_id = branch_id_param
    AND (s.payment_details->>'tarjeta')::decimal > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ACTUALIZAR TRIGGER PARA REGISTRAR VENTAS EN CASH_MOVEMENTS
-- Solo si existe la tabla cash_registers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cash_registers') THEN
    -- Eliminar trigger existente si existe
    DROP TRIGGER IF EXISTS trigger_register_sale_movement ON sales;
    
    -- Recrear funciÃ³n del trigger para manejar errores
    CREATE OR REPLACE FUNCTION trigger_register_sale_movement()
    RETURNS TRIGGER AS $func$
    BEGIN
      BEGIN
        PERFORM register_sale_movement(NEW.id);
      EXCEPTION 
        WHEN OTHERS THEN
          -- Log el error pero no fallar la venta
          RAISE WARNING 'Error registering sale movement for sale %: %', NEW.id, SQLERRM;
      END;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Recrear trigger
    CREATE TRIGGER trigger_register_sale_movement
      AFTER INSERT ON sales
      FOR EACH ROW
      EXECUTE FUNCTION trigger_register_sale_movement();
  END IF;
END $$;

-- 8. VERIFICAR INTEGRIDAD DE DATOS
SELECT 'Migration V2 completed successfully' as status;

-- ============================================================================
-- MIGRACIÃ“N: 20250821_test_cash_flow.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250821_test_cash_flow.sql
-- ============================================================================

-- SCRIPT DE PRUEBA PARA VERIFICAR EL SISTEMA DE FLUJO DE CAJA
-- Ejecutar este script para probar que todo funciona correctamente

-- 1. VERIFICAR QUE LAS TABLAS EXISTEN Y TIENEN DATOS
SELECT 
  'cash_registers' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACÃA' END as status
FROM cash_registers
UNION ALL
SELECT 
  'cash_movements' as table_name,
  COUNT(*) as row_count,
  CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'VACÃA' END as status
FROM cash_movements;

-- 2. VERIFICAR QUE LAS FUNCIONES EXISTEN
SELECT 
  proname as function_name,
  CASE WHEN proname IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as status
FROM pg_proc 
WHERE proname IN (
  'open_cash_register',
  'close_cash_register', 
  'get_open_cash_register',
  'register_sale_movement',
  'get_cash_register_summary',
  'get_cash_movements',
  'get_cash_register_history'
);

-- 3. VERIFICAR POLÃTICAS RLS
SELECT 
  tablename,
  policyname,
  CASE WHEN policyname IS NOT NULL THEN 'ACTIVA' ELSE 'NO EXISTE' END as status
FROM pg_policies 
WHERE tablename IN ('cash_registers', 'cash_movements');

-- 4. PROBAR FUNCIÃ“N get_open_cash_register (deberÃ­a devolver 0 filas si no hay caja abierta)
-- Reemplaza 'TU_BRANCH_ID_AQUI' con el ID real de tu sucursal
-- SELECT * FROM get_open_cash_register('TU_BRANCH_ID_AQUI');

-- 5. MOSTRAR ESTRUCTURA DE LAS TABLAS
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cash_registers'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cash_movements'
ORDER BY ordinal_position;

































-- ============================================================================
-- MIGRACIÃ“N: 20250821_verify_cash_flow_functions.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250821_verify_cash_flow_functions.sql
-- ============================================================================

-- SCRIPT DE VERIFICACIÃ“N Y RECREACIÃ“N DE FUNCIONES DE FLUJO DE CAJA
-- Ejecutar este script si las funciones no estÃ¡n funcionando correctamente

-- 1. VERIFICAR SI LAS FUNCIONES EXISTEN
DO $$
BEGIN
  -- Verificar funciÃ³n open_cash_register
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'open_cash_register') THEN
    RAISE NOTICE 'FunciÃ³n open_cash_register no existe, creÃ¡ndola...';
  END IF;
  
  -- Verificar funciÃ³n close_cash_register
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'close_cash_register') THEN
    RAISE NOTICE 'FunciÃ³n close_cash_register no existe, creÃ¡ndola...';
  END IF;
  
  -- Verificar funciÃ³n get_open_cash_register
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_open_cash_register') THEN
    RAISE NOTICE 'FunciÃ³n get_open_cash_register no existe, creÃ¡ndola...';
  END IF;
  
  -- Verificar funciÃ³n register_sale_movement
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'register_sale_movement') THEN
    RAISE NOTICE 'FunciÃ³n register_sale_movement no existe, creÃ¡ndola...';
  END IF;
  
  -- Verificar funciÃ³n get_cash_register_summary
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_cash_register_summary') THEN
    RAISE NOTICE 'FunciÃ³n get_cash_register_summary no existe, creÃ¡ndola...';
  END IF;
  
  -- Verificar funciÃ³n get_cash_movements
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_cash_movements') THEN
    RAISE NOTICE 'FunciÃ³n get_cash_movements no existe, creÃ¡ndola...';
  END IF;
  
  -- Verificar funciÃ³n get_cash_register_history
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_cash_register_history') THEN
    RAISE NOTICE 'FunciÃ³n get_cash_register_history no existe, creÃ¡ndola...';
  END IF;
END $$;

-- 2. RECREAR FUNCIÃ“N PARA OBTENER CAJA ABIERTA (SIMPLIFICADA)
CREATE OR REPLACE FUNCTION get_open_cash_register(p_branch_id uuid)
RETURNS TABLE (
  id uuid,
  opening_date timestamptz,
  opening_amount decimal(10,2),
  opening_user_name text,
  opening_notes text,
  expected_cash decimal(10,2),
  expected_qr decimal(10,2),
  expected_card decimal(10,2),
  expected_total decimal(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.opening_date,
    cr.opening_amount,
    u.name as opening_user_name,
    cr.opening_notes,
    cr.expected_cash,
    cr.expected_qr,
    cr.expected_card,
    cr.expected_total
  FROM cash_registers cr
  JOIN users u ON u.id = cr.opening_user_id
  WHERE cr.branch_id = p_branch_id AND cr.status = 'ABIERTA';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. VERIFICAR QUE LAS TABLAS EXISTEN
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cash_registers') THEN
    RAISE EXCEPTION 'La tabla cash_registers no existe. Ejecuta primero la migraciÃ³n completa.';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cash_movements') THEN
    RAISE EXCEPTION 'La tabla cash_movements no existe. Ejecuta primero la migraciÃ³n completa.';
  END IF;
  
  RAISE NOTICE 'Todas las tablas existen correctamente.';
END $$;

-- 4. VERIFICAR POLÃTICAS RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cash_registers' 
    AND policyname = 'Users can read cash registers for their branch'
  ) THEN
    RAISE NOTICE 'PolÃ­tica RLS para cash_registers no existe, creÃ¡ndola...';
    
    CREATE POLICY "Users can read cash registers for their branch"
      ON cash_registers FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users 
          WHERE users.id = auth.uid() 
          AND (users.role = 'admin' OR users.branch_id = cash_registers.branch_id)
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cash_movements' 
    AND policyname = 'Users can read cash movements for their branch'
  ) THEN
    RAISE NOTICE 'PolÃ­tica RLS para cash_movements no existe, creÃ¡ndola...';
    
    CREATE POLICY "Users can read cash movements for their branch"
      ON cash_movements FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM cash_registers cr
          JOIN users u ON u.id = auth.uid()
          WHERE cr.id = cash_movements.cash_register_id
          AND (u.role = 'admin' OR u.branch_id = cr.branch_id)
        )
      );
  END IF;
  
  RAISE NOTICE 'VerificaciÃ³n de polÃ­ticas RLS completada.';
END $$;

-- 5. MOSTRAR ESTADO FINAL
SELECT 
  'cash_registers' as table_name,
  COUNT(*) as row_count
FROM cash_registers
UNION ALL
SELECT 
  'cash_movements' as table_name,
  COUNT(*) as row_count
FROM cash_movements;

































-- ============================================================================
-- MIGRACIÃ“N: 20250911_fix_local_date_filters.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250911_fix_local_date_filters.sql
-- ============================================================================

-- Ensure all daily filters use local timezone (America/La_Paz, UTC-4)

-- First, drop existing functions with potentially incompatible signatures
DROP FUNCTION IF EXISTS get_daily_sales_local(uuid, date);
DROP FUNCTION IF EXISTS get_daily_cash_movements_local(uuid, date);
DROP FUNCTION IF EXISTS sum_total_sales(text, date, uuid);
DROP FUNCTION IF EXISTS count_sales(date, uuid);
DROP FUNCTION IF EXISTS count_products_sold(date, uuid);
DROP FUNCTION IF EXISTS sum_total_sales_card(date, uuid);
DROP FUNCTION IF EXISTS get_daily_report(uuid, date);
DROP FUNCTION IF EXISTS get_sales_with_discounts(uuid, date);
DROP FUNCTION IF EXISTS get_mixed_payment_breakdown(uuid, date);

-- 1) Replace aggregate/reporting functions to use local-day comparison
CREATE OR REPLACE FUNCTION sum_total_sales(
  payment_type_param text,
  sale_date_param date,
  branch_id_param uuid
)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  IF payment_type_param IS NULL THEN
    SELECT COALESCE(SUM(total),0) INTO total_sum
    FROM sales
    WHERE (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
      AND branch_id = branch_id_param;
  ELSE
    SELECT COALESCE(SUM(total),0) INTO total_sum
    FROM sales
    WHERE (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
      AND payment_type = payment_type_param
      AND branch_id = branch_id_param;
  END IF;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_sales(
  sale_date_param date,
  branch_id_param uuid
)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM sales
    WHERE (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
      AND branch_id = branch_id_param
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_products_sold(
  sale_date_param date,
  branch_id_param uuid
)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(si.quantity), 0)
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
      AND s.branch_id = branch_id_param
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sum_total_sales_card(
  sale_date_param date,
  branch_id_param uuid
)
RETURNS decimal(10,2) AS $$
DECLARE
  total_sum decimal(10,2);
BEGIN
  SELECT COALESCE(SUM(total),0) INTO total_sum
  FROM sales
  WHERE (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
    AND payment_type = 'TARJETA'
    AND branch_id = branch_id_param;
  RETURN total_sum;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_report(
  branch_id_param uuid,
  report_date date
)
RETURNS TABLE(
  total_sales decimal(10,2),
  number_of_sales integer,
  total_items_sold integer,
  cash_sales decimal(10,2),
  qr_sales decimal(10,2),
  card_sales decimal(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total), 0) as total_sales,
    COUNT(s.id) as number_of_sales,
    COALESCE(SUM(si.quantity), 0) as total_items_sold,
    COALESCE(SUM(CASE WHEN s.payment_type = 'EFECTIVO' THEN s.total ELSE 0 END), 0) as cash_sales,
    COALESCE(SUM(CASE WHEN s.payment_type = 'QR' THEN s.total ELSE 0 END), 0) as qr_sales,
    COALESCE(SUM(CASE WHEN s.payment_type = 'TARJETA' THEN s.total ELSE 0 END), 0) as card_sales
  FROM sales s
  LEFT JOIN sale_items si ON s.id = si.sale_id
  WHERE (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = report_date
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_sales_with_discounts(
  branch_id_param uuid,
  sale_date_param date
)
RETURNS TABLE(
  total_sales decimal(10,2),
  total_discounts decimal(10,2),
  net_sales decimal(10,2),
  number_of_sales integer,
  sales_with_discounts integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.subtotal), 0) as total_sales,
    COALESCE(SUM(s.discount_amount), 0) as total_discounts,
    COALESCE(SUM(s.total), 0) as net_sales,
    COUNT(s.id) as number_of_sales,
    COUNT(CASE WHEN s.discount_amount > 0 THEN 1 END) as sales_with_discounts
  FROM sales s
  WHERE (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_mixed_payment_breakdown(
  branch_id_param uuid,
  sale_date_param date
)
RETURNS TABLE(
  efectivo decimal(10,2),
  qr decimal(10,2),
  tarjeta decimal(10,2),
  count_sales integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM((s.payment_details->>'efectivo')::decimal), 0) as efectivo,
    COALESCE(SUM((s.payment_details->>'qr')::decimal), 0) as qr,
    COALESCE(SUM((s.payment_details->>'tarjeta')::decimal), 0) as tarjeta,
    COUNT(s.id) as count_sales
  FROM sales s
  WHERE s.payment_type = 'MIXTO'
    AND (s.sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = sale_date_param
    AND s.branch_id = branch_id_param;
END;
$$ LANGUAGE plpgsql;

-- 2) Helper RPCs to fetch rows by local day
CREATE OR REPLACE FUNCTION get_daily_sales_local(
  p_branch_id uuid,
  p_day date
)
RETURNS SETOF sales AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM sales
  WHERE branch_id = p_branch_id
    AND (sale_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = p_day
  ORDER BY sale_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_daily_cash_movements_local(
  p_branch_id uuid,
  p_day date
)
RETURNS SETOF cash_movements AS $$
BEGIN
  RETURN QUERY
  SELECT cm.*
  FROM cash_movements cm
  JOIN cash_registers cr ON cr.id = cm.cash_register_id
  WHERE cr.branch_id = p_branch_id
    AND cm.reference_id IS NULL
    AND (cm.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz')::date = p_day
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;




-- ============================================================================
-- MIGRACIÃ“N: 20250923_delete_cochabamba_sales.sql
-- Ruta: C:\Users\HP\Downloads\clothingStore\project\supabase\migrations\20250923_delete_cochabamba_sales.sql
-- ============================================================================

-- MIGRACIÃ“N: EliminaciÃ³n de ventas de Cochabamba y movimientos relacionados
-- Fecha: 2025-09-23
-- Nota: Esta migraciÃ³n borra definitivamente ventas de prueba en la sucursal Cochabamba

BEGIN;

-- 1) Verificar impacto (opcional)
-- SELECT COUNT(*) AS total_sales, COALESCE(SUM(total),0) AS total_amount
-- FROM sales
-- WHERE branch_id = '8fb0375f-1572-40fb-9085-e836af8d5ae9';

-- 2) Borrar movimientos de caja asociados a ventas de esta sucursal
DELETE FROM cash_movements cm
USING cash_registers cr
WHERE cm.cash_register_id = cr.id
  AND cr.branch_id = '8fb0375f-1572-40fb-9085-e836af8d5ae9'
  AND cm.reference_type = 'SALE'
  AND cm.reference_id IN (
    SELECT id FROM sales WHERE branch_id = '8fb0375f-1572-40fb-9085-e836af8d5ae9'
  );

-- 3) Borrar items de venta primero (por FK con sales)
DELETE FROM sale_items
WHERE sale_id IN (
  SELECT id FROM sales WHERE branch_id = '8fb0375f-1572-40fb-9085-e836af8d5ae9'
);

-- 4) Borrar ventas
DELETE FROM sales
WHERE branch_id = '8fb0375f-1572-40fb-9085-e836af8d5ae9';

COMMIT;


