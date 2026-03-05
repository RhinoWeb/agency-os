import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

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
