'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

type SupabaseContextType = {
  supabase: SupabaseClient
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // This hook will handle session updates and server-side rendering.
      // When the user signs in or out, the server components need to be re-rendered.
      // router.refresh() is a server-side reload that will re-run the middleware
      // and update the session cookie.
      console.log('Supabase auth event:', event);
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}
