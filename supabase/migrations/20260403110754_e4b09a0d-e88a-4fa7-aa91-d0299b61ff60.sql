ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS voucher_type text NOT NULL DEFAULT 'claimable';
ALTER TABLE public.vouchers ADD COLUMN IF NOT EXISTS points_cost integer NOT NULL DEFAULT 100;