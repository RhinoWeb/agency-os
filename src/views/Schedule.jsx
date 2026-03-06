import { useState, useEffect, useRef } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';

const TYPE_COLORS = {
  'meeting':   C.yellow,
  'agent':     C.accent3,
  'deep-work': C.accent2,
  'task':      C.accent,
};

const TYPE_OPTIONS = ['meeting', 'agent', 'deep-work', 'task'];

function EventModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [time,  setTime]  = useState('09:00');
  const [dur,   setDur]   = useState(60);
  const [type,  setType]  = useState('meeting');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = ((h % 12) || 12);
    const label = `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
    onAdd({
      id:    `ev${Date.now()}`,
      title: title.trim(),
      time:  label,
      _sort: h * 60 + m,
      dur:   Number(dur),
      type,
      cl:    TYPE_COLORS[type] ?? C.accent,
    });
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ev-modal-title"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 id="ev-modal-title" className="modal-title">Add Event</h2>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <input
            ref={inputRef}
            className="input"
            placeholder="Event title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ flex:1 }}>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Time</label>
              <input
                className="input"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
            <div style={{ flex:1 }}>
              <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Duration (min)</label>
              <input
                className="input"
                type="number"
                min={5}
                max={480}
                value={dur}
                onChange={e => setDur(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="settings-label" style={{ display:'block', marginBottom:6 }}>Type</label>
            <div style={{ display:'flex', gap:6 }}>
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  style={{
                    flex:1, padding:'5px 0', borderRadius:6, cursor:'pointer', fontSize:10, fontFamily:'var(--mono)',
                    border:`1px solid ${type === t ? TYPE_COLORS[t] : 'var(--border)'}`,
                    background: type === t ? `${TYPE_COLORS[t]}18` : 'var(--surface2)',
                    color: type === t ? TYPE_COLORS[t] : 'var(--muted)',
                  }}
                  onClick={() => setType(t)}
                >
                  {t.replace('-',' ')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type="button" className="btn btn--ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:1 }}>Add Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const GCAL_COLOR = '#4285F4';

const now = new Date();
const hr  = now.getHours();
const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

export default function Schedule({ schedule, setSchedule }) {
  const [showModal,    setShowModal]    = useState(false);
  const [gcalStatus,   setGcalStatus]   = useState('unknown'); // 'unknown' | 'disconnected' | 'connected' | 'loading'
  const [gcalEvents,   setGcalEvents]   = useState([]);

  // Check Google Calendar connection on mount
  useEffect(() => {
    fetch('/api/gcal/status')
      .then(r => r.json())
      .then(d => { if (d.connected) { setGcalStatus('connected'); fetchGcalEvents(); } else setGcalStatus('disconnected'); })
      .catch(() => setGcalStatus('disconnected'));
  }, []);

  // Listen for popup postMessage confirming OAuth success
  useEffect(() => {
    const handler = e => {
      if (e.data === 'gcal-connected') { setGcalStatus('connected'); fetchGcalEvents(); }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  function fetchGcalEvents() {
    setGcalStatus('loading');
    fetch('/api/gcal/events')
      .then(r => r.json())
      .then(d => { setGcalEvents(d.events ?? []); setGcalStatus('connected'); })
      .catch(() => setGcalStatus('connected'));
  }

  function connectGcal() {
    window.open('http://localhost:3001/api/gcal/auth', 'gcal-auth', 'width=520,height=640,left=200,top=100');
  }

  function disconnectGcal() {
    fetch('/api/gcal/disconnect', { method: 'POST' })
      .then(() => { setGcalStatus('disconnected'); setGcalEvents([]); });
  }

  // Normalize legacy events (seed data without id/_sort)
  useEffect(() => {
    if (schedule.some(e => !e.id)) {
      setSchedule(p => p.map((e, i) => {
        if (e.id) return e;
        // Parse "HH:MM" 24h time to _sort minutes
        const [h, m] = e.time.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12  = ((h % 12) || 12);
        return {
          ...e,
          id:    `ev-m${Date.now()}-${i}`,
          _sort: h * 60 + (m || 0),
          time:  `${h12}:${String(m || 0).padStart(2,'0')} ${ampm}`,
        };
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge local + Google events, deduplicate by id, sort by time
  const sorted = [...schedule, ...gcalEvents].sort((a, b) => (a._sort ?? 0) - (b._sort ?? 0));

  const totalMins  = sorted.reduce((s, e) => s + e.dur, 0);
  const meetingMin = sorted.filter(e => e.type==='meeting').reduce((s, e) => s + e.dur, 0);
  const agentMin   = sorted.filter(e => e.type==='agent').reduce((s, e) => s + e.dur, 0);
  const deepMin    = sorted.filter(e => e.type==='deep-work').reduce((s, e) => s + e.dur, 0);

  function addEvent(ev) {
    setSchedule(p => [...p, ev]);
    setShowModal(false);
  }

  function deleteEvent(id) {
    setSchedule(p => p.filter(e => e.id !== id));
  }

  return (
    <section className="view view--narrow" aria-labelledby="schedule-title">
      <header className="view-header" style={{ marginBottom:18 }}>
        <div>
          <h1 id="schedule-title" className="view-title">Today's Schedule</h1>
          <p className="view-subtitle">{dateStr}</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {gcalStatus === 'disconnected' && (
            <button
              className="btn btn--sm"
              style={{ background:'#4285F412', borderColor:GCAL_COLOR, color:GCAL_COLOR }}
              onClick={connectGcal}
              title="Sync today's Google Calendar events"
            >
              🗓 Connect Google
            </button>
          )}
          {gcalStatus === 'loading' && (
            <span style={{ fontSize:11, color:'var(--muted)', fontFamily:'var(--mono)' }}>Syncing…</span>
          )}
          {gcalStatus === 'connected' && (
            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontFamily:'var(--mono)' }}>
              <span style={{ color:GCAL_COLOR }}>● Google ({gcalEvents.length})</span>
              <button
                style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:10, textDecoration:'underline', padding:0 }}
                onClick={disconnectGcal}
              >disconnect</button>
            </span>
          )}
          <button className="btn btn--outline-accent" onClick={() => setShowModal(true)}>
            + Add Event
          </button>
        </div>
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

      {sorted.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)', fontSize:13 }}>
          No events scheduled — click "+ Add Event" to get started.
        </div>
      )}

      {/* Timeline */}
      <div className="schedule-timeline" role="list" aria-label="Schedule timeline">
        <div className="schedule-line" aria-hidden="true"/>

        {sorted.map((e, i) => {
          const h    = e._sort != null ? Math.floor(e._sort / 60) : parseInt(e.time);
          const past = h < hr;
          const cur  = h === hr;

          return (
            <div
              key={e.id ?? i}
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
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {e.source === 'google'
                      ? <span style={{ fontSize:9, fontFamily:'var(--mono)', color:GCAL_COLOR, border:`1px solid ${GCAL_COLOR}`, borderRadius:4, padding:'1px 5px' }}>Google</span>
                      : <Badge label={e.type.replace('-',' ')} color={e.cl}/>
                    }
                    {e.source !== 'google' && (
                      <button
                        style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:14, lineHeight:1, padding:'0 2px' }}
                        onClick={() => window.confirm(`Remove "${e.title}"?`) && deleteEvent(e.id ?? i)}
                        aria-label={`Delete event: ${e.title}`}
                      >×</button>
                    )}
                  </div>
                </div>
                <div style={{ marginTop:5 }}>
                  <ProgressBar value={past ? 100 : cur ? 50 : 0} color={e.cl} height={3}/>
                </div>
                <div className="schedule-dur">
                  {e.dur} minutes
                  {e.hangoutLink && (
                    <a href={e.hangoutLink} target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft:10, fontSize:10, color:GCAL_COLOR }}>
                      Meet link ↗
                    </a>
                  )}
                  {e.location && !e.hangoutLink && (
                    <span style={{ marginLeft:10, fontSize:10, color:'var(--muted)' }}>📍 {e.location}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <EventModal onAdd={addEvent} onClose={() => setShowModal(false)}/>}
    </section>
  );
}
