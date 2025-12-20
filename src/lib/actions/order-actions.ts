'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Order, OrderStatus } from '@/types'; // Import Order and OrderStatus

// Zod schema for creating an order item
const CreateOrderItemInputSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
  unit_price_cts: z.number().int().min(0, 'Unit price cannot be negative.'),
  name: z.string().min(1, 'Item name is required.'),
  // total_price_cts will be calculated on the server
});

// Zod schema for creating an order
const CreateOrderInputSchema = z.object({
  table_id: z.string().uuid(),
  restaurant_id: z.string().uuid(), // Now directly part of order
  location_id: z.string().uuid(),   // Now directly part of order
  items: z.array(CreateOrderItemInputSchema).min(1, 'Order must contain at least one item.'),
  notes: z.string().optional().nullable(),
});

type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
type CreateOrderItemInput = z.infer<typeof CreateOrderItemInputSchema>;


/**
 * Creates a new order and its associated order items.
 * @param input - Data for creating the order.
 */
export async function createOrder(input: CreateOrderInput): Promise<{ success: boolean; data?: Order; error?: string }> {
  const supabase = await createClient();

  // Validate user (staff)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated.' };
  }

  // Validate input
  const validatedFields = CreateOrderInputSchema.safeParse(input);
  if (!validatedFields.success) {
    return { success: false, error: `Validation failed: ${validatedFields.error.message}` };
  }
  const { table_id, restaurant_id, location_id, items, notes } = validatedFields.data;

  // Verify staff member is associated with the restaurant and location
  // This check might be redundant if RLS is set up perfectly, but good for explicit server-side check.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('restaurant_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'staff' || profile.restaurant_id !== restaurant_id) {
    return { success: false, error: 'Not authorized to create orders for this restaurant.' };
  }

  // Fetch restaurant currency for the order
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('currency')
    .eq('id', restaurant_id)
    .single();

  if (restaurantError || !restaurant) {
    return { success: false, error: 'Restaurant not found or not accessible.' };
  }
  const currency = restaurant.currency;

  let total_net_cts = 0;
  let taxes_cts = 0;

  // Prepare order items and calculate totals
  const orderItemsToInsert = items.map(item => {
    const itemNetPrice = item.unit_price_cts * item.quantity;
    // Assuming tax_rate is retrieved from MenuItem or passed if needed
    // For now, let's assume item.tax_rate is needed (will need to fetch it or pass it)
    // To simplify for now, let's assume no tax for initial creation or default to 0
    // Real implementation would fetch tax rate from menu_items table
    const itemTax = 0; // Placeholder
    const itemTotalPrice = itemNetPrice + itemTax;

    total_net_cts += itemNetPrice;
    taxes_cts += itemTax;

    return {
      item_id: item.menu_item_id,
      name: item.name,
      qty: item.quantity,
      unit_price_cts: item.unit_price_cts,
      total_price_cts: itemTotalPrice,
    };
  });
  const total_gross_cts = total_net_cts + taxes_cts;

  try {
    // Start a transaction for order and order items insertion
    // Supabase client doesn't directly support transactions in server actions easily.
    // We'll rely on multiple inserts, and handle potential failures.
    // For robust transactions, database functions/procedures are better.

    // Insert order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id,
        restaurant_id,
        location_id,
        status: 'PENDING' as OrderStatus,
        currency,
        total_net_cts,
        taxes_cts,
        total_gross_cts,
        notes,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error('Error creating order:', orderError);
      return { success: false, error: 'Failed to create order.' };
    }

    // Insert order items
    const orderItemsWithOrderId = orderItemsToInsert.map(item => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      // TODO: Implement rollback for the order if order items insertion fails
      return { success: false, error: 'Failed to create order items.' };
    }

    // Revalidate relevant paths
    revalidatePath(`/dashboard/pos`);
    // revalidatePath(`/dashboard/orders/${newOrder.id}`); // If an order detail page exists

    return { success: true, data: newOrder };

  } catch (error: any) {
    console.error('Unexpected error in createOrder:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Fetches all active orders for a given table.
 * @param tableId The ID of the table.
 */
export async function getActiveOrdersForTable(tableId: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return []; // Not authenticated
  }

  // RLS should handle access based on restaurant ownership
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('table_id', tableId)
    .not('status', 'in', ['PAID', 'SERVED', 'CANCELLED', 'REFUNDED']) // Fetch orders not in final states
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active orders for table:', error);
    return [];
  }

  return orders;
}

/**
 * Fetches all orders for a specific restaurant
 * @param restaurantId - The restaurant ID to fetch orders for
 * @returns Array of orders or error message
 */
export async function getOrders(restaurantId?: string): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // If restaurantId provided, filter by it
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: orders || [] };
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

/**
 * Fetches a specific order by ID with its items
 * @param orderId - The order ID to fetch
 * @returns Order with items or null
 */
export async function getOrderById(orderId: string): Promise<(Order & { items: any[] }) | null> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    return {
      ...order,
      items: items || []
    } as Order & { items: any[] };
  } catch (error) {
    console.error('Unexpected error fetching order:', error);
    return null;
  }
}

/**
 * Updates the status of an order
 * @param orderId - The order ID to update
 * @param status - The new status
 * @returns Success or error message
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating order:', error);
    return { success: false, error: 'Failed to update order' };
  }
}