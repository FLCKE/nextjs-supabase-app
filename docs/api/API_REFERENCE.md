# 📡 API Reference - WEGO RestoPay

Complete documentation for all backend API endpoints.

---

## Authentication

All protected endpoints require Supabase authentication. Include the session cookie in requests.

### Sign Up
```bash
POST /sign-up
Content-Type: application/json

{
  "email": "owner@restaurant.com",
  "password": "secure_password"
}

Response: 200 OK
Location: /dashboard
```

### Sign In
```bash
POST /sign-in
Content-Type: application/json

{
  "email": "owner@restaurant.com",
  "password": "secure_password"
}

Response: 200 OK
Location: /dashboard
```

---

## Payments API

### Initialize Payment (Customer)
Create a payment record and get a Moneroo payment link.

```bash
POST /api/payments/moneroo

Headers:
  Content-Type: application/json

Body:
{
  "amount": 10000,           # Amount in cents (100.00 currency units)
  "currency": "XAF",         # Currency code
  "description": "Order #123 - Restaurant Name",
  "customer_email": "customer@email.com",
  "customer_phone": "237690000000",
  "order_id": "order-uuid",  # Your internal order ID (optional)
  "metadata": {
    "restaurant_id": "rest-uuid",
    "table_number": 5
  }
}

Response: 200 OK
{
  "success": true,
  "transactionId": "trans-1234567890",
  "paymentLink": "https://moneroo.io/pay/trans-1234567890",
  "expiresAt": "2026-03-28T11:52:07Z"
}

Error: 400 Bad Request
{
  "success": false,
  "error": "Invalid amount or missing required fields"
}
```

### Get Payment Link (Staff)
Retrieve a payment link for a transaction.

```bash
POST /api/payments/moneroo/link

Headers:
  Content-Type: application/json

Body:
{
  "transactionId": "trans-1234567890"
}

Response: 200 OK
{
  "success": true,
  "transactionId": "trans-1234567890",
  "paymentLink": "https://moneroo.io/pay/trans-1234567890",
  "amount": 10000,
  "currency": "XAF",
  "status": "pending",
  "createdAt": "2026-03-28T10:52:07Z"
}

Error: 404 Not Found
{
  "success": false,
  "error": "Transaction not found"
}
```

---

## Webhooks API

### Moneroo Payment Webhook
Moneroo sends payment confirmation to this endpoint.

```bash
POST /api/webhooks/moneroo

Headers:
  Content-Type: application/json
  X-Moneroo-Signature: HMAC-SHA256-signature

Body:
{
  "event": "payment_confirmed",
  "transaction_id": "trans-1234567890",
  "amount": 10000,
  "currency": "XAF",
  "status": "completed",
  "timestamp": "2026-03-28T11:00:00Z"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment processed",
  "requestId": "[webhook-20260328-abc123]"
}

Error: 401 Unauthorized
{
  "success": false,
  "error": "Invalid signature"
}

Error: 400 Bad Request
{
  "success": false,
  "error": "Missing transaction_id",
  "requestId": "[webhook-20260328-abc123]"
}
```

**Webhook Signature Verification:**
- Moneroo signs the request body with your webhook secret
- Verify signature before processing payment
- Headers: `X-Moneroo-Signature` (hex-encoded HMAC-SHA256)
- Implementation: See `src/lib/moneroo.ts` → `verifyMonerooWebhookSignature()`

**Idempotence:**
- The same webhook may be received multiple times
- Webhook is tracked in Redis for 24 hours
- Duplicate processing is prevented automatically
- RequestId is returned for debugging

**Troubleshooting:**
```bash
# Check if webhook was processed
redis-cli GET webhook:processed:trans-1234567890

# View recent webhook errors
redis-cli KEYS webhook:errors:*
redis-cli GET webhook:errors:trans-1234567890

# Monitor all webhooks
redis-cli MONITOR
```

---

## QR Code API

### Get Table Locations
Get available tables for a restaurant (used in QR scanning).

```bash
GET /api/qr-codes/locations?restaurantId=rest-uuid

Response: 200 OK
{
  "success": true,
  "locations": [
    {
      "id": "loc-uuid",
      "name": "Table 1",
      "tableNumber": 1,
      "description": "Window seat",
      "capacity": 4
    },
    {
      "id": "loc-uuid",
      "name": "Table 2",
      "tableNumber": 2,
      "description": "Bar counter",
      "capacity": 2
    }
  ]
}

Error: 400 Bad Request
{
  "success": false,
  "error": "restaurantId is required"
}
```

---

## Transfers API

### Initialize Daily Transfer (Staff)
Create a payout from collected payments to restaurant bank account.

```bash
POST /api/transferts/init_daily_transfert

Headers:
  Content-Type: application/json
  Authorization: Bearer {supabase_token}

Body:
{
  "restaurantId": "rest-uuid",
  "amount": 500000,              # Amount in cents
  "currency": "XAF",
  "bankAccountId": "bank-uuid",  # Optional - use default if not provided
  "description": "Daily settlement for 2026-03-28"
}

Response: 200 OK
{
  "success": true,
  "transferId": "transfer-uuid",
  "amount": 500000,
  "status": "pending",
  "estimatedDelivery": "2026-03-29T00:00:00Z"
}

Error: 400 Bad Request
{
  "success": false,
  "error": "Invalid amount or missing restaurantId"
}

Error: 401 Unauthorized
{
  "success": false,
  "error": "Authentication required"
}
```

---

## Data Models

### Payment Status
```typescript
type PaymentStatus = 
  | "pending"      // Awaiting customer payment
  | "completed"    // Payment received
  | "failed"       // Payment declined
  | "expired"      // Link expired (>1 hour)
  | "refunded"     // Money returned to customer
```

### Order Status
```typescript
type OrderStatus =
  | "pending"      // Awaiting preparation
  | "preparing"    // Being prepared
  | "ready"        // Ready for pickup
  | "completed"    // Customer received
  | "cancelled"    // Order cancelled
```

### Payment Record
```typescript
interface Payment {
  id: string                    // UUID
  restaurant_id: string         // FK to restaurants
  transaction_id: string        // Moneroo transaction ID
  order_id?: string             // FK to orders
  amount: number                // In cents
  currency: string              // e.g., "XAF"
  status: PaymentStatus         // Payment status
  customer_email?: string       // For receipt
  customer_phone?: string
  metadata?: Record<string, any> // Custom data
  payment_method?: string       // "moneroo", etc.
  created_at: string            # ISO 8601 timestamp
  updated_at: string            # ISO 8601 timestamp
}
```

### Order Record
```typescript
interface Order {
  id: string                    # UUID
  restaurant_id: string         # FK to restaurants
  table_id?: string             # FK to tables
  payment_id?: string           # FK to payments
  items: OrderItem[]            # Line items
  total_amount: number          # In cents
  currency: string
  status: OrderStatus
  special_requests?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

interface OrderItem {
  id: string
  menu_item_id: string
  name: string
  price: number
  quantity: number
  special_instructions?: string
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "requestId": "[optional-trace-id]",
  "details": {
    "field": "error details"
  }
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth required or invalid) |
| 403 | Forbidden (permission denied) |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

- **Webhook endpoints**: No limit (for idempotence)
- **Payment endpoints**: 100 requests per minute per IP
- **Other endpoints**: 1000 requests per minute per user

---

## Testing Webhooks Locally

### Using curl
```bash
# Set up local ngrok tunnel (exposes localhost to internet)
ngrok http 3000
# Note the URL: https://xxxxx.ngrok.io

# Register in Moneroo dashboard:
# Webhook URL: https://xxxxx.ngrok.io/api/webhooks/moneroo

# Simulate a webhook
curl -X POST http://localhost:3000/api/webhooks/moneroo \
  -H "Content-Type: application/json" \
  -H "X-Moneroo-Signature: $(openssl dgst -sha256 -hmac 'your_secret' -binary your_payload | xxd -p -c 256)" \
  -d '{
    "event": "payment_confirmed",
    "transaction_id": "trans-test-123",
    "amount": 10000,
    "currency": "XAF",
    "status": "completed"
  }'
```

### Using Redis Monitor
```bash
# Monitor all webhook processing in real-time
redis-cli MONITOR

# In another terminal, send webhook
# Watch the output for processing logs
```

---

## Security

- **All endpoints verify authentication** where required
- **Row-Level Security (RLS)** ensures users can only access their own restaurant data
- **Webhook signature verification** prevents unauthorized payments
- **Idempotence tracking** in Redis prevents duplicate processing
- **Input validation** using Zod schemas
- **HTTPS required** in production

---

## Monitoring

### Webhook Health Check
```bash
# Recent webhook requests
redis-cli KEYS "webhook:processed:*" | wc -l

# Failed webhooks
redis-cli KEYS "webhook:errors:*"
redis-cli GET webhook:errors:trans-xxx

# Pending transactions
redis-cli KEYS "transaction:*"
```

### Database Validation
```sql
-- Check payment status
SELECT id, transaction_id, status, created_at 
FROM payments 
WHERE restaurant_id = 'rest-uuid'
ORDER BY created_at DESC 
LIMIT 10;

-- Check for duplicate payments
SELECT transaction_id, COUNT(*) 
FROM payments 
GROUP BY transaction_id 
HAVING COUNT(*) > 1;
```

---

## Changelog

### v1.0.0 (2026-03-28)
- ✅ Webhook idempotence via Redis
- ✅ Signature verification with safety checks
- ✅ Request tracing with unique IDs
- ✅ Error logging and debugging
- ✅ Full production support

---

For more details, see:
- **[WEBHOOK_MONEROO.md](./WEBHOOK_MONEROO.md)** - Payment system deep dive
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Code organization
