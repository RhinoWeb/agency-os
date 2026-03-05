import { useState, useRef } from 'react';

const STATUS_ICON = {
  thinking:  '🤔',
  browsing:  '🌐',
  page:      '📄',
  analyzing: '🔍',
  error:     '⚠️',
  done:      '✓',
};

const STATUS_LABEL = {
  idle:      'Ready',
  loading:   'Loading page…',
  thinking:  'AI thinking…',
  browsing:  'Browsing…',
  analyzing: 'AI reading…',
  done:      'Done',
  error:     'Error',
};

export default function WebBrowser({ settings }) {
  const [mode,    setMode]    = useState('manual');   // manual | ai
  const [url,     setUrl]     = useState('');
  const [task,    setTask]    = useState('');
  const [page,    setPage]    = useState(null);
  const [steps,   setSteps]   = useState([]);
  const [answer,  setAnswer]  = useState('');
  const [status,  setStatus]  = useState('idle');
  const [history, setHistory] = useState([]);

  const answerRef = useRef('');
  const inputRef  = useRef(null);

  // ── Manual browse ──────────────────────────────────────
  async function manualBrowse(targetUrl) {
    const u = (targetUrl || url).trim();
    if (!u) return;
    setStatus('loading');
    setPage(null);
    setAnswer('');
    answerRef.current = '';
    setSteps([{ type: 'browsing', text: `Fetching ${u}` }]);

    try {
      const res  = await fetch('/api/browse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: u }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      setPage(data);
      setUrl(data.url);
      setSteps([{ type: 'done', text: `Loaded: ${data.title}` }]);
      addHistory(data.url, data.title);
      setStatus('done');
    } catch (err) {
      setSteps([{ type: 'error', text: err.message }]);
      setStatus('error');
    }
  }

  // ── AI-directed browse ─────────────────────────────────
  async function aiBrowse() {
    if (!task.trim()) return;
    setStatus('thinking');
    setPage(null);
    setAnswer('');
    answerRef.current = '';
    setSteps([]);

    const provider = settings?.provider ?? 'minimax';
    const apiKey   = settings?.apiKeys?.[provider] ?? '';
    const model    = settings?.models?.[provider]  ?? '';

    try {
      const res = await fetch('/api/ai-browse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ task, provider, apiKey, model }),
      });

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try { handleEvent(JSON.parse(line.slice(5))); } catch {}
        }
      }
    } catch (err) {
      setSteps(s => [...s, { type: 'error', text: err.message }]);
      setStatus('error');
    }
  }

  function handleEvent(ev) {
    switch (ev.type) {
      case 'thinking':
        setSteps(s => [...s, { type: 'thinking', text: ev.text }]);
        setStatus('thinking');
        break;
      case 'browsing':
        setSteps(s => [...s, { type: 'browsing', text: `Visiting ${ev.url}`, reason: ev.reason }]);
        setStatus('browsing');
        setUrl(ev.url);
        break;
      case 'page':
        setPage(ev);
        setSteps(s => [...s, { type: 'page', text: `Loaded: ${ev.title}` }]);
        addHistory(ev.url, ev.title);
        break;
      case 'analyzing':
        setSteps(s => [...s, { type: 'analyzing', text: ev.text }]);
        setStatus('analyzing');
        break;
      case 'answer':
        answerRef.current += ev.text;
        setAnswer(answerRef.current);
        break;
      case 'done':
        setStatus('done');
        break;
      case 'error':
        setSteps(s => [...s, { type: 'error', text: ev.text }]);
        setStatus('error');
        break;
    }
  }

  function addHistory(u, title) {
    setHistory(h => [{ url: u, title: title || u, time: new Date().toLocaleTimeString() }, ...h.slice(0, 19)]);
  }

  const isBusy = ['loading', 'thinking', 'browsing', 'analyzing'].includes(status);
  const hasAI  = answer || status === 'analyzing';

  return (
    <section className="view view--browser" aria-labelledby="browser-title">
      {/* Header */}
      <header style={{ marginBottom: 14 }}>
        <div className="flex-between">
          <div>
            <h1 id="browser-title" className="view-title">🌐 Web Browser</h1>
            <p className="view-subtitle">Browse manually or let the AI research for you</p>
          </div>
          <div className="browser-mode-toggle" role="group" aria-label="Browse mode">
            <button
              className={`browser-mode-btn${mode === 'manual' ? ' browser-mode-btn--active' : ''}`}
              onClick={() => setMode('manual')}
              aria-pressed={mode === 'manual'}
            >Manual</button>
            <button
              className={`browser-mode-btn${mode === 'ai' ? ' browser-mode-btn--active' : ''}`}
              onClick={() => setMode('ai')}
              aria-pressed={mode === 'ai'}
            >🧠 AI Browse</button>
          </div>
        </div>
      </header>

      {/* URL / Task bar */}
      <div className={`browser-bar${mode === 'ai' ? ' browser-bar--ai' : ''}`}>
        <span className="browser-bar__icon" aria-hidden="true">{mode === 'ai' ? '🧠' : '🔗'}</span>
        {mode === 'manual' ? (
          <input
            ref={inputRef}
            className="browser-bar__input"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && manualBrowse()}
            placeholder="Enter URL to browse… (e.g. ahrefs.com, semrush.com/pricing)"
            aria-label="URL to browse"
            disabled={isBusy}
          />
        ) : (
          <input
            ref={inputRef}
            className="browser-bar__input"
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isBusy && aiBrowse()}
            placeholder="Describe what to research… (e.g. Find Ahrefs pricing and features)"
            aria-label="Research task for AI"
            disabled={isBusy}
          />
        )}
        {/* Status pill */}
        {isBusy && (
          <span className="browser-status-pill" aria-live="polite">
            <span className="browser-pulse" aria-hidden="true"/>
            {STATUS_LABEL[status]}
          </span>
        )}
        <button
          className="btn btn--primary"
          onClick={mode === 'manual' ? () => manualBrowse() : aiBrowse}
          disabled={isBusy || (mode === 'manual' ? !url.trim() : !task.trim())}
          style={{ padding: '9px 20px', flexShrink: 0 }}
        >
          {isBusy ? '…' : mode === 'manual' ? 'Go' : 'Research'}
        </button>
      </div>

      {/* Main layout */}
      <div className={`browser-layout${hasAI ? ' browser-layout--3col' : ''}`}>

        {/* History sidebar */}
        <aside className="browser-history" aria-label="Browse history">
          <div className="section-label mb-8">History</div>
          {history.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', padding: '6px 0' }}>No pages yet</div>
          ) : (
            history.map((h, i) => (
              <button
                key={i}
                className="browser-hist-item"
                onClick={() => { setMode('manual'); manualBrowse(h.url); }}
                title={h.url}
              >
                <div className="browser-hist-title">{h.title}</div>
                <div className="browser-hist-time">{h.time}</div>
              </button>
            ))
          )}
        </aside>

        {/* Center: steps + page */}
        <div className="browser-content">

          {/* Step log */}
          {steps.length > 0 && (
            <div className="browser-steps" role="log" aria-label="Browse progress">
              {steps.map((s, i) => (
                <div key={i} className={`browser-step browser-step--${s.type}`}>
                  <span className="browser-step__icon" aria-hidden="true">{STATUS_ICON[s.type] ?? '•'}</span>
                  <span>{s.text}</span>
                  {s.reason && <span className="browser-step__reason"> — {s.reason}</span>}
                </div>
              ))}
              {isBusy && (
                <div className="browser-step browser-step--loading">
                  <span className="browser-pulse" aria-hidden="true"/>
                  <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 11 }}>{STATUS_LABEL[status]}</span>
                </div>
              )}
            </div>
          )}

          {/* Idle empty state */}
          {status === 'idle' && !page && (
            <div className="browser-empty">
              <div style={{ fontSize: 56, marginBottom: 14 }}>🌐</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--dim)', fontFamily: 'var(--sans)', marginBottom: 8 }}>
                Ready to browse
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.8, maxWidth: 340 }}>
                <strong style={{ color: 'var(--dim)' }}>Manual:</strong> enter any URL and hit Go<br/>
                <strong style={{ color: 'var(--dim)' }}>AI Browse:</strong> describe a research task and the AI will find, fetch, and summarize the right page
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  'Find Ahrefs pricing',
                  'Semrush vs Ahrefs comparison',
                  'Top content marketing tools 2025',
                  'HubSpot agency pricing',
                ].map(q => (
                  <button
                    key={q}
                    className="browser-suggestion"
                    onClick={() => { setMode('ai'); setTask(q); }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Page reader view */}
          {page && (
            <div className="browser-reader">
              <div className="browser-reader__header">
                <a href={page.url} target="_blank" rel="noopener noreferrer" className="browser-reader__url">
                  ↗ {page.url}
                </a>
                <h2 className="browser-reader__title">{page.title}</h2>
                {page.description && (
                  <div className="browser-reader__desc">{page.description}</div>
                )}
              </div>

              {page.headings?.length > 0 && (
                <div className="browser-reader__outline">
                  <div className="section-label mb-6">Page Outline</div>
                  {page.headings.map((h, i) => (
                    <div key={i} style={{ paddingLeft: (h.level - 1) * 14, fontSize: 11, color: h.level === 1 ? 'var(--dim)' : 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 4, lineHeight: 1.4 }}>
                      {'›'.repeat(h.level - 1)} {h.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="browser-reader__text">{page.text}</div>

              {page.links?.length > 0 && (
                <div className="browser-reader__links">
                  <div className="section-label mb-8">Page Links</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {page.links.slice(0, 18).map((l, i) => (
                      <button
                        key={i}
                        className="browser-link-chip"
                        onClick={() => { setMode('manual'); setUrl(l.href); manualBrowse(l.href); }}
                        title={l.href}
                      >
                        {l.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: AI analysis panel */}
        {hasAI && (
          <aside className="browser-ai-panel" aria-label="AI analysis">
            <div className="section-label mb-10">🧠 AI Analysis</div>
            {status === 'analyzing' && !answer && (
              <div style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 11 }}>Reading page content…</div>
            )}
            <div className="browser-ai-answer">{answer}</div>
            {status === 'analyzing' && answer && <span className="ai-msg__cursor" aria-hidden="true"/>}
          </aside>
        )}

      </div>
    </section>
  );
}
