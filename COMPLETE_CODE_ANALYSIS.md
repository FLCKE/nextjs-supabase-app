# WEGO RestoPay - Complete Code Analysis

## Executive Summary

**WEGO RestoPay** (marketed as **Foodie**) is a modern, multi-tenant restaurant management platform built with **Next.js 16**, **React 19**, **TypeScript**, and **Supabase**. The application provides comprehensive tools for restaurant owners to manage menus, inventory, orders, and staff, while offering customers a seamless ordering experience.

---

## 1. Technology Stack

### Core Framework
- **Next.js 16.0.1** - React meta-framework with App Router
- **React 19.2.0** - Latest React with compiler optimization support
- **TypeScript 5.9.3** - Type-safe development
- **Node.js** - Backend runtime (implied)

### Database & Authentication
- **Supabase** - PostgreSQL database + Auth
  - `@supabase/ssr` (v0.7.0) - Server-side rendering integration
  - **Row-Level Security (RLS)** - Data isolation between tenants
  - **Supabase Auth** - User authentication with magic links and password auth
  - **Supabase Storage** - File uploads (images, etc.)

### State Management & Data Fetching
- **TanStack React Query v5.90.7** - Server state management, caching
- **Zustand v5.0.8** - Client-side state (optional, light-weight)
- **React Hook Form v7.66.0** - Form state management
- **Zod v4.1.12** - Schema validation

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS
- **Radix UI** - Headless component primitives
  - Dialog, Dropdown, Popover, Select, Tabs, Label, Switch
- **Lucide React v0.552.0** - Icon library
- **Framer Motion v12.23.24** - Animation library
- **Sonner v2.0.7** - Toast notifications
- **CVA (class-variance-authority) v0.7.1** - Component variant styling
- **clsx v2.1.1** - Conditional classNames

### Utilities
- **bcrypt v6.0.0** - Password hashing
- **qrcode v1.5.4** - QR code generation (for table management)
- **date-fns v4.1.0** - Date formatting
- **next-themes v0.4.6** - Dark mode support
- **vaul v1.1.2** - Drawer component
- **tailwind-merge v3.3.1** - Merge Tailwind classes

### Development Tools
- **ESLint 9** - Code quality
- **babel-plugin-react-compiler** - React optimization
- **Tailwind CSS PostCSS Plugin** - CSS processing
- **Supabase CLI v2.54.11** - Database migrations

---

## 2. Project Architecture

### Directory Structure

```
nextjs-supabase-app/
├── src/
│   ├── app/                          # Next.js App Router routes
│   │   ├── (dashboard)/              # Protected routes - Restaurant owners
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # Main dashboard
│   │   │   │   ├── menus/            # Menu management
│   │   │   │   ├── inventory/        # Stock management
│   │   │   │   ├── orders/           # Order tracking
│   │   │   │   ├── pos/              # Point of Sale
│   │   │   │   ├── profile/          # User profile
│   │   │   │   ├── restaurants/      # Multi-restaurant management
│   │   │   │   ├── staff/            # Staff management
│   │   │   │   └── tables/           # Table management
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── (public)/                 # Public-facing routes
│   │   │   ├── public/menu/          # Public menu browsing
│   │   │   ├── public/checkout/      # Checkout page
│   │   │   └── layout.tsx
│   │   ├── (staff)/                  # Staff-specific routes
│   │   │   ├── pos/                  # Staff POS interface
│   │   │   ├── orders/               # Staff order management
│   │   │   └── layout.tsx
│   │   ├── sign-in/                  # Authentication
│   │   ├── sign-up/
│   │   ├── restaurants/              # Public restaurant discovery
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page (Foodie homepage)
│   │   └── middleware.ts             # Request processing
│   ├── components/
│   │   ├── ui/                       # Radix UI + Tailwind components
│   │   │   ├── button, input, dialog, form, table, etc.
│   │   │   └── geometric-background  # Animated background
│   │   ├── layout/                   # Layout components
│   │   │   ├── dashboard-layout.tsx  # Main dashboard wrapper
│   │   │   ├── app-sidebar.tsx       # Navigation sidebar
│   │   │   ├── restaurant-switcher.tsx # Multi-tenant selector
│   │   │   └── dashboard-shell.tsx
│   │   ├── providers/                # Context providers
│   │   │   ├── app-providers.tsx     # Root provider
│   │   │   ├── query-provider.tsx    # TanStack Query
│   │   │   ├── supabase-provider.tsx # Supabase client
│   │   │   ├── user-provider.tsx     # User context
│   │   │   └── theme-provider.tsx    # Dark mode
│   │   ├── menus/                    # Menu management components
│   │   │   ├── menu-form.tsx
│   │   │   ├── menu-item-form.tsx
│   │   │   ├── menu-card.tsx
│   │   │   └── item-table.tsx
│   │   ├── orders/                   # Order management
│   │   │   ├── orders-table.tsx
│   │   │   └── order-detail.tsx
│   │   ├── inventory/                # Stock management
│   │   │   ├── inventory-table.tsx
│   │   │   ├── inventory-adjustment-form.tsx
│   │   │   ├── stock-overview.tsx
│   │   │   └── history-table.tsx
│   │   ├── public/                   # Public-facing components
│   │   │   ├── menu-item-card.tsx
│   │   │   ├── cart-summary-bar.tsx
│   │   │   └── menu-skeleton.tsx
│   │   ├── restaurants/              # Restaurant components
│   │   │   ├── restaurants-table.tsx
│   │   │   ├── restaurant-dialog.tsx
│   │   │   ├── qr-code-display.tsx
│   │   │   ├── tables-tab.tsx
│   │   │   └── locations-tab.tsx
│   │   └── dashboard/
│   │       └── owner-navbar.tsx
│   ├── hooks/                        # Custom React hooks
│   │   ├── useUser.ts                # Current user + profile
│   │   ├── useRole.ts                # Role-based checks
│   │   └── use-orders-realtime.ts    # Real-time order updates
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   └── middleware.ts         # Auth session middleware
│   │   ├── actions/                  # Server actions
│   │   │   ├── menu-actions.ts       # Create/update/delete menus
│   │   │   ├── order-actions.ts      # Order management
│   │   │   ├── inventory.ts          # Stock adjustments
│   │   │   ├── pos-actions.ts        # POS operations
│   │   │   ├── staff-actions.ts      # Staff management
│   │   │   ├── restaurant-management.ts
│   │   │   ├── public-menu-actions.ts
│   │   │   └── staff-restaurant.ts
│   │   ├── validation/               # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── menu.ts
│   │   │   ├── inventory.ts
│   │   │   ├── restaurant.ts
│   │   │   ├── profile.ts
│   │   │   ├── pos.ts
│   │   │   └── order.ts
│   │   ├── cart/
│   │   │   └── cart-store.ts         # Zustand cart state
│   │   ├── utils.ts                  # Utility functions
│   │   ├── data.ts                   # Data fetching utilities
│   │   └── restaurant-actions.ts
│   ├── types/                        # TypeScript types
│   │   └── index.ts
│   └── app.css, globals.css          # Global styles
├── supabase/
│   ├── migrations/                   # Database migrations
│   │   ├── 20251105_add_profiles_table.sql
│   │   ├── 20251106_*_create_restaurant_system.sql
│   │   ├── 20251113_*_menu_inventory_system.sql
│   │   └── ... (more migrations)
│   └── config.toml                   # Supabase config
├── public/                           # Static assets
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
└── README.md
```

---

## 3. Core Features & Modules

### 3.1 Authentication & Authorization

**Location**: `src/app/sign-in/`, `src/app/sign-up/`

**Components**:
- `sign-in/page.tsx` - Email/password + magic link authentication
- `sign-up/page.tsx` - Registration with role selection (owner/client)
- `sign-in/actions.ts` - Server action for authentication
- `sign-up/actions.ts` - Registration server action

**Key Features**:
- Two-factor authentication via magic links
- Role-based signup (restaurant owner vs. client)
- Password hashing with bcrypt
- Supabase Auth integration

**User Roles**:
1. **owner** - Restaurant owner, full dashboard access
2. **client** - Food ordering customer
3. **staff** - Restaurant staff (POS, order management)
4. **admin** - System administrator (optional)

### 3.2 Multi-Tenant Architecture

**Key Concept**: Multiple restaurants per owner, data isolation via RLS

**Tables**:
- `restaurants` - Restaurant metadata (name, currency, address)
- `locations` - Physical locations per restaurant
- `profiles` - User profiles with `restaurant_id` (foreign key)

**Components**:
- `RestaurantSwitcher` - Switch between owned restaurants
- Dashboard layout adapts to selected restaurant

**RLS Policies**:
- Owners can only see their restaurants
- Staff can only see assigned restaurant
- Clients see all public restaurants

### 3.3 Menu Management

**Location**: `src/app/(dashboard)/dashboard/menus/`

**Entities**:
- `menus` - Menu categories
- `menu_items` - Individual dishes with pricing, descriptions, images
- `menu_item_variants` - Item options (size, toppings, etc.)

**Server Actions** (`menu-actions.ts`):
- `createMenu()` - Create new menu category
- `updateMenu()` - Edit menu
- `deleteMenu()` - Remove menu
- `createMenuItem()` - Add dish to menu
- `updateMenuItem()` - Edit dish
- `deleteMenuItem()` - Remove dish

**Components**:
- `MenusPageClient` - Listing and management UI
- `MenuCard` - Individual menu display
- `MenuForm` - Create/edit menu
- `MenuItemForm` - Create/edit menu items
- `ItemTable` - Items within menu

**Data Structure**:
```typescript
Menu {
  id: UUID
  restaurant_id: UUID
  name: string
  description?: string
  position: number
  created_at: timestamp
}

MenuItem {
  id: UUID
  menu_id: UUID
  name: string
  description?: string
  price_cts: number
  image_url?: string
  vegetarian: boolean
  vegan: boolean
  spicy_level?: number
  available: boolean
  created_at: timestamp
}
```

### 3.4 Inventory Management

**Location**: `src/app/(dashboard)/dashboard/inventory/`

**Entities**:
- `inventory` - Stock levels per menu item
- `inventory_adjustments` - History of stock changes

**Server Actions** (`inventory.ts`):
- `adjustInventory()` - Add/remove stock
- `getInventoryHistory()` - View adjustment logs

**Components**:
- `InventoryTable` - Current stock levels
- `InventoryAdjustmentForm` - Stock adjustment UI
- `StockOverview` - Visual summary
- `HistoryTable` - Adjustment history

### 3.5 Order Management

**Location**: `src/app/(dashboard)/dashboard/orders/`

**Entities**:
```typescript
Order {
  id: UUID
  restaurant_id: UUID
  location_id: UUID
  table_id: UUID
  customer_id?: UUID
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_net_cts: number
  taxes_cts: number
  total_with_taxes_cts: number
  currency: string
  notes?: string
  created_at: timestamp
  updated_at: timestamp
}

OrderItem {
  id: UUID
  order_id: UUID
  menu_item_id: UUID
  name: string
  quantity: number
  unit_price_cts: number
  total_price_cts: number
  created_at: timestamp
}
```

**Server Actions** (`order-actions.ts`):
- `createOrder()` - Create new order (POS)
- `updateOrderStatus()` - Change order status
- `cancelOrder()` - Cancel order
- `getOrders()` - Fetch orders with pagination

**Components**:
- `OrdersTable` - Order listing
- `OrderDetail` - Order details and items

### 3.6 POS (Point of Sale) System

**Location**: 
- Owner dashboard: `src/app/(dashboard)/dashboard/pos/`
- Staff interface: `src/app/(staff)/pos/`

**Features**:
- Quick order creation
- Table selection
- Menu item selection with quantities
- Order summary
- Real-time price calculation

**Components**:
- `pos-client.tsx` - Main POS interface
- `pos-new-client.tsx` - Alternative implementation
- `order-board.tsx` - Kitchen display
- `order-items.tsx` - Item listing
- `pos-panel.tsx` - Control panel

**Validation** (`pos.ts`):
- Order items validation
- Table availability check
- Price calculations

### 3.7 Restaurant Management

**Location**: `src/app/(dashboard)/dashboard/restaurants/`

**Features**:
- Create/edit restaurants
- Manage locations
- Manage tables
- Generate QR codes for table ordering

**Components**:
- `RestaurantsTable` - Restaurant listing
- `RestaurantDialog` - Create/edit form
- `LocationsTab` - Location management
- `TablesTab` - Table management
- `QRCodeDisplay` - QR code generation

**Entities**:
```typescript
Restaurant {
  id: UUID
  owner_id: UUID
  name: string
  description?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  currency: string
  website?: string
  image_url?: string
  created_at: timestamp
}

Location {
  id: UUID
  restaurant_id: UUID
  name: string
  address?: string
  city?: string
  capacity: number
  created_at: timestamp
}

RestaurantTable {
  id: UUID
  location_id: UUID
  table_number: number
  capacity: number
  status: 'available' | 'occupied'
  qr_code?: string
  created_at: timestamp
}
```

### 3.8 Staff Management

**Location**: `src/app/(dashboard)/dashboard/staff/`

**Features**:
- Add/remove staff members
- Assign staff to restaurants
- Generate magic links for staff login
- View staff activity

**Server Actions** (`staff-actions.ts`, `staff-restaurant.ts`):
- `addStaffMember()` - Create staff account
- `removeStaffMember()` - Deactivate staff
- `sendMagicLink()` - Staff login link

### 3.9 Public Ordering (Customer-Facing)

**Location**: `src/app/restaurants/`, `src/app/(public)/public/menu/`

**Features**:
- Browse restaurants
- View public menus
- Add items to cart
- Checkout

**Components**:
- `restaurants/page.tsx` - Restaurant discovery
- `menu/page.tsx` - Public menu view
- `MenuItemCard` - Item card display
- `CartSummaryBar` - Cart overview
- `checkout/page.tsx` - Payment & order confirmation

**Cart State** (`cart-store.ts`):
- Zustand store for shopping cart
- Persistent cart data

---

## 4. Database Schema

### Tables Overview

```sql
-- Authentication & Profiles
profiles {
  id (UUID, FK auth.users.id)
  email
  full_name
  role ('owner', 'client', 'staff', 'admin')
  restaurant_id (FK restaurants.id)
  created_at
  updated_at
}

-- Restaurants
restaurants {
  id (UUID, PK)
  owner_id (FK profiles.id)
  name
  description
  address, city, phone, email
  currency (default: 'USD')
  website, image_url
  created_at, updated_at
}

-- Restaurant Locations
locations {
  id (UUID, PK)
  restaurant_id (FK restaurants.id)
  name
  address, city
  capacity
  created_at, updated_at
}

-- Tables
restaurant_tables {
  id (UUID, PK)
  location_id (FK locations.id)
  table_number
  capacity
  status ('available', 'occupied')
  qr_code
  created_at, updated_at
}

-- Menus
menus {
  id (UUID, PK)
  restaurant_id (FK restaurants.id)
  name
  description
  position
  created_at, updated_at
}

-- Menu Items
menu_items {
  id (UUID, PK)
  menu_id (FK menus.id)
  name
  description
  price_cts (in cents)
  image_url
  vegetarian, vegan
  spicy_level
  available
  created_at, updated_at
}

-- Inventory
inventory {
  id (UUID, PK)
  menu_item_id (FK menu_items.id)
  quantity
  unit ('pieces', 'grams', 'liters')
  min_threshold
  updated_at
}

-- Inventory Adjustments
inventory_adjustments {
  id (UUID, PK)
  inventory_id (FK inventory.id)
  adjustment_qty
  reason ('sale', 'waste', 'manual_adjustment', 'restock')
  notes
  adjusted_at
  adjusted_by (FK profiles.id)
}

-- Orders
orders {
  id (UUID, PK)
  restaurant_id (FK restaurants.id)
  location_id (FK locations.id)
  table_id (FK restaurant_tables.id)
  customer_id (FK profiles.id, nullable)
  status ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')
  total_net_cts
  taxes_cts
  total_with_taxes_cts
  currency
  notes
  created_at, updated_at
}

-- Order Items
order_items {
  id (UUID, PK)
  order_id (FK orders.id)
  menu_item_id (FK menu_items.id)
  name
  quantity
  unit_price_cts
  total_price_cts
  created_at
}

-- Staff Members
staff_members {
  id (UUID, PK)
  restaurant_id (FK restaurants.id)
  user_id (FK profiles.id)
  role ('waiter', 'chef', 'manager', 'cashier')
  status ('active', 'inactive')
  created_at, updated_at
}
```

### Row-Level Security (RLS)

**Enabled on**:
- `restaurants` - Owners see only their restaurants
- `profiles` - Users see only their own profile
- `menus`, `menu_items` - Only restaurant owner/staff can modify
- `orders` - RLS ensures proper access control
- `inventory` - Only authorized restaurant staff

**Policies**:
- Owners have full access to their restaurant data
- Clients can only view public restaurant/menu data
- Staff can only access their assigned restaurant
- No cross-tenant data leakage

---

## 5. Data Flow & State Management

### 5.1 User State

**Entry Point**: `useUser()` hook (`hooks/useUser.ts`)

```typescript
// Flow:
1. TanStack Query fetches user from Supabase Auth
2. Merges with profile data from profiles table
3. Cached with queryKey: ['user']
4. Available throughout app via context
```

**Available Data**:
- `user.id` - Auth user ID
- `user.email` - Email address
- `user.full_name` - Display name
- `user.role` - User role
- `user.restaurant_id` - Current restaurant (for multi-tenancy)

### 5.2 Restaurant State

**Multi-Tenant Selection**: `RestaurantSwitcher` component

```typescript
// Flow:
1. Load all restaurants owned by user
2. Display in dropdown/selector
3. Update local state on selection
4. Re-fetch data for selected restaurant
5. Update currentRestaurant in layout context
```

### 5.3 Menu Management

**Query Pattern**: TanStack Query for server state

```typescript
// Example: useQuery for menu items
useQuery({
  queryKey: ['menus', restaurantId],
  queryFn: () => fetchMenus(restaurantId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Mutations for create/update/delete
useMutation({
  mutationFn: (data) => createMenu(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['menus'] })
  }
})
```

### 5.4 Order Real-Time Updates

**Hook**: `use-orders-realtime.ts`

```typescript
// Supabase Realtime subscription to orders table
// Updates UI when:
// - Order status changes
// - New orders arrive
// - Order items are added/removed
```

### 5.5 Cart State (Public Ordering)

**Store**: Zustand (`cart-store.ts`)

```typescript
// Cart state structure:
{
  items: CartItem[],
  restaurantId: string,
  add: (item) => void,
  remove: (itemId) => void,
  clear: () => void,
  total: () => number
}

// Persisted to localStorage
```

---

## 6. Server Actions & Server-Side Processing

### 6.1 Authentication Actions

**Location**: `src/app/sign-in/actions.ts`, `src/app/sign-up/actions.ts`

```typescript
// Sign In
signin(email, password) 
  ↓ (Supabase Auth)
  ↓ Creates session
  ↓ Redirects to /dashboard

// Sign Up
signup(email, password, name, role)
  ↓ Creates auth user
  ↓ Creates profile record
  ↓ Sets RLS policies
  ↓ Redirects to welcome/dashboard
```

### 6.2 Menu Operations

**Location**: `src/lib/actions/menu-actions.ts`

```typescript
createMenu(input) 
  → Validate with Zod
  → Insert to menus table
  → Revalidate /dashboard/menus
  → Return created menu

updateMenuItem(input)
  → Validate input
  → Check authorization (RLS)
  → Update menu_items table
  → Adjust inventory if needed
  → Revalidate path
```

### 6.3 Order Processing

**Location**: `src/lib/actions/order-actions.ts`

```typescript
createOrder(input)
  → Validate order schema
  → Check stock availability
  → Calculate totals & taxes
  → Insert order record
  → Insert order_items
  → Trigger inventory reduction
  → Revalidate dashboard
  → Return order confirmation

updateOrderStatus(orderId, newStatus)
  → Validate status transition
  → Update orders table
  → Trigger kitchen notifications
  → Log status change
```

### 6.4 Inventory Management

**Location**: `src/lib/actions/inventory.ts`

```typescript
adjustInventory(itemId, adjustment, reason)
  → Validate adjustment
  → Update inventory quantity
  → Create adjustment log entry
  → Check if below threshold (low stock alert)
  → Revalidate inventory page
```

---

## 7. API & Networking

### 7.1 Supabase Client Usage

**Browser Client** (`client.ts`):
```typescript
const supabase = createBrowserClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Used in client components & hooks
supabase.from('table').select().eq('col', val)
```

**Server Client** (`server.ts`):
```typescript
const supabase = await createClient()

// Used in server actions
// Has access to auth context
// Can use service_role key if configured
```

### 7.2 Request Middleware

**Location**: `src/middleware.ts`

```typescript
// Runs on every request
middleware(request)
  → updateSession(request)
  → Refresh auth tokens if needed
  → Set auth headers
  → Return response with session

// Matches all routes except:
// - _next/static, _next/image
// - favicon.ico
// - Image files (svg, png, jpg, etc.)
```

---

## 8. UI Component Hierarchy

### 8.1 Layout Components

```
RootLayout
├── AppProviders (TanStack Query, Supabase, Theme, User)
│   └── DashboardLayout (for protected routes)
│       ├── AppSidebar
│       │   └── Navigation menu (role-based)
│       ├── Header
│       │   ├── RestaurantSwitcher
│       │   ├── Search bar
│       │   ├── Notifications
│       │   └── User profile menu
│       └── Main content area
│           └── Page content
```

### 8.2 Dashboard Page Structure

```
DashboardLayout
├── Stats Cards (Revenue, Orders, Tables, Avg Order Value)
├── Recent Orders Grid
│   ├── Orders list
│   └── Performance metrics
└── Charts/Analytics (placeholder)
```

### 8.3 Menu Management Page

```
MenusPageClient
├── Menu list view
├── Menu cards
│   ├── Menu name & description
│   ├── Item count
│   └── Action buttons (edit, delete, view items)
├── Add menu button
└── Edit/Create menu modal
    └── MenuForm (with validation)
```

### 8.4 Order Management Page

```
OrdersPage
├── Filters & search
├── Orders table
│   ├── Order ID
│   ├── Customer/Table
│   ├── Status
│   ├── Total
│   └── Actions (view, print, cancel)
└── Order detail modal
    └── OrderDetail (items, timeline, notes)
```

---

## 9. Styling & Theming

### 9.1 Tailwind CSS

**Config**: `tailwind.config.ts`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Using CSS variables for theming
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        destructive: 'hsl(var(--destructive))',
        // ... more colors
      },
      // Animations, spacing, shadows, etc.
    }
  }
}
```

### 9.2 Dark Mode

**Provider**: `theme-provider.tsx` using `next-themes`

```typescript
// Components support both light/dark
// CSS variables toggle between color schemes
// User preference persisted to localStorage
```

### 9.3 Component Styling Pattern

```typescript
// Example: Button component
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 rounded-md text-xs',
        lg: 'h-12 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonProps = VariantProps<typeof buttonVariants>
```

---

## 10. Validation & Error Handling

### 10.1 Zod Schemas

**Location**: `src/lib/validation/`

**Examples**:

```typescript
// Auth validation
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(['owner', 'client']),
})

// Menu validation
const createMenuSchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  position: z.number().int().nonnegative(),
})

// Order validation
const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  table_id: z.string().uuid(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
})
```

### 10.2 Error Handling Pattern

```typescript
// Server action
export async function someAction(input) {
  try {
    const validated = mySchema.parse(input)
    const supabase = await createClient()
    
    const { data, error } = await supabase.from('table').insert(validated)
    
    if (error) throw error
    
    revalidatePath('/path')
    return { success: true, data }
  } catch (error) {
    console.error('Action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Client-side usage with toast
const { error } = await someAction(data)
if (error) {
  toast.error(error)
}
```

---

## 11. Key Hooks & Utilities

### 11.1 Custom Hooks

**useUser** (`hooks/useUser.ts`):
- Fetches current auth user + profile
- Returns user data and TanStack Query status

**useRole** (`hooks/useRole.ts`):
- Derives role-based flags from user
- `isOwner`, `isStaff`, `isAdmin`, `isReadOnly`

**use-orders-realtime** (`hooks/use-orders-realtime.ts`):
- Subscribes to order updates via Supabase Realtime
- Updates UI in real-time

### 11.2 Utilities

**utils.ts**:
- `cn()` - Merge Tailwind classes safely
- Form helpers
- Formatting utilities

**data.ts**:
- Data fetching helper functions
- Query building utilities

---

## 12. File Upload & Media

### 12.1 Image Handling

**Used for**:
- Restaurant logos/images
- Menu item photos
- User avatars

**Supabase Storage**:
- Buckets for different media types
- Signed URLs for secure access

**Config** (`next.config.ts`):
- Image domain allowlist for Next.js Image component
- Optimization settings

---

## 13. Performance Optimizations

### 13.1 React Compiler

**Enabled**: Via `babel-plugin-react-compiler`

- Automatic memoization
- Reduced re-renders

### 13.2 TanStack Query Caching

```typescript
// Cache invalidation strategies
queryClient.invalidateQueries({ queryKey: ['orders'] })

// Stale time configuration
staleTime: 5 * 60 * 1000 // 5 minutes
```

### 13.3 Image Optimization

- Next.js Image component with lazy loading
- Tailwind responsive classes
- CSS variables for theming

### 13.4 Code Splitting

- Route-based code splitting via Next.js
- Suspense boundaries for loading states

---

## 14. Testing & Development

### 14.1 Scripts

From `package.json`:
- `npm run dev` - Start dev server (port 3000)
- `npm run build` - Production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

### 14.2 Development Helpers

**Root directory scripts** (`.mjs` files):
- `check-schema.mjs` - Verify database schema
- `check-orders.mjs` - Test order creation
- `create-orders.mjs` - Seed orders
- `normalize-orders.mjs` - Data migration utility
- `debug.mjs` - Debugging tools

---

## 15. Security Considerations

### 15.1 Authentication

- ✅ Supabase Auth with secure session management
- ✅ Password hashing with bcrypt
- ✅ Magic link authentication for staff
- ✅ Token refresh via middleware

### 15.2 Authorization

- ✅ Row-Level Security (RLS) on all sensitive tables
- ✅ Role-based access control
- ✅ Multi-tenant data isolation
- ✅ Server-side authorization checks in actions

### 15.3 Data Protection

- ✅ HTTPS in production
- ✅ Environment variables for secrets
- ✅ Supabase Storage for sensitive files
- ✅ Encrypted columns if needed

### 15.4 Input Validation

- ✅ Client-side: React Hook Form + Zod
- ✅ Server-side: Zod schema validation
- ✅ Database: RLS policies
- ✅ SQL injection prevention via parameterized queries

---

## 16. Deployment & Environment Setup

### 16.1 Environment Variables

**Required** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

### 16.2 Build Process

```bash
npm install        # Install dependencies
npm run build      # Create optimized production build
npm run start      # Run production server
```

### 16.3 Database Migrations

```bash
npx supabase migration new <name>  # Create migration
npx supabase migration up          # Apply migrations
```

---

## 17. Project Statistics

- **Framework**: Next.js 16 + React 19
- **Languages**: TypeScript, SQL
- **UI Components**: 30+ custom/Radix UI components
- **Pages**: 15+ unique routes
- **Database Tables**: 12+ normalized tables
- **Server Actions**: 20+ data operations
- **Custom Hooks**: 3 major hooks
- **Styling Approach**: Utility-first (Tailwind) with component variants

---

## 18. Future Enhancement Opportunities

1. **Analytics Dashboard** - Real-time sales, order trends, inventory forecasting
2. **Delivery Management** - Assign delivery partners, tracking
3. **Customer Reviews** - Ratings and feedback system
4. **Loyalty Program** - Points, discounts for repeat customers
5. **Payment Integration** - Stripe, PayPal for online orders
6. **Advanced Inventory** - Forecasting, automated reordering
7. **Mobile App** - React Native version for customers
8. **AI Features** - Menu recommendations, demand prediction
9. **API** - Third-party restaurant integrations
10. **Reporting** - Financial reports, tax documents

---

## 19. Code Quality Standards

**Linting**: ESLint with Next.js config
**Type Safety**: Full TypeScript coverage
**Validation**: Zod schemas for all inputs
**Error Handling**: Try-catch with user-friendly messages
**Comments**: Minimal, only when logic is unclear
**Component Structure**: Modular, single responsibility
**Naming**: Descriptive, camelCase for JS, PascalCase for components

---

## Conclusion

WEGO RestoPay is a **production-ready, modern restaurant management system** built with industry best-practices:

✅ **Type-safe** throughout with TypeScript
✅ **Scalable** multi-tenant architecture
✅ **Secure** with RLS and proper authorization
✅ **Performant** with caching and optimization
✅ **Maintainable** with clear structure and validation
✅ **User-friendly** with intuitive UI and animations

The codebase demonstrates professional software engineering with proper separation of concerns, data validation, error handling, and modern React patterns.
