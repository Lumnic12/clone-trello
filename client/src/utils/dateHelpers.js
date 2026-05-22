// Format date for display
export function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Check if date is past
export function isOverdue(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}

// Check if due within 3 days
export function isDueSoon(date) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

// Format for input[type=date]
export function toInputDate(date) {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}
