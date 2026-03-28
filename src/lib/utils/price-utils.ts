/**
 * Normalize price to cents
 * Handles both cases: if price is already in cents (>100) or in units (<100)
 */
export function normalizePriceToCents(price: number): number {
  // If price is less than 100, assume it's in currency units and convert to cents
  if (price < 100 && price > 0) {
    return Math.round(price * 100);
  }
  // Otherwise assume it's already in cents
  return Math.round(price);
}

/**
 * Format price in cents to currency string
 */
export function formatPrice(cents: number, currency: string = 'USD'): string {
  // Normalize first
  const normalizedCents = normalizePriceToCents(cents);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(normalizedCents / 100);
}

/**
 * Convert price to display format (currency units)
 */
export function priceToDisplay(cents: number): number {
  const normalizedCents = normalizePriceToCents(cents);
  return normalizedCents / 100;
}
