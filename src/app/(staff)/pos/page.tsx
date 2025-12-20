import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocations, getTables } from '@/lib/actions/restaurant-management';
import { getMenuItemsWithStock } from '@/lib/actions/inventory';
import { getStaffRestaurant } from '@/lib/actions/staff-restaurant';
import StaffPosClient from './pos-new-client';
import type { Location, Table, MenuItemWithStock } from '@/types';

export default async function StaffPosPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/staff-login');
  }

  // Get staff restaurant with proper permissions
  const { success, data: restaurant, error } = await getStaffRestaurant();
  
  if (!success || !restaurant) {
    console.error('Failed to get staff restaurant:', error);
    return redirect('/staff-dashboard');
  }

  const staffRestaurantId = restaurant.id;
  const restaurantName = restaurant.name;
  console.log('Staff Restaurant ID:', staffRestaurantId);
  try {
    // Fetch locations and tables
    const locations = await getLocations(staffRestaurantId);
    const locationsWithTables: (Location & { tables: Table[] })[] = await Promise.all(
      locations.map(async (location) => {
        const tables = await getTables(location.id);
        return { ...location, tables };
      })
    );

    // Fetch menu items
    const menuItems: MenuItemWithStock[] = await getMenuItemsWithStock(staffRestaurantId);

    return (
      <StaffPosClient 
        restaurantId={staffRestaurantId} 
        restaurantName={restaurantName} 
        initialLocationsWithTables={locationsWithTables} 
        menuItems={menuItems}
      />
    );
  } catch (error) {
    console.error('Error loading POS data:', error);
    return redirect('/staff-dashboard');
  }
}
