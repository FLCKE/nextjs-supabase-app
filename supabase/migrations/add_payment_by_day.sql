--create payment table by day 
CREATE TABLE IF NOT EXISTS public.payments_by_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL UNIQUE,
    day_payment TEXT,
    amount_cts INTEGER NOT NULL CHECK (amount_cts >= 0),
    currency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'completed', 'failed', 'initiated')
    ),
    payment_method TEXT NOT NULL DEFAULT 'moneroo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments_by_day;
-- Allow restaurant owners to view payments for their orders
CREATE POLICY "payments_select_policy" ON public.payments_by_day FOR
SELECT USING (
        restaurant_id IN (
            SELECT id
            FROM public.restaurants
            WHERE owner_id = auth.uid()
        )
    );