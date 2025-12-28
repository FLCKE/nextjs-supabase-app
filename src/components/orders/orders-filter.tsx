'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Restaurant {
  id: string;
  name: string;
}

interface OrdersFilterProps {
  restaurants: Restaurant[];
  initialRestaurantId?: string;
}

export function OrdersFilter({
  restaurants,
  initialRestaurantId,
}: OrdersFilterProps) {
  const router = useRouter();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>(
    initialRestaurantId || ''
  );

  const handleRestaurantChange = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    // Reload with new restaurant orders
    router.refresh();
  };

  if (restaurants.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-4">
      <label htmlFor="restaurant" className="text-sm font-medium">
        Restaurant:
      </label>
      <Select value={selectedRestaurant} onValueChange={handleRestaurantChange}>
        <SelectTrigger id="restaurant" className="w-[250px]">
          <SelectValue placeholder="Select a restaurant" />
        </SelectTrigger>
        <SelectContent>
          {restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
