-- Migration to create the staff_members table and related security policies

-- Step 1: Create the staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  login_code_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- A staff member's username must be unique within a specific restaurant
  CONSTRAINT unique_username_per_restaurant UNIQUE (restaurant_id, username)
);

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_members_restaurant_id ON public.staff_members(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_username ON public.staff_members(username);

-- Step 3: Enable Row Level Security
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Owners can view staff members for their own restaurants.
DROP POLICY IF EXISTS "owner_can_select_staff" ON public.staff_members;
CREATE POLICY "owner_can_select_staff"
  ON public.staff_members
  FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants
      WHERE owner_id = auth.uid()
    )
  );

-- Owners can add staff members to their own restaurants.
DROP POLICY IF EXISTS "owner_can_insert_staff" ON public.staff_members;
CREATE POLICY "owner_can_insert_staff"
  ON public.staff_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants
      WHERE owner_id = auth.uid()
    )
  );

-- Owners can update staff members in their own restaurants.
DROP POLICY IF EXISTS "owner_can_update_staff" ON public.staff_members;
CREATE POLICY "owner_can_update_staff"
  ON public.staff_members
  FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM public.restaurants
      WHERE owner_id = auth.uid()
    )
  );

-- Owners can delete staff members from their own restaurants.
DROP POLICY IF EXISTS "owner_can_delete_staff" ON public.staff_members;
CREATE POLICY "owner_can_delete_staff"
  ON public.staff_members
  FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants
      WHERE owner_id = auth.uid()
    )
  );

-- Step 5: Add trigger for updated_at
DROP TRIGGER IF EXISTS set_staff_members_updated_at ON public.staff_members;
CREATE TRIGGER set_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
