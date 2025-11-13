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
import type { InventoryAdjustment } from '@/types';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface HistoryTableProps {
  adjustments: (InventoryAdjustment & { menu_items?: { name: string } })[];
}

export function HistoryTable({ adjustments }: HistoryTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'SPOILAGE':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge variant="default" className="bg-green-600">Stock In</Badge>;
      case 'OUT':
        return <Badge variant="default" className="bg-blue-600">Stock Out</Badge>;
      case 'SPOILAGE':
        return <Badge variant="destructive">Spoilage</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (adjustments.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No inventory adjustments recorded yet.</p>
      </div>
    );
  }

  return (
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
          {adjustments.map((adjustment) => (
            <TableRow key={adjustment.id}>
              <TableCell className="font-medium">
                {format(new Date(adjustment.created_at), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>
                {(adjustment as any).menu_items?.name || 'Unknown Item'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(adjustment.type)}
                  {getTypeBadge(adjustment.type)}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {adjustment.type === 'IN' ? '+' : '-'}
                {adjustment.quantity}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {adjustment.reason || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
