/**
 * Cart Configuration
 * 
 * Centralized configuration for cart system
 * Customize these values to match your business needs
 */

// Storage
export const CART_STORAGE_KEY = 'wego-cart-storage';

// Currency
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_LOCALE = 'en-US';

// Tax
export const CALCULATE_TAX_BY_ITEM = true; // Calculate tax per item instead of once at end

// Stock
export const WARN_STOCK_THRESHOLD = 5; // Show warning when stock <= this value

// UI
export const CART_DRAWER_WIDTH = 'max-w-md'; // Tailwind width class for drawer
export const CART_STICKY_BAR_HEIGHT = 'h-20 md:h-24'; // Height of sticky bar

// Checkout
export const MIN_ORDER_AMOUNT_CENTS = 1000; // Minimum $10 order (in cents)
export const DELIVERY_TIME_MINUTES = 15; // Estimated delivery time

// Promo Codes
export const PROMO_CODES_ENABLED = true;
export const MAX_DISCOUNT_PER_ORDER_CENTS = 10000; // Max $100 discount

// Order
export const ORDER_CONFIRMATION_AUTO_REDIRECT_MS = 3000; // Auto redirect after 3 seconds

// Pagination
export const CART_ITEMS_PER_PAGE = 20;

// Analytics
export const TRACK_CART_EVENTS = true;

/**
 * Get currency formatter
 */
export const getCurrencyFormatter = (currency: string = DEFAULT_CURRENCY) => {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: currency,
  });
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: string = DEFAULT_CURRENCY): string => {
  const formatter = getCurrencyFormatter(currency);
  // Format a sample value to extract the currency symbol
  const parts = formatter.formatToParts(1);
  const symbol = parts.find((part) => part.type === 'currency');
  return symbol?.value || '$';
};

/**
 * Delivery method options
 */
export const DELIVERY_METHODS = [
  { id: 'table', label: 'Delivery to Table' },
  { id: 'pickup', label: 'Pickup Counter' },
] as const;

/**
 * Payment method options
 */
export const PAYMENT_METHODS = [
  { id: 'card', label: 'Pay Now with Card' },
  { id: 'cash', label: 'Pay at Counter' },
] as const;

/**
 * Order status options
 */
export const ORDER_STATUSES = [
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Being Prepared' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_ITEM: 'Invalid item data',
  OUT_OF_STOCK: 'Item is out of stock',
  INVALID_QUANTITY: 'Invalid quantity',
  CART_EMPTY: 'Cart is empty',
  MIN_ORDER_NOT_MET: `Minimum order amount is ${getCurrencyFormatter().format(MIN_ORDER_AMOUNT_CENTS / 100)}`,
  CHECKOUT_FAILED: 'Failed to complete checkout',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  ITEM_ADDED: 'Item added to cart',
  ITEM_REMOVED: 'Item removed from cart',
  CART_CLEARED: 'Cart cleared',
  ORDER_PLACED: 'Order placed successfully',
  PROMO_APPLIED: 'Promo code applied',
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_CHECKOUT: true,
  ENABLE_PROMO_CODES: true,
  ENABLE_GUEST_CHECKOUT: true,
  ENABLE_SAVED_ITEMS: false,
  ENABLE_ORDER_TRACKING: false,
  ENABLE_PAYMENT_INTEGRATION: false,
  ENABLE_TIPS: false,
  ENABLE_SCHEDULING: false,
} as const;
