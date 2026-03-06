import { useState } from 'react';
import { Dot } from '../ui/index.jsx';

const NAV_SECTIONS = [
  { label: 'CORE', items: [
    { id: 'dashboard', label: 'Command',  icon: '◈' },
    { id: 'tasks',     label: 'Tasks',    icon: '▦' },
    { id: 'agents',    label: 'Agents',   icon: '⬡' },
    { id: 'ai',        label: 'AI',       icon: '🧠' },
  ]},
  { label: 'BUSINESS', items: [
    { id: 'workflows', label: 'Automate', icon: '⚡' },
    { id: 'analytics', label: 'Analytics',icon: '📊' },
    { id: 'clients',   label: 'Clients',  icon: '🏢' },
    { id: 'schedule',  label: 'Schedule', icon: '◷' },
  ]},
  { label: 'PIPELINE', items: [
    { id: 'leads',     label: 'Leads',    icon: '◉' },
    { id: 'campaigns', label: 'Campaigns',icon: '📨' },
  ]},
  { label: 'OPS', items: [
    { id: 'knowledge', label: 'Docs',     icon: '◎' },
  ]},
];

export default function Nav({ tab, setTab, unread, actAgents, showNotif, setShowNotif, setNotifs, setShowCmd, timer, fmtTimer, profile, updateAvailable, serverOnline }) {
  const [collapsed, setCollapsed] = useState(false);

  function handleNotif() {
    setShowNotif(p => !p);
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  }

  return (
    <nav className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`} aria-label="Main navigation">
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', left: '-9999px', top: 'auto' }}>
        Skip to content
      </a>

      <div className="sidebar-brand">
        <span className="sidebar-brand-icon" aria-hidden="true">◈</span>
        {!collapsed && <span className="sidebar-brand-text">AGENCY OS</span>}
      </div>

      <div className="sidebar-scroll">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(t => (
              <button
                key={t.id}
                className="sidebar-tab"
                aria-current={tab === t.id ? 'page' : undefined}
                onClick={() => setTab(t.id)}
                title={collapsed ? t.label : undefined}
              >
                <span className="sidebar-tab-icon" aria-hidden="true">{t.icon}</span>
                <span className="sidebar-tab-label">{t.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {timer.on && (
          <div className="sidebar-timer" aria-live="polite">
            ⏱ {fmtTimer(timer.sec)}
          </div>
        )}
        <div className="sidebar-live-status" aria-label={`${actAgents.length} agents live, API ${serverOnline ? 'online' : 'offline'}`}>
          <Dot status={serverOnline ? 'active' : 'paused'} />
          {!collapsed && (
            <>
              {actAgents.length} LIVE
              {!serverOnline && <span style={{ color: 'var(--red)', marginLeft: 4, fontSize: 9 }}>· API ⚠</span>}
            </>
          )}
        </div>
        <div className="sidebar-footer-row">
          <button
            className="nav-cmd-btn"
            onClick={() => setShowCmd(p => !p)}
            aria-label="Open command palette (Ctrl+K)"
            aria-keyshortcuts="Control+k"
            title="⌘K"
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
            {updateAvailable && <span className="nav-update-dot" aria-hidden="true" />}
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
            {profile?.avatar?.startsWith('data:')
              ? <img src={profile.avatar} alt="Profile" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              : (profile?.avatar ?? '🦊')
            }
          </button>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(p => !p)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>
    </nav>
  );
}
