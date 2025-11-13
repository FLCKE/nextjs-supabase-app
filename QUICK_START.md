# ⚡ Quick Start - WEGO RestoPay

## 🚀 Get Started in 5 Minutes

### Step 1: Apply Migration (2 min)
```
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy: supabase/migrations/20251113_complete_system_setup.sql
4. Paste and Run
5. ✅ Done!
```

### Step 2: Start App (1 min)
```bash
npm run dev
```

### Step 3: Create Restaurant (2 min)
```
1. Visit http://localhost:3000/sign-up
2. Select "Restaurant Owner"
3. Fill in details
4. Create restaurant
5. Add menu and items
```

## 📋 What You Get

✅ **Menu Management**
- Create menus
- Add items with images
- Set prices in cents
- Stock tracking (3 modes)
- Active/inactive toggles

✅ **Public Access**
- Browse restaurants (no login)
- View menus (no login)
- See images publicly

✅ **Role-Based Auth**
- Restaurant Owner → Dashboard
- Client → Browse restaurants

## 🎯 User Flows

### Restaurant Owner
```
Sign Up → Dashboard → Create Restaurant → Manage Menus → Add Items
```

### Client  
```
Sign Up (or not) → Browse Restaurants → View Menus → (Order - future)
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20251113_complete_system_setup.sql` | Single migration file |
| `src/app/(dashboard)/dashboard/menus/` | Menu management pages |
| `src/lib/actions/menu-actions.ts` | Server actions (14 functions) |
| `MIGRATION_GUIDE.md` | Detailed setup guide |

## ✅ Checklist

After setup, verify:
- [ ] Migration applied successfully
- [ ] Tables created (menus, menu_items)
- [ ] Storage bucket exists (menu-images)
- [ ] Can sign up as owner
- [ ] Can create restaurant
- [ ] Can create menu
- [ ] Can add items
- [ ] Can upload images
- [ ] Public can browse (test incognito)

## 🔑 Key Features

| Feature | Owner | Client | Public |
|---------|-------|--------|--------|
| Browse restaurants | ✅ | ✅ | ✅ |
| View menus | ✅ | ✅ | ✅ |
| Manage restaurants | ✅ | ❌ | ❌ |
| Create menus | ✅ | ❌ | ❌ |
| Order food (future) | ❌ | ✅ | ❌ |

## 🐛 Common Issues

**Can't see menus?**
→ Check migration applied, verify RLS policies

**Images not loading?**
→ Check storage bucket is public

**Build errors?**
→ Run `npm run build` to see details

## 📚 Docs

- `MIGRATION_GUIDE.md` - How to apply migration
- `MENU_SYSTEM_README.md` - Menu features
- `AUTH_UPDATE_SUMMARY.md` - Role selection
- `PUBLIC_ACCESS_UPDATE.md` - Public browsing

## 💡 Quick Tips

1. **Price in Cents**: Enter $12.99 → stored as 1299 cents
2. **Stock Modes**: INFINITE (always available), FINITE (track qty), HIDDEN_WHEN_OOS (auto-hide)
3. **Images**: Max 5MB, JPG/PNG, stored in Supabase
4. **Active Toggle**: Hide items without deleting

## 🎉 Ready!

You now have:
- ✅ Complete menu management
- ✅ Public restaurant browsing
- ✅ Role-based authentication
- ✅ Image upload system
- ✅ Secure access control

**Start building your restaurant platform!** 🍕🍔🍰
