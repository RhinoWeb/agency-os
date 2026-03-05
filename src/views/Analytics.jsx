import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ChartTooltip } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { revenueData, taskCompletionData } from '../data.js';

export default function Analytics({ agents, clients }) {
  const agentLoadData = agents.map(a => ({
    name: a.name.split(' ')[0],
    tasks: a.tasks,
    efficiency: a.efficiency,
  }));

  const efficiencyData = [0,1,2,3,4,5,6].map(i => ({
    d: ['M','T','W','T','F','S','S'][i],
    ...Object.fromEntries(
      agents.slice(0,4).map(a => [a.name.split(' ')[0], a.weeklyData[i]])
    ),
  }));

  const LINE_COLORS = [C.accent, C.accent3, C.accent4, C.accent2];

  return (
    <section className="view" style={{ maxWidth:1200 }} aria-labelledby="analytics-title">
      <header style={{ marginBottom:18 }}>
        <h1 id="analytics-title" className="view-title">Analytics Dashboard</h1>
        <p className="view-subtitle">Performance metrics, trends, and insights</p>
      </header>

      <div className="grid-2 mb-14">
        {/* Revenue & Profit */}
        <article className="card" aria-label="Revenue and profit chart">
          <div className="section-label" style={{ marginBottom:12 }}>Revenue & Profit (6 months)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent}  stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.accent}  stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent3} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={C.accent3} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month"  tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="revenue"  stroke={C.accent}  fill="url(#g1)" strokeWidth={2} name="Revenue"/>
              <Area type="monotone" dataKey="profit"   stroke={C.accent3} fill="url(#g2)" strokeWidth={2} name="Profit"/>
              <Area type="monotone" dataKey="expenses" stroke={C.accent2} fill="none"      strokeWidth={1.5} strokeDasharray="4 4" name="Expenses"/>
            </AreaChart>
          </ResponsiveContainer>
        </article>

        {/* Task Throughput */}
        <article className="card" aria-label="Task throughput chart">
          <div className="section-label" style={{ marginBottom:12 }}>Task Throughput (This Week)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskCompletionData}>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="completed" fill={C.accent}  radius={[4,4,0,0]} name="Completed"/>
              <Bar dataKey="created"   fill={C.accent3} radius={[4,4,0,0]} name="Created"/>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
        {/* Agent Task Load */}
        <article className="card" aria-label="Agent task load chart">
          <div className="section-label" style={{ marginBottom:12 }}>Agent Task Load</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentLoadData} layout="vertical">
              <XAxis type="number" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false} width={60}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="tasks" fill={C.accent3} radius={[0,4,4,0]} name="Tasks"/>
            </BarChart>
          </ResponsiveContainer>
        </article>

        {/* Revenue by Client */}
        <article className="card" aria-label="Revenue by client pie chart">
          <div className="section-label" style={{ marginBottom:12 }}>Revenue by Client</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={clients.filter(c => c.status==='active').map(c => ({ name:c.name, value:c.mrr }))}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={75}
                paddingAngle={3} dataKey="value"
              >
                {clients.filter(c => c.status==='active').map((c, i) => (
                  <Cell key={i} fill={c.color}/>
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:4 }} role="list" aria-label="Client legend">
            {clients.filter(c => c.status==='active').map(c => (
              <div key={c.id} role="listitem" style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--muted)' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:c.color }} aria-hidden="true"/>
                {c.name}
              </div>
            ))}
          </div>
        </article>

        {/* Fleet Efficiency Trend */}
        <article className="card" aria-label="Fleet efficiency trend chart">
          <div className="section-label" style={{ marginBottom:12 }}>Fleet Efficiency Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={efficiencyData}>
              <XAxis dataKey="d" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <YAxis domain={[70,100]} tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              {agents.slice(0,4).map((a, i) => (
                <Line
                  key={a.id}
                  type="monotone"
                  dataKey={a.name.split(' ')[0]}
                  stroke={LINE_COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  name={a.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}
