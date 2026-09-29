import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error("Could not load orders");
    const orders = data ?? [];
    const phones = new Set(orders.map((o) => o.phone));
    return {
      orders,
      stats: {
        orders: orders.length,
        cakes: orders.reduce((s, o) => s + o.cake_count, 0),
        revenue: orders.reduce((s, o) => s + Number(o.total), 0),
        customers: phones.size,
      },
    };
  });

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["new", "confirmed", "baking", "ready", "delivered", "cancelled"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update");
    return { ok: true };
  });
