'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantDialog } from '@/components/restaurants/restaurant-dialog';
import { useRole } from '@/hooks/useRole';

export function RestaurantCreateButton() {
  const [open, setOpen] = useState(false);
  const { isReadOnly } = useRole();
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  // if (isReadOnly) {
  //   return null;
  // }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Restaurant
      </Button>
      <RestaurantDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
