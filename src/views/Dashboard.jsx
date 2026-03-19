import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dot, Badge, ProgressBar, ChartTooltip } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { revenueData } from '../data.js';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Dashboard({
  agents, columns, setColumns, workflows, clients, setClients, allTasks, actAgents, mrr,
  clock, timer, fmtTimer, aiMsgs, setAiMsgs, setTab, setModal,
  leads, setLeads, notifs, setNotifs,
  lastBriefing, autopilotRunning, runAutopilot,
  weeklyReport, weeklyRunning, runWeeklyReport,
  settings, profile, schedule,
}) {
  const now = new Date();
  const hr   = now.getHours();
  const greeting = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening';
  const dateStr  = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  const [aiInput, setAiInput] = useState('');
  const [chkDismissed,    setChkDismissed]    = useState(() => localStorage.getItem('aos-checklist-dismissed') === '1');
  const [nudgeDismissed,  setNudgeDismissed]  = useState(() => localStorage.getItem('aos-nudge-dismissed') === '1');

  function dismissChecklist() { localStorage.setItem('aos-checklist-dismissed', '1'); setChkDismissed(true); }
  function dismissNudge()     { localStorage.setItem('aos-nudge-dismissed', '1');     setNudgeDismissed(true); }

  // ── Setup checklist items (computed from live state) ──────────
  const checklistItems = useMemo(() => [
    {
      id:    'ai',
      label: 'Connect an AI provider',
      done:  Object.values(settings?.apiKeys ?? {}).some(k => k?.trim()),
      tab:   'settings',
    },
    {
      id:    'profile',
      label: 'Complete your profile',
      done:  !!(profile?.email?.trim()),
      tab:   'profile',
    },
    {
      id:    'client',
      label: 'Add your first client',
      done:  clients.filter(c => c.status === 'active').length > 0,
      tab:   'clients',
    },
    {
      id:    'task',
      label: 'Create your first task',
      done:  allTasks.length > 0,
      action: () => setModal({ type:'newTask' }),
    },
    {
      id:    'autopilot',
      label: 'Run an autopilot briefing',
      done:  !!lastBriefing,
      action: runAutopilot,
    },
    {
      id:    'leads',
      label: 'Import or scrape leads',
      done:  (leads ?? []).length > 0,
      tab:   'leads',
    },
  ], [settings, profile, clients, allTasks, leads, lastBriefing]); // eslint-disable-line react-hooks/exhaustive-deps

  const doneCount  = checklistItems.filter(i => i.done).length;
  const allDone    = doneCount === checklistItems.length;
  const showNudge  = !nudgeDismissed && !profile?.email?.trim();
  const showChk    = !chkDismissed && !allDone;

  // ── Smart automation derived data ───────────────────────────
  const hotLeads      = useMemo(() => (leads ?? []).filter(l => l.leadScore >= 80 && l.replyStatus === 'positive'), [leads]);
  const atRiskClients = useMemo(() => clients.filter(c => c.status === 'active' && (c.health ?? 100) < 75), [clients]);

  function graduateLead(lead) {
    setClients(p => [...p, {
      id:          `c-${crypto.randomUUID()}`,
      name:        lead.company || lead.name,
      clientType:  'brand',
      status:      'active',
      mrr:         0,
      health:      80,
      contact:     lead.name,
      email:       lead.email,
      since:       new Date().toISOString().split('T')[0],
      services:    [],
      nextMeeting: '—',
      notes:       lead.notes ?? '',
      color:       C.accent,
    }]);
    setLeads(p => p.filter(l => l.id !== lead.id));
    setColumns(p => ({
      ...p,
      backlog: {
        ...p.backlog,
        items: [...p.backlog.items, {
          id:       `t-${crypto.randomUUID()}`,
          title:    `Onboard new client: ${lead.company || lead.name}`,
          priority: 'high',
          agent:    'Unassigned',
          due:      'This week',
          tags:     ['onboarding'],
          subtasks: [],
          notes:    `Graduated from lead pipeline. Contact: ${lead.email}`,
          time:     0,
        }],
      },
    }));
    setNotifs(p => [{ id: `grad-${crypto.randomUUID()}`, read: false, time: 'Just now', text: `🚀 ${lead.name} graduated to active client!` }, ...p]);
  }

  const pipelineClients = clients.filter(c => c.status === 'pipeline');
  const FUNNEL_STAGES   = ['outreach','replied','call','proposal','closed'];
  const FUNNEL_LABELS   = { outreach:'Outreach', replied:'Replied', call:'Call Booked', proposal:'Proposal', closed:'Closed' };
  const FUNNEL_COLORS   = { outreach:C.muted, replied:C.accent5, call:C.yellow, proposal:C.accent3, closed:C.accent };
  const stageCounts     = FUNNEL_STAGES.map(s => ({
    s, label: FUNNEL_LABELS[s], color: FUNNEL_COLORS[s],
    count: pipelineClients.filter(c => c.outreachStage === s).length,
  }));
  const pipelineTotal   = pipelineClients.length || 1;
  const creatorClients  = clients.filter(c => c.clientType === 'creator' && c.status === 'active');
  const creatorMrr      = creatorClients.reduce((s, c) => s + (c.mrr || 0), 0);

  const kpis = [
    { l: 'MRR',         v: `$${(mrr/1000).toFixed(1)}k`,                                 icon: '💰', c: C.accent,  s: '+8% MoM' },
    { l: 'Active Tasks', v: allTasks.length - (columns.done?.items?.length ?? 0),         icon: '📋', c: C.accent3, s: `${columns.inProgress?.items?.length ?? 0} in progress` },
    { l: 'Agents Live',  v: `${actAgents.length}/${agents.length}`,                       icon: '🤖', c: C.accent,  s: `${agents.reduce((s,a) => s+(a.queue?.length ?? 0), 0)} queued` },
    { l: 'Done Today',   v: columns.done?.items?.length ?? 0,                             icon: '✅', c: C.green,   s: `${Math.round((columns.done?.items?.length ?? 0) / Math.max(1, allTasks.length) * 100)}% rate` },
    { l: 'Fleet Eff',    v: `${agents.length ? Math.round(agents.reduce((s,a) => s+a.efficiency,0)/agents.length) : 0}%`, icon: '⚡', c: C.yellow, s: 'Avg across 6' },
    { l: 'Clients',      v: clients.filter(c => c.status==='active').length,              icon: '🏢', c: C.accent4, s: `${clients.filter(c=>c.status==='pipeline').length} pipeline` },
  ];

  function sendQuickAi() {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput('');
    setAiMsgs(p => [...p, { role: 'user', text: msg }]);
    setTab('ai');
  }

  return (
    <section className="view" aria-labelledby="dash-title">

      {/* ── Profile nudge ──────────────────────────────────────── */}
      {showNudge && (
        <div className="dash-nudge">
          <span className="dash-nudge__text">
            👤 Complete your profile — add your email and avatar so your workspace feels personal.
          </span>
          <div className="dash-nudge__actions">
            <button className="btn btn--sm" onClick={() => setTab('profile')}>
              Go to Profile →
            </button>
            <button className="dash-dismiss" onClick={dismissNudge} aria-label="Dismiss">×</button>
          </div>
        </div>
      )}

      {/* ── Setup checklist ────────────────────────────────────── */}
      {showChk && (
        <div className="card dash-checklist">
          <div className="dash-checklist__header">
            <div className="dash-checklist__title">
              <strong>🚀 Get started</strong>
              <span className="dash-checklist__counter">
                {doneCount}/{checklistItems.length} complete
              </span>
            </div>
            <button className="dash-dismiss" onClick={dismissChecklist} aria-label="Dismiss checklist">×</button>
          </div>

          <div className="dash-checklist__progress">
            <div
              className="dash-checklist__progress-fill"
              style={{ width: `${(doneCount / checklistItems.length) * 100}%` }}
            />
          </div>

          <div className="dash-checklist__grid">
            {checklistItems.map(item => (
              <div
                key={item.id}
                className={`dash-checklist__item${item.done ? ' dash-checklist__item--done' : ''}`}
                onClick={() => {
                  if (item.done) return;
                  if (item.action) item.action();
                  else if (item.tab) setTab(item.tab);
                }}
              >
                <span className="dash-checklist__check">
                  {item.done ? '✓' : ''}
                </span>
                <span className="dash-checklist__label">{item.label}</span>
                {!item.done && <span className="dash-checklist__arrow">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="view-header">
        <div>
          <div className="text-xs text-muted text-upper mb-4">
            COMMAND CENTER — {dateStr.toUpperCase()}
          </div>
          <h1 id="dash-title" className="heading-xl">
            Good {greeting} ☕
          </h1>
          <p className="view-subtitle">
            {actAgents.length} agents active&nbsp;·&nbsp;
            {allTasks.filter(t => t.due==='Today').length} due today&nbsp;·&nbsp;
            ${(mrr/1000).toFixed(1)}k MRR
          </p>
        </div>
        <div className="dash-header-right">
          <div className="dash-clock" aria-live="off">{clock}</div>
          {timer.on && (
            <div className="dash-timer" aria-live="polite" aria-label={`Timer: ${fmtTimer(timer.sec)}`}>
              ⏱ {fmtTimer(timer.sec)}
            </div>
          )}
        </div>
      </header>

      {clients.length === 0 && allTasks.length === 0 && (
        <EmptyState icon="◈" title="Your command center is empty" subtitle="Add your first client or create a task to get started" action="Add Client" onAction={() => setTab('clients')} />
      )}

      {/* Autopilot Briefing */}
      {lastBriefing ? (
        <article className="card dash-briefing mb-18" aria-label="Autopilot morning briefing">
          <div className="flex-between mb-10">
            <div className="flex-center gap-2">
              <span aria-hidden="true">🤖</span>
              <span className="section-label" style={{ margin: 0 }}>AUTOPILOT BRIEFING</span>
              <span className="dash-briefing__meta">
                {lastBriefing.ranAt
                  ? `Last run ${new Date(lastBriefing.ranAt).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}`
                  : ''}
              </span>
            </div>
            <div className="flex-center gap-2">
              <span className="dash-briefing__meta">Scheduled 7:00 AM</span>
              <button className="btn btn--sm btn--ghost" onClick={runAutopilot} disabled={autopilotRunning}>
                {autopilotRunning ? '⏳ Running…' : '▶ Run Now'}
              </button>
            </div>
          </div>
          <p className="dash-briefing__body">{lastBriefing.briefing}</p>
          {lastBriefing.topActions?.length > 0 && (
            <div className="dash-pills" style={{ marginBottom: lastBriefing.flagged?.length ? 10 : 0 }}>
              {lastBriefing.topActions.map((a, i) => (
                <span key={i} className="dash-pill dash-pill--accent">{i + 1}. {a}</span>
              ))}
            </div>
          )}
          {lastBriefing.flagged?.length > 0 && (
            <div className="dash-pills" style={{ marginTop: 8 }}>
              {lastBriefing.flagged.map((f, i) => (
                <span key={i} className="dash-pill dash-pill--warning">⚠ {f.name}: {f.reason}</span>
              ))}
            </div>
          )}
        </article>
      ) : (
        <article className="card dash-briefing--empty mb-18" aria-label="Autopilot not yet run">
          <div className="flex-between">
            <div className="flex-center gap-2">
              <span aria-hidden="true">🤖</span>
              <span className="section-label" style={{ margin: 0 }}>AUTOPILOT</span>
              <span className="dash-briefing__meta">Runs daily at 7:00 AM · Not yet run today</span>
            </div>
            <button className="btn btn--sm btn--ghost" onClick={runAutopilot} disabled={autopilotRunning}>
              {autopilotRunning ? '⏳ Running…' : '▶ Run Briefing Now'}
            </button>
          </div>
        </article>
      )}

      {/* Smart Alerts — Ready to Graduate + At-Risk Clients */}
      {(hotLeads.length > 0 || atRiskClients.length > 0) && (
        <div className={`dash-alert-grid${hotLeads.length && atRiskClients.length ? ' dash-alert-grid--two' : ''}`}>
          {hotLeads.length > 0 && (
            <article className="card dash-alert-card--success" aria-label="Leads ready to graduate">
              <div className="flex-between mb-10">
                <span className="section-label" style={{ margin: 0 }}>🚀 READY TO GRADUATE</span>
                <span className="dash-briefing__meta" style={{ color: C.accent }}>{hotLeads.length} lead{hotLeads.length !== 1 ? 's' : ''} · score ≥80 + positive reply</span>
              </div>
              {hotLeads.map(lead => (
                <div key={lead.id} className="dash-row-item dash-alert-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="body-sm fw-600">{lead.name}</div>
                    <div className="dash-briefing__meta">{lead.company} · score {lead.leadScore}</div>
                  </div>
                  <button className="btn btn--xs btn--primary" onClick={() => graduateLead(lead)}>
                    → Graduate
                  </button>
                </div>
              ))}
            </article>
          )}
          {atRiskClients.length > 0 && (
            <article className="card dash-alert-card--warning" aria-label="At-risk clients">
              <div className="flex-between mb-10">
                <span className="section-label" style={{ margin: 0 }}>⚠ AT-RISK CLIENTS</span>
                <span className="dash-briefing__meta" style={{ color: C.yellow }}>{atRiskClients.length} below 75% health</span>
              </div>
              {atRiskClients.map(client => (
                <div key={client.id} className="dash-row-item dash-alert-row dash-alert-row--warning">
                  <span className="dash-color-dot" style={{ background: client.color ?? C.accent2 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="body-sm fw-600">{client.name}</div>
                    <div className="dash-briefing__meta">Health {client.health}% · ${(client.mrr/1000).toFixed(1)}k MRR</div>
                  </div>
                  <button className="btn btn--xs btn--warning" onClick={() => setTab('clients')}>View</button>
                </div>
              ))}
            </article>
          )}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid-6 mb-20" role="list" aria-label="Key performance indicators">
        {kpis.map((m, i) => (
          <article key={i} className="card card--sm" role="listitem">
            <div className="flex-between mb-6">
              <span className="kpi-label">{m.l}</span>
              <span aria-hidden="true">{m.icon}</span>
            </div>
            <div className="kpi-value">{m.v}</div>
            <div className="kpi-sub" style={{ color: m.c }}>{m.s}</div>
          </article>
        ))}
      </div>

      {/* Lead-to-Meeting Pipeline Funnel */}
      {leads && leads.length > 0 && (() => {
        const now = new Date();
        const thisMonth = leads.filter(l => {
          const d = new Date(l.addedOn ?? l.since);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const totalLeads = thisMonth.length;
        const enrolled = leads.filter(l => l.campaignId).length;
        const replied = leads.filter(l => l.replyStatus && l.replyStatus !== 'none').length;
        const positive = leads.filter(l => l.replyStatus === 'positive' || l.replyClassification?.intent === 'POSITIVE').length;
        const booked = leads.filter(l => l.bookedMeeting).length;
        const bookedThisMonth = leads.filter(l => {
          if (!l.bookedMeeting?.scheduledAt) return false;
          const d = new Date(l.bookedMeeting.scheduledAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const TARGET_MIN = 30, TARGET_MAX = 50;
        const pct = Math.min(100, Math.round(bookedThisMonth / TARGET_MIN * 100));
        const stages = [
          { label: 'Leads Sourced', v: totalLeads, c: C.muted },
          { label: 'Enrolled', v: enrolled, c: C.accent3 },
          { label: 'Replies', v: replied, c: C.yellow },
          { label: 'Positive', v: positive, c: C.green },
          { label: 'Booked', v: booked, c: C.accent },
        ];
        return (
          <article className="card mb-18" style={{ borderColor: `${C.accent}25` }}>
            <div className="flex-between mb-12">
              <div className="section-label" style={{ margin: 0 }}>Lead-to-Meeting Pipeline</div>
              <span className="mono-sm" style={{ color: pct >= 100 ? C.green : pct >= 60 ? C.yellow : C.red }}>
                {bookedThisMonth}/{TARGET_MIN}–{TARGET_MAX} calls · {pct}%
              </span>
            </div>
            {/* Funnel bars */}
            <div className="dash-funnel" style={{ gridTemplateColumns: `repeat(${stages.length}, 1fr)` }}>
              {stages.map((s, i) => (
                <div key={i} className="dash-funnel__stage">
                  <div className="dash-funnel__value" style={{ color: s.c }}>{s.v}</div>
                  <div className="dash-funnel__label">{s.label}</div>
                  {i < stages.length - 1 && stages[i].v > 0 && (
                    <div className="dash-funnel__rate">{stages[i+1].v > 0 ? `${Math.round(stages[i+1].v / stages[i].v * 100)}%` : '—'}</div>
                  )}
                </div>
              ))}
            </div>
            {/* Goal progress bar */}
            <div className="dash-goal">
              <span className="dash-goal__label">MONTHLY GOAL</span>
              <div className="dash-goal__track">
                <div className="dash-goal__fill" style={{ width: `${pct}%`, background: pct >= 100 ? C.green : `linear-gradient(90deg, ${C.accent3}, ${C.accent})` }} />
              </div>
              <span className="dash-goal__value" style={{ color: pct >= 100 ? C.green : C.accent }}>{bookedThisMonth}</span>
            </div>
          </article>
        );
      })()}

      {/* Campaign & Creator Pipeline Widget */}
      <article className="card mb-18" aria-label="Campaign and creator pipeline">
        <div className="flex-between mb-14">
          <div className="section-label">Campaign & Creator Pipeline</div>
          <span className="text-xs text-muted">{pipelineClients.length} active prospect{pipelineClients.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="dash-pipeline">
          {/* Outreach funnel */}
          <div>
            <div className="dash-subsection-label">Outreach Funnel</div>
            <div className="dash-bar-group">
              {stageCounts.map(({ s, label, count, color }) => (
                <div key={s}>
                  <div className="dash-bar-row__header">
                    <span className="dash-bar-row__label">{label}</span>
                    <span className="dash-bar-row__value" style={{ color }}>{count}</span>
                  </div>
                  <div className="dash-bar-track">
                    <div className="dash-bar-fill" style={{ width: `${(count / pipelineTotal) * 100}%`, background: color }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Creator KPIs */}
          <div>
            <div className="dash-subsection-label">Creator / KOL Stats</div>
            <div className="dash-mini-kpis">
              {[
                { l:'Active KOLs',     v: creatorClients.length,                              c:'#EC4899' },
                { l:'Creator MRR',     v: `$${(creatorMrr/1000).toFixed(1)}k`,                c:'#EC4899' },
                { l:'Pipeline Leads',  v: pipelineClients.length,                             c: C.accent5 },
                { l:'Est. Close MRR',  v: `~$${((pipelineClients.reduce((s,c)=>s+(c.mrr||0),0))/1000).toFixed(1)}k`, c: C.accent5 },
              ].map((m, i) => (
                <div key={i} className="dash-mini-kpi">
                  <div className="dash-mini-kpi__value" style={{ color: m.c }}>{m.v}</div>
                  <div className="dash-mini-kpi__label">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Charts + Schedule + Activity */}
      <div className="dash-charts-grid">
        {/* Revenue Chart */}
        <article className="card" aria-label="Revenue trend chart">
          <div className="section-label mb-14">Revenue Trend (6 months)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent}  stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.accent}  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent3} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.accent3} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="revenue" stroke={C.accent}  fill="url(#gr)" strokeWidth={2} name="Revenue"/>
              <Area type="monotone" dataKey="profit"  stroke={C.accent3} fill="url(#gp)" strokeWidth={2} name="Profit"/>
            </AreaChart>
          </ResponsiveContainer>
        </article>

        {/* Schedule — live from schedule state */}
        <article className="card" aria-label="Today's schedule">
          <div className="flex-between" style={{ marginBottom: 10 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Schedule</div>
            <button
              className="btn btn--xs btn--ghost"
              onClick={() => setTab('schedule')}
              style={{ fontSize: 10, fontFamily: 'var(--mono)' }}
            >
              View all →
            </button>
          </div>
          <nav className="sched-mini" aria-label="Today's events">
            {(schedule ?? []).slice(0, 8).map((e, i) => {
              const h = parseInt(e.time);
              const past = h < hr;
              const cur  = h === hr;
              return (
                <div key={e.id ?? i} className="sched-mini-item"
                  style={{ background: cur ? `${C.accent}08` : 'transparent', opacity: past ? 0.3 : 1 }}>
                  <span className="sched-mini-time">{e.time}</span>
                  <span className="sched-mini-dot" style={{ background: e.cl ?? e.color ?? C.muted }}/>
                  <span className="sched-mini-title">{e.title}</span>
                </div>
              );
            })}
            {(schedule ?? []).length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--muted)', padding: '12px 0', textAlign: 'center' }}>
                No events scheduled · <button className="btn btn--xs" style={{ display:'inline', padding:'0 6px', fontSize:10 }} onClick={() => setTab('schedule')}>Add one</button>
              </div>
            )}
          </nav>
        </article>

        {/* Activity Feed — live from notifications */}
        <article className="card" aria-label="Recent activity">
          <div className="section-label">Activity Feed</div>
          <ul className="feed-list">
            {(notifs ?? []).slice(0, 7).map((n, i) => {
              const icon = { success:'✅', info:'ℹ️', warning:'⚠️', error:'❌' }[n.type] ?? 'ℹ️';
              const timeLabel = n.timestamp
                ? (() => { const m = Math.floor((Date.now() - new Date(n.timestamp).getTime()) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : `${Math.floor(m/60)}h ago`; })()
                : (n.time ? `${n.time} ago` : '');
              return (
                <li key={n.id ?? i} className="feed-item" style={{ opacity: n.read ? 0.55 : 1 }}>
                  <span className="feed-item__icon" aria-label={n.type}>{icon}</span>
                  <div>
                    <div className="feed-item__action">{n.text}</div>
                    <div className="feed-item__meta">{timeLabel}</div>
                  </div>
                </li>
              );
            })}
            {(notifs ?? []).length === 0 && (
              <li style={{ fontSize: 11, color: 'var(--muted)', padding: '12px 0', listStyle: 'none', textAlign: 'center' }}>
                No recent activity
              </li>
            )}
          </ul>
        </article>
      </div>

      {/* Bottom: Agents + Clients + Workflows */}
      <div className="grid-3 mb-18">
        {/* Agent Fleet */}
        <article className="card" aria-labelledby="dash-agents">
          <div id="dash-agents" className="section-label">Agent Fleet</div>
          {agents.map(a => (
            <button key={a.id}
              className="dash-row-item"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={() => setTab('agents')}
              aria-label={`${a.name}: ${a.status}, efficiency ${a.efficiency}%`}
            >
              <span aria-hidden="true">{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="body-sm fw-600">{a.name}</div>
                <div className="dash-briefing__meta">{a.queue.length} queue · {a.lastRun}</div>
              </div>
              <Dot status={a.status}/>
              <span className="mono-sm" style={{ color: a.efficiency >= 90 ? C.accent : C.accent2 }}>{a.efficiency}%</span>
            </button>
          ))}
        </article>

        {/* Client Health */}
        <article className="card" aria-labelledby="dash-clients">
          <div id="dash-clients" className="section-label">Client Health</div>
          {clients.filter(c => c.status==='active').map(c => (
            <button key={c.id}
              className="dash-row-item"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={() => setTab('clients')}
              aria-label={`${c.name}: health ${c.health}%, $${(c.mrr/1000).toFixed(1)}k MRR`}
            >
              <span className="dash-color-dot" style={{ background: c.color }}/>
              <div style={{ flex: 1 }}>
                <div className="body-sm fw-600">{c.name}</div>
                <div className="dash-briefing__meta">${(c.mrr/1000).toFixed(1)}k/mo · {c.services.length} services</div>
              </div>
              <span className="mono-sm" style={{ color: c.health >= 90 ? C.accent : c.health >= 80 ? C.yellow : C.red }}>
                {c.health}%
              </span>
            </button>
          ))}
        </article>

        {/* Workflows */}
        <article className="card" aria-labelledby="dash-wf">
          <div id="dash-wf" className="section-label">Workflows</div>
          {workflows.map(w => (
            <div key={w.id} className="dash-row-item">
              <Dot status={w.status}/>
              <div style={{ flex: 1 }}>
                <div className="body-sm fw-600">⚡ {w.name}</div>
                <div className="dash-briefing__meta">{w.trigger} · {w.runs} runs</div>
              </div>
              <Badge label={`${w.successRate}%`} color={w.successRate>=95 ? C.accent : C.yellow}/>
            </div>
          ))}
        </article>
      </div>

      {/* Weekly Report */}
      <article className={`card mb-18${weeklyReport ? ' dash-report--active' : ' dash-report--empty'}`} aria-label="Weekly agency report">
        <div className="flex-between mb-10">
          <div className="flex-center gap-2">
            <span aria-hidden="true">📊</span>
            <span className="section-label" style={{ margin: 0 }}>WEEKLY REPORT</span>
            {weeklyReport?.ranAt && (
              <span className="dash-briefing__meta">
                {new Date(weeklyReport.ranAt).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
              </span>
            )}
          </div>
          <div className="flex-center gap-2">
            <span className="dash-briefing__meta">Every Monday 8:00 AM</span>
            <button className="btn btn--sm btn--ghost" onClick={runWeeklyReport} disabled={weeklyRunning}>
              {weeklyRunning ? '⏳ Running…' : '▶ Run Now'}
            </button>
          </div>
        </div>
        {weeklyReport ? (
          <>
            <p className="dash-report__headline">{weeklyReport.headline}</p>
            <div className="dash-report__grid">
              {weeklyReport.topWins?.length > 0 && (
                <div>
                  <div className="dash-subsection-label" style={{ color: C.accent }}>Top Wins</div>
                  {weeklyReport.topWins.map((w, i) => (
                    <div key={i} className="dash-report__list-item">
                      <span className="dash-report__list-num" style={{ color: C.accent }}>{i+1}.</span>{w}
                    </div>
                  ))}
                </div>
              )}
              {weeklyReport.nextWeekPriorities?.length > 0 && (
                <div>
                  <div className="dash-subsection-label" style={{ color: C.accent3 }}>Next Week</div>
                  {weeklyReport.nextWeekPriorities.map((p, i) => (
                    <div key={i} className="dash-report__list-item">
                      <span className="dash-report__list-num" style={{ color: C.accent3 }}>{i+1}.</span>{p}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {weeklyReport.risks?.length > 0 && (
              <div className="dash-pills" style={{ marginBottom: weeklyReport.recommendation ? 10 : 0 }}>
                {weeklyReport.risks.map((r, i) => (
                  <span key={i} className="dash-pill dash-pill--warning">⚠ {r}</span>
                ))}
              </div>
            )}
            {weeklyReport.recommendation && (
              <div className="dash-report__reco">💡 {weeklyReport.recommendation}</div>
            )}
          </>
        ) : (
          <div className="dash-report__empty">
            No report yet · runs every Monday at 8:00 AM or click "Run Now"
          </div>
        )}
      </article>

      {/* Quick AI bar */}
      <div className="dash-ai-bar" role="search" aria-label="Quick AI query">
        <input
          className="input"
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendQuickAi()}
          placeholder='Ask AI: "What should I focus on?" · "Business snapshot" · "Automate more"'
          aria-label="Quick AI question"
        />
        <button className="btn btn--primary" onClick={sendQuickAi} aria-label="Send question to AI">
          Ask AI →
        </button>
      </div>
    </section>
  );
}
