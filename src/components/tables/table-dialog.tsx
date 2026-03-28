'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { createTable } from '@/lib/actions/restaurant-management';
import { toast } from 'sonner';

interface TableDialogProps {
  restaurantId: string;
  onSuccess: () => void;
}

export function TableDialog({ restaurantId, onSuccess }: TableDialogProps) {
  const [open, setOpen] = useState(false);
  const [tableLabel, setTableLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableLabel.trim()) {
      toast.error('Please enter a table label');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('label', tableLabel);
      formData.append('active', 'true');

      await createTable(restaurantId, formData);
      toast.success('Table created successfully');
      setTableLabel('');
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create table');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Table
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
          <DialogDescription>
            Create a new table for your restaurant location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Table Label</Label>
            <Input
              id="label"
              placeholder="e.g., Table 1, Window Seat, Bar"
              value={tableLabel}
              onChange={(e) => setTableLabel(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Table'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
