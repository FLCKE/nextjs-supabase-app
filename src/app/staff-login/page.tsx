'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffLoginSchema } from '@/lib/validation/auth';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { loginStaff } from '@/lib/actions/staff-actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type LoginFormValues = z.infer<typeof staffLoginSchema>;

export default function StaffLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    toast.info('Attempting to log in...');

    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('login_code', data.login_code);

    const result = await loginStaff(formData);

    if (result.success && result.magicLink) {
      toast.success('Login successful! Please wait while we sign you in.');
      // Redirect to the magic link to complete the sign-in process
      window.location.href = result.magicLink;
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Staff Login</CardTitle>
          <CardDescription>Enter your username and 5-digit code to access the POS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="e.g., john.doe"
                {...register('username')} 
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login_code">5-Digit Code</Label>
              <Input 
                id="login_code" 
                type="password" 
                maxLength={5} 
                placeholder="*****"
                {...register('login_code')} 
              />
              {errors.login_code && <p className="text-xs text-red-500">{errors.login_code.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
