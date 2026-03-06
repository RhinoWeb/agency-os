import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { createHmac } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  const env = readFileSync(join(__dirname, '.env'), 'utf8');
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch { /* .env not present — rely on real env vars */ }

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json({ limit: '128kb' }));

// ── Provider configs (all OpenAI-compatible except Anthropic) ─
const PROVIDERS = {
  minimax:   { url: 'https://api.minimax.io/v1/chat/completions',        defaultModel: 'MiniMax-Text-01',          format: 'openai'    },
  openai:    { url: 'https://api.openai.com/v1/chat/completions',        defaultModel: 'gpt-4o-mini',              format: 'openai'    },
  groq:      { url: 'https://api.groq.com/openai/v1/chat/completions',   defaultModel: 'llama-3.3-70b-versatile',  format: 'openai'    },
  anthropic: { url: 'https://api.anthropic.com/v1/messages',             defaultModel: 'claude-haiku-4-5-20251001',           format: 'anthropic' },
};

// ── OpenAI-compatible streaming helper ────────────────────────
async function streamOpenAI({ url, apiKey, model, messages, res }) {
  const mmRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, stream: true, max_tokens: 1024 }),
  });

  if (!mmRes.ok) {
    const errText = await mmRes.text();
    res.write(`data: ${JSON.stringify({ error: `API error ${mmRes.status}: ${errText}` })}\n\n`);
    return res.end();
  }

  const reader  = mmRes.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') { res.write('data: [DONE]\n\n'); continue; }
      try {
        const parsed = JSON.parse(data);
        const text   = parsed.choices?.[0]?.delta?.content;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      } catch { /* skip malformed chunk */ }
    }
  }
  res.end();
}

// ── Anthropic streaming helper ────────────────────────────────
async function streamAnthropic({ apiKey, model, systemContext, messages, res }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  const apiMessages = messages
    .filter(m => m.role === 'user' || m.role === 'ai')
    .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

  const stream = await client.messages.stream({
    model, max_tokens: 1024, system: systemContext, messages: apiMessages,
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
    }
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

// ── /api/chat ─────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, systemContext, provider = 'minimax', apiKey: clientKey, model: clientModel } = req.body;

  const cfg    = PROVIDERS[provider] ?? PROVIDERS.minimax;
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`] ?? process.env.MINIMAX_API_KEY;
  const apiKey = clientKey || envKey;

  if (!apiKey) {
    return res.status(503).json({ error: `No API key found for provider "${provider}". Add one in Settings or set ${provider.toUpperCase()}_API_KEY in .env` });
  }

  const model = clientModel || cfg.defaultModel;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    if (cfg.format === 'anthropic') {
      await streamAnthropic({ apiKey, model, systemContext, messages, res });
    } else {
      const apiMessages = [
        { role: 'system', content: systemContext },
        ...messages
          .filter(m => m.role === 'user' || m.role === 'ai')
          .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
      ];
      await streamOpenAI({ url: cfg.url, apiKey, model, messages: apiMessages, res });
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ── /api/test-key — quick connectivity check ─────────────────
app.post('/api/test-key', async (req, res) => {
  const { provider = 'minimax', apiKey } = req.body;
  const cfg = PROVIDERS[provider] ?? PROVIDERS.minimax;

  if (!apiKey) return res.json({ ok: false, error: 'No API key provided' });

  try {
    let testRes;
    if (cfg.format === 'anthropic') {
      testRes = await fetch('https://api.anthropic.com/v1/models', {
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      });
    } else {
      testRes = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: cfg.defaultModel, messages: [{ role:'user', content:'Hi' }], max_tokens: 1 }),
      });
    }
    res.json({ ok: testRes.ok, status: testRes.status });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ── Autopilot context builder ─────────────────────────────────
function buildAutopilotContext({ agents, allTasks, clients, leads, campaigns }) {
  const activeAgents   = (agents   ?? []).filter(a => a.status === 'active');
  const atRiskClients  = (clients  ?? []).filter(c => c.status === 'active' && (c.health < 75));
  const hotLeads       = (leads    ?? []).filter(l => (l.leadScore ?? 0) >= 70 && l.replyStatus !== 'booked');
  const activeCampaigns= (campaigns?? []).filter(c => c.status === 'active');
  const tasks          = (allTasks ?? []).slice(0, 15);

  return [
    `AGENTS (${activeAgents.length} active of ${agents?.length ?? 0}): ${activeAgents.map(a => `${a.name} [${a.queue?.length ?? 0} queued, ${a.efficiency ?? 0}% eff]`).join(', ') || 'none'}`,
    `TASKS (${allTasks?.length ?? 0} total): ${tasks.map(t => `"${t.title}" [${t.priority ?? 'normal'} priority, agent: ${t.agent ?? 'Unassigned'}]`).join('; ') || 'none'}`,
    `CLIENTS (${clients?.filter(c => c.status === 'active').length ?? 0} active): ${(clients ?? []).filter(c => c.status === 'active').map(c => `${c.name} [$${((c.mrr ?? 0) / 1000).toFixed(1)}k MRR, health: ${c.health ?? 0}%]`).join(', ') || 'none'}`,
    `AT-RISK CLIENTS: ${atRiskClients.map(c => c.name).join(', ') || 'none'}`,
    `HOT LEADS (score≥70): ${hotLeads.map(l => `${l.name} @ ${l.company} (score: ${l.leadScore})`).join(', ') || 'none'}`,
    `ACTIVE CAMPAIGNS: ${activeCampaigns.map(c => `${c.name} [${c.leads?.length ?? 0} leads]`).join(', ') || 'none'}`,
  ].join('\n');
}

// ── /api/autopilot/briefing ───────────────────────────────────
app.post('/api/autopilot/briefing', async (req, res) => {
  const { agents, allTasks, clients, leads, campaigns,
          provider = 'minimax', apiKey: clientKey, model: clientModel } = req.body;

  const cfg    = PROVIDERS[provider] ?? PROVIDERS.minimax;
  const envKey = process.env[`${provider.toUpperCase()}_API_KEY`] ?? process.env.MINIMAX_API_KEY;
  const apiKey = clientKey || envKey;

  if (!apiKey) return res.status(503).json({ error: `No API key for provider "${provider}"` });

  const model   = clientModel || cfg.defaultModel;
  const context = buildAutopilotContext({ agents, allTasks, clients, leads, campaigns });

  const SYSTEM = `You are Agency OS Autopilot — an autonomous agency operations agent.
Analyze the agency state below and generate a 7 AM morning briefing.
Return ONLY valid JSON (no markdown, no explanation) with this exact shape:
{
  "briefing": "2-3 sentence morning summary of agency health and priorities",
  "assignments": [{"taskTitle": "exact task title from state", "agent": "agent name", "priority": "high|medium|low"}],
  "flagged": [{"type": "client|lead|task", "name": "name", "reason": "one-sentence reason"}],
  "topActions": ["action 1", "action 2", "action 3"]
}
Keep assignments to the top 3 highest-priority unassigned or backlogged tasks.
Keep flagged to real risks only (at-risk clients, overdue tasks, hot leads going cold).`;

  const USER = `Agency state as of 7:00 AM:\n\n${context}\n\nGenerate the morning briefing JSON.`;

  try {
    let text;
    if (cfg.format === 'anthropic') {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model, max_tokens: 1024, system: SYSTEM,
        messages: [{ role: 'user', content: USER }],
      });
      text = msg.content[0]?.text ?? '';
    } else {
      const r = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: USER }],
          max_tokens: 1024,
        }),
      });
      if (!r.ok) return res.status(502).json({ error: `Upstream API error ${r.status}` });
      const data = await r.json();
      text = data.choices?.[0]?.message?.content ?? '';
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(502).json({ error: 'AI returned no JSON', raw: text.slice(0, 200) });

    const result = JSON.parse(match[0]);
    res.json({ ...result, ranAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Version & update system ───────────────────────────────────
const LOCAL_VERSION = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')).version;
let   cachedLatest  = null;
let   cacheTime     = 0;

async function getLatestRelease() {
  const now = Date.now();
  if (cachedLatest && now - cacheTime < 3600_000) return cachedLatest; // cache 1h
  try {
    const r    = await fetch('https://api.github.com/repos/RhinoWeb/agency-os/releases/latest', {
      headers: { 'User-Agent': 'agency-os-updater/1.0', 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!r.ok) return null;
    const data = await r.json();
    cachedLatest = { version: data.tag_name?.replace(/^v/, ''), body: data.body ?? '', publishedAt: data.published_at, url: data.html_url };
    cacheTime = now;
    return cachedLatest;
  } catch { return null; }
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

app.get('/api/version', async (req, res) => {
  const latest  = await getLatestRelease();
  const latestV = latest?.version ?? LOCAL_VERSION;
  res.json({
    current:         LOCAL_VERSION,
    latest:          latestV,
    updateAvailable: compareVersions(latestV, LOCAL_VERSION) > 0,
    releaseNotes:    latest?.body ?? '',
    releaseUrl:      latest?.url  ?? '',
    publishedAt:     latest?.publishedAt ?? null,
  });
});

app.post('/api/apply-update', (req, res) => {
  try {
    execSync('git pull origin main', { stdio: 'pipe', timeout: 30000 });
    execSync('npm install --silent', { stdio: 'pipe', timeout: 120000 });
    res.json({ ok: true, message: 'Update applied. Please restart Agency OS (Ctrl+C → npm run dev).' });
    // Exit after 2s so the user can see the response, then process manager restarts
    setTimeout(() => process.exit(0), 2000);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.stderr?.toString() ?? err.message });
  }
});

// ── HTML content extractor (no extra deps) ───────────────────
function extractPageContent(html, baseUrl) {
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const titleM = clean.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title  = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : baseUrl;

  const descM = clean.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
             || clean.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descM ? descM[1] : '';

  const headings = [];
  const hRx = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let hm;
  while ((hm = hRx.exec(clean)) !== null && headings.length < 12) {
    const t = hm[2].replace(/<[^>]+>/g, '').trim();
    if (t) headings.push({ level: parseInt(hm[1]), text: t.slice(0, 120) });
  }

  const links = [];
  const lRx = /<a[^>]+href=["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let lm;
  while ((lm = lRx.exec(clean)) !== null && links.length < 25) {
    let href = lm[1];
    const txt = lm[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!href || !txt || txt.length < 2 || txt.length > 100) continue;
    if (href.startsWith('/')) { try { href = new URL(href, baseUrl).href; } catch { continue; } }
    if (href.startsWith('http')) links.push({ href, text: txt });
  }

  const text = clean
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n').replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n')
    .trim().slice(0, 12000);

  return { title, description, headings, links, text };
}

async function fetchPage(url) {
  if (!url.startsWith('http')) url = 'https://' + url;
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    clearTimeout(tid);
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
    const html = await r.text();
    return { html, finalUrl: r.url };
  } finally {
    clearTimeout(tid);
  }
}

async function llmOnce({ provider, apiKey, model, systemPrompt, userPrompt }) {
  const cfg = PROVIDERS[provider] ?? PROVIDERS.minimax;
  if (cfg.format === 'anthropic') {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model, max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    return msg.content[0]?.text ?? '';
  }
  const r = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, max_tokens: 300, temperature: 0.2,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }),
  });
  const d = await r.json();
  return d.choices?.[0]?.message?.content ?? '';
}

// ── /api/browse — fetch & parse a URL ────────────────────────
app.post('/api/browse', async (req, res) => {
  let { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  try {
    const { html, finalUrl } = await fetchPage(url);
    const content = extractPageContent(html, finalUrl);
    res.json({ url: finalUrl, ...content });
  } catch (err) {
    const code = err.name === 'AbortError' ? 408 : 500;
    res.status(code).json({ error: err.name === 'AbortError' ? 'Request timed out' : err.message });
  }
});

// ── /api/ai-browse — AI-directed agentic browse (SSE) ────────
app.post('/api/ai-browse', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = obj => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  const { task, provider: prov = 'minimax', apiKey: clientKey, model: clientModel } = req.body;
  const cfg    = PROVIDERS[prov] ?? PROVIDERS.minimax;
  const envKey = process.env[`${prov.toUpperCase()}_API_KEY`] ?? process.env.MINIMAX_API_KEY;
  const apiKey = clientKey || envKey;
  const model  = clientModel || cfg.defaultModel;

  if (!apiKey) {
    send({ type: 'error', text: `No API key for "${prov}". Add one in Settings → AI Integrations.` });
    return res.end();
  }

  try {
    // Step 1: Ask AI what URL to visit
    send({ type: 'thinking', text: 'Deciding where to look...' });
    const planText = await llmOnce({
      provider: prov, apiKey, model,
      systemPrompt: 'You are a web research agent. Given a task, respond ONLY with valid JSON: {"url":"https://...","reason":"one sentence"}. No other text.',
      userPrompt: `Research task: ${task}`,
    });

    let browseUrl = '', reason = '';
    try {
      const m = planText.match(/\{[\s\S]*\}/);
      if (m) { const p = JSON.parse(m[0]); browseUrl = p.url; reason = p.reason; }
    } catch {}
    if (!browseUrl) {
      const m = planText.match(/https?:\/\/[^\s"'}\]]+/);
      browseUrl = m?.[0] ?? '';
    }
    if (!browseUrl) {
      send({ type: 'error', text: 'Could not decide on a URL. Try a more specific task.' });
      return res.end();
    }

    send({ type: 'browsing', url: browseUrl, reason });

    // Step 2: Fetch and parse the page
    let page;
    try {
      const { html, finalUrl } = await fetchPage(browseUrl);
      page = { ...extractPageContent(html, finalUrl), url: finalUrl };
    } catch (err) {
      send({ type: 'error', text: `Could not load page: ${err.message}` });
      return res.end();
    }
    send({ type: 'page', url: page.url, title: page.title, description: page.description, headings: page.headings, links: page.links, text: page.text.slice(0, 2000) });

    // Step 3: Stream AI analysis
    send({ type: 'analyzing', text: 'Reading and summarizing...' });
    const analyzeMessages = [
      { role: 'system', content: 'You are a research analyst for a digital marketing agency. Analyze the page content and answer the task. Use markdown: **bold**, bullets, short sections. Be specific — quote actual prices, features, and data found on the page.' },
      { role: 'user',   content: `Task: ${task}\n\nPage: ${page.title}\nURL: ${page.url}\n${page.description ? `Summary: ${page.description}\n` : ''}\nContent:\n${page.text.slice(0, 6000)}` },
    ];

    if (cfg.format === 'anthropic') {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey });
      const stream = await client.messages.stream({ model, max_tokens: 1200, system: analyzeMessages[0].content, messages: [analyzeMessages[1]] });
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          send({ type: 'answer', text: chunk.delta.text });
        }
      }
    } else {
      const r = await fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: analyzeMessages, stream: true, max_tokens: 1200 }),
      });
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const d = line.slice(5).trim();
          if (d === '[DONE]') break;
          try { const p = JSON.parse(d); const t = p.choices?.[0]?.delta?.content ?? ''; if (t) send({ type: 'answer', text: t }); } catch {}
        }
      }
    }

    send({ type: 'done' });
    res.end();
  } catch (err) {
    send({ type: 'error', text: err.message });
    res.end();
  }
});

// ── Google Calendar OAuth ─────────────────────────────────────
const GCAL_TOKEN_PATH = join(__dirname, '.gcal-token.json');
const GCAL_SCOPES     = 'https://www.googleapis.com/auth/calendar.readonly';
const GCAL_AUTH_URL   = 'https://accounts.google.com/o/oauth2/v2/auth';
const GCAL_TOKEN_URL  = 'https://oauth2.googleapis.com/token';
const GCAL_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

function loadGcalToken() {
  try { return existsSync(GCAL_TOKEN_PATH) ? JSON.parse(readFileSync(GCAL_TOKEN_PATH, 'utf8')) : null; }
  catch { return null; }
}
function saveGcalToken(token) {
  writeFileSync(GCAL_TOKEN_PATH, JSON.stringify(token), 'utf8');
}

async function refreshGcalToken(token) {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !token.refresh_token) return null;
  const r = await fetch(GCAL_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
      grant_type:    'refresh_token',
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  const refreshed = { ...token, access_token: d.access_token, expires_at: Date.now() + d.expires_in * 1000 };
  saveGcalToken(refreshed);
  return refreshed;
}

async function getValidGcalToken() {
  let token = loadGcalToken();
  if (!token) return null;
  if (token.expires_at && Date.now() > token.expires_at - 60_000) {
    token = await refreshGcalToken(token);
  }
  return token;
}

// Step 1: redirect browser to Google consent page
app.get('/api/gcal/auth', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return res.status(503).send('GOOGLE_CLIENT_ID not set in .env');
  const redirectUri = `http://localhost:${PORT}/api/gcal/callback`;
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         GCAL_SCOPES,
    access_type:   'offline',
    prompt:        'consent',
  });
  res.redirect(`${GCAL_AUTH_URL}?${params}`);
});

// Step 2: Google redirects here with ?code=
app.get('/api/gcal/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.send(`<script>window.close();</script><p>Auth failed: ${error ?? 'no code'}</p>`);

  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = `http://localhost:${PORT}/api/gcal/callback`;

  try {
    const r = await fetch(GCAL_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
    });
    if (!r.ok) throw new Error(`Token exchange failed: ${r.status}`);
    const d = await r.json();
    saveGcalToken({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Date.now() + d.expires_in * 1000 });
    // Close the popup and reload parent
    res.send('<script>if(window.opener){window.opener.postMessage("gcal-connected","*");window.close();}else{window.location="http://localhost:5173";}</script>Connected! You can close this window.');
  } catch (err) {
    res.send(`<p>Error: ${err.message}</p>`);
  }
});

// Check connection status
app.get('/api/gcal/status', (req, res) => {
  const token = loadGcalToken();
  res.json({ connected: !!token });
});

// Fetch today's events
app.get('/api/gcal/events', async (req, res) => {
  const token = await getValidGcalToken();
  if (!token) return res.status(401).json({ error: 'Not connected to Google Calendar' });

  const now       = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  try {
    const r = await fetch(
      `${GCAL_EVENTS_URL}?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime&maxResults=25`,
      { headers: { Authorization: `Bearer ${token.access_token}` } }
    );
    if (!r.ok) throw new Error(`Google API error: ${r.status}`);
    const data = await r.json();

    const events = (data.items ?? []).map(ev => {
      const start = ev.start?.dateTime ?? ev.start?.date;
      const end   = ev.end?.dateTime   ?? ev.end?.date;
      const d     = start ? new Date(start) : null;
      const h     = d ? d.getHours()   : 0;
      const m     = d ? d.getMinutes() : 0;
      const ampm  = h >= 12 ? 'PM' : 'AM';
      const h12   = ((h % 12) || 12);
      const durMs = d && end ? new Date(end) - d : 3600000;
      return {
        id:     `gcal-${ev.id}`,
        title:  ev.summary ?? '(No title)',
        time:   d ? `${h12}:${String(m).padStart(2,'0')} ${ampm}` : 'All day',
        _sort:  h * 60 + m,
        dur:    Math.round(durMs / 60000) || 60,
        type:   'meeting',
        cl:     '#4285F4',
        source: 'google',
        hangoutLink: ev.hangoutLink ?? null,
        location: ev.location ?? null,
      };
    });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disconnect
app.post('/api/gcal/disconnect', (req, res) => {
  try {
    if (existsSync(GCAL_TOKEN_PATH)) writeFileSync(GCAL_TOKEN_PATH, '', 'utf8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ── APIFY routes ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

const APIFY_BASE = 'https://api.apify.com/v2';

// Run an actor
app.post('/api/apify/run', async (req, res) => {
  const key = process.env.APIFY_API_KEY;
  if (!key) return res.status(400).json({ error: 'APIFY_API_KEY not set' });
  const { actorId, input } = req.body;
  if (!actorId) return res.status(400).json({ error: 'actorId required' });
  try {
    const r = await fetch(`${APIFY_BASE}/acts/${encodeURIComponent(actorId)}/runs?token=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input ?? {}),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.error?.message ?? 'Apify error' });
    res.json({ runId: d.data.id, status: d.data.status, actorId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Poll run status
app.get('/api/apify/status/:runId', async (req, res) => {
  const key = process.env.APIFY_API_KEY;
  if (!key) return res.status(400).json({ error: 'APIFY_API_KEY not set' });
  try {
    const r = await fetch(`${APIFY_BASE}/actor-runs/${req.params.runId}?token=${key}`);
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.error?.message ?? 'Apify error' });
    res.json({ status: d.data.status, datasetId: d.data.defaultDatasetId, stats: d.data.stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch dataset results
app.get('/api/apify/results/:datasetId', async (req, res) => {
  const key = process.env.APIFY_API_KEY;
  if (!key) return res.status(400).json({ error: 'APIFY_API_KEY not set' });
  const limit = Math.min(Number(req.query.limit ?? 200), 500);
  try {
    const r = await fetch(`${APIFY_BASE}/datasets/${req.params.datasetId}/items?token=${key}&limit=${limit}&clean=true`);
    const items = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: 'Apify dataset error' });
    res.json({ items, count: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Normalize raw Apify items to lead schema
app.post('/api/apify/normalize', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const leads = items.map((item, i) => ({
    id:          `l-apify-${Date.now()}-${i}`,
    name:        item.fullName ?? item.name ?? `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim() ?? 'Unknown',
    company:     item.companyName ?? item.company ?? '',
    title:       item.jobTitle ?? item.title ?? item.headline ?? '',
    email:       item.email ?? '',
    linkedIn:    item.linkedInUrl ?? item.profileUrl ?? '',
    status:      'lead',
    source:      'apify',
    leadScore:   Math.floor(Math.random() * 30) + 50, // scored by AI later
    industry:    item.industry ?? '',
    employees:   item.companySize ?? item.employees ?? '',
    location:    item.location ?? item.city ?? '',
    campaignId:  null,
    sequenceStep: 0,
    replyStatus: 'none',
    notes:       '',
    since:       new Date().toISOString().split('T')[0],
    color:       '#00FFB2',
  }));

  res.json({ leads, count: leads.length });
});

// ═══════════════════════════════════════════════════════════════
// ── INSTANTLY routes ───────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

const INSTANTLY_BASE = 'https://api.instantly.ai/api/v1';

// Create a campaign
app.post('/api/instantly/campaign', async (req, res) => {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) return res.status(400).json({ error: 'INSTANTLY_API_KEY not set' });
  const { name, sequence } = req.body;
  if (!name || !sequence) return res.status(400).json({ error: 'name and sequence required' });
  try {
    const r = await fetch(`${INSTANTLY_BASE}/campaign/create?api_key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email_list: [], sequences: [{ steps: sequence }] }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message ?? 'Instantly error' });
    res.json({ campaignId: d.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add leads to campaign
app.post('/api/instantly/leads', async (req, res) => {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) return res.status(400).json({ error: 'INSTANTLY_API_KEY not set' });
  const { campaignId, leads } = req.body;
  if (!campaignId || !Array.isArray(leads)) return res.status(400).json({ error: 'campaignId and leads[] required' });
  try {
    const r = await fetch(`${INSTANTLY_BASE}/lead/add?api_key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId, leads: leads.map(l => ({
        email:      l.email,
        first_name: l.name?.split(' ')[0] ?? '',
        last_name:  l.name?.split(' ').slice(1).join(' ') ?? '',
        company_name: l.company ?? '',
        personalization: l.notes ?? '',
        custom_variables: { title: l.title ?? '', linkedin: l.linkedIn ?? '' },
      })) }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message ?? 'Instantly error' });
    res.json({ added: d.total_added ?? leads.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get campaign stats
app.get('/api/instantly/stats/:campaignId', async (req, res) => {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) return res.status(400).json({ error: 'INSTANTLY_API_KEY not set' });
  try {
    const r = await fetch(`${INSTANTLY_BASE}/analytics/campaign/summary?api_key=${key}&campaign_id=${req.params.campaignId}`);
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message ?? 'Instantly error' });
    res.json(d);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook receiver for Instantly reply events
app.post('/api/instantly/webhook', express.raw({ type: '*/*' }), (req, res) => {
  // Verify HMAC if secret is set
  const secret = process.env.INSTANTLY_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers['x-instantly-signature'];
    if (!sig) return res.status(401).json({ error: 'Missing signature' });
    const expected = createHmac('sha256', secret).update(req.body).digest('hex');
    if (sig !== expected) return res.status(401).json({ error: 'Invalid signature' });
  }
  try {
    const event = JSON.parse(req.body.toString());
    console.log('[Instantly webhook]', event.event_type, event.lead_email);
  } catch { /* malformed body */ }
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════
// ── ZOOM routes ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

let _zoomToken = null;
let _zoomTokenExpiry = 0;

async function getZoomToken() {
  if (_zoomToken && Date.now() < _zoomTokenExpiry) return _zoomToken;
  const id     = process.env.ZOOM_CLIENT_ID;
  const secret = process.env.ZOOM_CLIENT_SECRET;
  const account= process.env.ZOOM_ACCOUNT_ID;
  if (!id || !secret || !account) throw new Error('Zoom credentials not set');
  const creds = Buffer.from(`${id}:${secret}`).toString('base64');
  const r = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${account}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.reason ?? 'Zoom token error');
  _zoomToken       = d.access_token;
  _zoomTokenExpiry = Date.now() + (d.expires_in - 60) * 1000;
  return _zoomToken;
}

// Create a Zoom meeting
app.post('/api/zoom/meeting', async (req, res) => {
  if (!process.env.ZOOM_CLIENT_ID) return res.status(400).json({ error: 'Zoom credentials not set' });
  const { topic, startTime, durationMin = 30, agenda = '' } = req.body;
  if (!topic || !startTime) return res.status(400).json({ error: 'topic and startTime required' });
  try {
    const token = await getZoomToken();
    const r = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic, agenda,
        type: 2, // scheduled
        start_time: startTime,
        duration: durationMin,
        settings: { join_before_host: true, waiting_room: false },
      }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message ?? 'Zoom error' });
    res.json({ meetingId: d.id, joinUrl: d.join_url, startUrl: d.start_url, topic: d.topic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ── AI Sequence + Reply Classification ─────────────────────────
// ═══════════════════════════════════════════════════════════════

// Generate a 12-step cold email sequence via AI
app.post('/api/ai/sequence', async (req, res) => {
  const { brief, provider = 'minimax' } = req.body;
  if (!brief) return res.status(400).json({ error: 'brief required' });

  const prov = PROVIDERS[provider];
  const key  = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!prov || !key) return res.status(400).json({ error: `Provider ${provider} not configured` });

  const prompt = `You are an expert cold email copywriter. Generate a 12-step cold email sequence as JSON.

Campaign brief:
- Offer: ${brief.offer}
- ICP: ${brief.icp}
- Tone: ${brief.tone ?? 'consultative'}
- Case study: ${brief.caseStudy ?? 'none'}

Return ONLY a valid JSON array with exactly 12 objects, each with:
{ "step": number, "subject": string, "body": string, "delay": number }

delay = days after previous email (step 1 is day 0).
Keep bodies under 120 words. Use {firstName}, {company}, {industry} as variables.`;

  try {
    const r = await fetch(prov.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: prov.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
      }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.error?.message ?? 'AI error' });
    const text = d.choices?.[0]?.message?.content ?? '';
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: 'AI did not return valid JSON array', raw: text });
    const sequence = JSON.parse(match[0]);
    res.json({ sequence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Classify a reply intent
app.post('/api/ai/classify-reply', async (req, res) => {
  const { replyText, provider = 'minimax' } = req.body;
  if (!replyText) return res.status(400).json({ error: 'replyText required' });

  const prov = PROVIDERS[provider];
  const key  = process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!prov || !key) return res.status(400).json({ error: `Provider ${provider} not configured` });

  const prompt = `Classify this cold email reply into ONE of: POSITIVE, NEGATIVE, NEUTRAL, UNSUBSCRIBE, REFERRAL, MAYBE_LATER.

Reply: "${replyText}"

Respond with ONLY a JSON object: { "intent": "POSITIVE", "confidence": 0.95, "summary": "Interested, asked for pricing" }`;

  try {
    const r = await fetch(prov.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: prov.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 128,
      }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.error?.message ?? 'AI error' });
    const text = d.choices?.[0]?.message?.content ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'AI did not return valid JSON', raw: text });
    res.json(JSON.parse(match[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (_, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => {
  console.log(`\n  Agency OS API  →  http://localhost:${PORT}`);
  const keys = Object.keys(PROVIDERS).filter(p => process.env[`${p.toUpperCase()}_API_KEY`]);
  if (keys.length) console.log(`  ✓  Keys found in .env: ${keys.join(', ')}`);
  else console.warn('  ⚠  No API keys in .env — use Settings UI to add keys\n');
});
