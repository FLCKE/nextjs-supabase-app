'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

import type { Location, Table, MenuItemWithStock } from '@/types';
import OrderBoard from './components/order-board';
import PosPanel from './components/pos-panel';

interface StaffPosClientProps {
  restaurantId: string;
  restaurantName: string;
  initialLocationsWithTables: (Location & { tables: Table[] })[];
  menuItems: MenuItemWithStock[];
}

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

export default function StaffPosClient({
  restaurantId,
  restaurantName,
  initialLocationsWithTables,
  menuItems,
}: StaffPosClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [payingCount, setPayingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [hiddenPanel, setHiddenPanel] = useState(false);
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/staff-login');
          return;
        }
        setAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/staff-login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ordersData = (data || []).map((order: any) => {
        const table = initialLocationsWithTables
          .flatMap(l => l.tables)
          .find(t => t.id === order.table_id);
          return {
            ...order,
            table_label: table?.label || 'Unknown',
          };
        });
        
      setOrders(ordersData);
      setPendingCount(ordersData.filter((o: Order) => o.status === 'pending').length);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  }, [restaurantId, supabase, initialLocationsWithTables]);

  // Initial load and subscribe to changes
  useEffect(() => {
    if (!authenticated) return;

    fetchOrders();

    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [authenticated, restaurantId, supabase, fetchOrders]);

  if (loading || !authenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{restaurantName} - POS</h1>
            <p className="text-sm text-muted-foreground">Staff Dashboard</p>
            <Button className='flex gap-2' onClick={()=>{setHiddenPanel(!hiddenPanel)}}>
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-1" />
              {!hiddenPanel ? 'Cacher le pannel' : 'Lancer une commande'}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Online Status */}
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Badge>

            {/* Orders Count */}
            <div className="flex gap-2">
              <Card className="px-3 py-1">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold">{pendingCount}</p>
              </Card>
              <Card className="px-3 py-1">
                <p className="text-xs text-muted-foreground">Paying</p>
                <p className="text-lg font-bold">{payingCount}</p>
              </Card>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Order Board */}
        <div className="flex-1 overflow-auto border-r">
          <OrderBoard
            orders={orders}
            onOrderUpdate={fetchOrders}
            restaurantId={restaurantId}
          />
        </div>

        {/* Right: POS Panel */}
        <div className={`w-96 overflow-auto border-l bg-card ${hiddenPanel ? 'hidden' : ''}`}>
          <PosPanel
            selectedTable={selectedTable}
            onTableSelect={setSelectedTable}
            locationsWithTables={initialLocationsWithTables}
            menuItems={menuItems}
            onOrderCreated={fetchOrders}
            restaurantId={restaurantId}
          />
        </div>
      </div>
    </div>
  );
}
