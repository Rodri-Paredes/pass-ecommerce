-- ============================================================
-- PASS CREW — Esquema base
-- ============================================================
-- ⚠️ PROPUESTO: este script NO ha sido ejecutado contra Supabase.
-- Pendiente de aprobación del proyecto PASS CREW. Ejecutar primero
-- en un entorno de staging antes de aplicar a producción.
--
-- Tablas: customer_profiles, crew_plans, crew_settings, crew_benefits,
--         crew_membership_requests, crew_memberships, crew_membership_audit_log
--
-- Requiere: la función is_admin() ya existe en la base compartida
-- (definida en clothingStore/.../20260512_hardening_completo.sql),
-- por lo que NO se redefine aquí.
-- ============================================================

-- ------------------------------------------------------------
-- 1. customer_profiles — 1:1 con auth.users para clientes del e-commerce
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_profiles_select_own_or_admin"
  ON customer_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "customer_profiles_insert_own"
  ON customer_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "customer_profiles_update_own_or_admin"
  ON customer_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

-- ------------------------------------------------------------
-- 2. crew_plans — catálogo de planes (hoy: 1 fila "PASS CREW")
--    Permite agregar PASS CREW PREMIUM/VIP en el futuro sin
--    rediseñar el esquema (solicitudes y membresías referencian plan_id).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crew_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BOB',
  duration_days integer NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO crew_plans (code, name, price, currency, duration_days, sort_order)
VALUES ('PASS_CREW', 'PASS CREW', 29.99, 'BOB', 30, 0)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE crew_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_plans_select_all"
  ON crew_plans FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "crew_plans_admin_manage"
  ON crew_plans FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 3. crew_settings — configuración global no ligada a un plan (singleton)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crew_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  payment_qr_url text,
  payment_instructions text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

INSERT INTO crew_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE crew_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_settings_select_all"
  ON crew_settings FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "crew_settings_admin_update"
  ON crew_settings FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 4. crew_benefits — beneficios mostrados en la landing, editables desde ERP
--    plan_id NULL = aplica a todos los planes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crew_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES crew_plans(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crew_benefits_active_order ON crew_benefits(is_active, display_order);

ALTER TABLE crew_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_benefits_select_all"
  ON crew_benefits FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "crew_benefits_admin_manage"
  ON crew_benefits FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Beneficios iniciales sugeridos para el plan PASS CREW
INSERT INTO crew_benefits (plan_id, title, description, icon, display_order)
SELECT p.id, b.title, b.description, b.icon, b.display_order
FROM crew_plans p
CROSS JOIN (VALUES
  ('Descuentos exclusivos', 'Accede a descuentos especiales solo para miembros PASS CREW.', 'Tag', 0),
  ('Lanzamientos anticipados', 'Sé el primero en acceder a nuevos drops antes que el público general.', 'Rocket', 1),
  ('Productos exclusivos', 'Accede a piezas disponibles únicamente para la comunidad PASS CREW.', 'Star', 2),
  ('Identificación digital', 'Obtén tu credencial digital de miembro PASS CREW.', 'IdCard', 3)
) AS b(title, description, icon, display_order)
WHERE p.code = 'PASS_CREW'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 5. Secuencias + generadores de referencia/número de miembro
-- ------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS crew_request_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS crew_member_seq START WITH 1;

-- Formato: PASSCREW-YYYY-NNNNNN (secuencia global, prefijo de año actual)
CREATE OR REPLACE FUNCTION generate_crew_request_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'PASSCREW-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('crew_request_seq')::text, 6, '0');
$$;

-- Formato: CREW-NNNNNN (persistente, no se regenera en renovaciones)
CREATE OR REPLACE FUNCTION generate_crew_member_number()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'CREW-' || lpad(nextval('crew_member_seq')::text, 6, '0');
$$;

-- ------------------------------------------------------------
-- 6. crew_membership_requests
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crew_membership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL DEFAULT generate_crew_request_number(),
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES crew_plans(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BOB',
  receipt_url text,
  rejection_reason text,
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crew_requests_customer ON crew_membership_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_crew_requests_status ON crew_membership_requests(status);
CREATE INDEX IF NOT EXISTS idx_crew_requests_created_at ON crew_membership_requests(created_at DESC);

ALTER TABLE crew_membership_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_requests_select_own_or_admin"
  ON crew_membership_requests FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR is_admin());

CREATE POLICY "crew_requests_insert_own"
  ON crew_membership_requests FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- El cliente solo puede modificar su propia solicitud mientras esté pendiente
-- (ej. volver a subir el comprobante)
CREATE POLICY "crew_requests_update_own_pending"
  ON crew_membership_requests FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid() AND status = 'pending');

-- Fallback admin (la aprobación/rechazo real se hace vía RPC SECURITY DEFINER)
CREATE POLICY "crew_requests_admin_update"
  ON crew_membership_requests FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 7. crew_memberships — suscripción vigente/histórica del cliente
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crew_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_number text UNIQUE NOT NULL DEFAULT generate_crew_member_number(),
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES crew_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  cancelled_at timestamptz,
  source_request_id uuid REFERENCES crew_membership_requests(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Una sola membresía vigente (active/suspended) por cliente.
-- Las renovaciones actualizan esta misma fila (mismo id y member_number).
CREATE UNIQUE INDEX IF NOT EXISTS idx_crew_memberships_one_active
  ON crew_memberships(customer_id)
  WHERE status IN ('active', 'suspended');

CREATE INDEX IF NOT EXISTS idx_crew_memberships_customer ON crew_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_crew_memberships_status ON crew_memberships(status);
CREATE INDEX IF NOT EXISTS idx_crew_memberships_expires_at ON crew_memberships(expires_at);

ALTER TABLE crew_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_memberships_select_own_or_admin"
  ON crew_memberships FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR is_admin());

-- Solo admin (en la práctica, vía RPC SECURITY DEFINER) crea/modifica membresías
CREATE POLICY "crew_memberships_admin_manage"
  ON crew_memberships FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 8. crew_membership_audit_log — bitácora de eventos
--    (tabla creada en MVP; pantalla "Historial" queda para Fase 2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crew_membership_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES crew_memberships(id),
  request_id uuid REFERENCES crew_membership_requests(id),
  action text NOT NULL CHECK (action IN (
    'request_created', 'request_approved', 'request_rejected',
    'membership_activated', 'membership_renewed', 'membership_expired',
    'membership_suspended', 'membership_cancelled'
  )),
  performed_by uuid REFERENCES users(id),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crew_audit_customer ON crew_membership_audit_log(customer_id);
CREATE INDEX IF NOT EXISTS idx_crew_audit_created_at ON crew_membership_audit_log(created_at DESC);

ALTER TABLE crew_membership_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crew_audit_select_own_or_admin"
  ON crew_membership_audit_log FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR is_admin());

-- Sin policy de INSERT directo: solo se escribe desde RPCs SECURITY DEFINER.

-- ------------------------------------------------------------
-- 9. updated_at trigger reutilizable
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crew_plans_updated_at ON crew_plans;
CREATE TRIGGER trg_crew_plans_updated_at
  BEFORE UPDATE ON crew_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crew_benefits_updated_at ON crew_benefits;
CREATE TRIGGER trg_crew_benefits_updated_at
  BEFORE UPDATE ON crew_benefits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crew_requests_updated_at ON crew_membership_requests;
CREATE TRIGGER trg_crew_requests_updated_at
  BEFORE UPDATE ON crew_membership_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crew_memberships_updated_at ON crew_memberships;
CREATE TRIGGER trg_crew_memberships_updated_at
  BEFORE UPDATE ON crew_memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
