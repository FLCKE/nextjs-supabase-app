/**
 * Cart utilities and helper functions
 */

import { CartItem } from './cart-store';

/**
 * Format price in cents to currency string
 */
export const formatPrice = (cents: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
};

/**
 * Format price in cents to decimal number
 */
export const centsToDecimal = (cents: number): number => {
  return cents / 100;
};

/**
 * Convert decimal price to cents
 */
export const decimalToCents = (decimal: number): number => {
  return Math.round(decimal * 100);
};

/**
 * Calculate tax for an item
 */
export const calculateItemTax = (
  priceCts: number,
  quantity: number,
  taxRate: number
): number => {
  const itemTotal = priceCts * quantity;
  return Math.round((itemTotal * taxRate) / 100);
};

/**
 * Calculate subtotal for cart
 */
export const calculateSubtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price_cts * item.quantity, 0);
};

/**
 * Calculate total taxes for cart
 */
export const calculateTaxes = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    const tax = calculateItemTax(item.price_cts, item.quantity, item.tax_rate);
    return total + tax;
  }, 0);
};

/**
 * Calculate total for cart
 */
export const calculateTotal = (items: CartItem[]): number => {
  return calculateSubtotal(items) + calculateTaxes(items);
};

/**
 * Get item count in cart
 */
export const getItemCount = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Get unique items count (not including quantity)
 */
export const getUniqueItemCount = (items: CartItem[]): number => {
  return items.length;
};

/**
 * Check if cart is empty
 */
export const isCartEmpty = (items: CartItem[]): boolean => {
  return items.length === 0;
};

/**
 * Validate cart item data
 */
export const validateCartItem = (
  item: Partial<CartItem>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.id) {
    errors.push('Item ID is required');
  }

  if (!item.name) {
    errors.push('Item name is required');
  }

  if (typeof item.price_cts !== 'number' || item.price_cts < 0) {
    errors.push('Item price must be a positive number');
  }

  if (typeof item.tax_rate !== 'number' || item.tax_rate < 0) {
    errors.push('Tax rate must be a non-negative number');
  }

  if (typeof item.quantity !== 'number' || item.quantity < 1) {
    errors.push('Quantity must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Export cart data for sharing/printing
 */
export const exportCartData = (
  items: CartItem[],
  restaurantName?: string,
  tableInfo?: string
) => {
  const subtotal = calculateSubtotal(items);
  const taxes = calculateTaxes(items);
  const total = calculateTotal(items);

  return {
    restaurant: restaurantName,
    table: tableInfo,
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: formatPrice(item.price_cts),
      itemTotal: formatPrice(item.price_cts * item.quantity),
      notes: item.notes,
    })),
    subtotal: formatPrice(subtotal),
    taxes: formatPrice(taxes),
    total: formatPrice(total),
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get cart summary for API submission
 */
export const getCartSummaryForSubmission = (items: CartItem[]) => {
  return {
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price_cts: item.price_cts,
      tax_rate: item.tax_rate,
      notes: item.notes,
    })),
    totals: {
      subtotal_cts: calculateSubtotal(items),
      taxes_cts: calculateTaxes(items),
      total_cts: calculateTotal(items),
    },
    itemCount: getItemCount(items),
    uniqueItems: getUniqueItemCount(items),
  };
};

/**
 * Format time until item availability
 */
export const formatEstimatedTime = (minutes: number): string => {
  if (minutes < 1) return 'Ready now';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return `${hours}h ${mins}m`;
};

/**
 * Group cart items by category
 */
export const groupItemsByCategory = (
  items: CartItem[],
  categoryGetter?: (item: CartItem) => string
) => {
  const grouped: Record<string, CartItem[]> = {};

  items.forEach((item) => {
    const category = categoryGetter ? categoryGetter(item) : 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return grouped;
};

/**
 * Search cart items
 */
export const searchCartItems = (items: CartItem[], query: string): CartItem[] => {
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.notes?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Sort cart items
 */
export const sortCartItems = (
  items: CartItem[],
  sortBy: 'name' | 'price' | 'quantity' | 'date'
): CartItem[] => {
  const sorted = [...items];

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'price':
      return sorted.sort((a, b) => b.price_cts - a.price_cts);
    case 'quantity':
      return sorted.sort((a, b) => b.quantity - a.quantity);
    case 'date':
    default:
      return sorted; // Maintain insertion order
  }
};
