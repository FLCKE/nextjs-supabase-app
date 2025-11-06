
'use server'

import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validation/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
  console.log('signup action called')
  const supabase = await createClient()

  const { email, password, full_name } = signupSchema.parse(Object.fromEntries(formData.entries()))

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  })

  console.log('supabase.auth.signUp result:', { error })

  if (error) {
    console.error('signup error:', error)
    return { error: error.message }
  }

  redirect('/dashboard/profile')
}
