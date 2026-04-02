-- Add seller_name and delivery_fee to listings
ALTER TABLE public.listings
ADD COLUMN seller_name TEXT,
ADD COLUMN delivery_fee NUMERIC DEFAULT 0;

-- Add index on status for faster filtering
CREATE INDEX idx_listings_status ON public.listings(status);