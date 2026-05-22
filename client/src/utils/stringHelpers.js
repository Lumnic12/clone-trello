// Get initials from name (e.g. "Alice Johnson" → "AJ")
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text to a max length
export function truncateText(text, max = 80) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}
