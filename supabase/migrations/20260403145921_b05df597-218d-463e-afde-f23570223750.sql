
CREATE TABLE public.user_impact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  money_saved numeric NOT NULL DEFAULT 0,
  food_saved numeric NOT NULL DEFAULT 0,
  orders_made integer NOT NULL DEFAULT 0,
  items_listed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_impact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own impact" ON public.user_impact FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own impact" ON public.user_impact FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own impact" ON public.user_impact FOR UPDATE USING (auth.uid() = user_id);
