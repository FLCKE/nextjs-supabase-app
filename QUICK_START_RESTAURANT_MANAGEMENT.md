# Quick Start Guide - Restaurant Management

## Apply Database Migrations

### Option 1: Supabase Dashboard (Recommended for Remote)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the migration file: `supabase/migrations/20251106173200_create_restaurants_locations_tables.sql`
4. Copy and paste the entire SQL content
5. Click "Run" to execute

### Option 2: Supabase CLI (Local Development)
```bash
npx supabase db reset
```

## Access the Features

### 1. View Restaurants
Navigate to: **http://localhost:3000/dashboard/restaurants**

### 2. Create Restaurant
- Click "New Restaurant" button
- Fill in:
  - Restaurant Name (e.g., "Joe's Pizza")
  - Legal Name (e.g., "Joe's Pizza LLC")
  - Country (e.g., "USA")
  - Currency (e.g., "USD")
- Click "Create"

### 3. Manage Restaurant
- Click on a restaurant name
- **Locations Tab:**
  - Click "New Location"
  - Enter name (e.g., "Main Branch") and timezone (e.g., "America/New_York")
  - Click "Create"
  
- **Tables Tab:**
  - Select a location
  - Click "Add Table"
  - Enter label (e.g., "Table 1")
  - Check/uncheck "Active"
  - Click "Create"

### 4. QR Code Operations
- Click ⋮ (three dots) next to a table
- Select "View QR Code" to see the QR code
- Click "Download QR Code" to save as PNG
- Select "Regenerate QR" to create a new token (old one becomes invalid)

## File Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── restaurants/
│               ├── page.tsx                    # List restaurants
│               └── [id]/
│                   └── page.tsx                # Restaurant detail with tabs
├── components/
│   └── restaurants/
│       ├── restaurant-dialog.tsx              # Create/Edit restaurant
│       ├── restaurant-create-button.tsx       # Create button with dialog
│       ├── restaurants-table.tsx              # Restaurant list table
│       ├── location-dialog.tsx                # Create/Edit location
│       ├── locations-tab.tsx                  # Locations tab content
│       ├── table-dialog.tsx                   # Create/Edit table
│       ├── tables-tab.tsx                     # Tables tab content
│       └── qr-code-display.tsx               # QR code renderer
├── lib/
│   ├── actions/
│   │   └── restaurant-management.ts          # Server actions
│   └── validation/
│       └── restaurant.ts                      # Zod schemas
├── hooks/
│   └── useRole.ts                            # Role-based access control
└── types/
    └── index.ts                               # TypeScript types

supabase/
└── migrations/
    └── 20251106173200_create_restaurants_locations_tables.sql
```

## Key Features

✅ **CRUD Operations** - Full create, read, update, delete for all entities
✅ **RLS Security** - Row-level security based on owner_id
✅ **Role Guards** - Staff users get read-only access
✅ **QR Codes** - Generate, view, download, and regenerate QR codes
✅ **Validation** - Zod schema validation on all forms
✅ **Toast Notifications** - Success/error feedback
✅ **TypeScript** - Full type safety
✅ **Responsive UI** - Works on all screen sizes

## Testing Different Roles

### As Owner (Full Access):
1. Sign in as a user with `role = 'owner'`
2. You can create, edit, and delete everything
3. All buttons and actions are visible

### As Staff (Read-Only):
1. Sign in as a user with `role = 'staff'`
2. "New Restaurant" button is hidden
3. Edit/Delete actions are hidden
4. You can only view data and download QR codes

## Troubleshooting

### "No restaurants found"
- Make sure you've created at least one restaurant
- Check that your user has the correct role in the profiles table

### "Failed to load"
- Verify database migrations are applied
- Check Supabase connection in `.env.local`
- Ensure RLS policies are enabled

### QR code not displaying
- Check browser console for errors
- Ensure `qrcode` package is installed: `npm install qrcode @types/qrcode`

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Already configured in `.env.local`
