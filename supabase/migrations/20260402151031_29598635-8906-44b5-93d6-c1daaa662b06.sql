
CREATE OR REPLACE FUNCTION public.purchase_listing(
  p_listing_id UUID,
  p_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_new_status TEXT;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO v_current_stock
  FROM public.listings
  WHERE id = p_listing_id;

  IF v_current_stock IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;

  -- Calculate new stock
  v_new_stock := GREATEST(0, v_current_stock - p_quantity);
  
  -- Determine new status
  IF v_new_stock = 0 THEN
    v_new_status := 'sold';
  ELSE
    v_new_status := 'available';
  END IF;

  -- Update listing
  UPDATE public.listings
  SET stock_quantity = v_new_stock,
      status = v_new_status::listing_status
  WHERE id = p_listing_id;

  RETURN json_build_object(
    'new_stock', v_new_stock,
    'new_status', v_new_status
  );
END;
$$;
