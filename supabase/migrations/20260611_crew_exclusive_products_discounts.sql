-- ============================================================
-- PASS CREW — Preparación para productos y descuentos exclusivos (Fase 2)
-- ============================================================
-- ⚠️ PROPUESTO Y OPCIONAL PARA EL MVP: este script NO ha sido ejecutado.
--
-- Este script solo agrega columnas (additive, no rompe nada existente)
-- para que en Fase 2 se pueda implementar el "gating" de productos y
-- descuentos exclusivos para miembros PASS CREW sin rediseñar tablas.
--
-- La lógica de acceso (RLS / UI) NO se implementa en este script.
-- Cuando se aborde Fase 2, se debe agregar un helper:
--
--   CREATE OR REPLACE FUNCTION is_active_crew_member()
--   RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
--     SELECT EXISTS (
--       SELECT 1 FROM crew_memberships
--       WHERE customer_id = auth.uid()
--         AND status = 'active'
--         AND expires_at > now()
--     );
--   $$;
--
-- y usarlo en las policies/vistas correspondientes.
-- ============================================================

-- Productos exclusivos para miembros PASS CREW
ALTER TABLE products ADD COLUMN IF NOT EXISTS crew_only boolean NOT NULL DEFAULT false;

-- Descuentos exclusivos para miembros PASS CREW
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'all'
  CHECK (audience IN ('all', 'crew'));
