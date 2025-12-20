-- =====================================================
-- INSERT TEST ORDERS WITH RESTAURANT NORMALIZATION
-- =====================================================
-- This script creates 3 test orders per restaurant
-- Each order is properly associated with its restaurant and location
-- Run this in the Supabase SQL Editor

-- Step 1: Get restaurant and location data
WITH restaurant_data AS (
  SELECT 
    r.id as restaurant_id,
    l.id as location_id
  FROM public.restaurants r
  LEFT JOIN public.locations l ON l.restaurant_id = r.id
  WHERE l.id IS NOT NULL
  LIMIT 1
),

-- Step 2: Create 3 test tables for this restaurant
tables_data AS (
  INSERT INTO public.tables (location_id, label)
  SELECT 
    rd.location_id,
    'Table ' || (row_number() OVER (ORDER BY num))::text
  FROM restaurant_data rd
  CROSS JOIN (SELECT generate_series(1, 3) as num) series
  RETURNING id as table_id
)

-- Step 3: Insert 3 test orders with restaurant normalization
INSERT INTO public.orders (
  table_id,
  restaurant_id,
  location_id,
  status,
  total_net_cts,
  taxes_cts,
  total_gross_cts,
  notes,
  currency,
  created_at
)
SELECT
  td.table_id,
  rd.restaurant_id,
  rd.location_id,
  'PENDING',
  2500,
  250,
  2750,
  'Burger & Fries',
  'USD',
  NOW() - INTERVAL '5 minutes'
FROM tables_data td
CROSS JOIN restaurant_data rd
UNION ALL
SELECT
  td.table_id,
  rd.restaurant_id,
  rd.location_id,
  'PENDING',
  3200,
  320,
  3520,
  'Pizza & Salad',
  'USD',
  NOW() - INTERVAL '2 minutes'
FROM tables_data td
CROSS JOIN restaurant_data rd
UNION ALL
SELECT
  td.table_id,
  rd.restaurant_id,
  rd.location_id,
  'PENDING',
  1800,
  180,
  1980,
  'Pasta Carbonara',
  'USD',
  NOW()
FROM tables_data td
CROSS JOIN restaurant_data rd;

-- Verify the orders were created with restaurant association
SELECT 
  o.id,
  r.name as restaurant,
  o.status,
  ROUND(o.total_gross_cts / 100.0, 2) as amount,
  o.notes,
  o.created_at
FROM public.orders o
JOIN public.restaurants r ON o.restaurant_id = r.id
ORDER BY o.created_at DESC
LIMIT 3;
