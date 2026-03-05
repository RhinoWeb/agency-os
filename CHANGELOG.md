# Changelog

All notable changes to Agency OS are documented here.
Format: [Semantic Versioning](https://semver.org/) — Added / Changed / Fixed / Removed

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
