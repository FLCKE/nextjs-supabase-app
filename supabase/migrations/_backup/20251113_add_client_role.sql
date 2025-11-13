-- Add 'client' to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'client';

-- Update the trigger function to read role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
BEGIN
  -- Get role from raw_user_meta_data, default to 'client' if not set
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
  user_full_name := new.raw_user_meta_data->>'full_name';
  
  -- Insert profile with role from metadata
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    user_role::user_role,
    user_full_name
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists, no need to recreate it
