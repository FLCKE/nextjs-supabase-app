'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateRestaurant } from '@/lib/actions/restaurant-management';
import { toast } from 'sonner';
import { useRole } from '@/hooks/useRole';
import type { Restaurant } from '@/types';

interface RestaurantInfoTabProps {
  restaurant: Restaurant;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
];

export function RestaurantInfoTab({ restaurant }: RestaurantInfoTabProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: restaurant.name,
    legal_name: restaurant.legal_name,
    country: restaurant.country,
    currency: restaurant.currency,
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    timezone: restaurant.timezone || 'UTC',
  });
  const { isReadOnly } = useRole();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataObj.append(key, value);
        });

        await updateRestaurant(restaurant.id, formDataObj);
        toast.success('Restaurant information updated successfully');
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to update restaurant'
        );
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Information</CardTitle>
        <CardDescription>
          Update your restaurant's basic information and location details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isReadOnly || isPending}
              />
            </div>
            <div>
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                disabled={isReadOnly || isPending}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={isReadOnly || isPending}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency Code</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={isReadOnly || isPending}
                maxLength={3}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={isReadOnly || isPending}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isReadOnly || isPending}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={isReadOnly || isPending}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isReadOnly || isPending}
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
