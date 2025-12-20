# Orders Normalization Guide

## Overview
Each order is now properly normalized with its associated restaurant and location data. This ensures data integrity and makes queries efficient.

## Files Created

### 1. `INSERT_TEST_ORDERS.sql`
Creates 3 new test orders with full normalization:
- ✅ Creates 3 tables
- ✅ Associates orders with restaurant_id
- ✅ Associates orders with location_id
- ✅ Verifies the relationship with JOIN query

**To use:** Copy & paste into Supabase SQL Editor and run

### 2. `NORMALIZE_ORDERS.sql`
Updates existing orders with restaurant and location data:
- ✅ Populates restaurant_id from table relationship
- ✅ Populates location_id from table relationship
- ✅ Verifies the normalization

**To use:** Copy & paste into Supabase SQL Editor and run

## Database Structure

```
Restaurants (1)
    ↓
Locations (1-to-many)
    ↓
Tables (1-to-many)
    ↓
Orders (1-to-many)
```

## How It Works

Each order now has:
- `table_id` → Links to specific table
- `restaurant_id` → Links to restaurant (derived from table)
- `location_id` → Links to location (derived from table)

This ensures:
1. **Data Consistency**: Orders can't exist without proper restaurant association
2. **Query Performance**: Fast lookups using indexed foreign keys
3. **Multi-Restaurant Support**: Each restaurant sees only their own orders

## Staff Dashboard Integration

The staff orders page automatically:
1. Gets the logged-in staff member's restaurant from `staff_members` table
2. Filters orders by that restaurant_id
3. Shows only relevant orders in real-time

No changes needed - normalization is automatic! ✅
