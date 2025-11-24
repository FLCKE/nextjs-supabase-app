# 🚀 Fix: Add INSERT Policy for User Profiles

Hello! It seems I missed a required database policy for creating user profiles. The error "Error creating profile, please try again" is happening because the code doesn't have permission to insert a new row into the `profiles` table.

My apologies for that oversight!

To fix this, you need to run one more small SQL script to add the necessary `INSERT` policy.

---

## 📋 Action Required: Apply the New Policy

Please follow these steps.

### Step 1: Go to the Supabase SQL Editor

1.  Open your project in the [Supabase Dashboard](https://app.supabase.com).
2.  In the left sidebar, click on **SQL Editor**.
3.  Click on **New query**.

### Step 2: Copy and Run the SQL Script

Copy the entire SQL script below and paste it into the SQL Editor. Then, click the **RUN** button.

```sql
-- =================================================================
-- Add INSERT policy for the profiles table
-- This allows newly signed-up users to create their own profile.
-- =================================================================

DROP POLICY IF EXISTS "Allow users to create their own profile" ON public.profiles;

CREATE POLICY "Allow users to create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### Step 3: Verify the Fix

After running the script, you should see a "Success" message.

Now, please try the signup process again. It should work correctly without the "Error creating profile" message.

---

Thank you for your patience. This should resolve the signup issue completely.
