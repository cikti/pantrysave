
-- Create user_points table
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create point_transactions table
CREATE TABLE public.point_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
