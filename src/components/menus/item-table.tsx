'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleMenuItemActive, deleteMenuItem } from '@/lib/actions/menu-actions';
import { toast } from 'sonner';
import type { MenuItem } from '@/types';
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface ItemTableProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: () => void;
}

export function ItemTable({ items, onEdit, onDelete }: ItemTableProps) {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const formatPrice = (priceCts: number, currency: string) => {
    const price = priceCts / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const handleToggleActive = async (item: MenuItem) => {
    setLoadingItems((prev) => new Set(prev).add(item.id));
    try {
      const result = await toggleMenuItemActive(item.id, !item.active);
      if (result.success) {
        toast.success(`Item ${!item.active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.error || 'Failed to update item status');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoadingItems((prev) => new Set(prev).add(item.id));
    try {
      const result = await deleteMenuItem(item.id);
      if (result.success) {
        toast.success('Item deleted successfully');
        onDelete();
      } else {
        toast.error(result.error || 'Failed to delete item');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const getStockBadge = (item: MenuItem) => {
    if (item.stock_mode === 'INFINITE') {
      return <Badge variant="outline">Infinite</Badge>;
    }
    if (item.stock_mode === 'FINITE') {
      return (
        <Badge variant={item.stock_qty && item.stock_qty > 0 ? 'default' : 'destructive'}>
          {item.stock_qty || 0} in stock
        </Badge>
      );
    }
    if (item.stock_mode === 'HIDDEN_WHEN_OOS') {
      return (
        <Badge variant={item.stock_qty && item.stock_qty > 0 ? 'default' : 'secondary'}>
          {item.stock_qty || 0} (Hidden OOS)
        </Badge>
      );
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <p className="text-muted-foreground">No menu items yet. Create your first item to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.image_url ? (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No image</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {item.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{formatPrice(item.price_cts, item.currency)}</div>
                  {item.tax_rate && (
                    <div className="text-xs text-muted-foreground">
                      Tax: {item.tax_rate}%
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{getStockBadge(item)}</TableCell>
              <TableCell>
                <Badge variant={item.active ? 'default' : 'secondary'}>
                  {item.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingItems.has(item.id)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(item)}>
                      {item.active ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(item)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
