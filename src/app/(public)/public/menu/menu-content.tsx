'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MenuItemCard } from '@/components/public/menu-item-card';
import { CartSummaryBar } from '@/components/public/cart-summary-bar';
import { useCartStore } from '@/lib/cart/cart-store';
import type { PublicMenuData } from '@/lib/actions/public-menu-actions';

interface MenuContentProps {
  menuData: PublicMenuData;
  tableToken: string;
  restaurantId?: string;
}

export function MenuContent({ menuData, tableToken, restaurantId }: MenuContentProps) {
  const { setTableToken } = useCartStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Set table token or restaurant ID on mount
  React.useEffect(() => {
    // Prefer tableToken if available (QR code from table)
    if (tableToken) {
      setTableToken(tableToken);
    } else if (restaurantId) {
      // Fall back to restaurant ID for non-QR access
      setTableToken(restaurantId);
    }
  }, [tableToken, restaurantId, setTableToken]);

  // Filter items
  const filteredItems = React.useMemo(() => {
    let items = menuData.menu_items;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    return items;
  }, [menuData.menu_items, searchQuery, selectedCategory]);

  // Group items by category
  const itemsByCategory = React.useMemo(() => {
    const grouped: Record<string, typeof filteredItems> = {};
    
    filteredItems.forEach((item) => {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  }, [filteredItems]);

  if (menuData.menu_items.length === 0) {
    return (
      <main className="container-lg py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No Menu Items Available</h2>
          <p className="text-muted-foreground">
            The menu is currently being updated. Please check back soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="container-lg py-6 pb-32" role="main">
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
              aria-label="Search menu items"
            />
          </div>

          {/* Category Filters */}
          {menuData.categories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Filter by category</p>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" role="group" aria-label="Category filters">
                <Badge
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap transition-colors hover:opacity-80"
                  onClick={() => setSelectedCategory(null)}
                >
                  All ({menuData.menu_items.length})
                </Badge>
                {menuData.categories.map((category) => {
                  const count = menuData.menu_items.filter(
                    (item) => item.category === category
                  ).length;
                  return (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer whitespace-nowrap transition-colors hover:opacity-80"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No items found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-8" role="list" aria-label="Menu items">
            {Object.entries(itemsByCategory).map(([category, items]) => (
              <section key={category} aria-labelledby={`category-${category}`}>
                <h2
                  id={`category-${category}`}
                  className="text-2xl font-bold mb-4"
                >
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div key={item.id} role="listitem">
                      <MenuItemCard
                        {...item}
                        currency={menuData.currency}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Cart Summary */}
      <CartSummaryBar currency={menuData.currency} />

      {/* CSS for hiding scrollbar on category filters */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
