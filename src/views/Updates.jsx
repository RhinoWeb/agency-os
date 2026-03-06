import { useState, useEffect } from 'react';

const LOCAL_CHANGELOG = [
  {
    version: '1.0.3',
    date: '2026-03-06',
    label: 'Lead Gen Machine 🚀',
    features: [
      'Lead Finder — pipeline view with status filters, lead score badges, notes, sequence progress, graduate-to-client action',
      'Find Leads — Apify actor library (LinkedIn, Google Maps, Apollo, Sales Nav), run + poll + import flow with preview table',
      'Campaigns — AI-generated 12-step cold email sequences, 4-step creation modal (Select Leads → Brief → Sequence → Launch)',
      'Instantly.ai integration — campaigns auto-push to Instantly with lead enrollment when API key is set',
      'Zoom Server-to-Server OAuth — create meeting links for booked calls via /api/zoom/meeting',
      'AI sequence generator — /api/ai/sequence uses active AI provider to write 12 personalized emails from a brief',
      'AI reply classifier — /api/ai/classify-reply detects POSITIVE / NEGATIVE / UNSUBSCRIBE / REFERRAL intent',
      'Google Calendar OAuth — connect your Google Calendar and sync today\'s events into the Schedule view',
      'Schedule — add/delete custom events with type selector (meeting, agent, deep-work, task)',
      'Profile photo upload — 2 MB limit, canvas resize to 200×200 JPEG before localStorage storage',
      'Settings → Calendars section — manage Google Calendar connection status',
    ],
    technical: [
      'seedLeads (8 leads) and seedCampaigns (1 sample) added to data.js',
      'leads / campaigns / apifyRuns added as usePersistedState in App.jsx',
      'LeadFinder.jsx and Campaigns.jsx created as new views',
      'Nav.jsx: Leads (◉) and Campaigns (📨) tabs added',
      'server.js: 12 new routes — Apify (4), Instantly (4), Zoom (1), AI (2), Google Calendar (5)',
      'getZoomToken() uses Server-to-Server OAuth with in-memory token cache',
      'Google Calendar token stored in .gcal-token.json with auto-refresh',
    ],
  },
  {
    version: '1.0.2',
    date: '2026-03-06',
    label: 'Tool Vault 🔑',
    features: [
      'Tool Vault — 45 marketing tool API keys in Settings, across 6 categories',
      'AI Models: Gemini, Grok, Mistral, Perplexity',
      'Image & Video: Stability AI, Runway, HeyGen, Synthesia, Leonardo, Ideogram, Kling, Luma, Pika, Descript, Higgsfield',
      'Voice & Audio: ElevenLabs, Murf, PlayHT, Bland AI, Vapi, Retell, Deepgram, AssemblyAI, Cartesia',
      'Content & SEO: Jasper, Copy.ai, Surfer SEO, Semrush, AdCreative.ai, Taplio',
      'Outreach: Instantly, Smartlead, Clay, Phantom Buster, Apollo, Million Verifier, Refonic',
      'Automation: Make, Zapier, Voiceflow, ManyChat, HubSpot, Triple Whale, Facebook Ads API, MCPHub',
      'Search + category filter tabs, show/hide toggle, copy-to-clipboard, live configured count badge',
    ],
    technical: [
      'toolKeys: {} added to DEFAULT_SETTINGS in theme.js',
      'setToolKey() merges into settings.toolKeys via spread',
      'ToolKeyRow compact component with password input + clipboard API',
      'TOOL_CATS and TOOL_VAULT arrays (45 tools) defined in Settings.jsx',
      'Backward-compatible — toolKeys ?? {} handles existing localStorage',
    ],
  },
  {
    version: '1.0.1',
    date: '2026-03-06',
    label: 'Creator & Outreach Layer 🎯',
    features: [
      'AI Brain expanded to 60 prompts — new Outreach & Growth category with 10 creator/KOL scripts',
      'Creator/KOL client sub-type — platform, niche, followers, commission rate, referral link, revenue tracking',
      'Client type badges — Brand, SaaS, Creator/KOL, Retreat shown on all client cards',
      'Outreach funnel progress bar on pipeline client cards — tracks 5 stages from Outreach to Closed',
      '3 pre-built workflow templates — Influencer Launch Campaign, Cold Outreach Sprint, Content Campaign Launch',
      'PRODUCT.md v1.1 roadmap updated with creator layer, campaign KPI widget, and templates library',
    ],
    technical: [
      'Creator panel component in Clients.jsx with creator-specific stat grid',
      'TypeBadge and OutreachFunnelRow components added to Clients.jsx',
      'seedClients updated with clientType, outreachStage, and creator fields',
      'Workflows.jsx split into active / template sections with "Use Template" action',
      'isTemplate flag on workflow seed data',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-05',
    label: 'Initial Release 🚀',
    features: [
      'Command Dashboard with live MRR, agent status, revenue and task charts',
      'Drag-and-drop Kanban Task Board with priorities, subtasks, and time tracking',
      'Agent Fleet management with status toggles and efficiency metrics',
      'Workflow Automation with trigger/step/action chains',
      'Analytics — MRR trends, task completion rates, client health breakdown',
      'Client CRM with health scores, pipeline tracking, and MRR per client',
      'Schedule calendar with events and agent run scheduling',
      'Knowledge Base — searchable internal docs with inline editing',
      'AI Brain with 50 pre-written agency prompts across 5 categories',
      'Web Browser — manual URL reader + AI-directed research mode',
      'Settings — multi-provider AI keys, 6 color themes, font size, agency prefs',
      'Profile — avatar picker, display name, bio, live agency stats',
      'In-app Wiki with full usage documentation',
      'In-app Updates page with one-click updater',
      'Auto-update check via GitHub Releases API',
    ],
    technical: [
      'React 18 + Vite 5 frontend with HMR',
      'Express.js API proxy with SSE streaming',
      'Multi-provider AI: MiniMax, OpenAI, Groq, Anthropic',
      'localStorage persistence — zero database required',
      'Full ARIA accessibility throughout',
      'start.bat / start.sh launcher with built-in update check',
    ],
  },
];

export default function Updates() {
  const [versionInfo, setVersionInfo] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [updating,    setUpdating]    = useState(false);
  const [updateMsg,   setUpdateMsg]   = useState(null);

  useEffect(() => {
    fetch('/api/version')
      .then(r => r.json())
      .then(d => { setVersionInfo(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function applyUpdate() {
    if (!window.confirm('Apply the update now? The server will restart automatically.\n\nYour data (tasks, clients, settings) is stored in the browser and will not be affected.')) return;
    setUpdating(true);
    setUpdateMsg(null);
    try {
      const res  = await fetch('/api/apply-update', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setUpdateMsg({ type: 'ok', text: data.message });
      } else {
        setUpdateMsg({ type: 'error', text: `Update failed: ${data.error}` });
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <section className="view view--mid" aria-labelledby="updates-title">
      <header style={{ marginBottom: 24 }}>
        <h1 id="updates-title" className="view-title">🔄 Updates & Changelog</h1>
        <p className="view-subtitle">Version history and release notes</p>
      </header>

      {/* Version status card */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        {loading ? (
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Checking for updates…</div>
        ) : versionInfo ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Installed</span>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>v{versionInfo.current}</span>
              </div>
              {versionInfo.updateAvailable ? (
                <div style={{ fontSize: 12, color: 'var(--yellow)', fontFamily: 'var(--sans)' }}>
                  ⚠ Update available: <strong>v{versionInfo.latest}</strong>
                  {versionInfo.publishedAt && (
                    <span style={{ color: 'var(--muted)', fontSize: 10, marginLeft: 8 }}>
                      Released {new Date(versionInfo.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--sans)' }}>
                  ✓ You are on the latest version
                </div>
              )}
            </div>

            {versionInfo.updateAvailable && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <button
                  className="btn btn--primary"
                  onClick={applyUpdate}
                  disabled={updating}
                  style={{ minWidth: 120 }}
                >
                  {updating ? 'Updating…' : 'Update Now'}
                </button>
                {versionInfo.releaseUrl && (
                  <a href={versionInfo.releaseUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                    View on GitHub →
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Could not check for updates (offline or GitHub unreachable)</div>
        )}

        {/* Update message */}
        {updateMsg && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 'var(--radius)',
            background: updateMsg.type === 'ok' ? '#22C55E15' : '#EF444415',
            border: `1px solid ${updateMsg.type === 'ok' ? '#22C55E30' : '#EF444430'}`,
            fontSize: 12,
            color: updateMsg.type === 'ok' ? 'var(--green)' : 'var(--red)',
            fontFamily: 'var(--sans)',
          }}>
            {updateMsg.type === 'ok' ? '✓ ' : '⚠ '}{updateMsg.text}
          </div>
        )}

        {/* Update instructions */}
        {versionInfo?.updateAvailable && (
          <div style={{ marginTop: 14, fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--dim)' }}>Alternative:</strong> Run manually in terminal:<br/>
            <code style={{ color: 'var(--accent)' }}>git pull origin main && npm install && npm run dev</code>
          </div>
        )}

        {/* Data safety notice */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
          🔒 <strong style={{ color: 'var(--dim)' }}>Data safety:</strong> All your tasks, clients, and settings are stored in the browser — they are never affected by code updates.
        </div>
      </div>

      {/* GitHub release notes (if available) */}
      {versionInfo?.releaseNotes && (
        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <div className="section-label mb-10">📋 Release Notes — v{versionInfo.latest}</div>
          <pre style={{ fontSize: 11, fontFamily: 'var(--sans)', color: 'var(--dim)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {versionInfo.releaseNotes}
          </pre>
        </div>
      )}

      {/* Local changelog */}
      <div className="section-label mb-12">Full Changelog</div>
      {LOCAL_CHANGELOG.map((release) => (
        <div key={release.version} className="card" style={{ marginBottom: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
              v{release.version}
            </span>
            <span style={{ fontSize: 12, fontFamily: 'var(--sans)', color: 'var(--dim)', fontWeight: 600 }}>
              {release.label}
            </span>
            <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)', marginLeft: 'auto' }}>
              {release.date}
            </span>
          </div>

          <div className="section-label mb-8" style={{ fontSize: 9 }}>New Features</div>
          <ul style={{ margin: '0 0 16px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {release.features.map((f, i) => (
              <li key={i} style={{ listStyle: 'none', fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--sans)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--accent)', marginRight: 8 }}>+</span>{f}
              </li>
            ))}
          </ul>

          <div className="section-label mb-8" style={{ fontSize: 9 }}>Technical</div>
          <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {release.technical.map((t, i) => (
              <li key={i} style={{ listStyle: 'none', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--accent3)', marginRight: 8 }}>·</span>{t}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
