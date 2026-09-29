import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Bakery Login — Kadiri Cake House" },
      { name: "description", content: "Staff login for Kadiri Cake House order management." },
      { property: "og:title", content: "Bakery Login — Kadiri Cake House" },
      { property: "og:description", content: "Staff login for Kadiri Cake House order management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message); else nav({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  }

  return (
    <div className="grid min-h-screen place-items-center p-5">
      <form onSubmit={go} className="w-full max-w-sm space-y-3 rounded-2xl border bg-card p-6">
        <p className="font-display text-2xl">Bakery login</p>
        <p className="text-sm text-muted-foreground">For Kadiri Cake House staff only.</p>
        <input required type="email" className="field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" minLength={6} className="field" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground disabled:opacity-60">
          {mode === "in" ? "Sign in" : "Create account"}
        </button>
        <button type="button" className="w-full text-sm text-muted-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "First time? Create account" : "Have an account? Sign in"}
        </button>
        <Link to="/" className="block text-center text-xs text-muted-foreground">← Back to shop</Link>
      </form>
    </div>
  );
}
