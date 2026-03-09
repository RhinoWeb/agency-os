import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { usePersistedState } from './hooks/usePersistedState.js';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';
import { seedAgents, seedColumns, seedWorkflows, seedClients, seedLeads, seedCampaigns, seedPages, seedNotifications, seedSchedule, seedContacts, seedCompanies, seedDeals, seedEmailTemplates } from './data.js';
import OnboardingWizard from './components/layout/OnboardingWizard.jsx';
import { THEMES, DEFAULT_SETTINGS, DEFAULT_PROFILE } from './theme.js';

import Nav               from './components/layout/Nav.jsx';
import StatusBar         from './components/layout/StatusBar.jsx';
import Breadcrumb        from './components/layout/Breadcrumb.jsx';
import Notifications     from './components/layout/Notifications.jsx';
import CommandPalette    from './components/layout/CommandPalette.jsx';
import TaskModal         from './components/layout/TaskModal.jsx';
import ErrorBoundary     from './components/ui/ErrorBoundary.jsx';

// Eager-load core views (most visited)
import Dashboard         from './views/Dashboard.jsx';
import TaskBoard         from './views/TaskBoard.jsx';

// Lazy-load secondary views for code splitting
const AgentFleet        = lazy(() => import('./views/AgentFleet.jsx'));
const Workflows         = lazy(() => import('./views/Workflows.jsx'));
const Analytics         = lazy(() => import('./views/Analytics.jsx'));
const Clients           = lazy(() => import('./views/Clients.jsx'));
const Schedule          = lazy(() => import('./views/Schedule.jsx'));
const KnowledgeBase     = lazy(() => import('./views/KnowledgeBase.jsx'));
const AIBrain           = lazy(() => import('./views/AIBrain.jsx'));
const Settings          = lazy(() => import('./views/Settings.jsx'));
const Profile           = lazy(() => import('./views/Profile.jsx'));
const Wiki              = lazy(() => import('./views/Wiki.jsx'));
const Updates           = lazy(() => import('./views/Updates.jsx'));
const LeadFinder        = lazy(() => import('./views/LeadFinder.jsx'));
const Campaigns         = lazy(() => import('./views/Campaigns.jsx'));
const DealPipeline      = lazy(() => import('./views/DealPipeline.jsx'));
const ContactsCompanies = lazy(() => import('./views/ContactsCompanies.jsx'));
const EmailTemplates    = lazy(() => import('./views/EmailTemplates.jsx'));
const CRMReports        = lazy(() => import('./views/CRMReports.jsx'));

function fmtTimer(s) {
  return [
    String(Math.floor(s / 3600)).padStart(2, '0'),
    String(Math.floor(s % 3600 / 60)).padStart(2, '0'),
    String(s % 60).padStart(2, '0'),
  ].join(':');
}

export default function App() {
  // ── Navigation ──────────────────────────────────────────
  const [tab, setTab] = useState('dashboard');

  // ── Persisted state ─────────────────────────────────────
  const [agents,    setAgents]    = usePersistedState('aos-agents',    seedAgents);
  const [columns,   setColumns]   = usePersistedState('aos-columns',   seedColumns);
  const [workflows, setWorkflows] = usePersistedState('aos-workflows', seedWorkflows);
  const [clients,   setClients]   = usePersistedState('aos-clients',   seedClients);
  const [pages,     setPages]     = usePersistedState('aos-pages',     seedPages);
  const [notifs,    setNotifs]    = usePersistedState('aos-notifs',    seedNotifications);
  const [aiMsgs,    setAiMsgs]    = usePersistedState('aos-ai-msgs',   [
    { role: 'system', text: 'Agency AI online — full context loaded. Ask me anything about your tasks, agents, clients, or workflows.' },
  ]);
  const [settings,  setSettings]  = usePersistedState('aos-settings',  DEFAULT_SETTINGS);
  const [profile,   setProfile]   = usePersistedState('aos-profile',   DEFAULT_PROFILE);
  const [schedule,   setSchedule]   = usePersistedState('aos-schedule',    seedSchedule);
  const [leads,      setLeads]      = usePersistedState('aos-leads',       seedLeads);
  const [campaigns,  setCampaigns]  = usePersistedState('aos-campaigns',   seedCampaigns);
  const [apifyRuns,  setApifyRuns]  = usePersistedState('aos-apify-runs',  []);
  const [crmContacts, setCrmContacts] = usePersistedState('aos-crm-contacts', seedContacts);
  const [crmCompanies, setCrmCompanies] = usePersistedState('aos-crm-companies', seedCompanies);
  const [crmDeals,   setCrmDeals]   = usePersistedState('aos-crm-deals',    seedDeals);
  const [emailTemplates, setEmailTemplates] = usePersistedState('aos-email-templates', seedEmailTemplates);
  const [setupDone,    setSetupDone]    = usePersistedState('aos-setup-done',    false);
  const [lastBriefing, setLastBriefing] = usePersistedState('aos-last-briefing', null);
  const [weeklyReport, setWeeklyReport] = usePersistedState('aos-weekly-report', null);

  // ── Ephemeral UI state ───────────────────────────────────
  const [clock,           setClock]           = useState('');
  const [showNotif,       setShowNotif]       = useState(false);
  const [showCmd,         setShowCmd]         = useState(false);
  const [modal,           setModal]           = useState(null);
  const [timer,           setTimer]           = useState({ on: false, tid: null, sec: 0 });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serverOnline,    setServerOnline]    = useState(true);
  const [autopilotRunning, setAutopilotRunning] = useState(false);
  const [weeklyRunning,   setWeeklyRunning]   = useState(false);
  const timerRef = useRef(null);

  // ── Clock ────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (timer.on) {
      timerRef.current = setInterval(() => setTimer(p => ({ ...p, sec: p.sec + 1 })), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timer.on]);

  // ── Keyboard shortcuts (hybrid Option C) ─────────────────
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = useMemo(() => [
    { key: 'ctrl+k', action: () => setShowCmd(p => !p), label: 'Command palette' },
    { key: 'escape', action: () => { setShowNotif(false); setShowCmd(false); setShowShortcuts(false); }, label: 'Close' },
    { key: 'g d', action: () => setTab('dashboard'), label: 'Go to Dashboard' },
    { key: 'g t', action: () => setTab('tasks'),     label: 'Go to Tasks' },
    { key: 'g a', action: () => setTab('agents'),    label: 'Go to Agents' },
    { key: 'g i', action: () => setTab('ai'),        label: 'Go to AI' },
    { key: 'g p', action: () => setTab('deals'),     label: 'Go to Pipeline' },
    { key: 'g c', action: () => setTab('contacts'),  label: 'Go to Contacts' },
    { key: 'g l', action: () => setTab('leads'),     label: 'Go to Leads' },
    { key: 'g r', action: () => setTab('crm-reports'), label: 'Go to Reports' },
    { key: 'g s', action: () => setTab('settings'),  label: 'Go to Settings' },
    { key: 'g w', action: () => setTab('workflows'), label: 'Go to Workflows' },
    { key: '?', action: () => setShowShortcuts(p => !p), label: 'Show shortcuts' },
    { key: 'ctrl+n', action: () => setModal({ type: 'newTask' }), label: 'New task' },
  ], []); // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboardShortcuts(shortcuts);

  // ── Update check + server health ─────────────────────────
  useEffect(() => {
    const check = () => fetch('/api/version')
      .then(r => r.json())
      .then(d => { setServerOnline(true); if (d.updateAvailable) setUpdateAvailable(true); })
      .catch(() => setServerOnline(false));
    check();
    const id = setInterval(check, 3_600_000);
    return () => clearInterval(id);
  }, []);

  // ── Autopilot ────────────────────────────────────────────
  async function runAutopilot() {
    if (autopilotRunning) return;
    setAutopilotRunning(true);
    try {
      const res = await fetch('/api/autopilot/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agents, allTasks, clients, leads, campaigns,
          provider: settings.provider,
          apiKey:   settings.apiKeys?.[settings.provider],
          model:    settings.model,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLastBriefing(data);
      setNotifs(p => [{
        id: `autopilot-${crypto.randomUUID()}`, read: false, time: 'Just now',
        text: `🤖 Autopilot: ${data.briefing}`,
      }, ...p]);
    } catch (err) {
      console.error('Autopilot error:', err);
      setNotifs(p => [{
        id: `autopilot-err-${crypto.randomUUID()}`, read: false, time: 'Just now',
        text: `⚠️ Autopilot failed: ${err.message}`,
      }, ...p]);
    } finally {
      setAutopilotRunning(false);
    }
  }

  // ── 7 AM daily trigger ───────────────────────────────────
  const runAutopilotRef = useRef(runAutopilot);
  runAutopilotRef.current = runAutopilot;
  useEffect(() => {
    const check = () => {
      const now = new Date();
      if (now.getHours() !== 7 || now.getMinutes() !== 0) return;
      // Read from localStorage directly to avoid stale closure
      const stored = localStorage.getItem('aos-last-briefing');
      if (stored) {
        try {
          const b = JSON.parse(stored);
          if (b?.ranAt && new Date(b.ranAt).toDateString() === now.toDateString()) return;
        } catch { /* proceed */ }
      }
      runAutopilotRef.current();
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Weekly report ─────────────────────────────────────────
  async function runWeeklyReport() {
    if (weeklyRunning) return;
    setWeeklyRunning(true);
    try {
      const res = await fetch('/api/report/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agents, allTasks, clients, leads, campaigns, mrr,
          provider: settings.provider,
          apiKey:   settings.apiKeys?.[settings.provider],
          model:    settings.model,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setWeeklyReport(data);
      setNotifs(p => [{
        id: `weekly-${crypto.randomUUID()}`, read: false, time: 'Just now',
        text: `📊 Weekly Report: ${data.headline}`,
      }, ...p]);
    } catch (err) {
      console.error('Weekly report error:', err);
    } finally {
      setWeeklyRunning(false);
    }
  }

  // ── Monday 8 AM weekly report trigger ─────────────────────
  const runWeeklyReportRef = useRef(runWeeklyReport);
  runWeeklyReportRef.current = runWeeklyReport;
  useEffect(() => {
    const check = () => {
      const now = new Date();
      if (now.getDay() !== 1 || now.getHours() !== 8 || now.getMinutes() !== 0) return;
      const stored = localStorage.getItem('aos-weekly-report');
      if (stored) {
        try {
          const r = JSON.parse(stored);
          if (r?.ranAt && new Date(r.ranAt).toDateString() === now.toDateString()) return;
        } catch { /* proceed */ }
      }
      runWeeklyReportRef.current();
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Client health monitor ────────────────────────────────
  const healthTasksCreatedRef = useRef(new Set());
  useEffect(() => {
    const atRisk = clients.filter(c => c.status === 'active' && (c.health ?? 100) < 75);
    atRisk.forEach(client => {
      if (healthTasksCreatedRef.current.has(client.id)) return;
      const taskTitle = `Reconnect with ${client.name}`;
      // Also check existing columns to avoid duplicates on reload
      const alreadyExists = Object.values(columns).flatMap(col => col.items).some(t => t.title === taskTitle);
      if (alreadyExists) {
        healthTasksCreatedRef.current.add(client.id);
        return;
      }
      healthTasksCreatedRef.current.add(client.id);
      setColumns(p => ({
        ...p,
        backlog: {
          ...p.backlog,
          items: [...p.backlog.items, {
            id:       `health-${client.id}-${crypto.randomUUID()}`,
            title:    taskTitle,
            priority: 'high',
            agent:    'Unassigned',
            due:      'This week',
            tags:     ['client-health'],
            subtasks: [],
            notes:    `Health at ${client.health}%. Schedule a check-in call to address any issues.`,
            time:     0,
          }],
        },
      }));
      setNotifs(p => [{
        id: `health-${client.id}-${crypto.randomUUID()}`, read: false, time: 'Just now',
        text: `⚠ ${client.name} health is ${client.health}% — reconnect task created`,
      }, ...p]);
    });
  }, [clients, columns]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme ────────────────────────────────────────────────
  useEffect(() => {
    const theme = THEMES.find(t => t.id === settings.theme) ?? THEMES[0];
    const root  = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [settings.theme]);

  // ── Font size ────────────────────────────────────────────
  useEffect(() => {
    const sizes = { sm: '12px', md: '13px', lg: '15px' };
    document.documentElement.style.fontSize = sizes[settings.fontSize] ?? '13px';
  }, [settings.fontSize]);

  // ── Task actions ─────────────────────────────────────────
  function toggleAgent(id) {
    setAgents(p => p.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ));
  }

  function moveTask(tid, from, to) {
    if (from === to) return;
    setColumns(p => {
      const task = p[from].items.find(x => x.id === tid);
      if (!task) return p;
      return {
        ...p,
        [from]: { ...p[from], items: p[from].items.filter(x => x.id !== tid) },
        [to]:   { ...p[to],   items: [...p[to].items, task] },
      };
    });
  }

  function addTask(form) {
    setColumns(p => ({
      ...p,
      [form.column]: {
        ...p[form.column],
        items: [...p[form.column].items, {
          id:       `t-${crypto.randomUUID()}`,
          title:    form.title,
          priority: form.priority,
          agent:    form.agent || 'Unassigned',
          due:      'TBD',
          tags:     [],
          subtasks: [],
          notes:    form.notes,
          time:     0,
        }],
      },
    }));
    setModal(null);
  }

  function toggleSub(colKey, tid, si) {
    setColumns(p => ({
      ...p,
      [colKey]: {
        ...p[colKey],
        items: p[colKey].items.map(t =>
          t.id === tid
            ? { ...t, subtasks: t.subtasks.map((s, i) => i === si ? { ...s, d: !s.d } : s) }
            : t
        ),
      },
    }));
  }

  function startTimer(tid) {
    if (timer.on && timer.tid === tid) {
      const ck = Object.keys(columns).find(k => columns[k].items.some(t => t.id === tid));
      if (ck) {
        setColumns(p => ({
          ...p,
          [ck]: {
            ...p[ck],
            items: p[ck].items.map(t =>
              t.id === tid ? { ...t, time: (t.time || 0) + Math.floor(timer.sec / 60) } : t
            ),
          },
        }));
      }
      setTimer({ on: false, tid: null, sec: 0 });
    } else {
      setTimer({ on: true, tid, sec: 0 });
    }
  }

  function deleteTask(tid) {
    setColumns(p => {
      const next = {};
      for (const [k, col] of Object.entries(p)) {
        next[k] = { ...col, items: col.items.filter(t => t.id !== tid) };
      }
      return next;
    });
  }

  // ── Data reset handler ───────────────────────────────────
  function onResetAll(target) {
    if (target === 'ai')    setAiMsgs([{ role: 'system', text: 'Conversation cleared.' }]);
    if (target === 'tasks') setColumns(seedColumns);
    if (target === 'all')   {
      setAgents(seedAgents); setColumns(seedColumns); setWorkflows(seedWorkflows);
      setClients(seedClients); setPages(seedPages); setNotifs(seedNotifications);
      setAiMsgs([{ role: 'system', text: 'Agency AI online — full context loaded.' }]);
      setSettings(DEFAULT_SETTINGS); setProfile(DEFAULT_PROFILE);
      setSchedule(seedSchedule);
      setLeads(seedLeads); setCampaigns(seedCampaigns); setApifyRuns([]);
      setCrmContacts(seedContacts); setCrmCompanies(seedCompanies);
      setCrmDeals(seedDeals); setEmailTemplates(seedEmailTemplates);
      setLastBriefing(null); setWeeklyReport(null);
      healthTasksCreatedRef.current.clear();
    }
  }

  // ── Derived values ───────────────────────────────────────
  const unread    = notifs.filter(n => !n.read).length;
  const allTasks  = Object.values(columns).flatMap(c => c.items);
  const actAgents = agents.filter(a => a.status === 'active');
  const mrr       = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);

  // Bundle shared props to avoid repetition
  const shared = {
    agents, setAgents, columns, setColumns, workflows, setWorkflows,
    clients, setClients, pages, setPages, notifs, setNotifs,
    leads, setLeads, campaigns, setCampaigns, apifyRuns, setApifyRuns,
    crmContacts, setCrmContacts, crmCompanies, setCrmCompanies,
    crmDeals, setCrmDeals, emailTemplates, setEmailTemplates,
    allTasks, actAgents, mrr, clock,
    timer, startTimer, fmtTimer,
    toggleAgent, moveTask, addTask, toggleSub, deleteTask,
    aiMsgs, setAiMsgs,
    settings,
    profile,
    setTab, setModal,
    lastBriefing, autopilotRunning, runAutopilot,
    weeklyReport, weeklyRunning, runWeeklyReport,
  };

  return (
    <div className="app">
      <Nav
        tab={tab}
        setTab={setTab}
        unread={unread}
        actAgents={actAgents}
        showNotif={showNotif}
        setShowNotif={setShowNotif}
        setNotifs={setNotifs}
        setShowCmd={setShowCmd}
        timer={timer}
        fmtTimer={fmtTimer}
        profile={profile}
        updateAvailable={updateAvailable}
        serverOnline={serverOnline}
      />

      <div className="app-body">
        <Breadcrumb tab={tab} setTab={setTab} />

        {showNotif && <Notifications notifs={notifs} />}
        {showCmd   && <CommandPalette setTab={setTab} setShowCmd={setShowCmd} setModal={setModal} />}
        {modal?.type === 'newTask' && (
          <TaskModal agents={agents} columns={columns} onAdd={addTask} onClose={() => setModal(null)} />
        )}
        {!setupDone && (
          <OnboardingWizard
            settings={settings}
            setSettings={setSettings}
            profile={profile}
            setProfile={setProfile}
            onComplete={() => setSetupDone(true)}
            onResetAll={onResetAll}
          />
        )}

        {/* Keyboard shortcuts help overlay */}
        {showShortcuts && (
          <div className="shortcuts-overlay" onClick={e => e.target === e.currentTarget && setShowShortcuts(false)}>
            <div className="shortcuts-panel">
              <div className="shortcuts-title">Keyboard Shortcuts</div>
              <div className="shortcuts-group">
                <div className="shortcuts-group__label">Navigation</div>
                {shortcuts.filter(s => s.key.startsWith('g ')).map(s => (
                  <div key={s.key} className="shortcut-row">
                    <span>{s.label}</span>
                    <kbd>{s.key.toUpperCase()}</kbd>
                  </div>
                ))}
              </div>
              <div className="shortcuts-group">
                <div className="shortcuts-group__label">Actions</div>
                <div className="shortcut-row"><span>Command palette</span><kbd>Ctrl+K</kbd></div>
                <div className="shortcut-row"><span>New task</span><kbd>Ctrl+N</kbd></div>
                <div className="shortcut-row"><span>Close / dismiss</span><kbd>Esc</kbd></div>
                <div className="shortcut-row"><span>Show this help</span><kbd>?</kbd></div>
              </div>
            </div>
          </div>
        )}

        <main id="main-content" className="main-content-wrapper" tabIndex={-1}>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12 }}>Loading…</div>}>
              {tab === 'dashboard' && <Dashboard  {...shared} />}
              {tab === 'tasks'     && <TaskBoard  {...shared} />}
              {tab === 'agents'    && <AgentFleet {...shared} />}
              {tab === 'workflows' && <Workflows  {...shared} />}
              {tab === 'analytics' && <Analytics  {...shared} />}
              {tab === 'clients'   && <Clients    {...shared} />}
              {tab === 'schedule'  && <Schedule schedule={schedule} setSchedule={setSchedule} />}
              {tab === 'knowledge' && <KnowledgeBase {...shared} />}
              {tab === 'ai'        && <AIBrain    {...shared} />}
              {tab === 'settings'  && <Settings settings={settings} setSettings={setSettings} onResetAll={onResetAll} clients={clients} columns={columns} />}
              {tab === 'profile'   && <Profile  profile={profile} setProfile={setProfile} agents={agents} clients={clients} allTasks={allTasks} mrr={mrr} />}
              {tab === 'leads'     && <LeadFinder leads={leads} setLeads={setLeads} campaigns={campaigns} apifyRuns={apifyRuns} setApifyRuns={setApifyRuns} clients={clients} setClients={setClients} setTab={setTab} />}
              {tab === 'campaigns' && <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} leads={leads} setLeads={setLeads} agents={agents} />}
              {tab === 'deals'     && <DealPipeline deals={crmDeals} setDeals={setCrmDeals} contacts={crmContacts} companies={crmCompanies} />}
              {tab === 'contacts'  && <ContactsCompanies contacts={crmContacts} setContacts={setCrmContacts} companies={crmCompanies} setCompanies={setCrmCompanies} deals={crmDeals} />}
              {tab === 'templates' && <EmailTemplates emailTemplates={emailTemplates} setEmailTemplates={setEmailTemplates} profile={profile} />}
              {tab === 'crm-reports' && <CRMReports deals={crmDeals} contacts={crmContacts} companies={crmCompanies} />}
              {tab === 'wiki'      && <Wiki />}
              {tab === 'updates'   && <Updates />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <StatusBar
        actAgents={actAgents}
        serverOnline={serverOnline}
        timer={timer}
        fmtTimer={fmtTimer}
        clock={clock}
        setShowCmd={setShowCmd}
      />
    </div>
  );
}
