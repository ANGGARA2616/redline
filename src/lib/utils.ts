/**
 * Format a number as Indonesian Rupiah currency.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate a URL-safe slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Generate a short unique ID (for packages, etc.).
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Conditionally join CSS class names (truthy values only).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a Firestore Timestamp to locale time string (HH:MM).
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a Firestore Timestamp to locale date string.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Calculate remaining days from now until a target date.
 * Returns 0 if the date is in the past.
 */
export function daysRemaining(target: Date): number {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
