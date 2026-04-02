-- Add pricing fields to listings
ALTER TABLE public.listings
ADD COLUMN pricing_type text NOT NULL DEFAULT 'fixed',
ADD COLUMN price_per_unit numeric NULL,
ADD COLUMN unit_type text NOT NULL DEFAULT 'quantity',
ADD COLUMN max_quantity numeric NULL;
