const BREADCRUMB_MAP = {
  dashboard:     [{ label: 'Home' }],
  tasks:         [{ label: 'Home', tab: 'dashboard' }, { label: 'Tasks' }],
  agents:        [{ label: 'Home', tab: 'dashboard' }, { label: 'Agents' }],
  ai:            [{ label: 'Home', tab: 'dashboard' }, { label: 'AI' }],
  deals:         [{ label: 'CRM' }, { label: 'Deals' }],
  contacts:      [{ label: 'CRM' }, { label: 'Contacts & Companies' }],
  clients:       [{ label: 'CRM' }, { label: 'Clients' }],
  'crm-reports': [{ label: 'CRM' }, { label: 'Reports' }],
  leads:         [{ label: 'Pipeline' }, { label: 'Leads' }],
  campaigns:     [{ label: 'Pipeline' }, { label: 'Campaigns' }],
  templates:     [{ label: 'Pipeline' }, { label: 'Templates' }],
  workflows:     [{ label: 'Business' }, { label: 'Automate' }],
  analytics:     [{ label: 'Business' }, { label: 'Analytics' }],
  schedule:      [{ label: 'Business' }, { label: 'Schedule' }],
  knowledge:     [{ label: 'Ops' }, { label: 'Docs' }],
  settings:      [{ label: 'Settings' }],
  profile:       [{ label: 'Profile' }],
  wiki:          [{ label: 'Help' }, { label: 'Wiki' }],
  updates:       [{ label: 'Help' }, { label: 'Updates' }],
};

export default function Breadcrumb({ tab, setTab }) {
  const crumbs = BREADCRUMB_MAP[tab] ?? [{ label: tab }];

  return (
    <div className="breadcrumb">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {' '}
            {isLast ? (
              <span className="breadcrumb-current">{c.label}</span>
            ) : (
              <span
                className="breadcrumb-item"
                onClick={() => c.tab && setTab(c.tab)}
                role={c.tab ? 'button' : undefined}
                tabIndex={c.tab ? 0 : undefined}
              >
                {c.label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
