import { useState, useEffect, useRef } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

const PRESET_COLORS  = ['#7C6AFF','#9B8AFF','#5B4CD9','#B0A4FF','#34D399','#FBBF24','#F87171','#38BDF8'];
const STAGE_OPTIONS  = ['outreach','replied','call','proposal','closed'];
const TYPE_OPTIONS   = [{ v:'brand',label:'Brand' },{ v:'saas',label:'SaaS' },{ v:'creator',label:'Creator / KOL' },{ v:'retreat',label:'Retreat' }];
const INTERACT_TYPES = [
  { v:'call',    label:'📞 Call',    color:C.accent  },
  { v:'email',   label:'📧 Email',   color:C.accent4 },
  { v:'meeting', label:'🤝 Meeting', color:C.accent3 },
  { v:'note',    label:'📝 Note',    color:C.muted   },
];

const CLIENT_TYPE_COLORS = { brand:C.accent4, saas:C.accent3, creator:'#EC4899', retreat:C.accent5 };
const OUTREACH_STAGES    = ['outreach','replied','call','proposal','closed'];
const STAGE_LABELS       = { outreach:'Outreach', replied:'Replied', call:'Call Booked', proposal:'Proposal Sent', closed:'Closed' };

// ── Helpers ──────────────────────────────────────────────────────
function TypeBadge({ type }) {
  if (!type) return null;
  const labels = { brand:'Brand', saas:'SaaS', creator:'Creator / KOL', retreat:'Retreat' };
  return (
    <span style={{
      fontSize:9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1,
      padding:'2px 7px', borderRadius:20,
      background:`${CLIENT_TYPE_COLORS[type] ?? C.muted}20`,
      color: CLIENT_TYPE_COLORS[type] ?? C.muted,
      border:`1px solid ${CLIENT_TYPE_COLORS[type] ?? C.muted}40`,
    }}>
      {labels[type] ?? type}
    </span>
  );
}

function OutreachFunnelRow({ client }) {
  const stageIdx = OUTREACH_STAGES.indexOf(client.outreachStage ?? 'outreach');
  return (
    <div style={{ marginTop:10, display:'flex', gap:4, alignItems:'center' }}>
      {OUTREACH_STAGES.map((s, i) => (
        <div key={s} style={{ display:'flex', alignItems:'center', gap:4, flex:1 }}>
          <div style={{ flex:1, height:4, borderRadius:2, background: i <= stageIdx ? C.accent : 'var(--border)' }}/>
          <span style={{ fontSize:8, fontFamily:'var(--mono)', color: i === stageIdx ? C.accent : 'var(--muted)', whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:0.5 }}>
            {i === stageIdx ? STAGE_LABELS[s] : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function CreatorPanel({ creator }) {
  const stageColors = { outreach:C.muted, onboarded:C.yellow, active:C.accent, top:'#EC4899' };
  return (
    <div style={{ background:'var(--surface2)', borderRadius:8, padding:14, marginTop:14 }}>
      <div className="section-label mb-8" style={{ color:'#EC4899' }}>Creator / KOL Details</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:12 }}>
        {[
          { l:'Platform',       v: creator.platform },
          { l:'Niche',          v: creator.niche },
          { l:'Followers',      v: creator.followers },
          { l:'Commission',     v: `${creator.commissionRate}%` },
          { l:'First Sale',     v: creator.firstSaleDate ?? '—' },
          { l:'Rev. Generated', v: creator.totalRevenue ? `$${creator.totalRevenue.toLocaleString()}` : '—' },
        ].map((s, i) => (
          <div key={i} style={{ background:'var(--bg)', borderRadius:6, padding:'8px 10px' }}>
            <div style={{ fontSize:15, fontWeight:700 }}>{s.v}</div>
            <div className="text-xs text-muted text-upper" style={{ marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {creator.referralLink && (
        <div style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--dim)' }}>
          <span style={{ color:'var(--muted)' }}>Referral link: </span>
          <span style={{ color:'#EC4899' }}>{creator.referralLink}</span>
        </div>
      )}
      <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)' }}>Status:</span>
        <span style={{
          fontSize:9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1,
          padding:'2px 8px', borderRadius:20,
          background:`${stageColors[creator.onboardingStage] ?? C.muted}20`,
          color: stageColors[creator.onboardingStage] ?? C.muted,
        }}>
          {creator.onboardingStage}
        </span>
      </div>
    </div>
  );
}

// ── Interaction log ───────────────────────────────────────────────
function InteractionLog({ client, onAdd }) {
  const [type, setType] = useState('call');
  const [note, setNote] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    onAdd(client.id, { id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], type, note: note.trim() });
    setNote('');
  }

  const interactions = (client.interactions ?? []);

  return (
    <div style={{ marginTop:14 }}>
      <div className="section-label mb-10">Activity Log</div>

      {/* Add interaction */}
      <form onSubmit={submit} style={{ display:'flex', gap:6, marginBottom:14, alignItems:'flex-start' }}>
        <select
          className="input"
          style={{ width:130, flexShrink:0, fontSize:11, padding:'5px 8px', height:'auto' }}
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {INTERACT_TYPES.map(t => (
            <option key={t.v} value={t.v}>{t.label}</option>
          ))}
        </select>
        <input
          className="input"
          style={{ flex:1, fontSize:12 }}
          placeholder="What happened? Quick note…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn--sm"
          style={{ background:`${C.accent}15`, borderColor:C.accent, color:C.accent, flexShrink:0 }}
          disabled={!note.trim()}
        >
          + Log
        </button>
      </form>

      {/* Timeline */}
      {interactions.length === 0 ? (
        <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center', padding:'16px 0' }}>
          No activity logged yet. Add calls, emails, and meetings above.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:280, overflowY:'auto' }}>
          {interactions.map(item => {
            const meta = INTERACT_TYPES.find(t => t.v === item.type) ?? INTERACT_TYPES[3];
            return (
              <div key={item.id} style={{
                display:'flex', gap:10, alignItems:'flex-start', padding:'8px 10px',
                background:'var(--surface2)', borderRadius:7, borderLeft:`2px solid ${meta.color}`,
              }}>
                <span style={{ fontSize:14 }}>{meta.label.split(' ')[0]}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.4 }}>{item.note}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:3 }}>
                    {meta.label.slice(2)} · {item.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Add/Edit modal ────────────────────────────────────────────────
function ClientModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const inputRef = useRef(null);
  const trapRef = useFocusTrap();
  useEffect(() => { inputRef.current?.focus(); }, []);

  const [form, setForm] = useState(() => initial
    ? { ...initial, services:(initial.services ?? []).join(', ') }
    : { name:'', clientType:'brand', status:'active', mrr:'', health:'', contact:'', email:'', since:'', services:'', notes:'', color:PRESET_COLORS[0], outreachStage:'outreach' }
  );

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...(isEdit ? initial : {}),
      id:           isEdit ? initial.id : crypto.randomUUID(),
      name:         form.name.trim(),
      clientType:   form.clientType,
      status:       form.status,
      mrr:          Number(form.mrr) || 0,
      health:       Math.min(100, Math.max(0, Number(form.health) || 0)),
      contact:      form.contact.trim(),
      email:        form.email.trim(),
      since:        form.since.trim() || '—',
      services:     form.services.split(',').map(s => s.trim()).filter(Boolean),
      notes:        form.notes.trim(),
      color:        form.color,
      ...(form.status === 'pipeline' ? { outreachStage: form.outreachStage } : {}),
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cl-modal-title"
      onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()} ref={trapRef}>
      <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
        <h2 id="cl-modal-title" className="modal-title">{isEdit ? 'Edit Client' : 'Add Client'}</h2>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Name *</label>
              <input ref={inputRef} className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Client name" required/>
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Type</label>
              <select className="input" value={form.clientType} onChange={e => set('clientType', e.target.value)}>
                {TYPE_OPTIONS.map(t => <option key={t.v} value={t.v}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="pipeline">Pipeline</option>
              </select>
            </div>
            {form.status === 'active' ? (
              <div>
                <label className="settings-label" style={{ display:'block', marginBottom:4 }}>MRR ($)</label>
                <input className="input" type="number" min="0" value={form.mrr} onChange={e => set('mrr', e.target.value)} placeholder="5000"/>
              </div>
            ) : (
              <div>
                <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Outreach Stage</label>
                <select className="input" value={form.outreachStage} onChange={e => set('outreachStage', e.target.value)}>
                  {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            )}
          </div>

          {form.status === 'active' && (
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Health Score (0–100)</label>
              <input className="input" type="number" min="0" max="100" value={form.health} onChange={e => set('health', e.target.value)} placeholder="85"/>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Contact Name</label>
              <input className="input" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Jane Smith"/>
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@company.com"/>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Client Since</label>
              <input className="input" value={form.since} onChange={e => set('since', e.target.value)} placeholder="Jan 2025"/>
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Services (comma-separated)</label>
              <input className="input" value={form.services} onChange={e => set('services', e.target.value)} placeholder="SEO, Content, Email"/>
            </div>
          </div>

          <div>
            <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Client notes..." style={{ resize:'vertical' }}/>
          </div>

          <div>
            <div className="settings-label" style={{ marginBottom:6 }}>Card Color</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {PRESET_COLORS.map(col => (
                <button key={col} type="button" onClick={() => set('color', col)} style={{
                  width:22, height:22, borderRadius:'50%', background:col,
                  border:`2px solid ${form.color===col ? 'var(--text)' : 'transparent'}`, cursor:'pointer',
                }} aria-label={`Color ${col}`}/>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type="button" className="btn btn--ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:1 }}>{isEdit ? 'Save Changes' : 'Add Client'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function Clients({ clients, setClients, mrr, allTasks, setTab }) {
  const [selectedId,   setSelectedId]   = useState(null);
  const [modal,        setModal]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [healthFilter, setHealthFilter] = useState('all'); // 'all' | 'healthy' | 'atrisk'
  const [sortBy,       setSortBy]       = useState('mrr'); // 'mrr' | 'health' | 'name'

  function saveClient(data) {
    setClients(p => {
      const idx = p.findIndex(c => c.id === data.id);
      return idx >= 0 ? p.map(c => c.id === data.id ? data : c) : [...p, data];
    });
    setModal(null);
    if (data.id === selectedId) setSelectedId(data.id);
  }

  function deleteClient(id) {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    setClients(p => p.filter(c => c.id !== id));
    setSelectedId(null);
  }

  function addInteraction(clientId, interaction) {
    setClients(p => p.map(c =>
      c.id === clientId
        ? { ...c, interactions: [interaction, ...(c.interactions ?? [])] }
        : c
    ));
  }

  function updateHealth(clientId, health) {
    setClients(p => p.map(c => c.id === clientId ? { ...c, health } : c));
  }

  const activeClients   = clients.filter(c => c.status === 'active');
  const pipelineClients = clients.filter(c => c.status === 'pipeline');

  // Dynamic pipeline value — extract $ from notes, fallback to $5k per lead
  const pipelineValue = pipelineClients.reduce((sum, c) => {
    const match = (c.notes ?? '').match(/\$(\d[\d,]*)/);
    return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 5000);
  }, 0);

  // Filtered + sorted active clients
  const filteredActive = activeClients
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.contact ?? '').toLowerCase().includes(q) || (c.email ?? '').toLowerCase().includes(q);
    })
    .filter(c => typeFilter === 'all' || c.clientType === typeFilter)
    .filter(c => {
      if (healthFilter === 'atrisk') return (c.health ?? 100) < 75;
      if (healthFilter === 'healthy') return (c.health ?? 100) >= 75;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'mrr')    return b.mrr - a.mrr;
      if (sortBy === 'health') return b.health - a.health;
      return a.name.localeCompare(b.name);
    });

  const atRiskCount = activeClients.filter(c => (c.health ?? 100) < 75).length;

  // ── Client Detail View ────────────────────────────────────────
  if (selectedId) {
    const cl = clients.find(c => c.id === selectedId);
    if (!cl) { setSelectedId(null); return null; }

    const relatedTasks = (allTasks ?? []).filter(t =>
      t.title.toLowerCase().includes(cl.name.toLowerCase()) ||
      (t.notes ?? '').toLowerCase().includes(cl.name.toLowerCase())
    );
    const isAtRisk = cl.status === 'active' && (cl.health ?? 100) < 75;

    return (
      <section className="view" aria-labelledby="client-detail-title">
        {/* Nav bar */}
        <div className="flex-center gap-10" style={{ marginBottom:16 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => setSelectedId(null)} aria-label="Back">
            ← Back
          </button>
          <button className="btn btn--sm" style={{ marginLeft:'auto', background:`${C.accent}12`, borderColor:C.accent, color:C.accent }}
            onClick={() => setModal({ edit: cl })}>
            ✎ Edit
          </button>
          <button className="btn btn--sm" style={{ background:'#EF444415', borderColor:'var(--red)', color:'var(--red)' }}
            onClick={() => deleteClient(cl.id)}>
            ✕ Delete
          </button>
          <div style={{ width:10, height:10, borderRadius:'50%', background:cl.color }} aria-hidden="true"/>
          <h1 id="client-detail-title" style={{ fontFamily:'var(--sans)', fontSize:18, fontWeight:700 }}>{cl.name}</h1>
          <TypeBadge type={cl.clientType}/>
          <Badge label={cl.status} color={cl.status==='active' ? C.accent : C.accent5}/>
          {isAtRisk && (
            <span style={{ fontSize:10, fontFamily:'var(--mono)', color:C.red, background:`${C.red}12`, border:`1px solid ${C.red}30`, borderRadius:20, padding:'2px 8px' }}>
              ⚠ At Risk
            </span>
          )}
        </div>

        {/* KPI strip */}
        <div className="grid-4 mb-16" style={{ marginBottom:16 }}>
          {[
            { l:'MRR',      v: cl.mrr    ? `$${(cl.mrr/1000).toFixed(1)}k` : '—' },
            { l:'Health',   v: cl.health ? `${cl.health}%`                  : '—' },
            { l:'Since',    v: cl.since },
            { l:'Services', v: cl.services.length },
          ].map((s, i) => (
            <div key={i} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', textAlign:'center' }}>
              <div style={{ fontSize:16, fontWeight:700 }}>{s.v}</div>
              <div className="text-xs text-muted text-upper" style={{ marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap:16 }}>
          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Health slider */}
            {cl.status === 'active' && (
              <div className="card">
                <div className="section-label mb-8">Health Score</div>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                  <input
                    type="range" min={0} max={100}
                    value={cl.health ?? 0}
                    onChange={e => updateHealth(cl.id, Number(e.target.value))}
                    style={{ flex:1, accentColor: cl.health >= 75 ? C.accent : cl.health >= 50 ? C.yellow : C.red }}
                    aria-label="Health score"
                  />
                  <span style={{
                    fontSize:14, fontWeight:700, fontFamily:'var(--mono)', minWidth:38, textAlign:'right',
                    color: cl.health>=75 ? C.accent : cl.health>=50 ? C.yellow : C.red,
                  }}>
                    {cl.health ?? 0}%
                  </span>
                </div>
                <ProgressBar value={cl.health ?? 0} color={cl.health>=75 ? C.accent : cl.health>=50 ? C.yellow : C.red} height={6}/>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:6, fontFamily:'var(--mono)' }}>
                  {cl.health >= 90 ? '🟢 Thriving' : cl.health >= 75 ? '🟡 Good' : cl.health >= 50 ? '🟠 Needs attention' : '🔴 At risk — follow up now'}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="card">
              <div className="section-label mb-8">Details</div>
              <div style={{ fontSize:12, lineHeight:2 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--muted)' }}>Contact</span>
                  <span>{cl.contact}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--muted)' }}>Email</span>
                  <a href={`mailto:${cl.email}`} style={{ color:C.accent4 }}>{cl.email || '—'}</a>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--muted)' }}>Next Meeting</span>
                  <span>{cl.nextMeeting ?? '—'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--muted)' }}>Services</span>
                  <span style={{ textAlign:'right', maxWidth:200 }}>{cl.services.join(', ') || '—'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <div className="section-label mb-8">Notes</div>
              <div style={{ fontSize:12, lineHeight:1.7, color:'var(--dim)' }}>{cl.notes || '—'}</div>
            </div>

            {/* Related tasks */}
            {relatedTasks.length > 0 && (
              <div className="card">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div className="section-label">Related Tasks ({relatedTasks.length})</div>
                  {setTab && (
                    <button
                      className="btn btn--sm btn--ghost"
                      onClick={() => setTab('tasks')}
                      style={{ fontSize:10 }}
                    >
                      View all →
                    </button>
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {relatedTasks.slice(0, 4).map(t => (
                    <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:11 }}>
                      <span style={{
                        width:6, height:6, borderRadius:'50%', flexShrink:0,
                        background: t.priority === 'high' ? C.red : t.priority === 'medium' ? C.yellow : C.accent,
                      }}/>
                      <span style={{ color:'var(--dim)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</span>
                      <span style={{ marginLeft:'auto', fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', flexShrink:0 }}>{t.due}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cl.creator && <div className="card"><CreatorPanel creator={cl.creator}/></div>}
          </div>

          {/* Right column — Interaction log */}
          <div className="card" style={{ alignSelf:'start' }}>
            <InteractionLog client={cl} onAdd={addInteraction}/>
          </div>
        </div>

        {modal?.edit && (
          <ClientModal initial={modal.edit} onSave={saveClient} onClose={() => setModal(null)}/>
        )}
      </section>
    );
  }

  // ── List View ─────────────────────────────────────────────────
  return (
    <section className="view" aria-labelledby="clients-title">
      <header className="flex-between" style={{ marginBottom:20 }}>
        <div>
          <h1 id="clients-title" className="view-title">Client Management</h1>
          <p className="view-subtitle">CRM overview — health tracking, revenue, and next actions</p>
        </div>
        <button className="btn btn--outline-accent" onClick={() => setModal('add')} aria-label="Add new client">
          + Add Client
        </button>
      </header>

      {/* KPIs */}
      <div className="grid-3 mb-20">
        {[
          { l:'Total MRR',      v: `$${(mrr/1000).toFixed(1)}k`,   c: C.accent  },
          { l:'Active Clients', v: activeClients.length,            c: C.accent4 },
          { l:'Pipeline Value', v: `~$${(pipelineValue/1000).toFixed(1)}k/mo`, c: C.accent5 },
        ].map((m, i) => (
          <div key={i} className="card card--sm" style={{ borderTop:`3px solid ${m.c}` }}>
            <div className="kpi-label">{m.l}</div>
            <div style={{ fontSize:24, fontWeight:700, fontFamily:'var(--sans)' }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Filter / Search / Sort bar */}
      {activeClients.length > 0 && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:16 }}>
          <input
            className="input"
            style={{ width:220, flexShrink:0 }}
            placeholder="Search clients, contacts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search clients"
          />

          {/* Type filter */}
          <div style={{ display:'flex', gap:4 }}>
            {[{v:'all',label:'All Types'}, ...TYPE_OPTIONS].map(t => (
              <button
                key={t.v}
                onClick={() => setTypeFilter(t.v)}
                style={{
                  padding:'4px 10px', borderRadius:6, fontSize:10, cursor:'pointer', fontFamily:'var(--mono)',
                  border:`1px solid ${typeFilter === t.v ? C.accent4 : 'var(--border)'}`,
                  background: typeFilter === t.v ? `${C.accent4}15` : 'var(--surface2)',
                  color: typeFilter === t.v ? C.accent4 : 'var(--muted)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Health filter */}
          {atRiskCount > 0 && (
            <button
              onClick={() => setHealthFilter(p => p === 'atrisk' ? 'all' : 'atrisk')}
              style={{
                padding:'4px 10px', borderRadius:6, fontSize:10, cursor:'pointer', fontFamily:'var(--mono)',
                border:`1px solid ${healthFilter === 'atrisk' ? C.red : 'var(--border)'}`,
                background: healthFilter === 'atrisk' ? `${C.red}15` : 'var(--surface2)',
                color: healthFilter === 'atrisk' ? C.red : 'var(--muted)',
              }}
            >
              ⚠ At Risk ({atRiskCount})
            </button>
          )}

          {/* Sort */}
          <select
            className="input"
            style={{ marginLeft:'auto', width:140, fontSize:11, padding:'4px 8px', height:'auto' }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort clients"
          >
            <option value="mrr">Sort: MRR ↓</option>
            <option value="health">Sort: Health ↓</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
      )}

      {/* Active clients */}
      {activeClients.length === 0 && (
        <div className="card" style={{ padding:40, textAlign:'center', color:'var(--muted)', marginBottom:20 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🏢</div>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:6, color:'var(--text)' }}>No active clients yet</div>
          <div style={{ fontSize:12, lineHeight:1.6, marginBottom:16 }}>
            Add your first client to track health, MRR, and meetings in one place.
          </div>
          <button className="btn btn--primary" onClick={() => setModal('add')}>
            + Add first client
          </button>
        </div>
      )}

      {activeClients.length > 0 && (
        <>
          <h2 className="section-label mb-10">
            Active Clients
            {filteredActive.length !== activeClients.length && (
              <span style={{ fontWeight:400, color:'var(--muted)', marginLeft:8, textTransform:'none', letterSpacing:0, fontSize:10 }}>
                — {filteredActive.length} of {activeClients.length}
              </span>
            )}
          </h2>
          {filteredActive.length === 0 ? (
            <div style={{ padding:'24px 0', textAlign:'center', color:'var(--muted)', fontSize:12 }}>
              No clients match your filters.
            </div>
          ) : (
            <div className="grid-clients mb-20">
              {filteredActive.map(cl => {
                const isAtRisk = (cl.health ?? 100) < 75;
                const lastInteraction = (cl.interactions ?? [])[0];
                return (
                  <button
                    key={cl.id}
                    className="card client-card"
                    style={{
                      borderLeftColor: cl.color,
                      textAlign:'left', width:'100%',
                      ...(isAtRisk ? { boxShadow:`inset 3px 0 0 ${C.red}, 0 0 0 1px ${C.red}20` } : {}),
                    }}
                    onClick={() => setSelectedId(cl.id)}
                    aria-label={`${cl.name}: ${cl.health}% health, $${(cl.mrr/1000).toFixed(1)}k MRR`}
                  >
                    <div className="client-card__head">
                      <div>
                        <div className="client-name" style={{ display:'flex', alignItems:'center', gap:7 }}>
                          {cl.name}
                          <TypeBadge type={cl.clientType}/>
                          {isAtRisk && <span style={{ fontSize:10, color:C.red }}>⚠</span>}
                        </div>
                        <div className="client-contact">{cl.contact} · {cl.email}</div>
                      </div>
                      <Badge label={cl.status} color={C.accent}/>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <ProgressBar
                        value={cl.health}
                        color={cl.health>=90 ? C.accent : cl.health>=75 ? C.yellow : C.red}
                        height={5}
                      />
                      <div className="flex-between" style={{ marginTop:3 }}>
                        <span className="text-xs text-muted">Health: {cl.health}%</span>
                        <span className="text-xs text-muted">${(cl.mrr/1000).toFixed(1)}k/mo</span>
                      </div>
                    </div>
                    <div className="client-services" style={{ marginBottom:6 }}>
                      {cl.services.map(s => <Badge key={s} label={s} color={C.accent4}/>)}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div className="client-next" style={{ margin:0 }}>Next: {cl.nextMeeting ?? '—'}</div>
                      {lastInteraction && (
                        <span style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)' }}>
                          Last: {lastInteraction.date}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Pipeline */}
      {pipelineClients.length > 0 && (
        <>
          <h2 className="section-label mb-10">Pipeline</h2>
          <div className="grid-clients">
            {pipelineClients.map(cl => (
              <button
                key={cl.id}
                className="card client-card"
                style={{ borderLeftColor: cl.color, textAlign:'left', width:'100%', opacity:0.85 }}
                onClick={() => setSelectedId(cl.id)}
                aria-label={`${cl.name}: pipeline prospect`}
              >
                <div className="client-card__head">
                  <div>
                    <div className="client-name" style={{ display:'flex', alignItems:'center', gap:7 }}>
                      {cl.name}
                      <TypeBadge type={cl.clientType}/>
                    </div>
                    <div className="client-contact">{cl.contact} · {cl.email}</div>
                  </div>
                  <Badge label="Pipeline" color={C.accent5}/>
                </div>
                <div className="client-services mb-8">
                  {cl.services.map(s => <Badge key={s} label={s} color={C.accent4}/>)}
                </div>
                <div className="client-next">Next: {cl.nextMeeting ?? '—'}</div>
                <div style={{ fontSize:11, color:'var(--dim)', marginTop:6 }}>{cl.notes}</div>
                {cl.outreachStage && <OutreachFunnelRow client={cl}/>}
              </button>
            ))}
          </div>
        </>
      )}

      {modal === 'add' && (
        <ClientModal onSave={saveClient} onClose={() => setModal(null)}/>
      )}
      {modal?.edit && (
        <ClientModal initial={modal.edit} onSave={saveClient} onClose={() => setModal(null)}/>
      )}
    </section>
  );
}
