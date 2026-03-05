import { useState } from 'react';

const SECTIONS = [
  { id: 'start',    label: 'Getting Started',     icon: '🚀' },
  { id: 'dash',     label: 'Dashboard',            icon: '◈' },
  { id: 'tasks',    label: 'Task Board',           icon: '▦' },
  { id: 'agents',   label: 'Agent Fleet',          icon: '⬡' },
  { id: 'ai',       label: 'AI Brain',             icon: '🧠' },
  { id: 'browser',  label: 'Web Browser',          icon: '🌐' },
  { id: 'clients',  label: 'Clients',              icon: '🏢' },
  { id: 'workflows',label: 'Workflows',            icon: '⚡' },
  { id: 'kb',       label: 'Knowledge Base',       icon: '◎' },
  { id: 'settings', label: 'Settings',             icon: '⚙' },
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
  browser: {
    title: 'Web Browser',
    body: [
      { type: 'p', text: 'An AI-powered research browser built into Agency OS. No Chromium required — pages are fetched and parsed server-side.' },
      { type: 'h2', text: 'Manual Mode' },
      { type: 'steps', items: [
        'Click the Browser tab in the navigation',
        'Make sure "Manual" is selected in the top-right toggle',
        'Type any URL (e.g. ahrefs.com/pricing) in the address bar',
        'Press Enter or click Go',
        'Page loads in reader view: title, outline, full text, links',
        'Click any extracted link to navigate to it',
      ]},
      { type: 'h2', text: 'AI Browse Mode' },
      { type: 'steps', items: [
        'Switch to "AI Browse" in the top-right toggle',
        'Type a research task (e.g. "Find Semrush pricing and compare with Ahrefs")',
        'Click Research — watch the AI work in real time',
        'AI decides the best URL → fetches the page → streams its analysis',
        'Results appear in the right panel',
      ]},
      { type: 'h2', text: 'Browse History' },
      { type: 'p', text: 'Every page you visit appears in the left sidebar. Click any entry to revisit it. History is session-only (resets on page refresh).' },
      { type: 'h2', text: 'Limitations' },
      { type: 'list', items: [
        'JavaScript-heavy sites (Twitter, LinkedIn) may show incomplete content — these need a real browser engine',
        'Sites with Cloudflare protection may block the fetch request',
        'Content is shown in reader mode only — no images, styling, or interactive elements',
      ]},
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
      { type: 'p', text: 'Access Settings by clicking the ⚙ gear icon in the top-right corner of the nav bar.' },
      { type: 'h2', text: 'AI Integrations' },
      { type: 'steps', items: [
        'Select your Active Provider (used for all AI Brain responses)',
        'Paste your API key for any provider',
        'Click Test to verify the key works',
        'Optionally override the default model name',
        'Click Save Changes at the top',
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
        'API keys are only sent to localhost:3001 (your local server), never to third parties',
        'Export your settings as JSON anytime',
        'Use Reset Everything to restore default seed data',
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
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:'var(--mono)' }}>
        <thead>
          <tr>{b.headers.map((h, i) => (
            <th key={i} style={{ padding:'7px 12px', textAlign:'left', borderBottom:'1px solid var(--border)', color:'var(--muted)', fontSize:10, textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {b.rows.map((row, i) => (
            <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding:'8px 12px', color: j===0 ? 'var(--dim)' : 'var(--muted)' }}>{cell}</td>
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
      <header style={{ marginBottom: 16 }}>
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
            <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', padding:'8px 12px' }}>No results</div>
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
