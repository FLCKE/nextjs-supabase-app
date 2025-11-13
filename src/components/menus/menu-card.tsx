'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleMenuActive, deleteMenu } from '@/lib/actions/menu-actions';
import { toast } from 'sonner';
import type { MenuWithItemCount } from '@/types';
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface MenuCardProps {
  menu: MenuWithItemCount;
  onEdit: () => void;
  onDelete: () => void;
}

export function MenuCard({ menu, onEdit, onDelete }: MenuCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const result = await toggleMenuActive(menu.id, !menu.is_active);
      if (result.success) {
        toast.success(`Menu ${!menu.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(result.error || 'Failed to update menu status');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${menu.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteMenu(menu.id);
      if (result.success) {
        toast.success('Menu deleted successfully');
        onDelete();
      } else {
        toast.error(result.error || 'Failed to delete menu');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{menu.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={menu.is_active ? 'default' : 'secondary'}>
            {menu.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
                {menu.is_active ? (
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
              <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {menu.item_count} {menu.item_count === 1 ? 'item' : 'items'}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/menus/${menu.id}/items`} className="w-full">
          <Button variant="outline" className="w-full">
            Manage Items
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
