import { QRCodeGenerator } from '@/components/qr-code/qr-code-generator';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Location, Table } from '@/types';

export const dynamic = 'force-dynamic';

interface LocationWithTables {
  location: Location;
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

  // Get locations and tables for the selected restaurant
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, restaurant_id, timezone, created_at, updated_at')
    .eq('restaurant_id', restaurantId)
    .order('name');

  let locationsWithTables: LocationWithTables[] = [];

  if (locations) {
    locationsWithTables = (await Promise.all(
      locations.map(async (location) => {
        const { data: tables } = await supabase
          .from('tables')
          .select('id, label, qr_token, location_id, active, created_at, updated_at')
          .eq('location_id', location.id)
          .order('label');

        return {
          location: location as Location,
          tables: (tables || []) as Table[],
        };
      })
    )) as LocationWithTables[];
  }

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
        initialLocationsWithTables={locationsWithTables}
      />
    </div>
  );
}
