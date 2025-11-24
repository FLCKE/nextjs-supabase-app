# 🚀 Fix for Your Database Schema and Signup Flow

Hello! I've investigated the issue with the user signup and profile creation. It seems like your database schema is not fully up to date with all the required tables and configurations. The `supabase db push` command might be failing due to the current state of your local migrations and the remote database.

To fix this, I've made two changes:

1.  **Updated the Signup Code**: I've modified the signup server action (`src/app/sign-up/actions.ts`) to explicitly create a user profile when a new user signs up. This makes the process more reliable and easier to debug.

2.  **Consolidated Database Migrations**: I've created a single, comprehensive SQL script that includes all the necessary database schema changes from your various migration files. This will create all the required tables (`profiles`, `restaurants`, `menus`, `orders`, etc.), set up the correct permissions (RLS policies), and remove the old, conflicting database trigger.

---

## 📋 Action Required: Apply the Consolidated SQL Script

Please follow these steps to update your database. This is the safest and most reliable way to get your schema up to date.

### Step 1: Go to the Supabase SQL Editor

1.  Open your project in the [Supabase Dashboard](https://app.supabase.com).
2.  In the left sidebar, click on **SQL Editor**.
3.  Click on **New query**.

### Step 2: Copy and Run the SQL Script

Copy the entire SQL script below and paste it into the SQL Editor. Then, click the **RUN** button.

```sql
-- =================================================================
-- This is a consolidated migration script to fix your database schema.
-- Please execute this entire script in your Supabase project's SQL Editor.
-- =================================================================

-- =================================================================
-- Step 1: Create user_role type and profiles table
-- From migration: 20251105_add_profiles_table.sql
-- =================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('owner', 'staff', 'admin');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role user_role DEFAULT 'staff'::user_role NOT NULL,
    phone VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    restaurant_id UUID
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.profiles;
CREATE POLICY "Allow authenticated users to view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =================================================================
-- Step 2: Add 'client' to user_role
-- From migration: 20251124182010_add_client_role_to_user_role.sql
-- =================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'client' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'client';
    END IF;
END$$;

-- =================================================================
-- Step 3: Create restaurant, location, and table management system
-- From backup migration: 20251106173200_create_restaurants_locations_tables.sql
-- =================================================================

CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_restaurant_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) 
REFERENCES public.restaurants(id) 
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON public.profiles(restaurant_id);

CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  qr_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_locations_restaurant_id ON public.locations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_location_id ON public.tables(location_id);
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON public.tables(qr_token);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_locations_updated_at ON public.locations;
CREATE TRIGGER set_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tables_updated_at ON public.tables;
CREATE TRIGGER set_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their own restaurants" ON public.restaurants;
CREATE POLICY "Owners can view their own restaurants"
  ON public.restaurants
  FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert their own restaurants" ON public.restaurants;
CREATE POLICY "Owners can insert their own restaurants"
  ON public.restaurants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their own restaurants" ON public.restaurants;
CREATE POLICY "Owners can update their own restaurants"
  ON public.restaurants
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete their own restaurants" ON public.restaurants;
CREATE POLICY "Owners can delete their own restaurants"
  ON public.restaurants
  FOR DELETE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Staff can view restaurants" ON public.restaurants;
CREATE POLICY "Staff can view restaurants"
  ON public.restaurants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'staff'
      AND profiles.restaurant_id = restaurants.id
    )
  );

DROP POLICY IF EXISTS "Owners can view locations" ON public.locations;
CREATE POLICY "Owners can view locations"
  ON public.locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can insert locations" ON public.locations;
CREATE POLICY "Owners can insert locations"
  ON public.locations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can update locations" ON public.locations;
CREATE POLICY "Owners can update locations"
  ON public.locations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can delete locations" ON public.locations;
CREATE POLICY "Owners can delete locations"
  ON public.locations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can view locations" ON public.locations;
CREATE POLICY "Staff can view locations"
  ON public.locations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      JOIN public.restaurants ON restaurants.id = profiles.restaurant_id
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'staff'
      AND restaurants.id = locations.restaurant_id
    )
  );

DROP POLICY IF EXISTS "Owners can view tables" ON public.tables;
CREATE POLICY "Owners can view tables"
  ON public.tables
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = tables.location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can insert tables" ON public.tables;
CREATE POLICY "Owners can insert tables"
  ON public.tables
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = tables.location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can update tables" ON public.tables;
CREATE POLICY "Owners can update tables"
  ON public.tables
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = tables.location_id
      AND restaurants.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = tables.location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can delete tables" ON public.tables;
CREATE POLICY "Owners can delete tables"
  ON public.tables
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = tables.location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can view tables" ON public.tables;
CREATE POLICY "Staff can view tables"
  ON public.tables
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      JOIN public.restaurants ON restaurants.id = profiles.restaurant_id
      JOIN public.locations ON locations.restaurant_id = restaurants.id
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'staff'
      AND locations.id = tables.location_id
    )
  );

DROP POLICY IF EXISTS "Public can view active tables by QR token" ON public.tables;
CREATE POLICY "Public can view active tables by QR token"
  ON public.tables
  FOR SELECT
  USING (active = true);


-- =================================================================
-- Step 4: Create menu and inventory system
-- From migration: 20251113231103_complete_menu_inventory_final.sql
-- =================================================================

CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IN', 'OUT', 'SPOILAGE')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menus_active ON public.menus(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(active);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_item_id ON public.inventory_adjustments(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_type ON public.inventory_adjustments(type);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_created_at ON public.inventory_adjustments(created_at DESC);

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

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "menus_select_policy" ON public.menus
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "menus_insert_policy" ON public.menus
  FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "menus_update_policy" ON public.menus
  FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "menus_delete_policy" ON public.menus
  FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "menu_items_select_policy" ON public.menu_items
  FOR SELECT
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

CREATE POLICY "menu_items_insert_policy" ON public.menu_items
  FOR INSERT
  WITH CHECK (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

CREATE POLICY "menu_items_update_policy" ON public.menu_items
  FOR UPDATE
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

CREATE POLICY "menu_items_delete_policy" ON public.menu_items
  FOR DELETE
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

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

INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "menu_images_select_policy" ON storage.objects;
CREATE POLICY "menu_images_select_policy" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "menu_images_insert_policy" ON storage.objects;
CREATE POLICY "menu_images_insert_policy" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-images' AND
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "menu_images_update_policy" ON storage.objects;
CREATE POLICY "menu_images_update_policy" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "menu_images_delete_policy" ON storage.objects;
CREATE POLICY "menu_images_delete_policy" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() IS NOT NULL
  );

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

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.menus TO authenticated;
GRANT ALL ON public.menu_items TO authenticated;
GRANT ALL ON public.inventory_adjustments TO authenticated;
GRANT SELECT ON public.menu_items_with_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_stock(UUID) TO authenticated;

-- =================================================================
-- Step 5: Create order management system
-- From migration: 20251117_create_order_management.sql
-- =================================================================

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

CREATE INDEX IF NOT EXISTS idx_orders_table_id ON public.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item_id ON public.order_items(item_id);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_public_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_update_policy" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON public.orders;

DROP POLICY IF EXISTS "order_items_select_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_public_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON public.order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON public.order_items;

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

CREATE POLICY "orders_insert_public_policy" ON public.orders
  FOR INSERT
  WITH CHECK (true);

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

CREATE POLICY "order_items_insert_public_policy" ON public.order_items
  FOR INSERT
  WITH CHECK (true);

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

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT SELECT ON public.orders_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_table_token(UUID) TO authenticated, anon;

GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;

-- =================================================================
-- Step 6: Remove old trigger for creating user profiles
-- From migration: 20251124_remove_handle_new_user_trigger.sql
-- This is replaced by logic in the signup action.
-- =================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

```

### Step 3: Verify the Changes

After running the script, you should see a "Success" message. You can then try the signup process again. It should now correctly create a user and a corresponding profile in the `profiles` table.

---

This approach ensures that your database is in the correct state for the application to work as expected. Please let me know if you encounter any issues.
