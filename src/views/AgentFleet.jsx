import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Dot } from '../components/ui/index.jsx';
import { C } from '../theme.js';

export default function AgentFleet({ agents, toggleAgent }) {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="view view--wide" aria-labelledby="agents-title">
      <header style={{ marginBottom: 18 }}>
        <h1 id="agents-title" className="view-title">Agent Fleet</h1>
        <p className="view-subtitle">Monitor, control, and optimize your AI workforce</p>
      </header>

      <div className="grid-agents">
        {agents.map(a => {
          const open      = openId === a.id;
          const accentCol = a.status === 'active' ? C.accent : a.status === 'idle' ? C.yellow : C.accent2;

          return (
            <article
              key={a.id}
              className="agent-card"
              style={{ borderLeftColor: accentCol }}
              aria-label={`${a.name} agent, ${a.status}`}
            >
              <div className="agent-card__body">
                {/* Header */}
                <div className="agent-card__head">
                  <div className="agent-icon" aria-hidden="true">{a.icon}</div>
                  <div style={{ flex:1 }}>
                    <div className="agent-name">{a.name}</div>
                    <div className="agent-meta">
                      <Dot status={a.status}/>
                      {a.status.toUpperCase()} · {a.automations} automations
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="sparkline-wrap" aria-hidden="true">
                  <div className="text-xs text-muted text-upper" style={{ marginBottom:6 }}>7-Day Efficiency</div>
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={a.weeklyData.map((v,i) => ({ d:['M','T','W','T','F','S','S'][i], v }))}>
                      <Line type="monotone" dataKey="v" stroke={a.efficiency>=90 ? C.accent : C.yellow} strokeWidth={2} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Stats */}
                <div className="agent-stats" aria-label="Agent statistics">
                  {[
                    { l:'Tasks',  v: a.tasks },
                    { l:'Eff',    v: `${a.efficiency}%` },
                    { l:'Queue',  v: a.queue.length },
                    { l:'Runs',   v: a.automations },
                  ].map((s, i) => (
                    <div key={i} className="agent-stat">
                      <div className="agent-stat__val"
                        style={{ color: i===1 ? (a.efficiency>=90 ? C.accent : C.accent2) : 'var(--text)' }}>
                        {s.v}
                      </div>
                      <div className="agent-stat__lbl">{s.l}</div>
                    </div>
                  ))}
                </div>

                {/* Schedule */}
                <div className="agent-schedule">
                  <span aria-hidden="true">⏰</span>
                  <span>{a.schedule}</span>
                </div>

                {/* Actions */}
                <div className="agent-actions">
                  <button
                    className="btn"
                    style={{
                      flex: 1,
                      background:   a.status==='active' ? `${C.accent2}15` : `${C.accent}15`,
                      borderColor:  a.status==='active' ? C.accent2 : C.accent,
                      color:        a.status==='active' ? C.accent2 : C.accent,
                    }}
                    onClick={() => toggleAgent(a.id)}
                    aria-label={a.status==='active' ? `Pause ${a.name}` : `Activate ${a.name}`}
                    aria-pressed={a.status==='active'}
                  >
                    {a.status==='active' ? '⏸ Pause' : '▶ Activate'}
                  </button>
                  <button
                    className="btn btn--ghost"
                    onClick={() => setOpenId(open ? null : a.id)}
                    aria-expanded={open}
                    aria-controls={`agent-details-${a.id}`}
                    aria-label={open ? 'Collapse details' : 'Expand details'}
                  >
                    {open ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {open && (
                <div id={`agent-details-${a.id}`} className="agent-expand">
                  <div className="mb-10">
                    <div className="section-label mb-6">Queue</div>
                    {a.queue.length > 0
                      ? a.queue.map((q, i) => (
                          <div key={i} className="agent-queue-item">
                            <span style={{ color:C.accent3, marginRight:6 }}>→</span>{q}
                          </div>
                        ))
                      : <div style={{ fontSize:11, color:'var(--muted)' }}>Queue is empty</div>
                    }
                  </div>
                  <div>
                    <div className="section-label mb-6">Recent Logs</div>
                    {a.logs.map((l, i) => (
                      <div key={i} className="agent-log-item">
                        <span style={{ color:C.accent, fontSize:7 }}>●</span>{l}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
