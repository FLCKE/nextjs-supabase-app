'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getRestaurantsByOwner, getTablesByRestaurant } from '@/lib/actions/restaurant-management';
import type { Restaurant, RestaurantTable as Table, Location } from '@/types';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table as UITable,
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
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { deleteRestaurantTable } from '@/lib/actions/restaurant-management';
import { TableDialog } from '@/components/tables/table-dialog';
import { QRCodeDisplay } from '@/components/tables/qr-code-display';
import { createClient } from '@/lib/supabase/client';

export function TablesClient() {
  const [tables, setTables] = useState<Table[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      loadTables();
      loadLocations();
      localStorage.setItem('currentTableRestaurantId', restaurantId);
    }
  }, [restaurantId]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const result = await getRestaurantsByOwner();

      if (result.success && result.data) {
        setRestaurants(result.data);

        const storedRestaurantId = localStorage.getItem('currentTableRestaurantId');
        if (storedRestaurantId && result.data.find((r) => r.id === storedRestaurantId)) {
          setRestaurantId(storedRestaurantId);
        } else if (result.data.length > 0) {
          setRestaurantId(result.data[0].id);
        } else {
          setIsLoading(false);
        }
      } else {
        toast.error(result.error || 'Failed to load restaurants');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const loadTables = async () => {
    if (!restaurantId) return;

    setIsLoading(true);
    try {
      const result = await getTablesByRestaurant(restaurantId);

      if (result.success && result.data) {
        setTables(result.data);
      } else {
        toast.error(result.error || 'Failed to load tables');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocations = async () => {
    if (!restaurantId) return;

    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, restaurant_id, timezone, created_at, updated_at')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load locations');
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const result = await deleteRestaurantTable(tableId);
      if (result.success) {
        toast.success('Table deleted successfully');
        await loadTables();
      } else {
        toast.error(result.error || 'Failed to delete table');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="text-muted-foreground">Manage restaurant tables and seating</p>
        </div>
        {locations.length > 0 && <TableDialog locations={locations} onSuccess={loadTables} />}
      </div>

      {restaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={restaurantId || ''} onValueChange={setRestaurantId}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Choose a restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
          <CardDescription>{tables.length} tables available</CardDescription>
        </CardHeader>
        <CardContent>
          {tables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tables found. Create your first table to get started.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">QR Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">{table.table_number}</TableCell>
                      <TableCell>{table.location_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            table.status === 'available'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {table.status === 'available' ? '✓ Available' : '✗ Occupied'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <QRCodeDisplay tableId={table.id} tableLabel={table.table_number} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => handleDelete(table.id)}
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
              </UITable>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
