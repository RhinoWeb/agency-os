// Central theme — consumed by components that need JS-level color values
// (e.g. Recharts which can't use CSS variables, or dynamic alpha hex combos).
// Static layout styles live in index.css via CSS custom properties.

export const C = {
  accent:  '#0066FF',
  accent2: '#3388FF',
  accent3: '#004ACC',
  accent4: '#66AAFF',
  accent5: '#99BBFF',
  bg:      '#000000',
  surface: '#0A0A0A',
  surface2:'#141414',
  surface3:'#1C1C1C',
  border:  '#222222',
  border2: '#333333',
  text:    '#EDEDED',
  dim:     '#999999',
  muted:   '#666666',
  red:     '#FF1744',
  yellow:  '#FF9100',
  green:   '#00C853',
};

export const MONO = "'JetBrains Mono','Fira Code',monospace";
export const SANS = "'Inter','DM Sans',sans-serif";

// ── Color Themes ──────────────────────────────────────────────
// Each theme defines ALL CSS custom properties so switching is clean.
export const THEMES = [
  {
    id: 'precision', name: 'Precision', emoji: '◇', description: 'Clean blue on true black',
    preview: ['#000000', '#0066FF', '#3388FF', '#004ACC'],
    vars: {
      '--accent':'#0066FF','--accent2':'#3388FF','--accent3':'#004ACC','--accent4':'#66AAFF','--accent5':'#99BBFF',
      '--bg':'#000000','--surface':'#0A0A0A','--surface2':'#141414','--surface3':'#1C1C1C',
      '--border':'#222222','--border2':'#333333',
      '--text':'#EDEDED','--dim':'#999999','--muted':'#666666',
    },
  },
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', description: 'Deep indigo & violet',
    preview: ['#050510', '#818CF8', '#60A5FA', '#A78BFA'],
    vars: {
      '--accent':'#818CF8','--accent2':'#A78BFA','--accent3':'#60A5FA','--accent4':'#34D399','--accent5':'#F472B6',
      '--bg':'#050510','--surface':'#0A0A1A','--surface2':'#12122A','--surface3':'#1A1A3A',
      '--border':'#252545','--border2':'#353560',
      '--text':'#E2E8F0','--dim':'#A5B4FC','--muted':'#6366F1',
    },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲', description: 'Deep emerald & sage',
    preview: ['#040E0C', '#34D399', '#A78BFA', '#F59E0B'],
    vars: {
      '--accent':'#34D399','--accent2':'#F59E0B','--accent3':'#A78BFA','--accent4':'#60A5FA','--accent5':'#F472B6',
      '--bg':'#040E0C','--surface':'#0A1A18','--surface2':'#102824','--surface3':'#183630',
      '--border':'#1E3D35','--border2':'#2A5248',
      '--text':'#D1FAE5','--dim':'#6EE7B7','--muted':'#3D7A6A',
    },
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Warm amber & crimson',
    preview: ['#0A0604', '#F97316', '#FBBF24', '#EF4444'],
    vars: {
      '--accent':'#F97316','--accent2':'#EF4444','--accent3':'#FBBF24','--accent4':'#FB923C','--accent5':'#F472B6',
      '--bg':'#0A0604','--surface':'#141008','--surface2':'#1E1808','--surface3':'#28200C',
      '--border':'#3D2510','--border2':'#522F12',
      '--text':'#FEF3C7','--dim':'#FCD34D','--muted':'#78401A',
    },
  },
  {
    id: 'arctic', name: 'Arctic', emoji: '❄️', description: 'Cool cyan & ice blue',
    preview: ['#040810', '#38BDF8', '#818CF8', '#34D399'],
    vars: {
      '--accent':'#38BDF8','--accent2':'#818CF8','--accent3':'#34D399','--accent4':'#F472B6','--accent5':'#FBBF24',
      '--bg':'#040810','--surface':'#0A1420','--surface2':'#101E2E','--surface3':'#18283E',
      '--border':'#1A3048','--border2':'#224060',
      '--text':'#E0F2FE','--dim':'#7DD3FC','--muted':'#1E4A6A',
    },
  },
  {
    id: 'rose', name: 'Rose', emoji: '🌸', description: 'Soft pink & coral',
    preview: ['#0A0508', '#F472B6', '#FB923C', '#A78BFA'],
    vars: {
      '--accent':'#F472B6','--accent2':'#FB923C','--accent3':'#A78BFA','--accent4':'#38BDF8','--accent5':'#34D399',
      '--bg':'#0A0508','--surface':'#140A10','--surface2':'#1E101A','--surface3':'#281824',
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
  theme:      'precision',
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
  // Tool Vault — API keys for all other marketing tools
  toolKeys: {},
};

export const DEFAULT_PROFILE = {
  avatar:    '🦊',
  name:      'Agency Owner',
  title:     'Founder & CEO',
  email:     '',
  bio:       '',
  agencyName:'My Agency',
  role:      '',
};

export const PROVIDER_META = {
  minimax:   { label: 'MiniMax',   icon: '⚡', color: '#0066FF', placeholder: 'sk-api-...',    docsUrl: 'https://www.minimax.io' },
  openai:    { label: 'OpenAI',    icon: '🤖', color: '#10A37F', placeholder: 'sk-...',         docsUrl: 'https://platform.openai.com' },
  groq:      { label: 'Groq',      icon: '🔥', color: '#F55036', placeholder: 'gsk_...',        docsUrl: 'https://console.groq.com' },
  anthropic: { label: 'Anthropic', icon: '🧠', color: '#CC785C', placeholder: 'sk-ant-...',     docsUrl: 'https://console.anthropic.com' },
};
