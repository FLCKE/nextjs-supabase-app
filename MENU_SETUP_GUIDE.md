# Menu Management Setup Guide

## Quick Start - 3 Steps to Get Menu Management Working

### Step 1: Apply Database Migration

You have **two options** to apply the migration:

#### Option A: Via Supabase Dashboard (Recommended if no CLI)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of: `supabase/migrations/20251112_create_menu_system.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. Wait for "Success. No rows returned" message

#### Option B: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run specific migration
supabase db execute -f supabase/migrations/20251112_create_menu_system.sql
```

### Step 2: Verify Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Verify `menu-images` bucket exists
3. Check it's set to **Public** (for image display)
4. Policies should be automatically created

If bucket doesn't exist, create it manually:
- Name: `menu-images`
- Public: ✓ Yes
- File size limit: 5MB
- Allowed mime types: image/*

### Step 3: Test the System

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/dashboard/menus`

3. Create your first menu:
   - Click "Create Menu"
   - Enter name: "Test Menu"
   - Set active: ✓
   - Click "Create"

4. Add a menu item:
   - Click "Manage Items"
   - Click "Add Item"
   - Fill in details
   - Upload an image (optional)
   - Click "Create"

## ✅ Verification Checklist

After setup, verify these work:

### Database
- [ ] `menus` table exists
- [ ] `menu_items` table exists
- [ ] RLS policies are enabled
- [ ] Indexes are created
- [ ] Triggers for updated_at work

### Storage
- [ ] `menu-images` bucket exists
- [ ] Bucket is public
- [ ] Storage policies exist
- [ ] Can upload images

### Functionality
- [ ] Can create menu
- [ ] Can list menus
- [ ] Can edit menu
- [ ] Can toggle menu active
- [ ] Can delete menu
- [ ] Can add items
- [ ] Can upload images
- [ ] Can edit items
- [ ] Can toggle item active
- [ ] Can delete items

## 🔍 Troubleshooting

### Migration Fails

**Error**: "relation already exists"
- **Solution**: Tables already exist, skip migration or drop existing tables first

**Error**: "permission denied"
- **Solution**: Ensure you're running as database owner/admin

**Error**: "storage bucket already exists"
- **Solution**: Comment out bucket creation in SQL, it already exists

### Can't Upload Images

**Problem**: Upload fails with 403 error
- **Check**: Storage policies are correct
- **Check**: Bucket is public
- **Fix**: Re-run storage policy creation from migration

**Problem**: Image too large
- **Solution**: Image must be < 5MB, compress before upload

### Can't See Menus

**Problem**: Page shows "No restaurant selected"
- **Solution**: First create/select a restaurant at `/dashboard/restaurants`
- **Note**: Menu system requires active restaurant context

**Problem**: Menus don't load
- **Check**: RLS policies applied correctly
- **Check**: User is authenticated
- **Check**: User owns the restaurant
- **Debug**: Check browser console for errors

### Build Errors

**Error**: "Cannot find module '@/components/menus/...'"
- **Solution**: Check component files exist in correct location
- **Verify**: `src/components/menus/` directory exists

**Error**: Type errors
- **Solution**: Run `npm run build` to see specific errors
- **Check**: All imports are correct
- **Verify**: Types in `src/types/index.ts` are exported

## 📊 Database Schema Reference

### Menus Table
```sql
CREATE TABLE public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Menu Items Table
```sql
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cts INTEGER NOT NULL CHECK (price_cts >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  stock_mode TEXT NOT NULL DEFAULT 'INFINITE' CHECK (stock_mode IN ('FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS')),
  stock_qty INTEGER CHECK (stock_qty >= 0),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🔐 RLS Policy Summary

### Menus Policies
- **SELECT**: Users can view menus for restaurants they own
- **INSERT**: Users can create menus for restaurants they own
- **UPDATE**: Users can update menus for restaurants they own
- **DELETE**: Users can delete menus for restaurants they own

### Menu Items Policies
- **SELECT**: Users can view items for their restaurant's menus
- **INSERT**: Users can create items for their restaurant's menus
- **UPDATE**: Users can update items for their restaurant's menus
- **DELETE**: Users can delete items for their restaurant's menus

### Storage Policies
- **INSERT**: Users can upload images for their restaurant's menus
- **UPDATE**: Users can update images for their restaurant's menus
- **DELETE**: Users can delete images for their restaurant's menus
- **SELECT**: Public read access for displaying images

## 🚀 Production Deployment

### Before Deploying

1. **Test thoroughly**
   - Create/edit/delete menus
   - Upload/remove images
   - Test all stock modes
   - Verify RLS with multiple users

2. **Check environment variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
   ```

3. **Verify migration applied**
   - Check Supabase dashboard
   - Verify tables exist
   - Check RLS enabled

4. **Test storage**
   - Upload test image
   - Verify public access
   - Test delete

### Deploy Steps

1. Build the project:
   ```bash
   npm run build
   ```

2. Verify build succeeds with no errors

3. Deploy to your hosting platform (Vercel, etc.)

4. After deploy, test in production:
   - Create menu
   - Upload image
   - Verify storage URLs work

## 📝 Usage Examples

### Creating a Menu
```typescript
const result = await createMenu({
  restaurant_id: "uuid-here",
  name: "Dinner Menu",
  is_active: true
});
```

### Creating a Menu Item
```typescript
const result = await createMenuItem({
  menu_id: "uuid-here",
  name: "Margherita Pizza",
  description: "Classic tomato and mozzarella",
  price_cts: 1299, // $12.99
  currency: "USD",
  tax_rate: 8.5,
  stock_mode: "INFINITE",
  active: true
});
```

### Uploading Image
```typescript
const file = // File from input
const result = await uploadMenuItemImage(
  menuId,
  itemId,
  file
);
// Returns public URL
```

## 💡 Best Practices

1. **Price Entry**
   - Always enter prices in dollars in the UI
   - System converts to cents for storage
   - Display using formatPrice helper

2. **Images**
   - Optimize images before upload
   - Use reasonable dimensions (e.g., 800x600)
   - Compress to reduce file size
   - Use JPG for photos, PNG for graphics

3. **Stock Modes**
   - **INFINITE**: For items always available (drinks, etc.)
   - **FINITE**: For limited quantity (daily specials)
   - **HIDDEN_WHEN_OOS**: Auto-hide when sold out

4. **Menu Organization**
   - Create separate menus for meal times (Breakfast, Lunch, Dinner)
   - Or by category (Appetizers, Mains, Desserts)
   - Use active toggle for seasonal menus

5. **Data Entry**
   - Fill descriptions for better customer experience
   - Set appropriate tax rates
   - Keep item names concise
   - Use high-quality images

## 🆘 Support

If you encounter issues:

1. **Check documentation**
   - MENU_MANAGEMENT_README.md
   - MENU_SYSTEM_IMPLEMENTATION.md
   - This guide

2. **Review error messages**
   - Browser console (F12)
   - Network tab for API errors
   - Server logs

3. **Verify database**
   - Supabase dashboard
   - Check table data
   - Verify RLS policies

4. **Test isolation**
   - Try in incognito mode
   - Clear browser cache
   - Test with different user

## ✅ Success Indicators

You'll know it's working when:

- ✓ Can access `/dashboard/menus`
- ✓ Can create and see menus
- ✓ Can add items to menus
- ✓ Images upload successfully
- ✓ Prices display correctly
- ✓ Active toggles work
- ✓ Delete operations work
- ✓ Toast notifications appear
- ✓ No console errors

## 🎉 You're Ready!

Once setup is complete, you have a fully functional menu management system with:
- ✅ Complete CRUD operations
- ✅ Image upload capabilities
- ✅ Stock tracking
- ✅ Price management
- ✅ Active/inactive controls
- ✅ Secure RLS policies
- ✅ User-friendly interface

Start building your restaurant's menu! 🍕🍔🍰
