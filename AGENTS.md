<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Cake catalog and pricing live in src/lib/cakes-data.ts; order totals are recomputed server-side in orders.functions.ts so customers cannot change prices.
- Customer details are insert-only for the public; the storefront only reads anonymized totals via get_order_stats().
