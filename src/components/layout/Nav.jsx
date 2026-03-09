import {
  LayoutDashboard, CheckSquare, Bot, Brain,
  DollarSign, Users, Building2, BarChart3,
  Target, Mail, FileText,
  Zap, LineChart, Calendar,
  BookOpen, Settings, Bell, User,
  HelpCircle, RefreshCw, Search,
} from 'lucide-react';
import { Dot } from '../ui/index.jsx';

const NAV_SECTIONS = [
  {
    items: [
      { id: 'dashboard', label: 'Command',    icon: LayoutDashboard },
      { id: 'tasks',     label: 'Tasks',      icon: CheckSquare },
      { id: 'agents',    label: 'Agents',     icon: Bot },
      { id: 'ai',        label: 'AI',         icon: Brain },
    ],
  },
  {
    items: [
      { id: 'deals',       label: 'Deals',    icon: DollarSign },
      { id: 'contacts',    label: 'Contacts', icon: Users },
      { id: 'clients',     label: 'Clients',  icon: Building2 },
      { id: 'crm-reports', label: 'Reports',  icon: BarChart3 },
    ],
  },
  {
    items: [
      { id: 'leads',      label: 'Leads',      icon: Target },
      { id: 'campaigns',  label: 'Campaigns',  icon: Mail },
      { id: 'templates',  label: 'Templates',  icon: FileText },
    ],
  },
  {
    items: [
      { id: 'workflows',  label: 'Automate',   icon: Zap },
      { id: 'analytics',  label: 'Analytics',  icon: LineChart },
      { id: 'schedule',   label: 'Schedule',   icon: Calendar },
    ],
  },
  {
    items: [
      { id: 'knowledge',  label: 'Docs',       icon: BookOpen },
    ],
  },
];

export default function Nav({ tab, setTab, unread, actAgents, showNotif, setShowNotif, setNotifs, setShowCmd, timer, fmtTimer, profile, updateAvailable, serverOnline }) {
  function handleNotif() {
    setShowNotif(p => !p);
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  }

  return (
    <nav className="rail" aria-label="Main navigation">
      <a href="#main-content" className="sr-only">
        Skip to content
      </a>

      <div className="rail-brand" onClick={() => setTab('dashboard')} title="Agency OS">
        <LayoutDashboard size={20} />
      </div>

      <div className="rail-scroll">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {si > 0 && <div className="rail-divider" />}
            {section.items.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className="rail-tab"
                  aria-current={tab === t.id ? 'page' : undefined}
                  onClick={() => setTab(t.id)}
                  title={t.label}
                  aria-label={t.label}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="rail-footer">
        <button
          className="rail-tab"
          onClick={() => setTab('settings')}
          aria-current={tab === 'settings' ? 'page' : undefined}
          title="Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          className="rail-tab"
          onClick={() => setTab('profile')}
          aria-current={tab === 'profile' ? 'page' : undefined}
          title="Profile"
          aria-label="Profile"
          style={{ borderRadius: '50%' }}
        >
          {profile?.avatar?.startsWith('data:')
            ? <img src={profile.avatar} alt="Profile" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
            : <User size={18} />
          }
        </button>
      </div>
    </nav>
  );
}
