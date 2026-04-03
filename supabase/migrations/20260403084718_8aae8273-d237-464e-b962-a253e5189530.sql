
-- Vouchers table
CREATE TABLE public.vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_spend NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  times_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vouchers"
ON public.vouchers FOR SELECT
USING (is_active = true);

-- User vouchers (assigned to specific users)
CREATE TABLE public.user_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, voucher_id)
);

ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vouchers"
ON public.user_vouchers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own vouchers"
ON public.user_vouchers FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user vouchers"
ON public.user_vouchers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Seed some demo vouchers
INSERT INTO public.vouchers (code, name, discount_type, discount_value, min_spend) VALUES
('SAVE10', '10% Off', 'percentage', 10, 0),
('RM5OFF', 'RM5 Off (Min RM30)', 'fixed', 5, 30),
('WELCOME20', '20% Off Welcome', 'percentage', 20, 15);
