'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function getStaffRestaurant() {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get restaurant ID from staff_members
    const { data: staffMember, error: staffError } = await supabaseAdmin
      .from('staff_members')
      .select('restaurant_id')
      .eq('user_id', user.id)
      .single();

    if (staffError || !staffMember) {
      return { success: false, error: 'Staff member not found' };
    }

    // Get restaurant details using admin client to bypass RLS
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('id', staffMember.restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return { success: false, error: 'Restaurant not found' };
    }

    return { success: true, data: restaurant };
  } catch (error: any) {
    console.error('Error getting staff restaurant:', error);
    return { success: false, error: error.message };
  }
}
