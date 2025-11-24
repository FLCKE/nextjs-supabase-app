-- This migration adds a 'role' column to the 'staff_members' table.

-- Add the 'role' column with a default value of 'staff'
ALTER TABLE public.staff_members
ADD COLUMN role TEXT NOT NULL DEFAULT 'staff';

-- Optional: Update existing staff members to have the default role
-- This step might be necessary if you have existing data and want to ensure
-- all staff members have a role immediately after migration.
-- UPDATE public.staff_members SET role = 'staff' WHERE role IS NULL;

-- Create an index for the new role column for faster lookups if needed
CREATE INDEX IF NOT EXISTS idx_staff_members_role ON public.staff_members(role);

-- DOWN: Revert the changes
ALTER TABLE public.staff_members
DROP COLUMN role;

-- Drop the index
DROP INDEX IF EXISTS idx_staff_members_role;
