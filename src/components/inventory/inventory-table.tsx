'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryAdjustment, MenuItemWithStock } from '@/types';
import { ArrowDownIcon, ArrowUpIcon, XCircleIcon } from 'lucide-react';

interface InventoryTableProps {
  adjustments: InventoryAdjustment[];
  menuItems: MenuItemWithStock[];
}

export function InventoryTable({ adjustments, menuItems }: InventoryTableProps) {
  const [filterItemId, setFilterItemId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAdjustments = adjustments.filter((adj) => {
    if (filterItemId !== 'all' && adj.item_id !== filterItemId) return false;
    if (filterType !== 'all' && adj.type !== filterType) return false;
    return true;
  });

  const getItemName = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    return item?.name || 'Unknown Item';
  };

  const getTypeBadge = (type: 'IN' | 'OUT' | 'SPOILAGE') => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
      IN: { variant: 'default', icon: <ArrowUpIcon className="h-3 w-3 mr-1" /> },
      OUT: { variant: 'secondary', icon: <ArrowDownIcon className="h-3 w-3 mr-1" /> },
      SPOILAGE: { variant: 'destructive', icon: <XCircleIcon className="h-3 w-3 mr-1" /> },
    };

    const config = variants[type];

    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {type}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory History</CardTitle>
        <CardDescription>View all stock adjustments with filters</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Select value={filterItemId} onValueChange={setFilterItemId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {menuItems
                  .filter((item) => item.stock_mode === 'FINITE')
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
                <SelectItem value="SPOILAGE">Spoilage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredAdjustments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No inventory adjustments found.</p>
            <p className="text-sm mt-2">
              Add your first adjustment to start tracking inventory.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(adjustment.created_at), 'MMM d, yyyy')}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(adjustment.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getItemName(adjustment.item_id)}
                    </TableCell>
                    <TableCell>{getTypeBadge(adjustment.type)}</TableCell>
                    <TableCell className="text-right font-mono">
                      {adjustment.type === 'IN' && (
                        <span className="text-green-600">+{adjustment.quantity}</span>
                      )}
                      {adjustment.type === 'OUT' && (
                        <span className="text-orange-600">-{adjustment.quantity}</span>
                      )}
                      {adjustment.type === 'SPOILAGE' && (
                        <span className="text-red-600">-{adjustment.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {adjustment.reason || (
                        <span className="text-muted-foreground italic">No reason provided</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredAdjustments.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredAdjustments.length} of {adjustments.length} adjustments
          </div>
        )}
      </CardContent>
    </Card>
  );
}
