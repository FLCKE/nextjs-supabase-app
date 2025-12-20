-- =====================================================
-- ADD RESTAURANT_ID AND LOCATION_ID TO ORDERS TABLE
-- =====================================================
-- This migration adds the missing restaurant_id and location_id columns
-- Run this FIRST before running the normalization script

-- Step 1: Add restaurant_id column
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS restaurant_id UUID;

-- Step 2: Add location_id column  
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS location_id UUID;

-- Step 3: Populate the new columns from table relationships
-- Get restaurant_id and location_id from the tables
UPDATE public.orders o
SET 
  restaurant_id = COALESCE(
    (SELECT l.restaurant_id FROM public.tables t 
     INNER JOIN public.locations l ON t.location_id = l.id 
     WHERE t.id = o.table_id LIMIT 1),
    restaurant_id
  ),
  location_id = COALESCE(
    (SELECT t.location_id FROM public.tables t 
     WHERE t.id = o.table_id LIMIT 1),
    location_id
  );

-- Step 4: Add foreign key constraints
ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_restaurant_id 
  FOREIGN KEY (restaurant_id) 
  REFERENCES public.restaurants(id) 
  ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_location_id 
  FOREIGN KEY (location_id) 
  REFERENCES public.locations(id) 
  ON DELETE CASCADE;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_location_id ON public.orders(location_id);

-- Step 6: Verify the changes
SELECT 
  o.id,
  r.name as restaurant,
  l.name as location,
  o.status,
  ROUND(o.total_gross_cts / 100.0, 2) as amount,
  o.notes,
  o.created_at
FROM public.orders o
LEFT JOIN public.restaurants r ON o.restaurant_id = r.id
LEFT JOIN public.locations l ON o.location_id = l.id
ORDER BY o.created_at DESC;
