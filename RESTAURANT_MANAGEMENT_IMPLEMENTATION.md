# Restaurant Management System

Complete implementation of restaurant, locations, and tables management with QR code generation.

## Features Implemented

### Database Schema

#### Tables Created:
1. **restaurants**
   - id (UUID, primary key)
   - owner_id (UUID, references auth.users)
   - name (TEXT)
   - legal_name (TEXT)
   - country (TEXT)
   - currency (TEXT, default: 'USD')
   - created_at, updated_at (TIMESTAMPTZ)

2. **locations**
   - id (UUID, primary key)
   - restaurant_id (UUID, references restaurants)
   - name (TEXT)
   - timezone (TEXT, default: 'UTC')
   - created_at, updated_at (TIMESTAMPTZ)

3. **tables**
   - id (UUID, primary key)
   - location_id (UUID, references locations)
   - label (TEXT)
   - qr_token (UUID, unique)
   - active (BOOLEAN, default: true)
   - created_at, updated_at (TIMESTAMPTZ)

#### Indexes:
- `idx_restaurants_owner_id` on restaurants(owner_id)
- `idx_locations_restaurant_id` on locations(restaurant_id)
- `idx_tables_location_id` on tables(location_id)
- `idx_tables_qr_token` on tables(qr_token)

#### RLS Policies:
- **Owners**: Full CRUD access to their restaurants, locations, and tables
- **Staff**: Read-only access to restaurants they're assigned to
- **Public**: Can view active tables by QR token (for customer ordering)

### Pages Implemented

#### 1. `/dashboard/restaurants`
- Lists all restaurants owned by or accessible to the user
- Create new restaurant button (hidden for staff)
- Edit/Delete actions (disabled for staff)
- Click restaurant name to view details

#### 2. `/dashboard/restaurants/[id]`
Two tabs:
- **Locations Tab**: Manage restaurant locations
  - Create/Edit/Delete locations
  - View timezone and creation date
  - Staff users can only view
  
- **Tables Tab**: Manage tables by location
  - Create/Edit/Delete tables
  - View QR code for each table
  - Download QR code as PNG image
  - Regenerate QR token
  - Toggle table active status
  - Staff users can view QR codes but cannot modify

### Components Created

1. **RestaurantDialog** - Create/Edit restaurant form
2. **LocationDialog** - Create/Edit location form
3. **TableDialog** - Create/Edit table form
4. **QRCodeDisplay** - Renders QR code from token
5. **RestaurantsTable** - Lists restaurants with actions
6. **LocationsTab** - Manages locations for a restaurant
7. **TablesTab** - Manages tables for all locations

### Server Actions

Located in `/src/lib/actions/restaurant-management.ts`:

#### Restaurants:
- `getRestaurants()` - List all restaurants
- `getRestaurant(id)` - Get single restaurant
- `createRestaurant(formData)` - Create new restaurant
- `updateRestaurant(id, formData)` - Update restaurant
- `deleteRestaurant(id)` - Delete restaurant

#### Locations:
- `getLocations(restaurantId)` - List locations for restaurant
- `getLocation(id)` - Get single location
- `createLocation(restaurantId, formData)` - Create location
- `updateLocation(id, restaurantId, formData)` - Update location
- `deleteLocation(id, restaurantId)` - Delete location

#### Tables:
- `getTables(locationId)` - List tables for location
- `getTable(id)` - Get single table
- `createTable(locationId, restaurantId, formData)` - Create table
- `updateTable(id, restaurantId, formData)` - Update table
- `deleteTable(id, restaurantId)` - Delete table
- `regenerateQRToken(id, restaurantId)` - Generate new QR token

### Validation Schemas

Located in `/src/lib/validation/restaurant.ts`:

```typescript
restaurantSchema - Validates restaurant data
locationSchema - Validates location data
tableSchema - Validates table data
```

All forms use Zod validation with React Hook Form.

### Role-Based Access Control

Implemented via `useRole()` hook:

```typescript
const { isOwner, isStaff, isAdmin, isReadOnly } = useRole();
```

- **Owners**: Full access to all operations
- **Staff**: Read-only access (isReadOnly = true)
  - Cannot create/edit/delete restaurants
  - Cannot create/edit/delete locations
  - Cannot create/edit/delete/regenerate tables
  - Can view and download QR codes

### QR Code Generation

- QR tokens are UUIDs generated on table creation
- Client-side QR code rendering using `qrcode` library
- Download QR codes as PNG images
- Regenerate QR tokens when needed (invalidates old code)

### Migration File

Location: `/supabase/migrations/20251106173200_create_restaurants_locations_tables.sql`

To apply migrations:
1. For local Supabase: `npx supabase db reset`
2. For remote Supabase: Run the SQL in Supabase Dashboard SQL Editor

### Dependencies Used

- `qrcode` - QR code generation
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Zod + React Hook Form integration
- `sonner` - Toast notifications

### UI Components (shadcn)

- Table - Data tables
- Badge - Status indicators
- Dialog - Modal forms
- Button - Actions
- Input - Form fields
- Label - Form labels
- Tabs - Tab navigation
- DropdownMenu - Action menus

### Features

✅ Full CRUD operations for restaurants, locations, and tables
✅ RLS policies with owner_id = auth.uid()
✅ Staff role guard for read-only access
✅ QR code generation and display
✅ QR code download as PNG
✅ QR token regeneration
✅ Zod validation on all forms
✅ Toast notifications for all actions
✅ Responsive UI with Tailwind CSS
✅ TypeScript type safety
✅ Next.js 16 App Router
✅ Supabase integration with SSR support

### Testing the Implementation

1. **As Owner:**
   - Navigate to `/dashboard/restaurants`
   - Create a new restaurant
   - Click on restaurant to manage
   - Create locations in the Locations tab
   - Create tables in the Tables tab
   - View and download QR codes
   - Regenerate QR tokens

2. **As Staff:**
   - Navigate to `/dashboard/restaurants`
   - View restaurants (but no "New Restaurant" button)
   - Click on restaurant to view
   - View locations and tables (no create/edit/delete buttons)
   - View and download QR codes only

### Next Steps

To extend this system:
1. Add menu management for locations
2. Implement order system using QR codes
3. Add analytics dashboard
4. Implement table status (occupied/available)
5. Add staff assignment to locations
6. Implement real-time updates with Supabase subscriptions
