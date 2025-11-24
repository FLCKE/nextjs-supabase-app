# UI Quick Reference

Fast reference for common UI patterns in WEGO RestoPay.

## 🎨 Colors

```tsx
// Backgrounds
bg-background          // Main background
bg-card               // Card background
bg-muted              // Subtle background

// Text
text-foreground       // Main text
text-muted-foreground // Dimmed text

// Actions
bg-primary text-primary-foreground     // Primary button
bg-secondary text-secondary-foreground // Secondary button
bg-destructive text-destructive-foreground // Delete/error

// Borders & Focus
border-border         // All borders
ring-ring            // Focus rings
```

## 📏 Spacing

```tsx
space-y-4  // 32px vertical spacing
gap-6      // 48px gap
p-6        // 48px padding
mx-auto    // Center horizontally
```

## 📦 Containers

```tsx
<div className="container-sm">   // 640px
<div className="container-md">   // 768px
<div className="container-lg">   // 1024px (standard)
<div className="container-xl">   // 1280px (dashboard)
```

## 📱 Responsive Grid

```tsx
// Auto-responsive columns (1→2→3→4)
<div className="grid-cols-responsive">
  <Card />
  <Card />
</div>

// Manual grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 🧩 Page Layout

```tsx
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';

<DashboardShell
  title="Page Title"
  description="Page description"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Current Page' }
  ]}
  primaryAction={<Button>Primary Action</Button>}
  secondaryActions={<Button variant="outline">Secondary</Button>}
>
  {/* Your content */}
</DashboardShell>
```

## 🔘 Buttons

```tsx
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="secondary">Secondary</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

## 💬 Toast Notifications

```tsx
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');

// With description
toast.success('Title', {
  description: 'Description text',
});

// With action
toast.success('Saved', {
  action: {
    label: 'View',
    onClick: () => router.push('/path'),
  },
});
```

## 📇 Cards

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## 📋 Forms

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email" />
</div>
```

## 🎭 Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

## 📊 Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## 🏷️ Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

## 📑 Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## 🎨 Theme Toggle

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />
```

## 📱 Loading State

```tsx
import { Loader2 } from 'lucide-react';

{isLoading ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : (
  'Content'
)}

// Or disable button
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

## 🎯 Typography

```tsx
<h1>Page Title</h1>        // 48px, extrabold
<h2>Section Title</h2>     // 36px, semibold
<h3>Subsection</h3>        // 30px, semibold
<h4>Card Title</h4>        // 24px, semibold
<p>Body text</p>           // 16px, regular
<small>Small text</small>  // 14px, medium

// Or with classes
<h1 className="text-4xl font-extrabold">
<h2 className="text-3xl font-semibold">
```

## 🔍 Select Dropdown

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## 📲 Sheet (Side Panel)

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

## ⌨️ Keyboard Shortcuts

- **Tab** - Navigate forward
- **Shift+Tab** - Navigate backward
- **Escape** - Close dialog/dropdown
- **Enter** - Submit form/activate button
- **Arrow Keys** - Navigate menus/selects
- **Space** - Toggle checkbox/switch

## ♿ Accessibility

```tsx
// Always add labels to inputs
<Label htmlFor="email">Email</Label>
<Input id="email" />

// Add sr-only text for icon buttons
<Button size="icon">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</Button>

// Use semantic HTML
<nav>, <main>, <header>, <footer>, <article>, <section>
```

## 🎨 Common Patterns

### Status Badge
```tsx
const statusColors = {
  active: 'bg-green-500/10 text-green-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
  error: 'bg-red-500/10 text-red-500',
};

<Badge className={statusColors[status]}>{status}</Badge>
```

### Empty State
```tsx
<div className="text-center py-12">
  <Icon className="mx-auto h-12 w-12 text-muted-foreground" />
  <h3 className="mt-4 text-lg font-semibold">No items found</h3>
  <p className="mt-2 text-sm text-muted-foreground">
    Get started by creating a new item.
  </p>
  <Button className="mt-4">Create Item</Button>
</div>
```

### Stats Card
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Total Orders
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">1,234</div>
    <p className="text-sm text-muted-foreground">
      +20% from last month
    </p>
  </CardContent>
</Card>
```

---

**Full Documentation:** See `docs/ui.mdx`
