import { OrdersTable } from '@/components/orders/orders-table';
import { OrdersFilter } from '@/components/orders/orders-filter';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get all user's restaurants
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('name');

  const restaurantId = restaurants?.[0]?.id;

  // Fetch raw orders from Supabase
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('restaurant_id', restaurantId || '')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders in real-time
        </p>
      </div>

      <OrdersFilter 
        restaurants={restaurants || []} 
        initialRestaurantId={restaurantId}
      />

      {orders && orders.length > 0 ? (
        <OrdersTable initialOrders={orders as any} restaurantId={restaurantId} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}
    </div>
  );
}
