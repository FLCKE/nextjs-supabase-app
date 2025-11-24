# Order Management - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Apply the Migration
```bash
npx supabase db push
```
Select **Y** when prompted. This creates the `orders` and `order_items` tables with RLS policies.

### Step 2: Start the Dev Server
```bash
npm run dev
```

### Step 3: View Orders Dashboard
Navigate to: **http://localhost:3000/dashboard/orders**

## 📱 Creating an Order (Public API)

### Option A: Via Server Action (Recommended)
```typescript
import { createOrder } from '@/lib/actions/order-actions';

const result = await createOrder({
  table_token: 'uuid-from-qr-code',  // Get from your tables table
  items: [
    { item_id: 'menu-item-uuid-1', qty: 2 },
    { item_id: 'menu-item-uuid-2', qty: 1 }
  ],
  notes: 'No onions, please'  // Optional
});

if (result.success) {
  console.log('Order created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Option B: Via API Route (Create if needed)
Create `src/app/api/orders/route.ts`:
```typescript
import { createOrder } from '@/lib/actions/order-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOrder(body);
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

Then use it:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_token": "your-table-uuid",
    "items": [
      { "item_id": "menu-item-uuid", "qty": 2 }
    ],
    "notes": "Extra sauce"
  }'
```

## 🧪 Testing the System

### 1. Get Test Data
First, you need:
- A restaurant
- A location in that restaurant
- A table with a QR token
- Menu items

Check your database:
```sql
-- Get a table token
SELECT t.qr_token, t.label, l.name as location, r.name as restaurant
FROM tables t
JOIN locations l ON t.location_id = l.id
JOIN restaurants r ON l.restaurant_id = r.id
LIMIT 1;

-- Get menu item IDs
SELECT id, name, price_cts, active
FROM menu_items
WHERE active = true
LIMIT 5;
```

### 2. Create Test Order
Use the table token and menu item IDs from above:
```typescript
const result = await createOrder({
  table_token: 'copied-from-query',
  items: [
    { item_id: 'item-uuid-1', qty: 2 },
    { item_id: 'item-uuid-2', qty: 1 }
  ],
  notes: 'Test order'
});
```

### 3. View in Dashboard
1. Go to `/dashboard/orders`
2. You should see your order immediately
3. Click "View" to see details
4. Change the status to test updates

### 4. Test Real-time
1. Open `/dashboard/orders` in two browser tabs
2. Create a new order in tab 1
3. Watch it appear instantly in tab 2 with a toast notification! 🎉

## 🎨 Dashboard Features

### Orders List (`/dashboard/orders`)
- View all orders in real-time
- Filter by status (Pending, Paying, Paid, Served, Cancelled, Refunded)
- See order totals and timestamps
- Click "View" for details

### Order Detail (`/dashboard/orders/[id]`)
- View complete order information
- See all items with quantities and prices
- Update order status
- View customer notes
- See pricing breakdown (subtotal, taxes, total)

## 🔄 Order Status Flow

```
New Order
   ↓
PENDING  ──→  PAYING  ──→  PAID  ──→  SERVED ✅
   ↓             ↓          ↓
CANCELLED    CANCELLED  REFUNDED
```

**Status Meanings:**
- **PENDING**: Order just created, awaiting payment
- **PAYING**: Customer is currently paying
- **PAID**: Payment received, preparing order
- **SERVED**: Order delivered to customer
- **CANCELLED**: Order cancelled (before payment)
- **REFUNDED**: Payment refunded

## 📊 What Happens When Order is Created?

1. **Validates table token** - Ensures it's valid and active
2. **Fetches menu items** - Gets current prices and availability
3. **Checks stock** - Verifies finite items have enough stock
4. **Calculates totals** - Computes net, taxes, and gross amounts
5. **Creates order** - Inserts into database
6. **Creates order items** - Snapshots item names and prices
7. **Updates inventory** - Decrements stock for finite items
8. **Broadcasts event** - Triggers real-time update
9. **Shows notification** - Toast appears in dashboard

## 🔐 Security

### Public Access (No Auth)
- ✅ Can create orders via valid table token
- ❌ Cannot view orders
- ❌ Cannot update orders
- ❌ Cannot delete orders

### Restaurant Owner/Staff (Authenticated)
- ✅ Can view their restaurant's orders
- ✅ Can update order status
- ✅ Can delete orders
- ✅ Real-time notifications
- ❌ Cannot see other restaurants' orders

## 💡 Pro Tips

### 1. Real-time Updates
The dashboard uses Supabase Realtime. Make sure:
- Realtime is enabled in your Supabase project
- WebSocket connections are allowed
- Browser supports WebSocket (all modern browsers do)

### 2. Currency Formatting
Orders use the restaurant's currency setting. Amounts stored in cents for precision.

### 3. Order Totals
All calculations happen **server-side** for security:
- Fetches current menu prices
- Calculates taxes based on item tax_rate
- Prevents price manipulation

### 4. Inventory
For items with `stock_mode = 'FINITE'`:
- Stock automatically decrements on order creation
- Creates `OUT` adjustment with reason "Order {order_id}"
- Order fails if insufficient stock

### 5. Testing Toast Notifications
Toast notifications only appear for **new** orders:
- Create an order while dashboard is open
- You'll see: "New order received! Table X - Y items"

## 🐛 Common Issues

### "Invalid or inactive table token"
- Check the table exists in database
- Verify `active = true` on the table
- Ensure you're using `qr_token` not `id`

### "Menu items not found"
- Verify menu item IDs exist
- Check items have `active = true`
- Ensure items belong to the restaurant

### "Insufficient stock"
- Item has `stock_mode = 'FINITE'`
- Current stock is less than quantity requested
- Add inventory with adjustment or set to `INFINITE`

### Orders not appearing in dashboard
- Verify you're logged in as restaurant owner
- Check order's table belongs to your restaurant
- Try refreshing the page

### Real-time not working
- Check browser console for errors
- Verify Supabase Realtime is enabled
- Try in incognito mode (extensions can block WebSocket)

## 📚 Next Steps

1. **Test the flow**: Create orders and manage them
2. **Customize statuses**: Modify workflow to match your needs
3. **Add payment**: Integrate Stripe or other payment gateway
4. **Customer tracking**: Build public order status page
5. **Kitchen display**: Create KDS for kitchen staff
6. **Analytics**: Add order reports and charts

## 🎯 Quick Commands

```bash
# Apply migration
npx supabase db push

# Start dev server
npm run dev

# Build for production
npm run build

# View Supabase Studio
npx supabase studio
```

## 📖 Documentation

- **Complete Guide**: `ORDER_MANAGEMENT_GUIDE.md`
- **Implementation Details**: `ORDER_MANAGEMENT_IMPLEMENTATION.md`
- **This Guide**: `ORDER_QUICK_START.md`

---

**Ready to receive orders!** 🎉

Visit `/dashboard/orders` to start managing orders in real-time.
