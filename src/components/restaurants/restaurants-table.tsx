'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RestaurantDialog } from '@/components/restaurants/restaurant-dialog';
import { deleteRestaurant } from '@/lib/actions/restaurant-management';
import { useRole } from '@/hooks/useRole';
import { toast } from 'sonner';
import type { Restaurant } from '@/types';

interface RestaurantsTableProps {
  restaurants: Restaurant[];
}

export function RestaurantsTable({ restaurants }: RestaurantsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const { isReadOnly } = useRole();
  const router = useRouter();

  const handleEdit = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await deleteRestaurant(id);
      toast.success('Restaurant deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete restaurant');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRestaurant(null);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Legal Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No restaurants found. Create your first restaurant to get started.
                </TableCell>
              </TableRow>
            ) : (
              restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/restaurants/${restaurant.id}`}
                      className="font-medium hover:underline"
                    >
                      {restaurant.name}
                    </Link>
                  </TableCell>
                  <TableCell>{restaurant.legal_name}</TableCell>
                  <TableCell>{restaurant.country}</TableCell>
                  <TableCell>{restaurant.currency}</TableCell>
                  <TableCell>
                    {!isReadOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(restaurant)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RestaurantDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        restaurant={selectedRestaurant}
        onSuccess={handleSuccess}
      />
    </>
  );
}
