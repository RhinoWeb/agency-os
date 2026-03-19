import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:3001';

/**
 * Drop-in replacement for usePersistedState that syncs to the server API.
 * Returns [state, setState] — identical signature to usePersistedState.
 *
 * @param {string} endpoint - Server API path (e.g. '/api/agents')
 * @param {*} defaultValue - Fallback while loading
 * @param {object} opts - Options
 * @param {string} opts.type - 'list' (GET returns array), 'object' (GET returns object), 'setting' (key-value via /api/settings/:key)
 * @param {string} opts.settingKey - For type='setting', the key name
 * @param {number} opts.debounceMs - Debounce delay for syncing (default 500)
 */
export function useServerState(endpoint, defaultValue, opts = {}) {
  const { type = 'list', settingKey, debounceMs = 500 } = opts;
  const [state, setState] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const prevStateRef = useRef(null);
  const syncTimerRef = useRef(null);
  const initialLoadRef = useRef(false);

  // Load from server on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let url, data;

        if (type === 'setting') {
          // Settings are fetched via the bulk settings endpoint
          const res = await fetch(`${API_BASE}/api/settings`);
          if (!res.ok) return;
          const all = await res.json();
          data = all[settingKey] ?? defaultValue;
        } else {
          const res = await fetch(`${API_BASE}${endpoint}`);
          if (!res.ok) return;
          data = await res.json();
        }

        if (!cancelled) {
          setState(data);
          prevStateRef.current = JSON.stringify(data);
          initialLoadRef.current = true;
          setLoaded(true);
        }
      } catch {
        // Server not available — use default value
        if (!cancelled) {
          initialLoadRef.current = true;
          setLoaded(true);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync state changes back to server (debounced)
  useEffect(() => {
    if (!initialLoadRef.current) return; // Don't sync before initial load

    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const currentJson = JSON.stringify(state);
      if (currentJson === prevStateRef.current) return; // No change
      prevStateRef.current = currentJson;

      if (type === 'setting') {
        // Save as key-value setting
        fetch(`${API_BASE}/api/settings/${settingKey}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: state }),
        }).catch(() => { /* Server may be down — changes stay in local state */ });
      } else if (type === 'list' && Array.isArray(state)) {
        // For lists, we do a full sync — POST all items (server handles upsert)
        syncList(endpoint, state, prevStateRef);
      } else if (type === 'object') {
        // For objects (like columns/tasks), sync the whole thing
        syncObject(endpoint, state);
      }
    }, debounceMs);

    return () => clearTimeout(syncTimerRef.current);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  return [state, setState];
}

/**
 * Sync a list of entities to the server by diffing against server state.
 * Uses individual POST/PUT/DELETE calls to keep the server in sync.
 */
async function syncList(endpoint, currentItems) {
  try {
    // Fetch current server state
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) return;
    const serverItems = await res.json();
    const serverMap = new Map(serverItems.map(item => [item.id, item]));
    const currentMap = new Map(currentItems.map(item => [item.id, item]));

    // Items to create (in current but not on server)
    for (const item of currentItems) {
      if (!serverMap.has(item.id)) {
        await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
    }

    // Items to update (in both, but changed)
    for (const item of currentItems) {
      const serverItem = serverMap.get(item.id);
      if (serverItem && JSON.stringify(item) !== JSON.stringify(serverItem)) {
        await fetch(`${API_BASE}${endpoint}/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }
    }

    // Items to delete (on server but not in current)
    for (const serverItem of serverItems) {
      if (!currentMap.has(serverItem.id)) {
        await fetch(`${API_BASE}${endpoint}/${serverItem.id}`, { method: 'DELETE' });
      }
    }
  } catch {
    // Sync failed — will retry on next state change
  }
}

/**
 * Sync tasks (column-based object) to the server.
 */
async function syncObject(endpoint, state) {
  if (endpoint === '/api/tasks') {
    // Tasks are special — sync each task individually
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      if (!res.ok) return;
      const serverCols = await res.json();

      // Build flat lists
      const serverTasks = new Map();
      for (const [colKey, col] of Object.entries(serverCols)) {
        for (const task of col.items) {
          serverTasks.set(task.id, { ...task, col: colKey });
        }
      }

      const currentTasks = new Map();
      for (const [colKey, col] of Object.entries(state)) {
        (col.items || []).forEach((task, i) => {
          currentTasks.set(task.id, { ...task, col: colKey, position: i });
        });
      }

      // Create new tasks
      for (const [id, task] of currentTasks) {
        if (!serverTasks.has(id)) {
          await fetch(`${API_BASE}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
          });
        }
      }

      // Update changed tasks (including column moves)
      for (const [id, task] of currentTasks) {
        const serverTask = serverTasks.get(id);
        if (serverTask) {
          const changed = task.col !== serverTask.col ||
            task.title !== serverTask.title ||
            task.priority !== serverTask.priority ||
            task.agent !== serverTask.agent ||
            task.due !== serverTask.due ||
            JSON.stringify(task.subtasks) !== JSON.stringify(serverTask.subtasks) ||
            task.notes !== serverTask.notes ||
            task.time !== serverTask.time;
          if (changed) {
            await fetch(`${API_BASE}/api/tasks/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(task),
            });
          }
        }
      }

      // Delete removed tasks
      for (const [id] of serverTasks) {
        if (!currentTasks.has(id)) {
          await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' });
        }
      }
    } catch {
      // Sync failed — will retry
    }
  }
}
