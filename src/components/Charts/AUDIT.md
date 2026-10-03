# Frontend audit checklist (run these in the repo)

## A. Find unwanted code (automated)
```bash
npx knip                 # unused files, exports, dependencies
npx depcheck             # unused npm packages
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
```
Likely removals, **verify with the tools above first**:
- `express`, `dotenv`: a Vite SPA doesn't need them in the frontend. Move to the backend folder.
- `@google/genai`: remove if nothing imports it (never ship API keys in a Vite bundle).
- Any old chart components replaced by `ChartWorkspace`, and unused mock files in `src/data/mock/`.
- Duplicate README content (your doc contains the whole README twice).

## B. Fix inconsistencies
1. **localStorage prefixes are mixed** (`sevenseas_*` vs `quantradar_*`). Centralise into `src/utils/storage.ts` with one prefix and a migration for the old keys.
2. **`lint` runs `tsc`, not ESLint.** Rename to `typecheck`, add a real `lint` (ESLint + `react-hooks` plugin).
3. **`App.tsx` owns everything.** The 1200 ms tick re-renders the whole tree. Split into:
   `useMarketSimulation`, `useWatchlist`, `usePriceAlerts`, `useTrading` hooks, or Zustand stores. Memoise table rows (`React.memo`).
4. **Tab state instead of routes.** No back button, no deep links. Add `react-router` (`/stock/:symbol`, `/sector/:name`, …).
5. **Docs say exit reasons `TARGET_HIT`, `SL_HIT`, `AUTO_SQUARE_OFF` exist, but only `MANUAL_EXIT` is implemented.**

## C. Missing features (priority order)
1. Auto-exit on target / stop-loss / 3:15 PM square-off during simulation ticks, writing the matching exit reason to trade history.
2. Trade History screen (filters, total P&L, win rate, export CSV).
3. Alerts panel (list, delete, re-arm, triggered history); currently alerts are only created from Stock Detail.
4. Virtual-balance checks: block trades above available margin; show margin used.
5. Error boundary + loading/empty states for every view.
6. Watchlist: drag-reorder, sector grouping, sort.
7. Settings: reset demo data, simulation speed, default chart type.
8. Real market-status banner (open/closed, IST clock) so simulated data is never mistaken for live.

## D. UI/UX polish
- Keyboard focus rings and `aria-label`s on icon-only buttons; tables need `<caption>` / scope.
- Respect `prefers-reduced-motion` for Motion animations.
- Mobile: make Stock Radar table horizontally scrollable with a sticky symbol column.
- Colour-blind safety: add ▲/▼ glyphs beside green/red numbers.
- Lazy-load heavy views (charts, Sector Radar) for faster first paint.

## E. Tests to add first
`getStockClassification`, `sortStocksByDynamicMarketState`, `formatINR`, and the new `indicators.ts` (RSI/MACD against known fixtures), using Vitest.
