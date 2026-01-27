'use client';

import * as React from 'react';
import { Plus, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/lib/cart/cart-store';
import { MenuItem } from '@/types';
import { toast } from 'sonner';

interface AddToCartDialogProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToCartDialog({ item, isOpen, onClose }: AddToCartDialogProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock =
    item.stock_mode === 'FINITE' && item.stock_qty !== null && item.stock_qty <= 0;

  const handleAddToCart = async () => {
    if (quantity <= 0) {
      toast.error('Invalid quantity', {
        description: 'Please enter a quantity greater than 0',
      });
      return;
    }

    if (isOutOfStock) {
      toast.error('Out of stock', {
        description: `${item.name} is currently unavailable`,
      });
      return;
    }

    setIsAdding(true);

    try {
      addItem({
        id: item.id,
        name: item.name,
        price_cts: item.price_cts,
        tax_rate: item.tax_rate || 0,
        quantity,
      });

      setShowSuccess(true);
      toast.success('Added to cart', {
        description: `${quantity}x ${item.name}`,
      });

      // Reset form
      setQuantity(1);

      // Close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1000);
    } catch (error) {
      toast.error('Failed to add item', {
        description: 'Please try again',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(Math.max(0, value));
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-destructive mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>This item is currently out of stock</span>
              </div>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-500/10 p-3 mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="font-semibold text-center">Added to cart!</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Item Details */}
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
              <p className="text-lg font-bold mt-3 text-primary">
                {formatPrice(item.price_cts)}
              </p>
            </div>

            {/* Stock Info */}
            {item.stock_mode === 'FINITE' && item.stock_qty !== null && (
              <div className="text-sm">
                {item.stock_qty <= 0 ? (
                  <span className="text-destructive font-medium">Out of Stock</span>
                ) : item.stock_qty < 5 ? (
                  <span className="text-yellow-600 font-medium">
                    Only {item.stock_qty} left
                  </span>
                ) : (
                  <span className="text-muted-foreground">In Stock</span>
                )}
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <Label htmlFor="quantity" className="text-base">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={handleQuantityChange}
                disabled={isOutOfStock || isAdding}
                className="mt-2"
              />
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">
                  {formatPrice(item.price_cts * quantity)}
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAdding || showSuccess}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || showSuccess || quantity <= 0}
          >
            {isAdding ? (
              'Adding...'
            ) : showSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
