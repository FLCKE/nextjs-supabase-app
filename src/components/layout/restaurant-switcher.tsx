'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface Restaurant {
  id: string;
  name: string;
  currency?: string;
}

interface RestaurantSwitcherProps {
  restaurants: Restaurant[];
  currentRestaurant?: Restaurant;
  onSelect?: (restaurant: Restaurant) => void;
  onCreate?: () => void;
}

export function RestaurantSwitcher({
  restaurants,
  currentRestaurant,
  onSelect,
  onCreate,
}: RestaurantSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Restaurant | undefined>(
    currentRestaurant
  );

  React.useEffect(() => {
    if (currentRestaurant) {
      setSelected(currentRestaurant);
    }
  }, [currentRestaurant]);

  const handleSelect = (restaurant: Restaurant) => {
    setSelected(restaurant);
    setOpen(false);
    onSelect?.(restaurant);
  };

  const displayName = selected?.name || 'Select restaurant';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a restaurant"
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Store className="h-4 w-4 shrink-0 opacity-50" />
            <span className="truncate">{displayName}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search restaurant..." />
          <CommandList>
            <CommandEmpty>No restaurant found.</CommandEmpty>
            <CommandGroup heading="Your Restaurants">
              {restaurants.map((restaurant) => (
                <CommandItem
                  key={restaurant.id}
                  onSelect={() => handleSelect(restaurant)}
                  className="text-sm"
                >
                  <Store className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{restaurant.name}</span>
                  {selected?.id === restaurant.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreate && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={onCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Restaurant
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
