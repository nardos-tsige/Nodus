import { Circle, Clock, CheckCircle } from 'lucide-react'

const STATUS_STYLES = {
  not_started: {
    background: 'var(--status-not-started-bg)',
    color: 'var(--status-not-started-text)',
    label: 'Not Started',
    icon: Circle
  },
  in_progress: {
    background: 'var(--status-in-progress-bg)',
    color: 'var(--status-in-progress-text)',
    label: 'In Progress',
    icon: Clock
  },
  complete: {
    background: 'var(--status-complete-bg)',
    color: 'var(--status-complete-text)',
    label: 'Complete',
    icon: CheckCircle
  }
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.not_started
  const Icon = style.icon

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: style.background,
        color: style.color,
        textTransform: 'capitalize',
        letterSpacing: '0.02em'
      }}
    >
      <Icon size={14} />
      {style.label}
    </span>
  )
}

export default StatusBadge