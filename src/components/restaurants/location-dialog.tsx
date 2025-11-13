'use client';

import { useTransition } from 'react';
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
import { locationSchema } from '@/lib/validation/restaurant';
import { createLocation, updateLocation } from '@/lib/actions/restaurant-management';
import { toast } from 'sonner';
import type { Location } from '@/types';

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  location?: Location | null;
  onSuccess?: () => void;
}

export function LocationDialog({
  open,
  onOpenChange,
  restaurantId,
  location,
  onSuccess,
}: LocationDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!location;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location
      ? {
          name: location.name,
          timezone: location.timezone,
        }
      : {
          name: '',
          timezone: 'UTC',
        },
  });

  const onSubmit = (data: LocationFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, value);
        });

        if (isEditing && location) {
          await updateLocation(location.id, restaurantId, formData);
          toast.success('Location updated successfully');
        } else {
          await createLocation(restaurantId, formData);
          toast.success('Location created successfully');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Location' : 'Create Location'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Main Branch"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              {...register('timezone')}
              placeholder="America/New_York"
            />
            {errors.timezone && (
              <p className="text-sm text-red-500">{errors.timezone.message}</p>
            )}
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
