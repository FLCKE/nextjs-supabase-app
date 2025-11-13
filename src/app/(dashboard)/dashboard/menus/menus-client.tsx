'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/menus/menu-card';
import { MenuForm } from '@/components/menus/menu-form';
import { getMenusByRestaurant } from '@/lib/actions/menu-actions';
import { getRestaurantsByOwner } from '@/lib/actions/restaurant-management';
import type { Menu, MenuWithItemCount, Restaurant } from '@/types';
import { Plus, Store } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function MenusPageClient() {
  const [menus, setMenus] = useState<MenuWithItemCount[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | undefined>();

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      loadMenus();
      // Save selected restaurant to localStorage
      localStorage.setItem('currentRestaurantId', restaurantId);
    }
  }, [restaurantId]);

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const result = await getRestaurantsByOwner();
      
      if (result.success && result.data) {
        setRestaurants(result.data);
        
        // Auto-select first restaurant or previously selected one
        const storedRestaurantId = localStorage.getItem('currentRestaurantId');
        if (storedRestaurantId && result.data.find(r => r.id === storedRestaurantId)) {
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

  const loadMenus = async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    try {
      const result = await getMenusByRestaurant(restaurantId);

      if (result.success && result.data) {
        setMenus(result.data);
      } else {
        toast.error(result.error || 'Failed to load menus');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = () => {
    setEditingMenu(undefined);
    setIsFormOpen(true);
  };

  const handleEditMenu = (menu: Menu) => {
    setEditingMenu(menu);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadMenus();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading menus...</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Store className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Restaurants Yet</h2>
          <p className="text-muted-foreground mb-4">
            Create a restaurant first to start managing menus.
          </p>
          <Button onClick={() => window.location.href = '/dashboard/restaurants'}>
            <Plus className="mr-2 h-4 w-4" />
            Create Restaurant
          </Button>
        </div>
      </div>
    );
  }

  const selectedRestaurant = restaurants.find(r => r.id === restaurantId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Menus</h1>
            <p className="text-muted-foreground mt-1">
              Manage your restaurant menus and items
            </p>
          </div>
          {restaurantId && (
            <Button onClick={handleCreateMenu}>
              <Plus className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
          )}
        </div>

        {/* Restaurant Selector */}
        {restaurants.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium whitespace-nowrap">
              Select Restaurant:
            </label>
            <Select value={restaurantId || undefined} onValueChange={setRestaurantId}>
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Choose a restaurant">
                  {selectedRestaurant && (
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {selectedRestaurant.name}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {restaurant.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No menus yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first menu to start adding items
          </p>
          <Button onClick={handleCreateMenu}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Menu
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={() => handleEditMenu(menu)}
              onDelete={loadMenus}
            />
          ))}
        </div>
      )}

      {restaurantId && (
        <MenuForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          restaurantId={restaurantId}
          menu={editingMenu}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
