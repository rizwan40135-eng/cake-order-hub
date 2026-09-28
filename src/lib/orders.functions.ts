import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CAKES, priceLine } from "./cakes-data";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const lineSchema = z.object({
  cakeId: z.string(),
  size: z.string(),
  type: z.string(),
  shape: z.string(),
  extras: z.array(z.string()).max(5),
  message: z.string().max(40),
  qty: z.number().int().min(1).max(20),
});

const orderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/),
  email: z.string().trim().email().max(120).or(z.literal("")),
  address: z.string().trim().max(300),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(lineSchema).min(1).max(20),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const items = data.items.map((l) => ({
      ...l,
      cake: CAKES.find((c) => c.id === l.cakeId)?.name,
      price: priceLine(l),
    }));
    const total = items.reduce((s, i) => s + i.price, 0);
    const cakeCount = items.reduce((s, i) => s + i.qty, 0);
    const { error } = await publicClient().from("orders").insert({
      customer_name: data.name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      delivery_date: data.deliveryDate,
      items,
      cake_count: cakeCount,
      total,
    });
    if (error) throw new Error("Could not place order");
    return { total, cakeCount };
  });

export type OrderStats = {
  orders: number;
  cakes: number;
  revenue: number;
  customers: number;
  recent: { name: string; cake_count: number; total: number; created_at: string }[];
};

export const getOrderStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().rpc("get_order_stats");
  if (error) throw new Error("Could not load stats");
  return data as unknown as OrderStats;
});
