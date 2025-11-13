'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  createInventoryAdjustmentSchema,
  type CreateInventoryAdjustmentInput,
} from '@/lib/validation/inventory';
import type { InventoryAdjustment, MenuItemWithStock } from '@/types';

/**
 * Create a new inventory adjustment
 */
export async function createInventoryAdjustment(data: CreateInventoryAdjustmentInput) {
  try {
    const supabase = await createClient();

    // Validate user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate input
    const validatedData = createInventoryAdjustmentSchema.parse(data);

    // Verify the user owns the restaurant for this item
    const { data: menuItem, error: itemError } = await supabase
      .from('menu_items')
      .select(
        `
        id,
        menu_id,
        menus!inner(
          id,
          restaurant_id,
          restaurants!inner(
            id,
            owner_id
          )
        )
      `
      )
      .eq('id', validatedData.item_id)
      .single();

    if (itemError || !menuItem) {
      return { success: false, error: 'Menu item not found' };
    }

    // Check ownership
    const restaurant = (menuItem.menus as any).restaurants;
    if (restaurant.owner_id !== user.id) {
      return { success: false, error: 'Not authorized to adjust inventory for this item' };
    }

    // Create the adjustment
    const { data: adjustment, error: createError } = await supabase
      .from('inventory_adjustments')
      .insert({
        item_id: validatedData.item_id,
        type: validatedData.type,
        quantity: validatedData.quantity,
        reason: validatedData.reason || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create adjustment error:', createError);
      return { success: false, error: 'Failed to create inventory adjustment' };
    }

    revalidatePath('/dashboard/inventory');
    return { success: true, data: adjustment };
  } catch (error) {
    console.error('Create inventory adjustment error:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get inventory adjustments for a specific item with filters
 */
export async function getInventoryAdjustments(
  itemId?: string,
  type?: 'IN' | 'OUT' | 'SPOILAGE'
): Promise<InventoryAdjustment[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    let query = supabase
      .from('inventory_adjustments')
      .select(
        `
        *,
        menu_items!inner(
          id,
          name,
          menus!inner(
            id,
            restaurant_id,
            restaurants!inner(
              id,
              owner_id
            )
          )
        )
      `
      )
      .order('created_at', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get inventory adjustments error:', error);
      return [];
    }

    // Filter by ownership (RLS should handle this but double check)
    const filtered = data.filter((adj: any) => {
      const restaurant = adj.menu_items?.menus?.restaurants;
      return restaurant?.owner_id === user.id;
    });

    return filtered as InventoryAdjustment[];
  } catch (error) {
    console.error('Get inventory adjustments error:', error);
    return [];
  }
}

/**
 * Get all menu items with current stock for a restaurant
 */
export async function getMenuItemsWithStock(
  restaurantId: string
): Promise<MenuItemWithStock[]> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // Verify ownership
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('owner_id')
      .eq('id', restaurantId)
      .single();

    if (!restaurant || restaurant.owner_id !== user.id) {
      return [];
    }

    // Get menu items with stock using the view
    const { data, error } = await supabase
      .from('menu_items_with_stock')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name');

    if (error) {
      console.error('Get menu items with stock error:', error);
      return [];
    }

    return data as MenuItemWithStock[];
  } catch (error) {
    console.error('Get menu items with stock error:', error);
    return [];
  }
}

/**
 * Get current stock for a specific item
 */
export async function getCurrentStock(itemId: string): Promise<number | null> {
  try {
    const supabase = await createClient();

    // Use the database function to calculate stock
    const { data, error } = await supabase.rpc('get_current_stock', {
      p_item_id: itemId,
    });

    if (error) {
      console.error('Get current stock error:', error);
      return null;
    }

    return data as number;
  } catch (error) {
    console.error('Get current stock error:', error);
    return null;
  }
}

/**
 * Get inventory summary for a restaurant
 */
export async function getInventorySummary(restaurantId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Verify ownership
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('owner_id')
      .eq('id', restaurantId)
      .single();

    if (!restaurant || restaurant.owner_id !== user.id) {
      return null;
    }

    const items = await getMenuItemsWithStock(restaurantId);

    const finiteItems = items.filter((item) => item.stock_mode === 'FINITE');
    const lowStockItems = finiteItems.filter(
      (item) => item.current_stock !== null && item.current_stock <= 5
    );
    const outOfStockItems = finiteItems.filter(
      (item) => item.current_stock !== null && item.current_stock === 0
    );

    return {
      totalItems: items.length,
      finiteStockItems: finiteItems.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems,
    };
  } catch (error) {
    console.error('Get inventory summary error:', error);
    return null;
  }
}
