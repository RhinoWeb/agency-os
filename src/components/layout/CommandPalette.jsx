import { useState, useEffect, useRef, useMemo } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { THEMES } from '../../theme.js';

/** Simple fuzzy match — checks if all query chars appear in order in target */
function fuzzyMatch(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

/** Score: earlier + tighter matches rank higher */
function fuzzyScore(query, target) {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0, firstMatch = -1, lastMatch = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (firstMatch === -1) firstMatch = ti;
      lastMatch = ti;
      qi++;
    }
  }
  if (qi < q.length) return Infinity;
  // Lower score = better: prioritize early matches + short spans
  return firstMatch * 2 + (lastMatch - firstMatch);
}

export default function CommandPalette({ setTab, setShowCmd, setModal, runAutopilot, settings, setSettings }) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const trapRef = useFocusTrap();

  function go(tab) { setTab(tab); setShowCmd(false); }
  function act(fn) { fn(); setShowCmd(false); }

  function cycleTheme() {
    const idx = THEMES.findIndex(t => t.id === settings?.theme);
    const next = THEMES[(idx + 1) % THEMES.length];
    setSettings(s => ({ ...s, theme: next.id }));
    setShowCmd(false);
  }

  const actions = useMemo(() => [
    // ── Create ──
    { label: 'New Task',            icon: '＋', group: 'Create',  action: () => act(() => setModal({ type: 'newTask' })) },
    { label: 'New Workflow',        icon: '⚡', group: 'Create',  action: () => { go('workflows'); } },
    { label: 'New Campaign',        icon: '📨', group: 'Create',  action: () => { go('campaigns'); } },
    { label: 'New Agent',           icon: '🤖', group: 'Create',  action: () => { go('agents'); } },

    // ── Navigate ──
    { label: 'Mission Control',     icon: '◈',  group: 'Navigate', action: () => go('dashboard') },
    { label: 'Task Board',          icon: '▦',  group: 'Navigate', action: () => go('tasks') },
    { label: 'Agent Fleet',         icon: '⬡',  group: 'Navigate', action: () => go('agents') },
    { label: 'Workflows',           icon: '⚡', group: 'Navigate', action: () => go('workflows') },
    { label: 'Analytics',           icon: '📊', group: 'Navigate', action: () => go('analytics') },
    { label: 'Clients',             icon: '🏢', group: 'Navigate', action: () => go('clients') },
    { label: 'Schedule',            icon: '◷',  group: 'Navigate', action: () => go('schedule') },
    { label: 'Knowledge Base',      icon: '◎',  group: 'Navigate', action: () => go('knowledge') },
    { label: 'AI Brain',            icon: '🧠', group: 'Navigate', action: () => go('ai') },
    { label: 'Lead Finder',         icon: '🔍', group: 'Navigate', action: () => go('leads') },
    { label: 'Campaigns',           icon: '📨', group: 'Navigate', action: () => go('campaigns') },
    { label: 'Deal Pipeline',       icon: '💰', group: 'Navigate', action: () => go('deals') },
    { label: 'Contacts & Companies',icon: '👥', group: 'Navigate', action: () => go('contacts') },
    { label: 'Email Templates',     icon: '✉️', group: 'Navigate', action: () => go('templates') },
    { label: 'CRM Reports',         icon: '📈', group: 'Navigate', action: () => go('crm-reports') },
    { label: 'Wiki / Docs',         icon: '📖', group: 'Navigate', action: () => go('wiki') },
    { label: 'Updates',             icon: '🔔', group: 'Navigate', action: () => go('updates') },
    { label: 'Settings',            icon: '⚙️', group: 'Navigate', action: () => go('settings') },
    { label: 'Profile',             icon: '👤', group: 'Navigate', action: () => go('profile') },

    // ── Utility ──
    { label: 'Run Autopilot',       icon: '🚀', group: 'Utility',  action: () => act(() => runAutopilot?.()) },
    { label: 'Cycle Theme',         icon: '🎨', group: 'Utility',  action: cycleTheme },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [settings?.theme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    return actions
      .filter(a => fuzzyMatch(query, a.label) || fuzzyMatch(query, a.group))
      .sort((a, b) => fuzzyScore(query, a.label) - fuzzyScore(query, b.label));
  }, [query, actions]);

  // Group the filtered results
  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of filtered) {
      if (!map.has(a.group)) map.set(a.group, []);
      map.get(a.group).push(a);
    }
    return map;
  }, [filtered]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => {
    const list = [];
    for (const items of grouped.values()) list.push(...items);
    return list;
  }, [grouped]);

  useEffect(() => { setActiveIdx(0); }, [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setShowCmd(false); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % (flatList.length || 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i - 1 + (flatList.length || 1)) % (flatList.length || 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (flatList[activeIdx]) flatList[activeIdx].action();
      return;
    }
  }

  const activeId = flatList.length > 0 ? `cmd-item-${activeIdx}` : undefined;
  let flatIdx = 0;

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
        <div className="cmd-list" id="cmd-list" role="listbox" ref={listRef} style={{ maxHeight: 340, overflowY: 'auto' }}>
          {[...grouped.entries()].map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--muted)', fontFamily:'var(--sans)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'8px 14px 4px' }}>
                {group}
              </div>
              {items.map(a => {
                const idx = flatIdx++;
                const isActive = idx === activeIdx;
                return (
                  <div
                    key={a.label}
                    id={`cmd-item-${idx}`}
                    className={`cmd-item${isActive ? ' cmd-item--active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    onClick={a.action}
                  >
                    <span style={{ fontSize: 16, width: 24 }} aria-hidden="true">{a.icon}</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--sans)' }}>{a.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {flatList.length === 0 && (
            <div style={{ padding:'16px 14px', fontSize:12, color:'var(--muted)', fontFamily:'var(--sans)', textAlign:'center' }}>
              No matching commands
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
