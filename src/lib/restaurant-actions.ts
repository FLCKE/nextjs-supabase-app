'use server'

import { createClient } from '@/lib/supabase/server'
import { restaurantSchema, locationSchema, tableSchema } from '@/lib/validation/restaurant'
import { revalidatePath } from 'next/cache'

// Restaurant Actions
export async function createRestaurant(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const data = restaurantSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('restaurants')
    .insert({
      owner_id: user.id,
      ...data,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/restaurants')
  return { success: true }
}

export async function updateRestaurant(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const data = restaurantSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('restaurants')
    .update(data)
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/restaurants')
  revalidatePath(`/dashboard/restaurants/${id}`)
  return { success: true }
}

export async function deleteRestaurant(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/restaurants')
  return { success: true }
}

// Location Actions
export async function createLocation(restaurantId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const data = locationSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('locations')
    .insert({
      restaurant_id: restaurantId,
      ...data,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/restaurants/${restaurantId}`)
  return { success: true }
}

export async function updateLocation(id: string, restaurantId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const data = locationSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('locations')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/restaurants/${restaurantId}`)
  return { success: true }
}

export async function deleteLocation(id: string, restaurantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/restaurants/${restaurantId}`)
  return { success: true }
}

// Table Actions
export async function createTable(locationId: string, restaurantId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const data = tableSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('tables')
    .insert({
      location_id: locationId,
      ...data,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/restaurants/${restaurantId}`)
  return { success: true }
}

export async function updateTable(id: string, restaurantId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const data = tableSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('tables')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/restaurants/${restaurantId}`)
  return { success: true }
}

export async function deleteTable(id: string, restaurantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('tables')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/restaurants/${restaurantId}`)
  return { success: true }
}
