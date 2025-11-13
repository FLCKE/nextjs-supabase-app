# WEGO RestoPay - Quick Reference Card

## 🚀 Quick Start (3 Steps)

### 1. Run Migration
```
Supabase Dashboard → SQL Editor → Run: 20251114_final_system_setup.sql
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test
```
Sign up as Owner → Create Restaurant → Add Menu → Add Items → Track Inventory
```

---

## 📁 Project Structure

```
src/
├── app/(dashboard)/
│   ├── layout.tsx                    # Has OwnerNavbar
│   └── dashboard/
│       ├── menus/                    # Menu management
│       │   └── [id]/items/          # Menu items
│       └── inventory/               # Stock tracking
├── components/
│   ├── dashboard/owner-navbar.tsx  # Navigation
│   ├── menus/                      # Menu components
│   └── inventory/                  # Inventory components
└── lib/actions/
    ├── menu-actions.ts             # Menu CRUD
    └── inventory.ts                # Stock tracking
```

---

## 🗄️ Database Tables

### menus
```sql
id, restaurant_id, name, is_active, created_at, updated_at
```

### menu_items
```sql
id, menu_id, name, description, price_cts, currency, tax_rate,
stock_mode, stock_qty, image_url, active, created_at, updated_at
```

### inventory_adjustments
```sql
id, item_id, type, quantity, reason, created_by, created_at
```

---

## 🎯 Key Features

### For Owners
- ✅ Manage menus (CRUD)
- ✅ Manage items with images
- ✅ Track inventory (FINITE items)
- ✅ View stock history
- ✅ Toggle active/inactive

### For Clients
- ✅ Browse restaurants
- ✅ View active menus
- ✅ View active items
- ✅ See prices and images

---

## 🔑 Important Concepts

### Price in Cents
```
Input: 1500 cents
Display: $15.00
```

### Stock Modes
- **FINITE**: Track quantity
- **INFINITE**: Always available
- **HIDDEN_WHEN_OOS**: Hide when stock = 0

### Stock Calculation
```
Current Stock = IN - OUT - SPOILAGE
```

### Stock Status
- **Out of Stock**: 0 (Red)
- **Low Stock**: ≤ 5 (Orange)
- **In Stock**: > 5 (Green)

---

## 📋 Common Tasks

### Create Menu
```
Dashboard → Menus → Add Menu → Enter name → Toggle active → Submit
```

### Add Menu Item
```
Menus → Click menu card → Add Item → Fill form → Upload image → Submit
```

### Add Stock
```
Dashboard → Inventory → Add Adjustment → Select item → Type: IN → Quantity → Submit
```

### Remove Stock
```
Dashboard → Inventory → Add Adjustment → Select item → Type: OUT → Quantity → Submit
```

### Record Spoilage
```
Dashboard → Inventory → Add Adjustment → Select item → Type: SPOILAGE → Quantity → Submit
```

---

## 🔒 Security (RLS)

### Owners Can:
- ✅ Manage their own data
- ✅ Upload images
- ✅ View their restaurants only

### Clients Can:
- ✅ View active menus (public)
- ✅ View active items (public)
- ❌ Cannot modify anything

---

## 🐛 Quick Fixes

### Migration Fails
```
Use Supabase Dashboard SQL Editor (not CLI)
```

### Images Not Loading
```
Check: next.config.ts has your Supabase domain
Already configured: jkgbhwdgxulhsbjduztn.supabase.co
```

### Can't Create Menu
```
1. Create restaurant first
2. Verify you're signed in as owner
```

### Stock Shows 0
```
1. Set stock_mode = 'FINITE'
2. Add "Stock In" adjustment
```

---

## 📞 Documentation Files

| File | Purpose |
|------|---------|
| `FINAL_CHECKLIST.md` | Step-by-step verification |
| `QUICK_SETUP_INSTRUCTIONS.md` | Detailed setup guide |
| `MENU_INVENTORY_SETUP.md` | Complete documentation |
| `IMPLEMENTATION_SUMMARY.md` | Technical overview |
| `QUICK_REFERENCE.md` | This file (quick tips) |

---

## 🎨 Navigation Routes

### Owner Routes
- `/dashboard/restaurants` - Manage restaurants
- `/dashboard/locations` - Manage locations
- `/dashboard/menus` - Manage menus
- `/dashboard/menus/[id]/items` - Manage menu items
- `/dashboard/inventory` - Track inventory

### Public Routes
- `/restaurants` - Browse restaurants
- `/restaurants/[id]` - View restaurant details

---

## 💡 Pro Tips

1. **Price Input**: Always use cents (1500 for $15.00)
2. **Stock Tracking**: Only works for FINITE items
3. **Images**: Use optimized images for faster loading
4. **Active Status**: Toggle to show/hide items
5. **Inventory History**: Filter by type to find specific adjustments
6. **Mobile Menu**: Tap hamburger icon for navigation

---

## ✅ Success Indicators

Your system works if:
1. ✅ No RLS permission errors
2. ✅ Images upload and display
3. ✅ Stock calculates automatically
4. ✅ Clients can browse public menus
5. ✅ Navigation works on mobile

---

## 🚨 Emergency Commands

### Kill Server
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Restart Server
```bash
npm run dev
```

### Check Database
```sql
SELECT * FROM menus LIMIT 5;
SELECT * FROM menu_items LIMIT 5;
SELECT * FROM inventory_adjustments LIMIT 5;
```

---

## 🎉 You're Ready!

Everything is set up. Just:
1. Run the migration
2. Start the server
3. Test the features

**Happy building! 🚀**
