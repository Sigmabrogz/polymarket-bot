# Polyburg Terminal

Polyburg Terminal is a Polymarket intelligence dashboard that stitches together Gamma (market discovery), Data-API (trades/positions), and the CLOB REST & WebSocket feeds into a single workspace. The repository is organised as a pnpm workspace with a real-time backend, a Next.js frontend, and a shared type package.

## Workspace layout

- `apps/backend` – Express API + ingest worker. Polls Data-API trades, refreshes Gamma markets, keeps an in-memory cache, and exposes JSON endpoints consumed by the frontend. A websocket worker is wired up for live order-book subscriptions.
- `apps/web` – Next.js 14 (App Router) client. Uses React Query for data fetching, Tailwind for styling, and renders the dashboard (leaderboard, live tape, market pulse, wallet scanner).
- `packages/shared` – Shared TypeScript models (markets, trades, positions, config defaults) consumed by backend and frontend.

## Prerequisites

- Node.js 18.18+
- pnpm 9.x (`npm install -g pnpm@9`)

## Setup & development

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Configure environment**
   - Backend: copy `apps/backend/.env.example` → `apps/backend/.env` and adjust if you need a different bind address, poll interval, or Telegram bot credentials.
   - Frontend: copy `apps/web/.env.example` → `apps/web/.env` and point `NEXT_PUBLIC_API_BASE_URL` at your backend origin.
3. **Run the stack in dev mode**
   ```bash
   pnpm dev:backend    # starts the Express API + ingest worker on :4000
   pnpm dev:web        # starts the Next.js app on :3000
   ```
   The root script `pnpm dev` runs both in parallel.

## Backend highlights

- `IngestService` polls Data-API `/trades` every 5s (configurable) and refreshes Gamma market metadata every 10 minutes. Trades are normalised into shared models and pushed into an in-memory store (`repositories/memoryStore.ts`).
- `MarketWebsocketWorker` connects to the public Polymarket CLOB websocket and keeps subscriptions alive (payloads currently logged; hook this into the store or Redis to enrich book data).
- `telegramService` is wired for optional alerts when a trade’s notional is ≥ $5k. Provide `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ALERT_CHAT_ID` in the backend `.env` to enable.
- Express routes (`/leaderboard`, `/markets`, `/feed`, `/wallets/:addr`) serve the frontend. Swap the in-memory repository for Postgres/Redis as you scale.

## Frontend highlights

- App Router layout with a single dashboard in `app/page.tsx`.
- React Query hooks (`hooks/`) wrap the backend endpoints for leaderboards, markets, trades, and wallet lookups.
- Tailwind + lightweight UI primitives (`components/ui/`) provide a terminal-style presentation ready to extend with shadcn/ui or your design system of choice.

## Next steps / roadmap

1. Persist trades/positions in Postgres (e.g. via Prisma) instead of memory and add Timescale buckets for long-range analytics.
2. Implement proper leaderboard scoring (win-rate dilution, market breadth, realised vs unrealised PnL) once Subgraph backfill is wired in.
3. Expand websocket worker to hydrate live order books and stream deltas to the frontend via Server-Sent Events or a thin websocket layer.
4. Add background jobs for 24h/7d/30d aggregates, holders view, and Telegram alert templating.
5. Layer in authentication + API keys once you expose private endpoints.

## Testing & observability

- Add Jest/Vitest for unit coverage (shared models + services) and supertest for API contract tests.
- Instrument the ingest worker with metrics (e.g. OpenTelemetry or Prometheus) before production rollout.
- Rate-limit and backoff logic should be added ahead of heavier production use.

Happy hacking — the core scaffolding is in place so you can focus on richer analytics, storage, and UI polish.
