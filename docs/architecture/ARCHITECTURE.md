# Architecture Guide

Clean project structure with organized code and minimal documentation.

## 📁 Project Structure

```
nextjs-supabase-app/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── (dashboard)/              # Dashboard routes (protected)
│   │   ├── (public)/                 # Public routes (customer-facing)
│   │   ├── (staff)/                  # Staff/POS routes (protected)
│   │   ├── api/                      # API routes
│   │   │   ├── payments/             # Payment processing
│   │   │   │   ├── moneroo/
│   │   │   │   │   ├── route.ts      # POST - Initiate payment
│   │   │   │   │   └── link/route.ts # POST - Get payment link
│   │   │   ├── webhooks/
│   │   │   │   └── moneroo/route.ts  # POST - Webhook handler
│   │   │   └── transferts/           # Payout processing
│   │   ├── sign-in/                  # Authentication
│   │   ├── sign-up/
│   │   ├── auth/callback/
│   │   ├── layout.tsx                # Root layout
│   │   └── middleware.ts             # Auth middleware
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # Base UI components (Radix)
│   │   ├── orders/                   # Order management components
│   │   ├── restaurants/              # Restaurant components
│   │   ├── menus/                    # Menu components
│   │   └── ...
│   ├── hooks/                        # Custom React hooks
│   │   ├── useUser.ts                # Get current user
│   │   ├── use-orders-realtime.ts    # Real-time orders
│   │   └── ...
│   ├── lib/                          # Utilities & clients
│   │   ├── redis.ts                  # Redis client (NEW)
│   │   ├── moneroo.ts                # Moneroo API client
│   │   ├── transaction-cache.ts      # Webhook transaction tracking (REFACTORED)
│   │   ├── supabase/
│   │   │   ├── client.ts             # Client-side Supabase
│   │   │   └── server.ts             # Server-side Supabase
│   │   ├── actions/                  # Server actions
│   │   │   ├── payment.ts
│   │   │   ├── restaurant-management.ts
│   │   │   └── ...
│   │   ├── validation/               # Zod schemas
│   │   │   ├── restaurant.ts
│   │   │   └── ...
│   │   ├── cart/                     # Cart logic
│   │   ├── jobs/                     # Background jobs
│   │   ├── data.ts                   # Data fetching
│   │   ├── utils.ts                  # Utility functions
│   │   └── validations/              # More validation schemas
│   ├── types/                        # TypeScript types
│   │   └── index.ts                  # All type definitions
│   └── middleware.ts                 # Route protection
├── supabase/
│   └── migrations/                   # Database migrations
├── public/                           # Static assets
├── .env.example                      # Environment template
├── README.md                         # Project documentation
├── WEBHOOK_MONEROO.md               # Webhook implementation details
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── eslint.config.mjs
```

## 🔑 Key Files

### Payment System (Moneroo)
| File | Purpose |
|------|---------|
| `src/lib/redis.ts` | Redis client for webhook processing |
| `src/lib/moneroo.ts` | Moneroo API integration |
| `src/lib/transaction-cache.ts` | Redis-based transaction tracking |
| `src/app/api/payments/moneroo/route.ts` | Initiate payment |
| `src/app/api/payments/moneroo/link/route.ts` | Get payment link |
| `src/app/api/webhooks/moneroo/route.ts` | Webhook handler (idempotent) |

### Database & Data
| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Client-side Supabase auth |
| `src/lib/supabase/server.ts` | Server-side Supabase queries |
| `src/lib/data.ts` | Data fetching utilities |
| `supabase/migrations/` | Database schema |
| `src/types/index.ts` | TypeScript types |

### UI & Components
| File | Purpose |
|------|---------|
| `src/components/ui/` | Base UI components (Radix) |
| `src/components/orders/` | Order management |
| `src/components/restaurants/` | Restaurant management |
| `src/components/menus/` | Menu management |

### Server Actions
| File | Purpose |
|------|---------|
| `src/lib/actions/payment.ts` | Payment operations |
| `src/lib/actions/restaurant-management.ts` | Restaurant CRUD |
| `src/lib/actions/order-actions.ts` | Order operations |
| `src/lib/actions/pos-actions.ts` | POS operations |

## 🏗️ Architecture Patterns

### Multi-tenancy
```typescript
// Every query scoped to current restaurant
const orders = await supabase
  .from('orders')
  .select('*')
  .eq('restaurant_id', restaurantId)  // ← Always filter by restaurant
```

### Server Actions
```typescript
// In lib/actions/example.ts
'use server'

export async function exampleAction(data: Data) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Server-side logic here
  return result
}
```

### API Routes
```typescript
// In src/app/api/example/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  // Handle request
  return NextResponse.json(result)
}
```

### Webhook Processing
```typescript
// POST /api/webhooks/moneroo
// 1. Verify signature
// 2. Check idempotence (Redis)
// 3. Update database
// 4. Mark processed (Redis)
// 5. Return 200
```

## 🔒 Security Layers

1. **Authentication** - Supabase Auth
2. **Authorization** - Row-level security (RLS)
3. **API Protection** - JWT tokens
4. **Webhook Verification** - HMAC-SHA256 signature
5. **Data Isolation** - Restaurant-scoped queries
6. **Input Validation** - Zod schemas

## 📊 Data Flow

### Order Creation
```
Customer → POST /api/orders
  ↓
Create order_items (in transaction)
  ↓
Set order status = 'PENDING'
  ↓
Return order + total amount
```

### Payment Processing
```
Customer → POST /api/payments/moneroo
  ↓
Create transaction (Moneroo API)
  ↓
Store in Redis (tracking)
  ↓
Insert payment record (DB)
  ↓
Return transactionId + paymentLink
```

### Webhook Processing
```
Moneroo → POST /api/webhooks/moneroo
  ↓
Verify signature ✓
  ↓
Check idempotence (Redis) ✓
  ↓
Update payment status
  ↓
Update order status → 'PAID'
  ↓
Mark processed (Redis) ✓
  ↓
Return 200 OK
```

## 🚀 Deployment Structure

```
Environment Variables:
├── Supabase
│   ├── NEXT_PUBLIC_SUPABASE_URL
│   └── NEXT_PUBLIC_SUPABASE_ANON_KEY
├── Moneroo
│   ├── MONEROO_API_KEY
│   ├── MONEROO_API_URL
│   └── MONEROO_MERCHANT_ID
├── Redis
│   └── REDIS_URL
└── Site
    └── NEXT_PUBLIC_SITE_URL
```

## 📈 Performance Optimizations

1. **Caching**
   - Server-side: TanStack Query
   - Client-side: React hooks + state
   - Webhook cache: Redis

2. **Database**
   - Indexes on frequently queried fields
   - Row-level security (RLS) for data isolation
   - Real-time subscriptions for live updates

3. **API**
   - Minimal payload sizes
   - Batch operations (transactions)
   - Error recovery with retries

## 🧪 Testing Strategy

1. **Unit Tests** - Component logic
2. **Integration Tests** - API routes + database
3. **E2E Tests** - Full payment flow
4. **Manual Testing** - Webhook signature & idempotence

## 📚 Documentation

- **README.md** - Project overview & setup
- **WEBHOOK_MONEROO.md** - Webhook details & API reference
- **ARCHITECTURE.md** - This file (structure & patterns)

## 🔧 Maintenance

### Regular Tasks
- Monitor Redis memory usage
- Check webhook processing logs
- Review database performance (indexes)
- Update dependencies monthly

### Monitoring
- Sentry for error tracking
- Redis metrics dashboard
- Supabase audit logs
- API response times

---

**Architecture is clean, documented, and ready for production! ✅**
