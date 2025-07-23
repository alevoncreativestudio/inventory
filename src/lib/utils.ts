import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from "date-fns";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format a Date object or date string into a readable format
 * Default format: DD MMM YYYY (e.g., 22 Jul 2025)
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en-IN',
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(parsedDate);
}


export function groupPurchasesByMonth(purchases: { purchaseDate: Date; totalAmount: number }[]) {
  const grouped: Record<string, number> = {};

  purchases.forEach((p) => {
    const month = format(new Date(p.purchaseDate), "MMM yyyy");
    grouped[month] = (grouped[month] || 0) + p.totalAmount;
  });

  return Object.entries(grouped).map(([month, value]) => ({
    month,
    value,
  }));
}

export function groupSalesByMonth(
  sales: { saleDate: Date; grandTotal: number }[]
) {
  const map = new Map<string, number>();

  for (const sale of sales) {
    const month = new Date(sale.saleDate).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    map.set(month, (map.get(month) || 0) + sale.grandTotal);
  }

  return Array.from(map.entries()).map(([month, value]) => ({ month, value }));
}

