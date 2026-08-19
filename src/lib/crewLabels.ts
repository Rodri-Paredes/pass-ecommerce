import type { CrewMembershipStatus, CrewRequestStatus } from '../types';

// Traduce los estados internos (vocabulario técnico) a lenguaje de cliente.
// El ERP sigue mostrando los estados internos tal cual.

export const CREW_REQUEST_LABELS: Record<CrewRequestStatus, string> = {
  pending: 'Pago en verificación',
  approved: 'Comprobante aprobado',
  rejected: 'Comprobante inválido',
};

export const CREW_MEMBERSHIP_LABELS: Record<CrewMembershipStatus, string> = {
  active: 'Membresía activa',
  expired: 'Membresía vencida',
  suspended: 'Membresía suspendida',
  cancelled: 'Membresía cancelada',
};
