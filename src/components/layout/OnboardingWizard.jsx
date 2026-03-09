import { useState } from 'react';
import { C, PROVIDER_META } from '../../theme.js';

const STEPS = ['Welcome', 'AI Setup', 'Your Role', 'Ready'];

const ROLES = [
  { id:'freelancer', icon:'💼', label:'Freelancer', desc:'Solo operator managing clients & projects' },
  { id:'agency',     icon:'🏢', label:'Agency',     desc:'Team running multiple client accounts' },
  { id:'brand',      icon:'🚀', label:'Brand',      desc:'In-house marketing & content team' },
  { id:'creator',    icon:'🎨', label:'Creator',    desc:'Content creator or influencer business' },
];

function StepBar({ step }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:30 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display:'flex', alignItems:'center' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{
              width:26, height:26, borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontFamily:'var(--mono)', fontWeight:700,
              background:    i < step ? C.accent : i === step ? `${C.accent}18` : 'var(--surface2)',
              color:         i < step ? '#000'   : i === step ? C.accent      : 'var(--muted)',
              border:        `2px solid ${i <= step ? C.accent : 'var(--border)'}`,
              transition:    'all 0.25s',
              flexShrink:    0,
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontSize:8, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:0.8, color: i === step ? C.accent : 'var(--muted)', whiteSpace:'nowrap' }}>
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ width:32, height:2, background: i < step ? C.accent : 'var(--border)', borderRadius:2, transition:'background 0.3s', margin:'0 4px', marginBottom:14 }}/>
          )}
        </div>
      ))}
    </div>
  );
}

export default function OnboardingWizard({ settings, setSettings, profile, setProfile, onComplete, onResetAll }) {
  const [step,       setStep]       = useState(0);
  const [name,       setName]       = useState(profile.name === 'Agency Owner' ? '' : profile.name);
  const [agency,     setAgency]     = useState(settings.agencyName === 'My Agency' ? '' : settings.agencyName);
  const [provider,   setProvider]   = useState(settings.provider);
  const [apiKey,     setApiKey]     = useState(settings.apiKeys?.[settings.provider] || '');
  const [testing,    setTesting]    = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'ok' | 'fail'
  const [role,       setRole]       = useState(profile.role || '');
  const [startFresh, setStartFresh] = useState(false);

  // ── Handlers ─────────────────────────────────────────────
  function handleStep0(e) {
    e?.preventDefault();
    if (name.trim())   setProfile(p => ({ ...p, name:       name.trim() }));
    if (agency.trim()) {
      setSettings(p => ({ ...p, agencyName: agency.trim() }));
      setProfile(p =>  ({ ...p, agencyName: agency.trim() }));
    }
    setStep(1);
  }

  function handleStep1() {
    if (apiKey.trim()) {
      setSettings(p => ({ ...p, provider, apiKeys: { ...p.apiKeys, [provider]: apiKey.trim() } }));
    }
    setStep(2);
  }

  function handleStep2() {
    if (role) setProfile(p => ({ ...p, role }));
    setStep(3);
  }

  function handleComplete() {
    if (startFresh) onResetAll('all');
    onComplete();
  }

  async function testKey() {
    if (!apiKey.trim() || testing) return;
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch('/api/health');
      setTestResult(r.ok ? 'ok' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  }

  const meta = PROVIDER_META[provider];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(6,9,15,0.95)', backdropFilter:'blur(10px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border2)',
        borderRadius:20, padding:40, maxWidth:500, width:'100%', margin:'0 16px',
        boxShadow:'0 32px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset',
        animation:'fadeIn 0.3s ease',
      }}>
        <StepBar step={step}/>

        {/* ── Step 0: Welcome ──────────────────────────── */}
        {step === 0 && (
          <form onSubmit={handleStep0}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:48, marginBottom:10, lineHeight:1 }}>◈</div>
              <h2 style={{ fontSize:24, fontWeight:700, fontFamily:'var(--sans)', marginBottom:8 }}>
                Welcome to Agency OS
              </h2>
              <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>
                Your AI-powered command centre.<br/>Let's get you set up in 60 seconds.
              </p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Your Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Chen"
                  autoFocus
                />
              </div>
              <div>
                <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Agency / Business Name</label>
                <input
                  className="input"
                  value={agency}
                  onChange={e => setAgency(e.target.value)}
                  placeholder="Growth Studio"
                />
              </div>
            </div>

            <p style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:10, textAlign:'center' }}>
              You can change these any time in Profile & Settings
            </p>

            <button type="submit" className="btn btn--primary" style={{ width:'100%', marginTop:20 }}>
              Continue →
            </button>
          </form>
        )}

        {/* ── Step 1: AI Setup ─────────────────────────── */}
        {step === 1 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:42, marginBottom:8 }}>🧠</div>
              <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--sans)', marginBottom:6 }}>
                Connect an AI Provider
              </h2>
              <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                Powers the AI Brain, autopilot briefings, and campaign generation.
              </p>
            </div>

            {/* Provider picker */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:14 }}>
              {Object.entries(PROVIDER_META).map(([id, m]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setProvider(id); setApiKey(''); setTestResult(null); }}
                  style={{
                    padding:'10px 12px', borderRadius:10, cursor:'pointer', textAlign:'left',
                    border:`1px solid ${provider === id ? m.color : 'var(--border)'}`,
                    background: provider === id ? `${m.color}10` : 'var(--surface2)',
                    transition:'all 0.15s',
                  }}
                >
                  <span style={{ fontSize:18 }}>{m.icon}</span>
                  <span style={{ fontSize:11, fontFamily:'var(--mono)', color: provider === id ? m.color : 'var(--muted)', marginLeft:8 }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Key input + test button */}
            <div style={{ position:'relative' }}>
              <input
                className="input"
                type="password"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                placeholder={meta?.placeholder ?? 'Paste API key…'}
                style={{ paddingRight:76 }}
              />
              <button
                type="button"
                onClick={testKey}
                disabled={!apiKey.trim() || testing}
                style={{
                  position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
                  padding:'3px 10px', borderRadius:5, fontSize:9, fontFamily:'var(--mono)',
                  border:`1px solid ${testResult === 'ok' ? C.green : testResult === 'fail' ? C.red : 'var(--border)'}`,
                  background: testResult === 'ok' ? `${C.green}15` : testResult === 'fail' ? `${C.red}15` : 'var(--surface2)',
                  color: testResult === 'ok' ? C.green : testResult === 'fail' ? C.red : 'var(--muted)',
                  cursor: !apiKey.trim() || testing ? 'not-allowed' : 'pointer',
                  opacity: !apiKey.trim() ? 0.4 : 1,
                }}
              >
                {testing ? '···' : testResult === 'ok' ? '✓ OK' : testResult === 'fail' ? '✗ Fail' : 'Test'}
              </button>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
              <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)' }}>
                Stored locally — never sent to our servers.
              </span>
              {meta?.docsUrl && (
                <a
                  href={meta.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize:10, color: meta.color, fontFamily:'var(--mono)', textDecoration:'none' }}
                >
                  Get API key ↗
                </a>
              )}
            </div>

            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button className="btn btn--ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn--ghost" style={{ flex:1 }} onClick={() => setStep(2)}>Skip</button>
              <button className="btn btn--primary" style={{ flex:2 }} onClick={handleStep1}>
                {apiKey.trim() ? 'Save & Continue →' : 'Skip →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Role ─────────────────────────────── */}
        {step === 2 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:42, marginBottom:8 }}>🎯</div>
              <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--sans)', marginBottom:6 }}>
                How do you use Agency OS?
              </h2>
              <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                We'll personalise your dashboard and recommendations.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    padding:'14px', borderRadius:12, cursor:'pointer', textAlign:'left',
                    border:`2px solid ${role === r.id ? C.accent : 'var(--border)'}`,
                    background: role === r.id ? `${C.accent}08` : 'var(--surface2)',
                    transition:'all 0.15s',
                  }}
                >
                  <div style={{ fontSize:24, marginBottom:6 }}>{r.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:3, color: role === r.id ? C.accent : 'var(--text)' }}>{r.label}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', lineHeight:1.5 }}>{r.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn--primary" style={{ flex:1 }} onClick={handleStep2}>
                {role ? 'Continue →' : 'Skip →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Ready ────────────────────────────── */}
        {step === 3 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🚀</div>
              <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--sans)', marginBottom:6 }}>
                {name.trim() ? `You're all set, ${name.trim().split(' ')[0]}!` : "You're all set!"}
              </h2>
              <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                Here's what we configured:
              </p>
            </div>

            {/* Summary checklist */}
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:20 }}>
              {[
                {
                  done: !!(name.trim() || agency.trim()),
                  label: `Workspace: ${agency.trim() || name.trim() || 'Agency OS'}`,
                },
                {
                  done: !!(Object.values(settings.apiKeys ?? {}).some(k => k?.trim()) || apiKey.trim()),
                  label: `AI: ${PROVIDER_META[provider]?.label ?? provider} ${apiKey.trim() ? 'connected' : 'not set — add later in Settings'}`,
                },
                {
                  done: !!role,
                  label: role ? `Role: ${ROLES.find(r => r.id === role)?.label}` : 'Role: skipped',
                },
              ].map((item, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                  borderRadius:8, background:'var(--surface2)', fontSize:12,
                }}>
                  <span style={{
                    width:20, height:20, borderRadius:'50%', flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:10, fontWeight:700,
                    background: item.done ? `${C.accent}20` : 'var(--surface3)',
                    border:`1px solid ${item.done ? C.accent : 'var(--border)'}`,
                    color: item.done ? C.accent : 'var(--muted)',
                  }}>
                    {item.done ? '✓' : '—'}
                  </span>
                  <span style={{ color: item.done ? 'var(--text)' : 'var(--muted)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Sample data toggle */}
            <div style={{ padding:14, background:'var(--surface2)', borderRadius:10, marginBottom:16, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>
                    {startFresh ? 'Start with empty workspace' : 'Start with sample data'}
                  </div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>
                    {startFresh
                      ? 'Clean slate — add your own clients, tasks, and leads'
                      : 'Explore with pre-loaded clients, tasks, leads, and agents'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStartFresh(p => !p)}
                  aria-label="Toggle sample data"
                  style={{
                    width:44, height:24, borderRadius:12, cursor:'pointer', flexShrink:0,
                    background: startFresh ? 'var(--surface3)' : C.accent,
                    border:'1px solid var(--border)', position:'relative', transition:'background 0.2s',
                  }}
                >
                  <span style={{
                    position:'absolute', top:3, left: startFresh ? 3 : 23,
                    width:16, height:16, borderRadius:'50%', background:'#fff',
                    transition:'left 0.2s', display:'block',
                  }}/>
                </button>
              </div>
            </div>

            <button
              className="btn btn--primary"
              style={{ width:'100%' }}
              onClick={handleComplete}
            >
              Open Agency OS →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
