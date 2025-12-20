
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signin } from './actions';
import { toast } from 'sonner';
import { useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

import GeometricBackground from '@/components/ui/geometric-background';

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default function SigninPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { supabase } = useSupabase();

  // Handle magic link tokens from URL fragment
  useEffect(() => {
    const handleMagicLink = async () => {
      const hash = window.location.hash.substring(1); // Remove '#'
      
      if (!hash) return;

      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const type = params.get('type');

      if (!accessToken || type !== 'magiclink') return;

      try {
        toast.info('Processing magic link...');
        
        // Set the session with the token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        });

        if (error) {
          console.error('Magic link error:', error);
          toast.error('Authentication failed');
          return;
        }

        toast.success('Signed in successfully!');
        // Redirect to POS dashboard for staff
        router.push('/dashboard/pos');
      } catch (error) {
        console.error('Error processing magic link:', error);
        toast.error('Something went wrong');
      }
    };

    handleMagicLink();
  }, [supabase, router]);

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: z.infer<typeof signinSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      const { error } = await signin(formData);

      if (error) {
        toast.error(error);
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-purple-900 relative">
      <GeometricBackground />
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-none text-white z-10">
        <CardHeader className="text-center">
          <Link href="/" className="text-4xl font-bold text-white tracking-wider mb-4">
            Foodie
          </Link>
          <CardTitle className="text-3xl">Sign In</CardTitle>
          <CardDescription className="text-gray-300">Welcome back! Sign in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} className="bg-white/20 border-none" />
              {form.formState.errors.email && (
                <p className="text-red-400 text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register('password')} className="bg-white/20 border-none" />
              {form.formState.errors.password && (
                <p className="text-red-400 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-purple-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
