
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './_components/profile-form'
import { type Profile } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let profile: Profile

  if (!profileData) {
    profile = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata.full_name,
      role: 'staff',
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } else {
    profile = profileData as Profile
  }

  return <ProfileForm profile={profile} />
}
