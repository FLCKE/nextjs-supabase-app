# 🚀 Migration Guide - Complete System Setup

## Quick Start

You need to apply **ONE migration file** that contains everything:

### Migration File
📄 `supabase/migrations/20251113_complete_system_setup.sql`

This single file includes:
- ✅ Menu system tables (menus, menu_items)
- ✅ RLS policies for owners
- ✅ Storage bucket for images
- ✅ Client role support
- ✅ Public access policies

## 📋 Steps to Apply Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open: `supabase/migrations/20251113_complete_system_setup.sql`
   - Copy ALL content (Ctrl+A, Ctrl+C)

4. **Paste and Run**
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for completion

5. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Check Database → Tables: you should see `menus` and `menu_items`
   - Check Storage: you should see `menu-images` bucket

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run specific migration
supabase db execute -f supabase/migrations/20251113_complete_system_setup.sql
```

## ✅ Verification Checklist

After running the migration, verify:

### Tables Created
- [ ] `menus` table exists
- [ ] `menu_items` table exists
- [ ] Indexes created
- [ ] Triggers for updated_at work

### Storage
- [ ] `menu-images` bucket exists
- [ ] Bucket is set to public
- [ ] Storage policies created

### RLS Policies
- [ ] Menus: 6 policies (4 owner + 1 public)
- [ ] Menu Items: 6 policies (4 owner + 1 public)
- [ ] Restaurants: 1 public policy
- [ ] Storage: 4 policies

### Role Support
- [ ] `user_role` enum includes 'client'
- [ ] `handle_new_user()` function updated

## 🧪 Test the System

### 1. Test Public Access (No Sign-in)
```
1. Open incognito browser
2. Go to: http://localhost:3000/restaurants
3. Verify: Can see restaurants list
4. Click on a restaurant
5. Verify: Can see menu
```

### 2. Test Restaurant Owner
```
1. Sign up at /sign-up
2. Select "Restaurant Owner"
3. Should redirect to /dashboard/restaurants
4. Create a restaurant
5. Navigate to /dashboard/menus
6. Create a menu
7. Add menu items
8. Upload an image
```

### 3. Test Client
```
1. Sign out
2. Sign up at /sign-up
3. Select "Client"
4. Should redirect to /restaurants
5. Browse and view menus
```

## 🐛 Troubleshooting

### Error: "relation already exists"
**Cause**: Tables already created from previous migration
**Solution**: 
- Drop existing tables first, OR
- Comment out table creation in SQL, OR
- Use `CREATE TABLE IF NOT EXISTS` (already included)

### Error: "type already contains enum value"
**Cause**: 'client' role already added
**Solution**: Already handled with `DO $$ ... END $$` block

### Error: "policy already exists"
**Cause**: Policies from previous migrations exist
**Solution**: Migration includes `DROP POLICY IF EXISTS` statements

### Error: "bucket already exists"
**Cause**: Storage bucket already created
**Solution**: Migration uses `ON CONFLICT DO NOTHING`

### Storage Images Don't Load
**Check**:
1. Bucket `menu-images` is public
2. Policy "Anyone can view menu images" exists
3. Image URLs are correct format

### Can't Create Menu
**Check**:
1. Signed in as restaurant owner
2. Restaurant exists and you own it
3. RLS policies applied correctly

## 📊 What This Migration Creates

### Database Tables (2)
```sql
- menus (id, restaurant_id, name, is_active, created_at, updated_at)
- menu_items (id, menu_id, name, description, price_cts, currency, 
              tax_rate, stock_mode, stock_qty, image_url, active,
              created_at, updated_at)
```

### Indexes (4)
```sql
- idx_menus_restaurant_id
- idx_menus_is_active
- idx_menu_items_menu_id
- idx_menu_items_active
```

### RLS Policies (15)
```
Owner Policies (8):
- 4 for menus (SELECT, INSERT, UPDATE, DELETE)
- 4 for menu_items (SELECT, INSERT, UPDATE, DELETE)

Public Policies (4):
- 1 for restaurants (SELECT)
- 1 for menus (SELECT active)
- 1 for menu_items (SELECT active)
- 1 for storage (SELECT menu-images)

Storage Policies (3):
- INSERT (owners only)
- UPDATE (owners only)
- DELETE (owners only)
```

### Storage
```
Bucket: menu-images (public)
Path structure: {menu_id}/{item_id}-{timestamp}.{ext}
```

### Functions (2)
```sql
- update_updated_at_column() - Auto-update timestamps
- handle_new_user() - Create profile with role
```

### Triggers (2)
```sql
- update_menus_updated_at
- update_menu_items_updated_at
```

## 🎯 Next Steps After Migration

### 1. Start Development Server
```bash
npm run dev
```

### 2. Create Your First Restaurant
```
1. Sign up as Restaurant Owner
2. Go to /dashboard/restaurants
3. Click "Create Restaurant"
4. Fill in details
5. Save
```

### 3. Create a Menu
```
1. Go to /dashboard/menus
2. Click "Create Menu"
3. Enter menu name (e.g., "Lunch Menu")
4. Toggle "Active"
5. Save
```

### 4. Add Menu Items
```
1. Click "Manage Items" on menu card
2. Click "Add Item"
3. Fill in:
   - Name: "Burger"
   - Description: "Delicious beef burger"
   - Price: 9.99
   - Stock Mode: INFINITE
4. Upload image (optional)
5. Save
```

### 5. Test Public View
```
1. Open incognito window
2. Go to /restaurants
3. Find your restaurant
4. View the menu
5. See your items!
```

## ✨ Migration Summary

**ONE file** to rule them all! 🎯

This comprehensive migration:
- ✅ Creates complete menu system
- ✅ Sets up proper security (RLS)
- ✅ Enables image uploads
- ✅ Adds client role support
- ✅ Allows public browsing
- ✅ Protects owner management

**Status**: Ready to apply!
**Build**: Tested and passing
**Security**: Fully configured

Apply the migration and start building! 🚀

---

**Need Help?**
- Check error messages in SQL Editor
- Verify tables in Database section
- Test with provided checklist
- Review troubleshooting section
