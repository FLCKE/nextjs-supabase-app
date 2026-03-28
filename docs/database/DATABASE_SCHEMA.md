# 🗄️ Database Schema & Data Models

Complete documentation of the PostgreSQL database structure used by WEGO RestoPay.

---

## Overview

WEGO RestoPay uses **Supabase PostgreSQL** with **Row-Level Security (RLS)** to ensure multi-tenant data isolation.

**Key Principles:**
- Each restaurant is isolated (tenant)
- Users can only access restaurants they own
- Data is encrypted at rest
- Real-time subscriptions available via WebSocket

---

## Core Tables

### `users`
Owner and staff user accounts.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'owner',  -- 'owner', 'staff', 'customer'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS: Users can only see/update their own record
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

**Related Fields:**
- `role`: User's role in the system
  - `owner` - Restaurant owner (can manage all)
  - `staff` - Staff member (can only manage assigned restaurant)
  - `customer` - Customer (can place orders)

---

### `restaurants`
Restaurant information and configuration.

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  website TEXT,
  
  -- Address
  country VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  postal_code VARCHAR(20),
  
  -- Settings
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'XAF',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  opening_hours JSONB,  -- { "monday": {"open": "09:00", "close": "22:00"}, ... }
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS: Users can only see restaurants they own
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
```

**Example Data:**
```json
{
  "id": "rest-uuid-123",
  "owner_id": "user-uuid-456",
  "name": "Le Gourmet",
  "city": "Yaoundé",
  "currency": "XAF",
  "timezone": "Africa/Douala"
}
```

---

### `staff_members`
Staff accounts associated with restaurants.

```sql
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  role VARCHAR(50) DEFAULT 'staff',  -- 'manager', 'chef', 'cashier', 'waiter'
  permissions JSONB DEFAULT '{}',    -- Granular permissions
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(restaurant_id, user_id)
);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
```

---

### `menus`
Menu documents (collections of items).

```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,        -- e.g., "Breakfast", "Lunch", "Dinner"
  description TEXT,
  
  -- Display settings
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  -- Availability
  available_from TIME,               -- e.g., "06:00"
  available_until TIME,              -- e.g., "11:30"
  days_available INT[] DEFAULT '{0,1,2,3,4,5,6}',  -- 0=Sunday, 1=Monday, etc.
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
```

---

### `menu_items`
Individual food/beverage items.

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,  -- In smallest currency unit (e.g., cents)
  currency VARCHAR(3),
  cost_price DECIMAL(10,2),            -- For margin tracking
  
  -- Details
  category VARCHAR(100),               -- e.g., "appetizer", "main", "dessert"
  tags TEXT[],                         -- e.g., ["spicy", "vegetarian", "vegan"]
  allergens TEXT[],                    -- e.g., ["peanuts", "gluten", "dairy"]
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  available_from TIME,
  available_until TIME,
  
  -- Variants (if applicable)
  variants JSONB,  -- { "size": ["small", "medium", "large"], "temperature": ["hot", "cold"] }
  
  -- Sorting
  display_order INTEGER,
  
  -- Inventory tracking
  track_inventory BOOLEAN DEFAULT false,
  current_stock INTEGER,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
```

**Example Data:**
```json
{
  "id": "item-uuid",
  "name": "Grilled Salmon",
  "base_price": 15000,
  "currency": "XAF",
  "category": "main",
  "tags": ["fish", "healthy"],
  "allergens": ["fish"],
  "variants": {
    "temperature": ["rare", "medium", "well-done"],
    "side": ["fries", "rice", "vegetables"]
  }
}
```

---

### `orders`
Customer orders.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id),  -- NULL if takeout
  
  -- Payment
  payment_id UUID REFERENCES payments(id),
  
  -- Order Details
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3),
  
  -- Customer Info
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Notes
  special_requests TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  started_at TIMESTAMP,               -- When preparation started
  ready_at TIMESTAMP,                 -- When order was ready
  completed_at TIMESTAMP,             -- When customer received it
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

---

### `order_items`
Individual items within an order.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  
  -- Snapshot of menu item at order time
  item_name VARCHAR(255) NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Customization
  variants_selected JSONB,            -- {"size": "large", "temperature": "medium"}
  special_instructions TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'preparing', 'ready'
  
  -- Tracking
  created_at TIMESTAMP DEFAULT now(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

---

### `payments`
Payment records (Moneroo integration).

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  
  -- Moneroo Details
  transaction_id VARCHAR(255) UNIQUE NOT NULL,  -- From Moneroo
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'completed', 'failed', 'expired', 'refunded'
  
  -- Customer Info
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Metadata
  metadata JSONB,  -- Custom data (table_id, request_source, etc.)
  
  -- Payment Gateway Details
  payment_method VARCHAR(50) DEFAULT 'moneroo',
  gateway_reference TEXT,
  gateway_response JSONB,
  
  -- Timestamps
  initiated_at TIMESTAMP DEFAULT now(),
  confirmed_at TIMESTAMP,             -- When webhook confirmed payment
  expired_at TIMESTAMP,               -- 1 hour after initiated_at
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

---

### `tables`
Physical tables/seating areas.

```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  table_number INTEGER NOT NULL,
  name VARCHAR(100),                  -- e.g., "Table 1", "Window Seat"
  description TEXT,
  capacity INTEGER DEFAULT 2,
  location VARCHAR(100),              -- e.g., "Patio", "Inside", "Bar"
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(restaurant_id, table_number)
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
```

---

### `payments`
Payout records (bank transfers).

```sql
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  
  -- Bank Details
  bank_account_id UUID,               -- FK to bank accounts (if stored)
  account_holder VARCHAR(255),
  account_number VARCHAR(50),
  bank_name VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- External Reference
  gateway_reference TEXT,             -- From payment provider
  gateway_response JSONB,
  
  -- Timestamps
  initiated_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
```

---

### `qr_codes`
QR code links to menus.

```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Token for URL resolution
  token VARCHAR(255) UNIQUE NOT NULL,
  
  -- Where it's deployed
  location_description VARCHAR(255),   -- e.g., "Table 1", "Door"
  table_id UUID REFERENCES tables(id),
  
  -- QR Details
  qr_image_url TEXT,                  -- Pre-generated QR image
  display_name VARCHAR(100),
  
  is_active BOOLEAN DEFAULT true,
  last_scanned_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
```

---

## View Relationships

```
restaurants
├── owner_id → users
├── menus
│   └── menu_items
│       └── order_items → order
├── tables → qr_codes
├── orders
│   ├── table_id → tables
│   ├── payment_id → payments
│   └── order_items
├── payments
│   └── transaction_id (Moneroo)
├── staff_members → users
└── transfers
```

---

## Multi-Tenancy & Security

### Row-Level Security Policies

**Restaurants Table:**
```sql
-- Owners can only see their own restaurants
CREATE POLICY "restaurant_owner_select" ON restaurants
  FOR SELECT USING (owner_id = auth.uid());

-- Only owners can update their restaurants
CREATE POLICY "restaurant_owner_update" ON restaurants
  FOR UPDATE USING (owner_id = auth.uid());
```

**Menus Table:**
```sql
-- Users can see menus of their restaurants
CREATE POLICY "menu_select" ON menus
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );
```

**Orders Table:**
```sql
-- Users can only see orders from their restaurants
CREATE POLICY "order_select" ON orders
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );
```

---

## Indexes for Performance

```sql
-- Fast restaurant lookups
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);

-- Fast menu item search
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Fast order lookups
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Fast payment lookups
CREATE INDEX idx_payments_restaurant_id ON payments(restaurant_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Fast staff lookups
CREATE INDEX idx_staff_restaurant_id ON staff_members(restaurant_id);
```

---

## Real-time Subscriptions

Supabase enables real-time updates via PostgreSQL changes:

```typescript
// Subscribe to new orders
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('New order:', payload.new);
    }
  )
  .subscribe();

// Subscribe to payment updates
supabase
  .channel('payments')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'payments' },
    (payload) => {
      console.log('Payment updated:', payload.new);
    }
  )
  .subscribe();
```

---

## Data Migration & Backups

### Create Migration
```bash
# Create a new migration file
npx supabase migration new table_name

# Edit the file in supabase/migrations/
# Apply locally
npx supabase migration up

# Push to production
npx supabase db push
```

### Backup Database
```bash
# Using Supabase CLI
npx supabase db pull

# Using psql directly
pg_dump "postgresql://user:password@host/database" > backup.sql
```

---

## Common Queries

### Get All Orders for a Restaurant
```sql
SELECT 
  o.id, o.table_id, o.status, o.total_amount, o.created_at
FROM orders o
WHERE o.restaurant_id = $1
ORDER BY o.created_at DESC
LIMIT 50;
```

### Get Revenue by Date
```sql
SELECT 
  DATE(p.initiated_at) as date,
  SUM(p.amount) as total_revenue,
  COUNT(p.id) as total_orders
FROM payments p
WHERE p.restaurant_id = $1
  AND p.status = 'completed'
  AND p.initiated_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(p.initiated_at)
ORDER BY date DESC;
```

### Get Pending Orders
```sql
SELECT 
  o.id, o.customer_name, o.total_amount,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.restaurant_id = $1
  AND o.status IN ('pending', 'preparing')
GROUP BY o.id
ORDER BY o.created_at ASC;
```

### Get Menu Item Popular Items
```sql
SELECT 
  mi.id, mi.name, mi.category,
  COUNT(oi.id) as order_count,
  AVG(oi.quantity) as avg_quantity
FROM menu_items mi
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE mi.restaurant_id = $1
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY mi.id
ORDER BY order_count DESC;
```

---

## Troubleshooting

### Check Row-Level Security
```sql
-- See all RLS policies
SELECT * FROM pg_policies WHERE tablename = 'restaurants';

-- Test a policy
SELECT * FROM restaurants WHERE owner_id = 'your-user-id';
```

### Find Large Tables
```sql
SELECT 
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Connections
```sql
SELECT pid, usename, application_name, state 
FROM pg_stat_activity;
```

---

See also:
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Code organization
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoints
- **[WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)** - Payment integration
