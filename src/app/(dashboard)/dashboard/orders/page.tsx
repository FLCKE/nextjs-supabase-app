import { OrdersTable } from '@/components/orders/orders-table';
import { getOrders } from '@/lib/actions/order-actions';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's restaurant
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  const restaurantId = restaurants?.[0]?.id;

  const result = await getOrders(restaurantId);
  const orders = result.success ? (result.data || []) : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            View and manage customer orders in real-time
          </p>
        </div>
      </div>

      <OrdersTable initialOrders={orders} restaurantId={restaurantId} />
    </div>
  );
}
