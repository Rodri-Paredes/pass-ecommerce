import { CREW_REQUEST_LABELS } from '../../lib/crewLabels';
import type { CrewRequestStatus } from '../../types';

const STATUS_STYLES: Record<CrewRequestStatus, string> = {
  pending: 'bg-champagne/15 text-champagne-dark',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-50 text-red-600',
};

interface RequestStatusBadgeProps {
  status: CrewRequestStatus;
}

export default function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide ${STATUS_STYLES[status]}`}>
      {CREW_REQUEST_LABELS[status]}
    </span>
  );
}
