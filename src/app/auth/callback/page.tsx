'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1); // Remove '#'
        
        if (!hash) {
          toast.error('No authentication token found');
          router.push('/sign-in');
          return;
        }

        // Parse the fragment parameters
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const type = params.get('type');

        if (!accessToken || type !== 'magiclink') {
          toast.error('Invalid authentication');
          router.push('/sign-in');
          return;
        }

        // Set the session with the token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        });

        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed');
          router.push('/sign-in');
          return;
        }

        // Get the next URL from search params
        const searchParams = new URLSearchParams(window.location.search);
        const next = searchParams.get('next') || '/dashboard/pos';
        
        toast.success('Signed in successfully!');
        router.push(next);
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('Something went wrong');
        router.push('/sign-in');
      }
    };

    handleAuthCallback();
  }, [supabase, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}
