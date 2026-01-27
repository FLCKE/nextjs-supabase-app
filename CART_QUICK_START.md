# 🚀 Cart System - Quick Start Guide

Get the cart system running in 5 minutes!

## Prerequisites

✅ Next.js 16+  
✅ React 19+  
✅ TypeScript 5+  
✅ Tailwind CSS  
✅ Zustand  

## 1️⃣ Install Dependency (1 minute)

```bash
npm install @radix-ui/react-radio-group
```

## 2️⃣ Copy Files (1 minute)

All files are already in place:
- ✅ Components: `src/components/public/`
- ✅ State: `src/lib/cart/`
- ✅ Pages: `src/app/(public)/public/cart` and `/checkout-form`

## 3️⃣ Use in Your Menu Page (2 minutes)

### Option A: Use Existing Components (Easiest)

Your menu page already works! Just ensure you have:

```tsx
import { CartSummaryBar } from '@/components/public/cart-summary-bar';

export default function MenuPage() {
  return (
    <>
      <main>
        {/* Your menu items here */}
      </main>
      
      {/* This automatically shows when items are added */}
      <CartSummaryBar currency="USD" />
    </>
  );
}
```

### Option B: Add Enhanced Header

```tsx
import { MenuHeader } from '@/components/public/menu-header';

export default function MenuPage() {
  return (
    <>
      <MenuHeader 
        restaurantName="My Restaurant"
        locationName="Main Location"
        tableLabel="42"
      />
      {/* Rest of page */}
    </>
  );
}
```

## 4️⃣ Test It! (1 minute)

```bash
npm run dev
```

Then:
1. Navigate to `/public/menu`
2. Click "Add to Cart" on any item
3. See the cart summary bar appear at bottom
4. Click "Checkout"
5. See the order confirmation

## 5️⃣ Customize (Optional)

### Change Currency
```tsx
// src/lib/cart/config.ts
export const DEFAULT_CURRENCY = 'EUR';
```

### Change Storage Key
```tsx
// src/lib/cart/cart-store.ts
{
  name: 'my-app-cart',
}
```

### Add Promo Codes
```tsx
// src/components/public/promo-section.tsx
const AVAILABLE_PROMOS = [
  {
    code: 'WELCOME10',
    description: '10% off',
    discountType: 'percentage',
    discountValue: 10,
  },
];
```

---

## 📍 Key Routes

| Route | Purpose |
|-------|---------|
| `/public/menu` | Browse menu |
| `/public/cart` | View cart (full page) |
| `/public/checkout` | Quick checkout |
| `/public/checkout-form` | Full checkout form |

## 🎯 Main Components

| Component | Location | Use |
|-----------|----------|-----|
| `MenuItemCard` | `components/public/` | Add to cart button |
| `CartSummaryBar` | `components/public/` | Sticky bottom bar |
| `CartDrawer` | `components/public/` | Side panel |
| `CartPageContent` | `components/public/` | Full cart page |
| `CheckoutForm` | `components/public/` | Checkout form |

## 📚 State Access

```tsx
import { useCartStore } from '@/lib/cart';

export function MyComponent() {
  // Get state
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  
  // Use actions
  const { addItem, removeItem } = useCartStore();
}
```

## ⚙️ Configuration

Edit `src/lib/cart/config.ts`:

```tsx
// Currency
export const DEFAULT_CURRENCY = 'USD';

// Minimum order
export const MIN_ORDER_AMOUNT_CENTS = 1000; // $10

// Stock warning level
export const WARN_STOCK_THRESHOLD = 5;

// Estimated delivery time
export const DELIVERY_TIME_MINUTES = 15;
```

## 🔗 API Integration

To save orders to database:

```tsx
import { createPublicOrder } from '@/lib/actions/public-menu-actions';

const { items, getTotal } = useCartStore.getState();

const result = await createPublicOrder(
  tableToken,
  items.map(item => ({
    id: item.id,
    quantity: item.quantity,
    price_cts: item.price_cts,
  })),
  specialInstructions
);

if (result.success) {
  console.log('Order created:', result.data);
}
```

## 🧪 Testing

### Test Add to Cart
```tsx
const { addItem } = useCartStore();

addItem({
  id: '1',
  name: 'Burger',
  price_cts: 999,
  tax_rate: 8,
  quantity: 1,
});
```

### Test Calculations
```tsx
const { getTotal, getSubtotal, getTaxes } = useCartStore();

console.log('Subtotal:', getSubtotal()); // 999
console.log('Taxes:', getTaxes()); // ~80
console.log('Total:', getTotal()); // ~1079
```

### Clear Cart
```tsx
useCartStore.getState().clearCart();

// Or from localStorage directly
localStorage.removeItem('wego-cart-storage');
```

## 📱 Mobile Responsive

All components are mobile-first:
- ✅ Drawer works on small screens
- ✅ Sticky bar optimized for mobile
- ✅ Touch-friendly buttons (44x44px minimum)
- ✅ Responsive typography

## ♿ Accessibility

All components include:
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Live regions

Test with your screen reader!

## 🐛 Troubleshooting

### Cart not showing?
```tsx
// Check if items are being added
console.log(useCartStore.getState().items);
```

### Total not calculating?
```tsx
// Check price_cts is in cents (not dollars)
// $10 = 1000 cents, not 10

// Verify tax_rate is set
item.tax_rate // should be 8, not 0.08
```

### Can't import components?
```tsx
// Use the barrel export
import { CartDrawer, CartButton } from '@/components/public/cart-components';
```

## 📖 Full Documentation

- **CART_CHECKOUT_GUIDE.md** - Complete system docs
- **CART_CHECKOUT_IMPLEMENTATION.md** - Implementation details
- **CART_INTEGRATION_EXAMPLES.md** - 12 code examples
- **CART_SYSTEM_FILES_SUMMARY.md** - File reference

## 🎨 Styling

All components use Tailwind CSS. Customize:

```tsx
// In component files, modify tailwindcss classes:
<div className="max-w-md bg-card border rounded-lg">
  {/* Change colors, spacing, etc. */}
</div>
```

Or configure Tailwind globally:
```tsx
// tailwind.config.ts
export default {
  theme: {
    colors: {
      primary: '#your-color',
    },
  },
};
```

## 🔄 Workflow

```
Menu Page
   ↓
User clicks "Add to Cart"
   ↓
Item added to Zustand store
   ↓
CartSummaryBar appears
   ↓
User clicks "Checkout"
   ↓
Navigate to /public/checkout
   ↓
User submits order
   ↓
Order saved to database
   ↓
Success screen shown
   ↓
Cart cleared
```

## ✅ Verification Checklist

- [ ] Dependency installed (`npm install @radix-ui/react-radio-group`)
- [ ] Components visible in `src/components/public/`
- [ ] State stores in `src/lib/cart/`
- [ ] Pages created (`/cart`, `/checkout-form`)
- [ ] Menu page renders without errors
- [ ] Can add item to cart
- [ ] Cart total updates
- [ ] Can navigate to checkout
- [ ] Can see order confirmation
- [ ] Mobile view works
- [ ] Screen reader compatible

## 🚀 Deploy

```bash
# Build
npm run build

# Start production server
npm start

# Or deploy to Vercel, etc.
vercel deploy
```

## 💡 Pro Tips

1. **Memoize cart state** to avoid unnecessary re-renders:
   ```tsx
   const items = useCartStore(state => state.items);
   ```

2. **Use the config file** for all constants:
   ```tsx
   import { DEFAULT_CURRENCY, MIN_ORDER_AMOUNT_CENTS } from '@/lib/cart/config';
   ```

3. **Validate before checkout**:
   ```tsx
   import { validateCartItem } from '@/lib/cart/cart-utils';
   const result = validateCartItem(item);
   if (!result.valid) console.log(result.errors);
   ```

4. **Export cart data** for debugging:
   ```tsx
   import { exportCartData } from '@/lib/cart/cart-utils';
   const data = exportCartData(items, 'Restaurant', 'Table 1');
   console.log(JSON.stringify(data));
   ```

## 🆘 Need Help?

1. Check CART_INTEGRATION_EXAMPLES.md for code samples
2. Review component props in CART_CHECKOUT_GUIDE.md
3. Look at src/lib/cart/types.ts for TypeScript definitions
4. Debug with browser DevTools and React DevTools

## 📞 Support

For issues:
1. Check component files (they're well-commented)
2. Review type definitions (src/lib/cart/types.ts)
3. Test in isolation first
4. Check console for errors
5. Verify localStorage isn't disabled
6. Clear cache and rebuild: `npm run build`

---

**Next Step:** Check CART_INTEGRATION_EXAMPLES.md for practical code examples!

**Status:** ✅ Ready to Use  
**Last Updated:** January 27, 2026
