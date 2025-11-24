# Order Management System - WEGO RestoPay

Complete order management system with public order creation, real-time updates, and dashboard management.

## 📋 Features

- ✅ **Public Order Creation**: Customers can create orders via table QR token without authentication
- ✅ **Real-time Updates**: Live order notifications using Supabase Realtime
- ✅ **Order Dashboard**: Comprehensive order list with filters and status management
- ✅ **Order Details**: Detailed view with status updates and item breakdown
- ✅ **Server-side Validation**: Table token validation and price calculation
- ✅ **Inventory Integration**: Automatic inventory adjustments for finite stock items
- ✅ **Toast Notifications**: Real-time notifications for new orders
- ✅ **RLS Security**: Row-level security policies for owner/staff access only

## 🗄️ Database Schema

### Tables Created

#### `orders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| table_id | UUID | Reference to tables |
| status | TEXT | Order status (PENDING, PAYING, PAID, SERVED, CANCELLED, REFUNDED) |
| currency | TEXT | Currency code (e.g., USD) |
| total_net_cts | INTEGER | Subtotal in cents |
| taxes_cts | INTEGER | Tax amount in cents |
| total_gross_cts | INTEGER | Total including tax in cents |
| notes | TEXT | Customer notes (optional) |
| created_at | TIMESTAMPTZ | Order creation time |
| updated_at | TIMESTAMPTZ | Last update time |

#### `order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Reference to orders |
| item_id | UUID | Reference to menu_items |
| name | TEXT | Snapshot of item name |
| qty | INTEGER | Quantity ordered |
| unit_price_cts | INTEGER | Price per unit in cents |
| total_price_cts | INTEGER | Total price in cents |
| created_at | TIMESTAMPTZ | Item creation time |

### Views

#### `orders_with_details`
Combines orders with table, location, and restaurant information, plus item count.

### Functions

#### `validate_table_token(p_table_token UUID)`
Validates a table token and returns associated table, location, restaurant, and currency information.

### Indexes
- `idx_orders_table_id`: Fast lookups by table
- `idx_orders_status`: Filter orders by status
- `idx_orders_created_at`: Sort by creation time
- `idx_order_items_order_id`: Fast item lookups by order
- `idx_order_items_item_id`: Track items in orders

## 🔐 Security (RLS Policies)

### Orders Table
- **SELECT**: Restaurant owners/staff can view their restaurant's orders
- **INSERT**: Public (anonymous) users can create orders (validated via server action)
- **UPDATE**: Restaurant owners/staff can update their orders
- **DELETE**: Restaurant owners/staff can delete their orders

### Order Items Table
- **SELECT**: Restaurant owners/staff can view their order items
- **INSERT**: Public (anonymous) users can create order items (validated via parent order)
- **UPDATE**: Restaurant owners/staff can update order items
- **DELETE**: Restaurant owners/staff can delete order items

## 📁 File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── orders/
│               ├── page.tsx              # Orders list page
│               └── [id]/
│                   └── page.tsx          # Order detail page
├── components/
│   └── orders/
│       ├── orders-table.tsx             # Orders list with filters
│       └── order-detail.tsx             # Order detail view with status updates
├── hooks/
│   └── use-orders-realtime.ts           # Real-time order updates hook
├── lib/
│   ├── actions/
│   │   └── order-actions.ts             # Server actions for order management
│   └── validations/
│       └── order.ts                     # Zod schemas for validation
└── types/
    └── index.ts                         # TypeScript types

supabase/
└── migrations/
    └── 20251117_create_order_management.sql
```

## 🚀 Usage

### 1. Apply Migration

```bash
# Run the migration
npx supabase db push

# Or if using Supabase CLI
supabase migration up
```

### 2. Public Order Creation (No Auth)

Customers create orders by scanning a table QR code containing the table token:

```typescript
import { createOrder } from '@/lib/actions/order-actions';

const result = await createOrder({
  table_token: 'uuid-from-qr-code',
  items: [
    { item_id: 'menu-item-uuid-1', qty: 2 },
    { item_id: 'menu-item-uuid-2', qty: 1 },
  ],
  notes: 'No onions please',
});

if (result.success) {
  console.log('Order created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### 3. View Orders Dashboard

Navigate to `/dashboard/orders` to see:
- Real-time order list
- Filter by status
- Order totals and timestamps
- Quick access to order details

### 4. Manage Order Status

Click "View" on any order to:
- See full order details
- View all order items
- Update order status
- See pricing breakdown

### 5. Real-time Updates

The dashboard automatically updates when:
- New orders are created
- Order statuses change
- Orders are deleted

Toast notifications appear for new orders.

## 🔄 Order Lifecycle

```
PENDING → PAYING → PAID → SERVED
   ↓         ↓       ↓
CANCELLED ← ← ← ← ← ←
   ↓
REFUNDED
```

### Status Definitions

- **PENDING**: Order created, awaiting payment
- **PAYING**: Customer is in the payment process
- **PAID**: Payment confirmed
- **SERVED**: Order fulfilled and delivered
- **CANCELLED**: Order cancelled before payment
- **REFUNDED**: Order refunded after payment

## 💡 API Reference

### Server Actions

#### `createOrder(input: CreateOrderInput)`
Creates a new order with validation and inventory updates.

**Input:**
```typescript
{
  table_token: string;      // UUID from QR code
  items: Array<{
    item_id: string;        // Menu item UUID
    qty: number;            // Quantity (positive integer)
  }>;
  notes?: string;           // Optional customer notes
}
```

**Returns:**
```typescript
{
  success: boolean;
  data?: Order;             // Created order
  error?: string;           // Error message if failed
}
```

#### `getOrders(restaurantId?: string)`
Fetches all orders for a restaurant.

#### `getOrderById(orderId: string)`
Fetches a single order with all items.

#### `updateOrderStatus(orderId: string, input: UpdateOrderStatusInput)`
Updates an order's status.

**Input:**
```typescript
{
  status: 'PENDING' | 'PAYING' | 'PAID' | 'SERVED' | 'CANCELLED' | 'REFUNDED';
}
```

#### `deleteOrder(orderId: string)`
Deletes an order and all its items.

### React Hooks

#### `useOrdersRealtime(restaurantId?: string)`
Real-time order updates with automatic notifications.

**Returns:**
```typescript
{
  orders: OrderWithDetails[];
  isLoading: boolean;
}
```

## 🎨 UI Components

### OrdersTable
Displays orders in a filterable table with real-time updates.

**Props:**
- `initialOrders`: Initial order data from server
- `restaurantId`: Optional restaurant filter

### OrderDetail
Shows detailed order information with status management.

**Props:**
- `order`: Order with items and metadata

## 🔍 Key Features Explained

### 1. Public Order Creation
- No authentication required for customers
- Table token validates the order origin
- Server-side validation prevents fraud
- Automatic inventory adjustments

### 2. Server-side Totals Calculation
- Fetches current menu item prices
- Calculates subtotal and taxes
- Validates stock availability
- Ensures price consistency

### 3. Real-time Dashboard
- Supabase Realtime subscription
- Automatic UI updates
- Toast notifications for new orders
- No manual refresh needed

### 4. Inventory Integration
- Automatic OUT adjustments for finite stock items
- Tracks reason: "Order {order_id}"
- Validates stock before order creation
- Prevents overselling

### 5. Status Management
- Visual status indicators with color coding
- One-click status updates
- Audit trail via updated_at timestamp
- Restricted to authenticated users

## 📱 Mobile Responsive

All components are fully responsive:
- Mobile-friendly table views
- Touch-optimized controls
- Collapsible filters
- Readable on small screens

## 🧪 Testing

### Test Order Creation

1. Get a table token from your tables table
2. Use the server action or create a test API endpoint
3. Verify order appears in dashboard
4. Check inventory adjustments

### Test Real-time Updates

1. Open dashboard in two browser windows
2. Create an order in one window
3. Verify it appears in the other window
4. Update status and check both windows

## 🐛 Troubleshooting

### Orders not appearing in dashboard
- Check user is logged in and owns the restaurant
- Verify table belongs to user's restaurant
- Check RLS policies in Supabase dashboard

### Real-time not working
- Verify Supabase Realtime is enabled
- Check browser console for WebSocket errors
- Ensure correct restaurant ID filter

### Order creation fails
- Verify table token is valid and active
- Check menu items exist and are active
- Ensure sufficient stock for finite items
- Review server action error messages

## 🔮 Future Enhancements

- [ ] Order history and analytics
- [ ] Bulk status updates
- [ ] Order search and advanced filters
- [ ] Export orders to CSV
- [ ] Email/SMS notifications
- [ ] Payment gateway integration
- [ ] Customer order tracking page
- [ ] Kitchen display system (KDS)
- [ ] Print order receipts
- [ ] Split bills functionality

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase logs
3. Check browser console for errors
4. Verify migration was applied correctly

---

**Version**: 1.0.0  
**Last Updated**: November 17, 2025  
**Compatibility**: Next.js 15+, Supabase (Realtime enabled)
