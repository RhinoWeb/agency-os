import { useState, useMemo } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import ViewSwitcher from '../components/ui/ViewSwitcher.jsx';
import { C, MONO } from '../theme.js';
import { DEAL_STAGES } from '../data.js';
import { Columns3, Table, Clock } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────
function daysSince(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  if (isNaN(d)) return 999;
  return Math.floor((Date.now() - d) / 86400000);
}

function fmtCurrency(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Deal Card ────────────────────────────────────────────────────
function DealCard({ deal, stage, contacts, companies, onSelect, onDragStart }) {
  const contact = contacts.find(c => c.id === deal.contactId);
  const company = companies.find(c => c.id === deal.companyId);
  const idle = daysSince(deal.lastActivity);
  const isRotting = stage.rottingDays && idle >= stage.rottingDays;
  const isWarning = stage.rottingDays && idle >= stage.rottingDays - 2 && !isRotting;

  return (
    <div
      className="card"
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', deal.id); onDragStart?.(deal.id); }}
      onClick={() => onSelect(deal)}
      style={{
        padding: '12px 14px',
        cursor: 'grab',
        borderLeft: `3px solid ${isRotting ? C.red : stage.color}`,
        ...(isRotting ? { boxShadow: `inset 0 0 0 1px ${C.red}25, 0 0 12px ${C.red}10` } : {}),
        transition: 'box-shadow 0.2s, border-color 0.2s',
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 6 }}>
        {deal.title}
        {deal.tags?.includes('auto-created') && (
          <span style={{ fontSize: 8, fontFamily: MONO, fontWeight: 700, color: C.accent, background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 3, padding: '1px 5px', letterSpacing: 0.8 }}>AUTO</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: MONO, color: stage.color }}>
          {fmtCurrency(deal.value)}<span style={{ fontSize: 9, color: 'var(--muted)' }}>/mo</span>
        </span>
        {deal.tags?.map(t => (
          <span key={t} style={{ fontSize: 8, fontFamily: MONO, color: 'var(--muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'var(--muted)', fontFamily: MONO }}>
        <span>{contact?.name ?? '—'}{company ? ` · ${company.name}` : ''}</span>
        <span style={{ color: isRotting ? C.red : isWarning ? C.yellow : 'var(--muted)' }}>
          {isRotting ? `🔴 ${idle}d idle` : isWarning ? `⚠ ${idle}d` : `${idle}d`}
        </span>
      </div>
      {deal.expectedClose && (
        <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: MONO, marginTop: 4 }}>
          Close: {fmtDate(deal.expectedClose)}
        </div>
      )}
    </div>
  );
}

// ── Deal Detail Panel ────────────────────────────────────────────
function DealDetail({ deal, contacts, companies, stages, onUpdate, onClose, openConfirm }) {
  const contact = contacts.find(c => c.id === deal.contactId);
  const company = companies.find(c => c.id === deal.companyId);
  const stage   = stages.find(s => s.id === deal.stage) ?? stages[0];
  const idle    = daysSince(deal.lastActivity);
  const [notes, setNotes] = useState(deal.notes ?? '');
  const [lostReason, setLostReason] = useState(deal.lostReason ?? '');

  function save(patch) { onUpdate(deal.id, patch); }

  return (
    <div
      className="panel-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="panel">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontFamily: MONO, color: stage.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {stage.label} · {stage.probability}% probability
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--sans)', lineHeight: 1.3 }}>
              {deal.title}
            </h2>
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Value + dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontFamily: MONO, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Value</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, color: stage.color }}>{fmtCurrency(deal.value)}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)' }}>/month</div>
          </div>
          <div className="card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontFamily: MONO, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Weighted</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, color: 'var(--text)' }}>{fmtCurrency(Math.round(deal.value * stage.probability / 100))}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)' }}>{stage.probability}%</div>
          </div>
          <div className="card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontFamily: MONO, color: idle >= (stage.rottingDays ?? 999) ? C.red : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              {idle >= (stage.rottingDays ?? 999) ? '🔴 IDLE' : 'Last Activity'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: MONO, color: idle >= (stage.rottingDays ?? 999) ? C.red : 'var(--text)' }}>{idle}d</div>
            <div style={{ fontSize: 9, color: 'var(--muted)' }}>{fmtDate(deal.lastActivity)}</div>
          </div>
        </div>

        {/* Stage selector */}
        <div className="section-gap">
          <div className="section-label mb-8">Stage</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {stages.map(s => (
              <button
                key={s.id}
                onClick={() => save({ stage: s.id, ...(s.id !== 'closed_lost' ? { lostReason: null } : {}), lastActivity: new Date().toISOString().split('T')[0] })}
                style={{
                  padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontFamily: MONO,
                  border: `1px solid ${deal.stage === s.id ? s.color : 'var(--border)'}`,
                  background: deal.stage === s.id ? `${s.color}15` : 'var(--surface2)',
                  color: deal.stage === s.id ? s.color : 'var(--muted)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lost reason */}
        {deal.stage === 'closed_lost' && (
          <div className="section-gap">
            <div className="section-label mb-8">Lost Reason</div>
            <select
              className="input"
              value={lostReason}
              onChange={e => { setLostReason(e.target.value); save({ lostReason: e.target.value }); }}
            >
              <option value="">Select reason…</option>
              <option value="budget">Budget / Price</option>
              <option value="timing">Bad Timing</option>
              <option value="competitor">Went with Competitor</option>
              <option value="no_need">No Need / Not a Fit</option>
              <option value="no_response">No Response / Ghosted</option>
              <option value="internal">Handled Internally</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Contact + Company */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <div className="section-label mb-8">Contact</div>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{contact?.avatar} {contact?.name ?? '—'}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{contact?.title}</div>
              {contact?.email && <a href={`mailto:${contact.email}`} style={{ fontSize: 10, color: C.accent, display: 'block', marginTop: 4 }}>{contact.email}</a>}
              {contact?.phone && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{contact.phone}</div>}
            </div>
          </div>
          <div>
            <div className="section-label mb-8">Company</div>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{company?.logo} {company?.name ?? '—'}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{company?.industry} · {company?.employees}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{company?.location}</div>
              {company?.mrr > 0 && <div style={{ fontSize: 10, color: C.accent, marginTop: 4, fontFamily: MONO }}>{fmtCurrency(company.mrr)}/mo MRR</div>}
            </div>
          </div>
        </div>

        {/* Value edit */}
        <div className="section-gap">
          <div className="section-label mb-8">Deal Value ($/mo)</div>
          <input
            className="input"
            type="number"
            min={0}
            value={deal.value}
            onChange={e => save({ value: Number(e.target.value) })}
          />
        </div>

        {/* Expected close */}
        <div className="section-gap">
          <div className="section-label mb-8">Expected Close Date</div>
          <input
            className="input"
            type="date"
            value={deal.expectedClose ?? ''}
            onChange={e => save({ expectedClose: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div className="section-gap">
          <div className="section-label mb-8">Notes</div>
          <textarea
            className="input"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => save({ notes })}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Activity timeline from contact */}
        {contact?.interactions?.length > 0 && (
          <div>
            <div className="section-label mb-8">Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(contact.interactions ?? []).slice(0, 5).map(i => (
                <div key={i.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8, fontSize: 11 }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>
                    {{ call: '📞', email: '📧', meeting: '🤝', note: '📝' }[i.type] ?? '📌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text)' }}>{i.note}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: MONO, marginTop: 2 }}>{fmtDate(i.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn--primary btn--sm"
            onClick={() => save({ lastActivity: new Date().toISOString().split('T')[0] })}
          >
            ✓ Log Activity
          </button>
          <button
            className="btn btn--ghost btn--sm"
            style={{ marginLeft: 'auto', color: C.red, borderColor: `${C.red}30` }}
            onClick={() => openConfirm({
              title: 'Delete this deal?',
              message: 'This deal and all associated data will be permanently removed.',
              confirmLabel: 'Delete Deal',
              danger: true,
              onConfirm: () => { onUpdate(deal.id, '__DELETE__'); onClose(); },
            })}
          >
            Delete Deal
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Deal Modal ───────────────────────────────────────────────
function NewDealModal({ contacts, companies, stages, onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '', value: 0, stage: 'qualified', contactId: '', companyId: '',
    expectedClose: '', notes: '', tags: '',
  });
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  // Auto-fill company when contact selected
  function setContact(cid) {
    const ct = contacts.find(c => c.id === cid);
    set('contactId', cid);
    if (ct?.companyId && !form.companyId) set('companyId', ct.companyId);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({
      id: `d-${crypto.randomUUID()}`,
      title: form.title.trim(),
      value: Number(form.value) || 0,
      stage: form.stage,
      contactId: form.contactId || null,
      companyId: form.companyId || null,
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      expectedClose: form.expectedClose || null,
      lostReason: null,
      notes: form.notes.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      pipeline: 'default',
    });
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--sans)' }}>New Deal</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="settings-label form-label">Deal Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Acme Corp — SEO Retainer" autoFocus required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="settings-label form-label">Value ($/mo)</label>
              <input className="input" type="number" min={0} value={form.value} onChange={e => set('value', e.target.value)} />
            </div>
            <div>
              <label className="settings-label form-label">Stage</label>
              <select className="input" value={form.stage} onChange={e => set('stage', e.target.value)}>
                {stages.filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost').map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="settings-label form-label">Contact</label>
              <select className="input" value={form.contactId} onChange={e => setContact(e.target.value)}>
                <option value="">Select…</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="settings-label form-label">Company</label>
              <select className="input" value={form.companyId} onChange={e => set('companyId', e.target.value)}>
                <option value="">Select…</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.logo} {c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="settings-label form-label">Expected Close</label>
            <input className="input" type="date" value={form.expectedClose} onChange={e => set('expectedClose', e.target.value)} />
          </div>

          <div>
            <label className="settings-label form-label">Tags (comma-separated)</label>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="new-business, upsell, referral" />
          </div>

          <div>
            <label className="settings-label form-label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn--ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 2 }}>Create Deal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Pipeline View ───────────────────────────────────────────
export default function DealPipeline({ deals, setDeals, contacts, companies, openConfirm }) {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showNewDeal, setShowNewDeal]   = useState(false);
  const [dragging, setDragging]         = useState(null);
  const [viewMode, setViewMode]         = useState('board');

  const activeStages = DEAL_STAGES.filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost');
  const closedStages = DEAL_STAGES.filter(s => s.id === 'closed_won' || s.id === 'closed_lost');

  // KPIs
  const openDeals     = (deals ?? []).filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const totalPipeline = openDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const weightedTotal = openDeals.reduce((s, d) => {
    const st = DEAL_STAGES.find(x => x.id === d.stage);
    return s + (d.value ?? 0) * (st?.probability ?? 0) / 100;
  }, 0);
  const rottingCount  = openDeals.filter(d => {
    const st = DEAL_STAGES.find(x => x.id === d.stage);
    return st?.rottingDays && daysSince(d.lastActivity) >= st.rottingDays;
  }).length;
  const wonThisMonth  = (deals ?? []).filter(d => d.stage === 'closed_won').reduce((s, d) => s + (d.value ?? 0), 0);

  function updateDeal(id, patch) {
    if (patch === '__DELETE__') {
      setDeals(p => (p ?? []).filter(d => d.id !== id));
      return;
    }
    setDeals(p => (p ?? []).map(d => d.id === id ? { ...d, ...patch } : d));
    // Also update selected deal view
    if (selectedDeal?.id === id && patch !== '__DELETE__') {
      setSelectedDeal(prev => ({ ...prev, ...patch }));
    }
  }

  function addDeal(deal) {
    setDeals(p => [deal, ...(p ?? [])]);
  }

  function handleDrop(stageId, e) {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;
    updateDeal(dealId, {
      stage: stageId,
      lastActivity: new Date().toISOString().split('T')[0],
      ...(stageId !== 'closed_lost' ? { lostReason: null } : {}),
    });
    setDragging(null);
  }

  // Get deal by ID for detail panel (use latest state)
  const detailDeal = selectedDeal ? (deals ?? []).find(d => d.id === selectedDeal.id) : null;

  return (
    <section className="view" aria-labelledby="deals-title">
      <header className="view-header">
        <div>
          <h1 id="deals-title" className="view-title">Deal Pipeline</h1>
          <p className="view-subtitle">Track opportunities from qualification to close</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ViewSwitcher
            views={[
              { id: 'board', label: 'Board', icon: Columns3 },
              { id: 'table', label: 'Table', icon: Table },
              { id: 'timeline', label: 'Timeline', icon: Clock },
            ]}
            active={viewMode}
            onChange={setViewMode}
          />
          <button className="btn btn--primary" onClick={() => setShowNewDeal(true)}>+ New Deal</button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid-4 mb-18">
        {[
          { l: 'Pipeline Value', v: fmtCurrency(totalPipeline), c: C.accent },
          { l: 'Weighted Value', v: fmtCurrency(Math.round(weightedTotal)), c: C.accent3 },
          { l: 'Rotting Deals', v: rottingCount, c: rottingCount > 0 ? C.red : C.muted },
          { l: 'Won This Month', v: fmtCurrency(wonThisMonth), c: C.green },
        ].map((k, i) => (
          <div key={i} className="card card--sm">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value-lg" style={{ color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* ── Board View (Kanban) ─────────────────────────────── */}
      {viewMode === 'board' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${activeStages.length}, minmax(220px, 1fr))`,
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 12,
        }}>
          {activeStages.map(stage => {
            const stageDeals = (deals ?? []).filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + (d.value ?? 0), 0);
            const isDragOver = dragging && dragging !== stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(stage.id, e)}
                style={{
                  background: isDragOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderRadius: 8,
                  padding: 8,
                  minHeight: 200,
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: 12, padding: '0 4px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text)' }}>
                      {stage.label}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: MONO, color: 'var(--muted)', background: 'var(--surface2)', borderRadius: 4, padding: '1px 6px' }}>
                      {stageDeals.length}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: MONO, color: stage.color, fontWeight: 700 }}>
                    {fmtCurrency(stageValue)}
                  </span>
                </div>
                <div style={{ marginBottom: 12, padding: '0 4px' }}>
                  <ProgressBar value={stage.probability} color={stage.color} height={3} />
                </div>
                {stageDeals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 8px', fontSize: 10, color: 'var(--muted)', fontFamily: MONO, border: '1px dashed var(--border)', borderRadius: 8 }}>
                    Drop deals here
                  </div>
                )}
                {stageDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    stage={stage}
                    contacts={contacts ?? []}
                    companies={companies ?? []}
                    onSelect={setSelectedDeal}
                    onDragStart={() => setDragging(stage.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table View ───────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                {['Deal', 'Stage', 'Value', 'Contact', 'Company', 'Idle', 'Expected Close'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(deals ?? []).map(deal => {
                const stage = DEAL_STAGES.find(s => s.id === deal.stage) ?? DEAL_STAGES[0];
                const contact = (contacts ?? []).find(c => c.id === deal.contactId);
                const company = (companies ?? []).find(c => c.id === deal.companyId);
                const idle = daysSince(deal.lastActivity);
                const isRotting = stage.rottingDays && idle >= stage.rottingDays;
                return (
                  <tr
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td>{deal.title}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                        <span style={{ color: stage.color, fontSize: 10 }}>{stage.label}</span>
                      </span>
                    </td>
                    <td style={{ color: C.accent }}>{fmtCurrency(deal.value)}</td>
                    <td>{contact?.name ?? '—'}</td>
                    <td>{company?.name ?? '—'}</td>
                    <td style={{ color: isRotting ? C.red : 'var(--muted)' }}>{idle}d</td>
                    <td>{fmtDate(deal.expectedClose)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(deals ?? []).length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 12 }}>No deals yet</div>
          )}
        </div>
      )}

      {/* ── Timeline View ────────────────────────────────────── */}
      {viewMode === 'timeline' && (() => {
        const sorted = [...(deals ?? [])].filter(d => d.expectedClose).sort((a, b) => new Date(a.expectedClose) - new Date(b.expectedClose));
        const months = {};
        sorted.forEach(d => {
          const key = new Date(d.expectedClose).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          (months[key] = months[key] || []).push(d);
        });
        const noDate = (deals ?? []).filter(d => !d.expectedClose);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(months).map(([month, monthDeals]) => (
              <div key={month}>
                <div className="section-label mb-8">{month}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {monthDeals.map(deal => {
                    const stage = DEAL_STAGES.find(s => s.id === deal.stage) ?? DEAL_STAGES[0];
                    return (
                      <div
                        key={deal.id}
                        className="card"
                        onClick={() => setSelectedDeal(deal)}
                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, borderLeft: `3px solid ${stage.color}` }}
                      >
                        <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--muted)', width: 60, flexShrink: 0 }}>{fmtDate(deal.expectedClose)}</span>
                        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{deal.title}</span>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: stage.color }}>{stage.label}</span>
                        <span style={{ fontSize: 12, fontFamily: MONO, color: C.accent, fontWeight: 700 }}>{fmtCurrency(deal.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {noDate.length > 0 && (
              <div>
                <div className="section-label mb-8">No Close Date</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {noDate.map(deal => {
                    const stage = DEAL_STAGES.find(s => s.id === deal.stage) ?? DEAL_STAGES[0];
                    return (
                      <div
                        key={deal.id}
                        className="card"
                        onClick={() => setSelectedDeal(deal)}
                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, borderLeft: `3px solid var(--border2)` }}
                      >
                        <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--muted)', width: 60, flexShrink: 0 }}>TBD</span>
                        <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{deal.title}</span>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: stage.color }}>{stage.label}</span>
                        <span style={{ fontSize: 12, fontFamily: MONO, color: C.accent, fontWeight: 700 }}>{fmtCurrency(deal.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {(deals ?? []).length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 12 }}>No deals yet</div>
            )}
          </div>
        );
      })()}

      {/* Closed deals summary */}
      {closedStages.some(s => (deals ?? []).filter(d => d.stage === s.id).length > 0) && (
        <div style={{ marginTop: 24 }}>
          <div className="section-label mb-12">Closed Deals</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {closedStages.map(stage => {
              const stageDeals = (deals ?? []).filter(d => d.stage === stage.id);
              if (stageDeals.length === 0) return null;
              return (
                <div key={stage.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                    <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: stage.color, textTransform: 'uppercase' }}>
                      {stage.label} ({stageDeals.length})
                    </span>
                    <span style={{ fontSize: 11, fontFamily: MONO, color: stage.color, marginLeft: 'auto' }}>
                      {fmtCurrency(stageDeals.reduce((s, d) => s + (d.value ?? 0), 0))}/mo
                    </span>
                  </div>
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      style={{ padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8, marginBottom: 6, cursor: 'pointer', fontSize: 11, display: 'flex', justifyContent: 'space-between' }}
                    >
                      <span>{deal.title}</span>
                      <span style={{ color: stage.color, fontFamily: MONO }}>{fmtCurrency(deal.value)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {detailDeal && (
        <DealDetail
          deal={detailDeal}
          contacts={contacts ?? []}
          companies={companies ?? []}
          stages={DEAL_STAGES}
          onUpdate={updateDeal}
          onClose={() => setSelectedDeal(null)}
          openConfirm={openConfirm}
        />
      )}

      {/* New deal modal */}
      {showNewDeal && (
        <NewDealModal
          contacts={contacts ?? []}
          companies={companies ?? []}
          stages={DEAL_STAGES}
          onAdd={addDeal}
          onClose={() => setShowNewDeal(false)}
        />
      )}
    </section>
  );
}
