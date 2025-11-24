'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import type { StaffMember } from '@/types';
import { staffLoginSchema } from '@/lib/validation/auth';

const SALT_ROUNDS = 10;

// Zod schema for creating a staff member
const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  login_code: z.string().length(5, 'Login code must be 5 digits.'),
  restaurantId: z.string().uuid(),
  role: z.string().optional().default('staff'),
});


/**
 * Fetches all staff members for a given restaurant.
 * Only the restaurant owner can call this. RLS policies enforce this.
 * @param restaurantId The ID of the restaurant.
 */
export async function getStaffMembers(restaurantId: string): Promise<StaffMember[]> {
  if (!restaurantId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff members:', error);
    throw new Error('Could not fetch staff members.');
  }
  return data;
}

/**
 * Creates a new staff member, which involves:
 * 1. Creating a new user in Supabase Auth with a dummy email.
 * 2. Creating a profile for that user.
 * 3. Creating a staff_member record with the hashed login code.
 * @param formData The form data from the client.
 */
export async function createStaffMember(formData: FormData) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Get current user (owner)
  const { data: { user: owner } } = await supabase.auth.getUser();
  if (!owner) return { success: false, error: 'Not authenticated.' };

  // Validate form data
  const validatedFields = createStaffSchema.safeParse({
    name: formData.get('name'),
    username: formData.get('username'),
    login_code: formData.get('login_code'),
    restaurantId: formData.get('restaurantId'),
    role: formData.get('role') || undefined, // Get role from form data or use default
  });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.flatten().fieldErrors };
  }
  const { name, username, login_code, restaurantId, role } = validatedFields.data;

  // Ensure owner is actually the owner of the restaurant they're adding staff to
  const { data: restaurantData, error: ownerCheckError } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', restaurantId)
    .eq('owner_id', owner.id)
    .single();

  if (ownerCheckError || !restaurantData) {
    return { success: false, error: 'You are not the owner of this restaurant.' };
  }

  try {
    // 1. Create the user in auth.users
    const dummyEmail = `${username}-${restaurantId}@staff.wego.app`;
    const randomPassword = Math.random().toString(36).slice(-16);
    
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      password: randomPassword,
      email_confirm: true, // Auto-confirm the dummy email
    });

    if (authError || !newAuthUser.user) {
      // Check for username collision, which might cause email collision
      if (authError?.message.includes('unique constraint')) {
        return { success: false, error: 'This username is already taken in this restaurant. Please choose another.' };
      }
      throw new Error(`Could not create auth user: ${authError?.message}`);
    }
    
    const newUserId = newAuthUser.user.id;

    // 2. Create the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        email: dummyEmail,
        full_name: name,
        role: 'staff', // This role is for the profile table, not staff_members table
        restaurant_id: restaurantId,
      });

    if (profileError) {
      // Cleanup auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw new Error(`Could not create profile: ${profileError.message}`);
    }

    // 3. Hash the login code and create the staff_member record
    const login_code_hash = await bcrypt.hash(login_code, SALT_ROUNDS);

    const { error: staffMemberError } = await supabaseAdmin
      .from('staff_members')
      .insert({
        user_id: newUserId,
        restaurant_id: restaurantId,
        name,
        username,
        login_code_hash,
        role, // Insert the role into the staff_members table
      });
    
    if (staffMemberError) {
      // Cleanup auth user and profile if this fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      // The profile will be deleted by cascade
      throw new Error(`Could not create staff member record: ${staffMemberError.message}`);
    }

    revalidatePath('/dashboard/staff');
    return { success: true };

  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Logs a staff member in using their username and 5-digit code.
 * @param formData The form data containing username and login_code.
 * @returns An object with a magicLink on success, or an error message on failure.
 */
export async function loginStaff(formData: FormData) {
  const supabaseAdmin = createAdminClient();

  const validatedFields = staffLoginSchema.safeParse({
    username: formData.get('username'),
    login_code: formData.get('login_code'),
  });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid input.' };
  }
  const { username, login_code } = validatedFields.data;

  try {
    // 1. Find the staff member by username
    const { data: staffMember, error: staffError } = await supabaseAdmin
      .from('staff_members')
      .select('user_id, login_code_hash')
      .eq('username', username)
      .single();

    if (staffError || !staffMember) {
      return { success: false, error: 'Invalid username or login code.' };
    }

    // 2. Verify the login code
    const codeIsValid = await bcrypt.compare(login_code, staffMember.login_code_hash);

    if (!codeIsValid) {
      return { success: false, error: 'Invalid username or login code.' };
    }

    // 3. Get the user's email from their auth user record
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(staffMember.user_id);

    if (authUserError || !authUser.user) {
      throw new Error('Could not find the associated user account.');
    }
    const userEmail = authUser.user.email;
    if (!userEmail) throw new Error('No email found for the user account.');

    // 4. Generate a magic link for the user to sign in
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        // The user will be redirected here after signing in
        redirectTo: '/dashboard/pos',
      },
    });

    if (linkError || !linkData) {
      throw new Error('Could not generate login link.');
    }

    return { success: true, magicLink: linkData.properties.action_link };

  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
