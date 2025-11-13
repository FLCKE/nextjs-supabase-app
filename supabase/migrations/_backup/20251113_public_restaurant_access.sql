-- Allow public read access to restaurants
-- This allows anyone (signed in or not) to view restaurants

-- Public can view all active restaurants
CREATE POLICY "Anyone can view active restaurants"
  ON public.restaurants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public can view all active menus
CREATE POLICY "Anyone can view active menus"
  ON public.menus
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Public can view all active menu items
CREATE POLICY "Anyone can view active menu items"
  ON public.menu_items
  FOR SELECT
  TO anon, authenticated
  USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM public.menus m
      WHERE m.id = menu_id AND m.is_active = true
    )
  );

-- Update storage policy to allow public read of menu images
CREATE POLICY "Anyone can view menu images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'menu-images');
