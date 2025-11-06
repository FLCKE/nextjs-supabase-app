
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

import GeometricBackground from '@/components/ui/geometric-background';

export default function SignupPage() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('full_name', data.full_name);

    startTransition(async () => {
      const { error } = await signup(formData);

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
          <CardTitle className="text-3xl">Sign Up</CardTitle>
          <CardDescription className="text-gray-300">Create your Foodie account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...form.register('full_name')} className="bg-white/20 border-none" />
              {form.formState.errors.full_name && (
                <p className="text-red-400 text-sm">{form.formState.errors.full_name.message}</p>
              )}
            </div>
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
              {isPending ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-purple-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
