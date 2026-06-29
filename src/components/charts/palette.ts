export const SERIES_PALETTE = [
  "#c8a560",
  "#38bdf8",
  "#a78bfa",
  "#f97316",
  "#10b981",
  "#ec4899",
  "#f43f5e",
  "#22d3ee",
  "#84cc16",
  "#facc15",
];

export function colorAt(i: number): string {
  return SERIES_PALETTE[i % SERIES_PALETTE.length];
}
