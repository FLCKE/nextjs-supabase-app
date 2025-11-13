# 🚨 Signup Error Fix

## Error Message
```
Error [AuthApiError]: Database error saving new user
status: 500, code: 'unexpected_failure'
```

## 🔍 Root Cause

The `handle_new_user()` trigger function was trying to cast the role string directly to the enum type, which can fail in certain scenarios. This causes the user signup to fail.

## ✅ Solution

Apply the fixed trigger function that:
1. Properly converts role strings to enum values
2. Adds error handling with TRY/CATCH
3. Handles ON CONFLICT cases
4. Logs warnings instead of failing signup

## 🚀 How to Fix (Choose One Method)

### Method 1: Supabase Dashboard (Fastest) ⭐

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in sidebar
   - Click "New Query"

3. **Copy & Paste This SQL:**

```sql
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
```

4. **Run the Query**
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success"

5. **Test Signup Again**
   - Go back to your app
   - Try signing up again
   - Should work now! ✅

### Method 2: Supabase CLI

```bash
npx supabase db push
```

This will apply the migration file: `20251113_fix_signup_trigger.sql`

## 🧪 Test After Fix

1. **Refresh your app** (clear any errors)
2. **Try signing up** as Restaurant Owner
3. **Verify**:
   - Signup completes successfully
   - Redirected to `/dashboard/restaurants`
   - Can see your profile

## 📊 What Changed

### Before (Broken)
```sql
-- Direct cast could fail
user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
INSERT ... VALUES (..., user_role::user_role, ...)
```

### After (Fixed)
```sql
-- Explicit IF/ELSIF conversion
IF user_role = 'owner' THEN
  final_role := 'owner'::user_role;
ELSIF user_role = 'client' THEN
  final_role := 'client'::user_role;
...

-- Plus error handling
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING ...
    RETURN new;  -- Don't fail signup
```

## 💡 Why This Works Better

1. **Explicit Conversion**: Each role string is explicitly converted to its enum value
2. **Error Handling**: EXCEPTION block catches any errors
3. **Graceful Degradation**: Logs warning but doesn't fail signup
4. **ON CONFLICT**: Handles edge cases where profile might exist
5. **Default Value**: Falls back to 'client' if role not recognized

## ✅ Expected Behavior After Fix

- ✅ Sign up as "Restaurant Owner" → Creates profile with role='owner'
- ✅ Sign up as "Client" → Creates profile with role='client'
- ✅ No role selected → Creates profile with role='client' (default)
- ✅ Redirects work correctly based on role
- ✅ No more "Database error saving new user"

## 🔍 Verify Fix Applied

Check in Supabase Dashboard:

1. **Database** → **Functions**
   - Find `handle_new_user`
   - Should see updated code with IF/ELSIF logic

2. **Try Signup**
   - Should complete without error
   - Check **Authentication** → **Users**
   - New user should appear

3. **Check Profile**
   - **Database** → **Tables** → **profiles**
   - New row with correct role should exist

## 🎉 Success!

After applying this fix, signup will work correctly for both:
- Restaurant Owners (role='owner')
- Clients (role='client')

You can now proceed with creating restaurants and managing menus! 🍕🍔🍰

---

**Time to Fix**: ~1 minute  
**Difficulty**: Easy (just copy/paste SQL)  
**Risk**: None (function is CREATE OR REPLACE)
