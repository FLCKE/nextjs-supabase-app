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
          .from('orders')
          .select(`
            id,
            status,
            currency,
            total_net_cts,
            taxes_cts,
            total_gross_cts,
            notes,
            created_at,
            updated_at,
            restaurant_id,
            location_id,
            table_id,
            tables!inner(label),
            locations!inner(name),
            order_items(id)
          `)
          .order('created_at', { ascending: false });

        if (restaurantId) {
          query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to fetch orders');
        } else {
          const formattedOrders = (data || []).map((order: any) => ({
            ...order,
            table_label: order.tables?.label || 'Unknown',
            location_name: order.locations?.name || 'Unknown',
            item_count: order.order_items?.length || 0,
          })) as OrderWithDetails[];
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to realtime changes on orders table
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
              .from('orders')
              .select(`
                id,
                status,
                currency,
                total_net_cts,
                taxes_cts,
                total_gross_cts,
                notes,
                created_at,
                updated_at,
                restaurant_id,
                location_id,
                table_id,
                tables!inner(label),
                locations!inner(name),
                order_items(id)
              `)
              .eq('id', payload.new.id)
              .single();

            if (newOrder) {
              // Check if order belongs to the restaurant
              if (!restaurantId || newOrder.restaurant_id === restaurantId) {
                const formatted = {
                  ...newOrder,
                  table_label: newOrder.tables?.label || 'Unknown',
                  location_name: newOrder.locations?.name || 'Unknown',
                  item_count: newOrder.order_items?.length || 0,
                } as OrderWithDetails;
                setOrders((prev) => [formatted, ...prev]);
                toast.success('New order received!', {
                  description: `Table ${formatted.table_label} - ${formatted.item_count} items`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new, status: payload.new.status }
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
