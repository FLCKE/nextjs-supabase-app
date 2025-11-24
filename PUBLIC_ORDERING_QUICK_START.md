# Public Ordering - Quick Start

## 🚀 Getting Started

### 1. Generate QR Code for Table

```sql
-- Get table token from database
SELECT qr_token, label FROM tables WHERE id = 'your-table-id';
```

### 2. Create QR Code URL

```
https://yourapp.com/public/menu?table_token=YOUR-TABLE-TOKEN-HERE
```

### 3. Test the Flow

1. Scan QR code or visit URL
2. Browse menu
3. Add items to cart
4. Go to checkout
5. Review and confirm order
6. Order created! 🎉

## 📱 Menu Page

**URL:** `/public/menu?table_token=UUID`

### Features
- Search items
- Filter by category
- Add to cart
- Adjust quantities
- See prices & taxes
- Stock indicators
- Sticky cart summary

## 🛒 Cart Management

```typescript
import { useCartStore } from '@/lib/cart/cart-store';

const { items, addItem, updateQuantity, getTotal } = useCartStore();

// Add item
addItem({
  id: 'item-uuid',
  name: 'Burger',
  price_cts: 1500,
  tax_rate: 10,
});

// Update quantity
updateQuantity('item-uuid', 3);

// Get total
const total = getTotal(); // Returns cents
```

## 🎨 Components

### Menu Item Card
```tsx
<MenuItemCard
  id="uuid"
  name="Cheeseburger"
  description="Delicious burger"
  price_cts={1500}
  tax_rate={10}
  category="Burgers"
  image_url="/burger.jpg"
  stock_mode="INFINITE"
  stock_qty={null}
  currency="USD"
/>
```

### Cart Summary Bar
```tsx
<CartSummaryBar currency="USD" />
```

## ✅ Accessibility

All components include:
- ARIA labels
- Keyboard navigation
- Screen reader announcements
- Focus indicators
- Semantic HTML

## 📱 Mobile-First

- Responsive grid (1→2→3 columns)
- Touch-friendly targets
- Sticky header & cart
- Fast animations
- Optimized images

## 🔄 Order Flow

```typescript
import { createOrder } from '@/lib/actions/order-actions';

const result = await createOrder({
  table_token: 'uuid',
  items: [
    { item_id: 'uuid', qty: 2 }
  ],
  notes: 'No onions',
});

if (result.success) {
  console.log('Order ID:', result.data.id);
}
```

## 🚨 Error Handling

- Invalid token → Not found page
- No items → Empty state
- Out of stock → Disabled with badge
- Offline → Warning banner
- API error → Toast notification

## 🧪 Quick Test

1. Visit: `/public/menu?table_token=test`
2. Add items to cart
3. Click checkout
4. Review order
5. Confirm order
6. See order ID

## 📚 Full Docs

See `PUBLIC_ORDERING_FLOW.md` for complete documentation.

---

**Ready to order!** 🍔
