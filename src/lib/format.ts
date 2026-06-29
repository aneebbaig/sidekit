import { format, formatDistanceToNowStrict, isValid } from "date-fns";

const DATE_LONG = "MMM d, yyyy";
const DATE_SHORT = "MMM d";
const DATE_TIME = "MMM d, yyyy h:mm a";

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (!isValid(d)) return "-";
  return format(d, DATE_LONG);
}

export function formatDateShort(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (!isValid(d)) return "-";
  return format(d, DATE_SHORT);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (!isValid(d)) return "-";
  return format(d, DATE_TIME);
}

export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (!isValid(d)) return "-";
  return `${formatDistanceToNowStrict(d)} ago`;
}

export function toISODateInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (!isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
}
