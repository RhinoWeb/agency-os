import { useState } from 'react';
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

function ScoreBadge({ score }) {
  const color = score >= 80 ? C.green : score >= 60 ? C.accent3 : C.red;
  return (
    <span style={{ fontFamily:'var(--mono)', fontSize:10, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:4, padding:'1px 6px' }}>
      {score}
    </span>
  );
}

// ── Pipeline tab ────────────────────────────────────────────────
function Pipeline({ leads, setLeads, setClients, setTab }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const statuses = ['all', 'lead', 'prospect', 'active', 'lost'];

  const visible = leads
    .filter(l => filter === 'all' || l.status === filter)
    .filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase()));

  function updateLead(id, patch) {
    setLeads(p => p.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  function graduateToClient(lead) {
    if (!window.confirm(`Move "${lead.name}" to Clients as an active client?`)) return;
    setClients(p => [
      ...p,
      {
        id:           `c-${Date.now()}`,
        name:         lead.company || lead.name,
        clientType:   'brand',
        status:       'active',
        mrr:          0,
        health:       80,
        contact:      lead.name,
        email:        lead.email,
        since:        new Date().toISOString().split('T')[0],
        services:     [],
        nextMeeting:  '—',
        notes:        lead.notes,
        color:        C.accent,
      }
    ]);
    setLeads(p => p.filter(l => l.id !== lead.id));
    setTab('clients');
  }

  function deleteLead(id) {
    if (window.confirm('Remove this lead?')) setLeads(p => p.filter(l => l.id !== id));
  }

  const counts = statuses.slice(1).reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {});

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16, alignItems:'center' }}>
        <input
          className="input"
          style={{ width:220, flexShrink:0 }}
          placeholder="Search leads…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {statuses.map(s => (
            <button
              key={s}
              className={`btn btn--sm${filter === s ? '' : ' btn--ghost'}`}
              style={filter === s ? { background:`${C.accent}15`, borderColor:C.accent, color:C.accent } : {}}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? `All (${leads.length})` : `${s} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Lead list */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {visible.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)', fontSize:13 }}>
            No leads found. Use "Find Leads" to pull from Apify.
          </div>
        )}
        {visible.map(lead => {
          const isExp = expanded === lead.id;
          const sc = STATUS_COLORS[lead.status] ?? C.muted;
          const rc = REPLY_COLORS[lead.replyStatus] ?? C.muted;
          return (
            <div key={lead.id} className="card" style={{ padding:'12px 16px', borderLeft:`3px solid ${sc}` }}>
              <div
                style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}
                onClick={() => setExpanded(isExp ? null : lead.id)}
              >
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700, fontSize:13 }}>{lead.name}</span>
                    <span style={{ fontSize:11, color:'var(--muted)' }}>{lead.title} @ {lead.company}</span>
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginTop:3, fontFamily:'var(--mono)' }}>
                    {lead.location} · {lead.industry} · {lead.employees} employees
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                  <ScoreBadge score={lead.leadScore} />
                  <Badge label={lead.status} color={sc} />
                  {lead.replyStatus !== 'none' && <Badge label={lead.replyStatus} color={rc} />}
                  <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)' }}>
                    step {lead.sequenceStep}/12
                  </span>
                </div>
              </div>

              {isExp && (
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                    <div>
                      <div className="section-label mb-4">Email</div>
                      <a href={`mailto:${lead.email}`} style={{ fontSize:12, color:C.accent }}>{lead.email}</a>
                    </div>
                    <div>
                      <div className="section-label mb-4">LinkedIn</div>
                      <a href={`https://${lead.linkedIn}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:C.accent }}>
                        {lead.linkedIn ? 'View Profile ↗' : '—'}
                      </a>
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
                      <div className="section-label mb-4">Lead Score</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <input
                          type="range" min={0} max={100}
                          value={lead.leadScore}
                          onChange={e => updateLead(lead.id, { leadScore: Number(e.target.value) })}
                          style={{ flex:1 }}
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
                      value={lead.notes}
                      onChange={e => updateLead(lead.id, { notes: e.target.value })}
                      placeholder="Add notes…"
                    />
                  </div>

                  <div style={{ marginBottom:10 }}>
                    <div className="section-label mb-4">Sequence Progress</div>
                    <ProgressBar value={(lead.sequenceStep / 12) * 100} color={sc} height={4} />
                    <div style={{ fontSize:10, color:'var(--muted)', marginTop:4, fontFamily:'var(--mono)' }}>
                      Step {lead.sequenceStep} of 12
                    </div>
                  </div>

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
  const [actor,     setActor]     = useState(ACTORS[0].id);
  const [searchUrl, setSearchUrl] = useState('');
  const [maxItems,  setMaxItems]  = useState(50);
  const [running,   setRunning]   = useState(false);
  const [runStatus, setRunStatus] = useState(null); // { runId, datasetId, status, progress }
  const [preview,   setPreview]   = useState([]); // normalized leads to import
  const [importing, setImporting] = useState(false);
  const [pollTimer, setPollTimer] = useState(null);
  const [error,     setError]     = useState('');

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); setPollTimer(null); }
  }

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

      // Poll every 4 seconds
      const tid = setInterval(async () => {
        try {
          const sr = await fetch(`/api/apify/status/${d.runId}`);
          const sd = await sr.json();
          setRunStatus(prev => ({ ...prev, status: sd.status, datasetId: sd.datasetId ?? prev?.datasetId }));
          setApifyRuns(p => p.map(r2 => r2.runId === d.runId ? { ...r2, status: sd.status, datasetId: sd.datasetId } : r2));

          if (sd.status === 'SUCCEEDED') {
            clearInterval(tid);
            setPollTimer(null);
            // Fetch results
            const rr = await fetch(`/api/apify/results/${sd.datasetId}?limit=${maxItems}`);
            const rd = await rr.json();
            // Normalize
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
    const newLeads = preview.filter(p => !leads.some(l => l.email && l.email === p.email));
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

        {/* Recent runs */}
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
        {/* Status card */}
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

        {/* Preview table */}
        {preview.length > 0 && (
          <div className="card" style={{ padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div className="section-label">Preview — {preview.length} leads found</div>
                <div style={{ fontSize:10, color:'var(--muted)' }}>
                  {preview.filter(p => !leads.some(l => l.email && l.email === p.email)).length} new · {preview.filter(p => leads.some(l => l.email && l.email === p.email)).length} duplicates
                </div>
              </div>
              <button
                className="btn btn--primary"
                onClick={importLeads}
                disabled={importing}
              >
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
                    const isDup = leads.some(ex => ex.email && ex.email === l.email);
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
  const [subTab, setSubTab] = useState('pipeline');

  const prospectCount = leads.filter(l => l.status === 'prospect').length;
  const positiveCount = leads.filter(l => l.replyStatus === 'positive').length;
  const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + l.leadScore, 0) / leads.length) : 0;

  return (
    <section className="view" aria-labelledby="leads-title">
      <header style={{ marginBottom:20 }}>
        <h1 id="leads-title" className="view-title">Lead Finder</h1>
        <p className="view-subtitle">Pull leads from Apify and manage your pipeline</p>
      </header>

      {/* KPI row */}
      <div className="grid-4 mb-18">
        {[
          { l:'Total Leads',  v: leads.length,     c: C.accent  },
          { l:'Prospects',    v: prospectCount,    c: C.accent3 },
          { l:'Positive Replies', v: positiveCount, c: C.green  },
          { l:'Avg Score',    v: `${avgScore}%`,   c: avgScore >= 70 ? C.green : C.yellow },
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
        <Pipeline leads={leads} setLeads={setLeads} setClients={setClients} setTab={setTab} />
      )}
      {subTab === 'find' && (
        <FindLeads leads={leads} setLeads={setLeads} apifyRuns={apifyRuns} setApifyRuns={setApifyRuns} />
      )}
    </section>
  );
}
