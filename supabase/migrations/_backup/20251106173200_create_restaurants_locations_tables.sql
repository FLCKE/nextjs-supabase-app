-- First, add restaurant_id to profiles if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS restaurant_id UUID;

-- Create restaurants table
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

-- Now add the foreign key constraint to profiles
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_restaurant_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) 
REFERENCES public.restaurants(id) 
ON DELETE SET NULL;

-- Create index for profiles.restaurant_id
CREATE INDEX IF NOT EXISTS idx_profiles_restaurant_id ON public.profiles(restaurant_id);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  qr_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_locations_restaurant_id ON public.locations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_location_id ON public.tables(location_id);
CREATE INDEX IF NOT EXISTS idx_tables_qr_token ON public.tables(qr_token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants table
-- Owners can do everything with their restaurants
CREATE POLICY "Owners can view their own restaurants"
  ON public.restaurants
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own restaurants"
  ON public.restaurants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own restaurants"
  ON public.restaurants
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own restaurants"
  ON public.restaurants
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Staff can view restaurants they have access to
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

-- RLS Policies for locations table
-- Owners can manage locations for their restaurants
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

-- Staff can view locations (read-only)
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

-- RLS Policies for tables table
-- Owners can manage tables for their locations
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

-- Staff can view tables (read-only)
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

-- Allow public access to tables via QR token (for customer ordering)
CREATE POLICY "Public can view active tables by QR token"
  ON public.tables
  FOR SELECT
  USING (active = true);
