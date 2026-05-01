-- Add net_amount_cts column to payments_by_day table
-- This stores the amount after deducting 5% commission

ALTER TABLE public.payments_by_day
ADD COLUMN IF NOT EXISTS net_amount_cts INTEGER CHECK (net_amount_cts >= 0);

-- Add comment to document the column
COMMENT ON COLUMN public.payments_by_day.net_amount_cts IS 'Amount after 5% commission deduction (net_amount_cts = amount_cts * 0.95)';

-- Create index for faster queries on net amount
CREATE INDEX IF NOT EXISTS idx_payments_by_day_net_amount ON public.payments_by_day(net_amount_cts);

-- Update existing records to calculate net_amount_cts (95% of amount_cts)
-- Use integer-safe arithmetic to avoid floating point precision issues: round to nearest cent
UPDATE public.payments_by_day
SET net_amount_cts = (amount_cts * 95 + 50) / 100
WHERE net_amount_cts IS NULL;

-- Rollback guidance: to revert this migration, drop the column
-- ALTER TABLE public.payments_by_day DROP COLUMN IF EXISTS net_amount_cts;

-- Make net_amount_cts NOT NULL for future inserts (optional, uncomment if needed)
-- ALTER TABLE public.payments_by_day ALTER COLUMN net_amount_cts SET NOT NULL;
