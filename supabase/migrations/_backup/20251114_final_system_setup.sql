-- ============================================================================
-- FINAL SYSTEM SETUP - Menu, Inventory, and Fixes
-- Date: 2025-11-14
-- Description: Complete menu and inventory system with all policies
-- ============================================================================

-- ============================================================================
-- PART 0: ADD CLIENT ROLE TO PROFILES
-- ============================================================================

-- Add 'client' to user_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('owner', 'staff', 'admin', 'client');
  ELSE
    -- Add 'client' to existing enum if not already present
    BEGIN
      ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'client';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Update profiles table user_id column if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
  END IF;
END $$;

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Owners can manage their restaurant menus" ON public.menus;
DROP POLICY IF EXISTS "Owners can view their restaurant menus" ON public.menus;
DROP POLICY IF EXISTS "Public can view active menus" ON public.menus;
DROP POLICY IF EXISTS "Owners can create menus for their restaurants" ON public.menus;
DROP POLICY IF EXISTS "Owners can update their restaurant menus" ON public.menus;
DROP POLICY IF EXISTS "Owners can delete their restaurant menus" ON public.menus;

DROP POLICY IF EXISTS "Owners can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners can view their menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners can create menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Owners can delete menu items" ON public.menu_items;

DROP POLICY IF EXISTS "Owners can view inventory adjustments" ON public.inventory_adjustments;
DROP POLICY IF EXISTS "Owners can create inventory adjustments" ON public.inventory_adjustments;

-- ============================================================================
-- CREATE TABLES (IF NOT EXISTS)
-- ============================================================================

-- Menus table
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cts INTEGER NOT NULL CHECK (price_cts >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  stock_mode TEXT NOT NULL DEFAULT 'INFINITE' CHECK (stock_mode IN ('FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS')),
  stock_qty INTEGER CHECK (stock_qty >= 0),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory adjustments table
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'SPOILAGE')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_is_active ON public.menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(active);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_item_id ON public.inventory_adjustments(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON public.inventory_adjustments(type);

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

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

-- ============================================================================
-- RLS POLICIES - MENUS
-- ============================================================================

CREATE POLICY "Owners can view their restaurant menus"
  ON public.menus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE r.id = menus.restaurant_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can create menus for their restaurants"
  ON public.menus FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE r.id = menus.restaurant_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can update their restaurant menus"
  ON public.menus FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE r.id = menus.restaurant_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete their restaurant menus"
  ON public.menus FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE r.id = menus.restaurant_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Public can view active menus"
  ON public.menus FOR SELECT
  USING (is_active = true);

-- ============================================================================
-- RLS POLICIES - MENU ITEMS
-- ============================================================================

CREATE POLICY "Owners can view their menu items"
  ON public.menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.menus m
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE m.id = menu_items.menu_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can create menu items"
  ON public.menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.menus m
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE m.id = menu_items.menu_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can update menu items"
  ON public.menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.menus m
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE m.id = menu_items.menu_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete menu items"
  ON public.menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.menus m
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE m.id = menu_items.menu_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Public can view active menu items"
  ON public.menu_items FOR SELECT
  USING (
    active = true
    AND EXISTS (
      SELECT 1 FROM public.menus m
      WHERE m.id = menu_items.menu_id AND m.is_active = true
    )
  );

-- ============================================================================
-- RLS POLICIES - INVENTORY ADJUSTMENTS
-- ============================================================================

CREATE POLICY "Owners can view inventory adjustments"
  ON public.inventory_adjustments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_items mi
      INNER JOIN public.menus m ON m.id = mi.menu_id
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE mi.id = inventory_adjustments.item_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

CREATE POLICY "Owners can create inventory adjustments"
  ON public.inventory_adjustments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.menu_items mi
      INNER JOIN public.menus m ON m.id = mi.menu_id
      INNER JOIN public.restaurants r ON r.id = m.restaurant_id
      INNER JOIN public.profiles p ON p.user_id = r.owner_id
      WHERE mi.id = inventory_adjustments.item_id
        AND p.user_id = auth.uid()
        AND p.role = 'owner'
    )
  );

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Owners can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete menu images" ON storage.objects;

CREATE POLICY "Owners can upload menu images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'owner'
    )
  );

CREATE POLICY "Public can view menu images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

CREATE POLICY "Owners can delete menu images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'owner'
    )
  );

-- ============================================================================
-- HELPER VIEW FOR STOCK CALCULATIONS
-- ============================================================================

CREATE OR REPLACE VIEW public.menu_item_stock AS
SELECT 
  mi.id AS item_id,
  mi.name AS item_name,
  mi.stock_mode,
  mi.stock_qty AS manual_stock_qty,
  COALESCE(
    SUM(CASE WHEN ia.type = 'IN' THEN ia.quantity ELSE 0 END) -
    SUM(CASE WHEN ia.type = 'OUT' THEN ia.quantity ELSE 0 END) -
    SUM(CASE WHEN ia.type = 'SPOILAGE' THEN ia.quantity ELSE 0 END),
    0
  ) AS calculated_stock,
  CASE 
    WHEN mi.stock_mode = 'FINITE' THEN 
      COALESCE(
        SUM(CASE WHEN ia.type = 'IN' THEN ia.quantity ELSE 0 END) -
        SUM(CASE WHEN ia.type = 'OUT' THEN ia.quantity ELSE 0 END) -
        SUM(CASE WHEN ia.type = 'SPOILAGE' THEN ia.quantity ELSE 0 END),
        0
      )
    ELSE NULL
  END AS current_stock,
  m.id AS menu_id,
  m.restaurant_id
FROM public.menu_items mi
INNER JOIN public.menus m ON m.id = mi.menu_id
LEFT JOIN public.inventory_adjustments ia ON ia.item_id = mi.id
GROUP BY mi.id, mi.name, mi.stock_mode, mi.stock_qty, m.id, m.restaurant_id;

GRANT SELECT ON public.menu_item_stock TO authenticated, anon;
