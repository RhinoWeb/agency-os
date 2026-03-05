// Central theme — consumed by components that need JS-level color values
// (e.g. Recharts which can't use CSS variables, or dynamic alpha hex combos).
// Static layout styles live in index.css via CSS custom properties.

export const C = {
  accent:  '#00FFB2',
  accent2: '#FF6B35',
  accent3: '#7B61FF',
  accent4: '#00B4D8',
  accent5: '#F472B6',
  bg:      '#06090F',
  surface: '#0D1117',
  surface2:'#161B26',
  surface3:'#1C2333',
  border:  '#1E293B',
  border2: '#2A3548',
  text:    '#E2E8F0',
  dim:     '#94A3B8',
  muted:   '#5A6A7E',
  red:     '#EF4444',
  yellow:  '#FBBF24',
  green:   '#22C55E',
};

export const MONO = "'JetBrains Mono','Fira Code',monospace";
export const SANS = "'DM Sans','Inter',sans-serif";

// ── Color Themes ──────────────────────────────────────────────
// Each theme defines ALL CSS custom properties so switching is clean.
export const THEMES = [
  {
    id: 'neon', name: 'Dark Neon', emoji: '⚡', description: 'Default cyberpunk green',
    preview: ['#06090F', '#00FFB2', '#7B61FF', '#FF6B35'],
    vars: {
      '--accent':'#00FFB2','--accent2':'#FF6B35','--accent3':'#7B61FF','--accent4':'#00B4D8','--accent5':'#F472B6',
      '--bg':'#06090F','--surface':'#0D1117','--surface2':'#161B26','--surface3':'#1C2333',
      '--border':'#1E293B','--border2':'#2A3548',
      '--text':'#E2E8F0','--dim':'#94A3B8','--muted':'#5A6A7E',
    },
  },
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', description: 'Deep indigo & violet',
    preview: ['#080818', '#818CF8', '#60A5FA', '#A78BFA'],
    vars: {
      '--accent':'#818CF8','--accent2':'#A78BFA','--accent3':'#60A5FA','--accent4':'#34D399','--accent5':'#F472B6',
      '--bg':'#080818','--surface':'#0F0F23','--surface2':'#161630','--surface3':'#1E1E3F',
      '--border':'#2D2B55','--border2':'#3D3B70',
      '--text':'#E2E8F0','--dim':'#A5B4FC','--muted':'#6366F1',
    },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲', description: 'Deep emerald & sage',
    preview: ['#071210', '#34D399', '#A78BFA', '#F59E0B'],
    vars: {
      '--accent':'#34D399','--accent2':'#F59E0B','--accent3':'#A78BFA','--accent4':'#60A5FA','--accent5':'#F472B6',
      '--bg':'#071210','--surface':'#0D1F1C','--surface2':'#132B26','--surface3':'#1A3832',
      '--border':'#1E3D35','--border2':'#2A5248',
      '--text':'#D1FAE5','--dim':'#6EE7B7','--muted':'#3D7A6A',
    },
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Warm amber & crimson',
    preview: ['#0F0807', '#F97316', '#FBBF24', '#EF4444'],
    vars: {
      '--accent':'#F97316','--accent2':'#EF4444','--accent3':'#FBBF24','--accent4':'#FB923C','--accent5':'#F472B6',
      '--bg':'#0F0807','--surface':'#1C1008','--surface2':'#261608','--surface3':'#301D0A',
      '--border':'#3D2510','--border2':'#522F12',
      '--text':'#FEF3C7','--dim':'#FCD34D','--muted':'#78401A',
    },
  },
  {
    id: 'arctic', name: 'Arctic', emoji: '❄️', description: 'Cool cyan & ice blue',
    preview: ['#060B0F', '#38BDF8', '#818CF8', '#34D399'],
    vars: {
      '--accent':'#38BDF8','--accent2':'#818CF8','--accent3':'#34D399','--accent4':'#F472B6','--accent5':'#FBBF24',
      '--bg':'#060B0F','--surface':'#0A1520','--surface2':'#0F1E2E','--surface3':'#14273D',
      '--border':'#1A3048','--border2':'#224060',
      '--text':'#E0F2FE','--dim':'#7DD3FC','--muted':'#1E4A6A',
    },
  },
  {
    id: 'rose', name: 'Rose', emoji: '🌸', description: 'Soft pink & coral',
    preview: ['#0F070A', '#F472B6', '#FB923C', '#A78BFA'],
    vars: {
      '--accent':'#F472B6','--accent2':'#FB923C','--accent3':'#A78BFA','--accent4':'#38BDF8','--accent5':'#34D399',
      '--bg':'#0F070A','--surface':'#1C0D14','--surface2':'#26121C','--surface3':'#301825',
      '--border':'#3D1E30','--border2':'#522840',
      '--text':'#FCE7F3','--dim':'#F9A8D4','--muted':'#7A2E50',
    },
  },
];

export const DEFAULT_SETTINGS = {
  // AI
  provider:   'minimax',
  apiKeys:    { minimax: '', openai: '', groq: '', anthropic: '' },
  models:     { minimax: 'MiniMax-Text-01', openai: 'gpt-4o-mini', groq: 'llama-3.3-70b-versatile', anthropic: 'claude-haiku-4-5-20251001' },
  // Appearance
  theme:      'neon',
  fontSize:   'md',
  compactMode: false,
  // Agency
  agencyName: 'My Agency',
  currency:   'USD',
  timezone:   'America/New_York',
  // Notifications
  notifAgents:   true,
  notifClients:  true,
  notifSummary:  false,
};

export const DEFAULT_PROFILE = {
  avatar:    '🦊',
  name:      'Agency Owner',
  title:     'Founder & CEO',
  email:     '',
  bio:       '',
  agencyName:'My Agency',
};

export const PROVIDER_META = {
  minimax:   { label: 'MiniMax',   icon: '⚡', color: '#00FFB2', placeholder: 'sk-api-...',    docsUrl: 'https://www.minimax.io' },
  openai:    { label: 'OpenAI',    icon: '🤖', color: '#10A37F', placeholder: 'sk-...',         docsUrl: 'https://platform.openai.com' },
  groq:      { label: 'Groq',      icon: '🔥', color: '#F55036', placeholder: 'gsk_...',        docsUrl: 'https://console.groq.com' },
  anthropic: { label: 'Anthropic', icon: '🧠', color: '#CC785C', placeholder: 'sk-ant-...',     docsUrl: 'https://console.anthropic.com' },
};
