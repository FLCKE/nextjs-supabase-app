-- Migration: Remove Multi-Location Support
-- Description: Consolidates location data into restaurants table and removes the locations table.
-- All restaurants will now have a single location with address/phone fields directly on the restaurant.

BEGIN;

-- Step 1: Add location fields to restaurants table
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Step 2: Migrate location data to restaurants (taking first location per restaurant)
UPDATE public.restaurants r
SET
  address = COALESCE(address, ''),
  phone = COALESCE(phone, ''),
  timezone = COALESCE(
    (SELECT timezone FROM public.locations WHERE restaurant_id = r.id ORDER BY created_at ASC LIMIT 1),
    'UTC'
  )
WHERE timezone = 'UTC';

-- Step 3: Remove location_id FK from tables, then drop the column
ALTER TABLE public.tables
DROP CONSTRAINT IF EXISTS fk_tables_location;

-- Step 4: Remove location_id FK from orders, then drop the column
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS fk_orders_location;

ALTER TABLE public.orders
DROP COLUMN IF EXISTS location_id;

-- Remove the index on location_id in orders
DROP INDEX IF EXISTS public.idx_orders_location_id;

-- Step 5: Drop the locations table
DROP TABLE IF EXISTS public.locations CASCADE;

-- Step 6: Drop location_id from tables (if not already dropped by CASCADE)
ALTER TABLE public.tables
DROP COLUMN IF EXISTS location_id;

-- Step 7: Add restaurant_id to tables if it doesn't exist
-- Note: This assumes tables may need direct restaurant reference
ALTER TABLE public.tables
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for restaurant_id on tables
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);

COMMIT;
