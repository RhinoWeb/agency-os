import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Dot } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import EmptyState from '../components/ui/EmptyState.jsx';

const ICONS = ['🤖','✍️','🔍','📱','📧','🕷️','📊','🧠','⚙️','🎯','📈','🔔','💬','🛡️','🚀'];

// ── Agent Modal (Create / Edit) ─────────────────────────────────
function AgentModal({ agent, allTasks, onSave, onClose }) {
  const isEdit = !!agent;
  const [name,     setName]     = useState(agent?.name ?? '');
  const [icon,     setIcon]     = useState(agent?.icon ?? '🤖');
  const [schedule, setSchedule] = useState(agent?.schedule ?? '');
  const [queue,    setQueue]    = useState(agent?.queue ?? []);
  const [taskPick, setTaskPick] = useState('');
  const trapRef  = useFocusTrap();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const base = agent ?? {
      id: Date.now(),
      status: 'idle',
      tasks: 0,
      efficiency: 80,
      automations: 0,
      lastRun: 'Never',
      logs: [],
      weeklyData: [70,72,74,76,78,80,80],
    };
    onSave({ ...base, name: name.trim(), icon, schedule: schedule.trim() || 'On demand', queue });
  }

  function assignTask() {
    if (!taskPick) return;
    setQueue(q => [...q, taskPick]);
    setTaskPick('');
  }

  function removeQueueItem(i) {
    setQueue(q => q.filter((_, idx) => idx !== i));
  }

  // Tasks not already in this agent's queue
  const availableTasks = (allTasks ?? []).filter(t => !queue.includes(t.title));

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-modal-title"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      ref={trapRef}
    >
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <h2 id="agent-modal-title" className="modal-title">{isEdit ? 'Edit Agent' : 'New Agent'}</h2>
        <form onSubmit={handleSubmit} className="form-stack">

          {/* Icon picker */}
          <div className="form-label">Icon</div>
          <div className="flex-center" style={{ gap:4, flexWrap:'wrap' }}>
            {ICONS.map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                style={{
                  width:32, height:32, borderRadius:6, border:'1px solid',
                  borderColor: icon === ic ? C.accent : 'var(--border)',
                  background: icon === ic ? `${C.accent}18` : 'transparent',
                  fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                }}
                aria-label={`Select icon ${ic}`}
                aria-pressed={icon === ic}
              >{ic}</button>
            ))}
          </div>

          {/* Name */}
          <input
            ref={inputRef}
            className="input"
            placeholder="Agent name…"
            value={name}
            onChange={e => setName(e.target.value)}
            aria-label="Agent name"
            required
          />

          {/* Schedule */}
          <input
            className="input"
            placeholder="Schedule (e.g. Daily 9AM-5PM)…"
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            aria-label="Schedule"
          />

          {/* Task assignment */}
          <div className="form-label" style={{ marginTop:4 }}>Assign Tasks</div>
          <div className="flex-center gap-6">
            <select
              className="input"
              style={{ flex:1, fontSize:11 }}
              value={taskPick}
              onChange={e => setTaskPick(e.target.value)}
              aria-label="Pick a task to assign"
            >
              <option value="">Select task…</option>
              {availableTasks.map(t => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
            </select>
            <button type="button" className="btn btn--primary" style={{ fontSize:11, padding:'4px 10px' }} onClick={assignTask} disabled={!taskPick}>
              + Add
            </button>
          </div>

          {queue.length > 0 && (
            <div className="form-stack" style={{ gap:4, maxHeight:120, overflowY:'auto' }}>
              {queue.map((q, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--sans)', color:'var(--text)', padding:'4px 8px', background:'var(--surface)', borderRadius:4 }}>
                  <span style={{ color:C.accent3 }}>→</span>
                  <span style={{ flex:1 }}>{q}</span>
                  <button type="button" onClick={() => removeQueueItem(i)} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:13, lineHeight:1 }} aria-label={`Remove ${q}`}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="form-actions" style={{ marginTop:6 }}>
            <button type="button" className="btn btn--ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:1 }}>{isEdit ? 'Save Changes' : 'Create Agent'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation ─────────────────────────────────────────
function DeleteConfirm({ agent, onConfirm, onClose }) {
  const trapRef = useFocusTrap();
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="del-agent-title"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      ref={trapRef}
    >
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 340, textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:8 }}>{agent.icon}</div>
        <h2 id="del-agent-title" className="modal-title" style={{ marginBottom:6 }}>Delete {agent.name}?</h2>
        <p className="body-sm text-muted" style={{ lineHeight:1.5, marginBottom:16 }}>
          This will permanently remove the agent and its queue. This action cannot be undone.
        </p>
        <div className="form-actions">
          <button className="btn btn--ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn" style={{ flex:1, background:'rgba(248,113,113,0.1)', borderColor:'var(--red)', color:'var(--red)' }} onClick={() => onConfirm(agent.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function AgentFleet({ agents, setAgents, allTasks, toggleAgent }) {
  const [openId,     setOpenId]     = useState(null);
  const [modal,      setModal]      = useState(null);   // null | 'create' | agentObj (edit)
  const [delAgent,   setDelAgent]   = useState(null);   // agent to confirm delete

  function handleSave(agent) {
    setAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      if (exists) return prev.map(a => a.id === agent.id ? agent : a);
      return [...prev, agent];
    });
    setModal(null);
  }

  function handleDelete(id) {
    setAgents(prev => prev.filter(a => a.id !== id));
    setDelAgent(null);
    if (openId === id) setOpenId(null);
  }

  return (
    <section className="view view--wide" aria-labelledby="agents-title">
      <header className="view-header">
        <div>
          <h1 id="agents-title" className="view-title">Agent Fleet</h1>
          <p className="view-subtitle">Monitor, control, and optimize your AI workforce</p>
        </div>
        <button className="btn btn--primary" style={{ fontSize:11 }} onClick={() => setModal('create')}>+ New Agent</button>
      </header>

      {agents.length === 0 ? (
        <EmptyState
          icon="🤖"
          title="No agents yet"
          subtitle="Create AI agents to automate tasks across your agency"
          action="+ New Agent"
          onAction={() => setModal('create')}
        />
      ) : (
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
                    <div className="text-xs text-muted text-upper mb-6">7-Day Efficiency</div>
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
                      style={{ fontSize:11 }}
                      onClick={() => setModal(a)}
                      aria-label={`Edit ${a.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn--ghost"
                      style={{ fontSize:11 }}
                      onClick={() => setDelAgent(a)}
                      aria-label={`Delete ${a.name}`}
                    >
                      🗑️
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
                      {a.logs.length > 0
                        ? a.logs.map((l, i) => (
                            <div key={i} className="agent-log-item">
                              <span style={{ color:C.accent, fontSize:7 }}>●</span>{l}
                            </div>
                          ))
                        : <div style={{ fontSize:11, color:'var(--muted)' }}>No logs yet</div>
                      }
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {modal && modal !== 'create' && typeof modal === 'object' && (
        <AgentModal agent={modal} allTasks={allTasks} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {modal === 'create' && (
        <AgentModal agent={null} allTasks={allTasks} onSave={handleSave} onClose={() => setModal(null)} />
      )}
      {delAgent && (
        <DeleteConfirm agent={delAgent} onConfirm={handleDelete} onClose={() => setDelAgent(null)} />
      )}
    </section>
  );
}
