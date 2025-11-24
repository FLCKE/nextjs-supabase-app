-- This migration adds restaurant_id and location_id to the orders table.

-- Add restaurant_id column
ALTER TABLE public.orders
ADD COLUMN restaurant_id UUID;

-- Add location_id column
ALTER TABLE public.orders
ADD COLUMN location_id UUID;

-- Populate existing rows (if any) with data derived from table_id.
-- This is a placeholder. In a real scenario, you'd need to carefully
-- consider how to backfill these values based on your data.
-- For new NOT NULL columns, it's often best to add them as nullable first,
-- populate them, then alter to NOT NULL.
-- For simplicity in this development context, we will first add them,
-- then populate from tables, then set NOT NULL.

UPDATE public.orders o
SET
  restaurant_id = tbl.restaurant_id,
  location_id = tbl.location_id
FROM public.tables tbl
INNER JOIN public.locations loc ON tbl.location_id = loc.id
WHERE o.table_id = tbl.id;


-- Alter columns to be NOT NULL
ALTER TABLE public.orders
ALTER COLUMN restaurant_id SET NOT NULL;

ALTER TABLE public.orders
ALTER COLUMN location_id SET NOT NULL;


-- Add foreign key constraints
ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_restaurant
FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;

ALTER TABLE public.orders
ADD CONSTRAINT fk_orders_location
FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_location_id ON public.orders(location_id);

-- DOWN: Revert the changes
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS fk_orders_restaurant,
DROP CONSTRAINT IF EXISTS fk_orders_location,
DROP COLUMN IF EXISTS restaurant_id,
DROP COLUMN IF EXISTS location_id;

DROP INDEX IF EXISTS idx_orders_restaurant_id;
DROP INDEX IF EXISTS idx_orders_location_id;
