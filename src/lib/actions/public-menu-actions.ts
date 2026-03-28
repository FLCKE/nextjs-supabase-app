'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { uuid } from 'zod';

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  price_cts: number;
  tax_rate: number;
  category: string | null;
  image_url: string | null;
  active: boolean;
  stock_mode: 'INFINITE' | 'FINITE';
  stock_qty: number | null;
  menu_id: string;
  menu_name: string;
}

export interface PublicMenuData {
  restaurant_name: string;
  table_label: string;
  currency: string;
  menu_items: PublicMenuItem[];
  categories: string[];
}

/**
 * Fetch public menu by table token (no authentication required)
 */
export async function getPublicMenu(tableToken: string) {
  try {
    const supabaseAdmin = createAdminClient();

    // Validate table token and get table info directly
    const { data: tableData, error: tableError } = await supabaseAdmin
      .from('tables')
      .select(`
        id,
        label,
        restaurant_id,
        restaurants!inner(
          id,
          name,
          currency
        )
      `)
      .eq('qr_token', tableToken)
      .eq('active', true)
      .single();

    if (tableError || !tableData) {
      return {
        success: false,
        error: 'Invalid or inactive table',
      };
    }

    const table_id = tableData.id;
    const table_label = tableData.label;
    const restaurant_id = tableData.restaurant_id;
    const restaurantData = (tableData.restaurants as any);

    // Get active menu items for this restaurant
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price_cts,
        tax_rate,
        image_url,
        active,
        stock_mode,
        stock_qty,
        menu_id,
        menus!inner(
          name,
          is_active,
          restaurant_id
        )
      `)
      .eq('menus.restaurant_id', restaurant_id)
      .eq('menus.is_active', true)
      .eq('active', true)
      .order('name');

    if (menuError) {
      return {
        success: false,
        error: 'Failed to load menu items',
      };
    }

    // Filter out items with zero stock
    const availableItems = (menuItems || []).filter((item: any) => {
      if (item.stock_mode === 'FINITE') {
        return item.stock_qty !== null && item.stock_qty > 0;
      }
      return true;
    });

    // Transform menu items
    const transformedItems: PublicMenuItem[] = availableItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price_cts: item.price_cts,
      tax_rate: item.tax_rate || 0,
      category: null,
      image_url: item.image_url,
      active: item.active,
      stock_mode: item.stock_mode,
      stock_qty: item.stock_qty,
      menu_id: item.menu_id,
      menu_name: item.menus.name,
    }));

    // Get unique categories
    const categories = [
      ...new Set(
        transformedItems
          .map((item) => item.category)
          .filter((cat): cat is string => cat !== null)
      ),
    ];

    const result: PublicMenuData = {
      restaurant_name: restaurantData.name,
      table_label,
      currency: restaurantData.currency || 'USD',
      menu_items: transformedItems,
      categories,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching public menu:', error);
    return {
      success: false,
      error: 'Failed to load menu',
    };
  }
}

/**
 * Fetch public menu by restaurant ID (no authentication required, no specific table)
 */
export async function getPublicMenuByRestaurant(restaurantId: string) {
  try {
    const supabase = await createClient();

    // Get restaurant and first location info
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select(`
        id,
        name,
        currency
      `)
      .eq('id', restaurantId)
      .single();
      // console.log('Fetched restaurant data:', restaurantData);
    if (restaurantError || !restaurantData) {
      return {
        success: false,
        error: 'Restaurant not found',
      };
    }

    

    // Get active menu items for this restaurant
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price_cts,
        tax_rate,
        image_url,
        active,
        stock_mode,
        stock_qty,
        menu_id,
        category,
        menus!inner(
          name,
          is_active,
          restaurant_id
        )
      `)
      .eq('menus.restaurant_id', restaurantId)
      .eq('menus.is_active', true)
      .eq('active', true)
      .order('name');

    if (menuError) {
      console.error('Menu items fetch error:', menuError);
      return {
        success: false,
        error: 'Failed to load menu items',
      };
    }

    // Filter out items with zero stock
    const availableItems = (menuItems || []).filter((item: any) => {
      if (item.stock_mode === 'FINITE') {
        return item.stock_qty !== null && item.stock_qty > 0;
      }
      return true;
    });

    // Transform menu items
    const transformedItems: PublicMenuItem[] = availableItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price_cts: item.price_cts,
      tax_rate: item.tax_rate || 0,
      category: item.category,
      image_url: item.image_url,
      active: item.active,
      stock_mode: item.stock_mode,
      stock_qty: item.stock_qty,
      menu_id: item.menu_id,
      menu_name: item.menus.name,
    }));

    // Get unique categories
    const categories = [
      ...new Set(
        transformedItems
          .map((item) => item.category)
          .filter((cat): cat is string => cat !== null)
      ),
    ];

    const result: PublicMenuData = {
      restaurant_name: restaurantData.name,
      table_label: '', // No specific table for restaurant-level QR
      currency: restaurantData.currency || 'USD',
      menu_items: transformedItems,
      categories,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error fetching public menu by restaurant:', error);
    return {
      success: false,
      error: 'Failed to load menu ',
    };
  }
}

/**
 * Creates an order from public checkout using table token
 */
export async function createPublicOrder(
  tableToken: string,
  items: Array<{ id: string; quantity: number; price_cts: number; name: string }>,
  restaurant_id?:string,
  notes?: string
) {
  try {
    console.log('Creating order with:', { tableToken, items, restaurant_id, notes });

    const supabaseAdmin = createAdminClient();

    let table_id: string | null = null;
    let final_restaurant_id = restaurant_id;

    // If table token provided, look it up
    if (tableToken && tableToken.trim()) {
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('tables')
        .select(`
          id,
          restaurant_id
        `)
        .eq('qr_token', tableToken)
        .eq('active', true)
        .maybeSingle();
      
      console.log('Table lookup result:', { tableError, tableData });

      if (tableError) {
        console.error('Table lookup error:', tableError);
        return {
          success: false,
          error: 'Failed to look up table token',
        };
      }

      if (!tableData) {
        console.warn('No table found for token:', tableToken);
        // Continue without table - use restaurant_id if provided
        if (!restaurant_id) {
          return {
            success: false,
            error: 'Invalid table token and no restaurant ID provided',
          };
        }
      } else {
        table_id = tableData.id;
        final_restaurant_id = restaurant_id || tableData.restaurant_id;
      }
    }

    // Must have restaurant_id
    if (!final_restaurant_id) {
      return {
        success: false,
        error: 'Restaurant ID is required',
      };
    }

    // If no table_id found, get the first active table for this restaurant
    if (!table_id) {
      console.log('No table_id found, looking for default table for restaurant:', final_restaurant_id);
      const { data: defaultTable, error: tableError } = await supabaseAdmin
        .from('tables')
        .select('id')
        .eq('restaurant_id', final_restaurant_id)
        .eq('active', true)
        .limit(1)
        .maybeSingle();

      if (tableError) {
        console.error('Error fetching default table:', tableError);
        return {
          success: false,
          error: 'Failed to find a table for this order',
        };
      }

      if (!defaultTable) {
        return {
          success: false,
          error: 'No active tables found for this restaurant',
        };
      }

      table_id = defaultTable.id;
      console.log('Using default table:', table_id);
    }

    console.log('Using:', { table_id, final_restaurant_id });

    // Fetch restaurant currency
    const { data: restaurant, error: restaurantError } = await supabaseAdmin
      .from('restaurants')
      .select('currency')
      .eq('id', final_restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return {
        success: false,
        error: 'Restaurant not found',
      };
    }

    const currency = restaurant.currency || 'USD';

    // Calculate totals
    let totalNetCts = 0;
    let taxesCts = 0;

    // Fetch menu items to get tax rates
    const itemIds = items.map(item => item.id);
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('id, tax_rate')
      .in('id', itemIds);

    if (menuError || !menuItems || menuItems.length === 0) {
      return {
        success: false,
        error: 'Failed to fetch item details',
      };
    }

    // Calculate totals with tax
    for (const item of items) {
      const menuItem = menuItems.find(m => m.id === item.id);
      if (!menuItem) {
        return {
          success: false,
          error: `Item ${item.id} not found`,
        };
      }

      const itemNetPrice = item.price_cts * item.quantity;
      const itemTaxes = Math.round(item.price_cts * ((menuItem.tax_rate || 0) / 100)) * item.quantity;
      
      totalNetCts += itemNetPrice;
      taxesCts += itemTaxes;
    }

    const totalGrossCts = totalNetCts + taxesCts;

    // Create order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        table_id: table_id,
        restaurant_id: final_restaurant_id,
        status: 'pending',
        currency,
        total_net_cts: totalNetCts,
        taxes_cts: taxesCts,
        total_gross_cts: totalGrossCts,
        notes: notes || null,
      })
      .select()
      .single();

      console.log('Order creation result:', { orderError, orderId: orderData?.id });

      if (orderError || !orderData) {
        console.error('Error creating order:', orderError);
        return {
          success: false,
          error: 'Failed to create order: ' + (orderError?.message || 'Unknown error'),
        };
      }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: orderData.id,
      item_id: item.id,
      name: item.name,
      qty: item.quantity,
      unit_price_cts: item.price_cts,
      total_price_cts: item.price_cts * item.quantity,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    console.log('Order items insertion result:', { itemsError });

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to rollback the order
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', orderData.id);
      return {
        success: false,
        error: 'Failed to add items to order',
      };
    }

    return {
      success: true,
      message: 'Order created successfully',
      orderId: orderData.id,
    };
  } catch (error) {
    console.error('Error in createPublicOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred: ' + (error instanceof Error ? error.message : String(error)),
    };
  }
}
