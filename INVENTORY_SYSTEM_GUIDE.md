# 📦 Inventory Management System - Complete Guide

## Overview

The inventory management system allows restaurant owners to track stock levels for menu items with finite inventory. It records adjustments (stock in, out, and spoilage) and automatically calculates current stock levels.

---

## 🗄️ Database Schema

### Table: `inventory_adjustments`

Tracks all stock changes for menu items.

```sql
CREATE TABLE inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'SPOILAGE')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `id` - Unique identifier
- `item_id` - Reference to menu item
- `type` - Adjustment type:
  - `IN` - Stock added (new inventory received)
  - `OUT` - Stock removed (sold or used)
  - `SPOILAGE` - Stock discarded (damaged/expired)
- `quantity` - Amount adjusted (always positive)
- `reason` - Optional note explaining the adjustment
- `created_at` - Timestamp of adjustment

### View: `menu_items_with_stock`

Provides menu items with calculated current stock.

```sql
CREATE VIEW menu_items_with_stock AS
SELECT 
  mi.*,
  CASE 
    WHEN mi.stock_mode = 'FINITE' 
    THEN get_current_stock(mi.id)
    ELSE NULL
  END as current_stock,
  m.restaurant_id
FROM menu_items mi
JOIN menus m ON m.id = mi.menu_id;
```

### Function: `get_current_stock()`

Calculates current stock for an item.

```sql
CREATE FUNCTION get_current_stock(p_item_id UUID)
RETURNS INTEGER AS $$
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN type = 'SPOILAGE' THEN quantity ELSE 0 END), 0)
  FROM inventory_adjustments
  WHERE item_id = p_item_id;
$$;
```

**Formula:** `Current Stock = IN - OUT - SPOILAGE`

---

## 🔒 Row Level Security (RLS)

### Policy 1: View Adjustments

```sql
CREATE POLICY "Owners can view inventory adjustments"
  ON inventory_adjustments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM menu_items mi
      JOIN menus m ON m.id = mi.menu_id
      JOIN restaurants r ON r.id = m.restaurant_id
      WHERE mi.id = item_id 
        AND r.owner_id = auth.uid()
    )
  );
```

**Access:** Restaurant owners can view adjustments for their menu items.

### Policy 2: Create Adjustments

```sql
CREATE POLICY "Owners can create inventory adjustments"
  ON inventory_adjustments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM menu_items mi
      JOIN menus m ON m.id = mi.menu_id
      JOIN restaurants r ON r.id = m.restaurant_id
      WHERE mi.id = item_id 
        AND r.owner_id = auth.uid()
    )
  );
```

**Access:** Restaurant owners can create adjustments for their menu items.

---

## 📝 Validation (Zod)

### Create Inventory Adjustment Schema

```typescript
const createInventoryAdjustmentSchema = z.object({
  item_id: z.string().uuid('Invalid item ID'),
  type: z.enum(['IN', 'OUT', 'SPOILAGE']),
  quantity: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0'),
  reason: z.string().max(500).optional().nullable(),
});
```

**Validation Rules:**
- ✅ `item_id` must be valid UUID
- ✅ `type` must be IN, OUT, or SPOILAGE
- ✅ `quantity` must be positive integer
- ✅ `reason` max 500 characters (optional)

---

## 🎯 Features

### 1. Stock Overview

**Location:** `/dashboard/inventory` → Stock Overview tab

**Features:**
- View all items with finite stock
- See current stock levels
- Visual badges (In Stock, Low Stock, Out of Stock)
- Alert cards for low/out of stock items

**Stock Thresholds:**
- **In Stock:** > 5 units (green)
- **Low Stock:** 1-5 units (orange)
- **Out of Stock:** 0 units (red)

### 2. Add Adjustment

**Location:** Click "Add Adjustment" button

**Form Fields:**
1. **Menu Item** (dropdown)
   - Shows only items with `stock_mode = 'FINITE'`
   - Displays current stock next to item name
   
2. **Adjustment Type** (dropdown)
   - Stock In - Add inventory
   - Stock Out - Remove inventory
   - Spoilage - Discard inventory
   
3. **Quantity** (number input)
   - Must be positive integer
   - Required field
   
4. **Reason** (textarea)
   - Optional explanation
   - Max 500 characters

**Process:**
1. Select menu item
2. Choose adjustment type
3. Enter quantity
4. Add optional reason
5. Submit
6. Stock automatically recalculated

### 3. Adjustment History

**Location:** `/dashboard/inventory` → Adjustment History tab

**Features:**
- View all stock adjustments
- Filter by item
- Filter by type (IN/OUT/SPOILAGE)
- Sortable table with date, item, type, quantity, reason
- Visual indicators for each type

**Display:**
- Green `+` for IN adjustments
- Orange `-` for OUT adjustments
- Red `-` for SPOILAGE adjustments

---

## 🔄 Automatic Updates

### Trigger: Update Stock on Adjustment

When a new adjustment is created, the `stock_qty` field in `menu_items` is automatically updated.

```sql
CREATE TRIGGER update_stock_qty_after_adjustment
  AFTER INSERT ON inventory_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_qty_on_adjustment();
```

**Process:**
1. New adjustment inserted
2. Trigger fires
3. Calculates new stock using `get_current_stock()`
4. Updates `menu_items.stock_qty`
5. Only affects items with `stock_mode = 'FINITE'`

---

## 🎨 Components

### 1. InventoryAdjustmentForm

**Path:** `src/components/inventory/inventory-adjustment-form.tsx`

**Props:**
- `menuItems: MenuItemWithStock[]` - Items to choose from
- `defaultItemId?: string` - Pre-select an item (optional)

**Features:**
- Modal dialog
- Form validation with react-hook-form + Zod
- Real-time stock display
- Type descriptions
- Success/error toasts

### 2. StockOverview

**Path:** `src/components/inventory/stock-overview.tsx`

**Props:**
- `menuItems: MenuItemWithStock[]` - Items to display

**Features:**
- Statistics cards (total, low stock, out of stock)
- Alert banners for low/out of stock
- Item list with current stock
- Color-coded badges

### 3. InventoryTable

**Path:** `src/components/inventory/inventory-table.tsx`

**Props:**
- `adjustments: InventoryAdjustment[]` - Adjustments to display
- `menuItems: MenuItemWithStock[]` - For item name lookup

**Features:**
- Filterable table
- Filter by item
- Filter by type
- Date formatting
- Visual type indicators

---

## 📡 Server Actions

### 1. createInventoryAdjustment()

Creates a new stock adjustment.

```typescript
async function createInventoryAdjustment(
  data: CreateInventoryAdjustmentInput
): Promise<{ success: boolean; data?: InventoryAdjustment; error?: string }>
```

**Validation:**
- Authenticates user
- Validates input with Zod
- Verifies user owns the restaurant
- Creates adjustment record

### 2. getInventoryAdjustments()

Fetches adjustments with optional filters.

```typescript
async function getInventoryAdjustments(
  itemId?: string,
  type?: 'IN' | 'OUT' | 'SPOILAGE'
): Promise<InventoryAdjustment[]>
```

**Filters:**
- By item ID
- By adjustment type
- Ordered by date (newest first)

### 3. getMenuItemsWithStock()

Fetches items with calculated stock for a restaurant.

```typescript
async function getMenuItemsWithStock(
  restaurantId: string
): Promise<MenuItemWithStock[]>
```

**Returns:**
- All menu items for restaurant
- Includes `current_stock` field
- Only calculates for `stock_mode = 'FINITE'`

### 4. getCurrentStock()

Gets current stock for a specific item.

```typescript
async function getCurrentStock(
  itemId: string
): Promise<number | null>
```

**Uses:** Database function `get_current_stock()`

### 5. getInventorySummary()

Gets overview statistics for a restaurant.

```typescript
async function getInventorySummary(restaurantId: string): Promise<{
  totalItems: number;
  finiteStockItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: MenuItemWithStock[];
  outOfStockItems: MenuItemWithStock[];
} | null>
```

---

## 🧪 Testing Guide

### Test 1: Create Stock In Adjustment

1. Go to `/dashboard/inventory`
2. Select a restaurant
3. Click "Add Adjustment"
4. Select an item with finite stock
5. Choose "Stock In"
6. Enter quantity: 50
7. Reason: "New shipment received"
8. Submit
9. ✅ Verify stock increased in overview
10. ✅ Verify adjustment appears in history

### Test 2: Create Stock Out Adjustment

1. Click "Add Adjustment"
2. Select same item
3. Choose "Stock Out"
4. Enter quantity: 10
5. Reason: "Sold during lunch service"
6. Submit
7. ✅ Verify stock decreased by 10
8. ✅ Verify adjustment in history with orange indicator

### Test 3: Create Spoilage Adjustment

1. Click "Add Adjustment"
2. Select item
3. Choose "Spoilage"
4. Enter quantity: 5
5. Reason: "Expired ingredients"
6. Submit
7. ✅ Verify stock decreased by 5
8. ✅ Verify adjustment in history with red indicator

### Test 4: Low Stock Alert

1. Create adjustments to bring item to 3 units
2. ✅ Verify "Low Stock" badge appears (orange)
3. ✅ Verify warning alert at top
4. ✅ Verify count in statistics card

### Test 5: Out of Stock Alert

1. Create OUT adjustment for all remaining stock
2. ✅ Verify "Out of Stock" badge appears (red)
3. ✅ Verify alert banner appears
4. ✅ Verify count in statistics card

### Test 6: Filter Adjustments

1. Go to Adjustment History tab
2. Use item filter
3. ✅ Verify only that item's adjustments show
4. Use type filter
5. ✅ Verify only that type shows
6. Clear filters
7. ✅ Verify all adjustments return

### Test 7: Multiple Restaurants

1. Create adjustments for Restaurant A
2. Switch to Restaurant B
3. ✅ Verify only Restaurant B's data shows
4. ✅ Verify RLS prevents seeing A's data

---

## 🔐 Security

### Authentication

- All actions require authenticated user
- User must be restaurant owner
- RLS enforces ownership at database level

### Authorization Flow

```
User Request
    ↓
Check Authentication
    ↓
Validate Input (Zod)
    ↓
Verify Ownership (Database Join)
    ↓
RLS Policy Check
    ↓
Allow/Deny
```

### Validation Layers

1. **Client:** Zod schema validation
2. **Server:** Re-validate with Zod
3. **Database:** CHECK constraints
4. **RLS:** Ownership verification

---

## 📊 Stock Calculation Example

### Scenario

Menu Item: "Burger Patties"

**Adjustments:**
- 2025-01-10: IN +100 (New delivery)
- 2025-01-11: OUT -25 (Lunch service)
- 2025-01-11: OUT -30 (Dinner service)
- 2025-01-12: SPOILAGE -5 (Expired)
- 2025-01-13: IN +50 (New delivery)

**Calculation:**
```
Current Stock = (100 + 50) - (25 + 30) - (5)
             = 150 - 55 - 5
             = 90 units
```

**Display:**
- Stock Overview: 90 units (In Stock - Green)
- History: 5 adjustments listed
- Statistics: Included in total count

---

## 🎯 Best Practices

### When to Use Adjustment Types

**Stock IN:**
- New inventory deliveries
- Restocking from warehouse
- Manual corrections (count was higher)

**Stock OUT:**
- Items sold to customers
- Used in preparation
- Manual corrections (count was lower)

**SPOILAGE:**
- Expired ingredients
- Damaged items
- Quality control rejections
- Food safety discards

### Reason Field Guidelines

**Good Reasons:**
- ✅ "Weekly produce delivery"
- ✅ "Lunch service sales"
- ✅ "Expired on 2025-01-15"
- ✅ "Damaged during transport"

**Poor Reasons:**
- ❌ "stuff"
- ❌ Empty/blank
- ❌ Too vague

**Benefits:**
- Audit trail
- Pattern identification
- Loss prevention insights

### Stock Modes

**FINITE:**
- Use for: Perishables, limited items
- Tracks: Actual count
- Requires: Regular adjustments

**INFINITE:**
- Use for: Made-to-order, unlimited items
- Tracks: Nothing
- No adjustments needed

**HIDDEN_WHEN_OOS:**
- Use for: Specialty items, seasonal
- Tracks: Count
- Hides when zero

---

## 🔄 Migration

### Apply Migration

```bash
npx supabase db push
```

**Migration File:** `supabase/migrations/20251113_create_inventory_system.sql`

### What Gets Created

1. ✅ `inventory_adjustments` table
2. ✅ Indexes for performance
3. ✅ RLS policies
4. ✅ `get_current_stock()` function
5. ✅ `menu_items_with_stock` view
6. ✅ Automatic update trigger

### Rollback (if needed)

```sql
DROP TRIGGER IF EXISTS update_stock_qty_after_adjustment ON inventory_adjustments;
DROP VIEW IF EXISTS menu_items_with_stock;
DROP FUNCTION IF EXISTS get_current_stock;
DROP FUNCTION IF EXISTS update_stock_qty_on_adjustment;
DROP TABLE IF EXISTS inventory_adjustments;
```

---

## 📱 Page Structure

### Route: `/dashboard/inventory`

```
InventoryPage (Server Component)
  └─ InventoryPageClient (Client Component)
      ├─ Restaurant Selector
      ├─ Add Adjustment Button
      └─ Tabs
          ├─ Stock Overview Tab
          │   └─ StockOverview Component
          │       ├─ Statistics Cards
          │       ├─ Alert Banners
          │       └─ Items List
          └─ Adjustment History Tab
              └─ InventoryTable Component
                  ├─ Filters
                  └─ Adjustments Table
```

---

## 🎨 UI Components Used

From `@/components/ui`:
- Card, CardContent, CardHeader, CardTitle, CardDescription
- Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
- Form, FormControl, FormDescription, FormField, FormItem, FormLabel
- Input, Textarea
- Button
- Badge
- Alert, AlertDescription
- Table, TableBody, TableCell, TableHead, TableHeader, TableRow
- Tabs, TabsContent, TabsList, TabsTrigger

Icons from `lucide-react`:
- Package, TrendingDown, XCircle, AlertTriangle
- ArrowUpIcon, ArrowDownIcon, XCircleIcon
- Loader2

---

## 🚀 Future Enhancements

### Potential Features

1. **Bulk Adjustments**
   - Import CSV of adjustments
   - Adjust multiple items at once

2. **Alerts & Notifications**
   - Email when stock is low
   - Daily inventory report
   - Threshold customization

3. **Analytics Dashboard**
   - Stock turnover rate
   - Spoilage trends
   - Usage patterns

4. **Barcode Scanning**
   - Scan items for quick adjustment
   - Mobile app integration

5. **Supplier Integration**
   - Auto-create IN adjustments from orders
   - Purchase order tracking

6. **Inventory Forecasting**
   - Predict stock needs
   - Suggest reorder quantities

---

## 📚 Related Documentation

- [MENU_SYSTEM_IMPLEMENTATION.md](./MENU_SYSTEM_IMPLEMENTATION.md) - Menu system details
- [RESTAURANT_MANAGEMENT_IMPLEMENTATION.md](./RESTAURANT_MANAGEMENT_IMPLEMENTATION.md) - Restaurant setup
- [NEXTJS_15_PARAMS_FIX.md](./NEXTJS_15_PARAMS_FIX.md) - Async params handling
- [IMAGE_DOMAIN_FIX.md](./IMAGE_DOMAIN_FIX.md) - Image configuration

---

## 💡 Tips

### For Restaurant Owners

- Set up items with finite stock first
- Do initial stock count (IN adjustment)
- Record adjustments daily
- Review history weekly
- Monitor low stock alerts

### For Developers

- RLS is enforced at database level
- Always validate on server
- Use view for calculated stock
- Leverage automatic trigger
- Test ownership permissions

---

**Status:** ✅ Complete  
**Version:** 1.0  
**Last Updated:** 2025-11-13

Your inventory management system is ready to use! 📦✨
