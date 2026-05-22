import { formatDate, isOverdue, isDueSoon } from '../../utils/dateHelpers';

export default function DueDateBadge({ dueDate }) {
  if (!dueDate) return null;

  const overdue = isOverdue(dueDate);
  const soon = isDueSoon(dueDate);

  let bg = 'var(--bg-tertiary)';
  let color = 'var(--text-secondary)';
  let icon = '🕐';

  if (overdue) { bg = 'var(--danger)'; color = '#fff'; icon = '⚠'; }
  else if (soon) { bg = 'var(--warning)'; color = '#fff'; icon = '⏰'; }

  return (
    <span
      title={formatDate(dueDate)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        background: bg,
        color,
        borderRadius: 4,
        padding: '2px 6px',
        fontSize: 11,
        fontWeight: 600,
        userSelect: 'none',
      }}
    >
      {icon} {formatDate(dueDate)}
    </span>
  );
}
