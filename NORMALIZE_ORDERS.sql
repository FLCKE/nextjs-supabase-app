-- =====================================================
-- NORMALIZE EXISTING ORDERS WITH RESTAURANT
-- =====================================================
-- This script associates all existing orders with their restaurant
-- Run this in the Supabase SQL Editor

-- Update all orders to include restaurant_id and location_id
UPDATE public.orders o
SET 
  restaurant_id = (
    SELECT t.restaurant_id
    FROM public.tables t
    WHERE t.id = o.table_id
    LIMIT 1
  ),
  location_id = (
    SELECT t.location_id
    FROM public.tables t
    WHERE t.id = o.table_id
    LIMIT 1
  )
WHERE o.restaurant_id IS NULL OR o.location_id IS NULL;

-- Verify the update
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
