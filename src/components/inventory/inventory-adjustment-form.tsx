'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createInventoryAdjustment } from '@/lib/actions/inventory';
import {
  createInventoryAdjustmentSchema,
  type CreateInventoryAdjustmentInput,
} from '@/lib/validation/inventory';
import type { MenuItemWithStock } from '@/types';

interface InventoryAdjustmentFormProps {
  menuItems: MenuItemWithStock[];
  defaultItemId?: string;
}

export function InventoryAdjustmentForm({
  menuItems,
  defaultItemId,
}: InventoryAdjustmentFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateInventoryAdjustmentInput>({
    resolver: zodResolver(createInventoryAdjustmentSchema),
    defaultValues: {
      item_id: defaultItemId || '',
      type: 'IN',
      quantity: 1,
      reason: '',
    },
  });

  const selectedItemId = form.watch('item_id');
  const selectedItem = menuItems.find((item) => item.id === selectedItemId);
  const adjustmentType = form.watch('type');

  async function onSubmit(data: CreateInventoryAdjustmentInput) {
    setIsSubmitting(true);
    try {
      const result = await createInventoryAdjustment(data);

      if (result.success) {
        toast.success('Inventory adjustment added successfully');
        form.reset();
        setOpen(false);
      } else {
        toast.error(result.error || 'Failed to add inventory adjustment');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  const getTypeLabel = (type: 'IN' | 'OUT' | 'SPOILAGE') => {
    switch (type) {
      case 'IN':
        return 'Stock In';
      case 'OUT':
        return 'Stock Out';
      case 'SPOILAGE':
        return 'Spoilage';
    }
  };

  const getTypeDescription = (type: 'IN' | 'OUT' | 'SPOILAGE') => {
    switch (type) {
      case 'IN':
        return 'Add stock (new inventory received)';
      case 'OUT':
        return 'Remove stock (sold or used)';
      case 'SPOILAGE':
        return 'Discard stock (damaged or expired)';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Adjustment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inventory Adjustment</DialogTitle>
          <DialogDescription>
            Record stock changes for menu items with finite inventory
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu Item</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuItems
                        .filter((item) => item.stock_mode === 'FINITE')
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                            {item.current_stock !== null && (
                              <span className="text-muted-foreground ml-2">
                                (Stock: {item.current_stock})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedItem && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <div className="font-medium">{selectedItem.name}</div>
                <div className="text-muted-foreground">
                  Current Stock: {selectedItem.current_stock ?? 0} units
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IN">
                        <div>
                          <div className="font-medium">Stock In</div>
                          <div className="text-xs text-muted-foreground">
                            Add new inventory
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="OUT">
                        <div>
                          <div className="font-medium">Stock Out</div>
                          <div className="text-xs text-muted-foreground">
                            Remove stock (sold/used)
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPOILAGE">
                        <div>
                          <div className="font-medium">Spoilage</div>
                          <div className="text-xs text-muted-foreground">
                            Discard damaged/expired
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{getTypeDescription(adjustmentType)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>Must be a positive whole number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for adjustment"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Optional note about this adjustment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Adjustment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
