'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import Link from 'next/link';

export default async function StaffDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const supabase = createClient();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      try {
        if (!user) {
          router.push('/staff-login');
          return;
        }

        // Get staff restaurant from staff_members
        const { data: staffMember } = await supabase
          .from('staff_members')
          .select('restaurant_id')
          .eq('user_id', user.id)
          .single();

        if (staffMember?.restaurant_id) {
          try {
            const { data: restaurant } = await supabase
              .from('restaurants')
              .select('name')
              .eq('id', staffMember.restaurant_id)
              .single();

            if (restaurant) {
              setRestaurantName(restaurant.name);
            }
          } catch (err) {
            console.error('Error fetching restaurant:', err);
            // Continue without restaurant name
          }
        }

        setAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/staff-login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to {restaurantName || 'your restaurant'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏪 POS System
            </CardTitle>
            <CardDescription>Manage orders and take payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access the Point of Sale system to create and manage orders, process payments, and manage the register.
            </p>
            <Link href="/pos">
              <Button className="w-full">Open POS</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Order Queue
            </CardTitle>
            <CardDescription>Track order status in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View all active orders, update their status, and track progress through preparation and delivery.
            </p>
            <Link href="/orders">
              <Button className="w-full">View Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
