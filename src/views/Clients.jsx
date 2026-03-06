import { useState, useEffect, useRef } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';

const PRESET_COLORS = ['#00FFB2','#7B61FF','#FF6B35','#00B4D8','#F472B6','#FBBF24','#22C55E','#EF4444'];
const STAGE_OPTIONS = ['outreach','replied','call','proposal','closed'];
const TYPE_OPTIONS  = [{ v:'brand',label:'Brand' },{ v:'saas',label:'SaaS' },{ v:'creator',label:'Creator / KOL' },{ v:'retreat',label:'Retreat' }];

function ClientModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const inputRef = useRef(null);
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
      id:           isEdit ? initial.id : `c${Date.now()}`,
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
      onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
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

const CLIENT_TYPE_COLORS = {
  brand:   C.accent4,
  saas:    C.accent3,
  creator: '#EC4899',
  retreat: C.accent5,
};

const OUTREACH_STAGES = ['outreach', 'replied', 'call', 'proposal', 'closed'];
const STAGE_LABELS    = { outreach:'Outreach', replied:'Replied', call:'Call Booked', proposal:'Proposal Sent', closed:'Closed' };

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
          <div style={{
            flex:1, height:4, borderRadius:2,
            background: i <= stageIdx ? C.accent : 'var(--border)',
          }}/>
          <span style={{
            fontSize:8, fontFamily:'var(--mono)', color: i === stageIdx ? C.accent : 'var(--muted)',
            whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:0.5,
          }}>
            {i === stageIdx ? STAGE_LABELS[s] : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

function CreatorPanel({ creator }) {
  const stages = ['outreach','onboarded','active','top'];
  const stageColors = { outreach:C.muted, onboarded:C.yellow, active:C.accent, top:'#EC4899' };
  return (
    <div style={{ background:'var(--surface2)', borderRadius:8, padding:14, marginTop:14 }}>
      <div className="section-label mb-8" style={{ color:'#EC4899' }}>Creator / KOL Details</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:12 }}>
        {[
          { l:'Platform',    v: creator.platform },
          { l:'Niche',       v: creator.niche },
          { l:'Followers',   v: creator.followers },
          { l:'Commission',  v: `${creator.commissionRate}%` },
          { l:'First Sale',  v: creator.firstSaleDate ?? '—' },
          { l:'Rev. Generated', v: creator.totalRevenue ? `$${creator.totalRevenue.toLocaleString()}` : '—' },
        ].map((s,i) => (
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

export default function Clients({ clients, setClients, mrr }) {
  const [selectedId, setSelectedId] = useState(null);
  const [modal,      setModal]      = useState(null); // null | 'add' | { edit: client }

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

  const activeClients   = clients.filter(c => c.status==='active');
  const pipelineClients = clients.filter(c => c.status==='pipeline');

  if (selectedId) {
    const cl = clients.find(c => c.id === selectedId);
    if (!cl) return null;

    return (
      <section className="view" aria-labelledby="client-detail-title">
        <div className="flex-center gap-10" style={{ marginBottom:16 }}>
          <button className="btn btn--ghost btn--sm" onClick={() => setSelectedId(null)} aria-label="Back to client list">
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
        </div>

        <div className="card">
          <div className="grid-4 mb-16">
            {[
              { l:'MRR',      v: cl.mrr    ? `$${(cl.mrr/1000).toFixed(1)}k` : '—' },
              { l:'Health',   v: cl.health ? `${cl.health}%`                 : '—' },
              { l:'Since',    v: cl.since },
              { l:'Services', v: cl.services.length },
            ].map((s, i) => (
              <div key={i} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 14px', textAlign:'center' }}>
                <div style={{ fontSize:16, fontWeight:700 }}>{s.v}</div>
                <div className="text-xs text-muted text-upper" style={{ marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {cl.health > 0 && (
            <div style={{ marginBottom:14 }}>
              <div className="text-xs text-muted" style={{ marginBottom:6 }}>Health Score</div>
              <ProgressBar
                value={cl.health}
                color={cl.health>=90 ? C.accent : cl.health>=80 ? C.yellow : C.red}
                height={8}
              />
            </div>
          )}

          <div className="grid-2">
            <div style={{ background:'var(--surface2)', borderRadius:8, padding:14 }}>
              <div className="section-label mb-8">Details</div>
              <div style={{ fontSize:12, lineHeight:1.8 }}>
                <div>Contact: {cl.contact}</div>
                <div>Email: <a href={`mailto:${cl.email}`} style={{ color:'var(--accent4)' }}>{cl.email}</a></div>
                <div>Next Meeting: {cl.nextMeeting}</div>
                <div>Services: {cl.services.join(', ')}</div>
              </div>
            </div>
            <div style={{ background:'var(--surface2)', borderRadius:8, padding:14 }}>
              <div className="section-label mb-8">Notes</div>
              <div style={{ fontSize:12, lineHeight:1.8, color:'var(--dim)' }}>{cl.notes || '—'}</div>
            </div>
          </div>

          {cl.creator && <CreatorPanel creator={cl.creator}/>}
        </div>
      </section>
    );
  }

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

      {/* Summary KPIs */}
      <div className="grid-3 mb-20">
        {[
          { l:'Total MRR',      v: `$${(mrr/1000).toFixed(1)}k`, c: C.accent  },
          { l:'Active Clients', v: activeClients.length,          c: C.accent4 },
          { l:'Pipeline Value', v: '~$11.5k/mo',                  c: C.accent5 },
        ].map((m, i) => (
          <div key={i} className="card card--sm" style={{ borderTop:`3px solid ${m.c}` }}>
            <div className="kpi-label">{m.l}</div>
            <div style={{ fontSize:24, fontWeight:700, fontFamily:'var(--sans)' }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Active clients */}
      {activeClients.length > 0 && (
        <>
          <h2 className="section-label mb-10">Active Clients</h2>
          <div className="grid-clients mb-20">
            {activeClients.map(cl => (
              <button
                key={cl.id}
                className="card client-card"
                style={{ borderLeftColor: cl.color, textAlign:'left', width:'100%' }}
                onClick={() => setSelectedId(cl.id)}
                aria-label={`${cl.name}: ${cl.health}% health, $${(cl.mrr/1000).toFixed(1)}k MRR`}
              >
                <div className="client-card__head">
                  <div>
                    <div className="client-name" style={{ display:'flex', alignItems:'center', gap:7 }}>
                      {cl.name}
                      <TypeBadge type={cl.clientType}/>
                    </div>
                    <div className="client-contact">{cl.contact} · {cl.email}</div>
                  </div>
                  <Badge label={cl.status} color={C.accent}/>
                </div>
                <div style={{ marginBottom:10 }}>
                  <ProgressBar
                    value={cl.health}
                    color={cl.health>=90 ? C.accent : cl.health>=80 ? C.yellow : C.red}
                    height={5}
                  />
                  <div className="flex-between" style={{ marginTop:3 }}>
                    <span className="text-xs text-muted">Health: {cl.health}%</span>
                    <span className="text-xs text-muted">${(cl.mrr/1000).toFixed(1)}k/mo</span>
                  </div>
                </div>
                <div className="client-services">
                  {cl.services.map(s => <Badge key={s} label={s} color={C.accent4}/>)}
                </div>
                <div className="client-next">Next: {cl.nextMeeting}</div>
              </button>
            ))}
          </div>
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
                <div className="client-next">Next: {cl.nextMeeting}</div>
                <div style={{ fontSize:11, color:'var(--dim)', marginTop:6 }}>{cl.notes}</div>
                {cl.outreachStage && <OutreachFunnelRow client={cl}/>}
              </button>
            ))}
          </div>
        </>
      )}

      {(modal === 'add') && (
        <ClientModal onSave={saveClient} onClose={() => setModal(null)}/>
      )}
      {(modal?.edit) && (
        <ClientModal initial={modal.edit} onSave={saveClient} onClose={() => setModal(null)}/>
      )}
    </section>
  );
}
