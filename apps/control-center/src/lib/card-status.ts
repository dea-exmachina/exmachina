// No directive — importable from both server and client
export const LANES = ['draft', 'ready', 'dispatched', 'in_review', 'closed'] as const
export const VALID_STATUSES = [...LANES, 'blocked', 'cancelled'] as const

export type LaneStatus = (typeof LANES)[number]
export type CardStatus = LaneStatus | 'blocked' | 'cancelled'

export function isValidStatus(s: string): s is CardStatus {
  return VALID_STATUSES.includes(s as CardStatus)
}

export function statusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'var(--cc-gray)'
    case 'ready':
      return 'var(--cc-green)'
    case 'dispatched':
      return 'var(--cc-accent)'
    case 'in_review':
      return 'var(--cc-yellow)'
    case 'closed':
      return 'var(--cc-text-dim)'
    case 'blocked':
      return 'var(--cc-red)'
    default:
      return 'var(--cc-gray)'
  }
}

export function statusLabel(status: string): string {
  return status === 'in_review' ? 'in review' : status
}
