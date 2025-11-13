'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  createMenuSchema,
  updateMenuSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  type CreateMenuInput,
  type UpdateMenuInput,
  type CreateMenuItemInput,
  type UpdateMenuItemInput,
} from '@/lib/validation/menu';
import type { Menu, MenuItem, MenuWithItemCount } from '@/types';

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Menu CRUD Operations
export async function createMenu(input: CreateMenuInput): Promise<ActionResult<Menu>> {
  try {
    const validated = createMenuSchema.parse(input);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menus')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    return { success: true, data };
  } catch (error) {
    console.error('Create menu error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create menu',
    };
  }
}

export async function updateMenu(input: UpdateMenuInput): Promise<ActionResult<Menu>> {
  try {
    const validated = updateMenuSchema.parse(input);
    const supabase = await createClient();

    const { id, ...updates } = validated;

    const { data, error } = await supabase
      .from('menus')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    return { success: true, data };
  } catch (error) {
    console.error('Update menu error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update menu',
    };
  }
}

export async function deleteMenu(menuId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId);

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    return { success: true };
  } catch (error) {
    console.error('Delete menu error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete menu',
    };
  }
}

export async function toggleMenuActive(menuId: string, isActive: boolean): Promise<ActionResult<Menu>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menus')
      .update({ is_active: isActive })
      .eq('id', menuId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    return { success: true, data };
  } catch (error) {
    console.error('Toggle menu active error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle menu status',
    };
  }
}

export async function getMenusByRestaurant(restaurantId: string): Promise<ActionResult<MenuWithItemCount[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menus')
      .select('*, menu_items(count)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const menusWithCount: MenuWithItemCount[] = (data || []).map((menu: any) => ({
      id: menu.id,
      restaurant_id: menu.restaurant_id,
      name: menu.name,
      is_active: menu.is_active,
      created_at: menu.created_at,
      updated_at: menu.updated_at,
      item_count: menu.menu_items[0]?.count || 0,
    }));

    return { success: true, data: menusWithCount };
  } catch (error) {
    console.error('Get menus error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menus',
    };
  }
}

export async function getMenuById(menuId: string): Promise<ActionResult<Menu>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get menu error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menu',
    };
  }
}

// Menu Item CRUD Operations
export async function createMenuItem(input: CreateMenuItemInput): Promise<ActionResult<MenuItem>> {
  try {
    const validated = createMenuItemSchema.parse(input);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menu_items')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    revalidatePath(`/dashboard/menus/${validated.menu_id}/items`);
    return { success: true, data };
  } catch (error) {
    console.error('Create menu item error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create menu item',
    };
  }
}

export async function updateMenuItem(input: UpdateMenuItemInput): Promise<ActionResult<MenuItem>> {
  try {
    const validated = updateMenuItemSchema.parse(input);
    const supabase = await createClient();

    const { id, ...updates } = validated;

    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    revalidatePath(`/dashboard/menus/${data.menu_id}/items`);
    return { success: true, data };
  } catch (error) {
    console.error('Update menu item error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update menu item',
    };
  }
}

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const { data: item } = await supabase
      .from('menu_items')
      .select('menu_id')
      .eq('id', itemId)
      .single();

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    if (item) {
      revalidatePath(`/dashboard/menus/${item.menu_id}/items`);
    }
    return { success: true };
  } catch (error) {
    console.error('Delete menu item error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete menu item',
    };
  }
}

export async function toggleMenuItemActive(itemId: string, active: boolean): Promise<ActionResult<MenuItem>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menu_items')
      .update({ active })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/menus');
    revalidatePath(`/dashboard/menus/${data.menu_id}/items`);
    return { success: true, data };
  } catch (error) {
    console.error('Toggle menu item active error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle item status',
    };
  }
}

export async function getMenuItemsByMenu(menuId: string): Promise<ActionResult<MenuItem[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', menuId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get menu items error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch menu items',
    };
  }
}

export async function uploadMenuItemImage(
  menuId: string,
  itemId: string,
  file: File
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${menuId}/${itemId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(fileName);

    return { success: true, data: publicUrl };
  } catch (error) {
    console.error('Upload image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

export async function deleteMenuItemImage(imageUrl: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    
    const fileName = imageUrl.split('/menu-images/').pop();
    if (!fileName) throw new Error('Invalid image URL');

    const { error } = await supabase.storage
      .from('menu-images')
      .remove([fileName]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Delete image error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}
