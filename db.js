/**
 * Agency OS — SQLite Database Layer
 * Single-file persistence using better-sqlite3 with WAL mode.
 * All entity CRUD lives here; server.js imports and calls these functions.
 */

import Database from 'better-sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'agency.db');

const db = new Database(DB_PATH);

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'idle',
    tasks INTEGER DEFAULT 0,
    efficiency INTEGER DEFAULT 80,
    icon TEXT DEFAULT '🤖',
    schedule TEXT DEFAULT '',
    lastRun TEXT DEFAULT '',
    queue TEXT DEFAULT '[]',
    logs TEXT DEFAULT '[]',
    automations INTEGER DEFAULT 0,
    weeklyData TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    agent TEXT DEFAULT '',
    due TEXT DEFAULT '',
    col TEXT DEFAULT 'backlog',
    position INTEGER DEFAULT 0,
    tags TEXT DEFAULT '[]',
    subtasks TEXT DEFAULT '[]',
    notes TEXT DEFAULT '',
    time INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    clientType TEXT DEFAULT 'brand',
    status TEXT DEFAULT 'active',
    mrr INTEGER DEFAULT 0,
    health INTEGER DEFAULT 100,
    contact TEXT DEFAULT '',
    email TEXT DEFAULT '',
    since TEXT DEFAULT '',
    services TEXT DEFAULT '[]',
    nextMeeting TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    color TEXT DEFAULT '#7B6FE8',
    outreachStage TEXT,
    creator TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    title TEXT DEFAULT '',
    email TEXT DEFAULT '',
    linkedIn TEXT DEFAULT '',
    status TEXT DEFAULT 'lead',
    source TEXT DEFAULT '',
    leadScore INTEGER DEFAULT 0,
    industry TEXT DEFAULT '',
    employees TEXT DEFAULT '',
    location TEXT DEFAULT '',
    campaignId TEXT,
    sequenceStep INTEGER DEFAULT 0,
    replyStatus TEXT DEFAULT 'none',
    replySnippet TEXT DEFAULT '',
    replyClassification TEXT,
    replyReceivedAt TEXT,
    notes TEXT DEFAULT '',
    since TEXT DEFAULT '',
    color TEXT DEFAULT '#7B6FE8',
    bookedMeeting TEXT,
    calBookingUrl TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    createdAt TEXT DEFAULT '',
    leadIds TEXT DEFAULT '[]',
    instantlyCampaignId TEXT,
    brief TEXT DEFAULT '{}',
    sequence TEXT DEFAULT '[]',
    stats TEXT DEFAULT '{"sent":0,"opened":0,"replied":0,"booked":0,"openRate":0,"replyRate":0}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    isTemplate INTEGER DEFAULT 0,
    steps TEXT DEFAULT '[]',
    trigger_desc TEXT DEFAULT '',
    lastRun TEXT DEFAULT '',
    runs INTEGER DEFAULT 0,
    successRate INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS crm_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    title TEXT DEFAULT '',
    companyId TEXT DEFAULT '',
    ownerId TEXT,
    tags TEXT DEFAULT '[]',
    source TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    interactions TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS crm_companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT DEFAULT '',
    industry TEXT DEFAULT '',
    employees TEXT DEFAULT '',
    location TEXT DEFAULT '',
    website TEXT DEFAULT '',
    mrr INTEGER DEFAULT 0,
    status TEXT DEFAULT 'prospect',
    health INTEGER DEFAULT 0,
    since TEXT,
    color TEXT DEFAULT '#7B6FE8',
    notes TEXT DEFAULT '',
    logo TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS crm_deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    value INTEGER DEFAULT 0,
    stage TEXT DEFAULT 'qualified',
    contactId TEXT DEFAULT '',
    companyId TEXT DEFAULT '',
    createdAt TEXT DEFAULT '',
    lastActivity TEXT DEFAULT '',
    expectedClose TEXT DEFAULT '',
    lostReason TEXT,
    notes TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    pipeline TEXT DEFAULT 'default',
    sourceLeadId TEXT,
    sourceCampaignId TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT DEFAULT '',
    body TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    usageCount INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS schedule (
    id TEXT PRIMARY KEY,
    time TEXT DEFAULT '',
    _sort INTEGER DEFAULT 0,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'task',
    dur INTEGER DEFAULT 30,
    cl TEXT DEFAULT '#7B6FE8',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT DEFAULT '📄',
    updated TEXT DEFAULT '',
    type TEXT DEFAULT 'doc',
    starred INTEGER DEFAULT 0,
    content TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read INTEGER DEFAULT 0,
    ts TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    payload TEXT NOT NULL,
    processed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── JSON field helpers ────────────────────────────────────────

const JSON_FIELDS = {
  agents:          ['queue', 'logs', 'weeklyData'],
  tasks:           ['tags', 'subtasks'],
  clients:         ['services', 'creator'],
  leads:           ['replyClassification', 'bookedMeeting'],
  campaigns:       ['leadIds', 'brief', 'sequence', 'stats'],
  workflows:       ['steps'],
  crm_contacts:    ['tags', 'interactions'],
  crm_companies:   [],
  crm_deals:       ['tags'],
  email_templates: ['tags'],
  schedule:        [],
  pages:           [],
  notifications:   [],
};

function parseJsonFields(table, row) {
  if (!row) return row;
  const fields = JSON_FIELDS[table] || [];
  const parsed = { ...row };
  for (const f of fields) {
    if (parsed[f] && typeof parsed[f] === 'string') {
      try { parsed[f] = JSON.parse(parsed[f]); } catch { /* keep string */ }
    }
  }
  // Convert integer booleans back
  if ('read' in parsed) parsed.read = !!parsed.read;
  if ('starred' in parsed) parsed.starred = !!parsed.starred;
  if ('isTemplate' in parsed) parsed.isTemplate = !!parsed.isTemplate;
  return parsed;
}

function stringifyJsonFields(table, data) {
  const fields = JSON_FIELDS[table] || [];
  const out = { ...data };
  for (const f of fields) {
    if (out[f] !== undefined && typeof out[f] !== 'string') {
      out[f] = JSON.stringify(out[f]);
    }
  }
  // Convert booleans to integers for SQLite
  if ('read' in out) out.read = out.read ? 1 : 0;
  if ('starred' in out) out.starred = out.starred ? 1 : 0;
  if ('isTemplate' in out) out.isTemplate = out.isTemplate ? 1 : 0;
  return out;
}

// ── Generic CRUD ──────────────────────────────────────────────

function getAll(table) {
  const rows = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
  return rows.map(r => parseJsonFields(table, r));
}

function getById(table, id) {
  const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
  return parseJsonFields(table, row);
}

function insert(table, data) {
  const prepared = stringifyJsonFields(table, data);
  const keys = Object.keys(prepared);
  const placeholders = keys.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
  stmt.run(...keys.map(k => prepared[k] ?? null));
  return getById(table, data.id);
}

function update(table, id, changes) {
  const prepared = stringifyJsonFields(table, changes);
  prepared.updated_at = new Date().toISOString();
  const keys = Object.keys(prepared);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...keys.map(k => prepared[k] ?? null), id);
  return getById(table, id);
}

function remove(table, id) {
  db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return { ok: true, id };
}

// ── Tasks (special: ordered within columns) ───────────────────

function getTasksByColumn() {
  const rows = db.prepare(`SELECT * FROM tasks ORDER BY col, position ASC`).all();
  const cols = {
    backlog:    { title: 'BACKLOG',      color: '#6B6B7B', items: [] },
    inProgress: { title: 'IN PROGRESS',  color: '#5A50C2', items: [] },
    review:     { title: 'REVIEW',       color: '#9389D6', items: [] },
    done:       { title: 'DONE',         color: '#7B6FE8', items: [] },
  };
  for (const row of rows) {
    const task = parseJsonFields('tasks', row);
    const col = cols[task.col];
    if (col) col.items.push(task);
  }
  return cols;
}

function moveTask(taskId, toCol, toPosition) {
  const task = getById('tasks', taskId);
  if (!task) return null;

  // Shift positions in target column
  db.prepare(`UPDATE tasks SET position = position + 1 WHERE col = ? AND position >= ?`).run(toCol, toPosition);

  // Move the task
  db.prepare(`UPDATE tasks SET col = ?, position = ?, updated_at = datetime('now') WHERE id = ?`).run(toCol, toPosition, taskId);

  return getTasksByColumn();
}

function reorderTasks(col, orderedIds) {
  const updatePos = db.prepare(`UPDATE tasks SET position = ?, updated_at = datetime('now') WHERE id = ?`);
  const batch = db.transaction(() => {
    orderedIds.forEach((id, i) => updatePos.run(i, id));
  });
  batch();
  return getTasksByColumn();
}

// ── Settings (key-value) ──────────────────────────────────────

function getSetting(key) {
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key);
  if (!row) return null;
  try { return JSON.parse(row.value); } catch { return row.value; }
}

function setSetting(key, value) {
  const json = JSON.stringify(value);
  db.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))`).run(key, json);
  return value;
}

function getAllSettings() {
  const rows = db.prepare(`SELECT * FROM settings`).all();
  const result = {};
  for (const row of rows) {
    try { result[row.key] = JSON.parse(row.value); } catch { result[row.key] = row.value; }
  }
  return result;
}

// ── AI Messages ───────────────────────────────────────────────

function getAiMessages() {
  return db.prepare(`SELECT * FROM ai_messages ORDER BY id ASC`).all();
}

function addAiMessage(role, text) {
  const info = db.prepare(`INSERT INTO ai_messages (role, text) VALUES (?, ?)`).run(role, text);
  return { id: info.lastInsertRowid, role, text };
}

function clearAiMessages() {
  db.prepare(`DELETE FROM ai_messages`).run();
  return addAiMessage('system', 'Agency AI online — full context loaded. Ask me anything about your tasks, agents, clients, or workflows.');
}

// ── Webhook Events (replaces in-memory arrays) ───────────────

function addWebhookEvent(source, payload) {
  const id = `wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare(`INSERT INTO webhook_events (id, source, payload) VALUES (?, ?, ?)`).run(id, source, JSON.stringify(payload));
  return { id, source, payload };
}

function getUnprocessedWebhooks(source) {
  const rows = db.prepare(`SELECT * FROM webhook_events WHERE source = ? AND processed = 0 ORDER BY created_at ASC`).all();
  return rows.map(r => ({ ...r, payload: JSON.parse(r.payload) }));
}

function markWebhookProcessed(id) {
  db.prepare(`UPDATE webhook_events SET processed = 1 WHERE id = ?`).run(id);
}

// ── Dashboard Stats ───────────────────────────────────────────

function getDashboardStats() {
  const mrr = db.prepare(`SELECT COALESCE(SUM(mrr), 0) as total FROM clients WHERE status = 'active'`).get().total;
  const activeAgents = db.prepare(`SELECT COUNT(*) as count FROM agents WHERE status = 'active'`).get().count;
  const tasksDueToday = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE due = 'Today'`).get().count;
  const totalTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks`).get().count;
  const doneTasks = db.prepare(`SELECT COUNT(*) as count FROM tasks WHERE col = 'done'`).get().count;
  const hotLeads = db.prepare(`SELECT * FROM leads WHERE leadScore >= 80 ORDER BY leadScore DESC`).all().map(r => parseJsonFields('leads', r));
  const atRiskClients = db.prepare(`SELECT * FROM clients WHERE health < 75 AND status = 'active'`).all().map(r => parseJsonFields('clients', r));

  return { mrr, activeAgents, tasksDueToday, totalTasks, doneTasks, hotLeads, atRiskClients };
}

// ── Backup & Export ───────────────────────────────────────────

function backup() {
  const backupDir = join(__dirname, 'backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dest = join(backupDir, `agency-${ts}.db`);
  db.backup(dest);
  return dest;
}

function exportAll() {
  const tables = ['agents', 'tasks', 'clients', 'leads', 'campaigns', 'workflows',
    'crm_contacts', 'crm_companies', 'crm_deals', 'email_templates', 'schedule',
    'pages', 'notifications', 'settings', 'ai_messages'];
  const data = {};
  for (const t of tables) {
    if (t === 'settings') {
      data[t] = getAllSettings();
    } else {
      data[t] = getAll(t);
    }
  }
  data._exportedAt = new Date().toISOString();
  data._version = '2.0.0';
  return data;
}

function importAll(data) {
  const tables = ['agents', 'tasks', 'clients', 'leads', 'campaigns', 'workflows',
    'crm_contacts', 'crm_companies', 'crm_deals', 'email_templates', 'schedule',
    'pages', 'notifications', 'ai_messages'];

  const tx = db.transaction(() => {
    // Clear all tables
    for (const t of tables) db.prepare(`DELETE FROM ${t}`).run();
    db.prepare(`DELETE FROM settings`).run();

    // Re-insert
    for (const t of tables) {
      if (!data[t] || !Array.isArray(data[t])) continue;
      for (const row of data[t]) {
        insert(t, row);
      }
    }
    // Settings is key-value
    if (data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
      for (const [k, v] of Object.entries(data.settings)) {
        setSetting(k, v);
      }
    }
  });
  tx();
  return { ok: true, tables: tables.length };
}

// ── Seeding ───────────────────────────────────────────────────

function needsSeed() {
  const count = db.prepare(`SELECT COUNT(*) as c FROM agents`).get().c;
  return count === 0;
}

function seed(seedData) {
  const tx = db.transaction(() => {
    // Agents
    for (const a of seedData.agents) {
      insert('agents', { ...a, id: String(a.id) });
    }

    // Tasks (from columns structure)
    const colNames = ['backlog', 'inProgress', 'review', 'done'];
    for (const colName of colNames) {
      const col = seedData.columns[colName];
      if (!col) continue;
      col.items.forEach((task, i) => {
        insert('tasks', { ...task, col: colName, position: i });
      });
    }

    // Simple array entities
    const simpleEntities = [
      ['clients', seedData.clients],
      ['leads', seedData.leads],
      ['campaigns', seedData.campaigns],
      ['workflows', seedData.workflows],
      ['crm_contacts', seedData.contacts],
      ['crm_companies', seedData.companies],
      ['crm_deals', seedData.deals],
      ['email_templates', seedData.emailTemplates],
      ['schedule', seedData.schedule],
      ['pages', seedData.pages],
    ];

    for (const [table, rows] of simpleEntities) {
      if (!rows) continue;
      for (const row of rows) {
        // Map 'trigger' to 'trigger_desc' for workflows (trigger is reserved in SQL)
        if (table === 'workflows') {
          const { trigger: trig, ...rest } = row;
          insert(table, { ...rest, trigger_desc: trig });
        } else {
          insert(table, row);
        }
      }
    }

    // Notifications
    for (const n of seedData.notifications) {
      insert('notifications', { ...n, id: String(n.id), ts: new Date().toISOString() });
    }

    // Default AI message
    addAiMessage('system', 'Agency AI online — full context loaded. Ask me anything about your tasks, agents, clients, or workflows.');

    // Default settings
    setSetting('settings', seedData.defaultSettings);
    setSetting('profile', seedData.defaultProfile);
    setSetting('pipelineConfig', { autoEnrollThreshold: 65, autoBookEnabled: false, autopilotAutoExecute: false });
    setSetting('scrapeSchedules', []);
    setSetting('setupDone', false);
    setSetting('lastBriefing', null);
    setSetting('weeklyReport', null);
  });
  tx();
}

// ── Close handler ─────────────────────────────────────────────
process.on('exit', () => db.close());

export default {
  // Generic CRUD
  getAll,
  getById,
  insert,
  update,
  remove,

  // Tasks
  getTasksByColumn,
  moveTask,
  reorderTasks,

  // Settings
  getSetting,
  setSetting,
  getAllSettings,

  // AI Messages
  getAiMessages,
  addAiMessage,
  clearAiMessages,

  // Webhooks
  addWebhookEvent,
  getUnprocessedWebhooks,
  markWebhookProcessed,

  // Dashboard
  getDashboardStats,

  // Backup & Export
  backup,
  exportAll,
  importAll,

  // Seeding
  needsSeed,
  seed,

  // Raw access (for custom queries)
  raw: db,
};
