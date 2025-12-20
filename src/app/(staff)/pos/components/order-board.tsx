'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChevronRight } from 'lucide-react';
import { format, formatDistance } from 'date-fns';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  table_id: string;
  table_label?: string;
  status: 'pending' | 'preparing' | 'ready' | 'cancelled' | 'completed';
  total_gross_cts: number;
  created_at: string;
  notes?: string;
  item_count?: number;
}

interface OrderBoardProps {
  orders: Order[];
  onOrderUpdate: () => void;
  restaurantId: string;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', nextStatus: 'PAYING' },
  PAYING: { label: 'Paying', color: 'bg-blue-100 text-blue-800', nextStatus: 'PAID' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800', nextStatus: 'SERVED' },
  SERVED: { label: 'Served', color: 'bg-gray-100 text-gray-800', nextStatus: null },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', nextStatus: null },
  REFUNDED: { label: 'Refunded', color: 'bg-purple-100 text-purple-800', nextStatus: null },
};

export default function OrderBoard({
  orders,
  onOrderUpdate,
  restaurantId,
}: OrderBoardProps) {
  const supabase = createClient();
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const groupedByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {
      PENDING: [],
      PAYING: [],
      PAID: [],
      SERVED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    orders.forEach(order => {
      if (order.status in grouped) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  }, [orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order updated to ${newStatus}`);
      onOrderUpdate();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    try {
      return formatDistance(new Date(createdAt), new Date(), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const StatusColumn = ({ status, statusOrders }: { status: keyof typeof STATUS_CONFIG; statusOrders: Order[] }) => {
    const config = STATUS_CONFIG[status];

    return (
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 border-r last:border-r-0 overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 pb-3 border-b mb-3">
          <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
          <p className="text-xs text-muted-foreground">{statusOrders.length} orders</p>
        </div>

        <div className="space-y-3">
          {statusOrders.map((order) => (
            <Card key={order.id} className={`cursor-pointer hover:shadow-md transition-shadow ${config.color}`}>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-sm">
                      Order #{order.order_number}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Table {order.table_label}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {order.item_count || 0} items
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold">${(order.total_gross_cts / 100).toFixed(2)}</span>
                </div>

                {order.notes && (
                  <div className="text-xs bg-white/50 p-2 rounded">
                    <p className="font-semibold text-xs mb-1">Notes:</p>
                    <p>{order.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeElapsed(order.created_at)}</span>
                </div>

                {config.nextStatus && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full mt-2"
                    disabled={updatingOrder === order.id}
                    onClick={() => updateOrderStatus(order.id, config.nextStatus!)}
                  >
                    {updatingOrder === order.id ? (
                      <>Loading...</>
                    ) : (
                      <>
                        Next <ChevronRight className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {statusOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">No orders</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <StatusColumn status="PENDING" statusOrders={groupedByStatus.PENDING} />
      <StatusColumn status="PAYING" statusOrders={groupedByStatus.PAYING} />
      <StatusColumn status="PAID" statusOrders={groupedByStatus.PAID} />
      <StatusColumn status="SERVED" statusOrders={groupedByStatus.SERVED} />
    </div>
  );
}
