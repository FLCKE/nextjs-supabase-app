'use server';

import { createClient } from '@/lib/supabase/server';

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
