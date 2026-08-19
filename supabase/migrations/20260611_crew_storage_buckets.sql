-- ============================================================
-- PASS CREW — Buckets de Storage
-- ============================================================
-- ⚠️ PROPUESTO: este script NO ha sido ejecutado contra Supabase.
--
-- Buckets:
--   - crew-receipts (privado): comprobantes de pago de los clientes.
--       Path: {customer_id}/{request_id}-{timestamp}.{ext}
--       Acceso vía createSignedUrl() (no es público).
--   - crew-assets (público): imagen de QR de pago y futuros assets
--       de la tarjeta digital de miembro.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('crew-receipts', 'crew-receipts', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('crew-assets', 'crew-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- crew-receipts: el cliente sube/lee solo dentro de su propia carpeta
-- ({customer_id}/...). Los administradores pueden leer cualquier carpeta.
-- ------------------------------------------------------------
CREATE POLICY "crew_receipts_customer_insert_own"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'crew-receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "crew_receipts_select_own_or_admin"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'crew-receipts'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_admin())
  );

-- ------------------------------------------------------------
-- crew-assets: lectura pública (QR de pago debe verse en landing
-- sin sesión), escritura solo administradores.
-- ------------------------------------------------------------
CREATE POLICY "crew_assets_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'crew-assets');

CREATE POLICY "crew_assets_admin_manage"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'crew-assets' AND is_admin())
  WITH CHECK (bucket_id = 'crew-assets' AND is_admin());
