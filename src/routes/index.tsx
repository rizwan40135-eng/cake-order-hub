import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import banner from "@/assets/banner.jpg";
import chocolate from "@/assets/cake-chocolate.jpg";
import redvelvet from "@/assets/cake-redvelvet.jpg";
import strawberry from "@/assets/cake-strawberry.jpg";
import vanilla from "@/assets/cake-vanilla.jpg";
import butterscotch from "@/assets/cake-butterscotch.jpg";
import blackforest from "@/assets/cake-blackforest.jpg";
import {
  CAKES, SIZES, TYPES, SHAPES, EXTRAS, priceLine, inr, type Cake, type LineInput,
} from "@/lib/cakes-data";
import { getOrderStats, placeOrder } from "@/lib/orders.functions";

const IMG: Record<string, string> = { chocolate, redvelvet, strawberry, vanilla, butterscotch, blackforest };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kadiri Cake House — Order Custom Cakes Online" },
      { name: "description", content: "Choose your cake, size, shape and message. Freshly baked and delivered." },
      { property: "og:title", content: "Kadiri Cake House — Order Custom Cakes Online" },
      { property: "og:description", content: "Choose your cake, size, shape and message. Freshly baked and delivered." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type CartLine = LineInput & { key: number };

function Index() {
  const [picking, setPicking] = useState<Cake | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [done, setDone] = useState<{ total: number; cakeCount: number } | null>(null);
  const fetchStats = useServerFn(getOrderStats);
  const stats = useQuery({ queryKey: ["stats"], queryFn: () => fetchStats() });
  const cartTotal = cart.reduce((s, l) => s + priceLine(l), 0);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-cocoa font-display text-lg text-cocoa-foreground">K</span>
            <div>
              <p className="font-display text-xl leading-none">Kadiri Cake House</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cakes only</p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#cakes" className="hover:text-foreground">Our cakes</a>
            <a href="#orders" className="hover:text-foreground">Orders</a>
          </nav>
          <button onClick={() => cart.length && setCheckout(true)} className="rounded-full bg-cocoa px-5 py-2 text-sm font-medium text-cocoa-foreground">
            Cart · {cart.reduce((s, l) => s + l.qty, 0)}
          </button>
        </div>
      </header>

      <section className="relative mx-auto mt-5 max-w-7xl overflow-hidden rounded-2xl px-0 sm:px-5">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={banner} alt="Freshly baked cakes on a wooden counter" width={1920} height={768} className="h-[320px] w-full object-cover md:h-[400px]" />
          <div className="banner-shade absolute inset-0 flex flex-col justify-center p-8 md:p-14">
            <p className="text-xs uppercase tracking-[0.25em] text-cocoa-foreground/80">Baked fresh to order</p>
            <h1 className="mt-3 max-w-lg text-4xl leading-tight text-cocoa-foreground md:text-6xl">
              Your cake, <em className="text-accent">your way.</em>
            </h1>
            <p className="mt-3 max-w-md text-cocoa-foreground/85">Pick a flavour, choose size, shape and a message — we bake and deliver.</p>
            <a href="#cakes" className="mt-6 w-fit rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Order a cake</a>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[300px_1fr]">
        <aside id="orders" className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border bg-card p-5">
            <p className="font-display text-lg">Your cart</p>
            {cart.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Pick a cake to start.</p> : (
              <>
                <ul className="mt-3 space-y-2 text-sm">
                  {cart.map((l) => (
                    <li key={l.key} className="flex items-start justify-between gap-2">
                      <span>{l.qty}× {CAKES.find((c) => c.id === l.cakeId)?.name}<br />
                        <span className="text-xs text-muted-foreground">{SIZES.find((s) => s.id === l.size)?.label} · {l.type} · {l.shape}</span></span>
                      <span className="text-right">{inr(priceLine(l))}<br />
                        <button className="text-xs text-destructive" onClick={() => setCart(cart.filter((c) => c.key !== l.key))}>Remove</button></span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{inr(cartTotal)}</span></div>
                <button onClick={() => setCheckout(true)} className="mt-3 w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground">Checkout</button>
              </>
            )}
          </div>
        </aside>

        <main id="cakes">
          <h2 className="text-3xl">Our cakes</h2>
          <p className="mt-1 text-muted-foreground">Tap a cake to customise it.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {CAKES.map((c) => (
              <button key={c.id} onClick={() => setPicking(c)} className="group rounded-2xl border bg-card p-3 text-left transition hover:-translate-y-1 hover:shadow-lg">
                <img src={IMG[c.id]} alt={c.name} loading="lazy" width={816} height={816} className="aspect-square w-full rounded-xl object-cover" />
                <div className="px-1 pt-3 pb-1">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl">{c.name}</h3>
                    <span className="font-semibold text-primary">from {inr(c.base)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      <footer className="border-t py-8 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Kadiri Cake House · Baked with love</footer>

      {picking && <Customize cake={picking} onClose={() => setPicking(null)} onAdd={(l) => { setCart([...cart, { ...l, key: Date.now() }]); setPicking(null); }} />}
      {checkout && <Checkout cart={cart} total={cartTotal} onClose={() => setCheckout(false)} onDone={(r) => { setCart([]); setCheckout(false); setDone(r); }} />}
      {done && (
        <Modal onClose={() => setDone(null)}>
          <h3 className="text-2xl">Order placed!</h3>
          <p className="mt-2 text-muted-foreground">{done.cakeCount} cake{done.cakeCount > 1 ? "s" : ""} · {inr(done.total)}. The bakery will call you to confirm.</p>
          <button onClick={() => setDone(null)} className="mt-5 w-full rounded-full bg-primary py-2.5 text-primary-foreground">Done</button>
        </Modal>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div><p className="font-display text-2xl">{value}</p><p className="text-xs opacity-70">{label}</p></div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Chips<T extends { id: string; label: string }>({ opts, value, onPick }: { opts: T[]; value: string | string[]; onPick: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <button key={o.id} type="button" className="chip" data-on={Array.isArray(value) ? value.includes(o.id) : value === o.id} onClick={() => onPick(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

function Customize({ cake, onClose, onAdd }: { cake: Cake; onClose: () => void; onAdd: (l: LineInput) => void }) {
  const [l, setL] = useState<LineInput>({ cakeId: cake.id, size: "1", type: "egg", shape: "round", extras: [], message: "", qty: 1 });
  const set = (p: Partial<LineInput>) => setL({ ...l, ...p });
  return (
    <Modal onClose={onClose}>
      <div className="flex gap-4">
        <img src={IMG[cake.id]} alt={cake.name} className="size-20 rounded-xl object-cover" />
        <div><h3 className="text-2xl">{cake.name}</h3><p className="text-sm text-muted-foreground">{cake.desc}</p></div>
      </div>
      <div className="mt-5 space-y-4 text-sm">
        <div><p className="mb-2 font-medium">Size</p><Chips opts={SIZES} value={l.size} onPick={(size) => set({ size })} /></div>
        <div><p className="mb-2 font-medium">Type</p><Chips opts={TYPES} value={l.type} onPick={(type) => set({ type })} /></div>
        <div><p className="mb-2 font-medium">Shape</p><Chips opts={SHAPES} value={l.shape} onPick={(shape) => set({ shape })} /></div>
        <div><p className="mb-2 font-medium">Extras</p><Chips opts={EXTRAS} value={l.extras} onPick={(id) => set({ extras: l.extras.includes(id) ? l.extras.filter((x) => x !== id) : [...l.extras, id] })} /></div>
        <div><p className="mb-2 font-medium">Message on cake</p><input className="field" maxLength={40} placeholder="Happy Birthday Aisha!" value={l.message} onChange={(e) => set({ message: e.target.value })} /></div>
        <div className="flex items-center gap-3"><p className="font-medium">Quantity</p>
          <button className="chip" onClick={() => set({ qty: Math.max(1, l.qty - 1) })}>−</button><span>{l.qty}</span>
          <button className="chip" onClick={() => set({ qty: Math.min(20, l.qty + 1) })}>+</button>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <p className="font-display text-3xl">{inr(priceLine(l))}</p>
        <button onClick={() => onAdd(l)} className="rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground">Add to cart</button>
      </div>
    </Modal>
  );
}

function Checkout({ cart, total, onClose, onDone }: { cart: CartLine[]; total: number; onClose: () => void; onDone: (r: { total: number; cakeCount: number }) => void }) {
  const qc = useQueryClient();
  const submit = useServerFn(placeOrder);
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", deliveryDate: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await submit({ data: { ...f, items: cart.map(({ key: _k, ...l }) => l) } });
      qc.invalidateQueries({ queryKey: ["stats"] });
      onDone(r);
    } catch {
      setErr("Please check your details (name, valid phone, date) and try again.");
    } finally { setBusy(false); }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="text-2xl">Your details</h3>
      <form onSubmit={go} className="mt-4 space-y-3 text-sm">
        <input required className="field" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input required className="field" placeholder="Phone number" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className="field" type="email" placeholder="Email (optional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <textarea className="field" rows={2} placeholder="Delivery address (leave empty for pickup)" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        <label className="block"><span className="mb-1 block font-medium">Delivery / pickup date</span>
          <input required type="date" min={today} className="field" value={f.deliveryDate} onChange={(e) => setF({ ...f, deliveryDate: e.target.value })} /></label>
        {err && <p className="text-destructive">{err}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground disabled:opacity-60">
          {busy ? "Placing order…" : `Place order · ${inr(total)}`}
        </button>
      </form>
    </Modal>
  );
}
