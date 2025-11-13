-- Fix the signup trigger to handle role conversion properly
-- and add better error handling

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_full_name TEXT;
  final_role public.user_role;
BEGIN
  -- Get role from raw_user_meta_data
  user_role := new.raw_user_meta_data->>'role';
  user_full_name := new.raw_user_meta_data->>'full_name';
  
  -- Convert 'owner' string to proper enum value
  -- Default to 'client' if role is not set
  IF user_role = 'owner' THEN
    final_role := 'owner'::user_role;
  ELSIF user_role = 'client' THEN
    final_role := 'client'::user_role;
  ELSIF user_role = 'staff' THEN
    final_role := 'staff'::user_role;
  ELSIF user_role = 'admin' THEN
    final_role := 'admin'::user_role;
  ELSE
    -- Default to client if no role specified
    final_role := 'client'::user_role;
  END IF;
  
  -- Insert profile with role from metadata
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    new.id, 
    new.email, 
    final_role,
    user_full_name
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
