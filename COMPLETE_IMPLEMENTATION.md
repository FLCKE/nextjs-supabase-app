# Complete Restaurant Management System - All Files

This file contains ALL the code you need. Copy each section to the specified file path.

## DEPENDENCIES

Run: `npm install qrcode @types/qrcode @tanstack/react-table`

## DATABASE MIGRATION

Already created at: `supabase/migrations/20251106164800_create_restaurant_system.sql`

Run: `npx supabase db push`

## DIRECTORY STRUCTURE TO CREATE MANUALLY

```
src/app/(dashboard)/dashboard/restaurants/
src/app/(dashboard)/dashboard/restaurants/[id]/
src/app/(dashboard)/dashboard/restaurants/_components/
src/app/(dashboard)/dashboard/restaurants/[id]/_components/
```

---

## FILE 1: src/app/(dashboard)/dashboard/restaurants/page.tsx

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RestaurantsTable } from './_components/restaurants-table'
import { RestaurantDialog } from './_components/restaurant-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function RestaurantsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/sign-in')
  }

  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">
            Manage your restaurant locations and tables
          </p>
        </div>
        {profile.role === 'owner' && (
          <RestaurantDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </RestaurantDialog>
        )}
      </div>
      <RestaurantsTable restaurants={restaurants || []} userRole={profile.role} />
    </div>
  )
}
```

---

## FILE 2: src/app/(dashboard)/dashboard/restaurants/_components/restaurants-table.tsx

```typescript
'use client'

import { Restaurant } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { deleteRestaurant } from '@/lib/restaurant-actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { RestaurantDialog } from './restaurant-dialog'

export function RestaurantsTable({
  restaurants,
  userRole,
}: {
  restaurants: Restaurant[]
  userRole: string
}) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return

    const { error } = await deleteRestaurant(id)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Restaurant deleted successfully')
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Legal Name</th>
              <th className="p-4 text-left font-medium">Country</th>
              <th className="p-4 text-left font-medium">Currency</th>
              {userRole === 'owner' && (
                <th className="p-4 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {restaurants.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No restaurants found. Create your first restaurant to get started.
                </td>
              </tr>
            ) : (
              restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="border-b">
                  <td className="p-4">
                    <Link
                      href={`/dashboard/restaurants/${restaurant.id}`}
                      className="font-medium hover:underline"
                    >
                      {restaurant.name}
                    </Link>
                  </td>
                  <td className="p-4">{restaurant.legal_name}</td>
                  <td className="p-4">{restaurant.country}</td>
                  <td className="p-4">{restaurant.currency}</td>
                  {userRole === 'owner' && (
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setEditingRestaurant(restaurant)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(restaurant.id)}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingRestaurant && (
        <RestaurantDialog
          restaurant={editingRestaurant}
          open={!!editingRestaurant}
          onOpenChange={(open) => !open && setEditingRestaurant(null)}
        />
      )}
    </>
  )
}
```

---

## FILE 3: src/app/(dashboard)/dashboard/restaurants/_components/restaurant-dialog.tsx

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { restaurantSchema } from '@/lib/validation/restaurant'
import { createRestaurant, updateRestaurant } from '@/lib/restaurant-actions'
import { toast } from 'sonner'
import { Restaurant } from '@/types'

export function RestaurantDialog({
  restaurant,
  children,
  open,
  onOpenChange,
}: {
  restaurant?: Restaurant
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant?.name || '',
      legal_name: restaurant?.legal_name || '',
      country: restaurant?.country || '',
      currency: restaurant?.currency || 'USD',
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
  }

  const onSubmit = (data: z.infer<typeof restaurantSchema>) => {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const result = restaurant
        ? await updateRestaurant(restaurant.id, formData)
        : await createRestaurant(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          restaurant ? 'Restaurant updated successfully' : 'Restaurant created successfully'
        )
        handleOpenChange(false)
        form.reset()
      }
    })
  }

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{restaurant ? 'Edit Restaurant' : 'Create Restaurant'}</DialogTitle>
          <DialogDescription>
            {restaurant
              ? 'Update your restaurant information'
              : 'Add a new restaurant to your account'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_name">Legal Name</Label>
            <Input id="legal_name" {...form.register('legal_name')} />
            {form.formState.errors.legal_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.legal_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register('country')} />
            {form.formState.errors.country && (
              <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency Code (USD, EUR, etc.)</Label>
            <Input id="currency" {...form.register('currency')} maxLength={3} />
            {form.formState.errors.currency && (
              <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : restaurant ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

Continue in next message due to length...
