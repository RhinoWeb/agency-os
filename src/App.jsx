import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { usePersistedState } from './hooks/usePersistedState.js';
import { useServerState } from './hooks/useServerState.js';
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
import ConfirmModal      from './components/ui/ConfirmModal.jsx';

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

  // ── Server-backed state (SQLite via REST API) ──────────
  const [agents,    setAgents]    = useServerState('/api/agents',         seedAgents,       { type: 'list' });
  const [columns,   setColumns]   = useServerState('/api/tasks',          seedColumns,      { type: 'object' });
  const [workflows, setWorkflows] = useServerState('/api/workflows',      seedWorkflows,    { type: 'list' });
  const [clients,   setClients]   = useServerState('/api/clients',        seedClients,      { type: 'list' });
  const [pages,     setPages]     = useServerState('/api/pages',          seedPages,        { type: 'list' });
  const [notifs,    setNotifs]    = useServerState('/api/notifications',  seedNotifications,{ type: 'list' });
  const [aiMsgs,    setAiMsgs]    = useServerState('/api/ai-messages',    [
    { role: 'system', text: 'Agency AI online — full context loaded. Ask me anything about your tasks, agents, clients, or workflows.' },
  ], { type: 'list', debounceMs: 1000 });
  const [settings,  setSettings]  = useServerState('/api/settings', DEFAULT_SETTINGS, { type: 'setting', settingKey: 'settings' });
  const [profile,   setProfile]   = useServerState('/api/settings', DEFAULT_PROFILE,  { type: 'setting', settingKey: 'profile' });
  const [schedule,   setSchedule]   = useServerState('/api/schedule',        seedSchedule,     { type: 'list' });
  const [leads,      setLeads]      = useServerState('/api/leads',           seedLeads,        { type: 'list' });
  const [campaigns,  setCampaigns]  = useServerState('/api/campaigns',       seedCampaigns,    { type: 'list' });
  const [apifyRuns,  setApifyRuns]  = usePersistedState('aos-apify-runs',  []); // transient, keep local
  const [crmContacts, setCrmContacts] = useServerState('/api/crm/contacts',  seedContacts,     { type: 'list' });
  const [crmCompanies, setCrmCompanies] = useServerState('/api/crm/companies', seedCompanies, { type: 'list' });
  const [crmDeals,   setCrmDeals]   = useServerState('/api/crm/deals',       seedDeals,        { type: 'list' });
  const [emailTemplates, setEmailTemplates] = useServerState('/api/email-templates', seedEmailTemplates, { type: 'list' });
  const [setupDone,    setSetupDone]    = useServerState('/api/settings', false, { type: 'setting', settingKey: 'setupDone' });
  const [lastBriefing, setLastBriefing] = useServerState('/api/settings', null,  { type: 'setting', settingKey: 'lastBriefing' });
  const [weeklyReport, setWeeklyReport] = useServerState('/api/settings', null,  { type: 'setting', settingKey: 'weeklyReport' });
  const [replyQueue,   setReplyQueue]   = usePersistedState('aos-reply-queue', []); // transient polling queue, keep local
  const [pipelineConfig, setPipelineConfig] = useServerState('/api/settings', {
    autoEnrollThreshold: 65,
    autoBookEnabled: false,
    autopilotAutoExecute: false,
  }, { type: 'setting', settingKey: 'pipelineConfig' });
  const [scrapeSchedules, setScrapeSchedules] = useServerState('/api/settings', [], { type: 'setting', settingKey: 'scrapeSchedules' });

  // ── Sidebar ──────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistedState('aos-sidebar-collapsed', false);

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
  const [confirmState,    setConfirmState]    = useState(null); // { title, message, confirmLabel, danger, onConfirm }

  // Branded confirm dialog — replaces window.confirm() everywhere
  function openConfirm({ title, message = '', confirmLabel = 'Confirm', danger = false, onConfirm }) {
    setConfirmState({ title, message, confirmLabel, danger, onConfirm });
  }
  const timerRef = useRef(null);

  // ── Refs for polling effects (prevents stale closures without restarting intervals) ──
  const leadsRef          = useRef(leads);
  const campaignsRef      = useRef(campaigns);
  const pipelineConfigRef = useRef(pipelineConfig);
  leadsRef.current          = leads;
  campaignsRef.current      = campaigns;
  pipelineConfigRef.current = pipelineConfig;

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

  // ── Reply queue polling (sync Instantly replies) ─────────
  useEffect(() => {
    if (!serverOnline) return;
    const poll = () => fetch('/api/instantly/replies')
      .then(r => r.ok ? r.json() : [])
      .then(replies => {
        if (!replies.length) return;
        setReplyQueue(prev => {
          const existing = new Set(prev.map(r => r.id));
          const fresh = replies.filter(r => !existing.has(r.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        // Auto-update matching leads
        setLeads(prev => prev.map(lead => {
          const reply = replies.find(r => r.leadEmail === lead.email && !r.processed);
          if (!reply) return lead;
          const intentMap = { POSITIVE: 'positive', NEGATIVE: 'negative', NEUTRAL: 'neutral', UNSUBSCRIBE: 'negative', REFERRAL: 'positive', MAYBE_LATER: 'neutral' };
          return {
            ...lead,
            replyStatus: intentMap[reply.classification?.intent] ?? 'neutral',
            replySnippet: reply.replyText?.slice(0, 200) ?? '',
            replyClassification: reply.classification ?? null,
            replyReceivedAt: reply.timestamp,
          };
        }));
        // Ack processed replies
        replies.forEach(r => fetch(`/api/instantly/replies/${r.id}/ack`, { method: 'POST' }).catch(e => console.warn('Reply ACK failed:', e)));

        // Auto-book high-confidence positive replies (read fresh state via refs)
        const cfg = pipelineConfigRef.current;
        if (cfg.autoBookEnabled) {
          replies.forEach(reply => {
            if (reply.classification?.intent === 'POSITIVE' && (reply.classification?.confidence ?? 0) >= 0.85) {
              const lead = leadsRef.current.find(l => l.email === reply.leadEmail && !l.bookedMeeting && l.replyStatus !== 'booked');
              if (!lead) return;

              if (cfg.bookingMode === 'calcom' && cfg.calEventTypeId) {
                fetch('/api/cal/booking-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventTypeId: cfg.calEventTypeId, leadName: lead.name, leadEmail: lead.email }),
                }).then(r => r.json()).then(data => {
                  if (data.bookingUrl) {
                    setLeads(prev => prev.map(l => l.id === lead.id ? {
                      ...l, status: 'prospect', replyStatus: 'booking-link-sent', calBookingUrl: data.bookingUrl,
                    } : l));
                    setNotifs(prev => [{ id: `cal-link-${Date.now()}`, type: 'success', read: false, text: `Booking link generated for ${lead.name}`, ts: new Date().toISOString() }, ...prev]);
                  }
                }).catch(e => { console.warn('Cal.com link gen failed:', e); setNotifs(prev => [{ id: `cal-err-${Date.now()}`, type: 'error', read: false, text: `Booking link failed for ${lead.name}`, ts: new Date().toISOString() }, ...prev]); });
              } else {
                const d = new Date();
                d.setDate(d.getDate() + (d.getDay() >= 5 ? 8 - d.getDay() : 1));
                d.setHours(10, 0, 0, 0);
                fetch('/api/booking/auto', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ leadName: lead.name, leadEmail: lead.email, company: lead.company, startTime: d.toISOString(), durationMin: 30 }),
                }).then(r => r.json()).then(data => {
                  if (data.zoomJoinUrl || data.calendarEventId) {
                    setLeads(prev => prev.map(l => l.id === lead.id ? {
                      ...l, status: 'prospect', replyStatus: 'booked',
                      bookedMeeting: { zoomJoinUrl: data.zoomJoinUrl, calendarEventId: data.calendarEventId, calendarLink: data.calendarLink, scheduledAt: d.toISOString(), durationMin: 30 },
                    } : l));
                    setNotifs(prev => [{ id: `auto-book-${Date.now()}`, type: 'success', read: false, text: `Auto-booked call with ${lead.name} (${lead.company})`, ts: new Date().toISOString() }, ...prev]);
                  }
                }).catch(e => { console.warn('Auto-book failed:', e); setNotifs(prev => [{ id: `book-err-${Date.now()}`, type: 'error', read: false, text: `Auto-booking failed for ${lead.name}`, ts: new Date().toISOString() }, ...prev]); });
              }
            }
          });
        }
      })
      .catch(e => console.warn('Reply poll failed:', e));
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [serverOnline]);

  // ── Cal.com booking polling (self-scheduled meetings) ──
  useEffect(() => {
    if (!serverOnline) return;
    const poll = () => fetch('/api/cal/bookings')
      .then(r => r.ok ? r.json() : [])
      .then(bookings => {
        if (!bookings.length) return;
        bookings.forEach(booking => {
          if (booking.status === 'cancelled') {
            // Cancelled — revert lead to positive (they can reschedule)
            setLeads(prev => prev.map(l => {
              if (l.email !== booking.attendeeEmail || l.replyStatus !== 'booked') return l;
              return { ...l, replyStatus: 'positive', bookedMeeting: null };
            }));
          } else {
            // Confirmed booking — update lead (read fresh via ref)
            const lead = leadsRef.current.find(l => l.email === booking.attendeeEmail);
            if (lead && lead.replyStatus !== 'booked') {
              bookMeeting(lead, booking.startTime, 30).catch(e => console.warn('Cal.com auto-book failed:', e));
            } else if (lead && !lead.bookedMeeting?.scheduledAt) {
              // Lead already marked booked but missing details
              setLeads(prev => prev.map(l => l.email === booking.attendeeEmail ? {
                ...l,
                bookedMeeting: {
                  ...l.bookedMeeting,
                  scheduledAt: booking.startTime,
                  zoomJoinUrl: booking.meetingUrl ?? l.bookedMeeting?.zoomJoinUrl,
                  calBookingId: booking.id,
                },
              } : l));
            }
          }
          // Ack
          fetch(`/api/cal/bookings/${booking.id}/ack`, { method: 'POST' }).catch(e => console.warn('Cal booking ACK failed:', e));
        });
      })
      .catch(e => console.warn('Cal.com poll failed:', e));
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [serverOnline]);

  // ── Campaign stats sync (Instantly) ────────────────────
  useEffect(() => {
    if (!serverOnline) return;
    const sync = () => {
      campaignsRef.current.filter(c => c.instantlyCampaignId && c.status === 'active').forEach(camp => {
        fetch(`/api/instantly/stats/${camp.instantlyCampaignId}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (!d) return;
            setCampaigns(prev => prev.map(c => c.id !== camp.id ? c : {
              ...c,
              stats: {
                ...c.stats,
                sent: d.sent ?? c.stats.sent,
                opened: d.opened ?? c.stats.opened,
                replied: d.replied ?? c.stats.replied,
                openRate: d.open_rate ?? c.stats.openRate,
                replyRate: d.reply_rate ?? c.stats.replyRate,
              },
            }));
          })
          .catch(e => console.warn('Stats sync failed:', e));
      });
    };
    sync();
    const id = setInterval(sync, 300_000);
    return () => clearInterval(id);
  }, [serverOnline]);

  // ── Auto-import pipeline (scrape → import → score → enroll) ──
  useEffect(() => {
    if (!serverOnline) return;
    const poll = async () => {
      try {
        const r = await fetch('/api/apify/auto-results');
        if (!r.ok) return;
        const results = await r.json();
        if (!results.length) return;

        for (const run of results) {
          if (!run.leads?.length) continue;
          // Deduplicate against existing leads (read fresh via ref)
          const existingEmails = new Set(leadsRef.current.map(l => l.email).filter(Boolean));
          const fresh = run.leads.filter(l => l.email && !existingEmails.has(l.email));
          if (!fresh.length) {
            fetch(`/api/apify/auto-results/${run.runId}/claim`, { method: 'POST' }).catch(e => console.warn('Claim failed:', e));
            continue;
          }

          // Import leads
          setLeads(prev => [...fresh, ...prev]);

          // AI score the batch (read fresh config via ref)
          const cfg = pipelineConfigRef.current;
          try {
            const sr = await fetch('/api/ai/score-leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ leads: fresh.slice(0, 25), icp: cfg.icp ?? '' }),
            });
            const sd = await sr.json();
            if (sr.ok && sd.scores) {
              setLeads(prev => {
                const scoreMap = {};
                sd.scores.forEach(s => { if (s.index >= 1 && s.index <= fresh.length) scoreMap[fresh[s.index - 1].id] = s.score; });
                return prev.map(l => scoreMap[l.id] != null ? { ...l, leadScore: scoreMap[l.id] } : l);
              });
            }
          } catch { /* scoring optional */ }

          // Auto-enroll high scorers
          const threshold = cfg.autoEnrollThreshold ?? 65;
          const activeCamp = campaignsRef.current.find(c => c.status === 'active');
          if (activeCamp) {
            // Re-read fresh leads with scores applied (use optimistic threshold on import batch)
            const toEnroll = fresh.filter(l => (l.leadScore ?? 0) >= threshold);
            if (toEnroll.length) {
              const enrollIds = toEnroll.map(l => l.id);
              setLeads(prev => prev.map(l => enrollIds.includes(l.id) ? { ...l, campaignId: activeCamp.id, sequenceStep: 1 } : l));
              setCampaigns(prev => prev.map(c => c.id === activeCamp.id ? { ...c, leadIds: [...(c.leadIds ?? []), ...enrollIds] } : c));
              // Push to Instantly
              if (activeCamp.instantlyCampaignId) {
                fetch('/api/instantly/leads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    campaignId: activeCamp.instantlyCampaignId,
                    leads: toEnroll.map(l => ({ email: l.email, first_name: l.name.split(' ')[0], last_name: l.name.split(' ').slice(1).join(' '), company_name: l.company })),
                  }),
                }).catch(e => console.warn('Instantly enroll failed:', e));
              }
              setNotifs(prev => [{ id: `auto-enroll-${Date.now()}`, type: 'success', read: false, text: `Auto-imported ${fresh.length} leads, enrolled ${toEnroll.length} into ${activeCamp.name}`, ts: new Date().toISOString() }, ...prev]);
            } else {
              setNotifs(prev => [{ id: `auto-import-${Date.now()}`, type: 'info', read: false, text: `⚡ Auto-imported ${fresh.length} leads (none above score threshold ${threshold})`, ts: new Date().toISOString() }, ...prev]);
            }
          } else {
            setNotifs(prev => [{ id: `auto-import-${Date.now()}`, type: 'info', read: false, text: `⚡ Auto-imported ${fresh.length} leads (no active campaign for enrollment)`, ts: new Date().toISOString() }, ...prev]);
          }

          // Claim the run
          fetch(`/api/apify/auto-results/${run.runId}/claim`, { method: 'POST' }).catch(e => console.warn('Claim failed:', e));
        }
      } catch (e) { console.warn('Auto-import pipeline error:', e); }
    };
    const id = setInterval(poll, 60_000);
    return () => clearInterval(id);
  }, [serverOnline]);

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
      // Execute auto-actions if autopilot auto-execute is enabled
      if (pipelineConfig.autopilotAutoExecute && data.autoActions?.length) {
        for (const action of data.autoActions) {
          try {
            if (action.type === 'enroll_leads' && action.leadId) {
              const lead = leads.find(l => l.id === action.leadId);
              const camp = campaigns.find(c => c.id === action.campaignId || c.status === 'active');
              if (lead && camp && !lead.campaignId) {
                setLeads(p => p.map(l => l.id === lead.id ? { ...l, campaignId: camp.id, sequenceStep: 1 } : l));
                setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, leadIds: [...(c.leadIds ?? []), lead.id] } : c));
                setNotifs(p => [{ id: `ap-enroll-${Date.now()}`, read: false, time: 'Just now', text: `🤖 Auto-enrolled ${lead.name} into ${camp.name}` }, ...p]);
              }
            }
          } catch { /* non-critical */ }
        }
      }
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
    const lastBriefingRef2 = { current: lastBriefing };
    const check = () => {
      const now = new Date();
      if (now.getHours() !== 7) return;
      const b = lastBriefingRef2.current;
      if (b?.ranAt && new Date(b.ranAt).toDateString() === now.toDateString()) return;
      runAutopilotRef.current();
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [lastBriefing]);

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
    const weeklyReportRef2 = { current: weeklyReport };
    const check = () => {
      const now = new Date();
      if (now.getDay() !== 1 || now.getHours() !== 8) return;
      const r = weeklyReportRef2.current;
      if (r?.ranAt && new Date(r.ranAt).toDateString() === now.toDateString()) return;
      runWeeklyReportRef.current();
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [weeklyReport]);

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

  // ── Meeting booking helper ──────────────────────────────
  async function bookMeeting(lead, startTime, durationMin = 30) {
    const r = await fetch('/api/booking/auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leadName: lead.name,
        leadEmail: lead.email,
        company: lead.company,
        startTime,
        durationMin,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? 'Booking failed');
    // Update the lead with booking details
    setLeads(p => p.map(l => l.id === lead.id ? {
      ...l,
      status: 'prospect',
      replyStatus: 'booked',
      bookedMeeting: {
        meetingId: data.calendarEventId ?? null,
        zoomJoinUrl: data.zoomJoinUrl,
        calendarEventId: data.calendarEventId,
        calendarLink: data.calendarLink,
        scheduledAt: startTime,
        durationMin,
      },
    } : l));
    // Update campaign stats
    const camp = campaigns.find(c => c.leadIds?.includes(lead.id));
    if (camp) {
      setCampaigns(p => p.map(c => c.id === camp.id ? { ...c, stats: { ...c.stats, booked: (c.stats.booked ?? 0) + 1 } } : c));
    }
    // Add notification
    setNotifs(p => [{
      id: `n-${Date.now()}`, type: 'success', read: false,
      text: `📅 Call booked with ${lead.name} (${lead.company}) — ${new Date(startTime).toLocaleString()}`,
      ts: new Date().toISOString(),
    }, ...p]);

    // Auto-create CRM contact + company + deal
    const emailDomain = lead.email?.split('@')[1] ?? '';
    // Find or create company
    let companyId = null;
    setCrmCompanies(prev => {
      const existing = prev.find(c => c.name?.toLowerCase() === lead.company?.toLowerCase() || (emailDomain && c.domain === emailDomain));
      if (existing) { companyId = existing.id; return prev; }
      companyId = `co-${crypto.randomUUID()}`;
      return [...prev, {
        id: companyId, name: lead.company ?? 'Unknown', domain: emailDomain,
        industry: lead.industry ?? '', employees: lead.employees ?? '', location: lead.location ?? '',
        website: emailDomain ? `https://${emailDomain}` : '', mrr: 0, status: 'prospect',
        health: lead.leadScore ?? 50, since: new Date().toISOString().slice(0, 10),
        notes: `Auto-created from outbound campaign`, logo: null, color: '#7C6AFF',
      }];
    });
    // Find or create contact
    let contactId = null;
    setCrmContacts(prev => {
      const existing = prev.find(c => c.email === lead.email);
      if (existing) { contactId = existing.id; return prev; }
      contactId = `ct-${crypto.randomUUID()}`;
      return [...prev, {
        id: contactId, name: lead.name, email: lead.email, phone: '', title: lead.title ?? '',
        companyId, tags: ['outbound'], source: 'campaign', avatar: null,
        interactions: [{ date: new Date().toISOString(), type: 'meeting', note: `Discovery call booked for ${new Date(startTime).toLocaleDateString()}` }],
        notes: lead.notes ?? '',
      }];
    });
    // Create deal
    const dealId = `deal-${crypto.randomUUID()}`;
    const campForDeal = campaigns.find(c => c.leadIds?.includes(lead.id));
    setCrmDeals(prev => [...prev, {
      id: dealId, title: `${lead.company ?? lead.name} — Discovery`,
      value: 0, stage: 'qualified',
      contactId, companyId,
      createdAt: new Date().toISOString(), lastActivity: new Date().toISOString(),
      expectedClose: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      lostReason: null, notes: '', tags: ['outbound', 'auto-created'],
      pipeline: 'default',
      sourceLeadId: lead.id, sourceCampaignId: campForDeal?.id ?? null,
    }]);
    setNotifs(p => [{
      id: `n-${Date.now() + 1}`, type: 'info', read: false,
      text: `🤝 Deal auto-created: ${lead.company ?? lead.name} — Discovery`,
      ts: new Date().toISOString(),
    }, ...p]);

    return data;
  }

  // ── Cal.com booking link helper ────────────────────────
  async function sendBookingLink(lead, eventTypeId) {
    const etId = eventTypeId ?? pipelineConfig.calEventTypeId;
    if (!etId) throw new Error('No Cal.com event type selected');
    const r = await fetch('/api/cal/booking-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventTypeId: etId, leadName: lead.name, leadEmail: lead.email }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? 'Failed to generate link');
    setLeads(p => p.map(l => l.id === lead.id ? {
      ...l, status: 'prospect', replyStatus: 'booking-link-sent', calBookingUrl: data.bookingUrl,
    } : l));
    setNotifs(p => [{ id: `cal-${Date.now()}`, type: 'success', read: false, text: `📅 Booking link ready for ${lead.name}: ${data.bookingUrl}`, ts: new Date().toISOString() }, ...p]);
    return data;
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
      setReplyQueue([]); setPipelineConfig({ autoEnrollThreshold: 65, autoBookEnabled: false, autopilotAutoExecute: false }); setScrapeSchedules([]);
      healthTasksCreatedRef.current.clear();
      // Reset UI state
      setTab('dashboard'); setModal(null); setShowNotif(false); setShowCmd(false);
    }
  }

  // ── Derived values (memoized) ────────────────────────────
  const unread    = notifs.filter(n => !n.read).length;
  const allTasks  = useMemo(() => Object.values(columns).flatMap(c => c.items), [columns]);
  const actAgents = useMemo(() => agents.filter(a => a.status === 'active'), [agents]);
  const mrr       = useMemo(() => clients.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0), [clients]);

  // Bundle shared props (memoized — prevents cascading re-renders)
  const shared = useMemo(() => ({
    agents, setAgents, columns, setColumns, workflows, setWorkflows,
    clients, setClients, pages, setPages, notifs, setNotifs,
    leads, setLeads, campaigns, setCampaigns, apifyRuns, setApifyRuns,
    crmContacts, setCrmContacts, crmCompanies, setCrmCompanies,
    crmDeals, setCrmDeals, emailTemplates, setEmailTemplates,
    allTasks, actAgents, mrr,
    timer, startTimer, fmtTimer,
    toggleAgent, moveTask, addTask, toggleSub, deleteTask,
    aiMsgs, setAiMsgs,
    settings,
    profile,
    schedule, setSchedule,
    setTab, setModal,
    lastBriefing, autopilotRunning, runAutopilot,
    weeklyReport, weeklyRunning, runWeeklyReport,
    replyQueue, setReplyQueue,
    pipelineConfig, setPipelineConfig,
    scrapeSchedules, setScrapeSchedules,
    bookMeeting,
    sendBookingLink,
    openConfirm,
  }), [
    agents, columns, workflows, clients, pages, notifs, leads, campaigns,
    apifyRuns, crmContacts, crmCompanies, crmDeals, emailTemplates,
    allTasks, actAgents, mrr, timer, aiMsgs, settings, profile,
    lastBriefing, autopilotRunning, weeklyReport, weeklyRunning,
    replyQueue, pipelineConfig, scrapeSchedules, schedule,
  ]);

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
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="app-body">
        <Breadcrumb tab={tab} setTab={setTab} />

        {showNotif && (
          <Notifications
            notifs={notifs}
            setNotifs={setNotifs}
            setTab={setTab}
            onClose={() => setShowNotif(false)}
          />
        )}
        {showCmd   && <CommandPalette setTab={setTab} setShowCmd={setShowCmd} setModal={setModal} runAutopilot={runAutopilot} settings={settings} setSettings={setSettings} />}
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
              {tab === 'dashboard' && <Dashboard  {...shared} clock={clock} schedule={schedule} notifs={notifs} />}
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
              {tab === 'campaigns' && <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} leads={leads} setLeads={setLeads} agents={agents} bookMeeting={bookMeeting} sendBookingLink={sendBookingLink} pipelineConfig={pipelineConfig} />}
              {tab === 'deals'     && <DealPipeline deals={crmDeals} setDeals={setCrmDeals} contacts={crmContacts} companies={crmCompanies} />}
              {tab === 'contacts'  && <ContactsCompanies contacts={crmContacts} setContacts={setCrmContacts} companies={crmCompanies} setCompanies={setCrmCompanies} deals={crmDeals} />}
              {tab === 'templates' && <EmailTemplates emailTemplates={emailTemplates} setEmailTemplates={setEmailTemplates} profile={profile} />}
              {tab === 'crm-reports' && <CRMReports deals={crmDeals} contacts={crmContacts} companies={crmCompanies} />}
              {tab === 'wiki'      && <Wiki />}
              {tab === 'updates'   && <Updates />}
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Global branded confirm dialog */}
        {confirmState && (
          <ConfirmModal
            {...confirmState}
            onClose={() => setConfirmState(null)}
          />
        )}

        <StatusBar
          actAgents={actAgents}
          serverOnline={serverOnline}
          timer={timer}
          fmtTimer={fmtTimer}
          clock={clock}
          setShowCmd={setShowCmd}
        />
      </div>
    </div>
  );
}
