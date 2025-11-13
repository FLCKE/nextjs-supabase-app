-- Complete Menu & Inventory System for WEGO RestoPay MVP
-- This migration creates the complete menu and inventory management system

-- =====================================================
-- 1. CREATE MENUS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. CREATE MENU_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cts INTEGER NOT NULL CHECK (price_cts >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate NUMERIC(5,2) DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  stock_mode TEXT NOT NULL DEFAULT 'INFINITE' CHECK (stock_mode IN ('FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS')),
  stock_qty INTEGER DEFAULT 0 CHECK (stock_qty >= 0),
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. CREATE INVENTORY_ADJUSTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'SPOILAGE')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_active ON public.menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(active);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_item_id ON public.inventory_adjustments(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON public.inventory_adjustments(type);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON public.inventory_adjustments(created_at DESC);

-- =====================================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS set_menus_updated_at ON public.menus;
CREATE TRIGGER set_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. DROP EXISTING POLICIES (if any)
-- =====================================================
DROP POLICY IF EXISTS "menus_select_policy" ON public.menus;
DROP POLICY IF EXISTS "menus_insert_policy" ON public.menus;
DROP POLICY IF EXISTS "menus_update_policy" ON public.menus;
DROP POLICY IF EXISTS "menus_delete_policy" ON public.menus;

DROP POLICY IF EXISTS "menu_items_select_policy" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_insert_policy" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_update_policy" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_delete_policy" ON public.menu_items;

DROP POLICY IF EXISTS "inventory_adjustments_select_policy" ON public.inventory_adjustments;
DROP POLICY IF EXISTS "inventory_adjustments_insert_policy" ON public.inventory_adjustments;
DROP POLICY IF EXISTS "inventory_adjustments_update_policy" ON public.inventory_adjustments;
DROP POLICY IF EXISTS "inventory_adjustments_delete_policy" ON public.inventory_adjustments;

-- =====================================================
-- 8. CREATE RLS POLICIES FOR MENUS
-- =====================================================
-- Allow restaurant owners to view their menus
CREATE POLICY "menus_select_policy" ON public.menus
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to insert menus
CREATE POLICY "menus_insert_policy" ON public.menus
  FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to update their menus
CREATE POLICY "menus_update_policy" ON public.menus
  FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to delete their menus
CREATE POLICY "menus_delete_policy" ON public.menus
  FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

-- =====================================================
-- 9. CREATE RLS POLICIES FOR MENU_ITEMS
-- =====================================================
-- Allow restaurant owners to view menu items
CREATE POLICY "menu_items_select_policy" ON public.menu_items
  FOR SELECT
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to insert menu items
CREATE POLICY "menu_items_insert_policy" ON public.menu_items
  FOR INSERT
  WITH CHECK (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to update menu items
CREATE POLICY "menu_items_update_policy" ON public.menu_items
  FOR UPDATE
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to delete menu items
CREATE POLICY "menu_items_delete_policy" ON public.menu_items
  FOR DELETE
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 10. CREATE RLS POLICIES FOR INVENTORY_ADJUSTMENTS
-- =====================================================
-- Allow restaurant owners to view inventory adjustments
CREATE POLICY "inventory_adjustments_select_policy" ON public.inventory_adjustments
  FOR SELECT
  USING (
    item_id IN (
      SELECT mi.id FROM public.menu_items mi
      INNER JOIN public.menus m ON mi.menu_id = m.id
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to insert inventory adjustments
CREATE POLICY "inventory_adjustments_insert_policy" ON public.inventory_adjustments
  FOR INSERT
  WITH CHECK (
    item_id IN (
      SELECT mi.id FROM public.menu_items mi
      INNER JOIN public.menus m ON mi.menu_id = m.id
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to update inventory adjustments
CREATE POLICY "inventory_adjustments_update_policy" ON public.inventory_adjustments
  FOR UPDATE
  USING (
    item_id IN (
      SELECT mi.id FROM public.menu_items mi
      INNER JOIN public.menus m ON mi.menu_id = m.id
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow restaurant owners to delete inventory adjustments
CREATE POLICY "inventory_adjustments_delete_policy" ON public.inventory_adjustments
  FOR DELETE
  USING (
    item_id IN (
      SELECT mi.id FROM public.menu_items mi
      INNER JOIN public.menus m ON mi.menu_id = m.id
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 11. CREATE STORAGE BUCKET FOR MENU IMAGES
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. CREATE STORAGE POLICIES FOR MENU IMAGES
-- =====================================================
-- Allow anyone to view menu images (public bucket)
DROP POLICY IF EXISTS "menu_images_select_policy" ON storage.objects;
CREATE POLICY "menu_images_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');

-- Allow restaurant owners to upload menu images for their restaurants
DROP POLICY IF EXISTS "menu_images_insert_policy" ON storage.objects;
CREATE POLICY "menu_images_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-images' AND
    auth.uid() IS NOT NULL
  );

-- Allow restaurant owners to update their menu images
DROP POLICY IF EXISTS "menu_images_update_policy" ON storage.objects;
CREATE POLICY "menu_images_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() IS NOT NULL
  );

-- Allow restaurant owners to delete their menu images
DROP POLICY IF EXISTS "menu_images_delete_policy" ON storage.objects;
CREATE POLICY "menu_images_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() IS NOT NULL
  );

-- =====================================================
-- 13. CREATE HELPER FUNCTION FOR CURRENT STOCK
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_current_stock(p_item_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN type IN ('OUT', 'SPOILAGE') THEN quantity ELSE 0 END), 0)
  INTO v_stock
  FROM public.inventory_adjustments
  WHERE item_id = p_item_id;
  
  RETURN COALESCE(v_stock, 0);
END;
$$;

-- =====================================================
-- 14. CREATE VIEW FOR MENU ITEMS WITH STOCK
-- =====================================================
DROP VIEW IF EXISTS public.menu_items_with_stock;
CREATE VIEW public.menu_items_with_stock AS
SELECT 
  mi.*,
  m.restaurant_id,
  CASE 
    WHEN mi.stock_mode = 'FINITE' THEN (
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type IN ('OUT', 'SPOILAGE') THEN quantity ELSE 0 END), 0)
      FROM public.inventory_adjustments
      WHERE item_id = mi.id
    )
    ELSE NULL
  END AS current_stock
FROM public.menu_items mi
INNER JOIN public.menus m ON mi.menu_id = m.id;

-- =====================================================
-- 15. GRANT NECESSARY PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.menus TO authenticated;
GRANT ALL ON public.menu_items TO authenticated;
GRANT ALL ON public.inventory_adjustments TO authenticated;
GRANT SELECT ON public.menu_items_with_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_stock(UUID) TO authenticated;
