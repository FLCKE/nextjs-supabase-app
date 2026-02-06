
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
import { ArrowLeft, LogIn } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              RestoPay
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-xs border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Connexion</CardTitle>
            <CardDescription>Connectez-vous à votre compte RestoPay</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  {...form.register('email')}
                  className="border-gray-300"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register('password')}
                  className="border-gray-300"
                />
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 h-10"
                disabled={isPending}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isPending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte?{' '}
                <Link href="/sign-up" className="text-orange-600 font-semibold hover:text-orange-700">
                  Créer un compte
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
