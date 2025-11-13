# 📦 Inventory Management - Quick Start

## 🚀 Setup (3 Steps)

### 1. Apply Migration
```bash
npx supabase db push
```
This creates the `inventory_adjustments` table and all required functions.

### 2. Configure Menu Items
Go to `/dashboard/menus` and set items to `FINITE` stock mode if you want to track their inventory.

### 3. Start Tracking
Visit `/dashboard/inventory` and start adding stock adjustments!

---

## 📍 Access

**Route:** `/dashboard/inventory`

**Navigation:** Dashboard → Inventory

---

## 🎯 Quick Actions

### Add Stock (Receiving Inventory)
1. Click **"Add Adjustment"**
2. Select menu item
3. Choose **"Stock In"**
4. Enter quantity (e.g., 100)
5. Add reason: "Weekly delivery"
6. Click **"Add Adjustment"**
7. ✅ Stock increased!

### Remove Stock (Sold/Used)
1. Click **"Add Adjustment"**
2. Select menu item
3. Choose **"Stock Out"**
4. Enter quantity (e.g., 25)
5. Add reason: "Lunch service sales"
6. Click **"Add Adjustment"**
7. ✅ Stock decreased!

### Record Spoilage
1. Click **"Add Adjustment"**
2. Select menu item
3. Choose **"Spoilage"**
4. Enter quantity (e.g., 5)
5. Add reason: "Expired on 2025-01-15"
6. Click **"Add Adjustment"**
7. ✅ Spoilage recorded!

---

## 📊 Understanding Stock Calculation

```
Current Stock = IN - OUT - SPOILAGE
```

### Example:
```
Monday:    IN +100  (New delivery)
Tuesday:   OUT -30  (Lunch service)
Tuesday:   OUT -25  (Dinner service)
Wednesday: SPOILAGE -5  (Expired items)
Thursday:  IN +50  (Restock)

Current Stock = (100 + 50) - (30 + 25) - (5) = 90 units
```

---

## 🎨 Stock Status Badges

| Stock Level | Badge Color | Range |
|------------|-------------|-------|
| **In Stock** | 🟢 Green | > 5 units |
| **Low Stock** | 🟡 Yellow | 1-5 units |
| **Out of Stock** | 🔴 Red | 0 units |

---

## 📋 Adjustment Types

### Stock IN (Green +)
**When to use:**
- Receiving new inventory
- Restocking from warehouse
- Delivery arrived
- Manual count correction (higher than expected)

### Stock OUT (Orange -)
**When to use:**
- Items sold to customers
- Ingredients used in preparation
- Manual count correction (lower than expected)
- Transfers to another location

### Spoilage (Red -)
**When to use:**
- Expired ingredients
- Damaged during transport
- Quality control rejection
- Food safety disposal
- Contaminated items

---

## 🔍 Using Filters

### Filter by Item
1. Go to **"Adjustment History"** tab
2. Click **"All Items"** dropdown
3. Select specific item
4. ✅ Shows only that item's history

### Filter by Type
1. Go to **"Adjustment History"** tab
2. Click **"All Types"** dropdown
3. Select IN, OUT, or SPOILAGE
4. ✅ Shows only that type

### Clear Filters
Select "All Items" and "All Types" to see everything.

---

## ⚠️ Alerts

### Low Stock Alert (Yellow)
**Triggers when:** Any item has 1-5 units remaining

**Action:**
- Review the list of low stock items
- Place orders with suppliers
- Consider marking items as unavailable temporarily

### Out of Stock Alert (Red)
**Triggers when:** Any item has 0 units

**Action:**
- Immediately order more inventory
- Mark items as out of stock in menu
- Consider switching to `HIDDEN_WHEN_OOS` mode

---

## 💡 Best Practices

### Daily Tasks
- [ ] Record stock used during service
- [ ] Check for low stock items
- [ ] Add spoilage before end of day

### Weekly Tasks
- [ ] Review stock levels
- [ ] Analyze spoilage trends
- [ ] Plan orders for next week
- [ ] Verify physical count matches system

### Monthly Tasks
- [ ] Generate inventory report
- [ ] Calculate spoilage percentage
- [ ] Identify frequently out-of-stock items
- [ ] Adjust reorder quantities

---

## 🎓 Tips & Tricks

### Tip 1: Use Descriptive Reasons
✅ Good: "Dinner service - table 15-22"  
❌ Poor: "sold"

✅ Good: "Delivery from ABC Suppliers - Invoice #123"  
❌ Poor: "new stock"

### Tip 2: Record Spoilage Immediately
Don't wait until end of day - record spoilage when it happens to maintain accurate counts.

### Tip 3: Set Stock Modes Correctly
- **FINITE:** Perishables, limited stock items
- **INFINITE:** Made-to-order, unlimited items
- **HIDDEN_WHEN_OOS:** Specialty items that should hide when unavailable

### Tip 4: Regular Physical Counts
Do physical inventory counts weekly and adjust if system count differs.

### Tip 5: Review Patterns
Look for patterns in your adjustment history:
- Which days have most stock out?
- What items spoil most often?
- Are you ordering too much/little?

---

## 🔐 Security

### Who Can Access?
- ✅ Restaurant **owners** can view and manage
- ❌ Regular users cannot access
- ✅ Multiple restaurants? Each owner sees only their own

### Data Privacy
- Inventory data is private per restaurant
- RLS ensures owners can't see other restaurants
- All adjustments are logged with timestamp

---

## 🐛 Troubleshooting

### "No items with finite stock"
**Solution:** Go to `/dashboard/menus`, edit menu items, and set `stock_mode` to `FINITE`.

### "Stock not updating"
**Checklist:**
- [ ] Migration applied?
- [ ] Item is in FINITE mode?
- [ ] Adjustment saved successfully?
- [ ] Page refreshed?

### "Can't see adjustments"
**Checklist:**
- [ ] Logged in as restaurant owner?
- [ ] Selected correct restaurant?
- [ ] Items belong to selected restaurant?
- [ ] Check adjustment history tab?

---

## 📱 Mobile Usage

The inventory system is fully responsive:

- ✅ View stock on mobile
- ✅ Add adjustments on tablet
- ✅ Check alerts on phone
- ✅ Review history anywhere

---

## 🔄 Typical Workflow

### Opening Shift
1. Review stock levels
2. Note low stock items
3. Inform kitchen staff

### During Service
1. Record significant stock usage
2. Update if items run out
3. Mark items as unavailable if needed

### Closing Shift
1. Count remaining stock
2. Record spoilage
3. Add final adjustments
4. Note items to reorder

### Receiving Delivery
1. Count delivered items
2. Add Stock IN adjustment
3. Include invoice/delivery note
4. Update stock levels

---

## 📈 Reports & Analytics

Currently showing:
- Total items tracked
- Low stock count
- Out of stock count
- Current stock per item

### Future Enhancements (Planned)
- Spoilage percentage
- Stock turnover rate
- Forecasting
- Export to CSV
- Email alerts

---

## 🆘 Need Help?

### Quick Links
- Full Guide: `INVENTORY_SYSTEM_GUIDE.md`
- Database Schema: `supabase/migrations/20251113_create_inventory_system.sql`
- Components: `src/components/inventory/`
- Actions: `src/lib/actions/inventory.ts`

### Common Questions

**Q: Can I delete adjustments?**  
A: No, adjustments are permanent for audit trail. Add a correcting adjustment if needed.

**Q: Can I edit past adjustments?**  
A: No, create a new adjustment to correct. This maintains accuracy.

**Q: How far back is history kept?**  
A: Forever! All adjustments are permanently stored.

**Q: Can I import historical data?**  
A: Use the API to bulk insert adjustments with past dates.

**Q: What about partial units (0.5kg)?**  
A: Current system uses integers. Consider tracking in smaller units (grams instead of kg).

---

## ✅ Checklist: First Day Setup

Complete these steps to start using inventory:

- [ ] Migration applied (`npx supabase db push`)
- [ ] Dev server running (`npm run dev`)
- [ ] Access `/dashboard/inventory` successfully
- [ ] Selected restaurant from dropdown
- [ ] Configured at least one item as FINITE
- [ ] Created first Stock IN adjustment
- [ ] Verified stock shows in overview
- [ ] Created Stock OUT adjustment
- [ ] Verified stock decreased
- [ ] Checked adjustment history tab
- [ ] Tested item filter
- [ ] Tested type filter
- [ ] Understand alert thresholds

---

**Ready to go!** 🚀

Start tracking your inventory and say goodbye to stockouts! 📦✨

---

**Version:** 1.0  
**Last Updated:** 2025-11-13  
**Next.js:** 16.0.1  
**Status:** ✅ Production Ready
