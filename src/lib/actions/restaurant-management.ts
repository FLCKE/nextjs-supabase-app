'use server';

import { createClient } from '@/lib/supabase/server';
import { restaurantSchema, locationSchema, tableSchema } from '@/lib/validation/restaurant';
import type { Restaurant, Location, Table } from '@/types';
import { revalidatePath } from 'next/cache';

// Restaurant CRUD
export async function getRestaurants(): Promise<Restaurant[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // First, check if the user has the 'owner' role in their profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If the user is not an owner, they should not see any restaurants in this view.
  if (profileError || !profile || profile.role !== 'owner') {
    if (profileError) console.error('Error fetching profile for getRestaurants:', profileError);
    return [];
  }

  // If they are an owner, fetch their restaurants
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching restaurants for owner:', error);
    throw error;
  }
  return data || [];
}

export async function getRestaurantsByOwner() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated', data: null };
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data, error: null };
}

export async function getUserRestaurants(): Promise<Restaurant[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user restaurants:', error);
    return [];
  }

  return data || [];
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRestaurant(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const rawData = {
    name: formData.get('name'),
    legal_name: formData.get('legal_name'),
    country: formData.get('country'),
    currency: formData.get('currency'),
  };

  const validatedData = restaurantSchema.parse(rawData);

  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      ...validatedData,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/dashboard/restaurants');
  return data;
}

export async function updateRestaurant(id: string, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name'),
    legal_name: formData.get('legal_name'),
    country: formData.get('country'),
    currency: formData.get('currency'),
  };

  const validatedData = restaurantSchema.parse(rawData);

  const { data, error } = await supabase
    .from('restaurants')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/dashboard/restaurants');
  revalidatePath(`/dashboard/restaurants/${id}`);
  return data;
}

export async function deleteRestaurant(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath('/dashboard/restaurants');
}

// Location CRUD
export async function getLocations(restaurantId: string): Promise<Location[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getLocation(id: string): Promise<Location | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createLocation(restaurantId: string, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name'),
    timezone: formData.get('timezone'),
  };

  const validatedData = locationSchema.parse(rawData);

  const { data, error } = await supabase
    .from('locations')
    .insert({
      ...validatedData,
      restaurant_id: restaurantId,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
  return data;
}

export async function updateLocation(id: string, restaurantId: string, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    name: formData.get('name'),
    timezone: formData.get('timezone'),
  };

  const validatedData = locationSchema.parse(rawData);

  const { data, error } = await supabase
    .from('locations')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
  return data;
}

export async function deleteLocation(id: string, restaurantId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
}

// Table CRUD
export async function getTables(locationId: string): Promise<Table[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTable(id: string): Promise<Table | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTable(locationId: string, restaurantId: string, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    label: formData.get('label'),
    active: formData.get('active') === 'true',
  };

  const validatedData = tableSchema.parse(rawData);

  const { data, error } = await supabase
    .from('tables')
    .insert({
      ...validatedData,
      location_id: locationId,
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
  return data;
}

export async function updateTable(id: string, restaurantId: string, formData: FormData) {
  const supabase = await createClient();

  const rawData = {
    label: formData.get('label'),
    active: formData.get('active') === 'true',
  };

  const validatedData = tableSchema.parse(rawData);

  const { data, error } = await supabase
    .from('tables')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
  return data;
}

export async function deleteTable(id: string, restaurantId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id);

  if (error) throw error;
  
  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
}

export async function regenerateQRToken(id: string, restaurantId: string) {
  const supabase = await createClient();

  const newToken = crypto.randomUUID();

  const { data, error } = await supabase
    .from('tables')
    .update({ qr_token: newToken })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath(`/dashboard/restaurants/${restaurantId}`);
  return data;
}

// Get tables by restaurant
export async function getTablesByRestaurant(restaurantId: string) {
  try {
    const supabase = await createClient();

    // First get all location IDs for this restaurant
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('id')
      .eq('restaurant_id', restaurantId);

    if (locError) throw locError;

    const locationIds = (locations || []).map((loc) => loc.id);

    if (locationIds.length === 0) {
      return { success: true, data: [], error: null };
    }

    // Then get tables for these locations
    const { data, error } = await supabase
      .from('tables')
      .select(
        `
        id,
        label,
        active,
        location_id,
        locations(name)
      `
      )
      .in('location_id', locationIds);

    if (error) throw error;

    const formattedTables = (data || []).map((table: any) => ({
      id: table.id,
      table_number: table.label,
      capacity: 0,
      status: table.active ? 'available' : 'occupied',
      location_id: table.location_id,
      location_name: table.locations?.name || 'Unknown',
    }));

    return { success: true, data: formattedTables, error: null };
  } catch (error) {
    console.error('Error fetching tables:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to load tables',
    };
  }
}

// Delete restaurant table
export async function deleteRestaurantTable(tableId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('tables').delete().eq('id', tableId);

    if (error) throw error;

    revalidatePath('/dashboard/tables');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete table',
    };
  }
}

// Create table for a location
export async function createTableForLocation(locationId: string, label: string) {
  try {
    const supabase = await createClient();

    const validatedData = tableSchema.parse({
      label,
      active: true,
    });

    // Generate QR token
    const qrToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from('tables')
      .insert({
        ...validatedData,
        location_id: locationId,
        qr_token: qrToken,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tables');
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error creating table:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create table',
    };
  }
}

// Generate QR code URL for a table
export async function generateTableQRCode(tableId: string, tableLabel: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const qrUrl = `${baseUrl}/public/menu?table=${tableId}`;
    
    // Using qrcode.org as a free QR code generator
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
    
    return { success: true, qrUrl, qrCodeImageUrl, error: null };
  } catch (error) {
    console.error('Error generating QR code:', error);
    return {
      success: false,
      qrUrl: null,
      qrCodeImageUrl: null,
      error: error instanceof Error ? error.message : 'Failed to generate QR code',
    };
  }
}
