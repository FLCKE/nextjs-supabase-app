import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const range = request.nextUrl.searchParams.get('range') || 'week';

    let startDate = new Date();
    switch (range) {
      case 'month':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'year':
        startDate.setDate(startDate.getDate() - 365);
        break;
      case 'week':
      default:
        startDate.setDate(startDate.getDate() - 7);
        break;
    }

    const startDateISO = startDate.toISOString();

    // Fetch data in parallel
    const [
      ordersResult,
      paymentsResult,
      itemsResult,
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, created_at, total_gross_cts, total_net_cts')
        .gte('created_at', startDateISO),

      supabase
        .from('payments')
        .select('id, amount_cts, status, created_at, payment_method')
        .gte('created_at', startDateISO),

      supabase
        .from('order_items')
        .select('id, name, qty, total_price_cts, created_at')
        .gte('created_at', startDateISO),
    ]);

    const orders = ordersResult.data || [];
    const payments = paymentsResult.data || [];
    const items = itemsResult.data || [];

    // Generate daily revenue data
    const dailyRevenueMap: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
        month: 'short',
        day: 'numeric',
      });
      if (!dailyRevenueMap[date]) {
        dailyRevenueMap[date] = { revenue: 0, orders: 0 };
      }
      dailyRevenueMap[date].orders += 1;
      if (order.status === 'PAID' || order.status === 'SERVED') {
        dailyRevenueMap[date].revenue += (order.total_gross_cts || 0) / 100;
      }
    });

    const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, data]) => ({
      date,
      revenue: parseFloat(data.revenue.toFixed(2)),
      orders: data.orders,
    }));

    // Payment methods analysis
    const paymentMethodsMap: Record<string, { count: number; amount: number }> = {};
    payments.forEach(payment => {
      const method = payment.payment_method || 'Unknown';
      if (!paymentMethodsMap[method]) {
        paymentMethodsMap[method] = { count: 0, amount: 0 };
      }
      paymentMethodsMap[method].count += 1;
      paymentMethodsMap[method].amount += (payment.amount_cts || 0) / 100;
    });

    const paymentMethods = Object.entries(paymentMethodsMap).map(([method, data]) => ({
      method,
      count: data.count,
      amount: parseFloat(data.amount.toFixed(2)),
    }));

    // Orders by status
    const statusMap: Record<string, number> = {};
    orders.forEach(order => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    });

    const totalOrders = orders.length;
    const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0,
    }));

    // Top items
    const itemsMap: Record<string, { orders: number; revenue: number }> = {};
    items.forEach(item => {
      if (!itemsMap[item.name]) {
        itemsMap[item.name] = { orders: 0, revenue: 0 };
      }
      itemsMap[item.name].orders += item.qty || 1;
      itemsMap[item.name].revenue += (item.total_price_cts || 0) / 100;
    });

    const topItems = Object.entries(itemsMap)
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: parseFloat(data.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Hourly orders
    const hourlyMap: Record<number, number> = {};
    orders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
    });

    const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      orders: hourlyMap[i] || 0,
    }));

    return NextResponse.json({
      dailyRevenue,
      paymentMethods,
      ordersByStatus,
      topItems,
      hourlyOrders,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json({
      dailyRevenue: [],
      paymentMethods: [],
      ordersByStatus: [],
      topItems: [],
      hourlyOrders: [],
      success: false,
    }, { status: 500 });
  }
}
