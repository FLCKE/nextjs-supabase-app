# Dashboard Shell - Quick Reference

## 🚀 Quick Start

### Basic Page

```tsx
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function MyPage() {
  return (
    <DashboardLayout
      title="My Page"
      description="Page description"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'My Page' }
      ]}
    >
      {/* Your content */}
    </DashboardLayout>
  );
}
```

## 🎯 Common Patterns

### With Primary Action

```tsx
<DashboardLayout
  title="Orders"
  primaryAction={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      New Order
    </Button>
  }
>
```

### With Multiple Actions

```tsx
<DashboardLayout
  primaryAction={<Button>Create</Button>}
  secondaryActions={
    <>
      <Button variant="outline">Export</Button>
      <Button variant="outline">Filter</Button>
    </>
  }
>
```

### With Quick Action (Floating Button)

```tsx
<DashboardLayout
  quickAction={{
    label: 'New Item',
    onClick: () => router.push('/new'),
    icon: <Plus className="mr-2 h-4 w-4" />,
  }}
>
```

### With Restaurant Switcher

```tsx
const [restaurant, setRestaurant] = useState({
  id: '1',
  name: 'Main Restaurant'
});

<DashboardLayout
  restaurants={[
    { id: '1', name: 'Main Restaurant' },
    { id: '2', name: 'Branch' }
  ]}
  currentRestaurant={restaurant}
  onRestaurantChange={setRestaurant}
>
```

## 🗺️ Navigation Structure

### Main
- Home → `/dashboard`
- Restaurants → `/dashboard/restaurants`
- Menus → `/dashboard/menus`

### Operations
- Orders (Live) → `/dashboard/orders`
- Payments → `/dashboard/payments`
- Inventory → `/dashboard/inventory`

### Analytics
- Reports → `/dashboard/reports`

### System
- Admin (role: admin) → `/dashboard/admin`

## 🎨 Adding Navigation Items

Edit `src/components/layout/app-sidebar.tsx`:

```tsx
{
  title: 'Your Page',
  href: '/dashboard/your-page',
  icon: YourIcon,
  badge: 'New', // Optional badge
  roles: ['admin'], // Optional role restriction
}
```

## 🔐 Role-Based Access

```tsx
// Pass user role to layout
<DashboardLayout
  userRole="admin"
>

// Nav item with role restriction
{
  title: 'Admin',
  href: '/dashboard/admin',
  icon: Shield,
  roles: ['admin'], // Only visible to admins
}
```

## 📱 Responsive Behavior

- **Mobile:** Sheet sidebar, hamburger menu, stacked layout
- **Desktop:** Fixed sidebar, horizontal layout, max-width 1280px

## 👤 User Menu

```tsx
<DashboardLayout
  userName="John Doe"
  userEmail="john@example.com"
  userRole="admin"
  onSignOut={() => signOut()}
>
```

## 🔔 Notifications

```tsx
<DashboardLayout
  notificationCount={5}
>
```

## 🍞 Breadcrumbs

```tsx
breadcrumbs={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Order #1234' } // Current page (no href)
]}
```

## 🎨 Icons

Import from `lucide-react`:

```tsx
import {
  Home,
  Store,
  UtensilsCrossed,
  ShoppingCart,
  CreditCard,
  Package,
  BarChart3,
  Shield,
  Plus,
  Download,
  Filter,
} from 'lucide-react';
```

## 📦 Props Reference

```tsx
interface DashboardLayoutProps {
  // Page
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  
  // Actions
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  quickAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  
  // Restaurant
  restaurants?: Restaurant[];
  currentRestaurant?: Restaurant;
  onRestaurantChange?: (restaurant: Restaurant) => void;
  onCreateRestaurant?: () => void;
  
  // User
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onSignOut?: () => void;
  
  // Notifications
  notificationCount?: number;
  
  // Content
  children: ReactNode;
}
```

## 🎯 Content Max Width

Default: `max-w-7xl` (1280px)

To change: Edit `dashboard-layout.tsx`
```tsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
```

Options:
- `max-w-4xl` → 896px
- `max-w-5xl` → 1024px
- `max-w-6xl` → 1152px
- `max-w-7xl` → 1280px (default)
- `max-w-full` → No limit

## 📚 Key Files

- **Layout:** `src/components/layout/dashboard-layout.tsx`
- **Sidebar:** `src/components/layout/app-sidebar.tsx`
- **Switcher:** `src/components/layout/restaurant-switcher.tsx`
- **Example:** `src/app/(dashboard)/dashboard/page.tsx`

---

**Full Guide:** See `DASHBOARD_SHELL_GUIDE.md`
