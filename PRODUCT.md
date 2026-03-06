# Agency OS — Product Launch Document (PLD)

> **Version:** 1.0.0 | **Status:** Active Development | **Last Updated:** 2026-03-05

---

## 1. Product Overview

**Agency OS** is a locally-installed, AI-powered operating system for digital marketing agencies. It runs entirely on your machine — no cloud fees, no subscriptions, no third-party data sharing — giving agency owners a single command center for every part of their business.

### Elevator Pitch
> "Run your entire agency from one window. AI-powered, fully offline, zero monthly fees."

### Who It's For
- Solo agency founders running $10k–$100k MRR operations
- Small agency teams (1–10 people) managing multiple clients
- Freelancers transitioning into agency ownership
- Anyone running AI-automated delivery workflows

---

## 2. Core Modules

| Module | Description | Status |
|---|---|---|
| 🏠 Command Dashboard | Real-time MRR, agent status, tasks due today, client health | ✅ Live |
| ▦ Task Board | Drag-and-drop Kanban with priorities, timers, subtasks | ✅ Live |
| ⬡ Agent Fleet | Manage and monitor AI agent status, efficiency, queues | ✅ Live |
| ⚡ Workflow Automation | Visual workflow builder with trigger → step → action chains | ✅ Live |
| 📊 Analytics | MRR trend, task completion, revenue charts (Recharts) | ✅ Live |
| 🏢 Clients | CRM with health scores, MRR, contacts, pipeline tracking | ✅ Live |
| ◷ Schedule | Calendar view of meetings, agent runs, and deliverables | ✅ Live |
| ◎ Knowledge Base | Internal docs, SOPs, templates — searchable with star/edit | ✅ Live |
| 🧠 AI Brain | 60-prompt library + full-context AI chat (multi-provider) | ✅ Live |
| 🌐 Web Browser | AI-directed research browser with reader view + analysis | ✅ Live |
| ⚙ Settings | AI keys, Tool Vault (45 tools, 6 categories), themes, agency prefs | ✅ Live |
| 👤 Profile | Avatar picker, agency stats, bio, identity card | ✅ Live |
| 📖 Wiki | Built-in knowledge base for how to use Agency OS | ✅ Live |
| 🔄 Updates | In-app version checker and one-click updater | ✅ Live |

---

## 3. Technical Architecture

### Stack
```
Frontend:  React 18 + Vite 5
Backend:   Node.js 18+ + Express 4
AI:        Multi-provider SSE streaming (MiniMax, OpenAI, Groq, Anthropic)
Storage:   Browser localStorage (no database required)
Hosting:   Local machine — localhost:5173 (frontend) + localhost:3001 (API)
```

### Key Design Decisions
- **localStorage-first**: All user data (tasks, clients, agents, settings) persists in the browser. No backend database = no data migration headaches between updates.
- **Proxy architecture**: AI API keys never leave the local machine — they're sent through the local Express server, not directly from the browser.
- **SSE streaming**: All AI responses stream in real time via Server-Sent Events rather than waiting for complete responses.
- **Zero external dependencies for web browsing**: The browser tab uses Node's built-in `fetch` to scrape and parse web pages — no Chromium binary required.

### File Structure
```
agency-os/
├── server.js              # Express API proxy
├── src/
│   ├── App.jsx            # Root state + routing
│   ├── theme.js           # Colors, themes, defaults
│   ├── data.js            # Seed data for all modules
│   ├── hooks/
│   │   └── usePersistedState.js
│   ├── components/
│   │   ├── layout/        # Nav, Notifications, CommandPalette, TaskModal
│   │   └── ui/            # Dot, Badge, ProgressBar, ChartTooltip
│   └── views/             # One file per tab/module
└── package.json
```

---

## 4. AI Integration

### Supported Providers
| Provider | Default Model | Best For |
|---|---|---|
| MiniMax | MiniMax-Text-01 | Fast, cost-effective |
| OpenAI | gpt-4o-mini | Reliable, tool-use ready |
| Groq | llama-3.3-70b-versatile | Ultra-fast inference |
| Anthropic | claude-haiku-4-5 | Reasoning, long context |

### AI Features
- **AI Brain**: Full agency context injected into every message (tasks, agents, clients, workflows, financials)
- **60 Prompt Library**: Pre-written prompts across Growth, Operations, Daily, Marketing, Finance, Outreach
- **AI Browse**: AI decides what URL to visit → fetches page → streams analysis
- **Provider switching**: Change AI provider in Settings without restarting

---

## 5. Version & Update System

### Versioning
Agency OS follows **Semantic Versioning**: `MAJOR.MINOR.PATCH`
- `PATCH` (1.0.x): Bug fixes, minor UI tweaks
- `MINOR` (1.x.0): New features, non-breaking additions
- `MAJOR` (x.0.0): Breaking changes, significant architecture shifts

### Update Flow
1. Server checks GitHub Releases API on startup + every 60 minutes
2. Badge appears in nav when update available
3. User visits Updates page to see changelog
4. One-click update: server runs `git pull && npm install`
5. User restarts the app to apply

### Data Safety During Updates
All data lives in `localStorage` in the browser. Updates to the codebase cannot overwrite or delete user data. The only way to lose data is clearing browser storage.

---

## 6. Roadmap

### v1.1.0 — Creator & Campaign Layer (Q2 2026)
- [ ] Creator/KOL client sub-type — commission rate, platform, niche, referral link, onboarding status
- [ ] Outreach funnel pipeline — configurable stages (Outreach → Reply → Call → Onboarded → First Sale) with weekly targets and conversion rates
- [ ] Campaign KPI dashboard widget — funnel metrics pulled from client pipeline data
- [ ] Pre-built workflow templates — "Influencer Launch Campaign", "Content Campaign Launch", "Cold Outreach Sprint"
- [ ] Multi-user support (shared state via local network)
- [ ] Client portal view (read-only share link)
- [ ] CSV import/export for clients and tasks

### v1.2.0 — Cloud Sync (Q3 2026)
- [ ] Optional cloud backup to user-owned storage (S3/R2/Dropbox)
- [ ] Cross-device sync
- [ ] Encrypted API key vault

### v2.0.0 — Electron App (Q4 2026)
- [ ] Package as desktop app (no Node.js install required)
- [ ] Native notifications
- [ ] Auto-updater (electron-updater)
- [ ] System tray integration

### Backlog
- [ ] Zapier/Make webhook integrations
- [ ] Email inbox integration
- [ ] Real AI agent execution (not just simulation)
- [ ] Mobile companion app
- [ ] White-label mode for resellers

---

## 7. Known Limitations (v1.0.0)

| Limitation | Workaround | Fix in |
|---|---|---|
| Data is browser-local only | Export JSON from Settings → Data | v1.2.0 |
| Web browser can't render JS-heavy SPAs | Use Manual mode + paste content to AI | v1.1.0 |
| No real multi-user | One user per browser profile | v1.1.0 |
| Update requires manual app restart | Use `start.sh` / `start.bat` launcher | v1.1.0 |
| Agent fleet is simulated, not real | Integrate real automation tools | v2.0.0 |

---

## 8. Installation & Setup

### Requirements
- Node.js 18 or higher
- Git (for updates)
- An API key for at least one AI provider

### Quick Start
```bash
git clone https://github.com/RhinoWeb/agency-os
cd agency-os
npm install
cp .env.example .env
# Add your API key to .env
npm run dev
# Open http://localhost:5173
```

### Recommended: Use the Launcher
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```
The launcher checks for updates before starting and handles restarts automatically.

---

## 9. Contributing

- Fork → Branch → PR against `main`
- Follow the existing component pattern (one view per file)
- Update `CHANGELOG.md` with your changes
- Bump the version in `package.json`

---

## 10. License

MIT — free to use, modify, and distribute.

---

*This document is updated with every release. For detailed release notes, see [CHANGELOG.md](./CHANGELOG.md).*
