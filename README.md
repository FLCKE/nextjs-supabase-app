# WEGO RestoPay - Restaurant Management Platform

**Fully featured SaaS platform for restaurant management with multi-tenant support, real-time ordering, and Moneroo payment integration.**

## 🎯 Core Features

- **Restaurant Dashboard** - Manage menus, inventory, staff, and orders
- **Customer Ordering** - Public-facing menu & checkout with QR codes
- **Payment Processing** - Moneroo integration with webhook support
- **Real-time Updates** - Supabase for live order status
- **Multi-tenant** - Isolated data per restaurant owner
- **Staff Management** - POS system with staff authentication

## 🏗️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase (Auth + PostgreSQL)
- **Data:** Supabase + TanStack Query v5
- **Cache:** Redis (for webhooks & transactions)
- **Payments:** Moneroo API
- **UI:** Radix UI, Lucide Icons

## 📋 Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # Restaurant owner dashboard
│   ├── (public)/            # Customer-facing pages
│   ├── (staff)/             # POS interface
│   ├── api/
│   │   ├── payments/        # Payment processing
│   │   ├── webhooks/        # Moneroo webhooks
│   │   └── transferts/      # Payouts
│   └── layout.tsx
├── components/              # Reusable UI components
├── lib/
│   ├── moneroo.ts          # Moneroo API client
│   ├── redis.ts            # Redis client
│   ├── transaction-cache.ts # Webhook transaction tracking
│   ├── supabase/           # Database client
│   └── actions/            # Server actions
├── hooks/                   # Custom React hooks
└── types/                   # TypeScript types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Redis (for webhooks)
- Supabase account
- Moneroo API credentials

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start Redis
docker run -d --name redis -p 6379:6379 redis:latest

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Moneroo
MONEROO_API_KEY=your_key
MONEROO_API_URL=https://api.moneroo.io/v1
MONEROO_MERCHANT_ID=your_merchant_id

# Redis (webhooks)
REDIS_URL=redis://localhost:6379

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🔑 Key Systems

### Payment System
- Webhook-based payment processing
- Idempotent transaction handling via Redis
- Real-time order status updates
- Daily payout aggregation

**Webhook Flow:**
```
Customer Payment → Moneroo → Webhook → Redis (idempotence)
                                   ↓
                          Update Database
                                   ↓
                          Emit Real-time Update
```

### Multi-tenancy
- Row-level security (RLS) via Supabase
- Restaurant isolation at database level
- Staff access control
- Customer public access

### Real-time Updates
- Supabase real-time subscriptions
- Order status notifications
- Inventory updates
- Live table status

## 📊 Database Schema

**Core Tables:**
- `profiles` - Users
- `restaurants` - Restaurant details
- `locations` - Restaurant locations
- `tables` - Dining tables with QR codes
- `menus` - Menu collections
- `menu_items` - Individual items
- `orders` - Customer orders
- `order_items` - Items in orders
- `payments` - Payment records
- `payments_by_day` - Daily aggregations
- `staff_members` - POS staff

## 🔐 Security

- **Authentication:** Supabase Auth (email + magic links)
- **Authorization:** Row-level security (RLS)
- **Payment Security:** HMAC-SHA256 webhook verification
- **API Protection:** Supabase JWT tokens
- **Data Isolation:** Restaurant-scoped queries

## 📱 API Endpoints

### Payments
- `POST /api/payments/moneroo` - Initiate payment
- `POST /api/payments/moneroo/link` - Get payment link
- `POST /api/webhooks/moneroo` - Webhook handler

### QR Codes
- `GET /api/qr-codes/locations` - Get tables by location

### Transfers
- `POST /api/transferts` - Initiate payouts
- `POST /api/transferts/init_daily_transfert` - Daily aggregation

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📚 Documentation

Complete documentation is available in separate `.md` files:

- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** ⭐ **Start here!** - Complete guide to all docs
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Quick start guide (5 min setup)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Project structure & design
- **[API_REFERENCE.md](./API_REFERENCE.md)** - All API endpoints
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database tables & relationships
- **[COMPONENTS_HOOKS.md](./COMPONENTS_HOOKS.md)** - React components & hooks
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development workflow
- **[WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)** - Payment system details
- **[DOCS_GUIDE.md](./DOCS_GUIDE.md)** - How to write documentation

## 🚀 Deployment

### Production Checklist
- [ ] Supabase project configured
- [ ] Redis instance running (managed service recommended)
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Moneroo credentials configured
- [ ] Webhook URL registered in Moneroo dashboard
- [ ] Error monitoring (Sentry, etc.) setup
- [ ] CORS properly configured

### Hosting Options
- **Vercel** - Recommended for Next.js
- **Railway** - Full-stack with Redis
- **DigitalOcean** - App Platform
- **AWS** - EC2 + RDS + ElastiCache

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/your-feature`
4. Open pull request

## 📄 License

MIT License - See LICENSE file

## 📞 Support

For issues or questions:
1. Check documentation in this README
2. Review code comments
3. Check Supabase/Moneroo docs
4. Open an issue on GitHub

---

**Built with ❤️ using Next.js, Supabase, and Moneroo**
