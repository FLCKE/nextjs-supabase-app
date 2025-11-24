'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { createOrderSchema, type CreateOrderPayload } from '@/lib/validation/pos';
import { getLocations, getTables } from './restaurant-management';
import type { MenuItemWithMenu, LocationWithTables } from '@/types';

/**
 * Fetches all the necessary initial data for the POS interface for a given restaurant.
 * @param restaurantId - The ID of the restaurant.
 * @returns An object containing active menus with their items, and locations with their tables.
 */
export async function getPosData(restaurantId: string): Promise<{
  menus: MenuItemWithMenu[],
  locationsWithTables: LocationWithTables[]
}> {
  const supabase = await createClient();

  // 1. Fetch active menus and their active items for the restaurant
  const { data: menus, error: menuError } = await supabase
    .from('menus')
    .select(`
      id,
      name,
      menu_items (
        id,
        name,
        description,
        price_cts,
        currency,
        stock_mode,
        stock_qty,
        image_url
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .eq('menu_items.active', true);

  if (menuError) {
    console.error('Error fetching POS menu data:', menuError);
    throw new Error('Could not load menu data.');
  }

  // Transform the data to a flat array of menu items with their menu name as category
  const menuItems: MenuItemWithMenu[] = menus.flatMap(menu => 
    menu.menu_items.map(item => ({
      ...item,
      category: menu.name,
    }))
  );
  
  // 2. Fetch locations and their tables
  const locations = await getLocations(restaurantId);
  const locationsWithTables = await Promise.all(
    locations.map(async (location) => {
      const tables = await getTables(location.id);
      return { ...location, tables };
    })
  );

  return { menus: menuItems, locationsWithTables };
}

/**
 * Creates a new order. This is a complex transaction that involves:
 * 1. Validating the input.
 * 2. Verifying stock for items with 'FINITE' stock mode.
 * 3. Calculating totals.
 * 4. Inserting the order and order items into the database.
 * 5. Updating stock quantities.
 * @param payload - The order creation payload.
 * @returns An object indicating success or failure.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Get current user and validate payload
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const validatedPayload = createOrderSchema.parse(payload);
    const { tableId, items, notes } = validatedPayload;
    
    // Use an admin client for transactions and stock updates to bypass RLS if needed
    const supabaseAdmin = createAdminClient();

    // Step 2: Fetch all item details and table info in parallel
    const itemIds = items.map(item => item.itemId);
    const [
      { data: itemDetails, error: itemError },
      { data: tableDetails, error: tableError }
    ] = await Promise.all([
      supabaseAdmin.from('menu_items').select('*').in('id', itemIds),
      supabaseAdmin.from('tables').select('id, location_id').eq('id', tableId).single()
    ]);
    
    if (itemError || !itemDetails || itemDetails.length !== itemIds.length) {
      throw new Error('One or more menu items could not be found.');
    }
    if (tableError || !tableDetails) {
      throw new Error('Table not found.');
    }
    const locationId = tableDetails.location_id;

    // Get restaurant_id from the first item (assuming all items are from the same restaurant)
    const { data: menu, error: menuError } = await supabaseAdmin
        .from('menus')
        .select('restaurant_id')
        .eq('id', itemDetails[0].menu_id)
        .single();
    if(menuError || !menu) throw new Error('Could not determine restaurant for the order.');
    const restaurantId = menu.restaurant_id;

    // Step 3: Verify stock and calculate totals
    let totalNetCts = 0;
    let taxesCts = 0;
    const itemsToUpdateStock = [];

    for (const orderItem of items) {
      const detail = itemDetails.find(d => d.id === orderItem.itemId);
      if (!detail) throw new Error(`Invalid item ID: ${orderItem.itemId}`);

      if (detail.stock_mode === 'FINITE') {
        const currentStock = await getCurrentStock(detail.id, supabaseAdmin);
        if (currentStock < orderItem.quantity) {
          throw new Error(`Not enough stock for ${detail.name}. Available: ${currentStock}`);
        }
        itemsToUpdateStock.push({
            item_id: detail.id,
            quantity: orderItem.quantity,
            type: 'OUT',
            reason: `Sale on order`,
            created_by: user.id
        });
      }

      totalNetCts += detail.price_cts * orderItem.quantity;
      taxesCts += Math.round(detail.price_cts * (detail.tax_rate / 100)) * orderItem.quantity;
    }
    const totalGrossCts = totalNetCts + taxesCts;
    const currency = itemDetails[0].currency;

    // Step 4: Perform the transaction
    const { error: transactionError } = await supabaseAdmin.rpc('create_order_with_items', {
      p_restaurant_id: restaurantId,
      p_location_id: locationId,
      p_table_id: tableId,
      p_notes: notes,
      p_currency: currency,
      p_total_net_cts: totalNetCts,
      p_taxes_cts: taxesCts,
      p_total_gross_cts: totalGrossCts,
      p_changed_by: user.id,
      p_order_items: items.map(item => {
        const detail = itemDetails.find(d => d.id === item.itemId);
        return {
          item_id: item.itemId,
          name: detail!.name,
          qty: item.quantity,
          unit_price_cts: detail!.price_cts,
          total_price_cts: detail!.price_cts * item.quantity
        };
      }),
      p_stock_adjustments: itemsToUpdateStock
    });
    
    if(transactionError) throw transactionError;

    revalidatePath('/dashboard/pos');
    revalidatePath('/dashboard/orders');

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// Helper to get current stock. Could be an RPC function for better performance.
async function getCurrentStock(itemId: string, client: any) {
    const { data, error } = await client
      .from('inventory_adjustments')
      .select('type, quantity')
      .eq('item_id', itemId);

    if (error) throw error;

    return data.reduce((acc: number, adj: { type: string, quantity: number }) => {
        if (adj.type === 'IN') return acc + adj.quantity;
        return acc - adj.quantity;
    }, 0);
}

// NOTE: The 'create_order_with_items' RPC function needs to be created in the database.
// This function would wrap the inserts into a single transaction to ensure atomicity.
// I will need to create a migration for this function.

