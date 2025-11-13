-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tables table (for restaurant tables with QR codes)
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  qr_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants table
-- Owners can do everything with their restaurants
CREATE POLICY "Owners can view their own restaurants"
  ON public.restaurants FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert their own restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own restaurants"
  ON public.restaurants FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their own restaurants"
  ON public.restaurants FOR DELETE
  USING (owner_id = auth.uid());

-- Staff with read-only access to restaurants they're associated with
CREATE POLICY "Staff can view restaurants"
  ON public.restaurants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'staff'
    )
  );

-- RLS Policies for locations table
-- Owners can manage locations for their restaurants
CREATE POLICY "Owners can view locations for their restaurants"
  ON public.locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert locations for their restaurants"
  ON public.locations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update locations for their restaurants"
  ON public.locations FOR UPDATE
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
      WHERE restaurants.id = restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete locations for their restaurants"
  ON public.locations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants
      WHERE restaurants.id = locations.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Staff can view locations (read-only)
CREATE POLICY "Staff can view locations"
  ON public.locations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'staff'
    )
  );

-- RLS Policies for tables table
-- Owners can manage tables for their locations
CREATE POLICY "Owners can view tables for their locations"
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = tables.location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert tables for their locations"
  ON public.tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.locations
      JOIN public.restaurants ON restaurants.id = locations.restaurant_id
      WHERE locations.id = location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update tables for their locations"
  ON public.tables FOR UPDATE
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
      WHERE locations.id = location_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete tables for their locations"
  ON public.tables FOR DELETE
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
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'staff'
    )
  );
