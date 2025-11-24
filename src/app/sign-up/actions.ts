
'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validation/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
  console.log('signup action called')
  const supabase = await createClient()

  const { email, password, full_name, role } = signupSchema.parse(Object.fromEntries(formData.entries()))

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
      },
    },
  })

  console.log('supabase.auth.signUp result:', { data, error })

  if (error) {
    console.error('signup error:', error)
    return { error: error.message }
  }

  if (!data.user) {
    console.error('signup error: user not created')
    return { error: 'User not created' }
  }

  // Use the admin client to bypass RLS for profile creation
  const supabaseAdmin = createAdminClient()
  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: data.user.id,
    email,
    full_name,
    role,
  })

  if (profileError) {
    console.error('profile creation error:', profileError)
    // If profile creation fails, we should probably delete the user
    // to avoid having an orphaned auth user.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    return { error: `Error creating profile: ${profileError.message}` }
  }

  // Redirect based on role
  if (role === 'owner') {
    // Restaurant owners go to dashboard to create their restaurant
    redirect('/dashboard')
  } else {
    // Clients can browse restaurants publicly (no login required for browsing)
    // But if they signed up, show them the restaurants page
    redirect('/restaurants')
  }
}
