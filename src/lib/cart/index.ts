/**
 * Cart State Management Index
 * 
 * Central export point for all cart-related state and utilities
 * 
 * Usage:
 *   import { useCartStore, useCartDrawerStore, formatPrice } from '@/lib/cart';
 */

// Stores
export { useCartStore } from './cart-store';
export type { CartItem } from './cart-store';

export { useCartDrawerStore } from './cart-drawer-store';

// Utilities
export {
  formatPrice,
  centsToDecimal,
  decimalToCents,
  calculateItemTax,
  calculateSubtotal,
  calculateTaxes,
  calculateTotal,
  getItemCount,
  getUniqueItemCount,
  isCartEmpty,
  validateCartItem,
  exportCartData,
  getCartSummaryForSubmission,
  formatEstimatedTime,
  groupItemsByCategory,
  searchCartItems,
  sortCartItems,
} from './cart-utils';
