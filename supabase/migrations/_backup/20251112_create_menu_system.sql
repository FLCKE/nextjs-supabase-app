-- Create menus table
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create menu_items table
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

-- Create indexes for better query performance
CREATE INDEX idx_menus_restaurant_id ON public.menus(restaurant_id);
CREATE INDEX idx_menus_is_active ON public.menus(is_active);
CREATE INDEX idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX idx_menu_items_active ON public.menu_items(active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menus
-- Allow users to view menus for restaurants they own or staff at
CREATE POLICY "Users can view menus for their restaurants"
  ON public.menus
  FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Allow users to insert menus for restaurants they own
CREATE POLICY "Users can create menus for their restaurants"
  ON public.menus
  FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Allow users to update menus for restaurants they own
CREATE POLICY "Users can update menus for their restaurants"
  ON public.menus
  FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- Allow users to delete menus for restaurants they own
CREATE POLICY "Users can delete menus for their restaurants"
  ON public.menus
  FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for menu_items
-- Allow users to view menu items for their restaurant menus
CREATE POLICY "Users can view menu items for their restaurants"
  ON public.menu_items
  FOR SELECT
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow users to insert menu items for their restaurant menus
CREATE POLICY "Users can create menu items for their restaurants"
  ON public.menu_items
  FOR INSERT
  WITH CHECK (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow users to update menu items for their restaurant menus
CREATE POLICY "Users can update menu items for their restaurants"
  ON public.menu_items
  FOR UPDATE
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow users to delete menu items for their restaurant menus
CREATE POLICY "Users can delete menu items for their restaurants"
  ON public.menu_items
  FOR DELETE
  USING (
    menu_id IN (
      SELECT m.id FROM public.menus m
      INNER JOIN public.restaurants r ON m.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for menu-images bucket
-- Note: Using path_tokens[1] to get first folder (menu_id)
CREATE POLICY "Users can upload menu images for their restaurants"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'menu-images' AND
    auth.uid() IN (
      SELECT r.owner_id FROM public.restaurants r
      INNER JOIN public.menus m ON m.restaurant_id = r.id
      WHERE (string_to_array(storage.objects.name, '/'))[1] = m.id::text
    )
  );

CREATE POLICY "Users can update menu images for their restaurants"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() IN (
      SELECT r.owner_id FROM public.restaurants r
      INNER JOIN public.menus m ON m.restaurant_id = r.id
      WHERE (string_to_array(storage.objects.name, '/'))[1] = m.id::text
    )
  );

CREATE POLICY "Users can delete menu images for their restaurants"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'menu-images' AND
    auth.uid() IN (
      SELECT r.owner_id FROM public.restaurants r
      INNER JOIN public.menus m ON m.restaurant_id = r.id
      WHERE (string_to_array(storage.objects.name, '/'))[1] = m.id::text
    )
  );

CREATE POLICY "Menu images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');
