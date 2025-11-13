'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MenuItem } from '@/types';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface StockOverviewProps {
  items: MenuItem[];
  stockData: Record<string, number>;
  onAddAdjustment: (itemId: string) => void;
}

export function StockOverview({ items, stockData, onAddAdjustment }: StockOverviewProps) {
  const getStockStatus = (item: MenuItem, currentStock: number) => {
    if (item.stock_mode !== 'FINITE') {
      return null;
    }
    if (currentStock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (currentStock <= 5) {
      return <Badge variant="default" className="bg-orange-600">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">In Stock</Badge>;
  };

  const getStockIcon = (item: MenuItem, currentStock: number) => {
    if (item.stock_mode !== 'FINITE') {
      return null;
    }
    if (currentStock === 0 || currentStock <= 5) {
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const finiteItems = items.filter((item) => item.stock_mode === 'FINITE');

  if (finiteItems.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">
          No items with finite stock tracking configured.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Set items to &quot;FINITE&quot; stock mode to track inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Stock Mode</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {finiteItems.map((item) => {
            const currentStock = stockData[item.id] || 0;
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getStockIcon(item, currentStock)}
                    {item.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{item.stock_mode}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-lg">
                  {currentStock}
                </TableCell>
                <TableCell>{getStockStatus(item, currentStock)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddAdjustment(item.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
