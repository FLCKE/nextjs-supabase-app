-- Create payments table for Moneroo transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  amount_cts INTEGER NOT NULL CHECK (amount_cts >= 0),
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'moneroo',
  checkout_url TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_update_policy" ON public.payments;

-- Allow restaurant owners to view payments for their orders
CREATE POLICY "payments_select_policy" ON public.payments
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      INNER JOIN public.tables t ON o.table_id = t.id
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Allow anyone to insert payments (webhooks)
CREATE POLICY "payments_insert_policy" ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- Allow restaurant owners to update payments
CREATE POLICY "payments_update_policy" ON public.payments
  FOR UPDATE
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      INNER JOIN public.tables t ON o.table_id = t.id
      INNER JOIN public.locations l ON t.location_id = l.id
      INNER JOIN public.restaurants r ON l.restaurant_id = r.id
      WHERE r.owner_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated, anon;
