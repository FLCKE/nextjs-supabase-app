/**
 * Format price to currency string (price already in currency units)
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

/**
 * Price is already in currency units
 */
export function priceToDisplay(price: number): number {
  return price;
}


