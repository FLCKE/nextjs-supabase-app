'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ItemTable } from '@/components/menus/item-table';
import { MenuItemForm } from '@/components/menus/menu-item-form';
import { getMenuById, getMenuItemsByMenu } from '@/lib/actions/menu-actions';
import { getRestaurant } from '@/lib/actions/restaurant-management';
import type { Menu, MenuItem, Restaurant } from '@/types';
import { Plus, ArrowLeft, Store, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItemsPageClientProps {
  menuId: string;
}

export function MenuItemsPageClient({ menuId }: MenuItemsPageClientProps) {
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();

  useEffect(() => {
    loadData();
  }, [menuId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [menuResult, itemsResult] = await Promise.all([
        getMenuById(menuId),
        getMenuItemsByMenu(menuId),
      ]);

      if (menuResult.success && menuResult.data) {
        setMenu(menuResult.data);
        
        // Load restaurant info
        try {
          const restaurantData = await getRestaurant(menuResult.data.restaurant_id);
          if (restaurantData) {
            setRestaurant(restaurantData);
          }
        } catch (err) {
          console.error('Failed to load restaurant:', err);
        }
      } else {
        toast.error(menuResult.error || 'Failed to load menu');
        return;
      }

      if (itemsResult.success && itemsResult.data) {
        setItems(itemsResult.data);
      } else {
        toast.error(itemsResult.error || 'Failed to load items');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading menu items...</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Menu Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The menu you are looking for does not exist.
          </p>
          <Button onClick={() => router.push('/dashboard/menus')}>
            Back to Menus
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/menus')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menus
        </Button>

        {/* Restaurant & Menu Context */}
        {restaurant && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Restaurant:</span>
                <span className="font-medium">{restaurant.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Menu:</span>
                <span className="font-medium">{menu.name}</span>
                <Badge variant={menu.is_active ? 'default' : 'secondary'} className="ml-2">
                  {menu.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Menu Items</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button onClick={handleCreateItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <ItemTable
        items={items}
        onEdit={handleEditItem}
        onDelete={loadData}
      />

      <MenuItemForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        menuId={menuId}
        item={editingItem}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
