'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { restaurantSchema } from '@/lib/validation/restaurant';
import { createRestaurant, updateRestaurant } from '@/lib/actions/restaurant-management';
import { toast } from 'sonner';
import type { Restaurant } from '@/types';

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface RestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant?: Restaurant | null;
  onSuccess?: () => void;
}

export function RestaurantDialog({
  open,
  onOpenChange,
  restaurant,
  onSuccess,
}: RestaurantDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!restaurant;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: restaurant
      ? {
          name: restaurant.name,
          legal_name: restaurant.legal_name,
          country: restaurant.country,
          currency: restaurant.currency,
        }
      : {
          name: '',
          legal_name: '',
          country: '',
          currency: 'USD',
        },
  });

  const onSubmit = (data: RestaurantFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });

        if (isEditing && restaurant) {
          await updateRestaurant(restaurant.id, formData);
          toast.success('Restaurant updated successfully');
        } else {
          await createRestaurant(formData);
          toast.success('Restaurant created successfully');
        }

        reset();
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Something went wrong'
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Restaurant' : 'Create Restaurant'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Restaurant"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_name">Legal Name</Label>
            <Input
              id="legal_name"
              {...register('legal_name')}
              placeholder="My Restaurant LLC"
            />
            {errors.legal_name && (
              <p className="text-sm text-red-500">{errors.legal_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="USA"
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register('currency')}
                placeholder="USD"
                maxLength={3}
              />
              {errors.currency && (
                <p className="text-sm text-red-500">{errors.currency.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving...'
                : isEditing
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
