import { QRCodeGenerator } from '@/components/qr-code/qr-code-generator';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Table } from '@/types';

export const dynamic = 'force-dynamic';

interface TablesData {
  restaurant_id: string;
  tables: Table[];
}

export default async function QRCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Get user's restaurants
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('name');

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">QR Codes</h1>
          <p className="text-muted-foreground">No restaurants found</p>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const restaurantId = params.restaurant || restaurants[0].id;

  // Get tables for the selected restaurant
  const { data: tables } = await supabase
    .from('tables')
    .select('id, label, qr_token, restaurant_id, active, created_at, updated_at')
    .eq('restaurant_id', restaurantId)
    .order('label');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Codes</h1>
        <p className="text-muted-foreground">
          Generate and download QR codes for your tables
        </p>
      </div>

      <QRCodeGenerator
        restaurants={restaurants}
        initialRestaurantId={restaurantId}
        initialTables={tables || []}
      />
    </div>
  );
}
