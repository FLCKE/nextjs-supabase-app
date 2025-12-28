import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface RestaurantRedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantRedirectPage({ params }: RestaurantRedirectPageProps) {
  const { id: restaurantId } = await params;
  const supabase = await createClient();

  // Verify restaurant exists
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('id', restaurantId)
    .single();

  if (error || !restaurant) {
    return redirect('/');
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Authenticated user: redirect to POS/sales page
    redirect(`/staff/pos?restaurant=${restaurantId}`);
  } else {
    // Public user: redirect to restaurant menu page (without table)
    redirect(`/public/menu?restaurant=${restaurantId}`);
  }
}
