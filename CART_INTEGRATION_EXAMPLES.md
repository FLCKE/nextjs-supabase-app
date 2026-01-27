/**
 * Cart System Integration Examples
 * 
 * This file shows practical examples of how to use the cart system
 * in your application.
 */

// ============================================================
// 1. BASIC MENU PAGE WITH CART
// ============================================================

/*
import { MenuHeader } from '@/components/public/menu-header';
import { MenuItemCard } from '@/components/public/menu-item-card';
import { CartSummaryBar } from '@/components/public/cart-summary-bar';
import { useCartStore } from '@/lib/cart';

export default function MenuPage() {
  const { setTableToken } = useCartStore();

  // Get table token from QR code scan
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('table_token');
    if (token) {
      setTableToken(token);
    }
  }, []);

  return (
    <div>
      <MenuHeader 
        restaurantName="My Restaurant"
        locationName="Main Branch"
        tableLabel="42"
      />
      
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              {...item}
              currency="USD"
            />
          ))}
        </div>
      </main>

      <CartSummaryBar currency="USD" />
    </div>
  );
}
*/

// ============================================================
// 2. ADD ITEM TO CART PROGRAMMATICALLY
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { toast } from 'sonner';

export function ProductQuickAdd({ product }) {
  const { addItem } = useCartStore();

  const handleQuickAdd = () => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price_cts: product.price_cts,
        tax_rate: product.tax_rate || 0,
        quantity: 1,
      });
      
      toast.success('Added to cart', {
        description: product.name,
      });
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  return (
    <button onClick={handleQuickAdd}>
      Quick Add
    </button>
  );
}
*/

// ============================================================
// 3. CUSTOM CART DISPLAY
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/cart/cart-utils';

export function CustomCartSummary() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const subtotal = useCartStore((state) => state.getSubtotal());
  const taxes = useCartStore((state) => state.getTaxes());

  return (
    <div className="cart-summary">
      <h2>Order Summary</h2>
      
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.quantity}x {item.name}
            <span>{formatPrice(item.price_cts * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="summary">
        <div>Subtotal: {formatPrice(subtotal)}</div>
        <div>Taxes: {formatPrice(taxes)}</div>
        <div className="total">Total: {formatPrice(total)}</div>
      </div>
    </div>
  );
}
*/

// ============================================================
// 4. CART DRAWER INTEGRATION
// ============================================================

/*
import { CartDrawer } from '@/components/public/cart-drawer';
import { useCartDrawerStore } from '@/lib/cart';

export function Layout({ children }) {
  const { isOpen, closeCart } = useCartDrawerStore();

  return (
    <>
      <main>{children}</main>
      <CartDrawer isOpen={isOpen} onClose={closeCart} />
    </>
  );
}

// In a component, open the cart:
import { useCartDrawerStore } from '@/lib/cart';

export function OpenCartButton() {
  const { openCart } = useCartDrawerStore();

  return (
    <button onClick={openCart}>
      View Cart
    </button>
  );
}
*/

// ============================================================
// 5. CHECKOUT WITH CUSTOM INFO
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { createPublicOrder } from '@/lib/actions/public-menu-actions';
import { toast } from 'sonner';

export async function handleCheckout(
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  },
  options: {
    deliveryMethod: 'table' | 'pickup';
    paymentMethod: 'card' | 'cash';
    specialInstructions?: string;
  }
) {
  const { items, tableToken, getTotal } = useCartStore.getState();

  if (items.length === 0) {
    toast.error('Cart is empty');
    return;
  }

  try {
    const orderData = {
      items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price_cts: item.price_cts,
        name: item.name,
      })),
      customerInfo,
      deliveryMethod: options.deliveryMethod,
      paymentMethod: options.paymentMethod,
      specialInstructions: options.specialInstructions,
      total: getTotal(),
    };

    const result = await createPublicOrder(
      tableToken || '',
      orderData.items,
      options.specialInstructions
    );

    if (result.success) {
      toast.success('Order placed successfully!');
      useCartStore.getState().clearCart();
      return result;
    } else {
      toast.error(result.error || 'Failed to place order');
    }
  } catch (error) {
    toast.error('An error occurred');
    console.error(error);
  }
}
*/

// ============================================================
// 6. CLEAR CART AFTER ORDER
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { useRouter } from 'next/navigation';

export function OrderConfirmation({ orderId }) {
  const { clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    // Clear cart after order confirmation
    clearCart();

    // Optional: redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/public/menu');
    }, 3000);

    return () => clearTimeout(timer);
  }, [orderId, clearCart, router]);

  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Order ID: {orderId}</p>
      <p>You will be redirected to menu...</p>
    </div>
  );
}
*/

// ============================================================
// 7. MODIFY ITEM NOTES
// ============================================================

/*
import { useCartStore } from '@/lib/cart';

export function ItemNotes({ itemId, currentNotes }) {
  const { updateNotes } = useCartStore();

  const handleNotesChange = (newNotes: string) => {
    updateNotes(itemId, newNotes);
  };

  return (
    <textarea
      value={currentNotes || ''}
      onChange={(e) => handleNotesChange(e.target.value)}
      placeholder="Special instructions..."
    />
  );
}
*/

// ============================================================
// 8. VALIDATE CART BEFORE CHECKOUT
// ============================================================

/*
import {
  validateCartItem,
  isCartEmpty,
  calculateTotal,
} from '@/lib/cart/cart-utils';
import { useCartStore } from '@/lib/cart';

export function validateBeforeCheckout() {
  const { items } = useCartStore.getState();

  // Check if cart is empty
  if (isCartEmpty(items)) {
    throw new Error('Cart is empty');
  }

  // Validate each item
  for (const item of items) {
    const validation = validateCartItem(item);
    if (!validation.valid) {
      throw new Error(`Item ${item.name}: ${validation.errors.join(', ')}`);
    }
  }

  // Check minimum order amount
  const total = calculateTotal(items);
  const MIN_ORDER = 1000; // $10 in cents
  if (total < MIN_ORDER) {
    throw new Error(`Minimum order is $${(MIN_ORDER / 100).toFixed(2)}`);
  }

  return true;
}
*/

// ============================================================
// 9. EXPORT CART DATA
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { exportCartData } from '@/lib/cart/cart-utils';

export function ExportCartButton() {
  const { items } = useCartStore();

  const handleExport = () => {
    const data = exportCartData(
      items,
      'My Restaurant',
      'Table 42'
    );

    // Download as JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cart-${Date.now()}.json`;
    a.click();
  };

  return (
    <button onClick={handleExport}>
      Export Cart
    </button>
  );
}
*/

// ============================================================
// 10. TRACK CART ANALYTICS
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { useEffect } from 'react';

export function useCartAnalytics() {
  const { items, getTotal } = useCartStore();

  useEffect(() => {
    // Track when items are added/removed
    if (items.length > 0) {
      const event = {
        event: 'cart_updated',
        itemCount: items.length,
        cartValue: getTotal(),
        timestamp: new Date(),
      };

      // Send to analytics
      console.log('Analytics event:', event);
      // analytics.track(event);
    }
  }, [items, getTotal]);
}
*/

// ============================================================
// 11. DYNAMIC CURRENCY FORMATTING
// ============================================================

/*
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/cart/cart-utils';

export function PriceDisplay({ priceCents, currency = 'USD' }) {
  return (
    <span className="price">
      {formatPrice(priceCents, currency)}
    </span>
  );
}
*/

// ============================================================
// 12. PROMO CODE INTEGRATION
// ============================================================

/*
import { PromoSection } from '@/components/public/promo-section';
import { useCartStore } from '@/lib/cart';
import { useState } from 'react';

export function CheckoutWithPromo() {
  const { getSubtotal } = useCartStore();
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const handlePromoApply = (code: string, discountAmount: number) => {
    setAppliedCode(code);
    setDiscount(discountAmount);
  };

  const subtotal = getSubtotal();
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div>
      <PromoSection
        subtotal={subtotal}
        onApply={handlePromoApply}
      />
      
      <div className="pricing">
        <p>Subtotal: {subtotal}</p>
        {discount > 0 && (
          <p>Discount ({appliedCode}): -{discount}</p>
        )}
        <p className="total">Total: {finalTotal}</p>
      </div>
    </div>
  );
}
*/

export default {};
