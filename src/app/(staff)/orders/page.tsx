'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistance } from 'date-fns';
import { Clock, AlertCircle, CheckCircle, Loader, ChevronDown, MinusCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items_count?: number;
  customer_name?: string;
  table_number?: string | number;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'pending'],
  ready: ['completed', 'pending'],
  completed: [],
  cancelled: ['pending'],
};

export default  function StaffOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [authenticated, setAuthenticated] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data,error } = await supabase.auth.getUser();
      if (!data.user || error) {
        if (error) {
          console.error('Auth error:', error);
        }
        router.push('/staff-login');
        return;
      }
      setUser(data.user);
      setAuthenticated(true);
    };
    
    checkAuth();
  }, [router, supabase]);

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      
      if (!user) return;

      console.log('Staff Data 2:', user );
      // Get staff member's restaurant
      const { data:  staffData  } = await supabase
        .from('staff_members')
        .select('*')
        .eq('user_id', user?.id);
      if (!staffData?.[0]?.restaurant_id) {
        toast.error('Could not find restaurant');
        return;
      }

      // Get orders for this restaurant
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
        return;
      }
      console.log('Fetched Orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authenticated) return;

    fetchOrders();

    // Set up real-time subscription
    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order change detected:', payload);
        fetchOrders(); // Refresh orders when changes detected
      })
      .subscribe();

    // Refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrders(prev => new Set(prev).add(orderId));
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.log('Error updating order:', error);
        toast.error('Failed to update order status');
        return;
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      const order = orders.find(o => o.id === orderId);
      toast.success(`Order #${order?.order_number} marked as ${newStatus}`);
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      toast.error('Something went wrong');
    } finally {
      setUpdatingOrders(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'preparing':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <MinusCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTimeFromNow = (createdAt: string) => {
    try {
      return formatDistance(new Date(createdAt), new Date(), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (loading || !authenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Orders Queue</h1>
        <p className="text-muted-foreground">View and track all incoming orders in real-time</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="rounded-full"
        >
          All Orders ({orders.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="rounded-full"
        >
          Pending ({orders.filter(o => o.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'preparing' ? 'default' : 'outline'}
          onClick={() => setFilter('preparing')}
          className="rounded-full"
        >
          Preparing ({orders.filter(o => o.status === 'preparing').length})
        </Button>
        <Button
          variant={filter === 'ready' ? 'default' : 'outline'}
          onClick={() => setFilter('ready')}
          className="rounded-full"
        >
          Ready ({orders.filter(o => o.status === 'ready').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className="rounded-full"
        >
          Completed ({orders.filter(o => o.status === 'completed').length})
        </Button>
        <Button
          variant={filter === 'cancelled' ? 'default' : 'outline'}
          onClick={() => setFilter('cancelled')}
          className="rounded-full"
        >
          Cancelled ({orders.filter(o => o.status === 'cancelled').length})
        </Button>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                order.status === 'pending' ? 'border-l-4 border-l-yellow-500' :
                order.status === 'preparing' ? 'border-l-4 border-l-blue-500' :
                order.status === 'ready' ? 'border-l-4 border-l-green-500' :
                'border-l-4 border-l-gray-300'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                    {order.table_number && (
                      <CardDescription>Table {order.table_number}</CardDescription>
                    )}
                  </div>
                  <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                    <span className="mr-1">{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Details */}
                <div className="space-y-2 text-sm">
                  {order.customer_name && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">{order.items_count || 0} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold">${(order.total_amount / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Time Info */}
                <div className="pt-3 border-t">
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{getTimeFromNow(order.created_at)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'HH:mm:ss')}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    variant={order.status.toLowerCase() === 'ready' ? 'default' : 'secondary'}
                    size="sm"
                    disabled={updatingOrders.has(order.id)}
                    onClick={() => {
                      if (order.status.toLowerCase() === 'pending') {
                        updateOrderStatus(order.id, 'preparing');
                      } else if (order.status.toLowerCase() === 'preparing') {
                        updateOrderStatus(order.id, 'ready');
                      } else if (order.status.toLowerCase() === 'ready') {
                        updateOrderStatus(order.id, 'completed');
                      }
                    }}
                  >
                    {updatingOrders.has(order.id) ? (
                      <>
                        <Loader className="w-3 h-3 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        {order.status.toLowerCase() === 'pending' && 'Start Preparing'}
                        {order.status.toLowerCase() === 'preparing' && 'Mark as Ready'}
                        {order.status.toLowerCase() === 'ready' && 'Delivered'}
                        {order.status.toLowerCase() === 'completed' && 'Completed'}
                        {order.status.toLowerCase() === 'cancelled' && 'Cancelled'}
                      </>
                    )}
                  </Button>

                  {/* More Actions Menu */}
                  {STATUS_TRANSITIONS[order.status]?.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updatingOrders.has(order.id)}
                          className="px-2"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUS_TRANSITIONS[order.status].map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={updatingOrders.has(order.id)}
                          >
                            Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">No Orders</h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'All orders have been completed!'
                : `No ${filter} orders at the moment`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
