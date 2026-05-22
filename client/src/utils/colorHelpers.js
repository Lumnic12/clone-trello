// Get text color (black or white) for a given background hex
export function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#172b4d' : '#ffffff';
}

// Predefined label colors
export const LABEL_COLORS = [
  { color: '#FF5630', name: 'Red' },
  { color: '#FF8B00', name: 'Orange' },
  { color: '#FFAB00', name: 'Yellow' },
  { color: '#36B37E', name: 'Green' },
  { color: '#00B8D9', name: 'Cyan' },
  { color: '#0052CC', name: 'Blue' },
  { color: '#6554C0', name: 'Purple' },
  { color: '#FF5BAC', name: 'Pink' },
  { color: '#607D8B', name: 'Gray' },
];

// Predefined board background colors
export const BOARD_COLORS = [
  '#0052CC', '#00B8D9', '#36B37E', '#FF8B00',
  '#FF5630', '#6554C0', '#172b4d', '#344563',
];

// Predefined member avatar colors
export const AVATAR_COLORS = [
  '#7B68EE', '#FF6B6B', '#4CAF50', '#FF9800',
  '#00BCD4', '#E91E63', '#009688', '#3F51B5',
];
