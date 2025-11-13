'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createMenuItem, updateMenuItem, uploadMenuItemImage, deleteMenuItemImage } from '@/lib/actions/menu-actions';
import { toast } from 'sonner';
import type { MenuItem } from '@/types';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

const menuItemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Item name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().length(3, 'Currency must be 3 letters'),
  tax_rate: z.string().optional(),
  stock_mode: z.enum(['FINITE', 'INFINITE', 'HIDDEN_WHEN_OOS']),
  stock_qty: z.string().optional(),
  active: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId: string;
  item?: MenuItem;
  onSuccess?: () => void;
}

export function MenuItemForm({ open, onOpenChange, menuId, item, onSuccess }: MenuItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(item?.image_url || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!item;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item ? (item.price_cts / 100).toFixed(2) : '',
      currency: item?.currency || 'USD',
      tax_rate: item?.tax_rate?.toString() || '',
      stock_mode: item?.stock_mode || 'INFINITE',
      stock_qty: item?.stock_qty?.toString() || '',
      active: item?.active ?? true,
    },
  });

  const stockMode = watch('stock_mode');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await uploadMenuItemImage(menuId, item?.id || 'temp', file);
      if (result.success && result.data) {
        setImageUrl(result.data);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!imageUrl) return;

    try {
      await deleteMenuItemImage(imageUrl);
      setImageUrl(null);
      toast.success('Image removed successfully');
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    setIsLoading(true);
    try {
      const priceCts = Math.round(parseFloat(data.price) * 100);
      const taxRate = data.tax_rate ? parseFloat(data.tax_rate) : null;
      const stockQty = data.stock_qty ? parseInt(data.stock_qty) : null;

      const payload = {
        menu_id: menuId,
        name: data.name,
        description: data.description || null,
        price_cts: priceCts,
        currency: data.currency,
        tax_rate: taxRate,
        stock_mode: data.stock_mode,
        stock_qty: stockQty,
        image_url: imageUrl,
        active: data.active,
      };

      let result;
      if (isEditing) {
        result = await updateMenuItem({
          id: item.id,
          ...payload,
        });
      } else {
        result = await createMenuItem(payload);
      }

      if (result.success) {
        toast.success(isEditing ? 'Item updated successfully' : 'Item created successfully');
        reset();
        setImageUrl(null);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Create New Menu Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Margherita Pizza"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                placeholder="Describe your menu item..."
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('price')}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD"
                  maxLength={3}
                  {...register('currency')}
                />
                {errors.currency && (
                  <p className="text-sm text-red-500">{errors.currency.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%) (Optional)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('tax_rate')}
              />
              {errors.tax_rate && (
                <p className="text-sm text-red-500">{errors.tax_rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_mode">Stock Mode</Label>
              <Select
                value={stockMode}
                onValueChange={(value) => setValue('stock_mode', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFINITE">Infinite (Always available)</SelectItem>
                  <SelectItem value="FINITE">Finite (Track quantity)</SelectItem>
                  <SelectItem value="HIDDEN_WHEN_OOS">Hidden when out of stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(stockMode === 'FINITE' || stockMode === 'HIDDEN_WHEN_OOS') && (
              <div className="space-y-2">
                <Label htmlFor="stock_qty">Stock Quantity</Label>
                <Input
                  id="stock_qty"
                  type="number"
                  placeholder="0"
                  {...register('stock_qty')}
                />
                {errors.stock_qty && (
                  <p className="text-sm text-red-500">{errors.stock_qty.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Item Image (Optional)</Label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                    <Image
                      src={imageUrl}
                      alt="Menu item"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                className="h-4 w-4 rounded border-gray-300"
                {...register('active')}
              />
              <Label htmlFor="active" className="cursor-pointer">
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
