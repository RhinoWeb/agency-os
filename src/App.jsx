import { useState, useEffect, useRef } from 'react';
import { usePersistedState } from './hooks/usePersistedState.js';
import { seedAgents, seedColumns, seedWorkflows, seedClients, seedLeads, seedCampaigns, seedPages, seedNotifications, seedSchedule } from './data.js';
import OnboardingWizard from './components/layout/OnboardingWizard.jsx';
import { THEMES, DEFAULT_SETTINGS, DEFAULT_PROFILE } from './theme.js';

import Nav               from './components/layout/Nav.jsx';
import Notifications     from './components/layout/Notifications.jsx';
import CommandPalette    from './components/layout/CommandPalette.jsx';
import TaskModal         from './components/layout/TaskModal.jsx';

import Dashboard         from './views/Dashboard.jsx';
import TaskBoard         from './views/TaskBoard.jsx';
import AgentFleet        from './views/AgentFleet.jsx';
import Workflows         from './views/Workflows.jsx';
import Analytics         from './views/Analytics.jsx';
import Clients           from './views/Clients.jsx';
import Schedule          from './views/Schedule.jsx';
import KnowledgeBase     from './views/KnowledgeBase.jsx';
import AIBrain           from './views/AIBrain.jsx';
import Settings          from './views/Settings.jsx';
import Profile           from './views/Profile.jsx';
import WebBrowser        from './views/WebBrowser.jsx';
import Wiki              from './views/Wiki.jsx';
import Updates           from './views/Updates.jsx';
import LeadFinder        from './views/LeadFinder.jsx';
import Campaigns         from './views/Campaigns.jsx';

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
  const [setupDone,  setSetupDone]  = usePersistedState('aos-setup-done',  false);

  // ── Ephemeral UI state ───────────────────────────────────
  const [clock,           setClock]           = useState('');
  const [showNotif,       setShowNotif]       = useState(false);
  const [showCmd,         setShowCmd]         = useState(false);
  const [modal,           setModal]           = useState(null);
  const [timer,           setTimer]           = useState({ on: false, tid: null, sec: 0 });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serverOnline,    setServerOnline]    = useState(true);
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

  // ── Cmd+K shortcut ───────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCmd(p => !p);
      }
      if (e.key === 'Escape') {
        setShowNotif(false);
        setShowCmd(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
          id:       `t${Date.now()}`,
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
    allTasks, actAgents, mrr, clock,
    timer, startTimer, fmtTimer,
    toggleAgent, moveTask, addTask, toggleSub, deleteTask,
    aiMsgs, setAiMsgs,
    settings,
    setTab, setModal,
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

      <main id="main-content" tabIndex={-1}>
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
        {tab === 'browser'   && <WebBrowser settings={settings} />}
        {tab === 'wiki'      && <Wiki />}
        {tab === 'updates'   && <Updates />}
      </main>
    </div>
  );
}
