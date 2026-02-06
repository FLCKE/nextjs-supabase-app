
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/validation/auth';
import { z } from 'zod';
import { signup } from './actions';
import { toast } from 'sonner';
import { useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Store } from 'lucide-react';

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      role: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('full_name', data.full_name);
    formData.append('role', data.role);

    startTransition(async () => {
      const { error } = await signup(formData);

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
        <Card className="w-full max-w-md border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-2">Inscription</CardTitle>
            <CardDescription>Créez votre compte RestoPay et commencez</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  placeholder="Jean Dupont"
                  {...form.register('full_name')}
                  className="border-gray-300"
                />
                {form.formState.errors.full_name && (
                  <p className="text-red-500 text-sm">{form.formState.errors.full_name.message}</p>
                )}
              </div>
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

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Je suis</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      form.watch('role') === 'owner'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value="owner"
                      {...form.register('role')}
                      className="sr-only"
                    />
                    <Store className="w-8 h-8 mb-1 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Restaurant</span>
                    <span className="text-xs text-gray-500 mt-0.5 text-center">Gérer menus</span>
                  </label>

                  <label
                    className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      form.watch('role') === 'client'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value="client"
                      {...form.register('role')}
                      className="sr-only"
                    />
                    <UserPlus className="w-8 h-8 mb-1 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Client</span>
                    <span className="text-xs text-gray-500 mt-0.5 text-center">Passer commandes</span>
                  </label>
                </div>
                {form.formState.errors.role && (
                  <p className="text-red-500 text-sm">{form.formState.errors.role.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 h-10"
                disabled={isPending}
              >
                {isPending ? 'Création en cours...' : 'Créer un compte'}
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

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte?{' '}
                <Link href="/sign-in" className="text-orange-600 font-semibold hover:text-orange-700">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
