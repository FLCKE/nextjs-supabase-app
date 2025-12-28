import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface QRRedirectPageProps {
  params: Promise<{ token: string }>;
}

export default async function QRRedirectPage({ params }: QRRedirectPageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Get the table by QR token
  const { data: table, error } = await supabase
    .from('tables')
    .select('id, location_id, label, locations(name, restaurant_id)')
    .eq('qr_token', token)
    .single();

  if (error || !table) {
    return redirect('/');
  }

  const location = table.locations as any;
  const restaurantId = location?.restaurant_id;

  if (!restaurantId) {
    return redirect('/');
  }

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Authenticated user: redirect to POS/sales page
    redirect(`/staff/pos?table=${table.id}`);
  } else {
    // Public user: redirect to menu page
    redirect(`/public/menu?table_token=${token}`);
  }
}
