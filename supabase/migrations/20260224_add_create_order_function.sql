-- Create RPC function to handle order creation with items (atomic transaction)
DROP FUNCTION IF EXISTS public.create_order_with_items(UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, UUID, JSONB, JSONB);

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_restaurant_id UUID,
  p_location_id UUID,
  p_table_id UUID,
  p_notes TEXT,
  p_currency TEXT,
  p_total_net_cts INTEGER,
  p_taxes_cts INTEGER,
  p_total_gross_cts INTEGER,
  p_changed_by UUID,
  p_order_items JSONB,
  p_stock_adjustments JSONB
)
RETURNS TABLE(order_id UUID, success BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_item_id UUID;
  v_name TEXT;
  v_qty INTEGER;
  v_unit_price_cts INTEGER;
  v_total_price_cts INTEGER;
BEGIN
  -- Insert the order
  INSERT INTO public.orders (
    table_id,
    status,
    currency,
    total_net_cts,
    taxes_cts,
    total_gross_cts,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_table_id,
    'PENDING',
    p_currency,
    p_total_net_cts,
    p_taxes_cts,
    p_total_gross_cts,
    p_notes,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- Insert order items from JSON array
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    v_item_id := (v_item->>'item_id')::UUID;
    v_name := v_item->>'name';
    v_qty := (v_item->>'qty')::INTEGER;
    v_unit_price_cts := (v_item->>'unit_price_cts')::INTEGER;
    v_total_price_cts := (v_item->>'total_price_cts')::INTEGER;

    INSERT INTO public.order_items (
      order_id,
      item_id,
      name,
      qty,
      unit_price_cts,
      total_price_cts,
      created_at
    ) VALUES (
      v_order_id,
      v_item_id,
      v_name,
      v_qty,
      v_unit_price_cts,
      v_total_price_cts,
      NOW()
    );
  END LOOP;

  -- Return success
  RETURN QUERY SELECT v_order_id, TRUE;
END;
$$;

-- Grant permissions to execute the function
GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  UUID, UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, INTEGER, UUID, JSONB, JSONB
) TO authenticated, anon;
