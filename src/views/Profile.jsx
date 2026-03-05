import { useState } from 'react';
import { ProgressBar } from '../components/ui/index.jsx';
import { C } from '../theme.js';

const AVATARS = ['🦊','🐺','🦁','🐯','🦅','🦋','🐉','🌊','⚡','🌙','🔮','💎','🚀','🎯','🎪','🏆','👾','🤖','🎨','🌟','🦄','🐙','🌈','🔥','💡','🎭','🃏','🌺','🦩','🦚'];

export default function Profile({ profile, setProfile, agents, clients, allTasks, mrr }) {
  const [pickingAvatar, setPickingAvatar] = useState(false);

  function set(k, v) { setProfile(p => ({ ...p, [k]: v })); }

  const activeClients = clients.filter(c => c.status === 'active');
  const avgHealth     = activeClients.length
    ? Math.round(activeClients.reduce((s, c) => s + c.health, 0) / activeClients.length)
    : 0;
  const fleetEff = agents.length
    ? Math.round(agents.reduce((s, a) => s + a.efficiency, 0) / agents.length)
    : 0;
  const doneTasks = allTasks.filter(t => t.priority === 'high').length;

  return (
    <section className="view" style={{ maxWidth: 800 }} aria-labelledby="profile-title">
      <header style={{ marginBottom: 28 }}>
        <h1 id="profile-title" className="view-title">Profile</h1>
        <p className="view-subtitle">Your personal workspace identity</p>
      </header>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:20 }}>
        {/* Left — Identity card */}
        <div>
          <div className="card" style={{ textAlign:'center', padding:28 }}>
            {/* Avatar */}
            <div
              className="profile-avatar"
              onClick={() => setPickingAvatar(p => !p)}
              role="button"
              tabIndex={0}
              aria-label="Change avatar"
              aria-expanded={pickingAvatar}
              onKeyDown={e => (e.key==='Enter'||e.key===' ') && setPickingAvatar(p=>!p)}
            >
              <span style={{ fontSize: 52 }}>{profile.avatar}</span>
              <div className="profile-avatar__hint">click to change</div>
            </div>

            {/* Avatar picker */}
            {pickingAvatar && (
              <div className="avatar-picker" role="grid" aria-label="Choose avatar">
                {AVATARS.map(a => (
                  <button
                    key={a}
                    className={`avatar-option${profile.avatar === a ? ' avatar-option--active' : ''}`}
                    onClick={() => { set('avatar', a); setPickingAvatar(false); }}
                    aria-label={`Avatar ${a}`}
                    role="gridcell"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700, fontFamily: 'var(--sans)' }}>
              {profile.name || 'Your Name'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {profile.title || 'Agency Owner'}
            </div>
            {profile.agencyName && (
              <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, fontFamily: 'var(--mono)' }}>
                ◈ {profile.agencyName}
              </div>
            )}
          </div>

          {/* Agency stats */}
          <div className="card" style={{ marginTop: 14 }}>
            <div className="section-label mb-12">Agency Stats</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'MRR',           value:`$${(mrr/1000).toFixed(1)}k`,                 color:C.accent,  pct: Math.min(100, (mrr/50000)*100) },
                { label:'Fleet Eff.',    value:`${fleetEff}%`,                               color:C.accent3, pct: fleetEff },
                { label:'Client Health', value:`${avgHealth}%`,                              color:avgHealth>=85?C.accent:avgHealth>=70?C.yellow:C.red, pct: avgHealth },
                { label:'High Priority', value:`${doneTasks} tasks`,                         color:C.accent2, pct: Math.min(100, (doneTasks/10)*100) },
                { label:'Active Agents', value:`${agents.filter(a=>a.status==='active').length}/${agents.length}`, color:C.green, pct: (agents.filter(a=>a.status==='active').length/agents.length)*100 },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1 }}>{s.label}</span>
                    <span style={{ fontSize:11, fontWeight:700, fontFamily:'var(--mono)', color:s.color }}>{s.value}</span>
                  </div>
                  <ProgressBar value={s.pct} color={s.color} height={3}/>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Edit form */}
        <div className="card" style={{ padding:24 }}>
          <div className="section-label mb-16">Edit Profile</div>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label className="settings-label" htmlFor="prof-name">Display Name</label>
              <input id="prof-name" className="input" value={profile.name}
                onChange={e => set('name', e.target.value)} placeholder="Your name"/>
            </div>

            <div>
              <label className="settings-label" htmlFor="prof-title">Role / Title</label>
              <input id="prof-title" className="input" value={profile.title}
                onChange={e => set('title', e.target.value)} placeholder="Founder & CEO"/>
            </div>

            <div>
              <label className="settings-label" htmlFor="prof-agency">Agency Name</label>
              <input id="prof-agency" className="input" value={profile.agencyName}
                onChange={e => set('agencyName', e.target.value)} placeholder="My Agency"/>
            </div>

            <div>
              <label className="settings-label" htmlFor="prof-email">Email</label>
              <input id="prof-email" className="input" type="email" value={profile.email}
                onChange={e => set('email', e.target.value)} placeholder="you@agency.com"/>
            </div>

            <div>
              <label className="settings-label" htmlFor="prof-bio">Bio</label>
              <textarea id="prof-bio" className="input" rows={4} value={profile.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="A short bio about you and your agency..."
                style={{ resize:'vertical', lineHeight:1.6 }}/>
            </div>

            <button
              className="btn btn--primary"
              onClick={() => {}}
              style={{ alignSelf:'flex-start' }}
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
