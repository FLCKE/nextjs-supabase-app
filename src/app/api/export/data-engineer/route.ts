import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export const maxDuration = 60;

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(data: Record<string, unknown>[], headers: string[]): string {
  const lines = [headers.join(',')];
  for (const row of data) {
    lines.push(headers.map(h => escapeCSV(row[h])).join(','));
  }
  return lines.join('\n');
}

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const zip = new JSZip();

    // 1. ORDERS - Raw order data
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (orders && orders.length > 0) {
      const ordersCSV = arrayToCSV(
        orders.map(o => ({
          order_id: o.id,
          restaurant_id: o.restaurant_id,
          table_number: o.table_number,
          status: o.status,
          total_amount: o.total_amount ? o.total_amount / 100 : null,
          currency: o.currency || 'USD',
          payment_method: o.payment_method,
          customer_name: o.customer_name,
          customer_phone: o.customer_phone,
          special_requests: o.special_requests,
          created_at: o.created_at,
          updated_at: o.updated_at,
        })),
        [
          'order_id',
          'restaurant_id',
          'table_number',
          'status',
          'total_amount',
          'currency',
          'payment_method',
          'customer_name',
          'customer_phone',
          'special_requests',
          'created_at',
          'updated_at',
        ]
      );
      zip.file('01_orders.csv', ordersCSV);
    }

    // 2. PAYMENTS - Payment transactions
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (payments && payments.length > 0) {
      const paymentsCSV = arrayToCSV(
        payments.map(p => ({
          payment_id: p.id,
          order_id: p.order_id,
          restaurant_id: p.restaurant_id,
          amount: p.amount ? p.amount / 100 : null,
          currency: p.currency || 'USD',
          payment_method: p.payment_method,
          status: p.status,
          transaction_id: p.transaction_id,
          moneroo_reference: p.moneroo_reference,
          error_message: p.error_message,
          created_at: p.created_at,
          updated_at: p.updated_at,
        })),
        [
          'payment_id',
          'order_id',
          'restaurant_id',
          'amount',
          'currency',
          'payment_method',
          'status',
          'transaction_id',
          'moneroo_reference',
          'error_message',
          'created_at',
          'updated_at',
        ]
      );
      zip.file('02_payments.csv', paymentsCSV);
    }

    // 3. PAYMENTS_BY_DAY - Daily revenue aggregation
    const { data: paymentsByDay } = await supabase
      .from('payments_by_day')
      .select('*')
      .order('date', { ascending: false })
      .limit(365);

    if (paymentsByDay && paymentsByDay.length > 0) {
      const dailyCSV = arrayToCSV(
        paymentsByDay.map(d => ({
          date: d.date,
          restaurant_id: d.restaurant_id,
          total_amount: d.total_amount ? d.total_amount / 100 : null,
          currency: d.currency || 'USD',
          transaction_count: d.transaction_count,
          status: d.status,
          created_at: d.created_at,
        })),
        [
          'date',
          'restaurant_id',
          'total_amount',
          'currency',
          'transaction_count',
          'status',
          'created_at',
        ]
      );
      zip.file('03_payments_by_day.csv', dailyCSV);
    }

    // 4. PRODUCTS - Menu items
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (products && products.length > 0) {
      const productsCSV = arrayToCSV(
        products.map(p => ({
          product_id: p.id,
          restaurant_id: p.restaurant_id,
          name: p.name,
          description: p.description,
          price: p.price ? p.price / 100 : null,
          currency: p.currency || 'USD',
          category: p.category,
          image_url: p.image_url,
          available: p.available,
          created_at: p.created_at,
          updated_at: p.updated_at,
        })),
        [
          'product_id',
          'restaurant_id',
          'name',
          'description',
          'price',
          'currency',
          'category',
          'image_url',
          'available',
          'created_at',
          'updated_at',
        ]
      );
      zip.file('04_products.csv', productsCSV);
    }

    // 5. RESTAURANTS - Restaurant metadata
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1000);

    if (restaurants && restaurants.length > 0) {
      const restaurantsCSV = arrayToCSV(
        restaurants.map(r => ({
          restaurant_id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          address: r.address,
          city: r.city,
          country: r.country,
          phone: r.phone,
          email: r.email,
          currency: r.currency || 'USD',
          timezone: r.timezone,
          active: r.active,
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
        [
          'restaurant_id',
          'name',
          'slug',
          'description',
          'address',
          'city',
          'country',
          'phone',
          'email',
          'currency',
          'timezone',
          'active',
          'created_at',
          'updated_at',
        ]
      );
      zip.file('05_restaurants.csv', restaurantsCSV);
    }

    // 6. HOURLY ANALYTICS - Computed metrics
    const { data: ordersForHourly } = await supabase
      .from('orders')
      .select('created_at, total_amount, status')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (ordersForHourly && ordersForHourly.length > 0) {
      const hourlyMap = new Map<
        string,
        { hour: string; order_count: number; total_revenue: number }
      >();

      for (const order of ordersForHourly) {
        const date = new Date(order.created_at);
        const hour = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours()).toISOString();

        const existing = hourlyMap.get(hour) || {
          hour,
          order_count: 0,
          total_revenue: 0,
        };

        existing.order_count += 1;
        if (order.status === 'PAID' || order.status === 'SERVED') {
          existing.total_revenue += order.total_amount || 0;
        }

        hourlyMap.set(hour, existing);
      }

      const hourlyData = Array.from(hourlyMap.values()).sort(
        (a, b) => new Date(b.hour).getTime() - new Date(a.hour).getTime()
      );

      const hourlyCSV = arrayToCSV(
        hourlyData.map(h => ({
          hour: h.hour,
          order_count: h.order_count,
          total_revenue: h.total_revenue ? h.total_revenue / 100 : null,
        })),
        ['hour', 'order_count', 'total_revenue']
      );
      zip.file('06_hourly_analytics.csv', hourlyCSV);
    }



    // Generate ZIP
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="wego-data-export-${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
