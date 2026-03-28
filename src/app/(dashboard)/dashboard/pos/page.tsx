import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTables, getRestaurant } from '@/lib/actions/restaurant-management';
import { getMenuItemsWithStock } from '@/lib/actions/inventory';
import { PosClient } from './pos-client';
import type { Table, MenuItemWithStock } from '@/types';

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
    return redirect('/dashboard');
  }

  const staffRestaurantId = profile.restaurant_id;

  // Fetch restaurant details for the name
  const restaurant = await getRestaurant(staffRestaurantId);
  if (!restaurant) {
    console.error(`Restaurant not found for ID: ${staffRestaurantId}`);
    return redirect('/dashboard');
  }
  const restaurantName = restaurant.name;

  // Fetch tables for the restaurant
  const tables = await getTables(staffRestaurantId);

  // Fetch menu items
  const menuItems: MenuItemWithStock[] = await getMenuItemsWithStock(staffRestaurantId);

  return (
    <PosClient 
      restaurantId={staffRestaurantId} 
      restaurantName={restaurantName} 
      tables={tables}
      menuItems={menuItems}
    />
  );
}
