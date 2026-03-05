import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { seedSchedule } from '../data.js';

const now = new Date();
const hr  = now.getHours();
const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

export default function Schedule() {
  const totalMins  = seedSchedule.reduce((s, e) => s + e.dur, 0);
  const meetingMin = seedSchedule.filter(e => e.type==='meeting').reduce((s, e) => s + e.dur, 0);
  const agentMin   = seedSchedule.filter(e => e.type==='agent').reduce((s, e) => s + e.dur, 0);
  const deepMin    = seedSchedule.filter(e => e.type==='deep-work').reduce((s, e) => s + e.dur, 0);

  return (
    <section className="view view--narrow" aria-labelledby="schedule-title">
      <header style={{ marginBottom:18 }}>
        <h1 id="schedule-title" className="view-title">Today's Schedule</h1>
        <p className="view-subtitle">{dateStr}</p>
      </header>

      {/* Summary row */}
      <div className="grid-4 mb-18" role="list" aria-label="Schedule summary">
        {[
          { l:'Total',     v:`${Math.floor(totalMins/60)}h ${totalMins%60}m`,   c:'var(--accent)'  },
          { l:'Meetings',  v:`${Math.floor(meetingMin/60)}h ${meetingMin%60}m`, c:'var(--yellow)'  },
          { l:'Agents',    v:`${Math.floor(agentMin/60)}h ${agentMin%60}m`,     c:'var(--accent3)' },
          { l:'Deep Work', v:`${Math.floor(deepMin/60)}h ${deepMin%60}m`,       c:'var(--accent2)' },
        ].map((s, i) => (
          <div key={i} className="card card--sm" role="listitem">
            <div className="kpi-label">{s.l}</div>
            <div style={{ fontSize:18, fontWeight:700, color:s.c, fontFamily:'var(--mono)' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="schedule-timeline" role="list" aria-label="Schedule timeline">
        <div className="schedule-line" aria-hidden="true"/>

        {seedSchedule.map((e, i) => {
          const h    = parseInt(e.time);
          const past = h < hr;
          const cur  = h === hr;

          return (
            <div
              key={i}
              className={`schedule-item${past ? ' schedule-item--past' : ''}`}
              role="listitem"
              aria-label={`${e.time}: ${e.title}, ${e.dur} minutes${past ? ', past' : cur ? ', current' : ''}`}
            >
              <div className="schedule-time" style={{ color: cur ? 'var(--accent)' : 'var(--text)' }}>
                {e.time}
              </div>

              <div className="schedule-dot-wrap" aria-hidden="true">
                <div
                  className="schedule-dot"
                  style={{
                    background: cur ? 'var(--accent)' : e.cl,
                    boxShadow:  cur ? `0 0 12px var(--accent)` : 'none',
                  }}
                />
              </div>

              <div
                className="schedule-entry"
                style={{
                  borderLeftColor: e.cl,
                  background: cur ? `${e.cl}08` : 'var(--surface)',
                  borderColor: cur ? `${e.cl}35` : 'var(--border)',
                }}
              >
                <div className="schedule-entry__head">
                  <span className="schedule-entry__title">{e.title}</span>
                  <Badge label={e.type.replace('-',' ')} color={e.cl}/>
                </div>
                <div style={{ marginTop:5 }}>
                  <ProgressBar value={past ? 100 : cur ? 50 : 0} color={e.cl} height={3}/>
                </div>
                <div className="schedule-dur">{e.dur} minutes</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
