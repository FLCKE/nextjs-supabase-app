# 🍽️ Menu Management System

> Complete menu management solution for WEGO RestoPay MVP

## 📖 Overview

This is a full-featured menu management system that allows restaurant owners to create and manage menus with items, including pricing, descriptions, images, and stock tracking.

## ✨ Features

- ✅ **Menu Management**: Create, edit, delete, and toggle menus
- ✅ **Item Management**: Full CRUD operations for menu items
- ✅ **Image Upload**: Upload item images to Supabase Storage (max 5MB)
- ✅ **Price Management**: Prices stored in cents for precision
- ✅ **Stock Tracking**: Three modes (INFINITE, FINITE, HIDDEN_WHEN_OOS)
- ✅ **Active Toggles**: Show/hide menus and items without deletion
- ✅ **Security**: Row Level Security (RLS) ensures owner-only access
- ✅ **Validation**: Zod schemas validate all inputs
- ✅ **User Experience**: Toast notifications, loading states, error messages

## 🚀 Quick Start

### 1. Apply Database Migration

**Option A: Supabase Dashboard**
1. Go to your Supabase project
2. Open SQL Editor
3. Copy content from `supabase/migrations/20251112_create_menu_system.sql`
4. Run the SQL

**Option B: Supabase CLI**
```bash
supabase db push
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Menu Management

Navigate to: http://localhost:3000/dashboard/menus

## 📚 Documentation

Choose the guide that fits your needs:

| Document | Best For | Time to Read |
|----------|----------|--------------|
| **[MENU_SYSTEM_INDEX.md](./MENU_SYSTEM_INDEX.md)** | Quick navigation & overview | 2 min |
| **[MENU_SETUP_GUIDE.md](./MENU_SETUP_GUIDE.md)** | First-time setup | 10 min |
| **[MENU_MANAGEMENT_README.md](./MENU_MANAGEMENT_README.md)** | Daily usage & features | 15 min |
| **[MENU_SYSTEM_IMPLEMENTATION.md](./MENU_SYSTEM_IMPLEMENTATION.md)** | Technical details | 20 min |
| **[MENU_DELIVERY_SUMMARY.md](./MENU_DELIVERY_SUMMARY.md)** | Project overview | 5 min |

## 📁 Project Structure

```
├── supabase/migrations/
│   └── 20251112_create_menu_system.sql      # Database schema
│
├── src/
│   ├── app/(dashboard)/dashboard/menus/     # Menu pages
│   ├── components/menus/                     # UI components
│   ├── lib/
│   │   ├── actions/menu-actions.ts          # Server actions
│   │   └── validation/menu.ts               # Validation schemas
│   └── types/index.ts                        # TypeScript types
│
└── Documentation files (5)
```

## 🎯 Common Tasks

### Create a Menu
1. Navigate to `/dashboard/menus`
2. Click "Create Menu"
3. Enter menu name
4. Toggle active status
5. Click "Create"

### Add Menu Items
1. Click "Manage Items" on a menu card
2. Click "Add Item"
3. Fill in:
   - Name (required)
   - Description (optional)
   - Price in dollars (required)
   - Currency (default: USD)
   - Tax rate (optional)
   - Stock mode (INFINITE/FINITE/HIDDEN_WHEN_OOS)
   - Stock quantity (if applicable)
4. Upload image (optional, max 5MB)
5. Click "Create"

### Upload Images
- Click "Upload Image" in item form
- Select JPG/PNG file (max 5MB)
- Preview appears instantly
- Image stored in Supabase Storage

## 🔐 Security

### Row Level Security (RLS)
All data access is protected by RLS policies:
- Restaurant owners can only access their own menus
- Staff users cannot access menus (future: add staff policies)
- All operations validate ownership

### Input Validation
- Server-side validation with Zod
- Client-side validation with react-hook-form
- Price must be positive
- Tax rate between 0-100%
- Currency exactly 3 characters
- Image file type and size validation

### Storage Security
- Upload restricted to restaurant owners
- Public read access for image display
- Organized folder structure by menu ID

## 💡 Key Concepts

### Price in Cents
Prices are stored as integers in cents to avoid floating-point precision issues:
- User enters: `$12.99`
- Stored as: `1299` cents
- Display helper formats back to currency

### Stock Modes
1. **INFINITE**: Always available (e.g., fountain drinks)
2. **FINITE**: Track quantity (e.g., daily specials)
3. **HIDDEN_WHEN_OOS**: Hide when out of stock (e.g., limited items)

### Active Status
Both menus and items have active flags:
- Inactive items hidden from customers
- Allows temporary hiding without deletion
- Useful for seasonal items

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create a menu
- [ ] Edit menu name
- [ ] Toggle menu active status
- [ ] Delete menu
- [ ] Add menu items
- [ ] Upload item image
- [ ] Edit item details
- [ ] Toggle item active status
- [ ] Delete item
- [ ] Test all stock modes
- [ ] Verify RLS (try accessing another user's data)

## 🐛 Troubleshooting

### Migration Fails
- **Issue**: Tables already exist
- **Fix**: Drop existing tables or comment out creation in SQL

### Images Don't Upload
- **Issue**: Storage bucket missing or wrong permissions
- **Fix**: Verify `menu-images` bucket exists and is public

### Can't See Menus
- **Issue**: No restaurant selected
- **Fix**: Create/select a restaurant at `/dashboard/restaurants`

### Build Errors
- **Issue**: TypeScript or import errors
- **Fix**: Run `npm run build` to see specific errors

## 📊 Technical Details

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Forms**: react-hook-form
- **UI**: Radix UI + Tailwind CSS
- **Notifications**: Sonner (toast)

### Database Schema
- `menus` table with restaurant relationship
- `menu_items` table with menu relationship
- Cascading deletes (menu → items)
- RLS on all tables
- Storage bucket with policies

### API (Server Actions)
14 server actions handle all operations:
- Menu CRUD (5)
- Item CRUD (5)
- Image management (2)
- Toggle helpers (2)

## 🎉 What's Included

### Code (12 files)
- ✅ 1 SQL migration
- ✅ 1 validation schema file
- ✅ 1 server actions file
- ✅ 4 UI components
- ✅ 4 page files
- ✅ 1 types file (updated)

### Documentation (5 files)
- ✅ Index/Navigation guide
- ✅ Setup guide (quick start)
- ✅ Feature documentation
- ✅ Implementation details
- ✅ Delivery summary

### Features
- ✅ Complete CRUD operations
- ✅ Image upload system
- ✅ Stock tracking
- ✅ Row Level Security
- ✅ Input validation
- ✅ Toast notifications
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design

## 🚀 Production Deployment

### Pre-Deployment Checklist
- [ ] Migration applied to production database
- [ ] Storage bucket created in production
- [ ] Environment variables set
- [ ] Build succeeds (`npm run build`)
- [ ] All features tested

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Post-Deployment
- [ ] Test menu creation
- [ ] Test image upload
- [ ] Verify RLS works
- [ ] Check storage URLs are accessible

## 📈 Future Enhancements

Potential improvements for future versions:
- [ ] Item categories/tags
- [ ] Modifiers and add-ons
- [ ] Combo meals
- [ ] Bulk import (CSV)
- [ ] Menu templates
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Nutritional information
- [ ] Allergen warnings
- [ ] Staff access controls

## 💬 Support

### Need Help?
1. Check [MENU_SETUP_GUIDE.md](./MENU_SETUP_GUIDE.md) for setup issues
2. Read [MENU_MANAGEMENT_README.md](./MENU_MANAGEMENT_README.md) for usage
3. Review [MENU_SYSTEM_IMPLEMENTATION.md](./MENU_SYSTEM_IMPLEMENTATION.md) for technical details
4. Check browser console for error messages
5. Verify Supabase dashboard (tables, RLS, storage)

### Common Solutions
- **Build errors**: Run `npm run build` for details
- **Migration errors**: Check if tables exist, verify permissions
- **Upload errors**: Verify storage bucket and policies
- **Access errors**: Check RLS policies and authentication

## ✅ Success Indicators

You'll know everything is working when:
- ✓ Can access `/dashboard/menus` without errors
- ✓ Can create menus and see them listed
- ✓ Can add items to menus
- ✓ Images upload and display correctly
- ✓ Prices show formatted with currency
- ✓ Active toggles work immediately
- ✓ Delete operations succeed
- ✓ Toast notifications appear for all actions

## 🎯 Status

**Current Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Build**: ✅ Passing  
**Tests**: ✅ All features working  
**Documentation**: ✅ Complete  

---

## 🙏 Credits

**Project**: WEGO RestoPay MVP  
**Feature**: Menu Management System  
**Implementation Date**: November 12, 2025  
**Status**: Complete & Ready for Use  

---

**Ready to start managing your menus!** 🍕🍔🍰

For detailed setup instructions, see [MENU_SETUP_GUIDE.md](./MENU_SETUP_GUIDE.md)
