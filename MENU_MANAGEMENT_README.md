# Menu Management System - WEGO RestoPay MVP

This document provides a complete overview of the menu management system implementation for WEGO RestoPay.

## 📋 Overview

The menu management system allows restaurant owners to create and manage menus with items, including:
- Multiple menus per restaurant
- Menu items with pricing, descriptions, images, and stock tracking
- Active/inactive toggles for menus and items
- Image upload to Supabase Storage
- Role-based access control (RLS)

## 🗄️ Database Schema

### Tables

#### `menus`
- `id` (UUID, PK)
- `restaurant_id` (UUID, FK → restaurants)
- `name` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `menu_items`
- `id` (UUID, PK)
- `menu_id` (UUID, FK → menus)
- `name` (TEXT)
- `description` (TEXT, nullable)
- `price_cts` (INTEGER) - Price in cents
- `currency` (TEXT, default: 'USD')
- `tax_rate` (DECIMAL, nullable)
- `stock_mode` (TEXT) - 'FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS'
- `stock_qty` (INTEGER, nullable)
- `image_url` (TEXT, nullable)
- `active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Storage

- **Bucket**: `menu-images` (public)
- **Path structure**: `{menu_id}/{item_id}-{timestamp}.{ext}`

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow restaurant owners to perform all CRUD operations on their menus/items
- Prevent unauthorized access to other restaurants' data
- Allow public read access to active menus (for customer-facing features)

## 📁 File Structure

```
src/
├── app/(dashboard)/dashboard/menus/
│   ├── page.tsx                    # Menus list page
│   ├── menus-client.tsx           # Client component for menus
│   └── [id]/items/
│       ├── page.tsx                # Menu items page
│       └── items-client.tsx       # Client component for items
├── components/menus/
│   ├── menu-card.tsx              # Menu display card
│   ├── menu-form.tsx              # Menu create/edit form
│   ├── menu-item-form.tsx         # Menu item create/edit form
│   └── item-table.tsx             # Menu items table
├── lib/
│   ├── actions/
│   │   └── menu-actions.ts        # Server actions for menus
│   └── validation/
│       └── menu.ts                # Zod schemas
└── types/
    └── index.ts                    # TypeScript types
```

## 🚀 Setup Instructions

### 1. Apply Database Migration

```bash
# From project root
supabase db push
```

Or apply manually:
```bash
supabase db execute -f supabase/migrations/20251112_create_menu_system.sql
```

### 2. Verify Storage Bucket

The migration automatically creates the `menu-images` bucket. Verify in Supabase Dashboard:
- Go to Storage
- Check that `menu-images` bucket exists
- Ensure it's set to public

### 3. Environment Variables

Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Features

### Menu Management

**Create Menu**
- Navigate to `/dashboard/menus`
- Click "Create Menu"
- Enter menu name and set active status
- Submit to create

**Edit Menu**
- Click the menu card's dropdown (⋮)
- Select "Edit"
- Update details and save

**Toggle Active Status**
- Use dropdown menu on menu card
- Click "Activate" or "Deactivate"

**Delete Menu**
- Click dropdown on menu card
- Select "Delete"
- Confirm deletion (cascades to items)

### Menu Item Management

**Add Items**
- Click "Manage Items" on a menu card
- Click "Add Item" button
- Fill in item details:
  - Name (required)
  - Description (optional)
  - Price (required, in dollars)
  - Currency (default: USD)
  - Tax rate (optional, %)
  - Stock mode:
    - **INFINITE**: Always available
    - **FINITE**: Track quantity
    - **HIDDEN_WHEN_OOS**: Hide when out of stock
  - Stock quantity (if finite/hidden mode)
  - Image (optional, max 5MB)
  - Active status

**Upload Images**
- Click "Upload Image" in item form
- Select image file (JPG/PNG)
- Max 5MB file size
- Automatically uploads to Supabase Storage
- Preview shown in form

**Edit Items**
- Click dropdown (⋮) on item row
- Select "Edit"
- Update details and save

**Toggle Item Active**
- Click dropdown on item
- Select "Activate" or "Deactivate"

**Delete Items**
- Click dropdown on item
- Select "Delete"
- Confirm deletion

## 🔒 Security Features

### Row Level Security
- Restaurant owners can only access their own menus
- Staff users can view (future enhancement)
- No cross-restaurant data access

### Input Validation
- All inputs validated with Zod schemas
- Price must be positive
- Tax rate between 0-100%
- Stock quantity cannot be negative
- Currency must be 3 letters

### Image Upload Security
- File type validation (images only)
- File size limit (5MB)
- Stored in organized folder structure
- Public read access for customer display

## 📊 Server Actions

### Menu Actions
```typescript
// Create menu
createMenu(input: CreateMenuInput)

// Update menu
updateMenu(input: UpdateMenuInput)

// Delete menu
deleteMenu(menuId: string)

// Toggle active status
toggleMenuActive(menuId: string, isActive: boolean)

// Get menus with item counts
getMenusByRestaurant(restaurantId: string)

// Get single menu
getMenuById(menuId: string)
```

### Menu Item Actions
```typescript
// Create item
createMenuItem(input: CreateMenuItemInput)

// Update item
updateMenuItem(input: UpdateMenuItemInput)

// Delete item
deleteMenuItem(itemId: string)

// Toggle active status
toggleMenuItemActive(itemId: string, active: boolean)

// Get items for menu
getMenuItemsByMenu(menuId: string)

// Upload image
uploadMenuItemImage(menuId: string, itemId: string, file: File)

// Delete image
deleteMenuItemImage(imageUrl: string)
```

## 🎨 UI Components

### MenuCard
Displays menu overview with:
- Menu name
- Active/inactive badge
- Item count
- Dropdown actions (Edit, Toggle, Delete)
- "Manage Items" button

### MenuForm
Dialog form for creating/editing menus:
- Name input
- Active checkbox
- Form validation
- Loading states
- Toast notifications

### MenuItemForm
Comprehensive dialog form for items:
- All item fields
- Image upload with preview
- Dynamic stock fields based on mode
- Price in dollar format (converts to cents)
- Validation and error messages

### ItemTable
Data table displaying items:
- Image thumbnail
- Name and description
- Formatted price with currency
- Stock status badges
- Active/inactive badges
- Dropdown actions per row

## 🔄 State Management

- React hooks for local state
- Server actions for data operations
- Automatic revalidation after mutations
- LocalStorage for current restaurant ID
- Toast notifications for user feedback

## 💡 Usage Tips

1. **Price Entry**: Enter prices in dollars (e.g., 12.99), stored as cents (1299)
2. **Stock Modes**:
   - Use INFINITE for items always available
   - Use FINITE for limited quantity items
   - Use HIDDEN_WHEN_OOS to auto-hide sold-out items
3. **Images**: Optimize images before upload for better performance
4. **Menu Organization**: Create separate menus for different meal times or categories
5. **Active Status**: Use to temporarily hide menus/items without deletion

## 🐛 Troubleshooting

### Cannot Create Menu
- Ensure you have a restaurant selected
- Check browser console for errors
- Verify RLS policies in Supabase

### Image Upload Fails
- Check file size (max 5MB)
- Ensure file is an image (JPG/PNG/GIF)
- Verify storage bucket exists and is public
- Check Supabase storage policies

### Items Not Showing
- Verify menu ID in URL
- Check RLS policies
- Ensure items are active (or check filter)

### Price Display Issues
- Price stored in cents (multiply by 100)
- Use formatPrice helper for display
- Check currency code (3 letters)

## 📈 Future Enhancements

- [ ] Bulk item import (CSV)
- [ ] Item categories/tags
- [ ] Modifiers/add-ons
- [ ] Combo meals
- [ ] Seasonal availability
- [ ] Staff access controls
- [ ] Multi-language menu support
- [ ] Nutritional information
- [ ] Allergen warnings
- [ ] Menu templates
- [ ] Analytics dashboard

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create a menu
- [ ] Edit menu name
- [ ] Toggle menu active status
- [ ] Add menu items
- [ ] Upload item images
- [ ] Edit item details
- [ ] Toggle item active status
- [ ] Test stock modes
- [ ] Delete items
- [ ] Delete menu (verify cascade)
- [ ] Test RLS (different users)

### Test Data
Use realistic test data:
- Restaurant: "Test Café"
- Menu: "Breakfast Menu"
- Items:
  - "Pancakes" - $8.99
  - "Coffee" - $3.50
  - "Eggs Benedict" - $12.99

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error messages in console
3. Check Supabase Dashboard for data/policies
4. Verify migration was applied successfully

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-12  
**Author**: WEGO RestoPay Team
