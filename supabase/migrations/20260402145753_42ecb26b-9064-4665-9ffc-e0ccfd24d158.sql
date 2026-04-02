
-- Add stock_quantity column
ALTER TABLE public.listings 
ADD COLUMN stock_quantity integer NOT NULL DEFAULT 1;

-- Backfill existing listings: use max_quantity if set, otherwise 1
UPDATE public.listings 
SET stock_quantity = COALESCE(max_quantity::integer, 1)
WHERE stock_quantity = 1;
