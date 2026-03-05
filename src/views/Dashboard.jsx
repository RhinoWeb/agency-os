import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dot, Badge, ProgressBar, ChartTooltip } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { revenueData, seedActivity, seedSchedule } from '../data.js';

const now = new Date();
const hr   = now.getHours();
const greeting = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening';
const dateStr  = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

export default function Dashboard({
  agents, columns, workflows, clients, allTasks, actAgents, mrr,
  clock, timer, fmtTimer, aiMsgs, setAiMsgs, setTab, setModal,
}) {
  const [aiInput, setAiInput] = useState('');

  const kpis = [
    { l: 'MRR',         v: `$${(mrr/1000).toFixed(1)}k`,                                 icon: '💰', c: C.accent,  s: '+8% MoM' },
    { l: 'Active Tasks', v: allTasks.length - columns.done.items.length,                  icon: '📋', c: C.accent3, s: `${columns.inProgress.items.length} in progress` },
    { l: 'Agents Live',  v: `${actAgents.length}/${agents.length}`,                       icon: '🤖', c: C.accent,  s: `${agents.reduce((s,a) => s+a.queue.length, 0)} queued` },
    { l: 'Done Today',   v: columns.done.items.length,                                    icon: '✅', c: C.green,   s: `${Math.round(columns.done.items.length / Math.max(1, allTasks.length) * 100)}% rate` },
    { l: 'Fleet Eff',    v: `${Math.round(agents.reduce((s,a) => s+a.efficiency,0)/agents.length)}%`, icon: '⚡', c: C.yellow, s: 'Avg across 6' },
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
      {/* Header */}
      <header className="view-header">
        <div>
          <div className="text-xs text-muted text-upper mb-4">
            COMMAND CENTER — {dateStr.toUpperCase()}
          </div>
          <h1 id="dash-title" style={{ fontSize: 30, fontFamily: 'var(--sans)', fontWeight: 700, marginBottom: 4 }}>
            Good {greeting} ☕
          </h1>
          <p className="view-subtitle">
            {actAgents.length} agents active&nbsp;·&nbsp;
            {allTasks.filter(t => t.due==='Today').length} due today&nbsp;·&nbsp;
            ${(mrr/1000).toFixed(1)}k MRR
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div
            style={{ fontSize:34, fontFamily:'var(--sans)', fontWeight:700, color:'var(--accent)', lineHeight:1, fontVariantNumeric:'tabular-nums' }}
            aria-live="off"
          >
            {clock}
          </div>
          {timer.on && (
            <div style={{ fontSize:12, color:'var(--accent2)', marginTop:4, fontFamily:'var(--mono)' }}
                 aria-live="polite" aria-label={`Timer: ${fmtTimer(timer.sec)}`}>
              ⏱ {fmtTimer(timer.sec)}
            </div>
          )}
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid-6 mb-20" role="list" aria-label="Key performance indicators">
        {kpis.map((m, i) => (
          <article key={i} className="card card--sm" role="listitem">
            <div className="flex-between mb-6">
              <span className="kpi-label">{m.l}</span>
              <span aria-hidden="true" style={{ fontSize:14 }}>{m.icon}</span>
            </div>
            <div className="kpi-value">{m.v}</div>
            <div className="kpi-sub" style={{ color: m.c }}>{m.s}</div>
          </article>
        ))}
      </div>

      {/* Charts + Schedule + Activity */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:14, marginBottom:18 }}>
        {/* Revenue Chart */}
        <article className="card" aria-label="Revenue trend chart">
          <div className="section-label" style={{ marginBottom:14 }}>Revenue Trend (6 months)</div>
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

        {/* Schedule */}
        <article className="card" style={{ padding:16 }} aria-label="Today's schedule">
          <div className="section-label">Schedule</div>
          <nav className="sched-mini" aria-label="Today's events">
            {seedSchedule.map((e, i) => {
              const h = parseInt(e.time);
              const past = h < hr;
              const cur  = h === hr;
              return (
                <div key={i} className="sched-mini-item"
                  style={{ background: cur ? `${C.accent}08` : 'transparent', opacity: past ? 0.3 : 1 }}>
                  <span className="sched-mini-time">{e.time}</span>
                  <span className="sched-mini-dot" style={{ background: e.cl }}/>
                  <span className="sched-mini-title">{e.title}</span>
                </div>
              );
            })}
          </nav>
        </article>

        {/* Activity Feed */}
        <article className="card" style={{ padding:16 }} aria-label="Recent activity">
          <div className="section-label">Activity Feed</div>
          <ul className="feed-list" style={{ listStyle:'none' }}>
            {seedActivity.slice(0, 7).map((a, i) => {
              const icon = { complete:'✅', start:'▶️', alert:'⚠️', error:'❌' }[a.type];
              return (
                <li key={i} className="feed-item">
                  <span className="feed-item__icon" aria-label={a.type}>{icon}</span>
                  <div>
                    <div className="feed-item__action">{a.action}</div>
                    <div className="feed-item__meta">{a.agent} · {a.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </div>

      {/* Bottom: Agents + Clients + Workflows */}
      <div className="grid-3 mb-18">
        {/* Agent Fleet */}
        <article className="card" style={{ padding:16 }} aria-labelledby="dash-agents">
          <div id="dash-agents" className="section-label">Agent Fleet</div>
          {agents.map(a => (
            <button key={a.id}
              className="dash-row-item"
              style={{ width:'100%', textAlign:'left', border:'1px solid var(--border)', borderRadius:6, cursor:'pointer' }}
              onClick={() => setTab('agents')}
              aria-label={`${a.name}: ${a.status}, efficiency ${a.efficiency}%`}
            >
              <span style={{ fontSize:16 }} aria-hidden="true">{a.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600 }}>{a.name}</div>
                <div style={{ fontSize:9, color:'var(--muted)' }}>{a.queue.length} queue · {a.lastRun}</div>
              </div>
              <Dot status={a.status}/>
              <span style={{ fontSize:10, fontFamily:'var(--mono)', color: a.efficiency>=90 ? C.accent : C.accent2 }}>{a.efficiency}%</span>
            </button>
          ))}
        </article>

        {/* Client Health */}
        <article className="card" style={{ padding:16 }} aria-labelledby="dash-clients">
          <div id="dash-clients" className="section-label">Client Health</div>
          {clients.filter(c => c.status==='active').map(c => (
            <button key={c.id}
              className="dash-row-item"
              style={{ width:'100%', textAlign:'left', border:'1px solid var(--border)', borderRadius:6 }}
              onClick={() => setTab('clients')}
              aria-label={`${c.name}: health ${c.health}%, $${(c.mrr/1000).toFixed(1)}k MRR`}
            >
              <span style={{ width:8, height:8, borderRadius:'50%', background:c.color, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600 }}>{c.name}</div>
                <div style={{ fontSize:9, color:'var(--muted)' }}>${(c.mrr/1000).toFixed(1)}k/mo · {c.services.length} services</div>
              </div>
              <span style={{ fontSize:10, fontFamily:'var(--mono)', color: c.health>=90 ? C.accent : c.health>=80 ? C.yellow : C.red }}>
                {c.health}%
              </span>
            </button>
          ))}
        </article>

        {/* Workflows */}
        <article className="card" style={{ padding:16 }} aria-labelledby="dash-wf">
          <div id="dash-wf" className="section-label">Workflows</div>
          {workflows.map(w => (
            <div key={w.id} className="dash-row-item" style={{ border:'1px solid var(--border)', borderRadius:6 }}>
              <Dot status={w.status}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600 }}>⚡ {w.name}</div>
                <div style={{ fontSize:9, color:'var(--muted)' }}>{w.trigger} · {w.runs} runs</div>
              </div>
              <Badge label={`${w.successRate}%`} color={w.successRate>=95 ? C.accent : C.yellow}/>
            </div>
          ))}
        </article>
      </div>

      {/* Quick AI bar */}
      <div className="dash-ai-bar" role="search" aria-label="Quick AI query">
        <input
          className="input"
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendQuickAi()}
          placeholder='Ask AI: "What should I focus on?" · "Business snapshot" · "Automate more"'
          aria-label="Quick AI question"
          style={{ flex:1, background:'var(--surface)' }}
        />
        <button className="btn btn--primary" onClick={sendQuickAi} aria-label="Send question to AI">
          Ask AI →
        </button>
      </div>
    </section>
  );
}
