
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS delivery_options jsonb DEFAULT '[]'::jsonb;
