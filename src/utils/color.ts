// Color contrast and luminance utility functions

/**
 * Calculates whether a color (HEX, RGB, RGBA) is light or dark,
 * and returns the optimal high-contrast text color: #090812 (dark) or #ffffff (light).
 */
export function getContrastColor(hexColor?: string, threshold = 140): string {
  if (!hexColor) return '#ffffff';
  
  // Handle rgb / rgba strings if passed
  if (hexColor.startsWith('rgb')) {
    const match = hexColor.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10);
      const g = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= threshold ? '#090812' : '#ffffff';
    }
  }

  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length < 6) return '#ffffff';

  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= threshold ? '#090812' : '#ffffff';
}

/**
 * Returns true if the given color is visually light/bright
 */
export function isLightColor(hexColor?: string): boolean {
  return getContrastColor(hexColor) === '#090812';
}

/**
 * Converts hex to rgb string "r, g, b"
 */
export function hexToRgb(hex?: string): string {
  if (!hex) return '138, 43, 226';
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }
  if (cleaned.length !== 6) return '138, 43, 226';
  const r = parseInt(cleaned.substring(0, 2), 16) || 0;
  const g = parseInt(cleaned.substring(2, 4), 16) || 0;
  const b = parseInt(cleaned.substring(4, 6), 16) || 0;
  return `${r}, ${g}, ${b}`;
}
