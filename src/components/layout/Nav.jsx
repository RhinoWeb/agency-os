import {
  LayoutDashboard, CheckSquare, Bot, Brain,
  DollarSign, Users, Building2, BarChart3,
  Target, Mail, FileText,
  Zap, LineChart, Calendar,
  BookOpen, Settings, Bell, User,
  HelpCircle, RefreshCw, Search,
  ChevronsLeft, ChevronsRight,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Command',    icon: LayoutDashboard },
      { id: 'tasks',     label: 'Tasks',      icon: CheckSquare },
      { id: 'agents',    label: 'Agents',     icon: Bot },
      { id: 'ai',        label: 'AI',         icon: Brain },
    ],
  },
  {
    label: 'CRM',
    items: [
      { id: 'deals',       label: 'Deals',    icon: DollarSign },
      { id: 'contacts',    label: 'Contacts', icon: Users },
      { id: 'clients',     label: 'Clients',  icon: Building2 },
      { id: 'crm-reports', label: 'Reports',  icon: BarChart3 },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { id: 'leads',      label: 'Leads',      icon: Target },
      { id: 'campaigns',  label: 'Campaigns',  icon: Mail },
      { id: 'templates',  label: 'Templates',  icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'workflows',  label: 'Automate',   icon: Zap },
      { id: 'analytics',  label: 'Analytics',  icon: LineChart },
      { id: 'schedule',   label: 'Schedule',   icon: Calendar },
    ],
  },
  {
    label: 'Resources',
    items: [
      { id: 'knowledge',  label: 'Docs',       icon: BookOpen },
    ],
  },
];

export default function Nav({ tab, setTab, unread, actAgents, showNotif, setShowNotif, setNotifs, setShowCmd, timer, fmtTimer, profile, updateAvailable, serverOnline, collapsed, setCollapsed }) {
  function handleNotif() {
    setShowNotif(p => !p);
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  }

  return (
    <nav className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`} aria-label="Main navigation">
      <a href="#main-content" className="sr-only">
        Skip to content
      </a>

      {/* Brand */}
      <div className="sidebar-brand">
        <button
          className="sidebar-brand__logo"
          onClick={() => setTab('dashboard')}
          title="Agency OS"
          aria-label="Agency OS — Go to dashboard"
        >
          <LayoutDashboard size={18} />
          <span className="sidebar-item__label">AgencyOS</span>
        </button>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      {/* Search / Cmd+K trigger */}
      <button
        className="sidebar-search"
        onClick={() => setShowCmd(true)}
        title="Search & commands (Ctrl+K)"
        aria-label="Open command palette"
      >
        <Search size={14} />
        <span className="sidebar-search__text sidebar-item__label">Search...</span>
        <kbd className="sidebar-search__kbd sidebar-item__label">Ctrl K</kbd>
      </button>

      {/* Nav sections */}
      <div className="sidebar-scroll">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="sidebar-section">
            <div className="sidebar-section-label sidebar-item__label">{section.label}</div>
            {section.items.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className="sidebar-item"
                  aria-current={tab === t.id ? 'page' : undefined}
                  onClick={() => setTab(t.id)}
                  title={t.label}
                  aria-label={t.label}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  <span className="sidebar-item__label">{t.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="sidebar-item"
          onClick={() => setTab('settings')}
          aria-current={tab === 'settings' ? 'page' : undefined}
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={16} strokeWidth={1.75} />
          <span className="sidebar-item__label">Settings</span>
        </button>
        <button
          className="sidebar-item"
          onClick={() => setTab('profile')}
          aria-current={tab === 'profile' ? 'page' : undefined}
          title="Profile"
          aria-label="Profile"
        >
          {profile?.avatar?.startsWith('data:')
            ? <img src={profile.avatar} alt="" className="sidebar-avatar" />
            : <User size={16} strokeWidth={1.75} />
          }
          <span className="sidebar-item__label">Profile</span>
        </button>
      </div>
    </nav>
  );
}
