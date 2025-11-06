
import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export function useUser() {
  const supabase = createClient()

  const { data: user, ...rest } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        return null
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      return profile
    },
  })

  return { user, ...rest }
}
