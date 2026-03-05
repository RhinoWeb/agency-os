import { useState } from 'react';
import { THEMES, PROVIDER_META, DEFAULT_SETTINGS } from '../theme.js';

const SECTIONS = [
  { id: 'ai',         label: 'AI Integrations', icon: '🤖' },
  { id: 'appearance', label: 'Appearance',       icon: '🎨' },
  { id: 'agency',     label: 'Agency',           icon: '🏢' },
  { id: 'notifs',     label: 'Notifications',    icon: '🔔' },
  { id: 'data',       label: 'Data & Privacy',   icon: '💾' },
];

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
export default function Settings({ settings, setSettings, onResetAll }) {
  const [section, setSection] = useState('ai');
  const [saved,   setSaved]   = useState(false);

  function set(key, value) {
    setSettings(p => ({ ...p, [key]: value }));
  }

  function setApiKey(provider, key) {
    setSettings(p => ({ ...p, apiKeys: { ...p.apiKeys, [provider]: key } }));
  }

  function setModel(provider, model) {
    setSettings(p => ({ ...p, models: { ...p.models, [provider]: model } }));
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
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`settings-nav-item${section === s.id ? ' settings-nav-item--active' : ''}`}
              onClick={() => setSection(s.id)}
              aria-current={section === s.id ? 'page' : undefined}
            >
              <span aria-hidden="true">{s.icon}</span>
              {s.label}
            </button>
          ))}
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
          {section === 'data' && (
            <div>
              <div className="settings-section-title">Data & Privacy</div>
              <p className="settings-section-desc">All data is stored locally in your browser. Nothing leaves your machine.</p>

              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:8 }}>
                <div className="settings-data-row">
                  <div>
                    <div className="settings-data-label">Export Settings</div>
                    <div className="settings-data-desc">Download your current configuration as JSON</div>
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={handleExport}>Export →</button>
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
          )}

        </div>
      </div>
    </section>
  );
}
