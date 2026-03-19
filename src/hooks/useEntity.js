import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = 'http://localhost:3001';

/**
 * Server-backed entity hook. Replaces usePersistedState for all entities.
 * Provides optimistic updates with error rollback.
 *
 * @param {string} endpoint - API path (e.g. '/api/agents')
 * @param {*} fallback - Default value while loading ([] for lists, {} for objects)
 * @returns {{ data, loading, error, create, update, remove, refresh, setData }}
 */
export function useEntity(endpoint, fallback = []) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (mountedRef.current) {
        setData(json);
        setError(null);
        setLoading(false);
      }
      return json;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        setLoading(false);
      }
      return null;
    }
  }, [endpoint]);

  // Fetch on mount
  useEffect(() => { refresh(); }, [refresh]);

  const create = useCallback(async (item) => {
    const prev = data;
    // Optimistic: add to local state immediately
    if (Array.isArray(data)) {
      setData(d => [item, ...d]);
    }
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      // Replace optimistic item with server response
      if (mountedRef.current && Array.isArray(data)) {
        setData(d => d.map(x => x.id === item.id ? created : x));
      }
      return created;
    } catch (err) {
      if (mountedRef.current) setData(prev); // Rollback
      throw err;
    }
  }, [data, endpoint]);

  const update = useCallback(async (id, changes) => {
    const prev = data;
    // Optimistic update
    if (Array.isArray(data)) {
      setData(d => d.map(x => x.id === id ? { ...x, ...changes } : x));
    }
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      if (mountedRef.current && Array.isArray(data)) {
        setData(d => d.map(x => x.id === id ? updated : x));
      }
      return updated;
    } catch (err) {
      if (mountedRef.current) setData(prev);
      throw err;
    }
  }, [data, endpoint]);

  const remove = useCallback(async (id) => {
    const prev = data;
    if (Array.isArray(data)) {
      setData(d => d.filter(x => x.id !== id));
    }
    try {
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (mountedRef.current) setData(prev);
      throw err;
    }
  }, [data, endpoint]);

  return { data, loading, error, create, update, remove, refresh, setData };
}

/**
 * Server-backed settings hook.
 * Settings are stored as key-value pairs in SQLite.
 */
export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pipelineConfig, setPipelineConfig] = useState(null);
  const [setupDone, setSetupDone] = useState(false);
  const [lastBriefing, setLastBriefing] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [scrapeSchedules, setScrapeSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setSettings(data.settings);
        setProfile(data.profile);
        setPipelineConfig(data.pipelineConfig);
        setSetupDone(data.setupDone);
        setLastBriefing(data.lastBriefing);
        setWeeklyReport(data.weeklyReport);
        setScrapeSchedules(data.scrapeSchedules || []);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Persist a setting to the server
  const saveSetting = useCallback(async (key, value) => {
    try {
      await fetch(`${API_BASE}/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
    } catch { /* non-critical: server may be down */ }
  }, []);

  // Wrapper setters that also persist
  const updateSettings = useCallback((updaterOrValue) => {
    setSettings(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      saveSetting('settings', next);
      return next;
    });
  }, [saveSetting]);

  const updateProfile = useCallback((updaterOrValue) => {
    setProfile(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      saveSetting('profile', next);
      return next;
    });
  }, [saveSetting]);

  const updatePipelineConfig = useCallback((updaterOrValue) => {
    setPipelineConfig(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      saveSetting('pipelineConfig', next);
      return next;
    });
  }, [saveSetting]);

  const updateSetupDone = useCallback((val) => {
    setSetupDone(val);
    saveSetting('setupDone', val);
  }, [saveSetting]);

  const updateLastBriefing = useCallback((val) => {
    setLastBriefing(val);
    saveSetting('lastBriefing', val);
  }, [saveSetting]);

  const updateWeeklyReport = useCallback((val) => {
    setWeeklyReport(val);
    saveSetting('weeklyReport', val);
  }, [saveSetting]);

  const updateScrapeSchedules = useCallback((updaterOrValue) => {
    setScrapeSchedules(prev => {
      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
      saveSetting('scrapeSchedules', next);
      return next;
    });
  }, [saveSetting]);

  return {
    settings, setSettings: updateSettings,
    profile, setProfile: updateProfile,
    pipelineConfig, setPipelineConfig: updatePipelineConfig,
    setupDone, setSetupDone: updateSetupDone,
    lastBriefing, setLastBriefing: updateLastBriefing,
    weeklyReport, setWeeklyReport: updateWeeklyReport,
    scrapeSchedules, setScrapeSchedules: updateScrapeSchedules,
    loading, refresh,
  };
}

/**
 * Server-backed tasks hook (special: column-based structure).
 */
export function useTasks() {
  const [columns, setColumns] = useState({
    backlog:    { title: 'BACKLOG',     color: '#6B6B7B', items: [] },
    inProgress: { title: 'IN PROGRESS', color: '#5A50C2', items: [] },
    review:     { title: 'REVIEW',      color: '#9389D6', items: [] },
    done:       { title: 'DONE',        color: '#7B6FE8', items: [] },
  });
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setColumns(data);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addTask = useCallback(async (task) => {
    const col = task.col || 'backlog';
    const newTask = { ...task, id: task.id || `t-${Date.now()}`, col };
    // Optimistic
    setColumns(prev => ({
      ...prev,
      [col]: { ...prev[col], items: [...prev[col].items, newTask] },
    }));
    try {
      await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
    } catch { refresh(); } // Rollback by re-fetching
  }, [refresh]);

  const moveTask = useCallback(async (taskId, toCol, toPosition = 0) => {
    // Optimistic: move locally
    setColumns(prev => {
      const next = { ...prev };
      let task = null;
      for (const key of Object.keys(next)) {
        const idx = next[key].items.findIndex(t => t.id === taskId);
        if (idx >= 0) {
          task = next[key].items[idx];
          next[key] = { ...next[key], items: next[key].items.filter((_, i) => i !== idx) };
          break;
        }
      }
      if (task) {
        task = { ...task, col: toCol };
        const items = [...next[toCol].items];
        items.splice(toPosition, 0, task);
        next[toCol] = { ...next[toCol], items };
      }
      return next;
    });
    try {
      await fetch(`${API_BASE}/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ col: toCol, position: toPosition }),
      });
    } catch { refresh(); }
  }, [refresh]);

  const updateTask = useCallback(async (taskId, changes) => {
    setColumns(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = {
          ...next[key],
          items: next[key].items.map(t => t.id === taskId ? { ...t, ...changes } : t),
        };
      }
      return next;
    });
    try {
      await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
    } catch { refresh(); }
  }, [refresh]);

  const deleteTask = useCallback(async (taskId) => {
    setColumns(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = { ...next[key], items: next[key].items.filter(t => t.id !== taskId) };
      }
      return next;
    });
    try {
      await fetch(`${API_BASE}/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch { refresh(); }
  }, [refresh]);

  const reorder = useCallback(async (col, orderedIds) => {
    try {
      await fetch(`${API_BASE}/api/tasks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ col, orderedIds }),
      });
    } catch { refresh(); }
  }, [refresh]);

  return { columns, setColumns, loading, refresh, addTask, moveTask, updateTask, deleteTask, reorder };
}

/**
 * Server-backed AI messages hook.
 */
export function useAiMessages() {
  const [messages, setMessages] = useState([
    { role: 'system', text: 'Agency AI online — full context loaded. Ask me anything about your tasks, agents, clients, or workflows.' },
  ]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai-messages`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setMessages(data.length > 0 ? data : [{ role: 'system', text: 'Agency AI online — full context loaded.' }]);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addMessage = useCallback(async (role, text) => {
    const msg = { role, text };
    setMessages(prev => [...prev, msg]);
    try {
      await fetch(`${API_BASE}/api/ai-messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, text }),
      });
    } catch { /* non-critical */ }
  }, []);

  const clear = useCallback(async () => {
    setMessages([{ role: 'system', text: 'Conversation cleared.' }]);
    try {
      await fetch(`${API_BASE}/api/ai-messages`, { method: 'DELETE' });
    } catch { /* non-critical */ }
  }, []);

  return { messages, setMessages, loading, addMessage, clear, refresh };
}
