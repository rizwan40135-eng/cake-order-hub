CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  delivery_date date,
  items jsonb NOT NULL,
  cake_count int NOT NULL CHECK (cake_count > 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (status = 'new');

CREATE OR REPLACE FUNCTION public.get_order_stats()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'orders', (SELECT count(*) FROM orders),
    'cakes', (SELECT coalesce(sum(cake_count),0) FROM orders),
    'revenue', (SELECT coalesce(sum(total),0) FROM orders),
    'customers', (SELECT count(DISTINCT phone) FROM orders),
    'recent', (SELECT coalesce(json_agg(r),'[]'::json) FROM (
      SELECT split_part(customer_name,' ',1) AS name, cake_count, total, created_at
      FROM orders ORDER BY created_at DESC LIMIT 6) r)
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_order_stats() TO anon, authenticated;