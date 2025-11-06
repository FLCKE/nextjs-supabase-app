
'use server'

import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validation/profile'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update your profile' }
  }
  console.log('updateProfile action called by user:', user.id)
  const { full_name, phone } = profileSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
  console.log('supabase.from.profiles.update result:', { error })
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { error: null }
}
