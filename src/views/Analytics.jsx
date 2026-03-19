import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ChartTooltip } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { revenueData, taskCompletionData } from '../data.js';
import EmptyState from '../components/ui/EmptyState.jsx';

const TIMEFRAMES = [
  { label:'1M', months:1 },
  { label:'3M', months:3 },
  { label:'6M', months:6 },
];

const SERIES = [
  { key:'revenue',  label:'Revenue',  color:C.accent,  dash:false },
  { key:'profit',   label:'Profit',   color:C.accent3, dash:false },
  { key:'expenses', label:'Expenses', color:C.accent2, dash:true  },
];

const LINE_COLORS = [C.accent, C.accent3, C.accent4, C.accent2];
const STATUS_C    = { active:C.green, idle:C.yellow, paused:C.red };

export default function Analytics({ agents, clients, columns, leads }) {
  const [timeframe,    setTimeframe]    = useState('3M');
  const [hidden,       setHidden]       = useState(new Set());
  const [sortKey,      setSortKey]      = useState('efficiency');
  const [sortDir,      setSortDir]      = useState('desc');
  const [selClient,    setSelClient]    = useState(null);

  // ── Revenue data ─────────────────────────────────────────────
  const currentMrr   = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);
  const currentMonth = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][new Date().getMonth()];
  const liveData     = revenueData.map((d, i) =>
    i === revenueData.length - 1
      ? { ...d, month: currentMonth, revenue: currentMrr, expenses: Math.round(currentMrr * 0.24), profit: Math.round(currentMrr * 0.76) }
      : d
  );
  const months    = TIMEFRAMES.find(t => t.label === timeframe)?.months ?? 3;
  const chartData = liveData.slice(-months);

  // MRR trend vs prior month
  const last = liveData[liveData.length - 1];
  const prev = liveData[liveData.length - 2];
  const mrrTrend    = prev ? Math.round(((last.revenue - prev.revenue) / prev.revenue) * 100) : 0;
  const profitTrend = prev ? Math.round(((last.profit  - prev.profit)  / prev.profit)  * 100) : 0;

  // ── KPI values ───────────────────────────────────────────────
  const activeClients = clients.filter(c => c.status === 'active');
  const lostLeads     = (leads ?? []).filter(l => l.status === 'lost').length;
  const winRate       = activeClients.length + lostLeads > 0
    ? Math.round((activeClients.length / (activeClients.length + lostLeads)) * 100) : 0;
  const avgHealth     = activeClients.length > 0
    ? Math.round(activeClients.reduce((s, c) => s + (c.health ?? 100), 0) / activeClients.length) : 100;
  const hotLeads      = (leads ?? []).filter(l => l.leadScore >= 80 && l.replyStatus === 'positive').length;

  // ── Pipeline funnel ──────────────────────────────────────────
  const allLeadsArr  = leads ?? [];
  const funnelRows   = [
    { label:'Scraped',    count: allLeadsArr.length,                                         color:C.muted   },
    { label:'Prospects',  count: allLeadsArr.filter(l => l.status === 'prospect').length,    color:C.accent3 },
    { label:'Hot (80+)',  count: allLeadsArr.filter(l => l.leadScore >= 80).length,          color:C.accent2 },
    { label:'Converted',  count: activeClients.length,                                       color:C.accent  },
  ];
  const funnelMax = Math.max(funnelRows[0].count, 1);

  // ── Agent table ──────────────────────────────────────────────
  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      if (sortKey === 'name') return sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      return sortDir === 'desc'
        ? (b[sortKey] ?? 0) - (a[sortKey] ?? 0)
        : (a[sortKey] ?? 0) - (b[sortKey] ?? 0);
    });
  }, [agents, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function toggleSeries(key) {
    setHidden(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  // ── Charts data ──────────────────────────────────────────────
  const taskStatusData = columns
    ? Object.entries(columns).map(([, col]) => ({ status: col.title.replace('IN PROGRESS','IN PROG'), count: col.items.length }))
    : [];

  const efficiencyData = [0,1,2,3,4,5,6].map(i => ({
    d: ['M','T','W','T','F','S','S'][i],
    ...Object.fromEntries(agents.slice(0,4).map(a => [a.name.split(' ')[0], a.weeklyData?.[i] ?? 0])),
  }));

  const selectedClient = selClient ? activeClients.find(c => c.id === selClient) : null;
  const avgScore = allLeadsArr.length
    ? Math.round(allLeadsArr.reduce((s, l) => s + (l.leadScore ?? 0), 0) / allLeadsArr.length)
    : 0;

  // ── Render helpers ───────────────────────────────────────────
  function Trend({ value }) {
    if (value == null) return null;
    const up = value >= 0;
    return (
      <span style={{ fontSize:10, fontFamily:'var(--mono)', color: up ? C.green : C.red, fontWeight:600, marginLeft:6 }}>
        {up ? '↑' : '↓'}{Math.abs(value)}%
      </span>
    );
  }

  function SortTh({ col, label, align = 'right' }) {
    const active = sortKey === col;
    return (
      <th
        onClick={col ? () => toggleSort(col) : undefined}
        style={{
          textAlign: align, padding:'6px 10px 10px',
          fontSize:9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.8,
          color: active ? C.accent : 'var(--muted)',
          cursor: col ? 'pointer' : 'default',
          userSelect:'none', whiteSpace:'nowrap',
        }}
      >
        {label}{active && <span style={{ marginLeft:3 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>}
      </th>
    );
  }

  return (
    <section className="view" style={{ maxWidth:1200 }} aria-labelledby="analytics-title">
      <header className="view-header">
        <h1 id="analytics-title" className="view-title">Analytics Dashboard</h1>
        <p className="view-subtitle">Performance metrics, trends, and insights</p>
      </header>

      {clients.length === 0 && (
        <EmptyState icon="📊" title="Not enough data yet" subtitle="Add clients and complete tasks to generate analytics" />
      )}

      {/* ── KPI Row ──────────────────────────────────────────── */}
      <div className="grid-4 mb-18">
        <div className="card card--sm">
          <div className="kpi-label">Monthly MRR</div>
          <div className="flex-center" style={{ alignItems:'baseline' }}>
            <div className="kpi-value-lg" style={{ color:C.accent }}>${currentMrr.toLocaleString()}</div>
            <Trend value={mrrTrend}/>
          </div>
          <div style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:2 }}>vs last month</div>
        </div>
        <div className="card card--sm">
          <div className="kpi-label">Net Profit</div>
          <div className="flex-center" style={{ alignItems:'baseline' }}>
            <div className="kpi-value-lg" style={{ color:C.accent3 }}>${last.profit.toLocaleString()}</div>
            <Trend value={profitTrend}/>
          </div>
          <div style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:2 }}>{Math.round(last.profit/last.revenue*100)}% margin</div>
        </div>
        <div className="card card--sm">
          <div className="kpi-label">Win Rate</div>
          <div className="kpi-value-lg" style={{ color:C.green }}>{winRate}%</div>
          <div style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:2 }}>{activeClients.length} active / {lostLeads} lost</div>
        </div>
        <div className="card card--sm">
          <div className="kpi-label">Avg Client Health</div>
          <div className="kpi-value-lg" style={{ color: avgHealth >= 75 ? C.accent3 : C.yellow }}>{avgHealth}%</div>
          <div style={{ height:3, background:'var(--surface2)', borderRadius:2, marginTop:6, overflow:'hidden' }}>
            <div style={{ width:`${avgHealth}%`, height:'100%', background: avgHealth >= 75 ? C.accent3 : C.yellow, borderRadius:2, transition:'width 0.4s' }}/>
          </div>
        </div>
      </div>

      {/* ── Revenue Chart + Pipeline Funnel ──────────────────── */}
      <div className="grid-2 mb-14">

        {/* Revenue chart with series toggles + timeframe */}
        <article className="card" aria-label="Revenue and profit chart">
          <div className="flex-between" style={{ marginBottom:12, flexWrap:'wrap', gap:6 }}>
            <div className="section-label">Revenue & Profit</div>
            <div style={{ display:'flex', gap:4, alignItems:'center', flexWrap:'wrap' }}>
              {SERIES.map(s => (
                <button key={s.key} onClick={() => toggleSeries(s.key)} style={{
                  padding:'2px 8px', borderRadius:4, fontSize:9, cursor:'pointer', fontFamily:'var(--mono)',
                  border:`1px solid ${hidden.has(s.key) ? 'var(--border)' : s.color}`,
                  background: hidden.has(s.key) ? 'transparent' : `${s.color}18`,
                  color: hidden.has(s.key) ? 'var(--muted)' : s.color,
                  opacity: hidden.has(s.key) ? 0.5 : 1,
                }}>
                  {s.label}
                </button>
              ))}
              <div style={{ display:'flex', gap:2, marginLeft:4, background:'var(--surface2)', borderRadius:6, padding:2 }}>
                {TIMEFRAMES.map(t => (
                  <button key={t.label} onClick={() => setTimeframe(t.label)} style={{
                    padding:'2px 8px', borderRadius:4, fontSize:9, cursor:'pointer', fontFamily:'var(--mono)',
                    border:'none',
                    background: timeframe === t.label ? `${C.accent}20` : 'transparent',
                    color: timeframe === t.label ? C.accent : 'var(--muted)',
                    fontWeight: timeframe === t.label ? 700 : 400,
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ga1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent}  stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.accent}  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ga2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent3} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.accent3} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`}/>
              <Tooltip content={<ChartTooltip/>}/>
              {!hidden.has('revenue')  && <Area type="monotone" dataKey="revenue"  stroke={C.accent}  fill="url(#ga1)" strokeWidth={2} name="Revenue"/>}
              {!hidden.has('profit')   && <Area type="monotone" dataKey="profit"   stroke={C.accent3} fill="url(#ga2)" strokeWidth={2} name="Profit"/>}
              {!hidden.has('expenses') && <Area type="monotone" dataKey="expenses" stroke={C.accent2} fill="none"      strokeWidth={1.5} strokeDasharray="4 4" name="Expenses"/>}
            </AreaChart>
          </ResponsiveContainer>
        </article>

        {/* Pipeline Funnel */}
        <article className="card" aria-label="Pipeline funnel">
          <div className="section-label" style={{ marginBottom:14 }}>Pipeline Funnel</div>
          <div className="form-stack" style={{ gap:10 }}>
            {funnelRows.map((row, i) => {
              const prev2 = funnelRows[i - 1];
              const convRate = prev2 && prev2.count > 0
                ? Math.round((row.count / prev2.count) * 100)
                : null;
              return (
                <div key={row.label}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:0.5 }}>
                      {row.label}
                    </span>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      {convRate !== null && (
                        <span style={{ fontSize:9, fontFamily:'var(--mono)', color:'var(--muted)', background:'var(--surface2)', borderRadius:4, padding:'1px 6px' }}>
                          {convRate}% conv.
                        </span>
                      )}
                      <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--mono)', color:row.color, minWidth:24, textAlign:'right' }}>
                        {row.count}
                      </span>
                    </div>
                  </div>
                  <div style={{ height:18, background:'var(--surface2)', borderRadius:4, overflow:'hidden', position:'relative' }}>
                    <div style={{
                      height:'100%',
                      width:`${Math.max((row.count / funnelMax) * 100, row.count > 0 ? 4 : 0)}%`,
                      background:`linear-gradient(90deg, ${row.color}50, ${row.color})`,
                      borderRadius:4,
                      transition:'width 0.5s ease',
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:0, marginTop:14, borderTop:'1px solid var(--border)', paddingTop:12 }}>
            {[
              { l:'Hot Leads',  v:hotLeads,   c:C.accent2 },
              { l:'Avg Score',  v:avgScore,   c:C.accent3 },
              { l:'Clients',    v:activeClients.length, c:C.accent },
            ].map((s, i) => (
              <div key={i} style={{ flex:1, textAlign:'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize:16, fontWeight:700, fontFamily:'var(--mono)', color:s.c }}>{s.v}</div>
                <div style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.5, marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* ── Agent Performance Table ───────────────────────────── */}
      <article className="card mb-14" aria-label="Agent performance table">
        <div className="flex-between" style={{ marginBottom:14 }}>
          <div className="section-label">Agent Performance</div>
          <span style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)' }}>Click headers to sort</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <SortTh col="name"        label="Agent"       align="left"/>
              <SortTh col={null}        label="Status"      />
              <SortTh col="tasks"       label="Tasks"       />
              <SortTh col="efficiency"  label="Efficiency"  />
              <SortTh col="automations" label="Automations" />
            </tr>
          </thead>
          <tbody>
            {sortedAgents.map((a, i) => (
              <tr
                key={a.id}
                style={{ borderBottom: i < sortedAgents.length - 1 ? '1px solid var(--border)' : 'none', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding:'10px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:16 }}>{a.icon}</span>
                  <span style={{ fontWeight:600 }}>{a.name}</span>
                </td>
                <td style={{ padding:'10px', textAlign:'right' }}>
                  <span style={{
                    fontSize:9, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.5,
                    color: STATUS_C[a.status] ?? C.muted,
                    background:`${STATUS_C[a.status] ?? C.muted}18`,
                    border:`1px solid ${STATUS_C[a.status] ?? C.muted}35`,
                    borderRadius:4, padding:'2px 7px',
                  }}>
                    {a.status}
                  </span>
                </td>
                <td style={{ padding:'10px', textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, color:C.accent3 }}>
                  {a.tasks}
                </td>
                <td style={{ padding:'10px', textAlign:'right' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
                    <div style={{ width:64, height:4, background:'var(--surface2)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{
                        width:`${a.efficiency}%`, height:'100%', borderRadius:2,
                        background: a.efficiency >= 90 ? C.green : a.efficiency >= 80 ? C.accent3 : C.yellow,
                      }}/>
                    </div>
                    <span style={{
                      fontFamily:'var(--mono)', fontWeight:700, minWidth:36, textAlign:'right',
                      color: a.efficiency >= 90 ? C.green : a.efficiency >= 80 ? C.accent3 : C.yellow,
                    }}>
                      {a.efficiency}%
                    </span>
                  </div>
                </td>
                <td style={{ padding:'10px', textAlign:'right', fontFamily:'var(--mono)', color:'var(--muted)' }}>
                  {a.automations}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {/* ── Bottom Charts Row ─────────────────────────────────── */}
      <div className="grid-3" style={{ gap:14 }}>

        {/* Revenue by Client — clickable pie */}
        <article className="card" aria-label="Revenue by client pie chart">
          <div className="section-label" style={{ marginBottom:12 }}>Revenue by Client</div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={activeClients.map(c => ({ name:c.name, value:c.mrr, id:c.id }))}
                cx="50%" cy="50%"
                innerRadius={38} outerRadius={65}
                paddingAngle={3} dataKey="value"
                onClick={d => setSelClient(selClient === d.id ? null : d.id)}
                style={{ cursor:'pointer' }}
              >
                {activeClients.map((c, i) => (
                  <Cell
                    key={i}
                    fill={c.color}
                    opacity={selClient && selClient !== c.id ? 0.25 : 1}
                    stroke={selClient === c.id ? '#fff' : 'none'}
                    strokeWidth={selClient === c.id ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          {selectedClient ? (
            <div style={{ padding:'8px 12px', background:`${selectedClient.color}12`, border:`1px solid ${selectedClient.color}30`, borderRadius:8, marginTop:4 }}>
              <div style={{ fontWeight:700, fontSize:12, marginBottom:5 }}>{selectedClient.name}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3, fontSize:10, color:'var(--muted)' }}>
                <span>MRR <strong style={{ color:selectedClient.color }}>${selectedClient.mrr.toLocaleString()}</strong></span>
                <span>Health <strong style={{ color: selectedClient.health >= 75 ? C.green : C.yellow }}>{selectedClient.health}%</strong></span>
                <span>Since {selectedClient.since}</span>
                <span>{selectedClient.services.join(', ')}</span>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center', marginTop:6 }}>
              {activeClients.map(c => (
                <div
                  key={c.id} onClick={() => setSelClient(c.id)}
                  style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--muted)', cursor:'pointer', padding:'2px 6px', borderRadius:4 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width:6, height:6, borderRadius:'50%', background:c.color }}/>
                  {c.name}
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Task Completion This Week */}
        <article className="card" aria-label="Task completion this week">
          <div className="section-label" style={{ marginBottom:12 }}>Task Completion (This Week)</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={taskCompletionData} barCategoryGap="30%">
              <XAxis dataKey="day" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="completed" fill={C.accent}  radius={[3,3,0,0]} name="Completed"/>
              <Bar dataKey="created"   fill={C.accent3} radius={[3,3,0,0]} name="Created" opacity={0.6}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="legend">
            {[{l:'Completed', c:C.accent}, {l:'Created', c:C.accent3}].map(s => (
              <div key={s.l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--muted)' }}>
                <span style={{ width:8, height:8, borderRadius:2, background:s.c, display:'inline-block' }}/>
                {s.l}
              </div>
            ))}
          </div>
        </article>

        {/* Fleet Efficiency Trend */}
        <article className="card" aria-label="Fleet efficiency 7-day trend">
          <div className="section-label" style={{ marginBottom:12 }}>Fleet Efficiency (7d)</div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={efficiencyData}>
              <XAxis dataKey="d" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis domain={[70,100]} tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              {agents.slice(0,4).map((a, i) => (
                <Line key={a.id} type="monotone" dataKey={a.name.split(' ')[0]} stroke={LINE_COLORS[i]} strokeWidth={2} dot={false} name={a.name}/>
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="legend">
            {agents.slice(0,4).map((a, i) => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--muted)' }}>
                <span style={{ width:14, height:3, borderRadius:2, background:LINE_COLORS[i], display:'inline-block' }}/>
                {a.name.split(' ')[0]}
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
