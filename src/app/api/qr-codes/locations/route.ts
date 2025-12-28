import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { Location, Table } from '@/types';

interface LocationWithTables {
  location: Location;
  tables: Table[];
}

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurant');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user owns this restaurant
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .eq('owner_id', user.id)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or unauthorized' },
        { status: 403 }
      );
    }

    // Get locations for the restaurant
    const { data: locations } = await supabase
      .from('locations')
      .select('id, name, restaurant_id')
      .eq('restaurant_id', restaurantId)
      .order('name');

    let locationsWithTables: LocationWithTables[] = [];

    if (locations) {
      locationsWithTables = await Promise.all(
        locations.map(async (location) => {
          const { data: tables } = await supabase
            .from('tables')
            .select('id, label, qr_token, location_id, active')
            .eq('location_id', location.id)
            .order('label');

          return {
            location,
            tables: tables || [],
          };
        })
      );
    }

    return NextResponse.json({
      locationsWithTables,
    });
  } catch (error) {
    console.error('Error fetching locations and tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations and tables' },
      { status: 500 }
    );
  }
}
