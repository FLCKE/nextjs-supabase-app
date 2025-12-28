'use client';

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

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  currentRestaurantId?: string;
  currentTableToken?: string;
}

export function RestaurantSelector({
  restaurants,
  currentRestaurantId,
  currentTableToken,
}: RestaurantSelectorProps) {
  const router = useRouter();

  const handleRestaurantChange = (restaurantId: string) => {
    const params = new URLSearchParams();
    params.set('restaurant', restaurantId);
    router.push(`/public/menu?${params.toString()}`);
  };

  return (
    <div className="max-w-xs">
      <Select 
        value={currentRestaurantId || ''} 
        onValueChange={handleRestaurantChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Switch restaurant" />
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
