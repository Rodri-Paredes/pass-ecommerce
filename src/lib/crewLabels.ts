import type { CrewMembershipStatus, CrewRequestStatus } from '../types';

// Traduce los estados internos (vocabulario técnico) a lenguaje de cliente.
// El ERP sigue mostrando los estados internos tal cual.

export const CREW_REQUEST_LABELS: Record<CrewRequestStatus, string> = {
  draft: 'Comprobante pendiente',
  pending: 'Pago en verificación',
  approved: 'Comprobante aprobado',
  rejected: 'Comprobante inválido',
  cancelled: 'Solicitud cancelada',
};

export const CREW_MEMBERSHIP_LABELS: Record<CrewMembershipStatus, string> = {
  scheduled: 'Renovación programada',
  active: 'Membresía activa',
  expired: 'Membresía vencida',
  inactive: 'Membresía inactiva',
  cancelled: 'Membresía cancelada',
};
