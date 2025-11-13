'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createMenu, updateMenu } from '@/lib/actions/menu-actions';
import { toast } from 'sonner';
import type { Menu } from '@/types';

const menuFormSchema = z.object({
  name: z.string().min(1, 'Menu name is required').max(100, 'Menu name is too long'),
  is_active: z.boolean(),
});

type MenuFormData = z.infer<typeof menuFormSchema>;

interface MenuFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  menu?: Menu;
  onSuccess?: () => void;
}

export function MenuForm({ open, onOpenChange, restaurantId, menu, onSuccess }: MenuFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!menu;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {
      name: menu?.name || '',
      is_active: menu?.is_active ?? true,
    },
  });

  const onSubmit = async (data: MenuFormData) => {
    setIsLoading(true);
    try {
      let result;
      if (isEditing) {
        result = await updateMenu({
          id: menu.id,
          ...data,
        });
      } else {
        result = await createMenu({
          restaurant_id: restaurantId,
          ...data,
        });
      }

      if (result.success) {
        toast.success(isEditing ? 'Menu updated successfully' : 'Menu created successfully');
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Menu' : 'Create New Menu'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Menu Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dinner Menu, Breakfast Menu"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                className="h-4 w-4 rounded border-gray-300"
                {...register('is_active')}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (visible to customers)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
