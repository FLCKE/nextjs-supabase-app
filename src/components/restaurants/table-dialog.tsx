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
import { tableSchema } from '@/lib/validation/restaurant';
import { createTable, updateTable } from '@/lib/actions/restaurant-management';
import { toast } from 'sonner';
import type { Table } from '@/types';

type TableFormData = z.infer<typeof tableSchema>;

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  restaurantId: string;
  table?: Table | null;
  onSuccess?: () => void;
}

export function TableDialog({
  open,
  onOpenChange,
  locationId,
  restaurantId,
  table,
  onSuccess,
}: TableDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!table;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: table
      ? {
          label: table.label,
          active: table.active,
        }
      : {
          label: '',
          active: true,
        },
  });

  const onSubmit = (data: TableFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('label', data.label);
        formData.append('active', String(data.active ?? true));

        if (isEditing && table) {
          await updateTable(table.id, restaurantId, formData);
          toast.success('Table updated successfully');
        } else {
          await createTable(locationId, restaurantId, formData);
          toast.success('Table created successfully');
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
            {isEditing ? 'Edit Table' : 'Create Table'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Table Label</Label>
            <Input
              id="label"
              {...register('label')}
              placeholder="Table 1"
            />
            {errors.label && (
              <p className="text-sm text-red-500">{errors.label.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="active">Active</Label>
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
