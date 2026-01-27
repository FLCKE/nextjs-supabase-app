# 🗺️ Cart System - File Navigation Guide

Quick reference to find what you need.

## 📍 Find by Category

### 🛒 Want to Use the Cart?
- **New to system?** → [CART_QUICK_START.md](./CART_QUICK_START.md)
- **Full overview?** → [CART_SYSTEM_README.md](./CART_SYSTEM_README.md)
- **Code examples?** → [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md)

### 📦 Components
| Want | Location |
|------|----------|
| Add to cart button | `src/components/public/cart-button.tsx` |
| Cart drawer | `src/components/public/cart-drawer.tsx` |
| Cart summary bar | `src/components/public/cart-summary-bar.tsx` |
| Menu header | `src/components/public/menu-header.tsx` |
| Cart page | `src/app/(public)/public/cart/page.tsx` |
| Checkout form | `src/components/public/checkout-form.tsx` |
| Promo codes | `src/components/public/promo-section.tsx` |
| Add to cart dialog | `src/components/public/add-to-cart-dialog.tsx` |

### 🧠 State Management
| Want | Location |
|------|----------|
| Main cart store | `src/lib/cart/cart-store.ts` |
| Drawer UI state | `src/lib/cart/cart-drawer-store.ts` |
| Utilities/helpers | `src/lib/cart/cart-utils.ts` |
| Configuration | `src/lib/cart/config.ts` |
| Type definitions | `src/lib/cart/types.ts` |
| Component exports | `src/components/public/cart-components.ts` |

### 📚 Documentation
| Want | File |
|------|------|
| Quick setup (5 min) | [CART_QUICK_START.md](./CART_QUICK_START.md) |
| Complete guide | [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md) |
| Code examples (12) | [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md) |
| File reference | [CART_SYSTEM_FILES_SUMMARY.md](./CART_SYSTEM_FILES_SUMMARY.md) |
| Implementation | [CART_CHECKOUT_IMPLEMENTATION.md](./CART_CHECKOUT_IMPLEMENTATION.md) |
| What changed | [EXISTING_FILES_MODIFICATIONS.md](./EXISTING_FILES_MODIFICATIONS.md) |
| Overview | [CART_SYSTEM_README.md](./CART_SYSTEM_README.md) |
| This navigation | This file |

---

## 🎯 Find by Task

### I want to...

#### ...understand the system
1. Read [CART_SYSTEM_README.md](./CART_SYSTEM_README.md)
2. Look at [CART_SYSTEM_INDEX.md](./CART_SYSTEM_INDEX.md) (this file)
3. Review [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md)

#### ...get it running quickly
1. Read [CART_QUICK_START.md](./CART_QUICK_START.md)
2. Install dependency: `npm install @radix-ui/react-radio-group`
3. Run: `npm run dev`
4. Test at `/public/menu`

#### ...see code examples
1. Open [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md)
2. Find your use case (12 examples included)
3. Copy-paste the code
4. Customize as needed

#### ...customize the system
1. Edit `src/lib/cart/config.ts` for settings
2. Modify components in `src/components/public/`
3. Update styles in Tailwind config
4. Change types in `src/lib/cart/types.ts`

#### ...add new features
1. Check `src/lib/cart/types.ts` for existing types
2. Add new types if needed
3. Update `src/lib/cart/cart-store.ts` for state
4. Create new component in `src/components/public/`
5. Export from `src/components/public/cart-components.ts`

#### ...fix a bug
1. Check [EXISTING_FILES_MODIFICATIONS.md](./EXISTING_FILES_MODIFICATIONS.md)
2. Read component comments
3. Review types in `src/lib/cart/types.ts`
4. Check test examples
5. Debug with React DevTools

#### ...understand the types
Open `src/lib/cart/types.ts` for:
- CartItem interface
- CartState interface
- CheckoutFormData
- PromoCode configuration
- All component prop types

#### ...integrate with backend
1. Review [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md)
2. Example #5 shows order submission
3. Update `createPublicOrder` API call
4. Handle response in checkout components

#### ...deploy to production
1. Run `npm run build`
2. Fix any TypeScript errors (check [EXISTING_FILES_MODIFICATIONS.md](./EXISTING_FILES_MODIFICATIONS.md))
3. Run `npm run lint`
4. Test all flows
5. Deploy with `npm start`

---

## 📖 Read by Purpose

### Learning
- **Visual learner?** → [CART_SYSTEM_FILES_SUMMARY.md](./CART_SYSTEM_FILES_SUMMARY.md) (has file structure diagram)
- **Practical learner?** → [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md) (12 examples)
- **Systematic learner?** → [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md) (detailed guide)

### Implementation
- **Just get it working** → [CART_QUICK_START.md](./CART_QUICK_START.md)
- **Customize it** → Edit `src/lib/cart/config.ts`
- **Integrate with backend** → [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md) Example #5

### Reference
- **Component props?** → [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md) Component Props section
- **Type definitions?** → `src/lib/cart/types.ts`
- **Configuration?** → `src/lib/cart/config.ts`
- **File structure?** → [CART_SYSTEM_FILES_SUMMARY.md](./CART_SYSTEM_FILES_SUMMARY.md)

### Troubleshooting
- **Build errors?** → [EXISTING_FILES_MODIFICATIONS.md](./EXISTING_FILES_MODIFICATIONS.md)
- **Issues?** → [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md) Troubleshooting section
- **Type errors?** → `src/lib/cart/types.ts`

---

## 🗂️ File Organization

### Components (src/components/public/)
```
- add-to-cart-dialog.tsx      [6.2 KB] Add to cart modal
- cart-button.tsx              [0.9 KB] FAB button
- cart-components.ts           [0.8 KB] Exports
- cart-drawer.tsx              [7.3 KB] Side panel
- cart-header.tsx              [3.9 KB] Page header
- cart-page-content.tsx        [9.8 KB] Cart page
- cart-summary-bar.tsx         [existing] Sticky bar
- checkout-form.tsx            [12.5 KB] Checkout
- menu-header.tsx              [3.9 KB] Menu header
- mini-cart.tsx                [3.9 KB] Dropdown
- promo-section.tsx            [6.6 KB] Promo codes
```

### State (src/lib/cart/)
```
- cart-store.ts                [existing] Main store
- cart-drawer-store.ts         [0.4 KB] UI state
- cart-utils.ts                [5.9 KB] Helpers
- config.ts                    [3.6 KB] Config
- index.ts                     [0.8 KB] Exports
- types.ts                     [5.5 KB] Types
```

### Pages (src/app/(public)/public/)
```
- cart/page.tsx                [0.3 KB] Cart page
- checkout-form/page.tsx       [0.3 KB] Checkout page
- checkout/page.tsx            [existing] Quick checkout
- menu/page.tsx                [existing] Menu
```

### UI (src/components/ui/)
```
- radio-group.tsx              [1.4 KB] Radix wrapper
```

### Documentation (Root)
```
- CART_QUICK_START.md          [8.2 KB] 5-min setup
- CART_CHECKOUT_GUIDE.md       [10.3 KB] Complete guide
- CART_INTEGRATION_EXAMPLES.md [11.4 KB] 12 examples
- CART_SYSTEM_FILES_SUMMARY.md [14.2 KB] File reference
- CART_CHECKOUT_IMPLEMENTATION [10.7 KB] Implementation
- CART_SYSTEM_README.md        [6.1 KB] Overview
- EXISTING_FILES_MODIFICATIONS [7.1 KB] Changes made
- CART_SYSTEM_INDEX.md         [10.9 KB] This system
- CART_NAVIGATION.md           [this file]
```

---

## 🔍 Search by Component Name

| Component | File | Purpose |
|-----------|------|---------|
| AddToCartDialog | `add-to-cart-dialog.tsx` | Modal for adding items |
| CartButton | `cart-button.tsx` | FAB with badge |
| CartDrawer | `cart-drawer.tsx` | Side panel |
| CartPageContent | `cart-page-content.tsx` | Full cart page |
| CartSummaryBar | `cart-summary-bar.tsx` | Sticky bar |
| CheckoutForm | `checkout-form.tsx` | Checkout form |
| MenuHeader | `menu-header.tsx` | Menu header |
| MiniCart | `mini-cart.tsx` | Dropdown |
| PromoSection | `promo-section.tsx` | Promo codes |
| RadioGroup | `radio-group.tsx` | UI component |

---

## 📞 Quick Links

### Getting Started (3 docs)
1. [CART_QUICK_START.md](./CART_QUICK_START.md) - 5 min setup
2. [CART_SYSTEM_README.md](./CART_SYSTEM_README.md) - Overview
3. [CART_SYSTEM_INDEX.md](./CART_SYSTEM_INDEX.md) - Full index

### Learning (3 docs)
1. [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md) - Complete guide
2. [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md) - Code examples
3. [CART_SYSTEM_FILES_SUMMARY.md](./CART_SYSTEM_FILES_SUMMARY.md) - File reference

### Reference (2 docs)
1. [EXISTING_FILES_MODIFICATIONS.md](./EXISTING_FILES_MODIFICATIONS.md) - What changed
2. [CART_CHECKOUT_IMPLEMENTATION.md](./CART_CHECKOUT_IMPLEMENTATION.md) - Details

---

## 🎯 Recommended Reading Order

### For Beginners
1. [CART_SYSTEM_README.md](./CART_SYSTEM_README.md) (5 min)
2. [CART_QUICK_START.md](./CART_QUICK_START.md) (5 min)
3. [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md) (10 min)
4. Jump to code and start building

### For Developers
1. [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md) (20 min)
2. [CART_INTEGRATION_EXAMPLES.md](./CART_INTEGRATION_EXAMPLES.md) (15 min)
3. Review component files (30 min)
4. Check types in `src/lib/cart/types.ts` (10 min)
5. Start customizing

### For Architects
1. [CART_SYSTEM_FILES_SUMMARY.md](./CART_SYSTEM_FILES_SUMMARY.md) (20 min)
2. [CART_CHECKOUT_IMPLEMENTATION.md](./CART_CHECKOUT_IMPLEMENTATION.md) (15 min)
3. Review `src/lib/cart/` files (30 min)
4. Design customizations/extensions

---

## 📊 File Size Reference

| File | Size | Type |
|------|------|------|
| checkout-form.tsx | 12.5 KB | Component |
| cart-page-content.tsx | 9.8 KB | Component |
| cart-drawer.tsx | 7.3 KB | Component |
| promo-section.tsx | 6.6 KB | Component |
| cart-utils.ts | 5.9 KB | Utility |
| CART_SYSTEM_FILES_SUMMARY.md | 14.2 KB | Doc |
| CART_CHECKOUT_GUIDE.md | 10.3 KB | Doc |
| CART_SYSTEM_INDEX.md | 10.9 KB | Doc |
| CART_INTEGRATION_EXAMPLES.md | 11.4 KB | Doc |

---

## ✅ Checklist: What to Read

- [ ] CART_SYSTEM_README.md (overview)
- [ ] CART_QUICK_START.md (5-min setup)
- [ ] CART_INTEGRATION_EXAMPLES.md (code samples)
- [ ] CART_CHECKOUT_GUIDE.md (full guide)
- [ ] src/lib/cart/types.ts (type definitions)
- [ ] src/lib/cart/config.ts (configuration)

---

**Start here:** [CART_QUICK_START.md](./CART_QUICK_START.md)

**Full guide:** [CART_CHECKOUT_GUIDE.md](./CART_CHECKOUT_GUIDE.md)

**All files:** [CART_SYSTEM_INDEX.md](./CART_SYSTEM_INDEX.md)
