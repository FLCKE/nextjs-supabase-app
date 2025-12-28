'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

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
  location_name: string;
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
    const supabase = await createClient();

    // Validate table token and get table info
    const { data: tableInfo, error: tokenError } = await supabase
      .rpc('validate_table_token', { p_table_token: tableToken })
      .single();

    if (tokenError || !tableInfo) {
      return {
        success: false,
        error: 'Invalid or inactive table',
      };
    }

    const { table_id, table_label, location_id, restaurant_id } = tableInfo as {
      table_id: string;
      table_label: string;
      location_id: string;
      restaurant_id: string;
      currency: string;
    };

    // Get restaurant and location info
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .select(`
        id,
        name,
        restaurants!inner(
          id,
          name,
          currency
        )
      `)
      .eq('id', location_id)
      .single();

    if (locationError || !locationData) {
      return {
        success: false,
        error: 'Location not found',
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
        category,
        image_url,
        active,
        stock_mode,
        stock_qty,
        menu_id,
        menus!inner(
          name,
          active,
          restaurant_id
        )
      `)
      .eq('menus.restaurant_id', restaurant_id)
      .eq('menus.active', true)
      .eq('active', true)
      .order('category')
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
      restaurant_name: (locationData.restaurants as any).name,
      location_name: locationData.name,
      table_label,
      currency: (locationData.restaurants as any).currency || 'USD',
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

    if (restaurantError || !restaurantData) {
      return {
        success: false,
        error: 'Restaurant not found',
      };
    }

    // Get first location
    const { data: locations, error: locationsError } = await supabase
      .from('locations')
      .select('id, name')
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (locationsError || !locations || locations.length === 0) {
      return {
        success: false,
        error: 'Location not found',
      };
    }

    const location = locations[0];

    // Get active menu items for this restaurant
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        price_cts,
        tax_rate,
        category,
        image_url,
        active,
        stock_mode,
        stock_qty,
        menu_id,
        menus!inner(
          name,
          active,
          restaurant_id
        )
      `)
      .eq('menus.restaurant_id', restaurantId)
      .eq('menus.active', true)
      .eq('active', true)
      .order('category')
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
      location_name: location.name,
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
      error: 'Failed to load menu',
    };
  }
}

/**
 * Creates an order from public checkout using table token
 */
export async function createPublicOrder(
  tableToken: string,
  items: Array<{ id: string; quantity: number; price_cts: number; name: string }>,
  notes?: string
) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Validate table token and get table info
    const { data: tableInfo, error: tokenError } = await supabase
      .rpc('validate_table_token', { p_table_token: tableToken })
      .single();

    if (tokenError || !tableInfo) {
      return {
        success: false,
        error: 'Invalid or inactive table',
      };
    }

    const { table_id, location_id, restaurant_id } = tableInfo as {
      table_id: string;
      location_id: string;
      restaurant_id: string;
    };

    // Calculate totals
    let totalNetCts = 0;
    let taxesCts = 0;

    // Fetch menu items to get tax rates
    const itemIds = items.map(item => item.id);
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('id, tax_rate, currency')
      .in('id', itemIds);

    if (menuError || !menuItems || menuItems.length === 0) {
      return {
        success: false,
        error: 'Failed to fetch item details',
      };
    }

    const currency = menuItems[0].currency || 'USD';

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
      const itemTaxes = Math.round(item.price_cts * (menuItem.tax_rate / 100)) * item.quantity;
      
      totalNetCts += itemNetPrice;
      taxesCts += itemTaxes;
    }

    const totalGrossCts = totalNetCts + taxesCts;

    // Create order using RPC
    const { error: transactionError } = await supabaseAdmin.rpc('create_order_with_items', {
      p_restaurant_id: restaurant_id,
      p_location_id: location_id,
      p_table_id: table_id,
      p_notes: notes || null,
      p_currency: currency,
      p_total_net_cts: totalNetCts,
      p_taxes_cts: taxesCts,
      p_total_gross_cts: totalGrossCts,
      p_changed_by: null,
      p_order_items: items.map(item => ({
        item_id: item.id,
        name: item.name,
        qty: item.quantity,
        unit_price_cts: item.price_cts,
        total_price_cts: item.price_cts * item.quantity
      })),
      p_stock_adjustments: []
    });

    if (transactionError) {
      console.error('Error creating order:', transactionError);
      return {
        success: false,
        error: 'Failed to create order',
      };
    }

    return {
      success: true,
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error('Error in createPublicOrder:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
