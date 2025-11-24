import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRestaurants } from '@/lib/actions/restaurant-management';
import { getStaffMembers } from '@/lib/actions/staff-actions';
import { StaffClient } from './staff-client';
import type { Restaurant, StaffMember } from '@/types';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  // Fetch owner's restaurants
  const restaurants: Restaurant[] = await getRestaurants();

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-4">No Restaurant Found</h2>
        <p className="text-muted-foreground">
          You need to create a restaurant before you can manage staff.
        </p>
        {/* Optional: Add a button to create a restaurant */}
      </div>
    );
  }

  // For now, we operate on the first restaurant.
  // A restaurant selector can be added later in the client component.
  const operatingRestaurantId = restaurants[0].id;
  const initialStaff: StaffMember[] = await getStaffMembers(operatingRestaurantId);

  return (
    <div className="container mx-auto py-8 px-4">
      <StaffClient restaurants={restaurants} initialStaff={initialStaff} />
    </div>
  );
}
