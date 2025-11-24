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
