# ALL REMAINING COMPONENT FILES

Copy each section to create the files. Directory paths are specified at the top of each section.

---

## FILE: src/app/(dashboard)/dashboard/restaurants/[id]/page.tsx

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LocationsTab } from './_components/locations-tab'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (!restaurant) {
    notFound()
  }

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('restaurant_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-10">
      <Link href="/dashboard/restaurants">
        <Button variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Restaurants
        </Button>
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">{restaurant.name}</CardTitle>
          <CardDescription>
            {restaurant.legal_name} · {restaurant.country} · {restaurant.currency}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList>
          <TabsTrigger value="locations">Locations & Tables</TabsTrigger>
        </TabsList>
        <TabsContent value="locations">
          <LocationsTab
            restaurantId={id}
            locations={locations || []}
            userRole={profile.role}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## FILE: src/app/(dashboard)/dashboard/restaurants/[id]/_components/locations-tab.tsx

```typescript
'use client'

import { Location } from '@/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash } from 'lucide-react'
import { LocationDialog } from './location-dialog'
import { TablesSection } from './tables-section'
import { deleteLocation } from '@/lib/restaurant-actions'
import { toast } from 'sonner'

export function LocationsTab({
  restaurantId,
  locations,
  userRole,
}: {
  restaurantId: string
  locations: Location[]
  userRole: string
}) {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  const handleDelete = async (locationId: string) => {
    if (!confirm('Are you sure? This will delete all tables in this location.')) return

    const { error } = await deleteLocation(locationId, restaurantId)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Location deleted successfully')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Locations</h2>
          <p className="text-muted-foreground">Manage your restaurant locations and tables</p>
        </div>
        {userRole === 'owner' && (
          <LocationDialog restaurantId={restaurantId}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </LocationDialog>
        )}
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No locations found. Create your first location to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {locations.map((location) => (
            <Card key={location.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{location.name}</CardTitle>
                    <CardDescription>Timezone: {location.timezone}</CardDescription>
                  </div>
                  {userRole === 'owner' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(location.id)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <TablesSection
                  locationId={location.id}
                  restaurantId={restaurantId}
                  userRole={userRole}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingLocation && (
        <LocationDialog
          restaurantId={restaurantId}
          location={editingLocation}
          open={!!editingLocation}
          onOpenChange={(open) => !open && setEditingLocation(null)}
        />
      )}
    </div>
  )
}
```

---

## FILE: src/app/(dashboard)/dashboard/restaurants/[id]/_components/location-dialog.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { locationSchema } from '@/lib/validation/restaurant'
import { createLocation, updateLocation } from '@/lib/restaurant-actions'
import { toast } from 'sonner'
import { Location } from '@/types'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
]

export function LocationDialog({
  restaurantId,
  location,
  children,
  open,
  onOpenChange,
}: {
  restaurantId: string
  location?: Location
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      timezone: location?.timezone || 'UTC',
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
  }

  const onSubmit = (data: z.infer<typeof locationSchema>) => {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const result = location
        ? await updateLocation(location.id, restaurantId, formData)
        : await createLocation(restaurantId, formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          location ? 'Location updated successfully' : 'Location created successfully'
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
          <DialogTitle>{location ? 'Edit Location' : 'Create Location'}</DialogTitle>
          <DialogDescription>
            {location ? 'Update location information' : 'Add a new location to your restaurant'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input id="name" {...form.register('name')} placeholder="Main Street Branch" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={form.watch('timezone')}
              onValueChange={(value) => form.setValue('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.timezone && (
              <p className="text-sm text-destructive">{form.formState.errors.timezone.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : location ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

Continue in REMAINING_COMPONENTS_PART2.md...
