'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { OrderWithDetails } from '@/types';
import { toast } from 'sonner';

export function useOrdersRealtime(restaurantId?: string) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchOrders = async () => {
      try {
        let query = supabase
          .from('orders_with_details')
          .select('*')
          .order('created_at', { ascending: false });

        if (restaurantId) {
          query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to fetch orders');
        } else {
          setOrders(data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('Order change detected:', payload);

          if (payload.eventType === 'INSERT') {
            // Fetch the full order with details
            const { data: newOrder } = await supabase
              .from('orders_with_details')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (newOrder) {
              // Check if order belongs to the restaurant
              if (!restaurantId || newOrder.restaurant_id === restaurantId) {
                setOrders((prev) => [newOrder, ...prev]);
                toast.success('New order received!', {
                  description: `Table ${newOrder.table_label} - ${newOrder.item_count} items`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((order) => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return { orders, isLoading };
}
