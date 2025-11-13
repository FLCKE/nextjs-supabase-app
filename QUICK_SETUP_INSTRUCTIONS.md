# Quick Setup Instructions

## Step 1: Run the Migration

### Option A: Via Supabase Dashboard (RECOMMENDED)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content of `supabase/migrations/20251114_final_system_setup.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for success message

### Option B: Via Supabase CLI (if migration push works)
```bash
cd "C:\Users\ASUS ZENBOOK GAMING\Desktop\nextjs-supabase-app"
npx supabase db push
```

**Note:** If this fails with trigger errors, use Option A instead.

## Step 2: Verify Migration

Run this SQL in Supabase Dashboard to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('menus', 'menu_items', 'inventory_adjustments');
```

You should see all 3 tables listed.

## Step 3: Verify Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Verify `menu-images` bucket exists
3. Check that it's set to **Public**

If it doesn't exist, run this SQL:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;
```

## Step 4: Start the Development Server

```bash
cd "C:\Users\ASUS ZENBOOK GAMING\Desktop\nextjs-supabase-app"
npm run dev
```

## Step 5: Test the System

### Test as Restaurant Owner:
1. Go to http://localhost:3000/sign-up
2. Fill in details and select **"Restaurant Owner"**
3. Click Sign Up
4. You'll be redirected to `/dashboard/restaurants`
5. Create a restaurant
6. Navigate to **Menus** tab
7. Create a menu
8. Click on the menu to add items
9. Add a menu item with image
10. Navigate to **Inventory** tab
11. Add a stock adjustment for a FINITE item

### Test as Client:
1. Open incognito/private browsing
2. Go to http://localhost:3000/sign-up
3. Fill in details and select **"Client"**
4. Click Sign Up
5. You'll be redirected to `/restaurants`
6. Browse public restaurants and menus

## Step 6: Verify Everything Works

### Check Menus:
- [ ] Can create a menu
- [ ] Can toggle menu active/inactive
- [ ] Can edit menu name
- [ ] Can delete menu

### Check Menu Items:
- [ ] Can create menu item
- [ ] Can upload image
- [ ] Price displays correctly (cents converted to dollars)
- [ ] Can set stock mode
- [ ] Can toggle item active/inactive
- [ ] Can edit item
- [ ] Can delete item

### Check Inventory:
- [ ] Can add stock adjustment (IN)
- [ ] Can add stock adjustment (OUT)
- [ ] Can add spoilage
- [ ] Stock levels update correctly
- [ ] History table shows all adjustments
- [ ] Can filter by adjustment type

### Check Navigation:
- [ ] Owner navbar shows all tabs
- [ ] Mobile menu works
- [ ] Sign out works
- [ ] Profile link works

## Troubleshooting

### Migration Fails
**Error:** `trigger "set_restaurants_updated_at" for relation "restaurants" already exists`

**Fix:** Use Option A (Supabase Dashboard) to run the SQL directly. The CLI has issues with old migration files.

### Images Not Loading
**Error:** `hostname "jkgbhwdgxulhsbjduztn.supabase.co" is not configured`

**Fix:** Already fixed in `next.config.ts`. Restart dev server if still showing.

### Can't Create Menus
**Error:** Permission denied or no restaurant found

**Fix:** 
1. Make sure you created a restaurant first
2. Check you're signed in as owner (not client)
3. Verify RLS policies in Supabase Dashboard

### Params Error in Menu Items Page
**Error:** `params.id used without await`

**Fix:** Already fixed - using `await params` in page.tsx

### Stock Not Calculating
**Issue:** Inventory shows 0 for all items

**Fix:**
1. Make sure item has stock_mode = 'FINITE'
2. Add at least one IN adjustment
3. Check `menu_item_stock` view exists in database

## Common Tasks

### Add Missing UI Components
If you get errors about missing components:

```bash
# Install shadcn components
npx shadcn@latest add textarea
npx shadcn@latest add tabs
npx shadcn@latest add card
npx shadcn@latest add select
```

### Reset Database
If you need to start fresh:

1. Go to Supabase Dashboard
2. Go to Database → Tables
3. Delete tables: inventory_adjustments, menu_items, menus
4. Run the migration SQL again

### Check RLS Policies
To view all RLS policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('menus', 'menu_items', 'inventory_adjustments')
ORDER BY tablename, policyname;
```

## Next Steps

Once everything works:
1. Read `MENU_INVENTORY_SETUP.md` for detailed documentation
2. Customize styling/branding
3. Add more features (see Future Enhancements section)
4. Deploy to production

## Need Help?

Check these files for reference:
- `MENU_INVENTORY_SETUP.md` - Complete documentation
- `src/lib/actions/menu-actions.ts` - Server actions
- `src/components/menus/` - Menu components
- `src/components/inventory/` - Inventory components
- `supabase/migrations/20251114_final_system_setup.sql` - Database schema

---

**You're all set! 🎉**

The system is ready to use. Start by creating a restaurant, then add menus and items. Happy coding!
