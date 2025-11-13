
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function signin(formData: FormData) {
  console.log('signin action called')
  const supabase = await createClient()

  const { email, password } = signinSchema.parse(Object.fromEntries(formData.entries()))

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('supabase.auth.signInWithPassword result:', { error })

  if (error) {
    console.error('signin error:', error)
    return { error: error.message }
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  // Redirect based on role
  if (profile?.role === 'owner') {
    // Restaurant owners go to dashboard
    redirect('/dashboard/restaurants')
  } else {
    // Clients go to browse restaurants
    // (Note: They can also browse without signing in)
    redirect('/restaurants')
  }
}
