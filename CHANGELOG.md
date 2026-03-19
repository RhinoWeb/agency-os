# Changelog

All notable changes to Agency OS are documented here.
Format: [Semantic Versioning](https://semver.org/) — Added / Changed / Fixed / Removed

---

## [2.0.0] — 2026-03-19 💾 SQLite Persistence — "Actually Usable"

### Added
- **SQLite database** — All entity data now persists in `agency.db` via `better-sqlite3` with WAL mode. No more localStorage-only storage. Data survives browser clears, restarts, and updates.
- **`db.js` database layer** — Full schema with 13 tables (agents, tasks, clients, leads, campaigns, workflows, CRM contacts, CRM companies, CRM deals, email templates, schedule, pages, notifications), JSON field serialization, and migration support.
- **40+ REST API endpoints** — Complete CRUD for every entity (`GET/POST/PUT/DELETE /api/{entity}`), plus special endpoints for task column moves, dashboard stats aggregation, and settings key-value store.
- **`seed-data.js`** — Server-side seed data for first-run database initialization. Database auto-seeds on first startup with all demo data.
- **`useServerState` hook** — Drop-in replacement for `usePersistedState` that syncs React state to the server API with debounced writes. Supports lists, objects (task columns), and key-value settings.
- **`useEntity` hook** — Standalone server-backed entity hook with optimistic updates and error rollback for future use.
- **Dashboard stats endpoint** — `GET /api/dashboard/stats` returns aggregated MRR, active agents, tasks due today, hot leads, and at-risk clients in a single query.
- **Backup & export system** — `POST /api/data/backup` copies `agency.db` to timestamped backup file. `GET /api/data/export` returns full JSON dump. `POST /api/data/import` restores from JSON (with auto-backup before import).
- **Webhook persistence** — `webhook_events` table replaces in-memory arrays for Instantly replies and Cal.com bookings. Server restarts no longer lose pending webhook data.
- **AI messages table** — Chat history persists in SQLite instead of localStorage.
- **Settings key-value store** — All settings, profile, pipeline config, briefings, and reports stored server-side.

### Changed
- **App.jsx** — Replaced all 25 `usePersistedState` calls with `useServerState` for server-backed entities. Only UI preferences (sidebar collapsed) remain in localStorage.
- **server.js** — Added `db.js` import, entity CRUD routes, settings endpoints, backup/export/import routes, and database seeding on startup.
- **Data architecture** — Server is now the source of truth. Frontend uses optimistic updates with debounced sync-back. All entity mutations persist to SQLite within 500ms.

### Fixed
- **Node v24 syntax error** — Fixed `??`/`||` operator precedence issue in Apify lead normalization (line 1026).

### Technical
- `better-sqlite3` with WAL mode for concurrent read performance
- `INSERT OR REPLACE` for upsert semantics across all entity writes
- JSON fields (arrays, nested objects) automatically serialized/deserialized
- Generic `entityRoutes()` factory generates 5 CRUD endpoints per entity
- Task ordering maintained via `col` + `position` columns with shift-on-insert
- Debounced list sync diffs against server state (create/update/delete only changed items)
- Database auto-closes on process exit

---

## [1.0.5] — 2026-03-12 ◇ Obsidian UI Redesign

### Added
- **6 color themes** — Obsidian (default), Midnight, Forest, Sunset, Arctic, Rose with full CSS variable switching
- **Command palette** — Ctrl+K with 25+ actions, fuzzy search, dynamic recent tabs
- **Empty states** — Reusable EmptyState component across 8 views with icons and CTAs
- **Agent Fleet CRUD** — Create, edit, delete agents with task assignment
- **Branded confirm dialogs** — Custom ConfirmModal replaces window.confirm()
- **Notification utility** — `createNotif()` helper replaces repeated notification patterns

### Changed
- Performance: Memoized `shared` object, fixed stale closures in 4 polling effects
- Error handling: Replaced 11 silent `.catch(() => {})` with user-facing notifications
- Settings: Replaced hardcoded colors with theme tokens

---

## [1.0.2] — 2026-03-06 🔑 Tool Vault

### Added
- **Tool Vault** — New Settings section (🔑) with 45 marketing tool API keys across 6 color-coded categories: AI Models (Gemini, Grok, Mistral, Perplexity), Image & Video (Stability AI, Runway, HeyGen, Synthesia, Leonardo, Ideogram, Kling, Luma, Pika, Descript, Higgsfield), Voice & Audio (ElevenLabs, Murf, PlayHT, Bland AI, Vapi, Retell, Deepgram, AssemblyAI, Cartesia), Content & SEO (Jasper, Copy.ai, Surfer SEO, Semrush, AdCreative.ai, Taplio), Outreach (Instantly, Smartlead, Clay, Phantom Buster, Apollo, Million Verifier, Refonic), Automation (Make, Zapier, Voiceflow, ManyChat, HubSpot, Triple Whale, Facebook Ads API, MCPHub)
- **Search & category filter** in Tool Vault — instant filtering by tool name or category with tab pills
- **Show/hide + copy-to-clipboard** on every tool key row
- **Live configured count badge** on the Tool Vault nav item (e.g. "5")
- **"✓ set" indicator** per row when a key is entered
- **"Get key →" link** on every tool pointing to its API/dashboard page
- Wiki → Settings section updated with full Tool Vault documentation and tool table
- PRODUCT.md Settings module description updated

### Technical
- `toolKeys: {}` added to `DEFAULT_SETTINGS` in `theme.js`
- `setToolKey()` function in Settings.jsx merges keys into `settings.toolKeys`
- `ToolKeyRow` compact component — show/hide password input, clipboard copy, category color left-border
- `TOOL_CATS` and `TOOL_VAULT` arrays define all 45 tools with id, category, icon, label, placeholder, docsUrl
- Tool Vault rendered via IIFE pattern inside the `section === 'tools'` block
- Fully backward-compatible — existing users without `toolKeys` in localStorage handled via `?? {}`

---

## [1.0.1] — 2026-03-06 🎯 Creator & Outreach Layer

### Added
- **AI Brain — Outreach & Growth category** — 10 new prompts: cold DM scripts, creator beta invite, re-engagement, referral ask, onboarding sequence, commission boost announcement, event invite, week-one activation nudge, KOL campaign funnel plan, creator campaign report. Library now 60 prompts across 6 categories.
- **Creator/KOL client sub-type** — New client type with platform, niche, followers, commission rate, referral link, onboarding stage, first sale date, and revenue generated fields. Shown as a dedicated panel in the client detail view.
- **Client type badges** — All clients now display their type (Brand, SaaS, Creator/KOL, Retreat) as color-coded badges in the client list and detail view.
- **Outreach funnel progress bar** — Pipeline clients now show a 5-stage funnel indicator (Outreach → Replied → Call Booked → Proposal → Closed) directly on their client card.
- **3 pre-built workflow templates** — "Influencer Launch Campaign", "Cold Outreach Sprint", and "Content Campaign Launch" now appear in the Workflows tab under a dedicated Templates section with a "Use Template" action.
- **PRODUCT.md roadmap** — v1.1 roadmap updated to include creator client type, outreach pipeline view, campaign KPI widget, and workflow templates.

---

## [1.0.0] — 2026-03-05 🚀 Initial Release

### Added
- **Command Dashboard** — Real-time MRR, agent status, tasks due today, quick actions, revenue and task charts
- **Task Board** — Drag-and-drop Kanban with 4 columns, priorities, due dates, subtasks, time tracking, task timer
- **Agent Fleet** — AI agent management with status toggles, efficiency scores, queue depth, uptime tracking
- **Workflow Automation** — Visual workflow builder with trigger/step/action chains and success rate tracking
- **Analytics** — MRR trend charts, task completion rates, agent performance, client health breakdown
- **Client Manager** — Full CRM with health scores, MRR, contacts, pipeline stage, notes
- **Schedule** — Calendar view with events, meetings, agent run schedules
- **Knowledge Base** — Internal docs with starred pages, search, inline editing, type badges
- **AI Brain** — Full-context AI chat with 50 pre-written agency prompts across 5 categories (Growth, Operations, Daily, Marketing, Finance)
- **Web Browser** — AI-directed research tab: Manual URL fetch + AI Browse mode with step-by-step live display
- **Settings** — Multi-provider AI key management (MiniMax, OpenAI, Groq, Anthropic), 6 color themes, font size, agency prefs, notification toggles, data management
- **Profile** — Avatar picker (30 options), display name, title, agency name, email, bio, live agency stats
- **Wiki** — Built-in usage documentation with search and navigation
- **In-App Updates** — Version checker, changelog viewer, one-click update via `git pull`

### Technical
- React 18 + Vite 5 frontend with hot module replacement
- Express.js API proxy for AI providers (SSE streaming)
- Multi-provider AI: MiniMax, OpenAI, Groq (all OpenAI-compatible) + Anthropic (SDK)
- `usePersistedState` hook — all data persists in localStorage
- CSS custom properties for full theme system (no Tailwind dependency)
- Semantic HTML + full ARIA accessibility throughout
- Command palette (Ctrl+K) with keyboard navigation
- Web browsing via Node.js built-in `fetch` — no Chromium required
- Auto-update system: GitHub Releases API polling + `git pull` apply

### Providers Supported
- MiniMax (MiniMax-Text-01) — default
- OpenAI (gpt-4o-mini)
- Groq (llama-3.3-70b-versatile)
- Anthropic (claude-haiku-4-5-20251001)

---

## Upcoming

### [1.1.0] — Planned Q2 2026
- Multi-user support over local network
- CSV import/export
- Client portal (read-only share view)
- Improved web browser (JS-rendered page support)
- Auto-restart after update (no manual Ctrl+C needed)

### [1.2.0] — Planned Q3 2026
- Optional cloud backup (S3/R2/Dropbox)
- Cross-device sync
- Encrypted API key vault

### [2.0.0] — Planned Q4 2026
- Electron desktop packaging (no Node.js install required)
- Native auto-updater
- System tray integration
- Mobile companion app

---

*For the full product vision, see [PRODUCT.md](./PRODUCT.md)*
