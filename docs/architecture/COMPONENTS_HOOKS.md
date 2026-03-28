# 🧩 Components & Hooks Reference

Documentation of reusable UI components and React hooks in WEGO RestoPay.

---

## Table of Contents

1. [UI Components](#ui-components)
2. [Custom Hooks](#custom-hooks)
3. [Layout Components](#layout-components)
4. [Form Components](#form-components)
5. [Usage Examples](#usage-examples)

---

## UI Components

### Base Components (Radix UI + Tailwind)

All base components are built with Radix UI primitives and styled with Tailwind CSS. Located in `src/components/ui/`.

#### Button
```tsx
import { Button } from "@/components/ui/button"

// Variants: default, secondary, destructive, outline, ghost
// Sizes: default, sm, lg, icon

<Button>Click me</Button>
<Button variant="secondary" size="sm">Small</Button>
<Button variant="destructive">Delete</Button>
<Button disabled>Disabled</Button>
```

#### Card
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

export function MyDialog() {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

#### Form
```tsx
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function MyForm() {
  const form = useForm({
    defaultValues: { email: "" }
  })
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="you@example.com" />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

#### Input
```tsx
import { Input } from "@/components/ui/input"

<Input 
  type="email" 
  placeholder="Enter email"
  disabled={false}
/>
```

#### Select
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"

export function MySelect() {
  const form = useForm()
  
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
```

#### Table
```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>$100</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Toast/Sonner
```tsx
import { toast } from "sonner"

// Success
toast.success("Payment completed!")

// Error
toast.error("Payment failed")

// Loading
const promise = fetchData()
toast.promise(promise, {
  loading: "Loading...",
  success: "Done!",
  error: "Error"
})

// Custom
toast("Custom message", {
  description: "With description",
  action: {
    label: "Undo",
    onClick: () => {}
  }
})
```

---

## Custom Hooks

### useUser
Get the current authenticated user.

```typescript
import { useUser } from "@/hooks/useUser"

export function MyComponent() {
  const { user, isLoading } = useUser()
  
  if (isLoading) return <div>Loading...</div>
  
  return <div>Welcome, {user?.email}</div>
}
```

**Returns:**
```typescript
{
  user: User | null,
  isLoading: boolean,
  error: Error | null
}
```

---

### useRestaurants
Get restaurants owned by current user.

```typescript
import { useRestaurants } from "@/hooks/useRestaurants"

export function RestaurantList() {
  const { data: restaurants, isLoading } = useRestaurants()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <ul>
      {restaurants?.map(r => <li key={r.id}>{r.name}</li>)}
    </ul>
  )
}
```

**Returns:**
```typescript
{
  data: Restaurant[] | undefined,
  isLoading: boolean,
  error: Error | null
}
```

---

### useOrders
Get orders for a specific restaurant.

```typescript
import { useOrders } from "@/hooks/useOrders"

export function OrderList({ restaurantId }: { restaurantId: string }) {
  const { data: orders, isLoading } = useOrders(restaurantId)
  
  return (
    <div>
      {orders?.map(o => (
        <div key={o.id}>{o.id} - {o.status}</div>
      ))}
    </div>
  )
}
```

**Parameters:**
- `restaurantId: string` - Restaurant ID (required)

**Returns:**
```typescript
{
  data: Order[] | undefined,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void
}
```

---

### useOrdersRealtime
Subscribe to real-time order updates.

```typescript
import { useOrdersRealtime } from "@/hooks/use-orders-realtime"

export function OrderBoard({ restaurantId }: { restaurantId: string }) {
  const orders = useOrdersRealtime(restaurantId)
  
  return (
    <div>
      {orders?.map(o => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  )
}
```

**Features:**
- Real-time updates via Supabase WebSocket
- Automatic subscriptions and cleanup
- Maintains local state

---

### usePayments
Get payment records for a restaurant.

```typescript
import { usePayments } from "@/hooks/usePayments"

export function PaymentsDashboard({ restaurantId }: { restaurantId: string }) {
  const { data: payments, isLoading } = usePayments(restaurantId)
  
  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  
  return <div>Total Revenue: ${totalRevenue}</div>
}
```

---

### useMenus
Get menus for a restaurant.

```typescript
import { useMenus } from "@/hooks/useMenus"

export function MenuSelector({ restaurantId }: { restaurantId: string }) {
  const { data: menus } = useMenus(restaurantId)
  
  return (
    <select>
      {menus?.map(m => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  )
}
```

---

### useCurrentRestaurant
Get the currently selected restaurant from context.

```typescript
import { useCurrentRestaurant } from "@/hooks/useCurrentRestaurant"

export function Header() {
  const { currentRestaurant } = useCurrentRestaurant()
  
  return <h1>{currentRestaurant?.name}</h1>
}
```

---

### useMutation Queries
Create, update, or delete data using React Query.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function CreateRestaurant() {
  const queryClient = useQueryClient()
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await supabase
        .from('restaurants')
        .insert([{ name, owner_id: userId }])
        .single()
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      toast.success("Restaurant created!")
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutate(e.currentTarget.name.value)
    }}>
      <input name="name" type="text" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  )
}
```

---

## Layout Components

### DashboardLayout
Main dashboard container.

```tsx
import { DashboardLayout } from "@/components/layout/dashboard-layout"

<DashboardLayout>
  <h1>Dashboard Content</h1>
</DashboardLayout>
```

### DashboardShell
Dashboard frame with header and sidebar.

```tsx
import { DashboardShell } from "@/components/layout/dashboard-shell"

<DashboardShell>
  <div>Content goes here</div>
</DashboardShell>
```

### AppSidebar
Navigation sidebar for dashboard.

```tsx
import { AppSidebar } from "@/components/layout/app-sidebar"

<AppSidebar />
```

Features:
- Multi-restaurant switcher
- Navigation menu
- User profile section

### RestaurantSwitcher
Switch between owned restaurants.

```tsx
import { RestaurantSwitcher } from "@/components/layout/restaurant-switcher"

<RestaurantSwitcher onSelect={(id) => navigate(`/dashboard/${id}`)} />
```

---

## Form Components

### RestaurantForm
Create/edit a restaurant.

```tsx
import { RestaurantForm } from "@/components/forms/restaurant-form"

<RestaurantForm 
  onSuccess={() => navigate('/dashboard')}
  initialValues={restaurant}
/>
```

**Props:**
```typescript
{
  onSuccess?: () => void
  initialValues?: Partial<Restaurant>
  restaurantId?: string
}
```

### MenuForm
Create/edit a menu.

```tsx
import { MenuForm } from "@/components/forms/menu-form"

<MenuForm 
  restaurantId="rest-123"
  onSuccess={() => refetch()}
/>
```

### MenuItemForm
Create/edit a menu item.

```tsx
import { MenuItemForm } from "@/components/forms/menu-item-form"

<MenuItemForm 
  menuId="menu-123"
  onSuccess={() => refetch()}
/>
```

---

## Usage Examples

### Complete Page Example: Orders Dashboard

```tsx
import { useOrders } from "@/hooks/useOrders"
import { useCurrentRestaurant } from "@/hooks/useCurrentRestaurant"
import { OrdersTable } from "@/components/orders/orders-table"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function OrdersPage() {
  const { currentRestaurant } = useCurrentRestaurant()
  const { data: orders, isLoading } = useOrders(currentRestaurant?.id)
  
  return (
    <DashboardShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-600">Manage incoming orders</p>
        </div>
        
        {isLoading ? (
          <div>Loading orders...</div>
        ) : (
          <OrdersTable orders={orders ?? []} />
        )}
      </div>
    </DashboardShell>
  )
}
```

### Complete Form Example: Create Restaurant

```tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { restaurantSchema } from "@/lib/validation/restaurant"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CreateRestaurantDialog() {
  const [open, setOpen] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      email: "",
      city: "",
      currency: "XAF"
    }
  })
  
  async function onSubmit(data: any) {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert([{
          ...data,
          owner_id: userId
        }])
        .select()
        .single()
      
      if (error) throw error
      
      toast.success("Restaurant created!")
      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error(error.message)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Restaurant</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Le Gourmet" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Yaoundé" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Performance Tips

### Query Caching
```typescript
// React Query automatically caches results
// Invalidate cache when data changes
queryClient.invalidateQueries({ queryKey: ['orders'] })

// Manual refetch
const { refetch } = useOrders(restaurantId)
refetch()
```

### Memoization
```typescript
import { memo } from "react"

// Prevent unnecessary re-renders
const OrderCard = memo(({ order }: { order: Order }) => (
  <Card>{order.id}</Card>
))
```

### Code Splitting
```typescript
import dynamic from "next/dynamic"

// Load component lazily
const HeavyComponent = dynamic(() => import('./heavy'), {
  loading: () => <div>Loading...</div>
})
```

---

## Common Patterns

### Loading States
```tsx
const { data, isLoading, error } = useOrders(restaurantId)

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data?.length) return <EmptyState />

return <OrdersList orders={data} />
```

### Error Handling
```tsx
const { mutate } = useMutation({
  mutationFn: createOrder,
  onError: (error) => {
    if (error.message.includes('validation')) {
      toast.error("Please check your inputs")
    } else {
      toast.error("Something went wrong")
    }
  }
})
```

### Optimistic Updates
```tsx
const { mutate } = useMutation({
  mutationFn: updateOrderStatus,
  onMutate: async (newStatus) => {
    // Optimistically update UI
    queryClient.setQueryData(['orders'], old =>
      old.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    )
  }
})
```

---

See also:
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Data models
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoints
