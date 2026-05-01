-- Add commission and net_amount columns to payments table (commission in cents, net amount in cents)

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS commission_cts INTEGER DEFAULT 0 CHECK (commission_cts >= 0),
ADD COLUMN IF NOT EXISTS net_amount_cts INTEGER CHECK (net_amount_cts >= 0);

COMMENT ON COLUMN public.payments.commission_cts IS 'Commission in cents applied at payment creation (default 5%)';
COMMENT ON COLUMN public.payments.net_amount_cts IS 'Net amount after commission (in cents)';

-- Update existing rows: commission = round(amount_cts * 5 / 100), net = amount - commission
UPDATE public.payments
SET commission_cts = (amount_cts * 5 + 50) / 100,
    net_amount_cts = amount_cts - ((amount_cts * 5 + 50) / 100)
WHERE net_amount_cts IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_net_amount ON public.payments(net_amount_cts);

-- Rollback guidance:
-- ALTER TABLE public.payments DROP COLUMN IF EXISTS net_amount_cts;
-- ALTER TABLE public.payments DROP COLUMN IF EXISTS commission_cts;
