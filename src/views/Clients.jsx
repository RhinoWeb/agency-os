import { useState } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';

export default function Clients({ clients, mrr }) {
  const [selectedId, setSelectedId] = useState(null);

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
          <div style={{ width:10, height:10, borderRadius:'50%', background:cl.color }} aria-hidden="true"/>
          <h1 id="client-detail-title" style={{ fontFamily:'var(--sans)', fontSize:18, fontWeight:700 }}>{cl.name}</h1>
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
        </div>
      </section>
    );
  }

  return (
    <section className="view" aria-labelledby="clients-title">
      <header style={{ marginBottom:20 }}>
        <h1 id="clients-title" className="view-title">Client Management</h1>
        <p className="view-subtitle">CRM overview — health tracking, revenue, and next actions</p>
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
                    <div className="client-name">{cl.name}</div>
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
                    <div className="client-name">{cl.name}</div>
                    <div className="client-contact">{cl.contact} · {cl.email}</div>
                  </div>
                  <Badge label="Pipeline" color={C.accent5}/>
                </div>
                <div className="client-services mb-8">
                  {cl.services.map(s => <Badge key={s} label={s} color={C.accent4}/>)}
                </div>
                <div className="client-next">Next: {cl.nextMeeting}</div>
                <div style={{ fontSize:11, color:'var(--dim)', marginTop:6 }}>{cl.notes}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
