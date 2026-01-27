# 🛒 Cart & Checkout System - WEGO RestoPay

## Overview

A comprehensive shopping cart and checkout system designed for restaurant ordering in the WEGO RestoPay platform. Customers can browse menus, add items to cart, and complete orders with a smooth, user-friendly experience.

## Architecture

### State Management

**Zustand Stores:**
- `useCartStore` - Main cart state with items, quantities, and calculations
- `useCartDrawerStore` - UI state for cart drawer visibility

```typescript
// useCartStore state
{
  items: CartItem[];
  tableToken: string | null;
  addItem(item): void;
  removeItem(itemId): void;
  updateQuantity(itemId, quantity): void;
  updateNotes(itemId, notes): void;
  clearCart(): void;
  setTableToken(token): void;
  getItemCount(): number;
  getSubtotal(): number;
  getTaxes(): number;
  getTotal(): number;
}
```

### Components

#### Core Components

1. **CartSummaryBar** (`cart-summary-bar.tsx`)
   - Sticky bar at bottom of menu page
   - Shows item count, total price, and checkout button
   - Expandable to show tax breakdown
   - Appears only when items in cart

2. **MenuItemCard** (`menu-item-card.tsx`)
   - Individual menu item with image, description, and price
   - Quick add to cart controls
   - Quantity increment/decrement directly in card
   - Stock status indication
   - Accessibility features for screen readers

#### Cart Display Components

3. **CartDrawer** (`cart-drawer.tsx`)
   - Side drawer showing all cart items
   - Quantity controls
   - Remove item functionality
   - Summary with subtotal, taxes, total
   - Checkout button

4. **MiniCart** (`mini-cart.tsx`)
   - Compact dropdown cart preview
   - Quick item overview
   - Used in headers/sidebars

5. **CartButton** (`cart-button.tsx`)
   - Floating action button / icon button
   - Shows badge with item count
   - Used in headers

#### Cart Pages

6. **CartPageContent** (`cart-page-content.tsx`)
   - Full dedicated cart page (`/public/cart`)
   - Edit mode for quantity and notes
   - Item removal
   - Order summary
   - Continue shopping button

7. **CheckoutForm** (`checkout-form.tsx`)
   - Full checkout form page (`/public/checkout-form`)
   - Customer information collection
   - Delivery method selection (table/pickup)
   - Payment method selection (cash/card)
   - Special instructions field
   - Order confirmation screen

#### Dialog Components

8. **AddToCartDialog** (`add-to-cart-dialog.tsx`)
   - Modal dialog for adding items
   - Quantity selector
   - Item details display
   - Stock information
   - Success animation

#### Header Components

9. **CartHeader** (`cart-header.tsx`)
   - Minimal cart display for headers
   - Item count and total price
   - Quick links to cart and checkout

10. **CartSummaryBar** (existing, enhanced)
    - Sticky bottom bar on menu page
    - Shows cart summary with expandable details

## User Flow

### Customer Journey

```
Menu Browse
   ↓
Add Item (MenuItemCard or AddToCartDialog)
   ↓
View Cart (CartSummaryBar or navigate to /public/cart)
   ↓
Review & Edit (CartPageContent)
   ↓
Checkout (/public/checkout or /public/checkout-form)
   ↓
Confirm Order
   ↓
Success Screen
```

## Features

### 1. **Shopping Cart Management**
- Add/remove items
- Update quantities
- Add special instructions/notes per item
- Calculate subtotal, taxes, and total
- Persistent storage (localStorage via Zustand persist middleware)

### 2. **Stock Management**
- Display stock status (infinite/finite/hidden when out of stock)
- Prevent adding out-of-stock items
- Show low stock warnings (< 5 items)
- Dynamic UI updates

### 3. **Pricing & Taxes**
- Per-item tax rate support
- Automatic tax calculation
- Multiple currency support
- Real-time price updates

### 4. **UI/UX**
- Responsive design (mobile/tablet/desktop)
- Multiple cart views (sticky bar, drawer, page)
- Smooth animations and transitions
- Loading states during checkout

### 5. **Accessibility**
- ARIA labels and roles
- Screen reader announcements
- Keyboard navigation
- Focus management
- Live regions for quantity updates

### 6. **Order Management**
- Table token integration for in-restaurant orders
- Delivery method selection
- Payment method selection
- Special instructions collection
- Order confirmation with ID

## File Structure

```
src/
├── components/public/
│   ├── add-to-cart-dialog.tsx      # Modal for adding items
│   ├── cart-button.tsx              # Icon button with badge
│   ├── cart-drawer.tsx              # Side drawer cart view
│   ├── cart-header.tsx              # Header cart display
│   ├── cart-page-content.tsx        # Full cart page
│   ├── cart-summary-bar.tsx         # Sticky summary bar (existing)
│   ├── checkout-form.tsx            # Full checkout form
│   ├── menu-item-card.tsx           # Menu item card (existing)
│   └── mini-cart.tsx                # Compact dropdown cart
│
├── lib/cart/
│   ├── cart-store.ts                # Main Zustand store
│   └── cart-drawer-store.ts         # UI state store
│
└── app/(public)/public/
    ├── menu/                        # Menu browsing
    │   ├── page.tsx
    │   └── menu-content.tsx
    ├── cart/                        # Cart page (NEW)
    │   └── page.tsx
    ├── checkout/                    # Quick checkout
    │   └── page.tsx (existing)
    └── checkout-form/               # Full checkout form (NEW)
        └── page.tsx
```

## Integration Guide

### Adding Cart UI to Menu Page

```tsx
import { CartSummaryBar } from '@/components/public/cart-summary-bar';
import { MenuItemCard } from '@/components/public/menu-item-card';

export function MenuPage() {
  return (
    <>
      <main>
        {/* Menu items */}
        <MenuItemCard {...item} currency="USD" />
      </main>
      
      {/* Sticky cart summary bar */}
      <CartSummaryBar currency="USD" />
    </>
  );
}
```

### Adding Cart Drawer

```tsx
import { CartDrawer } from '@/components/public/cart-drawer';
import { useCartDrawerStore } from '@/lib/cart/cart-drawer-store';

export function Layout() {
  const { isOpen, closeCart } = useCartDrawerStore();
  
  return (
    <CartDrawer isOpen={isOpen} onClose={closeCart} />
  );
}
```

### Accessing Cart Data

```tsx
import { useCartStore } from '@/lib/cart/cart-store';

export function MyComponent() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotal,
    getSubtotal,
    getTaxes,
  } = useCartStore();

  // Use cart state and actions
}
```

## Customization

### Styling

Components use Tailwind CSS and Radix UI. Customize via:
- Tailwind config
- Component variant props
- CSS classes

### Currency & Locale

Prices format automatically using `Intl.NumberFormat`. Customize:

```tsx
const formatPrice = (cents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100);
};
```

### Tax Calculation

Modify tax calculation in store:

```typescript
getTaxes: () => {
  return get().items.reduce((total, item) => {
    const itemTotal = item.price_cts * item.quantity;
    const itemTax = Math.round((itemTotal * item.tax_rate) / 100);
    return total + itemTax;
  }, 0);
}
```

### Storage

Cart persists to localStorage. Customize storage key:

```typescript
{
  name: 'your-custom-key', // Change from 'wego-cart-storage'
}
```

## Best Practices

1. **Performance**
   - Use React.memo for menu item cards
   - Lazy load cart images
   - Debounce quantity updates

2. **Accessibility**
   - Always include aria-labels
   - Use live regions for updates
   - Test with screen readers

3. **Mobile**
   - Test sticky bar on small screens
   - Ensure touch targets are >= 44x44px
   - Optimize drawer for narrow screens

4. **Data Validation**
   - Validate item data before adding
   - Check stock before checkout
   - Validate customer info

5. **Error Handling**
   - Show clear error messages
   - Provide recovery options
   - Log errors for debugging

## Example Usage

### Complete Menu Page with Cart

```tsx
'use client';

import { useState } from 'react';
import { MenuItemCard } from '@/components/public/menu-item-card';
import { CartSummaryBar } from '@/components/public/cart-summary-bar';
import { useCartStore } from '@/lib/cart/cart-store';

export default function MenuPage() {
  const { setTableToken } = useCartStore();

  // Set table token from QR code
  useEffect(() => {
    setTableToken(params.table_token);
  }, [params.table_token]);

  return (
    <div className="min-h-screen">
      <header>
        <h1>Restaurant Menu</h1>
      </header>
      
      <main>
        <div className="grid grid-cols-3 gap-4">
          {menuItems.map(item => (
            <MenuItemCard key={item.id} {...item} currency="USD" />
          ))}
        </div>
      </main>

      <CartSummaryBar currency="USD" />
    </div>
  );
}
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Dependencies

- `zustand` - State management
- `@tanstack/react-query` - Server state (optional, for orders)
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `radix-ui` - UI components
- `tailwindcss` - Styling

## Future Enhancements

- [ ] Coupon/discount codes
- [ ] Cart persistence across devices
- [ ] Wishlist/favorites
- [ ] Order history
- [ ] Payment gateway integration
- [ ] Order tracking
- [ ] Subscription/recurring orders
- [ ] Group ordering
- [ ] Wallet/prepaid balance

## Support

For issues or questions:
1. Check component props and types
2. Review console for errors
3. Test in isolation first
4. Check accessibility tree
5. Verify store state with React DevTools

## Version History

- **v1.0.0** - Initial implementation
  - Cart store with persistence
  - MenuItemCard with quick add
  - CartSummaryBar
  - Checkout page
  - Mobile responsive design
  - Accessibility features
