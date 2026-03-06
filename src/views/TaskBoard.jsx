import { useState } from 'react';
import { Badge, ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';

const PRIORITY_COLOR = { high: C.red, medium: C.yellow, low: C.accent };

export default function TaskBoard({ columns, timer, startTimer, fmtTimer, moveTask, toggleSub, deleteTask, setModal }) {
  const [drag,         setDrag]         = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  return (
    <section className="view" aria-labelledby="board-title">
      <header className="view-header">
        <div>
          <h1 id="board-title" className="view-title">Task Board</h1>
          <p className="view-subtitle">Drag between columns · Click to expand · Track time</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {timer.on && (
            <div className="timer-badge" aria-live="polite" aria-label={`Timer: ${fmtTimer(timer.sec)}`}>
              <span aria-hidden="true" style={{ animation:'pulse 1s infinite' }}>●</span>
              {fmtTimer(timer.sec)}
            </div>
          )}
          <button className="btn btn--outline-accent" onClick={() => setModal({ type:'newTask' })}>
            + New Task
          </button>
        </div>
      </header>

      <div className="board" role="region" aria-label="Task columns">
        {Object.entries(columns).map(([ck, col]) => (
          <div key={ck}
            className="column"
            style={{ borderTopColor: col.color }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (drag) { moveTask(drag.id, drag.from, ck); setDrag(null); } }}
            role="group"
            aria-label={`${col.title} column, ${col.items.length} tasks`}
          >
            <div className="column-header">
              <span className="column-title" style={{ color: col.color }}>{col.title}</span>
              <span className="column-count">{col.items.length}</span>
            </div>

            <div className="column-body">
              {col.items.map(task => {
                const expanded = expandedTask === task.id;
                const sDone    = (task.subtasks ?? []).filter(s => s.d).length;
                const sTotal   = (task.subtasks ?? []).length;
                const isTimingThis = timer.on && timer.tid === task.id;

                return (
                  <article
                    key={task.id}
                    className={`task-card${isTimingThis ? ' task-card--timing' : ''}`}
                    draggable
                    onDragStart={() => setDrag({ id: task.id, from: ck })}
                    onDragEnd={()   => setDrag(null)}
                    aria-label={`${task.title}, ${task.priority} priority, due ${task.due}`}
                  >
                    <div className="task-card__header">
                      <Badge label={task.priority} color={PRIORITY_COLOR[task.priority]}/>
                      <span style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)' }}>{task.due}</span>
                    </div>

                    <div
                      className="task-card__title"
                      onClick={() => setExpandedTask(expanded ? null : task.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onKeyDown={e => (e.key==='Enter'||e.key===' ') && setExpandedTask(expanded ? null : task.id)}
                    >
                      {task.title}
                    </div>

                    {sTotal > 0 && (
                      <div className="subtask-bar">
                        <ProgressBar value={sTotal ? sDone/sTotal*100 : 0} color={col.color} height={3}/>
                        <div className="subtask-count">{sDone}/{sTotal}</div>
                      </div>
                    )}

                    <div className="task-card__footer">
                      <div className="task-card__tags">
                        {task.tags.map(t => <span key={t} className="task-tag">#{t}</span>)}
                      </div>
                      <span className="task-card__agent">{task.agent}</span>
                    </div>

                    {expanded && (
                      <div className="task-expanded">
                        {sTotal > 0 && (
                          <ul style={{ listStyle:'none', marginBottom:6 }}>
                            {task.subtasks.map((st, si) => (
                              <li key={si}>
                                <div
                                  className="subtask"
                                  onClick={() => toggleSub(ck, task.id, si)}
                                  role="checkbox"
                                  aria-checked={st.d}
                                  tabIndex={0}
                                  onKeyDown={e => (e.key==='Enter'||e.key===' ') && toggleSub(ck, task.id, si)}
                                  style={{ color: st.d ? 'var(--muted)' : 'var(--text)', textDecoration: st.d ? 'line-through' : 'none' }}
                                >
                                  <span
                                    className="subtask-check"
                                    aria-hidden="true"
                                    style={{
                                      borderColor: st.d ? C.accent : 'var(--border)',
                                      background: st.d ? `${C.accent}18` : 'transparent',
                                      color: C.accent,
                                    }}
                                  >
                                    {st.d ? '✓' : ''}
                                  </span>
                                  {st.t}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {task.notes && (
                          <div className="task-notes">📝 {task.notes}</div>
                        )}

                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <button
                            className="btn btn--sm"
                            style={{
                              background: isTimingThis ? `${C.accent2}18` : `${C.accent}12`,
                              borderColor: isTimingThis ? C.accent2 : C.accent,
                              color:       isTimingThis ? C.accent2 : C.accent,
                            }}
                            onClick={() => startTimer(task.id)}
                            aria-label={isTimingThis ? 'Stop timer' : 'Start timer'}
                            aria-pressed={isTimingThis}
                          >
                            {isTimingThis ? '⏹ Stop' : '⏱ Start'}
                          </button>
                          {task.time > 0 && (
                            <span style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)' }}>
                              ⏱ {Math.floor(task.time/60)}h{task.time%60}m
                            </span>
                          )}
                          <button
                            className="btn btn--sm"
                            style={{ marginLeft:'auto', background:`${C.red}12`, borderColor:C.red, color:C.red }}
                            onClick={() => { if (window.confirm(`Delete "${task.title}"?`)) { deleteTask(task.id); setExpandedTask(null); } }}
                            aria-label={`Delete task: ${task.title}`}
                          >
                            ✕ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
