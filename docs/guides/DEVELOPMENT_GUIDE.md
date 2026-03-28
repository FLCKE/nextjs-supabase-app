# 👨‍💻 Development Guide

Complete guide for contributing to WEGO RestoPay and setting up a development environment.

---

## Table of Contents

1. [Setup](#setup)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing](#testing)
5. [Debugging](#debugging)
6. [Database Changes](#database-changes)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Docker (optional, for Redis)
- A Supabase project

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/wego-restopay.git
cd wego-restopay

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local

# 4. Edit .env.local with your values
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - REDIS_URL
# - MONEROO_API_KEY (get from Moneroo dashboard)
# - MONEROO_WEBHOOK_SECRET

# 5. Start Redis (if using Docker)
docker run -d --name redis -p 6379:6379 redis:latest

# 6. Run development server
npm run dev

# 7. Open browser
# http://localhost:3000
```

### Verify Setup

```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm
npm --version

# Test Redis connection
redis-cli ping  # Should return PONG

# Test build
npm run build   # Should complete without errors

# Run linter
npm run lint    # Should show no major errors
```

---

## Development Workflow

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/bug-description
# or for improvements
git checkout -b improvement/description
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `improvement/` - Code improvements
- `docs/` - Documentation only

Example: `feature/add-table-management`

### Writing Code

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Make your changes

# Run linter to check code quality
npm run lint

# Fix linting issues
npm run lint --fix
```

### Committing Changes

```bash
# Check what changed
git status
git diff

# Stage files
git add .

# Commit with descriptive message
git commit -m "feat: add table management feature"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Message Format

Follow conventional commits:
```
type(scope): description

feat(orders): add order confirmation email
fix(payments): handle webhook timeout correctly
docs(api): update payment endpoint documentation
style(ui): format button component
refactor(hooks): simplify useOrders hook
test(webhooks): add signature verification tests
perf(queries): optimize restaurant list query
```

### Creating a Pull Request

1. Push your branch to GitHub
2. Create PR on GitHub
3. Fill in PR template:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI change)

### Code Review Checklist

Before submitting PR, ensure:
- ✅ Code follows project style guide
- ✅ No console errors or warnings
- ✅ TypeScript compiles without errors
- ✅ ESLint passes (`npm run lint`)
- ✅ Feature works as described
- ✅ No hardcoded values or secrets
- ✅ Tests added (if applicable)
- ✅ Documentation updated

---

## Code Standards

### TypeScript

**Always use TypeScript**, no `any` except where absolutely necessary.

```typescript
// ✅ Good
interface Restaurant {
  id: string
  name: string
  email: string
  createdAt: Date
}

const getRestaurant = async (id: string): Promise<Restaurant> => {
  // ...
}

// ❌ Bad
const getRestaurant = async (id: any): Promise<any> => {
  // ...
}
```

### Naming Conventions

```typescript
// Components: PascalCase
function RestaurantCard() {}

// Functions/variables: camelCase
const getRestaurantId = () => {}
let currentRestaurant = null

// Constants: UPPER_SNAKE_CASE
const MAX_RESTAURANTS_PER_OWNER = 10
const API_TIMEOUT_MS = 30000

// Database columns: snake_case
// restaurant_id, created_at, is_active

// Types/interfaces: PascalCase
type OrderStatus = "pending" | "completed"
interface Order { }
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Base components
│   ├── orders/          # Feature-specific
│   ├── restaurants/
│   └── layout/
├── hooks/               # Custom hooks
├── lib/                 # Utilities, helpers
├── types/               # TypeScript types
├── app/                 # Next.js routes
│   ├── api/
│   ├── (dashboard)/
│   └── (public)/
└── styles/              # Global CSS
```

### Component Structure

```typescript
// src/components/orders/orders-table.tsx

import { useState } from "react"
import { Order } from "@/types"
import { Button } from "@/components/ui/button"

interface OrdersTableProps {
  orders: Order[]
  onOrderSelect?: (id: string) => void
}

export function OrdersTable({ orders, onOrderSelect }: OrdersTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const handleSelect = (id: string) => {
    setSelectedId(id)
    onOrderSelect?.(id)
  }
  
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### API Route Structure

```typescript
// src/app/api/orders/route.ts

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Validate input
    const data = await request.json()
    validateOrderData(data)
    
    // Process request
    const order = await createOrder(data)
    
    // Return response
    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/orders error:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

### Error Handling

```typescript
// ✅ Good
try {
  const result = await fetchData()
  return result
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error("Failed to fetch:", message)
  toast.error(message)
}

// ❌ Bad
try {
  return await fetchData()
} catch (e) {
  // Silent failure
}
```

### Comments

Only comment code that needs clarification. Avoid obvious comments.

```typescript
// ❌ Bad - obvious
const user = getUserById(id) // Get user by ID
const isValid = user !== null // Check if user exists

// ✅ Good - explains why, not what
// Webhook signature verification must compare byte-length before timing-safe comparison
// to prevent crashes on malformed signatures
if (signature.length !== computedSignature.length) {
  return false
}
```

---

## Testing

### Unit Tests (if added)

```bash
# Run tests
npm test

# Run tests in watch mode
npm test --watch

# Run specific test file
npm test orders.test.ts
```

### Manual Testing

**Test Checklist:**
```
[ ] Component renders without errors
[ ] User interactions work as expected
[ ] Data is fetched and displayed correctly
[ ] Error states are handled
[ ] Loading states show
[ ] No console errors/warnings
[ ] Mobile responsive (check with DevTools)
[ ] API requests complete successfully
```

### Testing a Payment Flow (Manual)

```bash
# 1. Start development server
npm run dev

# 2. Open http://localhost:3000

# 3. Sign up as owner
# - Go to /sign-up
# - Create account

# 4. Create a restaurant
# - Navigate to dashboard
# - Create test restaurant

# 5. Add menu items
# - Create menu
# - Add test items with prices

# 6. Generate QR code
# - Go to QR codes section
# - Generate code

# 7. Scan QR code
# - Open phone camera or QR scanner
# - Scan the generated code

# 8. Test checkout (without payment)
# - Browse menu
# - Add items to cart
# - Proceed to checkout
# - Don't complete Moneroo payment (testing only)

# 9. Check Redis webhook processing
redis-cli MONITOR

# In another window, simulate webhook:
curl -X POST http://localhost:3000/api/webhooks/moneroo \
  -H "Content-Type: application/json" \
  -H "X-Moneroo-Signature: $(echo -n '{"transaction_id":"test"}' | openssl dgst -sha256 -hmac 'your_webhook_secret' | cut -d' ' -f2)" \
  -d '{"transaction_id":"test","amount":10000,"status":"completed"}'

# 10. Check database
# - Orders should be created
# - Payment status should be updated
```

---

## Debugging

### Browser DevTools

```javascript
// Check Supabase session
console.log(supabase.auth.session())

// Check React Query cache
window.__REACT_QUERY_DEVTOOLS_PANEL__

// Check Redux state (if used)
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
```

### Server-side Logging

```typescript
// In API routes or server components
console.log("Debug info:", {
  userId: user.id,
  restaurantId: params.id,
  timestamp: new Date().toISOString()
})

// Check logs
npm run dev  # Logs appear in terminal
```

### Redis Debugging

```bash
# Monitor all Redis operations in real-time
redis-cli MONITOR

# Check specific keys
redis-cli GET webhook:processed:trans-123
redis-cli KEYS "webhook:*"

# Check webhook errors
redis-cli GET webhook:errors:trans-123

# View all keys
redis-cli KEYS "*"

# Get info about Redis
redis-cli INFO
```

### Database Debugging

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://user:password@host/database"

# Common queries
SELECT * FROM restaurants WHERE owner_id = 'user-id' LIMIT 1;
SELECT * FROM orders WHERE restaurant_id = 'rest-id' ORDER BY created_at DESC;
SELECT * FROM payments WHERE status = 'pending';
```

### Network Debugging

```bash
# Check API requests in browser DevTools
# 1. Open DevTools (F12)
# 2. Go to Network tab
# 3. Perform action
# 4. Check request/response headers and body

# Check with curl
curl -X GET http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -v  # Verbose (shows headers)
```

---

## Database Changes

### Creating a Migration

```bash
# Generate migration file
npx supabase migration new add_inventory_table

# Edit the file in supabase/migrations/
# E.g., supabase/migrations/20260328_add_inventory_table.sql

# Migration content example:
# CREATE TABLE inventory (
#   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#   restaurant_id UUID NOT NULL REFERENCES restaurants(id),
#   menu_item_id UUID NOT NULL REFERENCES menu_items(id),
#   quantity INTEGER NOT NULL,
#   created_at TIMESTAMP DEFAULT now()
# );
# ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

# Apply locally
npx supabase migration up

# Push to production
npx supabase db push
```

### Testing Migrations

```bash
# Reset local database (loses data)
npx supabase db reset

# This will:
# 1. Drop all tables
# 2. Re-apply all migrations
# 3. Seed data (if seed.sql exists)
```

### Checking Migration Status

```bash
# View applied migrations
npx supabase migration list

# View specific migration
npx supabase migration status
```

---

## Common Tasks

### Add a New API Endpoint

```typescript
// 1. Create file: src/app/api/orders/count/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: request.cookies }
    )
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // Query data
    const { data: count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id)
    
    return NextResponse.json({ count }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 2. Test the endpoint
curl http://localhost:3000/api/orders/count

// 3. Add to API_REFERENCE.md documentation
```

### Add a New Page/Route

```typescript
// 1. Create page: src/app/(dashboard)/dashboard/analytics/page.tsx

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AnalyticsChart } from "@/components/analytics/chart"

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <AnalyticsChart />
      </div>
    </DashboardShell>
  )
}

// 2. Add route to sidebar navigation (src/components/layout/app-sidebar.tsx)
// 3. Test navigation works
```

### Add a New Component

```typescript
// 1. Create file: src/components/analytics/revenue-card.tsx

interface RevenueCardProps {
  value: number
  currency: string
  period: "day" | "week" | "month"
}

export function RevenueCard({ value, currency, period }: RevenueCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue ({period})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {currency} {value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

// 2. Export from index: add to src/components/analytics/index.ts
// 3. Use in pages
```

### Update Documentation

```bash
# 1. Edit relevant .md file
# E.g., API_REFERENCE.md, ARCHITECTURE.md

# 2. Update structure if needed
# Use consistent formatting, headings, code blocks

# 3. Commit changes
git add docs/*.md
git commit -m "docs: update API reference for new endpoint"
```

---

## Troubleshooting

### Build Fails with TypeScript Error

```bash
# Check for specific errors
npm run build

# Try clearing cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Check REDIS_URL in .env.local
echo $REDIS_URL

# Try to connect manually
redis-cli -u redis://localhost:6379

# If using Docker, check container
docker ps | grep redis
docker logs redis  # View logs
```

### Supabase Connection Error

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection with curl
curl -X GET "https://your-project.supabase.co/rest/v1/restaurants" \
  -H "Authorization: Bearer your_anon_key" \
  -H "apikey: your_anon_key"

# Check Supabase project status at https://app.supabase.com
```

### Webhook Not Processing

```bash
# Check webhook signature
redis-cli GET webhook:errors:*

# Check transaction was stored
redis-cli GET transaction:trans-id

# Verify request was received
npm run dev  # Check terminal logs

# Test webhook manually
curl -X POST http://localhost:3000/api/webhooks/moneroo \
  -H "Content-Type: application/json" \
  -d '{...webhook_payload...}'
```

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

---

## Performance Tips

### Code Splitting
```typescript
// Lazy load heavy components
import dynamic from "next/dynamic"

const HeavyAnalytics = dynamic(
  () => import("@/components/analytics"),
  { loading: () => <div>Loading...</div> }
)
```

### Image Optimization
```typescript
import Image from "next/image"

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={200}
  priority  // For above-the-fold images
/>
```

### Query Optimization
```typescript
// Cache frequently accessed data
const { data: restaurants } = useRestaurants()

// Refetch only when needed
const { refetch } = useOrders(restaurantId)
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Guides](https://supabase.com/docs)
- [Radix UI Documentation](https://radix-ui.com/docs/primitives/overview/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Need help? Check:
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure
2. **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoints
3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database models
4. **[COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md)** - Component library
