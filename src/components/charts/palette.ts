export const SERIES_PALETTE = [
  "#14b8a6",
  "#3b82f6",
  "#a78bfa",
  "#fb7185",
  "#f59e0b",
  "#84cc16",
  "#38bdf8",
  "#e879f9",
];

export function colorAt(i: number): string {
  return SERIES_PALETTE[i % SERIES_PALETTE.length];
}
