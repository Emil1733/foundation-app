/** Unknown measurements must never be displayed as measured zeroes. */
export function formatSoilMeasurement(value: unknown, suffix = ''): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 'Not reported';
  return `${value.toFixed(1)}${suffix}`;
}
