# 🚀 Getting Started with WEGO RestoPay

## Quick Start (5 minutes)

### 1. **Prerequisites**
- Node.js 18+ and npm
- A Supabase account
- Redis installed locally (or Docker)
- Moneroo API credentials

### 2. **Installation**
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Fill in the variables in .env.local:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - REDIS_URL
# - MONEROO_API_KEY
# - MONEROO_MERCHANT_ID

# Start Redis (if using Docker)
docker run -d --name redis -p 6379:6379 redis:latest

# Run development server
npm run dev
```

Visit http://localhost:3000

### 3. **What to Do First**
1. **Sign up** as a restaurant owner at http://localhost:3000/sign-up
2. **Create a restaurant** in your dashboard
3. **Add menu items** with prices
4. **Generate a QR code** for your restaurant
5. **Scan the QR** with your phone to test ordering

---

## Project Structure Overview

```
WEGO RestoPay/
├── src/
│   ├── app/                    # Next.js routes (frontend + API)
│   ├── components/             # Reusable React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, validators, Redis, Moneroo
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global CSS
├── supabase/
│   └── migrations/             # Database schema migrations
├── public/                     # Static assets
└── docs/                       # Documentation
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/app/(dashboard)` | Restaurant owner dashboard |
| `src/app/(public)` | Customer ordering interface |
| `src/app/(staff)` | POS system for staff |
| `src/app/api` | Backend API endpoints |
| `src/components/ui` | Base UI components (Radix + Tailwind) |
| `src/lib` | Core business logic & utilities |

---

## Technology Stack

### Frontend
- **Next.js 16** - React framework with SSR
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component library

### Backend & Data
- **Supabase** - PostgreSQL database + Auth + Real-time
- **TanStack Query** - Server state management
- **Redis** - Cache & webhook tracking
- **Node-cron** - Scheduled jobs

### Integrations
- **Moneroo** - Payment gateway
- **Supabase Auth** - User authentication

---

## Common Tasks

### Development
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Check code quality
npm run start    # Run production server
```

### Database
```bash
# Create a migration
npx supabase migration new add_feature_name

# Apply migrations locally
npx supabase migration up
```

### Redis
```bash
# Test Redis connection
redis-cli ping

# View all keys
redis-cli KEYS "*"

# Monitor webhook processing
redis-cli MONITOR
```

---

## Architecture Overview

### Request Flow: Customer Placing Order
```
1. Customer scans QR code
   ↓
2. Browser resolves QR token to restaurant
   ↓
3. Customer browses menu (fetched via React Query)
   ↓
4. Customer adds items to cart (client-side state)
   ↓
5. Customer proceeds to checkout
   ↓
6. POST /api/payments/moneroo
   ├─ Create payment record in database
   ├─ Store transaction in Redis cache
   └─ Return payment link to customer
   ↓
7. Customer completes payment on Moneroo
   ↓
8. POST /api/webhooks/moneroo (payment confirmation)
   ├─ Verify Moneroo signature
   ├─ Check for duplicate processing (Redis)
   ├─ Update payment status to 'completed'
   ├─ Create order in database
   ├─ Notify restaurant (real-time via Supabase)
   └─ Return 200 OK
   ↓
9. Restaurant staff sees new order in POS
```

### Architecture: Multi-tenant Restaurant Management
```
WEGO RestoPay (SaaS Platform)
│
├─ Authentication (Supabase Auth)
│  └─ Owner/Staff login
│
├─ Multi-tenant Database
│  ├─ Restaurants (tenant isolation)
│  ├─ Users (owners, staff, customers)
│  ├─ Menus (by restaurant)
│  ├─ Orders (by restaurant)
│  ├─ Inventory (per restaurant)
│  └─ Payments (with Moneroo integration)
│
├─ Dashboard (Protected Routes)
│  ├─ Restaurant Management
│  ├─ Menu Management
│  ├─ Order Tracking
│  ├─ Payment Dashboard
│  ├─ Staff Management
│  └─ QR Code Management
│
├─ Customer Interface (Public Routes)
│  ├─ Menu Browsing
│  ├─ Cart & Checkout
│  ├─ Payment Processing
│  └─ Order Confirmation
│
└─ Staff Interface (Protected Routes)
   ├─ POS System
   ├─ Order Board
   └─ Real-time Order Updates
```

---

## Key Features

### 🏪 For Restaurant Owners
- **Multi-restaurant management** - Manage multiple locations
- **Menu management** - Create, edit, organize menu items
- **QR code ordering** - Customers scan QR to order
- **Real-time order tracking** - See orders as they come in
- **Payment dashboard** - Track payments and reconciliation
- **Staff management** - Create staff accounts and roles
- **Inventory tracking** - Monitor stock levels

### 👥 For Customers
- **QR code ordering** - Scan & browse menu
- **Digital menu** - Beautiful, responsive menu display
- **Shopping cart** - Add items, customize, review
- **Secure checkout** - Moneroo payment integration
- **Order confirmation** - Instant payment confirmation

### 👨‍💼 For Restaurant Staff (POS)
- **Order board** - View incoming orders in real-time
- **Order management** - Mark items as ready, complete orders
- **Quick POS** - Create orders manually

---

## Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Redis (for webhook cache & idempotence)
REDIS_URL=redis://localhost:6379

# Moneroo Payment Gateway
MONEROO_API_KEY=your_moneroo_api_key
MONEROO_MERCHANT_ID=your_merchant_id
MONEROO_WEBHOOK_SECRET=your_webhook_secret

# Optional: Monitoring
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

See `.env.example` for all available options.

---

## Deployment Checklist

- [ ] Set up Redis (cloud provider like Redis Labs)
- [ ] Configure environment variables in production
- [ ] Run database migrations: `npx supabase migration up`
- [ ] Test payment flow with Moneroo sandbox
- [ ] Register webhook URL in Moneroo dashboard
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Enable RLS policies in Supabase
- [ ] Test with real payments (small amount)
- [ ] Monitor webhook logs
- [ ] Set up daily reconciliation job

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed project structure and design patterns
- **[WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)** - Complete payment webhook documentation
- **[DOCS_GUIDE.md](./DOCS_GUIDE.md)** - When and how to update documentation

---

## Support & Troubleshooting

### Build Issues?
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Redis Connection Error?
```bash
# Check Redis is running
redis-cli ping

# Verify REDIS_URL is correct
echo $REDIS_URL
```

### Payment Not Processing?
1. Check webhook logs in Redis: `redis-cli GET webhook:errors:*`
2. Verify Moneroo signature in dashboard
3. Check Moneroo API credentials
4. See [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md) for debugging

---

## Next Steps

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** for deep dive into code organization
2. **Set up a local restaurant** and test the full ordering flow
3. **Review [WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)** to understand payment system
4. **Configure production environment** with real Moneroo credentials
5. **Monitor webhook logs** during launch
