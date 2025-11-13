# WEGO RestoPay - Menu & Inventory System

## ✅ Complete Implementation

### Database Schema

#### Tables Created
1. **menus**
   - id (UUID, PK)
   - restaurant_id (FK to restaurants)
   - name (TEXT)
   - is_active (BOOLEAN)
   - created_at, updated_at (TIMESTAMPTZ)

2. **menu_items**
   - id (UUID, PK)
   - menu_id (FK to menus)
   - name, description (TEXT)
   - price_cts (INTEGER) - Price in cents
   - currency (TEXT, default 'USD')
   - tax_rate (NUMERIC 5,2)
   - stock_mode ('FINITE' | 'INFINITE' | 'HIDDEN_WHEN_OOS')
   - stock_qty (INTEGER)
   - image_url (TEXT)
   - active (BOOLEAN)
   - created_at, updated_at (TIMESTAMPTZ)

3. **inventory_adjustments**
   - id (UUID, PK)
   - item_id (FK to menu_items)
   - type ('IN' | 'OUT' | 'SPOILAGE')
   - quantity (INTEGER, positive)
   - reason (TEXT, nullable)
   - created_at (TIMESTAMPTZ)
   - created_by (FK to auth.users)

#### Storage
- **menu-images** bucket (public)
  - Stores menu item images
  - Path: `{menu_id}/{item_id}-{timestamp}.{ext}`

#### Views
- **menu_items_with_stock**
  - Combines menu_items with calculated current_stock
  - Includes restaurant_id for easy filtering
  - Calculates stock: SUM(IN) - SUM(OUT) - SUM(SPOILAGE)

#### Functions
- **get_current_stock(item_id)**
  - Returns current stock count for a menu item
  - Only for FINITE stock mode items

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Restaurant owners can only access their own data
- Access verified through restaurant ownership chain:
  - menus → restaurants → owner_id
  - menu_items → menus → restaurants → owner_id
  - inventory_adjustments → menu_items → menus → restaurants → owner_id

### Pages Implemented

#### 1. `/dashboard/menus` - Menu Management
**Features:**
- List all menus for user's restaurants
- Filter by restaurant
- Toggle menu active/inactive
- Create new menu
- Edit existing menu
- Delete menu (with confirmation)
- View item count per menu
- Navigate to menu items

**Components Used:**
- `MenuForm` - Create/edit menu dialog
- `MenuCard` - Display menu with actions

#### 2. `/dashboard/menus/[id]/items` - Menu Items Management
**Features:**
- List all items in a menu
- Create new menu item
- Edit existing item
- Delete item (with confirmation)
- Upload menu item images
- Toggle item active/inactive
- View item details (price, stock mode, tax rate)
- Breadcrumb navigation back to menus

**Components Used:**
- `MenuItemForm` - Create/edit menu item dialog with image upload
- `ItemTable` - Display items in a responsive table

#### 3. `/dashboard/inventory` - Inventory Management
**Features:**
- Filter by restaurant
- Filter by menu
- Filter by menu item
- Add inventory adjustments (IN/OUT/SPOILAGE)
- View adjustment history
- View current stock for FINITE items
- Stock summary cards:
  - Total items
  - Low stock alerts (≤ 5)
  - Out of stock alerts
  - Recent adjustments

**Components Used:**
- Stock adjustment form
- Adjustment history table with filters
- Summary statistics cards

### Server Actions (API)

#### Menu Actions (`/lib/actions/menu-actions.ts`)
- `createMenu(input)` - Create new menu
- `updateMenu(input)` - Update menu
- `deleteMenu(menuId)` - Delete menu
- `toggleMenuActive(menuId, isActive)` - Toggle menu status
- `getMenusByRestaurant(restaurantId)` - List menus with item counts
- `getMenuById(menuId)` - Get single menu

#### Menu Item Actions
- `createMenuItem(input)` - Create new item
- `updateMenuItem(input)` - Update item
- `deleteMenuItem(itemId)` - Delete item
- `toggleMenuItemActive(itemId, active)` - Toggle item status
- `getMenuItemsByMenu(menuId)` - List items in menu
- `uploadMenuItemImage(menuId, itemId, file)` - Upload image
- `deleteMenuItemImage(imageUrl)` - Delete image

#### Inventory Actions (`/lib/actions/inventory.ts`)
- `createInventoryAdjustment(data)` - Add adjustment
- `getInventoryAdjustments(itemId?, type?)` - List adjustments
- `getMenuItemsWithStock(restaurantId)` - Items with current stock
- `getCurrentStock(itemId)` - Get stock for one item
- `getInventorySummary(restaurantId)` - Dashboard summary

#### Restaurant Actions (`/lib/actions/restaurant-management.ts`)
- Added `getUserRestaurants()` - Get all restaurants owned by user

### Validation (Zod Schemas)

#### Menu Validation (`/lib/validation/menu.ts`)
- `createMenuSchema` - restaurant_id, name, is_active
- `updateMenuSchema` - id + above fields
- `createMenuItemSchema` - menu_id, name, description, price_cts (≥0), currency, tax_rate, stock_mode, stock_qty, image_url, active
- `updateMenuItemSchema` - id + above fields

#### Inventory Validation (`/lib/validation/inventory.ts`)
- `createInventoryAdjustmentSchema` - item_id, type, quantity (>0), reason

### Components

#### Menu Components (`/components/menus/`)
1. **MenuForm**
   - Dialog-based form
   - Restaurant selector
   - Name input
   - Active toggle
   - Create/Update modes

2. **MenuCard**
   - Displays menu name
   - Shows item count
   - Active/inactive badge
   - Actions: Edit, Delete, View Items, Toggle Active

3. **MenuItemForm**
   - Dialog-based form
   - Name, description, price (in cents)
   - Currency, tax rate
   - Stock mode selector
   - Stock quantity (for FINITE mode)
   - Image upload with preview
   - Active toggle
   - Validation with error messages

4. **ItemTable**
   - Responsive table
   - Columns: Image, Name, Price, Stock Mode, Stock Qty, Status
   - Actions: Edit, Delete, Toggle Active
   - Loading states
   - Empty state

#### Dashboard Components
1. **OwnerNavbar** (`/components/dashboard/owner-navbar.tsx`)
   - Navigation links:
     - Restaurants
     - Locations
     - Menus ← NEW
     - Inventory ← NEW
   - User profile link
   - Sign out button
   - Mobile responsive menu

### UI Features

#### Toast Notifications
- Success messages for all CRUD operations
- Error messages with detailed information
- Loading states during async operations

#### Form Validation
- Real-time validation
- Error messages below fields
- Disabled submit when invalid
- Loading states on submit

#### Responsive Design
- Mobile-friendly navigation
- Responsive tables
- Card layouts for mobile
- Touch-friendly buttons

#### Image Handling
- Client-side image upload
- Image preview before upload
- Automatic resize/optimization via Next.js Image
- Secure storage in Supabase
- Next.js Image component configured for Supabase domain

### TypeScript Types

All types defined in `/types/index.ts`:
- `Menu`
- `MenuItem`
- `MenuWithItemCount`
- `InventoryAdjustment`
- `MenuItemWithStock`
- `Restaurant`
- `Location`
- `Table`
- `Profile`

### Environment Configuration

#### Next.js Config (`next.config.ts`)
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'jkgbhwdgxulhsbjduztn.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

### Migrations Applied

Migration: `20251113231103_complete_menu_inventory_final.sql`
- Created all tables with constraints
- Added indexes for performance
- Set up RLS policies
- Created storage bucket and policies
- Added helper view and function
- Granted necessary permissions

## 🚀 How to Use

### For Restaurant Owners

1. **Sign Up/Sign In**
   - Create an account with role "owner"
   - Automatic profile creation with trigger

2. **Create a Restaurant**
   - Navigate to `/dashboard/restaurants`
   - Add restaurant details

3. **Create Menus**
   - Navigate to `/dashboard/menus`
   - Click "Create Menu"
   - Select restaurant, enter name
   - Toggle active status

4. **Add Menu Items**
   - Click "View Items" on a menu card
   - Click "Add Item"
   - Fill in details:
     - Name, description
     - Price (in cents, e.g., 1500 for $15.00)
     - Currency
     - Tax rate (percentage)
     - Stock mode (INFINITE/FINITE/HIDDEN_WHEN_OOS)
     - Stock quantity (if FINITE)
     - Upload image
   - Click "Create"

5. **Manage Inventory**
   - Navigate to `/dashboard/inventory`
   - Select restaurant, menu, and item
   - Add adjustments:
     - Type: IN (receiving stock), OUT (sold), SPOILAGE (wasted)
     - Quantity
     - Reason (optional notes)
   - View adjustment history
   - Monitor low stock alerts

### Stock Modes Explained

- **INFINITE**: Always available, no stock tracking
- **FINITE**: Track stock quantity, updates with adjustments
- **HIDDEN_WHEN_OOS**: Hide item when stock = 0 (future feature)

### Price Handling

All prices stored in **cents** to avoid floating-point issues:
- $15.00 = 1500 cents
- $9.99 = 999 cents
- Display: `(price_cts / 100).toFixed(2)`

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - All data access filtered by ownership
   - Automatic in database layer
   - Cannot bypass with direct queries

2. **Server Actions**
   - All mutations through server actions
   - Authentication checked server-side
   - Input validation with Zod

3. **Image Upload**
   - Authenticated uploads only
   - Public read access
   - Scoped to restaurant owner's data

4. **Type Safety**
   - Full TypeScript coverage
   - Validated inputs/outputs
   - Compile-time error checking

## 📊 Database Performance

- Indexed foreign keys for fast joins
- Indexed active/status columns for filters
- Indexed created_at for sorting
- View for complex stock calculations
- Function for reusable stock logic

## ✅ All Issues Fixed

1. ✅ Async params in Next.js 15 - Fixed with `await params`
2. ✅ Image domain configuration - Added to next.config.ts
3. ✅ getUserRestaurants export - Added to restaurant-management.ts
4. ✅ Migration conflicts - Moved old migrations to _backup
5. ✅ Database triggers - Used DROP TRIGGER IF EXISTS
6. ✅ RLS policies - Created comprehensive policies
7. ✅ Storage bucket - Created with proper policies
8. ✅ Navigation - Owner navbar includes all sections

## 🎯 Ready for Production

All features are:
- ✅ Fully implemented
- ✅ Type-safe
- ✅ Validated
- ✅ Secure with RLS
- ✅ Responsive
- ✅ Error-handled
- ✅ Toast notifications
- ✅ Loading states

## 📝 Next Steps (Optional Enhancements)

1. **Public Menu Display**
   - Create public pages for customers
   - QR code integration with tables
   - Filter by active menus/items only

2. **Menu Categories**
   - Add category field to menu_items
   - Group items in display
   - Category-based filtering

3. **Inventory Reports**
   - Export adjustment history
   - Stock level reports
   - Waste/spoilage analytics

4. **Multi-location Menus**
   - Assign menus to specific locations
   - Location-specific pricing
   - Stock per location

5. **Menu Scheduling**
   - Breakfast/lunch/dinner menus
   - Time-based activation
   - Seasonal items

6. **Bulk Operations**
   - Import menus from CSV
   - Bulk price updates
   - Batch stock adjustments

## 🎉 Summary

The WEGO RestoPay MVP now includes a complete, production-ready menu and inventory management system. Restaurant owners can:

- Manage multiple menus per restaurant
- Add/edit menu items with images
- Track inventory with adjustable stock levels
- Monitor stock alerts and history
- Toggle item/menu availability
- Access everything through a clean, responsive UI

All features are secured with Row Level Security, validated with Zod schemas, and built with TypeScript for type safety.
