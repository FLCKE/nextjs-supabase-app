import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Fetch all required data in parallel
    const [
      ordersResult,
      paymentsResult,
      tablesResult,
    ] = await Promise.all([
      // Get orders for today
      supabase
        .from('orders')
        .select('id, total_gross_cts, status, created_at, table_id')
        .gte('created_at', todayISO),

      // Get payments completed today
      supabase
        .from('payments')
        .select('amount_cts, status, created_at')
        .eq('status', 'completed')
        .gte('created_at', todayISO),

      // Get all tables
      supabase
        .from('tables')
        .select('id, label'),
    ]);

    const orders = ordersResult.data || [];
    const payments = paymentsResult.data || [];
    const tables = tablesResult.data || [];

    // Calculate statistics
    const totalRevenue = (payments.reduce((sum, p) => sum + (p.amount_cts || 0), 0) / 100).toFixed(2);
    const ordersToday = orders.length;
    const activeOrders = orders.filter(o => o.status === 'pending' ).length;
    const paidOrders = orders.filter(o => o.status === 'preparing' || o.status === 'ready'|| o.status === 'completed').length;

    // Calculate average order value
    const avgOrderValue = ordersToday > 0
      ? (orders.reduce((sum, o) => sum + (o.total_gross_cts || 0), 0) / 100 / ordersToday).toFixed(2)
      : '0.00';

    // Get active tables
    const activeTables = new Set(orders.filter(o => o.status === 'pending' || o.status === 'paying').map(o => o.table_id)).size;
    const totalTables = tables.length;

    // Calculate percentage change vs yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const { data: yesterdayOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', todayISO);

    const yesterdayCount = yesterdayOrders?.length || 0;
    const percentageChangeValue = yesterdayCount > 0
      ? (((ordersToday - yesterdayCount) / yesterdayCount) * 100).toFixed(1)
      : '0.0';
    const percentageChange = `${percentageChangeValue.startsWith('-') ? '' : '+'}${percentageChangeValue}%`;

    // Get top item from order_items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('menu_item_id, name, quantity')
      .in('order_id', orders.map(o => o.id));

    const itemCounts = new Map<string, { name: string; count: number }>();
    orderItems?.forEach(item => {
      const existing = itemCounts.get(item.menu_item_id);
      if (existing) {
        existing.count += item.quantity || 1;
      } else {
        itemCounts.set(item.menu_item_id, { name: item.name || 'Unknown', count: item.quantity || 1 });
      }
    });

    let topItem = 'N/A';
    if (itemCounts.size > 0) {
      const topEntry = Array.from(itemCounts.entries()).reduce((a, b) => a[1].count > b[1].count ? a : b);
      topItem = topEntry[1].name;
    }

    // Recent orders (last 5) - use actual order data
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((order) => {
        const table = tables.find(t => t.id === order.table_id);
        return ({
          id: `#${order.order_number || order.id.slice(0, 8)}`,
          table: table?.label || `Table ${order.table_id?.slice(0, 8) || 'N/A'}`,
          amount: `$${((order.total_gross_cts || 0) / 100).toFixed(2)}`,
          time: new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        });
      });

    return NextResponse.json({
      totalRevenue: `$${totalRevenue}`,
      ordersToday,
      activeOrders,
      paidOrders,
      avgOrderValue: `$${avgOrderValue}`,
      activeTables,
      totalTables,
      topItem,
      percentageChange,
      recentOrders,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      totalRevenue: '$0.00',
      ordersToday: 0,
      activeOrders: 0,
      paidOrders: 0,
      avgOrderValue: '$0.00',
      activeTables: 0,
      totalTables: 0,
      topItem: 'N/A',
      percentageChange: '0%',
      recentOrders: [],
      success: false,
    }, { status: 500 });
  }
}
