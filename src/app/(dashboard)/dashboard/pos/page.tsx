import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocations, getTables, getRestaurant } from '@/lib/actions/restaurant-management';
import { getMenuItemsWithStock } from '@/lib/actions/inventory'; // Import getMenuItemsWithStock
import { PosClient } from './pos-client';
import type { Location, Table, MenuItemWithStock } from '@/types'; // Add MenuItemWithStock to types

export default async function PosPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, restaurant_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'staff' || !profile.restaurant_id) {
    return redirect('/dashboard'); // Redirect if not staff or no restaurant_id
  }

  const staffRestaurantId = profile.restaurant_id;

  // Fetch restaurant details for the name
  const restaurant = await getRestaurant(staffRestaurantId);
  if (!restaurant) {
    // This should ideally not happen if profile.restaurant_id is valid
    console.error(`Restaurant not found for ID: ${staffRestaurantId}`);
    return redirect('/dashboard');
  }
  const restaurantName = restaurant.name;

  // --- Fetch locations and tables ---
  const locations = await getLocations(staffRestaurantId);
  const locationsWithTables: (Location & { tables: Table[] })[] = await Promise.all(
    locations.map(async (location) => {
      const tables = await getTables(location.id);
      return { ...location, tables };
    })
  );
  // --- End fetch ---

  // --- Fetch menu items ---
  const menuItems: MenuItemWithStock[] = await getMenuItemsWithStock(staffRestaurantId);
  // --- End fetch ---

  return (
    <PosClient 
      restaurantId={staffRestaurantId} 
      restaurantName={restaurantName} 
      initialLocationsWithTables={locationsWithTables} 
      menuItems={menuItems} // Pass menuItems to PosClient
    />
  );
}
