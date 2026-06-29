function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return lines.join("\n");
}

export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
