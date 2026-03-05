import { useState, useEffect, useRef } from 'react';

export default function TaskModal({ agents, columns, onAdd, onClose }) {
  const [form, setForm] = useState({ title: '', priority: 'medium', agent: '', column: 'backlog', notes: '' });
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function handleKeyDown(e) {
    if (e.key === 'Escape') onClose();
  }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd(form);
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 id="modal-title" className="modal-title">Create Task</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            ref={titleRef}
            className="input"
            placeholder="Task title..."
            value={form.title}
            onChange={e => set('title', e.target.value)}
            aria-label="Task title"
            required
          />

          <fieldset style={{ border: 'none', display: 'flex', gap: 8 }}>
            <legend className="text-xs text-muted text-upper mb-4" style={{ marginBottom: 6 }}>Priority</legend>
            {['low', 'medium', 'high'].map(p => {
              const active = form.priority === p;
              const col = { low: 'var(--accent)', medium: 'var(--yellow)', high: 'var(--red)' }[p];
              return (
                <button
                  key={p}
                  type="button"
                  className="btn"
                  style={{
                    flex: 1,
                    background: active ? `${col}18` : 'var(--surface2)',
                    borderColor: active ? col : 'var(--border)',
                    color: active ? col : 'var(--muted)',
                  }}
                  aria-pressed={active}
                  onClick={() => set('priority', p)}
                >
                  {p}
                </button>
              );
            })}
          </fieldset>

          <select
            className="input"
            value={form.agent}
            onChange={e => set('agent', e.target.value)}
            aria-label="Assign agent"
          >
            <option value="">Assign agent...</option>
            {agents.map(a => (
              <option key={a.id} value={a.name}>{a.icon} {a.name}</option>
            ))}
          </select>

          <select
            className="input"
            value={form.column}
            onChange={e => set('column', e.target.value)}
            aria-label="Column"
          >
            {Object.entries(columns).map(([k, v]) => (
              <option key={k} value={k}>{v.title}</option>
            ))}
          </select>

          <textarea
            className="input"
            placeholder="Notes (optional)..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={2}
            style={{ resize: 'vertical' }}
            aria-label="Notes"
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" style={{ flex: 1 }}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
