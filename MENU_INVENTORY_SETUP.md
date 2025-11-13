# WEGO RestoPay - Menu & Inventory System Setup Guide

## Overview
Complete menu management and inventory tracking system for restaurant owners with role-based access control.

## What's Been Implemented

### 1. Database Schema
- **menus table**: Restaurant menus with active/inactive status
- **menu_items table**: Menu items with pricing (in cents), stock modes, and images
- **inventory_adjustments table**: Stock movements (IN/OUT/SPOILAGE)
- **Row Level Security (RLS)**: Only restaurant owners can manage their own data
- **Storage bucket**: `menu-images` for uploading item photos

### 2. Pages Created
- `/dashboard/menus` - List and manage all menus for your restaurants
- `/dashboard/menus/[id]/items` - Manage menu items for a specific menu
- `/dashboard/inventory` - Track stock levels and adjustments

### 3. Components Created
- **OwnerNavbar** - Navigation bar for restaurant owners
- **MenuForm** - Create/edit menus
- **MenuItemForm** - Create/edit menu items with image upload
- **MenuCard** - Display menu cards
- **ItemTable** - Display menu items in a table
- **AdjustmentForm** - Record inventory adjustments
- **HistoryTable** - View adjustment history
- **StockOverview** - View current stock levels

### 4. Features
✅ CRUD operations for menus and menu items
✅ Image upload to Supabase Storage
✅ Price stored in cents for accuracy
✅ Stock modes: FINITE, INFINITE, HIDDEN_WHEN_OOS
✅ Inventory tracking with automatic calculations
✅ Active/inactive toggles
✅ Role-based access (Owner/Client)
✅ Responsive design with mobile menu
✅ Toast notifications
✅ Form validation with Zod

## Database Migration Issue & Fix

### Problem
Old migration files have trigger conflicts preventing `supabase db push`.

### Solution
Run the SQL directly in Supabase Dashboard:

1. **Go to your Supabase project dashboard**
2. **Navigate to SQL Editor**
3. **Run the migration file**: `20251114_final_system_setup.sql`

This will create:
- All tables (menus, menu_items, inventory_adjustments)
- All indexes for performance
- All RLS policies for security
- Storage bucket and policies for images
- Helper view for stock calculations

## How to Use the System

### For Restaurant Owners

#### 1. Sign Up / Sign In
- Go to `/sign-up` and select **"Restaurant Owner"**
- After signing in, you'll be redirected to `/dashboard/restaurants`

#### 2. Create a Restaurant
```
1. Click "Create Restaurant"
2. Fill in restaurant details (name, country, currency)
3. Submit
```

#### 3. Create a Menu
```
1. Go to Menus tab in navbar
2. Click "Add Menu"
3. Enter menu name
4. Toggle "Active" status
5. Submit
```

#### 4. Add Menu Items
```
1. Click on a menu card
2. Click "Add Item"
3. Fill in item details:
   - Name, Description
   - Price (in cents, e.g., 1500 for $15.00)
   - Currency (USD, EUR, etc.)
   - Tax rate (percentage)
   - Stock mode:
     * FINITE - Track stock quantity
     * INFINITE - Always available
     * HIDDEN_WHEN_OOS - Hide when out of stock
   - Upload image (optional)
4. Submit
```

#### 5. Manage Inventory
```
1. Go to Inventory tab
2. View current stock levels
3. Click "Adjust" on an item or "Add Adjustment"
4. Select:
   - Item
   - Type (Stock In / Stock Out / Spoilage)
   - Quantity
   - Reason (optional)
5. Submit
```

### For Clients
- Sign up as "Client"
- Browse restaurants at `/restaurants`
- View menus and items (public access to active items)

## File Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Dashboard layout with navbar
│   │   └── dashboard/
│   │       ├── menus/
│   │       │   ├── page.tsx              # Menus list page
│   │       │   └── [id]/items/
│   │       │       ├── page.tsx          # Menu items page wrapper
│   │       │       └── items-client.tsx  # Menu items client component
│   │       └── inventory/
│   │           └── page.tsx              # Inventory management page
│   └── sign-up/
│       ├── page.tsx                      # Sign up with role selection
│       └── actions.ts                    # Sign up action (redirects based on role)
├── components/
│   ├── dashboard/
│   │   └── owner-navbar.tsx              # Owner navigation bar
│   ├── menus/
│   │   ├── menu-form.tsx                 # Menu create/edit form
│   │   ├── menu-item-form.tsx            # Menu item create/edit form with image upload
│   │   ├── menu-card.tsx                 # Menu display card
│   │   └── item-table.tsx                # Menu items table
│   └── inventory/
│       ├── adjustment-form.tsx           # Inventory adjustment form
│       ├── history-table.tsx             # Adjustment history table
│       └── stock-overview.tsx            # Current stock overview table
├── lib/
│   ├── actions/
│   │   ├── menu-actions.ts               # Menu CRUD server actions
│   │   ├── inventory.ts                  # Inventory tracking actions
│   │   └── restaurant-management.ts      # Restaurant actions
│   └── validation/
│       ├── menu.ts                       # Menu/item validation schemas
│       └── inventory.ts                  # Inventory validation schemas
└── types/
    └── index.ts                          # TypeScript types

supabase/
└── migrations/
    └── 20251114_final_system_setup.sql   # Complete system migration
```

## API / Server Actions

### Menu Actions (`menu-actions.ts`)
- `createMenu(input)` - Create new menu
- `updateMenu(input)` - Update existing menu
- `deleteMenu(menuId)` - Delete menu
- `toggleMenuActive(menuId, isActive)` - Toggle menu status
- `getMenusByRestaurant(restaurantId)` - Get all menus for a restaurant
- `getMenuById(menuId)` - Get single menu
- `createMenuItem(input)` - Create menu item
- `updateMenuItem(input)` - Update menu item
- `deleteMenuItem(itemId)` - Delete menu item
- `getMenuItemsByMenu(menuId)` - Get all items for a menu

### Inventory Actions (`inventory.ts`)
- `createInventoryAdjustment(data)` - Record stock adjustment
- `getInventoryAdjustments(itemId?, type?)` - Get adjustments with filters
- `getMenuItemsWithStock(restaurantId)` - Get items with calculated stock
- `getCurrentStock(itemId)` - Get current stock for an item
- `getInventorySummary(restaurantId)` - Get inventory summary stats

## Data Models

### Menu
```typescript
{
  id: UUID
  restaurant_id: UUID
  name: string
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### MenuItem
```typescript
{
  id: UUID
  menu_id: UUID
  name: string
  description: string | null
  price_cts: number           // Price in cents
  currency: string            // 'USD', 'EUR', etc.
  tax_rate: number | null     // Percentage
  stock_mode: 'FINITE' | 'INFINITE' | 'HIDDEN_WHEN_OOS'
  stock_qty: number | null
  image_url: string | null
  active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### InventoryAdjustment
```typescript
{
  id: UUID
  item_id: UUID
  type: 'IN' | 'OUT' | 'SPOILAGE'
  quantity: number            // Must be positive
  reason: string | null
  created_by: UUID | null
  created_at: timestamp
}
```

## Security (RLS Policies)

### Menus
- Owners can view/create/update/delete their restaurant's menus
- Public can view active menus

### Menu Items
- Owners can view/create/update/delete their menu items
- Public can view active items from active menus

### Inventory Adjustments
- Owners can view/create adjustments for their items
- No public access

### Storage (menu-images)
- Owners can upload/delete images
- Public can view images

## Next Steps

1. **Run the migration SQL** in Supabase Dashboard
2. **Test the system:**
   - Sign up as an owner
   - Create a restaurant
   - Create a menu
   - Add menu items with images
   - Track inventory for FINITE items
3. **Sign up as a client** to test public access
4. **Configure environment:**
   - Make sure `.env.local` has correct Supabase URL and keys
   - Verify image domain in `next.config.ts` (already configured)

## Troubleshooting

### Images not loading
- Check `next.config.ts` has your Supabase domain
- Verify storage bucket `menu-images` is public
- Check RLS policies on `storage.objects`

### Can't create menus/items
- Verify you're signed in as an owner
- Check you have a restaurant created
- Inspect browser console for errors
- Verify RLS policies are applied

### Stock not calculating
- Verify `menu_item_stock` view exists
- Check inventory adjustments are being created
- Ensure item has stock_mode = 'FINITE'

### Migration errors
- Old migrations have conflicts
- Run `20251114_final_system_setup.sql` directly in SQL Editor
- Don't use `supabase db push` until old migrations are cleaned up

## Future Enhancements

- [ ] Bulk import menu items from CSV
- [ ] Menu item categories/tags
- [ ] Variant support (sizes, options)
- [ ] Automated low-stock alerts
- [ ] Inventory reports and analytics
- [ ] Multi-restaurant view for chains
- [ ] Menu scheduling (breakfast/lunch/dinner)
- [ ] Duplicate menu functionality

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify database tables and policies in Supabase
3. Test RLS policies with SQL Editor
4. Check server action logs in terminal

---

**Built with:** Next.js 15, Supabase, TypeScript, Tailwind CSS, shadcn/ui, Zod
