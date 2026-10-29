export const clampPercentage = (value: number): number =>
  Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
