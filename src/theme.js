// Central theme — consumed by components that need JS-level color values
// (e.g. Recharts which can't use CSS variables, or dynamic alpha hex combos).
// Static layout styles live in index.css via CSS custom properties.

export const C = {
  accent:  '#7C6AFF',
  accent2: '#9B8AFF',
  accent3: '#5B4CD9',
  accent4: '#B0A4FF',
  accent5: '#3D3599',
  bg:      '#0C0D12',
  surface: '#14161E',
  surface2:'#1B1D27',
  surface3:'#232636',
  border:  '#282C3C',
  border2: '#363B4E',
  text:    '#EAEBF0',
  dim:     '#A2A5B9',
  muted:   '#6E7289',
  red:     '#F87171',
  yellow:  '#FBBF24',
  green:   '#34D399',
};

export const MONO = "'JetBrains Mono','Fira Code',ui-monospace,monospace";
export const SANS = "'Outfit',system-ui,-apple-system,sans-serif";

// ── Color Themes ──────────────────────────────────────────────
// Each theme defines ALL CSS custom properties so switching is clean.
export const THEMES = [
  {
    id: 'obsidian', name: 'Obsidian', emoji: '◇', description: 'Warm indigo on charcoal',
    preview: ['#0C0D12', '#7C6AFF', '#9B8AFF', '#5B4CD9'],
    vars: {
      '--accent':'#7C6AFF','--accent2':'#9B8AFF','--accent3':'#5B4CD9','--accent4':'#B0A4FF','--accent5':'#3D3599',
      '--bg':'#0C0D12','--surface':'#14161E','--surface2':'#1B1D27','--surface3':'#232636',
      '--border':'#282C3C','--border2':'#363B4E',
      '--text':'#EAEBF0','--dim':'#A2A5B9','--muted':'#6E7289',
    },
  },
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', description: 'Deep indigo & violet',
    preview: ['#080814', '#818CF8', '#60A5FA', '#A78BFA'],
    vars: {
      '--accent':'#818CF8','--accent2':'#A78BFA','--accent3':'#60A5FA','--accent4':'#34D399','--accent5':'#F472B6',
      '--bg':'#080814','--surface':'#0E1020','--surface2':'#161A2E','--surface3':'#1E223C',
      '--border':'#282D48','--border2':'#383E60',
      '--text':'#E2E4F0','--dim':'#A5B0D0','--muted':'#6670A0',
    },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲', description: 'Deep emerald & sage',
    preview: ['#060E0C', '#34D399', '#A78BFA', '#F59E0B'],
    vars: {
      '--accent':'#34D399','--accent2':'#5FE8B8','--accent3':'#22A876','--accent4':'#60A5FA','--accent5':'#F472B6',
      '--bg':'#060E0C','--surface':'#0E1A18','--surface2':'#142824','--surface3':'#1C3630',
      '--border':'#223D35','--border2':'#2E5248',
      '--text':'#D8F0E5','--dim':'#7EC8A8','--muted':'#4A7A6A',
    },
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Warm amber & crimson',
    preview: ['#0C0804', '#F97316', '#FBBF24', '#EF4444'],
    vars: {
      '--accent':'#F97316','--accent2':'#FBBF24','--accent3':'#EF4444','--accent4':'#FB923C','--accent5':'#F472B6',
      '--bg':'#0C0804','--surface':'#161008','--surface2':'#201A0C','--surface3':'#2A2210',
      '--border':'#3D2814','--border2':'#523818',
      '--text':'#F8F0E0','--dim':'#D4B88A','--muted':'#806030',
    },
  },
  {
    id: 'arctic', name: 'Arctic', emoji: '❄️', description: 'Cool cyan & ice blue',
    preview: ['#060A14', '#38BDF8', '#818CF8', '#34D399'],
    vars: {
      '--accent':'#38BDF8','--accent2':'#7DD3FC','--accent3':'#0EA5E9','--accent4':'#F472B6','--accent5':'#FBBF24',
      '--bg':'#060A14','--surface':'#0E1624','--surface2':'#142030','--surface3':'#1C2A40',
      '--border':'#1E3450','--border2':'#284468',
      '--text':'#E0F0FE','--dim':'#7DC0E8','--muted':'#2A6090',
    },
  },
  {
    id: 'rose', name: 'Rose', emoji: '🌸', description: 'Soft pink & coral',
    preview: ['#0C0610', '#F472B6', '#FB923C', '#A78BFA'],
    vars: {
      '--accent':'#F472B6','--accent2':'#F9A8D4','--accent3':'#EC4899','--accent4':'#38BDF8','--accent5':'#34D399',
      '--bg':'#0C0610','--surface':'#16101C','--surface2':'#201828','--surface3':'#2A2034',
      '--border':'#3D2238','--border2':'#523048',
      '--text':'#F8E7F0','--dim':'#D0A0C0','--muted':'#804070',
    },
  },
];

export const DEFAULT_SETTINGS = {
  // AI
  provider:   'minimax',
  apiKeys:    { minimax: '', openai: '', groq: '', anthropic: '' },
  models:     { minimax: 'MiniMax-Text-01', openai: 'gpt-4o-mini', groq: 'llama-3.3-70b-versatile', anthropic: 'claude-haiku-4-5-20251001' },
  // Appearance
  theme:      'obsidian',
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
  minimax:   { label: 'MiniMax',   icon: '⚡', color: '#7C6AFF', placeholder: 'sk-api-...',    docsUrl: 'https://www.minimax.io' },
  openai:    { label: 'OpenAI',    icon: '🤖', color: '#10A37F', placeholder: 'sk-...',         docsUrl: 'https://platform.openai.com' },
  groq:      { label: 'Groq',      icon: '🔥', color: '#F55036', placeholder: 'gsk_...',        docsUrl: 'https://console.groq.com' },
  anthropic: { label: 'Anthropic', icon: '🧠', color: '#CC785C', placeholder: 'sk-ant-...',     docsUrl: 'https://console.anthropic.com' },
};
