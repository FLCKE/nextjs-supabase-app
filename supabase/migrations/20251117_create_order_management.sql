-- Order Management System for WEGO RestoPay
-- Allows public order creation via table_token
-- Dashboard access restricted to restaurant owners and staff

-- =====================================================
-- 1. CREATE ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAYING', 'PAID', 'SERVED', 'CANCELLED', 'REFUNDED')),
  currency TEXT NOT NULL DEFAULT 'USD',
  total_net_cts INTEGER NOT NULL DEFAULT 0 CHECK (total_net_cts >= 0),
  taxes_cts INTEGER NOT NULL DEFAULT 0 CHECK (taxes_cts >= 0),
  total_gross_cts INTEGER NOT NULL DEFAULT 0 CHECK (total_gross_cts >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. CREATE ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  name TEXT NOT NULL, -- Snapshot of menu item name
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price_cts INTEGER NOT NULL CHECK (unit_price_cts >= 0),
  total_price_cts INTEGER NOT NULL CHECK (total_price_cts >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON public.order_items(item_id);

-- =====================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. DROP EXISTING POLICIES (if any)
-- =====================================================
DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_public_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON public.orders;

DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_public_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON public.order_items;

-- =====================================================
-- 7. CREATE RLS POLICIES FOR ORDERS
-- =====================================================
-- Allow restaurant owners/staff to view orders from their tables
CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT
  USING (
    table_id IN (
      SELECT t.id FROM public.tables t
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow public order creation via table_token (no auth required)
-- This will be validated in the server action
CREATE POLICY "orders_insert_public_policy" ON public.orders
  FOR INSERT
  WITH CHECK (true); -- Server action validates table_token

-- Allow restaurant owners/staff to update orders
CREATE POLICY "orders_update_policy" ON public.orders
  FOR UPDATE
  USING (
    table_id IN (
      SELECT t.id FROM public.tables t
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners/staff to delete orders
CREATE POLICY "orders_delete_policy" ON public.orders
  FOR DELETE
  USING (
    table_id IN (
      SELECT t.id FROM public.tables t
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 8. CREATE RLS POLICIES FOR ORDER_ITEMS
-- =====================================================
-- Allow restaurant owners/staff to view order items
CREATE POLICY "order_items_select_policy" ON public.order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      INNER JOIN public.tables t ON o.table_id = t.id
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow public order item creation (validated via order creation)
CREATE POLICY "order_items_insert_public_policy" ON public.order_items
  FOR INSERT
  WITH CHECK (true); -- Server action validates via parent order

-- Allow restaurant owners/staff to update order items
CREATE POLICY "order_items_update_policy" ON public.order_items
  FOR UPDATE
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      INNER JOIN public.tables t ON o.table_id = t.id
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners/staff to delete order items
CREATE POLICY "order_items_delete_policy" ON public.order_items
  FOR DELETE
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      INNER JOIN public.tables t ON o.table_id = t.id
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 9. CREATE VIEW FOR ORDERS WITH DETAILS
-- =====================================================
DROP VIEW IF EXISTS public.orders_with_details;
CREATE VIEW public.orders_with_details AS
SELECT
  o.*,
  t.label AS table_label,
  l.name AS location_name,
  r.id AS restaurant_id,
  r.name AS restaurant_name,
  COUNT(oi.id) AS item_count
FROM public.orders o
INNER JOIN public.tables t ON o.table_id = t.id
INNER JOIN public.locations l ON t.location_id = l.id
INNER JOIN public.restaurants r ON l.restaurant_id = r.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, t.label, l.name, r.id, r.name;

-- =====================================================
-- 10. CREATE FUNCTION TO VALIDATE TABLE TOKEN
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_table_token(p_table_token UUID)
RETURNS TABLE (
  table_id UUID,
  location_id UUID,
  restaurant_id UUID,
  currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS table_id,
    l.id AS location_id,
    r.id AS restaurant_id,
    r.currency
  FROM public.tables t
  INNER JOIN public.locations l ON t.location_id = l.id
  INNER JOIN public.restaurants r ON l.restaurant_id = r.id
  WHERE t.qr_token = p_table_token
    AND t.active = true;
END;
$$;

-- =====================================================
-- 11. GRANT NECESSARY PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT SELECT ON public.orders_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_table_token(UUID) TO authenticated, anon;

-- Allow anonymous users to insert orders and order_items
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;
