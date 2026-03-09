import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from 'recharts';
import { C, MONO } from '../theme.js';
import { DEAL_STAGES } from '../data.js';
import { ChartTooltip } from '../components/ui/index.jsx';

function fmtCurrency(n) { return n >= 1000 ? `$${(n/1000).toFixed(n%1000===0?0:1)}k` : `$${n}`; }
function daysBetween(a, b) { return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000)); }

export default function CRMReports({ deals, contacts, companies }) {
  const safeDeals     = deals     ?? [];
  const safeContacts  = contacts  ?? [];
  const safeCompanies = companies ?? [];

  const openDeals = safeDeals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const wonDeals  = safeDeals.filter(d => d.stage === 'closed_won');
  const lostDeals = safeDeals.filter(d => d.stage === 'closed_lost');

  // ── Pipeline Value by Stage ────────────────────────────────
  const stageData = useMemo(() => {
    return DEAL_STAGES
      .filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost')
      .map(s => {
        const deals = openDeals.filter(d => d.stage === s.id);
        return {
          name: s.label,
          value: deals.reduce((sum, d) => sum + (d.value ?? 0), 0),
          weighted: deals.reduce((sum, d) => sum + (d.value ?? 0) * s.probability / 100, 0),
          count: deals.length,
          color: s.color,
        };
      });
  }, [openDeals]);

  // ── Win/Loss Pie ───────────────────────────────────────────
  const winLossData = useMemo(() => {
    const won  = wonDeals.length;
    const lost = lostDeals.length;
    const open = openDeals.length;
    return [
      { name:'Won', value:won, color:C.accent },
      { name:'Lost', value:lost, color:C.red },
      { name:'Open', value:open, color:C.accent3 },
    ].filter(d => d.value > 0);
  }, [wonDeals, lostDeals, openDeals]);

  const winRate = (wonDeals.length + lostDeals.length) > 0
    ? Math.round(wonDeals.length / (wonDeals.length + lostDeals.length) * 100)
    : 0;

  // ── Deal Velocity ──────────────────────────────────────────
  const avgDealAge = useMemo(() => {
    if (openDeals.length === 0) return 0;
    const totalDays = openDeals.reduce((s, d) => s + daysBetween(d.createdAt, new Date().toISOString()), 0);
    return Math.round(totalDays / openDeals.length);
  }, [openDeals]);

  // ── Lost Reasons ───────────────────────────────────────────
  const lostReasons = useMemo(() => {
    const reasons = {};
    lostDeals.forEach(d => {
      const r = d.lostReason || 'unspecified';
      reasons[r] = (reasons[r] || 0) + 1;
    });
    return Object.entries(reasons).map(([name, value]) => ({ name, value }));
  }, [lostDeals]);

  // ── Contact Sources ────────────────────────────────────────
  const sourceData = useMemo(() => {
    const sources = {};
    safeContacts.forEach(c => {
      const s = c.source || 'unknown';
      sources[s] = (sources[s] || 0) + 1;
    });
    return Object.entries(sources).map(([name, value], i) => ({
      name, value,
      color: [C.accent, C.accent3, C.accent4, C.accent2, C.accent5, C.green, C.yellow][i % 7],
    }));
  }, [safeContacts]);

  // ── Revenue by Company ─────────────────────────────────────
  const companyRevenue = useMemo(() => {
    return safeCompanies
      .filter(c => c.mrr > 0)
      .sort((a, b) => b.mrr - a.mrr)
      .map(c => ({ name: c.name, mrr: c.mrr, color: c.color || C.accent }));
  }, [safeCompanies]);

  // ── Funnel Conversion ──────────────────────────────────────
  const funnelData = useMemo(() => {
    const stages = DEAL_STAGES.filter(s => s.id !== 'closed_lost');
    return stages.map(s => ({
      name: s.label,
      value: safeDeals.filter(d => {
        const idx = stages.findIndex(x => x.id === d.stage);
        const thisIdx = stages.findIndex(x => x.id === s.id);
        return idx >= thisIdx;
      }).length,
      fill: s.color,
    }));
  }, [safeDeals]);

  // ── KPIs ───────────────────────────────────────────────────
  const totalPipeline  = openDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const weightedValue  = stageData.reduce((s, d) => s + d.weighted, 0);
  const totalMRR       = safeCompanies.reduce((s, c) => s + (c.mrr ?? 0), 0);
  const avgDealSize    = openDeals.length > 0 ? Math.round(totalPipeline / openDeals.length) : 0;

  return (
    <section className="view" aria-labelledby="crm-reports-title">
      <header style={{ marginBottom: 20 }}>
        <h1 id="crm-reports-title" className="view-title">CRM Reports</h1>
        <p className="view-subtitle">Pipeline analytics, deal velocity, and revenue insights</p>
      </header>

      {/* KPI row */}
      <div className="grid-4 mb-18">
        {[
          { l: 'Total Pipeline',  v: fmtCurrency(totalPipeline), c: C.accent  },
          { l: 'Weighted Value',  v: fmtCurrency(Math.round(weightedValue)), c: C.accent3 },
          { l: 'Win Rate',        v: `${winRate}%`,              c: winRate >= 50 ? C.green : C.yellow },
          { l: 'Avg Deal Age',    v: `${avgDealAge}d`,           c: avgDealAge > 30 ? C.red : C.accent4 },
        ].map((k, i) => (
          <div key={i} className="card card--sm">
            <div className="kpi-label">{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.c, fontFamily: MONO }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Pipeline Value by Stage */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-label mb-12">Pipeline Value by Stage</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData} layout="vertical" margin={{ left: 80 }}>
              <XAxis type="number" tickFormatter={v => fmtCurrency(v)} tick={{ fontSize: 10, fontFamily: MONO, fill: C.muted }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontFamily: MONO, fill: C.dim }} width={70} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Pipeline" radius={[0, 4, 4, 0]}>
                {stageData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
              </Bar>
              <Bar dataKey="weighted" name="Weighted" radius={[0, 4, 4, 0]}>
                {stageData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.3} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 10, fontFamily: MONO, color: 'var(--muted)' }}>■ Pipeline Value</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: 'var(--muted)', opacity: 0.5 }}>■ Weighted</span>
          </div>
        </div>

        {/* Win/Loss Pie */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-label mb-12">Deal Outcomes</div>
          {winLossData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={winLossData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {winLossData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {winLossData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontFamily: MONO }}>{d.name}: {d.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontFamily: MONO, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Win Rate</div>
                  <div style={{ fontSize: 28, fontWeight: 800, fontFamily: MONO, color: winRate >= 50 ? C.green : C.yellow }}>{winRate}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 12 }}>No closed deals yet</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Revenue by Company */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-label mb-12">Revenue by Client (MRR)</div>
          {companyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companyRevenue}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fontFamily: MONO, fill: C.muted }} />
                <YAxis tickFormatter={v => fmtCurrency(v)} tick={{ fontSize: 10, fontFamily: MONO, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="mrr" name="MRR" radius={[4, 4, 0, 0]}>
                  {companyRevenue.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 12 }}>No revenue data</div>
          )}
        </div>

        {/* Contact Sources */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-label mb-12">Contact Sources</div>
          {sourceData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={sourceData} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                    {sourceData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sourceData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--dim)' }}>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 12 }}>No contacts yet</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Deal Metrics Table */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-label mb-12">Deal Metrics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Total Deals',     value: safeDeals.length,                              color: 'var(--text)' },
              { label: 'Open Deals',      value: openDeals.length,                              color: C.accent3 },
              { label: 'Won Deals',       value: wonDeals.length,                               color: C.accent },
              { label: 'Lost Deals',      value: lostDeals.length,                              color: C.red },
              { label: 'Avg Deal Size',   value: fmtCurrency(avgDealSize) + '/mo',              color: C.accent4 },
              { label: 'Total MRR',       value: fmtCurrency(totalMRR) + '/mo',                 color: C.green },
              { label: 'Pipeline Count',  value: `${openDeals.length} deals`,                   color: 'var(--dim)' },
              { label: 'Contacts',        value: safeContacts.length,                            color: 'var(--dim)' },
              { label: 'Companies',       value: safeCompanies.length,                           color: 'var(--dim)' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: MONO, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lost Reasons */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-label mb-12">Lost Reasons</div>
          {lostReasons.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lostReasons.sort((a, b) => b.value - a.value).map(r => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{r.name.replace(/_/g, ' ')}</div>
                    <div style={{ marginTop: 4, height: 4, background: 'var(--surface3)', borderRadius: 2 }}>
                      <div style={{ height: '100%', background: C.red, borderRadius: 2, width: `${(r.value / lostDeals.length) * 100}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: C.red }}>{r.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
              <div style={{ color: 'var(--muted)', fontSize: 12 }}>No lost deals — keep it up!</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
