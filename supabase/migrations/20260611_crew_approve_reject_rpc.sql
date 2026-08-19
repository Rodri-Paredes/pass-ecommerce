-- ============================================================
-- PASS CREW — RPCs atómicas de aprobación/rechazo de solicitudes
-- ============================================================
-- ⚠️ PROPUESTO: este script NO ha sido ejecutado contra Supabase.
-- Requiere que 20260611_create_pass_crew_schema.sql ya se haya aplicado.
--
-- Mismo patrón que create_sale_atomic (clothingStore):
-- SECURITY DEFINER, lock de filas, validación de rol admin vía
-- auth.uid(), escritura atómica en una sola transacción.
-- ============================================================

CREATE OR REPLACE FUNCTION approve_crew_request(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request crew_membership_requests%ROWTYPE;
  v_plan crew_plans%ROWTYPE;
  v_existing crew_memberships%ROWTYPE;
  v_membership_id uuid;
  v_member_number text;
  v_new_expires_at timestamptz;
  v_action text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Solo administradores pueden aprobar solicitudes';
  END IF;

  SELECT * INTO v_request
  FROM crew_membership_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'La solicitud ya fue procesada (estado: %)', v_request.status;
  END IF;

  SELECT * INTO v_plan FROM crew_plans WHERE id = v_request.plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan de membresía no encontrado';
  END IF;

  -- ¿El cliente ya tiene una membresía vigente (renovación)?
  SELECT * INTO v_existing
  FROM crew_memberships
  WHERE customer_id = v_request.customer_id
    AND status IN ('active', 'suspended')
  FOR UPDATE;

  IF FOUND THEN
    -- Renovación: extender vigencia, mantener id y member_number
    v_new_expires_at := GREATEST(v_existing.expires_at, now()) + (v_plan.duration_days || ' days')::interval;

    UPDATE crew_memberships
    SET status = 'active',
        plan_id = v_request.plan_id,
        expires_at = v_new_expires_at,
        source_request_id = v_request.id
    WHERE id = v_existing.id
    RETURNING id, member_number INTO v_membership_id, v_member_number;

    v_action := 'membership_renewed';
  ELSE
    -- Nueva membresía
    v_new_expires_at := now() + (v_plan.duration_days || ' days')::interval;

    INSERT INTO crew_memberships (customer_id, plan_id, status, started_at, expires_at, source_request_id)
    VALUES (v_request.customer_id, v_request.plan_id, 'active', now(), v_new_expires_at, v_request.id)
    RETURNING id, member_number INTO v_membership_id, v_member_number;

    v_action := 'membership_activated';
  END IF;

  INSERT INTO crew_membership_audit_log (customer_id, membership_id, request_id, action, performed_by, metadata)
  VALUES (v_request.customer_id, v_membership_id, v_request.id, v_action, auth.uid(),
          jsonb_build_object('expires_at', v_new_expires_at, 'plan_code', v_plan.code));

  UPDATE crew_membership_requests
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = p_request_id;

  INSERT INTO crew_membership_audit_log (customer_id, membership_id, request_id, action, performed_by)
  VALUES (v_request.customer_id, v_membership_id, v_request.id, 'request_approved', auth.uid());

  RETURN jsonb_build_object(
    'request_id', v_request.id,
    'membership_id', v_membership_id,
    'member_number', v_member_number,
    'expires_at', v_new_expires_at,
    'status', 'approved'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION approve_crew_request(uuid) TO authenticated;


CREATE OR REPLACE FUNCTION reject_crew_request(p_request_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request crew_membership_requests%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Solo administradores pueden rechazar solicitudes';
  END IF;

  SELECT * INTO v_request
  FROM crew_membership_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada';
  END IF;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'La solicitud ya fue procesada (estado: %)', v_request.status;
  END IF;

  UPDATE crew_membership_requests
  SET status = 'rejected',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      rejection_reason = p_reason
  WHERE id = p_request_id;

  INSERT INTO crew_membership_audit_log (customer_id, request_id, action, performed_by, metadata)
  VALUES (v_request.customer_id, v_request.id, 'request_rejected', auth.uid(),
          jsonb_build_object('reason', p_reason));

  RETURN jsonb_build_object('request_id', v_request.id, 'status', 'rejected');
END;
$$;

GRANT EXECUTE ON FUNCTION reject_crew_request(uuid, text) TO authenticated;
