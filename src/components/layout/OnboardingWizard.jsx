import { useState } from 'react';
import { C } from '../../theme.js';

const STEPS = ['Welcome', 'AI Setup', 'Ready'];

export default function OnboardingWizard({ settings, setSettings, profile, setProfile, onComplete, onResetAll }) {
  const [step,     setStep]     = useState(0);
  const [name,     setName]     = useState(profile.name === 'Agency Owner' ? '' : profile.name);
  const [agency,   setAgency]   = useState(settings.agencyName === 'My Agency' ? '' : settings.agencyName);
  const [provider, setProvider] = useState(settings.provider);
  const [apiKey,   setApiKey]   = useState(settings.apiKeys?.[settings.provider] || '');
  const [cleared,  setCleared]  = useState(false);

  function handleStep1() {
    if (name.trim()) setProfile(p => ({ ...p, name: name.trim() }));
    if (agency.trim()) {
      setSettings(p => ({ ...p, agencyName: agency.trim() }));
      setProfile(p => ({ ...p, agencyName: agency.trim() }));
    }
    setStep(1);
  }

  function handleStep2() {
    if (apiKey.trim()) {
      setSettings(p => ({
        ...p,
        provider,
        apiKeys: { ...p.apiKeys, [provider]: apiKey.trim() },
      }));
    }
    setStep(2);
  }

  function handleClearData() {
    onResetAll('all');
    setCleared(true);
  }

  const PROVIDERS = [
    { id:'minimax',   label:'MiniMax',   color:'#00FFB2', placeholder:'sk-api-...' },
    { id:'openai',    label:'OpenAI',    color:'#10A37F', placeholder:'sk-...' },
    { id:'groq',      label:'Groq',      color:'#F55036', placeholder:'gsk_...' },
    { id:'anthropic', label:'Anthropic', color:'#CC785C', placeholder:'sk-ant-...' },
  ];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(6,9,15,0.92)', backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border2)',
        borderRadius:16, padding:36, maxWidth:480, width:'100%', margin:'0 16px',
      }}>
        {/* Step indicator */}
        <div style={{ display:'flex', gap:6, marginBottom:28, justifyContent:'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{
                width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontFamily:'var(--mono)', fontWeight:700,
                background: i <= step ? C.accent : 'var(--surface2)',
                color:      i <= step ? '#000'    : 'var(--muted)',
                border:     i < step  ? 'none'    : `1px solid ${i === step ? C.accent : 'var(--border)'}`,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:10, fontFamily:'var(--mono)', color: i === step ? 'var(--text)' : 'var(--muted)' }}>{s}</span>
              {i < STEPS.length - 1 && <div style={{ width:24, height:1, background:'var(--border)' }}/>}
            </div>
          ))}
        </div>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>◈</div>
              <h2 style={{ fontSize:22, fontWeight:700, fontFamily:'var(--sans)', marginBottom:8 }}>
                Welcome to Agency OS
              </h2>
              <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>
                Let's set up your workspace. This takes 60 seconds.
              </p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Your Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ryan Shaw"
                  autoFocus
                />
              </div>
              <div>
                <label className="settings-label" style={{ display:'block', marginBottom:4 }}>Agency Name</label>
                <input
                  className="input"
                  value={agency}
                  onChange={e => setAgency(e.target.value)}
                  placeholder="Your Agency"
                />
              </div>
            </div>

            <button
              className="btn btn--primary"
              style={{ width:'100%', marginTop:20 }}
              onClick={handleStep1}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 1: AI Setup */}
        {step === 1 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🧠</div>
              <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--sans)', marginBottom:6 }}>
                Connect an AI Provider
              </h2>
              <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                Agency OS needs at least one AI key to power the AI Brain, Web Browser, and automations.
              </p>
            </div>

            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  style={{
                    flex:1, minWidth:90, padding:'6px 10px', borderRadius:8, cursor:'pointer',
                    border:`1px solid ${provider === p.id ? p.color : 'var(--border)'}`,
                    background: provider === p.id ? `${p.color}12` : 'var(--surface2)',
                    color: provider === p.id ? p.color : 'var(--muted)',
                    fontSize:11, fontFamily:'var(--mono)',
                  }}
                  onClick={() => { setProvider(p.id); setApiKey(''); }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <input
              className="input"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={PROVIDERS.find(p => p.id === provider)?.placeholder ?? 'Paste API key…'}
            />
            <div style={{ fontSize:10, color:'var(--muted)', marginTop:6, fontFamily:'var(--mono)' }}>
              Key is stored locally — never sent anywhere except your local server.
            </div>

            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button className="btn btn--ghost" style={{ flex:1 }} onClick={() => setStep(2)}>
                Skip for now
              </button>
              <button className="btn btn--primary" style={{ flex:1 }} onClick={handleStep2}>
                {apiKey.trim() ? 'Save & Continue →' : 'Skip →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Ready */}
        {step === 2 && (
          <div>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize:40, marginBottom:8 }}>🚀</div>
              <h2 style={{ fontSize:20, fontWeight:700, fontFamily:'var(--sans)', marginBottom:6 }}>
                You're all set!
              </h2>
              <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                Agency OS is loaded with sample data so you can explore every feature. Clear it when you're ready to use your real data.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
              {[
                { icon:'▦', label:'Task Board', desc:'Kanban with subtasks & timers' },
                { icon:'🏢', label:'Client CRM',  desc:'Add & track real clients' },
                { icon:'🧠', label:'AI Brain',    desc:'60 prompts + full context' },
                { icon:'⚡', label:'Workflows',   desc:'Automation pipeline builder' },
              ].map((f, i) => (
                <div key={i} style={{ background:'var(--surface2)', borderRadius:8, padding:'10px 12px' }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{f.icon}</div>
                  <div style={{ fontSize:11, fontWeight:600 }}>{f.label}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>{f.desc}</div>
                </div>
              ))}
            </div>

            {!cleared ? (
              <div style={{ marginBottom:16, padding:12, background:'var(--surface2)', borderRadius:8 }}>
                <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>Clear sample data?</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginBottom:10 }}>
                  This removes all seed clients, tasks, agents, and workflows so you can start fresh.
                </div>
                <button
                  className="btn btn--sm"
                  style={{ background:'#FBBF2412', borderColor:'var(--yellow)', color:'var(--yellow)', width:'100%' }}
                  onClick={handleClearData}
                >
                  Clear sample data & start fresh
                </button>
              </div>
            ) : (
              <div style={{ marginBottom:16, padding:10, background:`${C.accent}12`, borderRadius:8, fontSize:12, color:C.accent, textAlign:'center' }}>
                ✓ Sample data cleared — your workspace is empty and ready.
              </div>
            )}

            <button
              className="btn btn--primary"
              style={{ width:'100%' }}
              onClick={onComplete}
            >
              Open Agency OS →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
