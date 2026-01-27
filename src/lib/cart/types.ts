/**
 * Cart System Type Definitions
 * 
 * This file documents all types used in the cart system
 */

/**
 * A single item in the shopping cart
 */
export interface CartItem {
  id: string; // Menu item ID
  name: string;
  price_cts: number; // Price in cents (e.g., $10.99 = 1099)
  tax_rate: number; // Tax rate as percentage (e.g., 8.5)
  quantity: number;
  notes?: string; // Special instructions
}

/**
 * Cart store state
 */
export interface CartState {
  items: CartItem[];
  tableToken: string | null;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  setTableToken: (token: string) => void;

  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getTaxes: () => number;
  getTotal: () => number;
}

/**
 * Cart drawer UI state
 */
export interface CartDrawerState {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

/**
 * Order summary for submission
 */
export interface OrderSummary {
  items: CartItem[];
  subtotal_cts: number;
  taxes_cts: number;
  total_cts: number;
  itemCount: number;
  uniqueItems: number;
}

/**
 * Customer information for checkout
 */
export interface CheckoutCustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

/**
 * Checkout form data
 */
export interface CheckoutFormData extends CheckoutCustomerInfo {
  deliveryMethod: 'table' | 'pickup';
  paymentMethod: 'card' | 'cash';
  specialInstructions?: string;
  promoCode?: string;
}

/**
 * Order creation request
 */
export interface CreateOrderRequest {
  customerInfo: CheckoutCustomerInfo;
  deliveryMethod: 'table' | 'pickup';
  paymentMethod: 'card' | 'cash';
  items: CartItem[];
  subtotal_cts: number;
  taxes_cts: number;
  total_cts: number;
  specialInstructions?: string;
  promoCode?: string;
  discount_cts?: number;
  tableToken?: string;
}

/**
 * Order response
 */
export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
  estimatedTime?: number; // minutes
}

/**
 * Promo code configuration
 */
export interface PromoCode {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number; // In cents
  maxDiscount?: number; // In cents
  expiresAt?: string; // ISO date string
  isActive: boolean;
}

/**
 * Promo validation result
 */
export interface PromoValidationResult {
  valid: boolean;
  discount?: number; // In cents
  error?: string;
}

/**
 * Cart item validation result
 */
export interface ItemValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Cart export data
 */
export interface CartExportData {
  restaurant?: string;
  table?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: string;
    itemTotal: string;
    notes?: string;
  }>;
  subtotal: string;
  taxes: string;
  total: string;
  timestamp: string;
}

/**
 * Menu item type (from database)
 */
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price_cts: number;
  tax_rate?: number;
  image_url?: string;
  stock_mode: 'FINITE' | 'INFINITE' | 'HIDDEN_WHEN_OOS';
  stock_qty?: number;
}

/**
 * Props for CartDrawer component
 */
export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showCheckoutButton?: boolean;
}

/**
 * Props for CartButton component
 */
export interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Props for MenuHeader component
 */
export interface MenuHeaderProps {
  restaurantName: string;
  locationName?: string;
  tableLabel?: string;
  onMenuToggle?: () => void;
}

/**
 * Props for AddToCartDialog component
 */
export interface AddToCartDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Props for PromoSection component
 */
export interface PromoSectionProps {
  onApply?: (code: string, discount: number) => void;
  subtotal: number;
}

/**
 * Analytics event
 */
export interface CartAnalyticsEvent {
  event: 'item_added' | 'item_removed' | 'item_updated' | 'checkout_started' | 'order_completed';
  itemId?: string;
  itemName?: string;
  quantity?: number;
  cartValue?: number;
  timestamp: Date;
}

/**
 * Cart validation options
 */
export interface CartValidationOptions {
  minOrderAmount?: number; // In cents
  maxOrderAmount?: number; // In cents
  requireCustomerInfo?: boolean;
  requireDeliveryMethod?: boolean;
  requirePaymentMethod?: boolean;
}

/**
 * Stock availability
 */
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

/**
 * Currency settings
 */
export interface CurrencySettings {
  code: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

/**
 * Delivery method
 */
export type DeliveryMethod = 'table' | 'pickup' | 'delivery';

/**
 * Payment method
 */
export type PaymentMethod = 'card' | 'cash' | 'mobile_pay' | 'wallet';

/**
 * Order status
 */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
