import { useState, useRef } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import EmptyState from '../components/ui/EmptyState.jsx';

const TONES = ['consultative', 'direct', 'friendly', 'authoritative', 'storytelling'];
const STATUS_COLORS = { active:'#4285F4', draft:C.muted, paused:C.yellow, completed:C.green };

// ── Campaign creation modal (4 steps) ──────────────────────────
function CampaignModal({ leads, agents, onSave, onClose }) {
  const trapRef = useFocusTrap();
  const [step,     setStep]     = useState(1);
  const [selLeads, setSelLeads] = useState([]);
  const [brief,    setBrief]    = useState({ offer:'', icp:'', tone:'consultative', caseStudy:'' });
  const [sequence, setSequence] = useState([]);
  const [genning,  setGenning]  = useState(false);
  const [name,     setName]     = useState('');
  const [genError, setGenError] = useState('');

  function toggleLead(id) {
    setSelLeads(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  function setBriefKey(k, v) { setBrief(p => ({ ...p, [k]: v })); }

  async function generateSequence() {
    setGenning(true);
    setGenError('');
    try {
      const r = await fetch('/api/ai/sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Generation failed');
      setSequence(d.sequence ?? []);
      setStep(3);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenning(false);
    }
  }

  async function launch() {
    const camp = {
      id:          crypto.randomUUID(),
      name:        name || `Campaign — ${new Date().toLocaleDateString()}`,
      status:      'draft', // becomes 'active' after Instantly push
      createdAt:   new Date().toISOString().split('T')[0],
      leadIds:     selLeads,
      instantlyCampaignId: null,
      brief,
      sequence,
      stats: { sent:0, opened:0, replied:0, booked:0, openRate:0, replyRate:0 },
    };

    // Try to push to Instantly if key is available
    try {
      const cr = await fetch('/api/instantly/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: camp.name,
          sequence: sequence.map(s => ({ subject: s.subject, body: s.body, delay: s.delay })),
        }),
      });
      if (cr.ok) {
        const cd = await cr.json();
        camp.instantlyCampaignId = cd.campaignId;

        // Add leads
        const selectedLeads = (leads ?? []).filter(l => selLeads.includes(l.id));
        await fetch('/api/instantly/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: cd.campaignId, leads: selectedLeads }),
        });
        camp.status = 'active';
      }
    } catch (err) {
      console.warn('Instantly push failed, saving as draft:', err.message);
    }

    onSave(camp, selLeads);
  }

  const STEPS = ['Select Leads', 'Campaign Brief', 'AI Sequence', 'Review & Launch'];
  const leadCandidates = (leads ?? []).filter(l => l.status === 'lead' || l.status === 'prospect');

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="camp-modal-title" onClick={onClose} ref={trapRef}>
      <div className="modal" style={{ maxWidth:680, width:'92vw' }} onClick={e => e.stopPropagation()}>
        {/* Step indicator */}
        <div style={{ display:'flex', gap:0, marginBottom:24 }}>
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = step > n;
            const cur  = step === n;
            return (
              <div key={i} style={{ flex:1, textAlign:'center' }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%', margin:'0 auto 4px',
                  background: done ? C.green : cur ? C.accent : 'var(--surface2)',
                  border: `2px solid ${done ? C.green : cur ? C.accent : 'var(--border)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, color: (done || cur) ? '#000' : 'var(--muted)',
                }}>
                  {done ? '✓' : n}
                </div>
                <div style={{ fontSize:9, color: cur ? C.accent : 'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.5 }}>{s}</div>
              </div>
            );
          })}
        </div>

        <h2 id="camp-modal-title" className="modal-title">{STEPS[step - 1]}</h2>

        {/* Step 1 — Select Leads */}
        {step === 1 && (
          <div>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:12 }}>
              {leadCandidates.length} leads available. Select who to enroll.
            </div>
            {leadCandidates.length === 0 && (
              <div style={{ textAlign:'center', padding:24, color:'var(--muted)', fontSize:12 }}>
                No leads in pipeline yet. Add leads in Lead Finder first.
              </div>
            )}
            <div style={{ maxHeight:260, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {leadCandidates.map(l => {
                const sel = selLeads.includes(l.id);
                return (
                  <div
                    key={l.id}
                    onClick={() => toggleLead(l.id)}
                    style={{
                      display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, cursor:'pointer',
                      border: `1px solid ${sel ? C.accent : 'var(--border)'}`,
                      background: sel ? `${C.accent}10` : 'var(--surface2)',
                    }}
                  >
                    <div style={{
                      width:16, height:16, borderRadius:3, border:`2px solid ${sel ? C.accent : 'var(--border)'}`,
                      background: sel ? C.accent : 'transparent', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#000',
                    }}>
                      {sel && '✓'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{l.name} <span style={{ fontWeight:400, color:'var(--muted)' }}>@ {l.company}</span></div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>{l.email} · Score: {l.leadScore}</div>
                    </div>
                    <Badge label={l.status} color={STATUS_COLORS[l.status] ?? C.muted} />
                  </div>
                );
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:16, alignItems:'center' }}>
              <span style={{ fontSize:11, color:'var(--muted)' }}>{selLeads.length} selected</span>
              <div className="form-actions">
                <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
                <button className="btn btn--primary" disabled={selLeads.length === 0} onClick={() => setStep(2)}>
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Brief */}
        {step === 2 && (
          <div className="form-stack" style={{ gap:12 }}>
            <div>
              <label className="settings-label">Campaign Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Q1 SaaS Growth Campaign" />
            </div>
            <div>
              <label className="settings-label">Your Offer (1–2 sentences)</label>
              <textarea className="input" rows={2} style={{ resize:'vertical' }} value={brief.offer}
                onChange={e => setBriefKey('offer', e.target.value)}
                placeholder="We help B2B SaaS companies grow organic traffic 2x in 90 days with our content engine…" />
            </div>
            <div>
              <label className="settings-label">Ideal Customer Profile (ICP)</label>
              <input className="input" value={brief.icp} onChange={e => setBriefKey('icp', e.target.value)}
                placeholder="B2B SaaS founders & VP Marketing, 10-500 employees, Series A-B" />
            </div>
            <div>
              <label className="settings-label">Tone</label>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {TONES.map(t => (
                  <button key={t} type="button"
                    style={{
                      padding:'5px 10px', borderRadius:6, cursor:'pointer', fontSize:11,
                      border:`1px solid ${brief.tone === t ? C.accent : 'var(--border)'}`,
                      background: brief.tone === t ? `${C.accent}15` : 'var(--surface2)',
                      color: brief.tone === t ? C.accent : 'var(--muted)',
                    }}
                    onClick={() => setBriefKey('tone', t)}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="settings-label">Case Study / Proof Point</label>
              <input className="input" value={brief.caseStudy} onChange={e => setBriefKey('caseStudy', e.target.value)}
                placeholder="TechFlow grew organic traffic 240% in 6 months" />
            </div>
            {genError && (
              <div style={{ fontSize:11, color:C.red, background:`${C.red}10`, border:`1px solid ${C.red}25`, borderRadius:6, padding:'6px 10px' }}>
                ⚠ {genError}
              </div>
            )}
            <div className="form-actions" style={{ justifyContent:'flex-end', marginTop:4 }}>
              <button className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn--primary" disabled={genning || !brief.offer || !brief.icp} onClick={generateSequence}>
                {genning ? '🧠 Generating…' : '🧠 Generate 12-Step Sequence'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Sequence preview */}
        {step === 3 && (
          <div>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:12 }}>
              Review your AI-generated 12-step sequence. Click any email to edit.
            </div>
            <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
              {sequence.map((s, i) => (
                <div key={i} className="card" style={{ padding:'10px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                        <span style={{ fontSize:10, color:C.accent, fontFamily:'var(--mono)', background:`${C.accent}15`, border:`1px solid ${C.accent}30`, borderRadius:4, padding:'1px 6px' }}>
                          Step {s.step}
                        </span>
                        <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)' }}>Day +{s.delay}</span>
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{s.subject}</div>
                      <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5 }}>{s.body?.slice(0, 100)}…</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="form-actions" style={{ justifyContent:'flex-end', marginTop:16 }}>
              <button className="btn btn--ghost" onClick={() => setStep(2)}>← Regenerate</button>
              <button className="btn btn--primary" onClick={() => setStep(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Review & Launch */}
        {step === 4 && (
          <div>
            <div className="card" style={{ padding:16, marginBottom:16 }}>
              <div className="section-label mb-10">Campaign Summary</div>
              <div className="form-grid" style={{ fontSize:12, gap:8 }}>
                <div><span style={{ color:'var(--muted)' }}>Name:</span> {name || 'Untitled Campaign'}</div>
                <div><span style={{ color:'var(--muted)' }}>Leads:</span> {selLeads.length}</div>
                <div><span style={{ color:'var(--muted)' }}>Tone:</span> {brief.tone}</div>
                <div><span style={{ color:'var(--muted)' }}>Steps:</span> {sequence.length} emails</div>
              </div>
            </div>
            <div className="card" style={{ padding:14, marginBottom:16 }}>
              <div className="section-label mb-8">Brief</div>
              <div style={{ fontSize:12, lineHeight:1.6, color:'var(--muted)' }}>
                <strong style={{ color:'var(--text)' }}>Offer:</strong> {brief.offer}<br/>
                <strong style={{ color:'var(--text)' }}>ICP:</strong> {brief.icp}<br/>
                {brief.caseStudy && <><strong style={{ color:'var(--text)' }}>Proof:</strong> {brief.caseStudy}</>}
              </div>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:16, background:`${C.accent}08`, border:`1px solid ${C.accent}20`, borderRadius:8, padding:'10px 14px' }}>
              🚀 Campaign will be saved locally. If INSTANTLY_API_KEY is set, it will also be pushed live to Instantly.ai automatically.
            </div>
            <div className="form-actions" style={{ justifyContent:'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setStep(3)}>← Back</button>
              <button className="btn btn--primary" onClick={launch}>🚀 Launch Campaign</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Campaign card ───────────────────────────────────────────────
function CampaignCard({ camp, leads, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_COLORS[camp.status] ?? C.muted;
  const campLeads = (leads ?? []).filter(l => (camp.leadIds ?? []).includes(l.id));

  return (
    <div className="card" style={{ padding:'14px 18px', borderLeft:`3px solid ${sc}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={() => setExpanded(p => !p)}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontWeight:700, fontSize:14 }}>{camp.name}</span>
            <Badge label={camp.status} color={sc} />
            {camp.instantlyCampaignId && (
              <span style={{ fontSize:9, fontFamily:'var(--mono)', color:'#4285F4', border:'1px solid #4285F430', borderRadius:4, padding:'1px 5px' }}>Instantly Live</span>
            )}
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:3, fontFamily:'var(--mono)' }}>
            {campLeads.length} leads · {camp.sequence.length} emails · Created {camp.createdAt}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:16, flexShrink:0 }}>
          {[
            { l:'Sent',    v: camp.stats.sent,     c:'var(--text)' },
            { l:'Opened',  v: `${camp.stats.openRate}%`,  c: C.accent3 },
            { l:'Replied', v: `${camp.stats.replyRate}%`, c: C.accent },
            { l:'Booked',  v: camp.stats.booked,   c: C.green },
          ].map((s, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:700, color:s.c, fontFamily:'var(--mono)' }}>{s.v}</div>
              <div style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
          <div className="grid-2" style={{ gap:16 }}>
            {/* Brief */}
            <div>
              <div className="section-label mb-8">Campaign Brief</div>
              <div style={{ fontSize:11, lineHeight:1.6, color:'var(--muted)' }}>
                <div><strong style={{ color:'var(--text)' }}>Offer:</strong> {camp.brief.offer}</div>
                <div><strong style={{ color:'var(--text)' }}>ICP:</strong> {camp.brief.icp}</div>
                <div><strong style={{ color:'var(--text)' }}>Tone:</strong> {camp.brief.tone}</div>
                {camp.brief.caseStudy && <div><strong style={{ color:'var(--text)' }}>Proof:</strong> {camp.brief.caseStudy}</div>}
              </div>
            </div>

            {/* Stats bars */}
            <div>
              <div className="section-label mb-8">Performance</div>
              {[
                { l:'Open Rate',  v:camp.stats.openRate,  c:C.accent3 },
                { l:'Reply Rate', v:camp.stats.replyRate, c:C.accent  },
                { l:'Book Rate',  v:camp.stats.booked > 0 ? Math.round((camp.stats.booked / Math.max(camp.stats.sent, 1)) * 100) : 0, c:C.green },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.5 }}>{s.l}</span>
                    <span style={{ fontSize:10, fontWeight:700, fontFamily:'var(--mono)', color:s.c }}>{s.v}%</span>
                  </div>
                  <ProgressBar value={s.v} color={s.c} height={3} />
                </div>
              ))}
            </div>
          </div>

          {/* Sequence preview */}
          <div style={{ marginTop:14 }}>
            <div className="section-label mb-8">Email Sequence ({camp.sequence.length} steps)</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {camp.sequence.map(s => (
                <div key={s.step}
                  title={`Step ${s.step}: ${s.subject}`}
                  style={{
                    padding:'3px 8px', borderRadius:4, fontSize:9, fontFamily:'var(--mono)',
                    background:`${sc}15`, border:`1px solid ${sc}30`, color:sc, cursor:'default',
                  }}
                >
                  D+{s.delay}
                </div>
              ))}
            </div>
          </div>

          {/* Lead list */}
          {campLeads.length > 0 && (
            <div style={{ marginTop:14 }}>
              <div className="section-label mb-8">Enrolled Leads ({campLeads.length})</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {campLeads.map(l => (
                  <span key={l.id} style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:'var(--surface2)', border:'1px solid var(--border)' }}>
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop:14, display:'flex', gap:8 }}>
            <button
              className="btn btn--sm"
              style={{ background:`${C.red}12`, borderColor:C.red, color:C.red }}
              onClick={() => openConfirm({
                title: `Delete "${camp.name}"?`,
                message: 'This campaign and its stats will be permanently removed.',
                confirmLabel: 'Delete Campaign',
                danger: true,
                onConfirm: () => onDelete(camp.id),
              })}
            >
              ✕ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const REPLY_COLORS = { positive: C.green, 'booking-link-sent': C.accent, neutral: C.accent3, negative: C.red };
const INTENT_LABELS = { POSITIVE: '🟢 Positive', NEGATIVE: '🔴 Negative', NEUTRAL: '🟡 Neutral', UNSUBSCRIBE: '🚫 Unsub', REFERRAL: '🔄 Referral', MAYBE_LATER: '⏳ Later' };
const INTENT_COLORS = { POSITIVE: C.green, NEGATIVE: C.red, NEUTRAL: C.accent3, UNSUBSCRIBE: C.red, REFERRAL: C.accent, MAYBE_LATER: C.yellow };

// ── Main view ───────────────────────────────────────────────────
export default function Campaigns({ campaigns, setCampaigns, leads, setLeads, agents, bookMeeting, sendBookingLink, pipelineConfig, openConfirm }) {
  const [showModal, setShowModal] = useState(false);
  const [subTab,    setSubTab]    = useState('campaigns');
  const [bookingLead, setBookingLead] = useState(null);
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDur,  setBookingDur]  = useState(30);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingMode, setBookingMode] = useState('fixed'); // 'fixed' | 'calcom'

  const totalSent   = campaigns.reduce((s, c) => s + c.stats.sent, 0);
  const totalBooked = campaigns.reduce((s, c) => s + c.stats.booked, 0);
  const avgOpen     = campaigns.length
    ? Math.round(campaigns.reduce((s, c) => s + c.stats.openRate, 0) / campaigns.length)
    : 0;
  const avgReply    = campaigns.length
    ? Math.round(campaigns.reduce((s, c) => s + c.stats.replyRate, 0) / campaigns.length)
    : 0;

  function saveCampaign(camp, selectedLeadIds) {
    setCampaigns(p => [camp, ...p]);
    setLeads(p => p.map(l => selectedLeadIds.includes(l.id) ? { ...l, campaignId: camp.id, sequenceStep: 1 } : l));
    setShowModal(false);
  }

  function deleteCampaign(id) {
    setCampaigns(p => p.filter(c => c.id !== id));
  }

  const replies = (leads ?? []).filter(l => l.replyStatus && l.replyStatus !== 'none');
  const replyGroups = { positive: [], 'booking-link-sent': [], neutral: [], negative: [] };
  replies.forEach(l => { if (replyGroups[l.replyStatus]) replyGroups[l.replyStatus].push(l); });

  function bookCall(lead) {
    const d = new Date();
    d.setDate(d.getDate() + (d.getDay() >= 5 ? 8 - d.getDay() : 1));
    d.setHours(10, 0, 0, 0);
    setBookingTime(d.toISOString().slice(0, 16));
    setBookingDur(30);
    setBookingResult(null);
    setBookingMode(pipelineConfig?.bookingMode === 'calcom' && pipelineConfig?.calEventTypeId ? 'calcom' : 'fixed');
    setBookingLead(lead);
  }

  async function confirmBooking() {
    if (!bookingLead) return;
    setBookingBusy(true);
    try {
      if (bookingMode === 'calcom' && sendBookingLink) {
        const result = await sendBookingLink(bookingLead);
        setBookingResult(result);
      } else {
        if (!bookingTime || !bookMeeting) return;
        const result = await bookMeeting(bookingLead, new Date(bookingTime).toISOString(), bookingDur);
        setBookingResult(result);
      }
    } catch (err) {
      setBookingResult({ error: err.message });
    } finally {
      setBookingBusy(false);
    }
  }

  function markLost(lead) {
    setLeads(p => p.map(l => l.id === lead.id ? { ...l, status: 'lost' } : l));
  }

  return (
    <section className="view" aria-labelledby="campaigns-title">
      <header className="view-header">
        <div>
          <h1 id="campaigns-title" className="view-title">Campaigns</h1>
          <p className="view-subtitle">AI-powered cold email sequences via Instantly.ai</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* Sub-tabs */}
          {[
            { id:'campaigns', label:'📨 Campaigns' },
            { id:'replies',   label:`📬 Replies${replies.length > 0 ? ` (${replies.length})` : ''}` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              style={{
                padding:'6px 14px', borderRadius:8, fontSize:11, cursor:'pointer',
                fontFamily:'var(--mono)', border:`1px solid ${subTab === t.id ? 'var(--accent)' : 'var(--border)'}`,
                background: subTab === t.id ? 'rgba(0,255,178,0.1)' : 'var(--surface2)',
                color: subTab === t.id ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              {t.label}
            </button>
          ))}
          {subTab === 'campaigns' && (
            <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ New Campaign</button>
          )}
        </div>
      </header>

      {/* KPI row */}
      <div className="grid-4 mb-18">
        {[
          { l:'Campaigns',  v: campaigns.length, c: C.accent  },
          { l:'Total Sent', v: totalSent,         c: C.accent3 },
          { l:'Avg Open',   v: `${avgOpen}%`,     c: C.yellow  },
          { l:'Calls Booked', v: totalBooked,     c: C.green   },
        ].map((k, i) => (
          <div key={i} className="card card--sm">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value-lg" style={{ color:k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Campaign list */}
      {subTab === 'campaigns' && (
        <div className="form-stack" style={{ gap:10 }}>
          {campaigns.length === 0 && !showModal && (
            <EmptyState icon="📨" title="No campaigns yet" subtitle="Create an AI-generated cold email sequence to start outreach" action="+ New Campaign" onAction={() => setShowModal(true)} />
          )}
          {campaigns.map(c => (
            <CampaignCard key={c.id} camp={c} leads={leads} onDelete={deleteCampaign} />
          ))}
        </div>
      )}

      {/* Reply Inbox */}
      {subTab === 'replies' && (
        <div className="form-stack" style={{ gap:14 }}>
          {replies.length === 0 && (
            <div className="card" style={{ padding:48, textAlign:'center', color:'var(--muted)' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📬</div>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>No replies yet</div>
              <div style={{ fontSize:12 }}>Replies from your outreach campaigns will appear here.</div>
            </div>
          )}
          {Object.entries(replyGroups).map(([type, items]) => items.length === 0 ? null : (
            <div key={type}>
              <div className="section-label mb-8" style={{ color: REPLY_COLORS[type] ?? 'var(--accent)' }}>
                {type === 'positive' ? '✅' : type === 'booking-link-sent' ? '📅' : type === 'neutral' ? '💬' : '❌'} {type === 'booking-link-sent' ? 'LINK SENT' : type.toUpperCase()} ({items.length})
              </div>
              <div className="form-stack" style={{ gap:8 }}>
                {items.map(lead => (
                  <div key={lead.id} className="card" style={{
                    padding:'12px 16px',
                    borderLeft:`3px solid ${REPLY_COLORS[type] ?? 'var(--accent)'}`,
                    display:'flex', alignItems:'center', gap:12,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontWeight:600, fontSize:13 }}>{lead.name} <span style={{ color:'var(--muted)', fontWeight:400 }}>@ {lead.company}</span></span>
                        {lead.replyClassification?.intent && (
                          <span style={{
                            fontSize:10, fontFamily:'var(--mono)', fontWeight:600,
                            padding:'2px 8px', borderRadius:99,
                            background:`${INTENT_COLORS[lead.replyClassification.intent] ?? 'var(--muted)'}18`,
                            color: INTENT_COLORS[lead.replyClassification.intent] ?? 'var(--muted)',
                            border:`1px solid ${INTENT_COLORS[lead.replyClassification.intent] ?? 'var(--muted)'}30`,
                          }}>
                            {INTENT_LABELS[lead.replyClassification.intent] ?? lead.replyClassification.intent}
                            {lead.replyClassification.confidence ? ` ${Math.round(lead.replyClassification.confidence * 100)}%` : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, fontFamily:'var(--mono)' }}>
                        {lead.email} · Score {lead.leadScore} · Step {lead.sequenceStep ?? '—'}
                        {lead.replyReceivedAt && ` · Replied ${new Date(lead.replyReceivedAt).toLocaleDateString()}`}
                      </div>
                      {(lead.replyClassification?.summary || lead.replySnippet) && (
                        <div style={{ fontSize:11, color:'var(--dim)', marginTop:6, fontStyle:'italic', background:'var(--surface2)', borderRadius:6, padding:'6px 10px' }}>
                          {lead.replyClassification?.summary ? `AI: ${lead.replyClassification.summary}` : `"${lead.replySnippet}"`}
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      {type === 'positive' && (
                        <button
                          className="btn btn--sm"
                          style={{ background:`${C.green}15`, borderColor:C.green, color:C.green }}
                          onClick={() => bookCall(lead)}
                        >
                          📅 Book Call
                        </button>
                      )}
                      {type === 'booking-link-sent' && lead.calBookingUrl && (
                        <button className="btn btn--sm" style={{ background:`${C.accent}15`, borderColor:C.accent, color:C.accent }}
                          onClick={() => { navigator.clipboard.writeText(lead.calBookingUrl); }}>
                          📋 Copy Link
                        </button>
                      )}
                      <button
                        className="btn btn--sm"
                        style={{ background:`${C.red}12`, borderColor:C.red, color:C.red }}
                        onClick={() => markLost(lead)}
                      >
                        ✕ Mark Lost
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CampaignModal
          leads={leads}
          agents={agents}
          onSave={saveCampaign}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Book Call Modal */}
      {bookingLead && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !bookingBusy && setBookingLead(null)}>
          <div className="modal" style={{ maxWidth:420 }}>
            <div className="flex-between" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15, fontWeight:700, fontFamily:'var(--sans)' }}>📅 Book Discovery Call</h3>
              <button className="btn btn--sm" onClick={() => setBookingLead(null)} disabled={bookingBusy}>✕</button>
            </div>
            <div style={{ fontSize:13, color:'var(--dim)', marginBottom:14 }}>
              <strong>{bookingLead.name}</strong> @ {bookingLead.company} · {bookingLead.email}
            </div>

            {bookingResult?.error ? (
              <div style={{ padding:12, background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, color:'var(--red)', fontSize:12, marginBottom:12 }}>
                {bookingResult.error}
              </div>
            ) : bookingResult ? (
              <div style={{ padding:14, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:8, marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.green, marginBottom:8 }}>
                  {bookingResult.bookingUrl ? 'Booking link ready' : 'Call booked'}
                </div>
                {bookingResult.bookingUrl && (
                  <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--dim)', marginBottom:6, wordBreak:'break-all' }}>
                    Link: <a href={bookingResult.bookingUrl} target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>{bookingResult.bookingUrl}</a>
                    <button className="btn btn--sm" style={{ marginLeft:8, fontSize:9, padding:'2px 6px' }}
                      onClick={() => { navigator.clipboard.writeText(bookingResult.bookingUrl); }}>Copy</button>
                  </div>
                )}
                {bookingResult.zoomJoinUrl && (
                  <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--dim)', marginBottom:4 }}>
                    Zoom: <a href={bookingResult.zoomJoinUrl} target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>{bookingResult.zoomJoinUrl}</a>
                  </div>
                )}
                {bookingResult.calendarLink && (
                  <div style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--dim)' }}>
                    Calendar: <a href={bookingResult.calendarLink} target="_blank" rel="noreferrer" style={{ color:'var(--accent)' }}>View event</a>
                  </div>
                )}
                <button className="btn btn--primary" style={{ marginTop:12, width:'100%' }} onClick={() => setBookingLead(null)}>Done</button>
              </div>
            ) : (
              <>
                {/* Mode toggle */}
                {pipelineConfig?.calEventTypeId && (
                  <div style={{ display:'flex', gap:10, marginBottom:12, padding:'8px 10px', background:'var(--surface2)', borderRadius:6, border:'1px solid var(--border)' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--sans)', cursor:'pointer', color: bookingMode === 'fixed' ? 'var(--accent)' : 'var(--muted)' }}>
                      <input type="radio" name="bm" checked={bookingMode === 'fixed'} onChange={() => setBookingMode('fixed')} />
                      Fixed Time
                    </label>
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--sans)', cursor:'pointer', color: bookingMode === 'calcom' ? 'var(--accent)' : 'var(--muted)' }}>
                      <input type="radio" name="bm" checked={bookingMode === 'calcom'} onChange={() => setBookingMode('calcom')} />
                      Self-Schedule (Cal.com)
                    </label>
                  </div>
                )}

                {bookingMode === 'calcom' ? (
                  <div style={{ textAlign:'center', padding:'8px 0' }}>
                    <p style={{ fontSize:12, color:'var(--dim)', marginBottom:10 }}>
                      Generate a Cal.com booking link so <strong>{bookingLead.name}</strong> can pick their own time.
                    </p>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn" style={{ flex:1 }} onClick={() => setBookingLead(null)} disabled={bookingBusy}>Cancel</button>
                      <button className="btn btn--primary" style={{ flex:1 }} onClick={confirmBooking} disabled={bookingBusy}>
                        {bookingBusy ? 'Generating…' : '📅 Generate Link'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="settings-field">
                      <label className="settings-label">Date & Time</label>
                      <input type="datetime-local" className="input" value={bookingTime} onChange={e => setBookingTime(e.target.value)} />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">Duration</label>
                      <select className="input" value={bookingDur} onChange={e => setBookingDur(+e.target.value)}>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>
                    <div className="form-actions" style={{ marginTop:8 }}>
                      <button className="btn" style={{ flex:1 }} onClick={() => setBookingLead(null)} disabled={bookingBusy}>Cancel</button>
                      <button className="btn btn--primary" style={{ flex:1 }} onClick={confirmBooking} disabled={bookingBusy || !bookingTime}>
                        {bookingBusy ? 'Booking…' : 'Book Call'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
