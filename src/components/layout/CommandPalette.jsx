import { useState, useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';

export default function CommandPalette({ setTab, setShowCmd, setModal }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const trapRef = useFocusTrap();

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

  // Reset active index when query changes
  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setShowCmd(false); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % (filtered.length || 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i - 1 + (filtered.length || 1)) % (filtered.length || 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIdx]) filtered[activeIdx].action();
      return;
    }
  }

  const activeId = filtered.length > 0 ? `cmd-item-${activeIdx}` : undefined;

  return (
    <div
      className="cmd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setShowCmd(false)}
      onKeyDown={handleKeyDown}
      ref={trapRef}
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
            aria-activedescendant={activeId}
          />
        </div>
        <ul className="cmd-list" id="cmd-list" role="listbox" ref={listRef}>
          {filtered.map((a, i) => (
            <li
              key={i}
              id={`cmd-item-${i}`}
              className={`cmd-item${i === activeIdx ? ' cmd-item--active' : ''}`}
              role="option"
              aria-selected={i === activeIdx}
              onClick={a.action}
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
