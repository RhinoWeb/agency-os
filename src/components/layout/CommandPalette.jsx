import { useState, useEffect, useRef } from 'react';

export default function CommandPalette({ setTab, setShowCmd, setModal }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const actions = [
    { label: 'New Task',        icon: '📋', action: () => { setModal({ type: 'newTask' }); setShowCmd(false); } },
    { label: 'Mission Control', icon: '◈',  action: () => { setTab('dashboard');  setShowCmd(false); } },
    { label: 'Task Board',      icon: '▦',  action: () => { setTab('tasks');      setShowCmd(false); } },
    { label: 'Agents',          icon: '⬡',  action: () => { setTab('agents');     setShowCmd(false); } },
    { label: 'Workflows',       icon: '⚡', action: () => { setTab('workflows');  setShowCmd(false); } },
    { label: 'Analytics',       icon: '📊', action: () => { setTab('analytics');  setShowCmd(false); } },
    { label: 'Clients',         icon: '🏢', action: () => { setTab('clients');    setShowCmd(false); } },
    { label: 'Schedule',        icon: '◷',  action: () => { setTab('schedule');   setShowCmd(false); } },
    { label: 'Knowledge Base',  icon: '◎',  action: () => { setTab('knowledge');  setShowCmd(false); } },
    { label: 'AI Brain',        icon: '🧠', action: () => { setTab('ai');         setShowCmd(false); } },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleKeyDown(e) {
    if (e.key === 'Escape') setShowCmd(false);
  }

  return (
    <div
      className="cmd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setShowCmd(false)}
      onKeyDown={handleKeyDown}
    >
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-input-wrap">
          <input
            ref={inputRef}
            className="cmd-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command..."
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-autocomplete="list"
          />
        </div>
        <ul className="cmd-list" id="cmd-list" role="listbox">
          {filtered.map((a, i) => (
            <li
              key={i}
              className="cmd-item"
              role="option"
              tabIndex={0}
              onClick={a.action}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && a.action()}
            >
              <span style={{ fontSize: 16, width: 24 }} aria-hidden="true">{a.icon}</span>
              <span style={{ fontSize: 13, fontFamily: 'var(--sans)' }}>{a.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
