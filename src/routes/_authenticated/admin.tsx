import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin, getAdminData, updateOrderStatus } from "@/lib/admin.functions";
import { inr } from "@/lib/cakes-data";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Orders Dashboard — Kadiri Cake House" },
      { name: "description", content: "Bakery dashboard: orders, customers, cakes sold and revenue." },
      { property: "og:title", content: "Orders Dashboard — Kadiri Cake House" },
      { property: "og:description", content: "Bakery dashboard: orders, customers, cakes sold and revenue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const STATUSES = ["new", "confirmed", "baking", "ready", "delivered", "cancelled"] as const;

function Admin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const check = useServerFn(checkAdmin);
  const load = useServerFn(getAdminData);
  const update = useServerFn(updateOrderStatus);
  const role = useQuery({ queryKey: ["isAdmin"], queryFn: () => check() });
  const q = useQuery({ queryKey: ["admin"], queryFn: () => load(), enabled: !!role.data?.isAdmin });

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const header = (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-xl">Kadiri Cake House · Bakery</Link>
        <button onClick={signOut} className="rounded-full border px-4 py-1.5 text-sm">Sign out</button>
      </div>
    </header>
  );

  if (role.isLoading) return <div>{header}<p className="p-8 text-muted-foreground">Loading…</p></div>;
  if (!role.data?.isAdmin) return <div>{header}<p className="p-8">This account doesn't have bakery access.</p></div>;

  const s = q.data?.stats;
  return (
    <div className="min-h-screen">
      {header}
      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-cocoa p-5 text-cocoa-foreground md:grid-cols-4">
          {[["Orders", s?.orders], ["Cakes sold", s?.cakes], ["Revenue", s ? inr(s.revenue) : undefined], ["Customers", s?.customers]].map(([l, v]) => (
            <div key={l as string}><p className="font-display text-3xl">{v ?? "–"}</p><p className="text-xs opacity-70">{l}</p></div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Customer</th><th className="p-3">Cakes</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {q.data?.orders.length ? q.data.orders.map((o) => (
                <tr key={o.id} className="border-b align-top last:border-0">
                  <td className="p-3"><p className="font-medium">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.phone}{o.email ? ` · ${o.email}` : ""}</p><p className="text-xs text-muted-foreground">{o.address || "Pickup"}</p></td>
                  <td className="p-3 text-xs">{(o.items as any[]).map((i, k) => <p key={k}>{i.qty}× {i.cake} ({i.size}kg, {i.type}, {i.shape}){i.message ? ` “${i.message}”` : ""}</p>)}</td>
                  <td className="p-3 whitespace-nowrap">{o.delivery_date}</td>
                  <td className="p-3 font-medium">{inr(Number(o.total))}</td>
                  <td className="p-3">
                    <select className="field py-1" value={o.status} onChange={async (e) => { await update({ data: { id: o.id, status: e.target.value as any } }); qc.invalidateQueries({ queryKey: ["admin"] }); }}>
                      {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{q.isLoading ? "Loading…" : "No orders yet."}</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
