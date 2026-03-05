import { Dot } from '../ui/index.jsx';

const TABS = [
  { id: 'dashboard', label: 'Command',  icon: '◈' },
  { id: 'tasks',     label: 'Tasks',    icon: '▦' },
  { id: 'agents',    label: 'Agents',   icon: '⬡' },
  { id: 'workflows', label: 'Automate', icon: '⚡' },
  { id: 'analytics', label: 'Analytics',icon: '📊' },
  { id: 'clients',   label: 'Clients',  icon: '🏢' },
  { id: 'schedule',  label: 'Schedule', icon: '◷' },
  { id: 'knowledge', label: 'Docs',     icon: '◎' },
  { id: 'ai',        label: 'AI',       icon: '🧠' },
  { id: 'browser',   label: 'Browser',  icon: '🌐' },
];

export default function Nav({ tab, setTab, unread, actAgents, showNotif, setShowNotif, setNotifs, setShowCmd, timer, fmtTimer, profile, updateAvailable }) {
  function handleNotif() {
    setShowNotif(p => !p);
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  }

  return (
    <nav className="nav" aria-label="Main navigation">
      <a href="#main-content" className="sr-only" style={{ position:'absolute', left:'-9999px', top:'auto' }}>
        Skip to content
      </a>

      <div className="nav-brand" aria-label="Agency OS">
        <span aria-hidden="true">◈</span>AGENCY OS
      </div>

      {TABS.map(t => (
        <button
          key={t.id}
          className="nav-tab"
          aria-current={tab === t.id ? 'page' : undefined}
          onClick={() => setTab(t.id)}
        >
          <span aria-hidden="true" style={{ fontSize: 12 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}

      <div className="nav-actions">
        {timer.on && (
          <span className="nav-timer" aria-live="polite" aria-label={`Timer running: ${fmtTimer(timer.sec)}`}>
            ⏱{fmtTimer(timer.sec)}
          </span>
        )}

        <button
          className="nav-cmd-btn"
          onClick={() => setShowCmd(p => !p)}
          aria-label="Open command palette (Ctrl+K)"
          aria-keyshortcuts="Control+k"
        >
          ⌘K
        </button>

        <button
          className="nav-notif-btn"
          onClick={handleNotif}
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          aria-expanded={showNotif}
        >
          🔔
          {unread > 0 && (
            <span className="nav-notif-badge" aria-hidden="true">{unread}</span>
          )}
        </button>

        <span className="nav-live-status" aria-label={`${actAgents.length} agents live`}>
          <Dot status="active" />
          {actAgents.length} LIVE
        </span>

        <button
          className={`nav-icon-btn${tab === 'wiki' ? ' nav-icon-btn--active' : ''}`}
          onClick={() => setTab('wiki')}
          aria-label="Wiki / Help"
          title="Wiki"
        >
          ?
        </button>

        <button
          className={`nav-icon-btn${tab === 'updates' ? ' nav-icon-btn--active' : ''}${updateAvailable ? ' nav-icon-btn--update' : ''}`}
          onClick={() => setTab('updates')}
          aria-label={updateAvailable ? 'Update available' : 'Updates & Changelog'}
          title="Updates"
          style={{ position: 'relative' }}
        >
          🔄
          {updateAvailable && (
            <span className="nav-update-dot" aria-hidden="true"/>
          )}
        </button>

        <button
          className={`nav-icon-btn${tab === 'settings' ? ' nav-icon-btn--active' : ''}`}
          onClick={() => setTab('settings')}
          aria-label="Settings"
          aria-current={tab === 'settings' ? 'page' : undefined}
          title="Settings"
        >
          ⚙
        </button>

        <button
          className={`nav-avatar-btn${tab === 'profile' ? ' nav-avatar-btn--active' : ''}`}
          onClick={() => setTab('profile')}
          aria-label="Profile"
          aria-current={tab === 'profile' ? 'page' : undefined}
          title="Profile"
        >
          {profile?.avatar ?? '🦊'}
        </button>
      </div>
    </nav>
  );
}
