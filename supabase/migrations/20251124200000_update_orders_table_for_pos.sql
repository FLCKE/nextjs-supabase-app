-- Update orders table to support Staff POS requirements

-- Step 1: Add new columns to the orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_location_id ON public.orders(location_id);

-- Step 3: Update the updated_at trigger to also set changed_at (if we rename updated_at)
-- The user mentioned changed_at, but updated_at is standard. We will assume updated_at is sufficient.
-- If changed_by is updated, the existing handle_updated_at trigger will fire.

-- Step 4: Add new RLS policies for Staff
-- This policy allows staff members to view orders for the restaurant they are assigned to.
DROP POLICY IF EXISTS "staff_can_select_orders" ON public.orders;
CREATE POLICY "staff_can_select_orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'staff'
    )
  );

-- This policy allows staff members to insert orders for their assigned restaurant.
-- It checks that the restaurant_id in the new order matches their assigned restaurant.
DROP POLICY IF EXISTS "staff_can_insert_orders" ON public.orders;
CREATE POLICY "staff_can_insert_orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT restaurant_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'staff'
    )
  );

-- Note: We are keeping the old policies for owners for now, but they could be updated
-- to use the new restaurant_id column for consistency.
-- The public insert policy is also kept, assuming it's for customers ordering from a table QR code.
-- We might need a separate policy for staff to UPDATE orders.
DROP POLICY IF EXISTS "staff_can_update_orders" ON public.orders;
CREATE POLICY "staff_can_update_orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (
        restaurant_id IN (
            SELECT restaurant_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'staff'
        )
    )
    WITH CHECK (
        restaurant_id IN (
            SELECT restaurant_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'staff'
        )
    );

-- We also need policies for order_items for staff
DROP POLICY IF EXISTS "staff_can_select_order_items" ON public.order_items;
CREATE POLICY "staff_can_select_order_items"
    ON public.order_items
    FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM public.orders
            WHERE restaurant_id IN (
                SELECT restaurant_id FROM public.profiles
                WHERE id = auth.uid() AND role = 'staff'
            )
        )
    );

DROP POLICY IF EXISTS "staff_can_insert_order_items" ON public.order_items;
CREATE POLICY "staff_can_insert_order_items"
    ON public.order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        order_id IN (
            SELECT id FROM public.orders
            WHERE restaurant_id IN (
                SELECT restaurant_id FROM public.profiles
                WHERE id = auth.uid() AND role = 'staff'
            )
        )
    );

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
