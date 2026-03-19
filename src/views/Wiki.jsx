import { useState } from 'react';

const SECTIONS = [
  { id: 'start',    label: 'Getting Started',     icon: '🚀' },
  { id: 'dash',     label: 'Dashboard',            icon: '◈' },
  { id: 'tasks',    label: 'Task Board',           icon: '▦' },
  { id: 'agents',   label: 'Agent Fleet',          icon: '⬡' },
  { id: 'ai',       label: 'AI Brain',             icon: '🧠' },
  { id: 'clients',  label: 'Clients',              icon: '🏢' },
  { id: 'workflows',label: 'Workflows',            icon: '⚡' },
  { id: 'kb',       label: 'Knowledge Base',       icon: '◎' },
  { id: 'settings', label: 'Settings',             icon: '⚙' },
  { id: 'leads',    label: 'Lead Finder',          icon: '◉' },
  { id: 'campaigns',label: 'Campaigns',            icon: '📨' },
  { id: 'leadgen', label: 'Lead Gen Automation',   icon: '🔥' },
  { id: 'shortcuts',label: 'Keyboard Shortcuts',   icon: '⌨' },
  { id: 'faq',      label: 'FAQ & Troubleshooting',icon: '❓' },
];

const CONTENT = {
  start: {
    title: 'Getting Started',
    body: [
      { type: 'h2', text: 'Installation' },
      { type: 'steps', items: [
        'Install Node.js 18+ from nodejs.org',
        'Clone the repo: git clone https://github.com/RhinoWeb/agency-os',
        'Enter the directory: cd agency-os',
        'Install dependencies: npm install',
        'Copy the env file: cp .env.example .env',
        'Add your AI API key to the .env file',
        'Start the app: npm run dev (or double-click start.bat on Windows)',
        'Open http://localhost:5173 in your browser',
      ]},
      { type: 'h2', text: 'Recommended: Use the Launcher' },
      { type: 'p', text: 'Instead of npm run dev, use the launcher script. It checks for updates automatically before starting.' },
      { type: 'code', text: 'Windows: double-click start.bat\nMac/Linux: ./start.sh' },
      { type: 'h2', text: 'Getting Your First AI Key' },
      { type: 'p', text: 'Agency OS works with four AI providers. You only need one to get started:' },
      { type: 'table', headers: ['Provider', 'Speed', 'Cost', 'Get Key At'], rows: [
        ['MiniMax', '⚡ Fast', '💚 Free tier', 'minimax.io'],
        ['Groq', '⚡⚡ Fastest', '💚 Free tier', 'console.groq.com'],
        ['OpenAI', '✅ Reliable', '💛 Pay-per-use', 'platform.openai.com'],
        ['Anthropic', '🧠 Best reasoning', '💛 Pay-per-use', 'console.anthropic.com'],
      ]},
      { type: 'p', text: 'Once you have a key: Settings → AI Integrations → paste the key → Test → Save.' },
    ],
  },
  dash: {
    title: 'Command Dashboard',
    body: [
      { type: 'p', text: 'The dashboard is your agency\'s real-time control center. It loads when you open Agency OS.' },
      { type: 'h2', text: 'What You See' },
      { type: 'list', items: [
        'MRR (Monthly Recurring Revenue) — sum of all active client contracts',
        'Active Agents — how many AI agents are currently running',
        'Tasks due today — pulled from your Task Board',
        'Client health average — average health score across active clients',
        'Revenue trend chart — last 6 months MRR (Recharts)',
        'Task completion chart — weekly progress',
        'Live agent activity feed — recent agent actions',
        'Quick action buttons — New Task, New Client, Start Timer',
      ]},
      { type: 'h2', text: 'Live Clock & Timer' },
      { type: 'p', text: 'The live clock appears in the top nav. Click the ⏱ timer button on any task to start tracking time against it. The timer runs in the nav bar and auto-saves minutes to the task when stopped.' },
    ],
  },
  tasks: {
    title: 'Task Board',
    body: [
      { type: 'p', text: 'A drag-and-drop Kanban board with 4 columns: Backlog, In Progress, Review, Done.' },
      { type: 'h2', text: 'Adding Tasks' },
      { type: 'steps', items: [
        'Click the + New Task button in the top right',
        'Fill in: Title, Priority (Low/Medium/High), Column, Agent, Notes',
        'Click Add Task — it appears immediately in the selected column',
      ]},
      { type: 'h2', text: 'Moving Tasks' },
      { type: 'list', items: [
        'Drag a task card to a different column to move it',
        'Or use the column dropdown on the task card',
      ]},
      { type: 'h2', text: 'Task Features' },
      { type: 'list', items: [
        'Priority badge — color coded: red (high), yellow (medium), grey (low)',
        'Subtasks — check off steps within a task',
        'Time tracking — click ⏱ to start a session timer',
        'Notes — free-text notes attached to each task',
        'Agent assignment — assign any task to an AI agent',
      ]},
      { type: 'h2', text: 'Priorities' },
      { type: 'p', text: 'High priority tasks appear at the top of columns and are flagged in the Dashboard. The AI Brain also highlights high-priority tasks in its context.' },
    ],
  },
  agents: {
    title: 'Agent Fleet',
    body: [
      { type: 'p', text: 'Your AI agent workforce. Each agent represents a specialized function in your agency.' },
      { type: 'h2', text: 'Agent Status' },
      { type: 'list', items: [
        'Active (green) — agent is running and processing tasks',
        'Paused (yellow) — agent is halted, queue preserved',
        'Error (red) — agent encountered an issue and needs attention',
      ]},
      { type: 'h2', text: 'Agent Metrics' },
      { type: 'list', items: [
        'Efficiency % — how well the agent is performing relative to its target',
        'Queue — number of tasks waiting for this agent',
        'Uptime — how long the agent has been running',
        'Tasks completed — total output since last reset',
      ]},
      { type: 'h2', text: 'Managing Agents' },
      { type: 'p', text: 'Click the status toggle on any agent card to pause/resume it. Paused agents keep their queue — tasks resume when you re-activate.' },
      { type: 'h2', text: 'Default Agents' },
      { type: 'table', headers: ['Agent', 'Specialty'], rows: [
        ['Content Writer', 'Blog posts, social copy, email sequences'],
        ['SEO Analyst', 'Keywords, audits, rankings tracking'],
        ['Social Manager', 'Scheduling, engagement, reporting'],
        ['Data Analyst', 'Metrics, dashboards, client reports'],
        ['Email Marketer', 'Campaigns, sequences, A/B testing'],
        ['Research Agent', 'Competitor analysis, market research'],
      ]},
    ],
  },
  ai: {
    title: 'AI Brain',
    body: [
      { type: 'p', text: 'Your full-context agency AI assistant. Every message includes a complete snapshot of your tasks, agents, clients, and financials — so the AI always knows your situation.' },
      { type: 'h2', text: 'The 50 Prompt Library' },
      { type: 'p', text: 'Click "50 Prompts" to open the library. Prompts are organized into 5 categories:' },
      { type: 'list', items: [
        '🚀 Growth — Client upsells, proposals, cold outreach, referrals',
        '⚙️ Operations — Bottlenecks, SOPs, hiring, agent audits',
        '📅 Daily — Schedule design, deep work, stop-doing list',
        '📣 Marketing — LinkedIn content, newsletters, case studies',
        '💰 Finance — Revenue forecasting, pricing, cost analysis',
      ]},
      { type: 'h2', text: 'Using the AI Effectively' },
      { type: 'steps', items: [
        'Select a provider in Settings → AI Integrations',
        'Click a prompt card to instantly send that question to the AI',
        'Or type your own question in the input box',
        'Use the Shuffle button for a random prompt',
        'Search prompts by keyword across all 50',
      ]},
      { type: 'h2', text: 'Switching Providers' },
      { type: 'p', text: 'Go to Settings → AI Integrations → select Active Provider. The AI Brain shows the current provider in the subtitle and on each message.' },
    ],
  },
  clients: {
    title: 'Client Manager',
    body: [
      { type: 'p', text: 'Your agency CRM. Track active clients, pipeline prospects, health scores, and MRR.' },
      { type: 'h2', text: 'Client Statuses' },
      { type: 'list', items: [
        'Active — paying client, counts toward MRR',
        'Pipeline — prospect being worked, shows in pipeline section',
        'Churned — former client, excluded from MRR',
      ]},
      { type: 'h2', text: 'Health Scores' },
      { type: 'p', text: 'Health scores (0–100%) indicate client relationship quality. Color coding:' },
      { type: 'list', items: [
        '85%+ — Green: healthy, growing relationship',
        '70–84% — Yellow: attention needed',
        'Below 70% — Red: at churn risk, take action',
      ]},
      { type: 'p', text: 'The AI Brain is aware of all health scores and will surface at-risk clients in its responses.' },
    ],
  },
  workflows: {
    title: 'Workflow Automation',
    body: [
      { type: 'p', text: 'Build automated multi-step workflows that run on schedules or triggers.' },
      { type: 'h2', text: 'Workflow Structure' },
      { type: 'list', items: [
        'Trigger — what starts the workflow (schedule, event, manual)',
        'Steps — sequence of actions to execute',
        'Agents — which agents handle which steps',
      ]},
      { type: 'h2', text: 'Workflow Statuses' },
      { type: 'list', items: [
        'Active — running on schedule',
        'Paused — halted, preserves configuration',
        'Error — needs attention',
      ]},
      { type: 'h2', text: 'Key Metrics' },
      { type: 'list', items: [
        'Success Rate % — percentage of runs that completed without error',
        'Total Runs — cumulative execution count',
        'Last Run — most recent execution time',
      ]},
    ],
  },
  kb: {
    title: 'Knowledge Base',
    body: [
      { type: 'p', text: 'Your internal documentation system. Store SOPs, templates, research, client notes — anything your team needs.' },
      { type: 'h2', text: 'Using the Knowledge Base' },
      { type: 'steps', items: [
        'Click Docs in the navigation bar',
        'Search for any page using the search bar (searches title + content)',
        'Star important pages to pin them to the top',
        'Click any page to open it in full view',
        'Click ✏️ Edit to modify the content inline',
        'Click 💾 Save to save your changes',
      ]},
      { type: 'h2', text: 'Page Types' },
      { type: 'list', items: [
        'database — structured data, client info, contact lists',
        'calendar — schedule-related content, event notes',
      ]},
      { type: 'h2', text: 'Tips' },
      { type: 'list', items: [
        'Use the knowledge base to store your agency SOPs',
        'Paste client meeting notes here after each call',
        'Store your best-performing prompts and scripts here',
        'All content is searchable — full text search, not just titles',
      ]},
    ],
  },
  settings: {
    title: 'Settings',
    body: [
      { type: 'p', text: 'Access Settings by clicking the ⚙ gear icon in the top-right corner of the nav bar. Six sections: AI Integrations, Tool Vault, Appearance, Agency, Notifications, and Data & Privacy.' },
      { type: 'h2', text: 'AI Integrations' },
      { type: 'p', text: 'Configures the four AI providers that power the AI Brain chat. These are the only providers with live streaming support.' },
      { type: 'steps', items: [
        'Select your Active Provider (used for all AI Brain responses)',
        'Paste your API key for any provider',
        'Click Test to verify the key works',
        'Optionally override the default model name',
        'Click Save Changes at the top',
      ]},
      { type: 'h2', text: 'Tool Vault 🔑' },
      { type: 'p', text: 'A secure local key store for 45 marketing tools across 6 categories. Use the search box or category filter tabs to find any tool. Each row has a show/hide toggle and a copy-to-clipboard button. A green "✓ set" label appears once a key is entered. The sidebar shows a live count of configured tools.' },
      { type: 'table', headers: ['Category', 'Tools'], rows: [
        ['AI Models', 'Gemini, Grok, Mistral, Perplexity'],
        ['Image & Video', 'Stability AI, Runway, HeyGen, Synthesia, Leonardo, Ideogram, Kling, Luma, Pika, Descript, Higgsfield'],
        ['Voice & Audio', 'ElevenLabs, Murf, PlayHT, Bland AI, Vapi, Retell, Deepgram, AssemblyAI, Cartesia'],
        ['Content & SEO', 'Jasper, Copy.ai, Surfer SEO, Semrush, AdCreative.ai, Taplio'],
        ['Outreach', 'Instantly, Smartlead, Clay, Phantom Buster, Apollo, Million Verifier, Refonic'],
        ['Automation', 'Make, Zapier, Voiceflow, ManyChat, HubSpot, Triple Whale, Facebook Ads API, MCPHub'],
      ]},
      { type: 'h2', text: 'Color Themes' },
      { type: 'p', text: 'Six built-in themes. Switch instantly — the entire app updates in real time.' },
      { type: 'table', headers: ['Theme', 'Vibe'], rows: [
        ['⚡ Dark Neon', 'Default — cyberpunk green on black'],
        ['🌙 Midnight', 'Deep indigo and violet'],
        ['🌲 Forest', 'Emerald and sage green'],
        ['🌅 Sunset', 'Warm amber and crimson'],
        ['❄️ Arctic', 'Cool cyan and ice blue'],
        ['🌸 Rose', 'Soft pink and coral'],
      ]},
      { type: 'h2', text: 'Data & Privacy' },
      { type: 'list', items: [
        'All data is stored in your browser\'s localStorage — nothing leaves your machine',
        'AI Brain keys are only sent to localhost:3001 (your local server), never to third parties',
        'Tool Vault keys are stored locally only — they are not sent anywhere unless an integration uses them',
        'Export your settings as JSON anytime from Settings → Data & Privacy',
        'Use Reset Everything to restore default seed data',
      ]},
    ],
  },
  leads: {
    title: 'Lead Finder',
    body: [
      { type: 'p', text: 'Pull cold leads from Apify data sources and manage them through a pipeline until they become clients.' },
      { type: 'h2', text: 'Pipeline Tab' },
      { type: 'list', items: [
        'Filter leads by status: All, Lead, Prospect, Active, Lost',
        'Search by name or company',
        'Click any lead to expand — edit status, score, notes, see sequence progress',
        '"→ Move to Clients" button graduates a Prospect to an active client record',
        'Lead Score (0–100) indicates conversion likelihood — scored automatically on import, adjustable manually',
      ]},
      { type: 'h2', text: 'Find Leads Tab' },
      { type: 'steps', items: [
        'Select a data source (LinkedIn, Google Maps, Apollo, etc.)',
        'Paste the search URL or keyword from that platform',
        'Set Max Leads (5–500)',
        'Click "Find Leads" — Agency OS triggers the Apify actor and polls status',
        'When complete, a preview table appears with all scraped leads',
        'Click "Import All" to add them to your pipeline (duplicates by email are skipped)',
      ]},
      { type: 'h2', text: 'Lead Statuses' },
      { type: 'table', headers: ['Status', 'Meaning'], rows: [
        ['lead',     'Raw import — not yet engaged'],
        ['prospect', 'Actively being outreached / replied'],
        ['active',   'Converted to paying client'],
        ['lost',     'Did not convert'],
      ]},
      { type: 'h2', text: 'Setup Required' },
      { type: 'p', text: 'Add APIFY_API_KEY to your .env file and restart the server. Get a free key at apify.com.' },
    ],
  },
  campaigns: {
    title: 'Campaigns',
    body: [
      { type: 'p', text: 'Build AI-generated 12-step cold email sequences and push them live to Instantly.ai — fully automated.' },
      { type: 'h2', text: 'Creating a Campaign (4 steps)' },
      { type: 'steps', items: [
        'Step 1 — Select Leads: choose which leads from your pipeline to enroll',
        'Step 2 — Brief: describe your offer, ICP, tone (consultative/direct/friendly/authoritative/storytelling), and a proof point / case study',
        'Step 3 — AI Sequence: click "Generate" — the AI writes 12 emails with subject lines and bodies using your brief',
        'Step 4 — Review & Launch: confirm and click Launch — campaign saves locally and auto-pushes to Instantly if key is set',
      ]},
      { type: 'h2', text: 'Campaign Stats' },
      { type: 'list', items: [
        'Sent — total emails delivered',
        'Open Rate % — percentage of recipients who opened',
        'Reply Rate % — percentage who replied',
        'Booked — calls/meetings booked from replies',
      ]},
      { type: 'h2', text: 'The 12-Step Sequence Strategy' },
      { type: 'p', text: 'Each campaign generates 12 emails spread over ~50 days. The sequence follows a proven cold email arc:' },
      { type: 'list', items: [
        'Steps 1–3: hook, insight, social proof',
        'Steps 4–6: follow-ups with new angles and a call ask',
        'Steps 7–9: breakup bait, objection handling, alternative framing',
        'Steps 10–12: final value drop, referral ask, breakup',
      ]},
      { type: 'h2', text: 'Setup Required' },
      { type: 'table', headers: ['Feature', 'Env Var Needed'], rows: [
        ['Instantly.ai push',     'INSTANTLY_API_KEY'],
        ['Zoom meeting creation', 'ZOOM_CLIENT_ID + ZOOM_CLIENT_SECRET + ZOOM_ACCOUNT_ID'],
        ['AI sequence gen',       'Any AI provider key (MiniMax, Groq, OpenAI, or Anthropic)'],
      ]},
    ],
  },
  leadgen: {
    title: 'Lead Gen Automation — Complete Guide',
    body: [
      { type: 'p', text: 'Agency OS includes a fully automated lead-to-meeting pipeline designed to book 30–50 calls per month with minimal manual effort. This guide covers every piece of the system.' },

      { type: 'h2', text: 'Pipeline Overview' },
      { type: 'p', text: 'The automation flows through 6 stages. Each stage can run independently or be chained together for full autopilot:' },
      { type: 'steps', items: [
        'Lead Sourcing — Apify scrapes LinkedIn, Google Maps, Apollo, or Sales Navigator on a schedule',
        'Auto-Import — Scraped results are deduplicated, normalized, and added to your pipeline automatically',
        'AI Scoring — Each lead is scored 0–100 against your ICP (Ideal Customer Profile) using AI',
        'Campaign Enrollment — Leads above your score threshold are auto-enrolled into the matching campaign',
        'Reply Classification — Incoming replies are captured via webhook, classified by AI (positive/negative/neutral/etc.), and queued',
        'Meeting Booking — Positive replies trigger automatic Zoom meeting creation + Google Calendar event + CRM deal',
      ]},

      { type: 'h2', text: 'Required API Keys' },
      { type: 'p', text: 'Add these to your .env file in the project root. Only the AI key is strictly required — everything else enables specific features:' },
      { type: 'table', headers: ['Key', 'Purpose', 'Where to Get It'], rows: [
        ['MINIMAX_API_KEY or OPENAI_API_KEY or GROQ_API_KEY or ANTHROPIC_API_KEY', 'AI engine — reply classification, lead scoring, sequence generation, autopilot briefings', 'minimax.io / platform.openai.com / console.groq.com / console.anthropic.com'],
        ['APIFY_API_KEY', 'Lead scraping — runs actors for LinkedIn, Google Maps, Apollo, Sales Nav', 'console.apify.com → Settings → Integrations → API Token'],
        ['INSTANTLY_API_KEY', 'Cold email — creates campaigns, enrolls leads, sends sequences, captures replies', 'app.instantly.ai → Settings → Integrations → API Key'],
        ['ZOOM_CLIENT_ID + ZOOM_CLIENT_SECRET + ZOOM_ACCOUNT_ID', 'Creates Zoom meeting links for booked calls', 'marketplace.zoom.us → Build App → Server-to-Server OAuth → Credentials'],
        ['GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET', 'Google Calendar — reads schedule, creates meeting events with attendees', 'console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client IDs'],
        ['CAL_COM_API_KEY', 'Cal.com self-scheduling — leads pick their own meeting time, team round-robin', 'cal.com → Settings → Developer → API Keys'],
      ]},
      { type: 'code', text: '# .env example — minimum setup\nMINIMAX_API_KEY=your-key-here\nAPFIY_API_KEY=your-key-here\nINSTANTLY_API_KEY=your-key-here\n\n# Optional: Zoom meetings\nZOOM_CLIENT_ID=your-id\nZOOM_CLIENT_SECRET=your-secret\nZOOM_ACCOUNT_ID=your-account-id\n\n# Optional: Google Calendar\nGOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com\nGOOGLE_CLIENT_SECRET=your-secret\n\n# Optional: Cal.com self-scheduling\nCAL_COM_API_KEY=your-cal-com-key' },
      { type: 'p', text: 'After editing .env, restart the server (Ctrl+C → npm run dev). Keys are loaded once at startup.' },

      { type: 'h2', text: 'Step 1: Configure Auto-Source' },
      { type: 'p', text: 'Go to Lead Finder → Auto-Source tab. This is where you control the top of funnel.' },
      { type: 'steps', items: [
        'Set your ICP Description — describe your ideal customer (e.g., "B2B SaaS founders, 10-50 employees, US-based, Series A+")',
        'Set the Score Threshold slider — leads scoring above this number get auto-enrolled (default: 65)',
        'Add a Scrape Schedule — select an Apify actor, paste a search URL, set frequency (e.g., every 12 hours), max leads per run',
        'The scheduler runs server-side — even if you close the browser, scheduled scrapes keep running as long as the server is up',
      ]},
      { type: 'table', headers: ['Actor', 'Best For', 'Input'], rows: [
        ['LinkedIn Profile Scraper', 'Targeting specific people by title/company', 'LinkedIn search URL or profile URLs'],
        ['Google Maps Scraper', 'Local businesses (agencies, restaurants, clinics)', 'Google Maps search URL'],
        ['Apollo.io Scraper', 'B2B leads with verified emails', 'Apollo search URL with filters'],
        ['Sales Navigator Scraper', 'Enterprise/high-value B2B targeting', 'Sales Nav search URL'],
        ['Google Search Scraper', 'Custom search queries, directories, lists', 'Google search query'],
      ]},

      { type: 'h2', text: 'Step 2: Create a Campaign' },
      { type: 'p', text: 'Go to Campaigns → + New Campaign. The 4-step wizard walks you through:' },
      { type: 'steps', items: [
        'Select Leads — pick leads from your pipeline (or let Auto-Source auto-enroll them later)',
        'Write Brief — describe your offer, select tone, add a proof point. This brief is used for AI scoring and sequence generation.',
        'Generate Sequence — AI writes a 12-step cold email sequence (~50 days). Review and edit any step before launching.',
        'Launch — campaign is saved locally AND pushed to Instantly.ai (if API key is set). Emails start sending automatically.',
      ]},
      { type: 'p', text: 'Tip: Create your campaign first (even with 0 leads), set up Auto-Source to target the same ICP, and leads will auto-enroll as they score above threshold.' },

      { type: 'h2', text: 'Step 3: Reply Handling' },
      { type: 'p', text: 'When a prospect replies to your email sequence, the system handles it automatically:' },
      { type: 'steps', items: [
        'Instantly.ai fires a webhook to your server at /api/instantly/webhook',
        'The server\'s AI classifies the reply into one of 6 intents: POSITIVE, NEGATIVE, NEUTRAL, UNSUBSCRIBE, REFERRAL, or MAYBE_LATER',
        'The reply is queued with its classification, confidence score, and AI summary',
        'The frontend polls every 30 seconds, matches replies to leads, and updates their status',
        'You can see all replies in Campaigns → click a campaign → Reply Inbox with colored classification badges',
      ]},
      { type: 'table', headers: ['Classification', 'Color', 'What It Means'], rows: [
        ['POSITIVE', 'Green', 'Lead is interested, wants to talk — triggers auto-booking if enabled'],
        ['MAYBE_LATER', 'Blue', 'Not now but open to future contact — stays in sequence'],
        ['NEUTRAL', 'Grey', 'Ambiguous reply — needs manual review'],
        ['REFERRAL', 'Cyan', 'Referred to someone else — check for new lead info'],
        ['NEGATIVE', 'Orange', 'Not interested — removed from sequence'],
        ['UNSUBSCRIBE', 'Red', 'Wants off the list — auto-removed'],
      ]},
      { type: 'p', text: 'Instantly webhook setup: In Instantly → Settings → Webhooks → add your server URL (e.g., https://your-domain.com/api/instantly/webhook). Select "Reply Received" events.' },

      { type: 'h2', text: 'Step 4: Auto-Booking' },
      { type: 'p', text: 'Two booking modes are available. Choose in Lead Finder → Auto-Source → Booking Mode:' },
      { type: 'table', headers: ['Mode', 'How It Works', 'Best For'], rows: [
        ['Fixed Time', 'System auto-books next business day at 10 AM — creates Zoom + Calendar event automatically', 'Solo founders, small teams, quick turnaround'],
        ['Self-Schedule (Cal.com)', 'System generates a Cal.com booking link — lead picks their own time from your availability', 'Sales teams, round-robin, higher show rates, scaling'],
      ]},
      { type: 'h2', text: 'Fixed Time Mode' },
      { type: 'steps', items: [
        'Enable auto-booking: Lead Finder → Auto-Source → toggle "Auto-book positive replies"',
        'Set Booking Mode to "Fixed Time"',
        'The system schedules a 30-minute call on the next business day at 10:00 AM',
        'Zoom meeting + Google Calendar event are created automatically',
        'The lead receives a calendar invite with the Zoom link',
      ]},
      { type: 'h2', text: 'Cal.com Self-Schedule Mode' },
      { type: 'steps', items: [
        'Add CAL_COM_API_KEY to your .env file (get it from cal.com → Settings → Developer → API Keys)',
        'Restart the server — the Auto-Source tab will show "CONNECTED" status',
        'Set Booking Mode to "Self-Schedule (Cal.com)"',
        'Select the Event Type to use for booking links (e.g., "30 Min Discovery Call")',
        'When a positive reply arrives, the system generates a personalized Cal.com link',
        'The lead\'s name and email are pre-filled — they just pick a time slot',
        'When the lead books, Cal.com fires a webhook → the system auto-updates lead status + creates CRM deal',
      ]},
      { type: 'p', text: 'Team & Round-Robin: Create a team event type in Cal.com (cal.com → Teams → Event Types → Round Robin). Select it in Auto-Source → the booking links will automatically distribute calls across your sales team.' },
      { type: 'p', text: 'Manual booking: Click "Book Call" on any lead in the Reply Inbox. If Cal.com is configured, you\'ll see a toggle to choose Fixed Time or Self-Schedule.' },
      { type: 'p', text: 'Graceful degradation: Zoom, GCal, and Cal.com are all optional. If none are configured, booking still updates lead status and creates CRM records.' },

      { type: 'h2', text: 'Step 5: CRM Auto-Sync' },
      { type: 'p', text: 'When a meeting is booked (automatically or manually), the system creates CRM records:' },
      { type: 'list', items: [
        'A CRM Contact is created (or matched if one exists with the same email)',
        'A CRM Company is created (or matched by company name)',
        'A Deal is created in the "Qualified" pipeline stage, tagged "outbound" + "auto-created"',
        'The deal links back to the source lead and campaign for full attribution',
        'Auto-created deals show an "AUTO" badge in the Deal Pipeline view',
      ]},

      { type: 'h2', text: 'Step 6: Monitor the Pipeline' },
      { type: 'p', text: 'Go to Dashboard → scroll to the Lead-to-Meeting Pipeline section. The funnel shows:' },
      { type: 'list', items: [
        'Leads Sourced — total leads imported into the system',
        'Enrolled — leads currently in an active campaign',
        'Replies — total replies received',
        'Positive — replies classified as POSITIVE or MAYBE_LATER',
        'Booked — meetings successfully scheduled',
        'Conversion rates between each stage',
        'Goal tracker: progress toward your 30–50 calls/month target, with projected month-end rate',
      ]},

      { type: 'h2', text: 'Automation Toggles' },
      { type: 'p', text: 'All found in Lead Finder → Auto-Source tab:' },
      { type: 'table', headers: ['Toggle', 'What It Does', 'Default'], rows: [
        ['Score Threshold', 'Leads scoring above this number auto-enroll into the matching campaign', '65'],
        ['Auto-book positive replies', 'POSITIVE replies with ≥85% confidence auto-book a meeting', 'Off'],
        ['Autopilot auto-execute', 'The AI Autopilot briefing executes suggested actions automatically (enroll leads, book calls, create deals)', 'Off'],
      ]},
      { type: 'p', text: 'Start with all toggles OFF. Monitor the pipeline for a week, verify AI classifications are accurate, then enable auto-booking first, then auto-execute.' },

      { type: 'h2', text: 'Campaign Stats Sync' },
      { type: 'p', text: 'Campaign stats (sent, opens, replies, bounces) sync from Instantly every 5 minutes automatically. No action needed — stats appear on campaign cards and in the Dashboard funnel.' },

      { type: 'h2', text: 'The Math: Hitting 30–50 Calls/Month' },
      { type: 'list', items: [
        'Cold email positive reply rate: ~1–2% of emails sent',
        'Positive-to-booked conversion: ~50–70%',
        'Need: ~3,000–5,000 emails/month (100–170/day)',
        'Need: ~100–200 fresh leads/week',
        'With auto-sourcing every 12 hours pulling 50–100 leads per run, you hit the volume easily',
        'The Dashboard goal tracker shows your real-time progress and projected month-end booking count',
      ]},

      { type: 'h2', text: 'Google Calendar Setup' },
      { type: 'steps', items: [
        'Go to console.cloud.google.com → create a project (or select existing)',
        'Enable the Google Calendar API under APIs & Services → Library',
        'Go to Credentials → Create Credentials → OAuth 2.0 Client ID',
        'Application type: Web application',
        'Add redirect URI: http://localhost:3001/api/gcal/callback',
        'Copy Client ID and Client Secret into your .env file',
        'Restart the server, then go to Agency OS → Schedule tab',
        'Click "Connect Google Calendar" — a browser window opens for OAuth consent',
        'After authorizing, your calendar events appear in the Schedule view',
      ]},

      { type: 'h2', text: 'Zoom Setup' },
      { type: 'steps', items: [
        'Go to marketplace.zoom.us → Develop → Build App',
        'Choose "Server-to-Server OAuth" app type',
        'Name your app (e.g., "Agency OS Meetings")',
        'Copy the Account ID, Client ID, and Client Secret into your .env file',
        'Under Scopes, add: meeting:write:admin (Create meetings)',
        'Activate the app',
        'Restart the server — Zoom meeting links will now auto-attach to booked calls',
      ]},

      { type: 'h2', text: 'Cal.com Setup' },
      { type: 'steps', items: [
        'Go to cal.com → sign up or log in',
        'Create an Event Type (e.g., "30 Min Discovery Call") — or use a Team Round Robin type for sales teams',
        'Go to Settings → Developer → API Keys → create a new key',
        'Copy the key into your .env file as CAL_COM_API_KEY',
        'Restart the server',
        'In Agency OS → Lead Finder → Auto-Source → set Booking Mode to "Self-Schedule (Cal.com)"',
        'Select your event type from the dropdown — booking links will now use this',
      ]},
      { type: 'h2', text: 'Cal.com Webhook (for auto-updates)' },
      { type: 'steps', items: [
        'In Cal.com → Settings → Developer → Webhooks → Add',
        'URL: https://your-domain.com/api/cal/webhook (use ngrok for local dev)',
        'Events: Booking Created, Booking Cancelled, Booking Rescheduled',
        'When a lead books through their link, the webhook fires → Agency OS auto-updates lead status + creates CRM deal',
      ]},
      { type: 'p', text: 'Without the webhook: Agency OS still generates booking links, but you\'ll need to manually mark leads as booked after they schedule.' },

      { type: 'h2', text: 'Troubleshooting' },
      { type: 'h2', text: 'Replies not appearing?' },
      { type: 'list', items: [
        'Check that your Instantly webhook URL is correct and publicly accessible (ngrok for local dev)',
        'The server must be running — webhooks are processed in real-time',
        'Check server console for "Instantly webhook:" log entries',
        'Verify the webhook event type is "reply_received" in Instantly settings',
      ]},
      { type: 'h2', text: 'Auto-booking not working?' },
      { type: 'list', items: [
        'Confirm "Auto-book positive replies" is toggled ON in Auto-Source tab',
        'Auto-book only triggers for POSITIVE intent with ≥85% confidence — check the classification badge',
        'Zoom and GCal are optional but recommended — booking still works without them (status update + CRM deal)',
        'Check the server console for booking errors',
      ]},
      { type: 'h2', text: 'Scrape schedules not running?' },
      { type: 'list', items: [
        'Schedules run server-side — the server must be running 24/7 for scheduled scrapes',
        'Check that APIFY_API_KEY is set in .env and the server was restarted after adding it',
        'The scheduler checks every 30 minutes — new schedules may take up to 30 min for first run',
        'Overdue schedules (missed while server was down) auto-run within 60 seconds of server start',
      ]},
      { type: 'h2', text: 'AI scoring returns low scores?' },
      { type: 'list', items: [
        'Make your ICP description specific — generic descriptions produce generic scores',
        'Include: target industry, company size, job title seniority, geography, and any disqualifiers',
        'AI scoring uses whatever AI provider is configured — better models (GPT-4, Claude) give better scores',
      ]},
    ],
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    body: [
      { type: 'table', headers: ['Shortcut', 'Action'], rows: [
        ['Ctrl+K', 'Open Command Palette'],
        ['Escape', 'Close any open panel or modal'],
        ['Enter', 'Submit form / send AI message'],
        ['↑ / ↓', 'Navigate command palette results'],
        ['Tab', 'Move focus between elements (full keyboard nav)'],
      ]},
      { type: 'h2', text: 'Command Palette (Ctrl+K)' },
      { type: 'p', text: 'The command palette gives you instant access to any view or action from anywhere in the app. Type to filter, press Enter to navigate.' },
      { type: 'list', items: [
        'Navigate to any tab',
        'Open New Task modal',
        'Jump to Settings or Profile',
        'Open AI Brain',
      ]},
    ],
  },
  faq: {
    title: 'FAQ & Troubleshooting',
    body: [
      { type: 'h2', text: 'The AI says "API key not configured"' },
      { type: 'p', text: 'Go to Settings → AI Integrations → paste your API key → Test → Save Changes. If you added it to .env, restart the server (Ctrl+C → npm run dev).' },
      { type: 'h2', text: 'My data disappeared after refreshing' },
      { type: 'p', text: 'This is very rare but can happen if browser storage was cleared. Use Settings → Data → Export Settings regularly to back up your config. Task/client data is harder to recover — export to JSON from the browser console if needed.' },
      { type: 'h2', text: 'The web browser shows empty content' },
      { type: 'p', text: 'Some sites block server-side fetch requests (Cloudflare protection, login walls, JS-only rendering). Try a different URL or switch to Manual mode and navigate to the site\'s direct content URL.' },
      { type: 'h2', text: 'How do I update Agency OS?' },
      { type: 'steps', items: [
        'Click Updates (🔄) in the nav if an update badge is showing',
        'Or use the start.bat / start.sh launcher — it checks on every startup',
        'Or manually: git pull origin main && npm install in the project folder',
        'Restart the app after updating',
      ]},
      { type: 'h2', text: 'The app won\'t start (port in use)' },
      { type: 'p', text: 'Another process is using port 5173 or 3001. Kill it with: kill -9 $(lsof -ti:3001) on Mac/Linux, or find and kill it in Task Manager on Windows.' },
      { type: 'h2', text: 'How do I add a real AI agent (not simulated)?' },
      { type: 'p', text: 'The current agent fleet is simulated for dashboard/demo purposes. Real agent execution (calling external APIs, running code) is on the v2.0.0 roadmap. For now, use the AI Brain to manually execute tasks with real AI assistance.' },
    ],
  },
};

function Block({ b }) {
  if (b.type === 'h2')    return <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'var(--sans)', marginTop:24, marginBottom:8 }}>{b.text}</h2>;
  if (b.type === 'p')     return <p style={{ fontSize:12, color:'var(--dim)', fontFamily:'var(--sans)', lineHeight:1.75, marginBottom:10 }}>{b.text}</p>;
  if (b.type === 'code')  return <pre style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--accent)', background:'var(--surface2)', padding:'10px 14px', borderRadius:'var(--radius)', border:'1px solid var(--border)', marginBottom:12, whiteSpace:'pre-wrap' }}>{b.text}</pre>;

  if (b.type === 'steps') return (
    <ol style={{ margin:'0 0 14px 0', paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
      {b.items.map((it, i) => (
        <li key={i} style={{ fontSize:12, color:'var(--dim)', fontFamily:'var(--sans)', lineHeight:1.6 }}>
          <span style={{ color:'var(--accent)', fontFamily:'var(--mono)', fontSize:10, marginRight:6, fontWeight:700 }}>{i+1}.</span>{it}
        </li>
      ))}
    </ol>
  );

  if (b.type === 'list') return (
    <ul style={{ margin:'0 0 14px 0', paddingLeft:16, display:'flex', flexDirection:'column', gap:5 }}>
      {b.items.map((it, i) => (
        <li key={i} style={{ fontSize:12, color:'var(--dim)', fontFamily:'var(--sans)', lineHeight:1.6, listStyle:'none' }}>
          <span style={{ color:'var(--accent)', marginRight:8 }}>›</span>{it}
        </li>
      ))}
    </ul>
  );

  if (b.type === 'table') return (
    <div style={{ overflowX:'auto', marginBottom:16 }}>
      <table className="table">
        <thead>
          <tr>{b.headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {b.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ color: j===0 ? 'var(--dim)' : 'var(--muted)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return null;
}

export default function Wiki() {
  const [active, setActive] = useState('start');
  const [search, setSearch] = useState('');

  const content = CONTENT[active];

  const matchingSections = search.trim()
    ? SECTIONS.filter(s => {
        const c = CONTENT[s.id];
        const hay = [s.label, c.title, ...c.body.map(b => b.text ?? b.items?.join(' ') ?? '').filter(Boolean)].join(' ').toLowerCase();
        return hay.includes(search.toLowerCase());
      })
    : SECTIONS;

  return (
    <section className="view" aria-labelledby="wiki-title">
      <header className="view-header" style={{ marginBottom: 16 }}>
        <h1 id="wiki-title" className="view-title">📖 Wiki</h1>
        <p className="view-subtitle">How to use every part of Agency OS</p>
      </header>

      <div className="settings-layout">
        {/* Sidebar */}
        <nav className="settings-sidebar" aria-label="Wiki sections">
          <div style={{ marginBottom: 10 }}>
            <input
              className="input"
              style={{ fontSize: 11, padding: '6px 10px' }}
              placeholder="Search wiki…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search wiki"
            />
          </div>
          {matchingSections.map(s => (
            <button
              key={s.id}
              className={`settings-nav-item${active === s.id ? ' settings-nav-item--active' : ''}`}
              onClick={() => { setActive(s.id); setSearch(''); }}
            >
              <span aria-hidden="true">{s.icon}</span>
              {s.label}
            </button>
          ))}
          {matchingSections.length === 0 && (
            <div className="empty-msg" style={{ padding:'8px 12px', fontSize:10 }}>No results</div>
          )}
          <div style={{ marginTop:16, paddingTop:12, borderTop:'1px solid var(--border)' }}>
            <a
              href="https://github.com/RhinoWeb/agency-os"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', display:'flex', alignItems:'center', gap:6, padding:'6px 12px', textDecoration:'none' }}
            >
              ↗ GitHub Repo
            </a>
            <a
              href="https://github.com/RhinoWeb/agency-os/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', display:'flex', alignItems:'center', gap:6, padding:'6px 12px', textDecoration:'none' }}
            >
              🐛 Report a Bug
            </a>
          </div>
        </nav>

        {/* Content */}
        <div className="settings-content">
          <div className="settings-section-title">{content?.title}</div>
          <div style={{ marginTop: 8 }}>
            {content?.body.map((b, i) => <Block key={i} b={b} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
