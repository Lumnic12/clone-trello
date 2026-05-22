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

// Map plain colors and gradients to beautiful Unsplash images automatically
export function getPremiumBackground(bg) {
  if (!bg) return 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80)';
  if (bg.startsWith('url(')) return bg;

  // Map solid colors
  const colorMap = {
    '#0052CC': 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80)', // Ocean Beach
    '#00B8D9': 'url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1000&auto=format&fit=crop&q=80)', // Cyan Shore
    '#36B37E': 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80)', // Foggy Forest
    '#FF8B00': 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80)', // Yosemite Sunset
    '#FF5630': 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80)', // Red Abstract
    '#6554C0': 'url(https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1000&auto=format&fit=crop&q=80)', // Starry Space
    '#172b4d': 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80)', // Mountain Range
    '#344563': 'url(https://images.unsplash.com/photo-1433832597026-a501c107e5b1?w=1000&auto=format&fit=crop&q=80)', // Pastel Clouds
  };

  if (colorMap[bg]) return colorMap[bg];

  // Map gradients
  const gradientMap = {
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)': 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)': 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)': 'url(https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1000&auto=format&fit=crop&q=80)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)': 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)': 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)': 'url(https://images.unsplash.com/photo-1433832597026-a501c107e5b1?w=1000&auto=format&fit=crop&q=80)',
    'linear-gradient(135deg, #1a2a4a 0%, #0079BF 60%, #005f9e 100%)': 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80)',
  };

  if (gradientMap[bg]) return gradientMap[bg];

  // If it's a dynamic linear-gradient, map it
  if (bg.includes('linear-gradient')) {
    return 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80)';
  }

  return bg; // Fallback
}
