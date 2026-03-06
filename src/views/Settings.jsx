import { useState, useEffect } from 'react';
import { THEMES, PROVIDER_META, DEFAULT_SETTINGS } from '../theme.js';

const SECTIONS = [
  { id: 'ai',         label: 'AI Integrations', icon: '🤖' },
  { id: 'tools',      label: 'Tool Vault',       icon: '🔑' },
  { id: 'calendars',  label: 'Calendars',        icon: '🗓' },
  { id: 'appearance', label: 'Appearance',       icon: '🎨' },
  { id: 'agency',     label: 'Agency',           icon: '🏢' },
  { id: 'notifs',     label: 'Notifications',    icon: '🔔' },
  { id: 'data',       label: 'Data & Privacy',   icon: '💾' },
];

// ── Tool Vault ─────────────────────────────────────────────────
const TOOL_CATS = [
  { id:'all',        label:'All Tools'   },
  { id:'ai',         label:'AI Models',      color:'#7B61FF' },
  { id:'image',      label:'Image & Video',  color:'#FF6B35' },
  { id:'voice',      label:'Voice & Audio',  color:'#00B4D8' },
  { id:'content',    label:'Content & SEO',  color:'#00FFB2' },
  { id:'outreach',   label:'Outreach',       color:'#EC4899' },
  { id:'automation', label:'Automation',     color:'#FBBF24' },
];

const CAT_COLOR = { ai:'#7B61FF', image:'#FF6B35', voice:'#00B4D8', content:'#00FFB2', outreach:'#EC4899', automation:'#FBBF24' };

const TOOL_VAULT = [
  // AI Models
  { id:'gemini',     cat:'ai',        icon:'✦',  label:'Gemini (Google)',   placeholder:'AIzaSy...',     docsUrl:'https://makersuite.google.com/app/apikey' },
  { id:'grok',       cat:'ai',        icon:'𝕏',  label:'Grok (xAI)',        placeholder:'xai-...',       docsUrl:'https://console.x.ai' },
  { id:'mistral',    cat:'ai',        icon:'▲',  label:'Mistral AI',        placeholder:'...',           docsUrl:'https://console.mistral.ai' },
  { id:'perplexity', cat:'ai',        icon:'◉',  label:'Perplexity AI',     placeholder:'pplx-...',      docsUrl:'https://www.perplexity.ai/settings/api' },
  // Image & Video
  { id:'stability',  cat:'image',     icon:'🎨', label:'Stability AI',      placeholder:'sk-...',        docsUrl:'https://platform.stability.ai/account/keys' },
  { id:'runway',     cat:'image',     icon:'🎬', label:'Runway ML',         placeholder:'key_...',       docsUrl:'https://app.runwayml.com/account/api-keys' },
  { id:'heygen',     cat:'image',     icon:'🧑', label:'HeyGen',            placeholder:'...',           docsUrl:'https://app.heygen.com/settings' },
  { id:'synthesia',  cat:'image',     icon:'🎤', label:'Synthesia',         placeholder:'...',           docsUrl:'https://www.synthesia.io/account/api' },
  { id:'higgsfield', cat:'image',     icon:'🎥', label:'Higgsfield AI',     placeholder:'...',           docsUrl:'https://www.higgsfield.ai' },
  { id:'leonardo',   cat:'image',     icon:'🦁', label:'Leonardo AI',       placeholder:'...',           docsUrl:'https://app.leonardo.ai/api-access' },
  { id:'ideogram',   cat:'image',     icon:'💡', label:'Ideogram',          placeholder:'...',           docsUrl:'https://ideogram.ai/api' },
  { id:'kling',      cat:'image',     icon:'🎞', label:'Kling AI',          placeholder:'...',           docsUrl:'https://klingai.com' },
  { id:'luma',       cat:'image',     icon:'🌙', label:'Luma AI',           placeholder:'...',           docsUrl:'https://lumalabs.ai/dream-machine/api' },
  { id:'pika',       cat:'image',     icon:'⚡', label:'Pika Labs',         placeholder:'...',           docsUrl:'https://pika.art' },
  { id:'descript',   cat:'image',     icon:'✂️', label:'Descript',          placeholder:'...',           docsUrl:'https://www.descript.com' },
  // Voice & Audio
  { id:'elevenlabs', cat:'voice',     icon:'🔊', label:'ElevenLabs',        placeholder:'xi-...',        docsUrl:'https://elevenlabs.io/app/settings/api-keys' },
  { id:'murf',       cat:'voice',     icon:'🎙', label:'Murf AI',           placeholder:'...',           docsUrl:'https://murf.ai/api' },
  { id:'playht',     cat:'voice',     icon:'▶️', label:'PlayHT',            placeholder:'...',           docsUrl:'https://play.ht/studio/api-access' },
  { id:'bland',      cat:'voice',     icon:'📞', label:'Bland AI',          placeholder:'...',           docsUrl:'https://bland.ai/dashboard' },
  { id:'vapi',       cat:'voice',     icon:'🤙', label:'Vapi',              placeholder:'...',           docsUrl:'https://dashboard.vapi.ai' },
  { id:'retell',     cat:'voice',     icon:'🔁', label:'Retell AI',         placeholder:'...',           docsUrl:'https://www.retellai.com/dashboard' },
  { id:'deepgram',   cat:'voice',     icon:'🌊', label:'Deepgram',          placeholder:'...',           docsUrl:'https://console.deepgram.com/project/api-keys' },
  { id:'assemblyai', cat:'voice',     icon:'🎧', label:'AssemblyAI',        placeholder:'...',           docsUrl:'https://www.assemblyai.com/dashboard' },
  { id:'cartesia',   cat:'voice',     icon:'🔮', label:'Cartesia AI',       placeholder:'...',           docsUrl:'https://cartesia.ai' },
  // Content & SEO
  { id:'jasper',     cat:'content',   icon:'✍️', label:'Jasper AI',         placeholder:'...',           docsUrl:'https://app.jasper.ai' },
  { id:'copyai',     cat:'content',   icon:'📋', label:'Copy.ai',           placeholder:'...',           docsUrl:'https://app.copy.ai/account/api-keys' },
  { id:'surfer',     cat:'content',   icon:'🏄', label:'Surfer SEO',        placeholder:'...',           docsUrl:'https://surferseo.com/api' },
  { id:'semrush',    cat:'content',   icon:'📈', label:'Semrush',           placeholder:'...',           docsUrl:'https://developer.semrush.com' },
  { id:'adcreative', cat:'content',   icon:'🎯', label:'AdCreative.ai',     placeholder:'...',           docsUrl:'https://app.adcreative.ai' },
  { id:'taplio',     cat:'content',   icon:'💼', label:'Taplio',            placeholder:'...',           docsUrl:'https://taplio.com' },
  // Outreach & Sales
  { id:'instantly',  cat:'outreach',  icon:'⚡', label:'Instantly.ai',      placeholder:'...',           docsUrl:'https://app.instantly.ai/app/api' },
  { id:'smartlead',  cat:'outreach',  icon:'📧', label:'Smartlead',         placeholder:'...',           docsUrl:'https://app.smartlead.ai' },
  { id:'clay',       cat:'outreach',  icon:'🏺', label:'Clay.com',          placeholder:'...',           docsUrl:'https://clay.com' },
  { id:'phantom',    cat:'outreach',  icon:'👻', label:'Phantom Buster',    placeholder:'...',           docsUrl:'https://phantombuster.com' },
  { id:'apollo',     cat:'outreach',  icon:'🚀', label:'Apollo API',        placeholder:'...',           docsUrl:'https://app.apollo.io/#/settings/integrations/api' },
  { id:'millionv',   cat:'outreach',  icon:'✅', label:'Million Verifier',  placeholder:'...',           docsUrl:'https://app.millionverifier.com/api' },
  { id:'refonic',    cat:'outreach',  icon:'🔔', label:'Refonic',           placeholder:'...',           docsUrl:'https://refonic.com' },
  // Automation & CRM
  { id:'make',       cat:'automation',icon:'⚙',  label:'Make (Integromat)', placeholder:'...',           docsUrl:'https://www.make.com/en/api-documentation' },
  { id:'zapier',     cat:'automation',icon:'⚡',  label:'Zapier',           placeholder:'...',           docsUrl:'https://nla.zapier.com/api/v1/docs' },
  { id:'voiceflow',  cat:'automation',icon:'🗣',  label:'Voiceflow',        placeholder:'VF.DM....',     docsUrl:'https://www.voiceflow.com' },
  { id:'manychat',   cat:'automation',icon:'💬',  label:'ManyChat',         placeholder:'...',           docsUrl:'https://manychat.com/developers' },
  { id:'hubspot',    cat:'automation',icon:'🟠',  label:'HubSpot',          placeholder:'pat-...',       docsUrl:'https://app.hubspot.com' },
  { id:'triplewhale',cat:'automation',icon:'🐋',  label:'Triple Whale',     placeholder:'...',           docsUrl:'https://app.triplewhale.com' },
  { id:'fbads',      cat:'automation',icon:'📘',  label:'Facebook Ads API', placeholder:'EAA...',        docsUrl:'https://developers.facebook.com' },
  { id:'mcphub',     cat:'automation',icon:'🔗',  label:'MCPHub',           placeholder:'...',           docsUrl:'https://mcphub.io' },
];

// ── Compact tool key row ───────────────────────────────────────
function ToolKeyRow({ toolId, tool, value, onChange }) {
  const [show,   setShow]   = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const cc = CAT_COLOR[tool.cat] ?? 'var(--muted)';
  const hasKey = !!value.trim();

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
      background:'var(--surface2)', borderRadius:'var(--radius)',
      borderLeft:`3px solid ${cc}`,
    }}>
      <span style={{ fontSize:17, width:24, textAlign:'center', flexShrink:0 }}>{tool.icon}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{tool.label}</span>
          {hasKey && <span style={{ fontSize:9, color:'var(--green)', fontFamily:'var(--mono)' }}>✓ set</span>}
          <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer"
             style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', marginLeft:'auto' }}>
            Get key →
          </a>
        </div>
        <div style={{ position:'relative' }}>
          <input
            className="input"
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(toolId, e.target.value)}
            placeholder={tool.placeholder || 'Paste API key…'}
            style={{ paddingRight:58, fontSize:11, height:32 }}
            aria-label={`${tool.label} API key`}
          />
          <div style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', display:'flex', gap:2 }}>
            <button
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--muted)', padding:'3px 5px', lineHeight:1 }}
              onClick={() => setShow(p => !p)}
              title={show ? 'Hide key' : 'Show key'}
              aria-label={show ? 'Hide key' : 'Show key'}
            >
              {show ? '🙈' : '👁'}
            </button>
            <button
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color: copied ? 'var(--accent)' : 'var(--muted)', padding:'3px 5px', lineHeight:1 }}
              onClick={copy}
              title="Copy key"
              aria-label="Copy key to clipboard"
            >
              {copied ? '✓' : '⎘'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FONT_SIZES = [
  { id: 'sm', label: 'Small',   px: '12px' },
  { id: 'md', label: 'Medium',  px: '13px' },
  { id: 'lg', label: 'Large',   px: '15px' },
];

const CURRENCIES  = ['USD','EUR','GBP','CAD','AUD','JPY','INR'];
const TIMEZONES   = ['America/New_York','America/Los_Angeles','America/Chicago','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Singapore','Australia/Sydney'];

// ── API Key row ───────────────────────────────────────────────
function ApiKeyRow({ provId, meta, value, model, defaultModel, onChange, onModelChange, onTest }) {
  const [show,    setShow]    = useState(false);
  const [testing, setTesting] = useState(false);
  const [status,  setStatus]  = useState(null); // null | 'ok' | 'fail'

  async function handleTest() {
    if (!value.trim()) return;
    setTesting(true);
    setStatus(null);
    try {
      const res  = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: provId, apiKey: value }),
      });
      const data = await res.json();
      setStatus(data.ok ? 'ok' : 'fail');
    } catch {
      setStatus('fail');
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="settings-api-row">
      <div className="settings-api-header">
        <span className="settings-api-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
          {meta.icon}
        </span>
        <div>
          <div className="settings-api-name">{meta.label}</div>
          <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer"
             style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)' }}>
            Get API key →
          </a>
        </div>
        {status === 'ok'   && <span style={{ marginLeft:'auto', fontSize:11, color:'var(--green)' }}>✓ Connected</span>}
        {status === 'fail' && <span style={{ marginLeft:'auto', fontSize:11, color:'var(--red)'   }}>✗ Failed</span>}
      </div>

      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        <div style={{ position:'relative', flex:1 }}>
          <input
            className="input"
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(provId, e.target.value)}
            placeholder={meta.placeholder}
            aria-label={`${meta.label} API key`}
            style={{ paddingRight:36 }}
          />
          <button
            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--muted)' }}
            onClick={() => setShow(p => !p)}
            aria-label={show ? 'Hide key' : 'Show key'}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>
        <button
          className="btn btn--ghost btn--sm"
          onClick={handleTest}
          disabled={!value.trim() || testing}
          aria-label="Test API key"
        >
          {testing ? '…' : 'Test'}
        </button>
      </div>

      {/* Model override */}
      <div style={{ marginTop:6 }}>
        <label style={{ fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1 }}>
          Model
        </label>
        <input
          className="input"
          style={{ marginTop:3 }}
          value={model}
          onChange={e => onModelChange(provId, e.target.value)}
          placeholder={defaultModel}
          aria-label={`${meta.label} model name`}
        />
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────
function Toggle({ value, onChange, label, desc }) {
  return (
    <label className="settings-toggle" aria-label={label}>
      <div>
        <div className="settings-toggle__label">{label}</div>
        {desc && <div className="settings-toggle__desc">{desc}</div>}
      </div>
      <button
        className={`toggle-btn${value ? ' toggle-btn--on' : ''}`}
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        <span className="toggle-thumb"/>
      </button>
    </label>
  );
}

// ── Main ─────────────────────────────────────────────────────
function downloadCSV(filename, rows) {
  const csv  = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

export default function Settings({ settings, setSettings, onResetAll, clients = [], columns = {} }) {
  const [section,    setSection]    = useState('ai');
  const [saved,      setSaved]      = useState(false);
  const [toolCat,    setToolCat]    = useState('all');
  const [toolSearch, setToolSearch] = useState('');
  const [gcalStatus, setGcalStatus] = useState('unknown');

  useEffect(() => {
    fetch('/api/gcal/status')
      .then(r => r.json())
      .then(d => setGcalStatus(d.connected ? 'connected' : 'disconnected'))
      .catch(() => setGcalStatus('disconnected'));
  }, []);

  useEffect(() => {
    const handler = e => {
      if (e.data === 'gcal-connected') setGcalStatus('connected');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  function set(key, value) {
    setSettings(p => ({ ...p, [key]: value }));
  }

  function setApiKey(provider, key) {
    setSettings(p => ({ ...p, apiKeys: { ...p.apiKeys, [provider]: key } }));
  }

  function setModel(provider, model) {
    setSettings(p => ({ ...p, models: { ...p.models, [provider]: model } }));
  }

  function setToolKey(toolId, key) {
    setSettings(p => ({ ...p, toolKeys: { ...(p.toolKeys ?? {}), [toolId]: key } }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify({ settings }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'agency-os-settings.json' });
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (window.confirm('Reset ALL settings to defaults? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
    }
  }

  function exportClientsCSV() {
    const headers = ['Name','Status','Type','MRR','Health','Contact','Email','Since','Services'];
    const rows    = clients.map(c => [
      c.name, c.status, c.clientType ?? '', c.mrr ?? 0, c.health ?? 0,
      c.contact ?? '', c.email ?? '', c.since ?? '',
      (c.services ?? []).join('|'),
    ]);
    downloadCSV('agency-os-clients.csv', [headers, ...rows]);
  }

  function exportTasksCSV() {
    const headers = ['ID','Title','Priority','Status','Agent','Due','Notes'];
    const rows    = Object.entries(columns).flatMap(([, col]) =>
      col.items.map(t => [t.id, t.title, t.priority, col.title, t.agent ?? '', t.due ?? '', t.notes ?? ''])
    );
    downloadCSV('agency-os-tasks.csv', [headers, ...rows]);
  }

  const DEFAULT_MODELS = { minimax:'MiniMax-Text-01', openai:'gpt-4o-mini', groq:'llama-3.3-70b-versatile', anthropic:'claude-haiku-4-5-20251001' };

  return (
    <section className="view" aria-labelledby="settings-title">
      <header className="flex-between mb-20">
        <div>
          <h1 id="settings-title" className="view-title">Settings</h1>
          <p className="view-subtitle">Customize Agency OS to fit your workflow</p>
        </div>
        <button className="btn btn--primary" onClick={handleSave} aria-live="polite">
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </header>

      <div className="settings-layout">
        {/* Sidebar */}
        <nav className="settings-sidebar" aria-label="Settings sections">
          {SECTIONS.map(s => {
            const configuredCount = s.id === 'tools'
              ? TOOL_VAULT.filter(t => (settings.toolKeys ?? {})[t.id]?.trim()).length
              : null;
            return (
              <button
                key={s.id}
                className={`settings-nav-item${section === s.id ? ' settings-nav-item--active' : ''}`}
                onClick={() => setSection(s.id)}
                aria-current={section === s.id ? 'page' : undefined}
              >
                <span aria-hidden="true">{s.icon}</span>
                {s.label}
                {configuredCount !== null && configuredCount > 0 && (
                  <span style={{
                    marginLeft:'auto', fontSize:9, fontFamily:'var(--mono)',
                    background:'var(--accent)20', color:'var(--accent)',
                    padding:'1px 6px', borderRadius:10,
                  }}>
                    {configuredCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="settings-content">

          {/* ── AI Integrations ── */}
          {section === 'ai' && (
            <div>
              <div className="settings-section-title">AI Integrations</div>
              <p className="settings-section-desc">
                Add API keys for any provider. Keys are stored locally and sent only to your local server.
              </p>

              {/* Active provider */}
              <div className="settings-field">
                <label className="settings-label">Active Provider</label>
                <p className="settings-hint">This provider will be used for all AI Brain responses.</p>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                  {Object.entries(PROVIDER_META).map(([id, meta]) => {
                    const active = settings.provider === id;
                    return (
                      <button
                        key={id}
                        className="provider-chip"
                        style={active ? { borderColor: meta.color, color: meta.color, background: `${meta.color}12` } : {}}
                        onClick={() => set('provider', id)}
                        aria-pressed={active}
                      >
                        <span>{meta.icon}</span> {meta.label}
                        {active && <span style={{ marginLeft:4, fontSize:9 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API key rows */}
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:4 }}>
                {Object.entries(PROVIDER_META).map(([id, meta]) => (
                  <ApiKeyRow
                    key={id}
                    provId={id}
                    meta={meta}
                    value={settings.apiKeys[id] || ''}
                    model={settings.models[id] || DEFAULT_MODELS[id]}
                    defaultModel={DEFAULT_MODELS[id]}
                    onChange={setApiKey}
                    onModelChange={setModel}
                    onTest={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Tool Vault ── */}
          {section === 'tools' && (() => {
            const toolKeys = settings.toolKeys ?? {};
            const configuredCount = TOOL_VAULT.filter(t => toolKeys[t.id]?.trim()).length;

            const visible = TOOL_VAULT.filter(t => {
              const matchCat    = toolCat === 'all' || t.cat === toolCat;
              const matchSearch = !toolSearch.trim() ||
                t.label.toLowerCase().includes(toolSearch.toLowerCase()) ||
                t.cat.toLowerCase().includes(toolSearch.toLowerCase());
              return matchCat && matchSearch;
            });

            return (
              <div>
                <div className="settings-section-title">Tool Vault</div>
                <p className="settings-section-desc">
                  Store API keys for all your marketing tools in one place. Keys never leave your machine.
                  &nbsp;<span style={{ color:'var(--accent)', fontFamily:'var(--mono)', fontSize:10 }}>
                    {configuredCount}/{TOOL_VAULT.length} configured
                  </span>
                </p>

                {/* Search */}
                <div style={{ position:'relative', marginBottom:12 }}>
                  <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:13, pointerEvents:'none' }}>🔍</span>
                  <input
                    className="input"
                    style={{ paddingLeft:32 }}
                    placeholder="Search tools…"
                    value={toolSearch}
                    onChange={e => setToolSearch(e.target.value)}
                    aria-label="Search tool vault"
                  />
                  {toolSearch && (
                    <button
                      style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:14 }}
                      onClick={() => setToolSearch('')}
                      aria-label="Clear search"
                    >×</button>
                  )}
                </div>

                {/* Category tabs */}
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                  {TOOL_CATS.map(cat => {
                    const active = toolCat === cat.id;
                    const count  = cat.id === 'all' ? TOOL_VAULT.length : TOOL_VAULT.filter(t => t.cat === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        style={{
                          fontSize:10, fontFamily:'var(--mono)', padding:'4px 10px', borderRadius:20, border:'1px solid',
                          cursor:'pointer', transition:'all .15s',
                          borderColor: active ? (cat.color ?? 'var(--accent)') : 'var(--border)',
                          color:       active ? (cat.color ?? 'var(--accent)') : 'var(--muted)',
                          background:  active ? `${cat.color ?? 'var(--accent)'}12` : 'transparent',
                        }}
                        onClick={() => setToolCat(cat.id)}
                        aria-pressed={active}
                      >
                        {cat.label}
                        <span style={{ marginLeft:5, opacity:0.7 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tool rows */}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {visible.map(tool => (
                    <ToolKeyRow
                      key={tool.id}
                      toolId={tool.id}
                      tool={tool}
                      value={toolKeys[tool.id] || ''}
                      onChange={setToolKey}
                    />
                  ))}
                  {visible.length === 0 && (
                    <div style={{ textAlign:'center', padding:32, color:'var(--muted)', fontSize:12 }}>
                      No tools match "{toolSearch}"
                    </div>
                  )}
                </div>

                <div style={{ marginTop:16, padding:12, background:'var(--surface2)', borderRadius:'var(--radius)', fontSize:10, color:'var(--muted)', lineHeight:1.8 }}>
                  🔐 <strong style={{ color:'var(--dim)' }}>Stored locally.</strong> Tool Vault keys are saved in your browser's localStorage only. They are not sent to any server unless a specific integration uses them.
                </div>
              </div>
            );
          })()}

          {/* ── Calendars ── */}
          {section === 'calendars' && (
            <div>
              <div className="settings-section-title">Calendar Integrations</div>
              <p className="settings-section-desc">
                Connect external calendars to merge their events into the Schedule view.
              </p>

              {/* Google Calendar card */}
              <div style={{ background:'var(--surface2)', borderRadius:10, padding:16, border:'1px solid var(--border)', marginTop:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                  <span style={{ fontSize:22 }}>🗓</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>Google Calendar</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>Merges today's events into your Schedule (read-only)</div>
                  </div>
                  <div style={{ marginLeft:'auto' }}>
                    {gcalStatus === 'connected' ? (
                      <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'#4285F4' }}>● Connected</span>
                    ) : (
                      <span style={{ fontSize:11, fontFamily:'var(--mono)', color:'var(--muted)' }}>○ Not connected</span>
                    )}
                  </div>
                </div>


                <div style={{ display:'flex', gap:8 }}>
                  {gcalStatus === 'connected' ? (
                    <button
                      className="btn btn--sm"
                      style={{ background:'#F4433612', borderColor:'#F44336', color:'#F44336' }}
                      onClick={() => fetch('/api/gcal/disconnect', { method:'POST' }).then(() => setGcalStatus('disconnected'))}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      className="btn btn--sm"
                      style={{ background:'#4285F412', borderColor:'#4285F4', color:'#4285F4' }}
                      onClick={() => window.open('http://localhost:3001/api/gcal/auth', 'gcal-auth', 'width=520,height=640,left=200,top=100')}
                    >
                      Connect Google Calendar
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop:12, fontSize:11, color:'var(--muted)', lineHeight:1.6 }}>
                🔐 OAuth tokens are stored in <code>.gcal-token.json</code> on your local server — never sent to third parties.
              </div>
            </div>
          )}

          {/* ── Appearance ── */}
          {section === 'appearance' && (
            <div>
              <div className="settings-section-title">Appearance</div>
              <p className="settings-section-desc">Customize the look and feel of Agency OS.</p>

              {/* Theme picker */}
              <div className="settings-field">
                <label className="settings-label">Color Theme</label>
                <div className="theme-grid">
                  {THEMES.map(t => {
                    const active = settings.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        className={`theme-card${active ? ' theme-card--active' : ''}`}
                        onClick={() => set('theme', t.id)}
                        aria-pressed={active}
                        aria-label={`${t.name} theme: ${t.description}`}
                        title={t.description}
                      >
                        {/* Swatch preview */}
                        <div className="theme-swatch">
                          {t.preview.map((col, i) => (
                            <div key={i} style={{ flex:1, background:col, minWidth:0 }}/>
                          ))}
                        </div>
                        <div className="theme-card__emoji">{t.emoji}</div>
                        <div className="theme-card__name">{t.name}</div>
                        <div className="theme-card__desc">{t.description}</div>
                        {active && <div className="theme-card__check">✓</div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font size */}
              <div className="settings-field">
                <label className="settings-label">Font Size</label>
                <div style={{ display:'flex', gap:8, marginTop:8 }}>
                  {FONT_SIZES.map(f => (
                    <button
                      key={f.id}
                      className="btn"
                      style={{
                        flex:1, fontSize: f.px, fontFamily:'var(--mono)',
                        background:   settings.fontSize === f.id ? 'var(--accent)' : 'var(--surface2)',
                        color:        settings.fontSize === f.id ? 'var(--bg)'     : 'var(--muted)',
                        borderColor:  settings.fontSize === f.id ? 'var(--accent)' : 'var(--border)',
                      }}
                      onClick={() => set('fontSize', f.id)}
                      aria-pressed={settings.fontSize === f.id}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact mode */}
              <div className="settings-field">
                <Toggle
                  value={settings.compactMode}
                  onChange={v => set('compactMode', v)}
                  label="Compact Mode"
                  desc="Reduces padding and spacing for more dense information display"
                />
              </div>
            </div>
          )}

          {/* ── Agency ── */}
          {section === 'agency' && (
            <div>
              <div className="settings-section-title">Agency Preferences</div>
              <p className="settings-section-desc">Configure your agency's operational defaults.</p>

              <div className="settings-field">
                <label className="settings-label" htmlFor="agencyName">Agency Name</label>
                <input id="agencyName" className="input" value={settings.agencyName}
                  onChange={e => set('agencyName', e.target.value)} placeholder="My Agency"/>
              </div>

              <div className="settings-field">
                <label className="settings-label" htmlFor="currency">Currency</label>
                <select id="currency" className="input" value={settings.currency}
                  onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="settings-field">
                <label className="settings-label" htmlFor="timezone">Timezone</label>
                <select id="timezone" className="input" value={settings.timezone}
                  onChange={e => set('timezone', e.target.value)}>
                  {TIMEZONES.map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {section === 'notifs' && (
            <div>
              <div className="settings-section-title">Notifications</div>
              <p className="settings-section-desc">Control which alerts appear in your notification feed.</p>

              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                <Toggle value={settings.notifAgents}  onChange={v => set('notifAgents', v)}
                  label="Agent activity"     desc="Alerts when agents complete tasks, error, or are paused"/>
                <Toggle value={settings.notifClients} onChange={v => set('notifClients', v)}
                  label="Client health"      desc="Alerts when a client health score drops below 80%"/>
                <Toggle value={settings.notifSummary} onChange={v => set('notifSummary', v)}
                  label="Daily summary"      desc="End-of-day digest of agent activity and task progress"/>
              </div>
            </div>
          )}

          {/* ── Data ── */}
          {section === 'data' && (() => {
            let storageBytes = 0;
            try {
              for (const k in localStorage) {
                if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
                  storageBytes += (localStorage.getItem(k).length + k.length) * 2;
                }
              }
            } catch {}
            const storageMB  = (storageBytes / (1024 * 1024)).toFixed(2);
            const limitMB    = 5;
            const storagePct = Math.min(100, (storageBytes / (limitMB * 1024 * 1024)) * 100);
            const storageCol = storagePct > 80 ? 'var(--red)' : storagePct > 60 ? 'var(--yellow)' : 'var(--accent)';

            return (
            <div>
              <div className="settings-section-title">Data & Privacy</div>
              <p className="settings-section-desc">All data is stored locally in your browser. Nothing leaves your machine.</p>

              {/* Storage indicator */}
              <div style={{ marginBottom:16, padding:14, background:'var(--surface2)', borderRadius:'var(--radius)' }}>
                <div className="flex-between" style={{ marginBottom:6 }}>
                  <span style={{ fontSize:11, fontWeight:600 }}>localStorage Usage</span>
                  <span style={{ fontSize:11, fontFamily:'var(--mono)', color: storageCol }}>{storageMB} MB / ~{limitMB} MB</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:'var(--border)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${storagePct}%`, background: storageCol, borderRadius:3, transition:'width .4s' }}/>
                </div>
                {storagePct > 70 && (
                  <div style={{ fontSize:10, color:'var(--yellow)', marginTop:6, fontFamily:'var(--mono)' }}>
                    ⚠ Storage is {Math.round(storagePct)}% full. Export and clear old data to prevent loss.
                  </div>
                )}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div className="settings-data-row">
                  <div>
                    <div className="settings-data-label">Export Settings</div>
                    <div className="settings-data-desc">Download your current configuration as JSON</div>
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={handleExport}>Export →</button>
                </div>

                <div className="settings-data-row">
                  <div>
                    <div className="settings-data-label">Export Clients CSV</div>
                    <div className="settings-data-desc">Download all client records (name, MRR, health, services…)</div>
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={exportClientsCSV}>Export →</button>
                </div>

                <div className="settings-data-row">
                  <div>
                    <div className="settings-data-label">Export Tasks CSV</div>
                    <div className="settings-data-desc">Download all tasks with priority, status, agent, and due date</div>
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={exportTasksCSV}>Export →</button>
                </div>

                <div className="settings-data-row">
                  <div>
                    <div className="settings-data-label">Clear AI History</div>
                    <div className="settings-data-desc">Delete all AI Brain conversation messages</div>
                  </div>
                  <button className="btn btn--sm"
                    style={{ background:'#FBBF2412', borderColor:'var(--yellow)', color:'var(--yellow)' }}
                    onClick={() => window.confirm('Clear AI history?') && onResetAll('ai')}>
                    Clear
                  </button>
                </div>

                <div className="settings-data-row">
                  <div>
                    <div className="settings-data-label">Reset Task Board</div>
                    <div className="settings-data-desc">Restore all tasks to their default seed data</div>
                  </div>
                  <button className="btn btn--sm"
                    style={{ background:'#FBBF2412', borderColor:'var(--yellow)', color:'var(--yellow)' }}
                    onClick={() => window.confirm('Reset task board to defaults?') && onResetAll('tasks')}>
                    Reset
                  </button>
                </div>

                <div className="settings-data-row" style={{ borderColor:'#EF444430' }}>
                  <div>
                    <div className="settings-data-label" style={{ color:'var(--red)' }}>Reset Everything</div>
                    <div className="settings-data-desc">Wipe all data and restore the full app to default state</div>
                  </div>
                  <button className="btn btn--sm"
                    style={{ background:'#EF444415', borderColor:'var(--red)', color:'var(--red)' }}
                    onClick={handleReset}>
                    Reset All
                  </button>
                </div>
              </div>

              <div style={{ marginTop:24, padding:14, background:'var(--surface2)', borderRadius:'var(--radius)', fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
                <div style={{ fontWeight:600, color:'var(--dim)', marginBottom:4 }}>🔐 Privacy Notes</div>
                <div>• API keys are stored in <code style={{ color:'var(--accent)', fontSize:10 }}>localStorage</code> and sent only to <code style={{ color:'var(--accent)', fontSize:10 }}>localhost:3001</code></div>
                <div>• No data is transmitted to third parties except your chosen AI provider</div>
                <div>• All task, client, and workflow data lives entirely in your browser</div>
              </div>
            </div>
            );
          })()}

        </div>
      </div>
    </section>
  );
}
