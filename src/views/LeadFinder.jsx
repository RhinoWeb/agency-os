import { useState, useEffect } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';

// ── Apify actor library ─────────────────────────────────────────
const ACTORS = [
  { id: 'curious_coder/linkedin-profile-scraper', label: 'LinkedIn Profile Scraper', icon: '🔗', desc: 'Scrape LinkedIn profiles by search URL' },
  { id: 'apify/linkedin-company-scraper',         label: 'LinkedIn Company Scraper', icon: '🏢', desc: 'Find decision makers at target companies' },
  { id: 'apify/google-maps-scraper',              label: 'Google Maps Leads',        icon: '📍', desc: 'Local business leads with email & phone' },
  { id: 'bebity/linkedin-sales-navigator-scraper',label: 'Sales Navigator Scraper',  icon: '💼', desc: 'Scrape Sales Nav search results' },
  { id: 'apify/apollo-scraper',                   label: 'Apollo.io Scraper',        icon: '🚀', desc: 'Pull leads from Apollo with emails' },
];

const STATUS_COLORS = {
  lead:     C.muted,
  prospect: C.accent3,
  active:   C.accent,
  lost:     C.red,
};

const REPLY_COLORS = {
  none:     C.muted,
  positive: C.green,
  neutral:  C.yellow,
  negative: C.red,
};

const INDUSTRIES = ['SaaS','E-commerce','Agency','Finance','Healthcare','Real Estate','Consulting','Manufacturing','Other'];

function ScoreBadge({ score }) {
  const color = score >= 80 ? C.green : score >= 60 ? C.accent3 : C.red;
  return (
    <span style={{ fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:4, padding:'1px 6px' }}>
      {score}
    </span>
  );
}

// ── Toast notification ───────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
      background:'var(--surface2)', border:`1px solid ${C.accent}40`,
      borderLeft:`3px solid ${C.accent}`, borderRadius:10, padding:'12px 20px',
      zIndex:9998, fontSize:13, fontFamily:'var(--mono)', color:'var(--text)',
      boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
      animation:'fadeIn 0.2s ease',
      display:'flex', alignItems:'center', gap:10,
      whiteSpace:'nowrap',
    }}>
      <span style={{ color:C.accent }}>✓</span> {msg}
    </div>
  );
}

// ── Add Lead Modal ───────────────────────────────────────────────
function AddLeadModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name:'', title:'', company:'', email:'', location:'', industry:'SaaS', employees:'',
    linkedIn:'', notes:'', leadScore:50, status:'lead',
  });

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      id:            crypto.randomUUID(),
      name:          form.name.trim(),
      title:         form.title.trim(),
      company:       form.company.trim(),
      email:         form.email.trim(),
      location:      form.location.trim(),
      industry:      form.industry,
      employees:     form.employees.trim() || '—',
      linkedIn:      form.linkedIn.trim(),
      notes:         form.notes.trim(),
      leadScore:     form.leadScore,
      status:        form.status,
      replyStatus:   'none',
      sequenceStep:  0,
      addedOn:       new Date().toISOString().split('T')[0],
    });
    onClose();
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(6,9,15,0.85)', backdropFilter:'blur(6px)', zIndex:9000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:16, padding:32, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', margin:'0 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:700, fontFamily:'var(--sans)' }}>Add Lead Manually</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:18, lineHeight:1 }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" autoFocus required />
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Title</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="VP of Marketing" />
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Company</label>
              <input className="input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="New York, NY" />
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Employees</label>
              <input className="input" value={form.employees} onChange={e => set('employees', e.target.value)} placeholder="50-200" />
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Industry</label>
              <select className="input" value={form.industry} onChange={e => set('industry', e.target.value)}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {['lead','prospect','active','lost'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="settings-label" style={{ display:'block', marginBottom:4 }}>LinkedIn URL</label>
            <input className="input" value={form.linkedIn} onChange={e => set('linkedIn', e.target.value)} placeholder="linkedin.com/in/janesmith" />
          </div>

          <div>
            <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Lead Score: {form.leadScore}</label>
            <input
              type="range" min={0} max={100}
              value={form.leadScore}
              onChange={e => set('leadScore', Number(e.target.value))}
              style={{ width:'100%', accentColor: form.leadScore >= 80 ? C.green : form.leadScore >= 60 ? C.accent3 : C.red }}
            />
          </div>

          <div>
            <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Qualification notes…" style={{ resize:'vertical' }} />
          </div>

          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type="button" className="btn btn--ghost" onClick={onClose} style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:2 }}>Add Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CSV Export ───────────────────────────────────────────────────
function exportCSV(leads) {
  const headers = ['Name','Title','Company','Email','Location','Industry','Employees','Score','Status','Reply','LinkedIn','Notes'];
  const rows = leads.map(l => [
    l.name, l.title, l.company, l.email, l.location, l.industry,
    l.employees, l.leadScore, l.status, l.replyStatus ?? 'none', l.linkedIn, l.notes,
  ].map(v => `"${String(v ?? '').replace(/"/g,'""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Pipeline tab ────────────────────────────────────────────────
function Pipeline({ leads, setLeads, setClients, setTab, onAddLead, toast }) {
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [sortKey,  setSortKey]  = useState('score');
  const [sortDir,  setSortDir]  = useState('desc');
  const [expanded, setExpanded] = useState(null);

  const safeLeads = leads ?? [];
  const statuses  = ['all', 'lead', 'prospect', 'active', 'lost'];
  const counts    = statuses.slice(1).reduce((acc, s) => ({ ...acc, [s]: safeLeads.filter(l => l.status === s).length }), {});

  const visible = safeLeads
    .filter(l => filter === 'all' || l.status === filter)
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.company ?? '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let av, bv;
      if      (sortKey === 'score')  { av = a.leadScore ?? 0;   bv = b.leadScore ?? 0; }
      else if (sortKey === 'date')   { av = a.addedOn   ?? '';  bv = b.addedOn   ?? ''; }
      else if (sortKey === 'status') { av = a.status    ?? '';  bv = b.status    ?? ''; }
      else if (sortKey === 'name')   { av = a.name      ?? '';  bv = b.name      ?? ''; }
      else                           { av = 0; bv = 0; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortBtn({ k, label }) {
    const active = sortKey === k;
    return (
      <button
        onClick={() => toggleSort(k)}
        style={{
          background: active ? `${C.accent}15` : 'var(--surface2)',
          border:`1px solid ${active ? C.accent : 'var(--border)'}`,
          borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:9,
          fontFamily:'var(--mono)', color: active ? C.accent : 'var(--muted)',
          display:'flex', alignItems:'center', gap:4,
        }}
      >
        {label} {active ? (sortDir === 'desc' ? '↓' : '↑') : ''}
      </button>
    );
  }

  function updateLead(id, patch) {
    setLeads(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  function graduateToClient(lead) {
    setClients(p => [
      ...p,
      {
        id:          crypto.randomUUID(),
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
        notes:       lead.notes,
        color:       C.accent,
        interactions:[],
      }
    ]);
    setLeads(p => p.filter(l => l.id !== lead.id));
    toast(`${lead.name} moved to Clients ✓`);
    setTab('clients');
  }

  function deleteLead(id) {
    if (window.confirm('Remove this lead?')) setLeads(p => p.filter(l => l.id !== id));
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input
            className="input"
            style={{ width:200, flexShrink:0 }}
            placeholder="Search leads…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
            {statuses.map(s => (
              <button
                key={s}
                className={`btn btn--sm${filter === s ? '' : ' btn--ghost'}`}
                style={filter === s ? { background:`${C.accent}15`, borderColor:C.accent, color:C.accent } : {}}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? `All (${safeLeads.length})` : `${s} (${counts[s] ?? 0})`}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {/* Sort controls */}
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            <span style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1 }}>Sort:</span>
            <SortBtn k="score"  label="Score"  />
            <SortBtn k="date"   label="Date"   />
            <SortBtn k="status" label="Status" />
            <SortBtn k="name"   label="Name"   />
          </div>
          <button
            className="btn btn--sm btn--ghost"
            style={{ marginLeft:4 }}
            onClick={() => exportCSV(visible)}
            title="Export filtered leads as CSV"
          >
            ↓ CSV
          </button>
          <button
            className="btn btn--sm btn--primary"
            onClick={onAddLead}
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* Lead list */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {visible.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)', fontSize:13 }}>
            <div style={{ fontSize:28, marginBottom:10 }}>◉</div>
            No leads found.{' '}
            <button onClick={onAddLead} style={{ background:'none', border:'none', color:C.accent, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
              Add one manually
            </button>
            {' '}or use "Find Leads" to pull from Apify.
          </div>
        )}
        {visible.map(lead => {
          const isExp  = expanded === lead.id;
          const isHot  = lead.leadScore >= 80;
          const sc     = STATUS_COLORS[lead.status] ?? C.muted;
          const rc     = REPLY_COLORS[lead.replyStatus] ?? C.muted;
          const border = isHot ? C.green : sc;
          return (
            <div
              key={lead.id}
              className="card"
              style={{
                padding:'12px 16px',
                borderLeft:`3px solid ${border}`,
                ...(isHot ? { boxShadow:`0 0 0 1px ${C.green}18, 0 4px 16px rgba(0,0,0,0.3)` } : {}),
              }}
            >
              <div
                style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
                onClick={() => setExpanded(isExp ? null : lead.id)}
              >
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    {isHot && (
                      <span style={{ fontSize:9, fontFamily:'var(--mono)', color:C.green, background:`${C.green}15`, border:`1px solid ${C.green}30`, borderRadius:3, padding:'1px 5px', textTransform:'uppercase', letterSpacing:0.8 }}>
                        🔥 Hot
                      </span>
                    )}
                    <span style={{ fontWeight:700, fontSize:13 }}>{lead.name}</span>
                    <span style={{ fontSize:11, color:'var(--muted)' }}>{lead.title}{lead.title && lead.company ? ' @ ' : ''}{lead.company}</span>
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginTop:3, fontFamily:'var(--mono)' }}>
                    {[lead.location, lead.industry, lead.employees && `${lead.employees} employees`].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                  <ScoreBadge score={lead.leadScore} />
                  <Badge label={lead.status} color={sc} />
                  {lead.replyStatus && lead.replyStatus !== 'none' && <Badge label={lead.replyStatus} color={rc} />}
                  {lead.sequenceStep > 0 && (
                    <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)' }}>
                      step {lead.sequenceStep}/12
                    </span>
                  )}
                  {lead.addedOn && (
                    <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)' }}>{lead.addedOn}</span>
                  )}
                  <span style={{ fontSize:10, color:'var(--muted)', userSelect:'none' }}>{isExp ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExp && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                    <div>
                      <div className="section-label mb-4">Email</div>
                      {lead.email
                        ? <a href={`mailto:${lead.email}`} style={{ fontSize:12, color:C.accent }}>{lead.email}</a>
                        : <span style={{ fontSize:12, color:'var(--muted)' }}>—</span>
                      }
                    </div>
                    <div>
                      <div className="section-label mb-4">LinkedIn</div>
                      {lead.linkedIn
                        ? <a href={`https://${lead.linkedIn}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:C.accent }}>View Profile ↗</a>
                        : <span style={{ fontSize:12, color:'var(--muted)' }}>—</span>
                      }
                    </div>
                    <div>
                      <div className="section-label mb-4">Status</div>
                      <select
                        className="input"
                        style={{ fontSize:11, padding:'3px 6px', height:'auto' }}
                        value={lead.status}
                        onChange={e => updateLead(lead.id, { status: e.target.value })}
                      >
                        {['lead','prospect','active','lost'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="section-label mb-4">Reply</div>
                      <select
                        className="input"
                        style={{ fontSize:11, padding:'3px 6px', height:'auto' }}
                        value={lead.replyStatus ?? 'none'}
                        onChange={e => updateLead(lead.id, { replyStatus: e.target.value })}
                      >
                        {['none','positive','neutral','negative'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn:'1/-1' }}>
                      <div className="section-label mb-4">Lead Score: {lead.leadScore}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <input
                          type="range" min={0} max={100}
                          value={lead.leadScore}
                          onChange={e => updateLead(lead.id, { leadScore: Number(e.target.value) })}
                          style={{ flex:1, accentColor: lead.leadScore >= 80 ? C.green : lead.leadScore >= 60 ? C.accent3 : C.red }}
                        />
                        <ScoreBadge score={lead.leadScore} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom:12 }}>
                    <div className="section-label mb-4">Notes</div>
                    <textarea
                      className="input"
                      rows={2}
                      style={{ resize:'vertical', fontSize:12 }}
                      value={lead.notes ?? ''}
                      onChange={e => updateLead(lead.id, { notes: e.target.value })}
                      placeholder="Add notes…"
                    />
                  </div>

                  {lead.sequenceStep > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div className="section-label mb-4">Sequence Progress</div>
                      <ProgressBar value={(lead.sequenceStep / 12) * 100} color={sc} height={4} />
                      <div style={{ fontSize:10, color:'var(--muted)', marginTop:4, fontFamily:'var(--mono)' }}>
                        Step {lead.sequenceStep} of 12
                      </div>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8 }}>
                    {lead.status === 'prospect' && (
                      <button className="btn btn--sm btn--primary" onClick={() => graduateToClient(lead)}>
                        → Move to Clients
                      </button>
                    )}
                    <button
                      className="btn btn--sm"
                      style={{ background:`${C.red}12`, borderColor:C.red, color:C.red }}
                      onClick={() => deleteLead(lead.id)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Find Leads tab ──────────────────────────────────────────────
function FindLeads({ leads, setLeads, apifyRuns, setApifyRuns }) {
  const safeLeads = leads ?? [];
  const [actor,     setActor]     = useState(ACTORS[0].id);
  const [searchUrl, setSearchUrl] = useState('');
  const [maxItems,  setMaxItems]  = useState(50);
  const [running,   setRunning]   = useState(false);
  const [runStatus, setRunStatus] = useState(null);
  const [preview,   setPreview]   = useState([]);
  const [importing, setImporting] = useState(false);
  const [pollTimer, setPollTimer] = useState(null);
  const [error,     setError]     = useState('');

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); setPollTimer(null); }
  }

  useEffect(() => () => { if (pollTimer) clearInterval(pollTimer); }, [pollTimer]);

  async function runActor() {
    setError('');
    setPreview([]);
    setRunStatus(null);
    setRunning(true);
    try {
      const input = actor.includes('linkedin')
        ? { searchUrl, maxItems }
        : actor.includes('google-maps')
        ? { searchStringsArray: [searchUrl], maxCrawledPlacesPerSearch: maxItems }
        : { urls: [{ url: searchUrl }], maxItems };

      const r = await fetch('/api/apify/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: actor, input }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Run failed');

      const run = { runId: d.runId, actorId: actor, startedAt: new Date().toISOString(), status: 'RUNNING', progress: 0, datasetId: null };
      setRunStatus(run);
      setApifyRuns(p => [run, ...p].slice(0, 20));

      const tid = setInterval(async () => {
        try {
          const sr = await fetch(`/api/apify/status/${d.runId}`);
          const sd = await sr.json();
          setRunStatus(prev => ({ ...prev, status: sd.status, datasetId: sd.datasetId ?? prev?.datasetId }));
          setApifyRuns(p => p.map(r2 => r2.runId === d.runId ? { ...r2, status: sd.status, datasetId: sd.datasetId } : r2));

          if (sd.status === 'SUCCEEDED') {
            clearInterval(tid);
            setPollTimer(null);
            const rr = await fetch(`/api/apify/results/${sd.datasetId}?limit=${maxItems}`);
            const rd = await rr.json();
            const nr = await fetch('/api/apify/normalize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: rd.items }),
            });
            const nd = await nr.json();
            setPreview(nd.leads ?? []);
            setRunning(false);
          } else if (sd.status === 'FAILED' || sd.status === 'ABORTED') {
            clearInterval(tid);
            setPollTimer(null);
            setError(`Run ${sd.status.toLowerCase()}`);
            setRunning(false);
          }
        } catch { /* keep polling */ }
      }, 4000);
      setPollTimer(tid);
    } catch (err) {
      setError(err.message);
      setRunning(false);
    }
  }

  function importLeads() {
    const newLeads = preview.filter(p => !safeLeads.some(l => l.email && l.email === p.email));
    setLeads(prev => [...prev, ...newLeads]);
    setImporting(true);
    setTimeout(() => { setImporting(false); setPreview([]); setRunStatus(null); }, 1800);
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
      {/* Left — config panel */}
      <div>
        <div className="card" style={{ padding:18 }}>
          <div className="section-label mb-12">Data Source</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {ACTORS.map(a => (
              <button
                key={a.id}
                style={{
                  textAlign:'left', padding:'8px 10px', borderRadius:8, cursor:'pointer',
                  border:`1px solid ${actor === a.id ? C.accent : 'var(--border)'}`,
                  background: actor === a.id ? `${C.accent}10` : 'var(--surface2)',
                }}
                onClick={() => setActor(a.id)}
              >
                <div style={{ fontSize:13 }}>{a.icon} {a.label}</div>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{a.desc}</div>
              </button>
            ))}
          </div>

          <div className="section-label mb-8">Search URL / Query</div>
          <input
            className="input"
            style={{ marginBottom:12 }}
            placeholder="LinkedIn search URL or keyword…"
            value={searchUrl}
            onChange={e => setSearchUrl(e.target.value)}
          />

          <div className="section-label mb-8">Max Leads</div>
          <input
            className="input"
            type="number"
            min={5}
            max={500}
            style={{ marginBottom:16 }}
            value={maxItems}
            onChange={e => setMaxItems(Number(e.target.value))}
          />

          <button
            className="btn btn--primary"
            style={{ width:'100%' }}
            disabled={running || !searchUrl.trim()}
            onClick={runActor}
          >
            {running ? '⏳ Running…' : '▶ Find Leads'}
          </button>

          {error && (
            <div style={{ marginTop:10, fontSize:11, color:C.red, background:`${C.red}10`, border:`1px solid ${C.red}25`, borderRadius:6, padding:'6px 10px' }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {apifyRuns.length > 0 && (
          <div className="card" style={{ padding:14, marginTop:12 }}>
            <div className="section-label mb-10">Recent Runs</div>
            {apifyRuns.slice(0, 5).map(r => (
              <div key={r.runId} style={{ fontSize:11, display:'flex', justifyContent:'space-between', marginBottom:6, fontFamily:'var(--mono)' }}>
                <span style={{ color:'var(--muted)', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {r.actorId.split('/')[1] ?? r.actorId}
                </span>
                <span style={{ color: r.status === 'SUCCEEDED' ? C.green : r.status === 'RUNNING' ? C.accent3 : C.red }}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right — results */}
      <div>
        {runStatus && (
          <div className="card" style={{ padding:16, marginBottom:16, borderLeft:`3px solid ${runStatus.status === 'SUCCEEDED' ? C.green : runStatus.status === 'RUNNING' ? C.accent3 : C.red}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700 }}>
                  {runStatus.status === 'RUNNING' ? '⏳ Scraping…' : runStatus.status === 'SUCCEEDED' ? '✓ Complete' : `✗ ${runStatus.status}`}
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:3 }}>Run: {runStatus.runId}</div>
              </div>
              {runStatus.status === 'RUNNING' && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:80 }}>
                    <ProgressBar value={50} color={C.accent3} height={3} />
                  </div>
                  <button className="btn btn--sm btn--ghost" onClick={stopPolling}>Stop</button>
                </div>
              )}
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="card" style={{ padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div className="section-label">Preview — {preview.length} leads found</div>
                <div style={{ fontSize:10, color:'var(--muted)' }}>
                  {preview.filter(p => !safeLeads.some(l => l.email && l.email === p.email)).length} new · {preview.filter(p => safeLeads.some(l => l.email && l.email === p.email)).length} duplicates
                </div>
              </div>
              <button className="btn btn--primary" onClick={importLeads} disabled={importing}>
                {importing ? '✓ Imported!' : `⬇ Import All`}
              </button>
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['Name','Title','Company','Location','Email','Score'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'4px 8px', fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((l, i) => {
                    const isDup = safeLeads.some(ex => ex.email && ex.email === l.email);
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid var(--border)', opacity: isDup ? 0.4 : 1 }}>
                        <td style={{ padding:'5px 8px', fontWeight:600 }}>{l.name}</td>
                        <td style={{ padding:'5px 8px', color:'var(--muted)' }}>{l.title || '—'}</td>
                        <td style={{ padding:'5px 8px' }}>{l.company || '—'}</td>
                        <td style={{ padding:'5px 8px', color:'var(--muted)' }}>{l.location || '—'}</td>
                        <td style={{ padding:'5px 8px', color:C.accent }}>{l.email || '—'}</td>
                        <td style={{ padding:'5px 8px' }}><ScoreBadge score={l.leadScore} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {preview.length > 50 && (
                <div style={{ fontSize:10, color:'var(--muted)', textAlign:'center', padding:'8px 0' }}>
                  Showing 50 of {preview.length} — all will be imported
                </div>
              )}
            </div>
          </div>
        )}

        {!runStatus && preview.length === 0 && (
          <div className="card" style={{ padding:48, textAlign:'center', color:'var(--muted)' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>Ready to find leads</div>
            <div style={{ fontSize:12 }}>Select a data source, enter your search URL, and hit "Find Leads" to pull from Apify.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main view ───────────────────────────────────────────────────
export default function LeadFinder({ leads, setLeads, campaigns, apifyRuns, setApifyRuns, clients, setClients, setTab }) {
  const [subTab,      setSubTab]      = useState('pipeline');
  const [showAddLead, setShowAddLead] = useState(false);
  const [toastMsg,    setToastMsg]    = useState('');

  const safeLeads     = leads ?? [];
  const prospectCount = safeLeads.filter(l => l.status === 'prospect').length;
  const positiveCount = safeLeads.filter(l => l.replyStatus === 'positive').length;
  const hotCount      = safeLeads.filter(l => l.leadScore >= 80).length;
  const avgScore      = safeLeads.length ? Math.round(safeLeads.reduce((s, l) => s + (l.leadScore ?? 0), 0) / safeLeads.length) : 0;

  function addLead(lead) {
    setLeads(p => [lead, ...(p ?? [])]);
    setToastMsg(`${lead.name} added to pipeline`);
  }

  function showToast(msg) {
    setToastMsg(msg);
  }

  return (
    <section className="view" aria-labelledby="leads-title">
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 id="leads-title" className="view-title">Lead Finder</h1>
          <p className="view-subtitle">Pull leads from Apify and manage your pipeline</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowAddLead(true)}>+ Add Lead</button>
      </header>

      {/* KPI row */}
      <div className="grid-4 mb-18">
        {[
          { l:'Total Leads',      v: safeLeads.length,                                c: C.accent  },
          { l:'Prospects',        v: prospectCount,                                   c: C.accent3 },
          { l:'Positive Replies', v: positiveCount,                                   c: C.green   },
          { l:'Hot Leads 🔥',     v: hotCount,                                        c: hotCount > 0 ? C.green : C.muted },
        ].map((k, i) => (
          <div key={i} className="card card--sm">
            <div className="kpi-label">{k.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:k.c, fontFamily:'var(--mono)' }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['pipeline','◉ Pipeline'],['find','🔍 Find Leads']].map(([id, label]) => (
          <button
            key={id}
            className={`btn${subTab === id ? ' btn--primary' : ' btn--ghost'}`}
            onClick={() => setSubTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'pipeline' && (
        <Pipeline
          leads={leads}
          setLeads={setLeads}
          setClients={setClients}
          setTab={setTab}
          onAddLead={() => setShowAddLead(true)}
          toast={showToast}
        />
      )}
      {subTab === 'find' && (
        <FindLeads leads={leads} setLeads={setLeads} apifyRuns={apifyRuns} setApifyRuns={setApifyRuns} />
      )}

      {showAddLead && (
        <AddLeadModal
          onAdd={addLead}
          onClose={() => setShowAddLead(false)}
        />
      )}

      {toastMsg && (
        <Toast msg={toastMsg} onDone={() => setToastMsg('')} />
      )}
    </section>
  );
}
