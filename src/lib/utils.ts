import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Currency = 'TSh' | 'USD'

/**
 * Format whole-currency (TSh) or cents (USD) as compact K/M.
 *   43500   (TSh)  → "TSh 43.5K"   (no division — TSh is whole-currency)
 *   128400  (TSh)  → "TSh 128K"
 *   43500   (USD)  → "$435"        (USD: divide by 100 for cents)
 *   89500   (USD)  → "$895"
 *   1500    (TSh)  → "TSh 1,500"   (under 10K, no abbreviation)
 */
export function formatK(amount: number, currency: Currency = 'TSh'): string {
  const n = currency === 'TSh' ? amount : amount / 100
  const prefix = currency === 'TSh' ? 'TSh ' : '$'
  if (n < 1_000) return `${prefix}${Math.round(n)}`
  if (n < 1_000_000) {
    return n < 10_000
      ? `${prefix}${(n / 1_000).toFixed(1)}K`
      : `${prefix}${Math.round(n / 1_000)}K`
  }
  return `${prefix}${(n / 1_000_000).toFixed(1)}M`
}

/**
 * Format full price (no K abbreviation) — for product price tags,
 * cart line items, totals. Customers need the exact number when
 * they're deciding to buy.
 *   43500   (TSh)  → "TSh 43,500"
 *   43500   (USD)  → "$435"
 *   89500   (USD)  → "$895"
 */
export function formatPrice(amount: number, currency: Currency = 'TSh'): string {
  if (currency === 'TSh') {
    return `TSh ${new Intl.NumberFormat('en-US').format(Math.round(amount))}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount / 100)
}

/**
 * Format any non-monetary count → "1.2K", "50K", "1.2M".
 * For "Devices sold", "Reviews", etc. — NEVER use for money.
 */
export function formatCount(n: number): string {
  if (n < 1_000) return String(n)
  if (n < 10_000) return `${(n / 1_000).toFixed(1)}K`
  if (n < 1_000_000) return `${Math.round(n / 1_000)}K`
  return `${(n / 1_000_000).toFixed(1)}M`
}
