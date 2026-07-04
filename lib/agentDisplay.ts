// Shared badge tones + labels for account role/status, used by the agents
// list and detail. Keeps the mapping in one place.
type Tone = 'gray' | 'green' | 'amber' | 'red' | 'blue'

export function statusTone(status: string): Tone {
  switch (status) {
    case 'enabled':
      return 'green'
    case 'invited':
      return 'amber'
    case 'disabled':
      return 'red'
    default:
      return 'gray'
  }
}

export function roleTone(role: string): Tone {
  return role === 'atlantes_admin' ? 'blue' : role === 'enterprise_admin' ? 'amber' : 'gray'
}

export const ALL_ROLES = ['travel_advisor', 'enterprise_admin', 'atlantes_admin'] as const
export const ALL_STATUSES = ['invited', 'unverified', 'enabled', 'disabled'] as const
