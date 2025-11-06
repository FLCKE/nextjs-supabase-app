
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log('supabase.auth.signInWithPassword result:', { error })

  if (error) {
    console.error('signin error:', error)
    return { error: error.message }
  }

  redirect('/dashboard/profile')
}
