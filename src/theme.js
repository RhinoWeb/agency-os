// Central theme — consumed by components that need JS-level color values
// (e.g. Recharts which can't use CSS variables, or dynamic alpha hex combos).
// Static layout styles live in index.css via CSS custom properties.

export const C = {
  accent:  '#7B6FE8',
  accent2: '#9389D6',
  accent3: '#5A50C2',
  accent4: '#ADA5D9',
  accent5: '#3E378F',
  bg:      '#09090B',
  surface: '#0F0F12',
  surface2:'#16161D',
  surface3:'#1E1E28',
  border:  '#1F1F2A',
  border2: '#2A2A38',
  text:    '#EDEDEF',
  dim:     '#A0A0AB',
  muted:   '#6B6B7B',
  red:     '#EF6B6B',
  yellow:  '#EAB634',
  green:   '#2FC78E',
};

export const MONO = "'JetBrains Mono','Fira Code',ui-monospace,monospace";
export const SANS = "'Outfit',system-ui,-apple-system,sans-serif";

// ── Color Themes ──────────────────────────────────────────────
// Each theme defines ALL CSS custom properties so switching is clean.
export const THEMES = [
  {
    id: 'obsidian', name: 'Obsidian', emoji: '◇', description: 'Warm indigo on charcoal',
    preview: ['#09090B', '#7B6FE8', '#9389D6', '#5A50C2'],
    vars: {
      '--accent':'#7B6FE8','--accent2':'#9389D6','--accent3':'#5A50C2','--accent4':'#ADA5D9','--accent5':'#3E378F',
      '--bg':'#09090B','--surface':'#0F0F12','--surface2':'#16161D','--surface3':'#1E1E28',
      '--border':'#1F1F2A','--border2':'#2A2A38',
      '--text':'#EDEDEF','--dim':'#A0A0AB','--muted':'#6B6B7B',
    },
  },
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', description: 'Deep indigo & violet',
    preview: ['#080812', '#7780E2', '#5A94E0', '#9980D6'],
    vars: {
      '--accent':'#7780E2','--accent2':'#9980D6','--accent3':'#5A94E0','--accent4':'#2FC78E','--accent5':'#D97AAA',
      '--bg':'#080812','--surface':'#0E0F1C','--surface2':'#15172A','--surface3':'#1C1E36',
      '--border':'#242840','--border2':'#323858',
      '--text':'#E0E2EC','--dim':'#9AA4C4','--muted':'#5C6590',
    },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲', description: 'Deep emerald & sage',
    preview: ['#060D0B', '#2FC78E', '#9980D6', '#E09520'],
    vars: {
      '--accent':'#2FC78E','--accent2':'#52D4A4','--accent3':'#1F9A6C','--accent4':'#5A94E0','--accent5':'#D97AAA',
      '--bg':'#060D0B','--surface':'#0D1816','--surface2':'#132422','--surface3':'#1A302C',
      '--border':'#1F3830','--border2':'#2A4A40',
      '--text':'#D4E8DF','--dim':'#72B898','--muted':'#447060',
    },
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Warm amber & crimson',
    preview: ['#0B0804', '#E56A14', '#EAB634', '#DC4040'],
    vars: {
      '--accent':'#E56A14','--accent2':'#EAB634','--accent3':'#DC4040','--accent4':'#E5842C','--accent5':'#D97AAA',
      '--bg':'#0B0804','--surface':'#140F08','--surface2':'#1D180C','--surface3':'#262010',
      '--border':'#362414','--border2':'#4A3218',
      '--text':'#F0E8DA','--dim':'#C4A87C','--muted':'#745828',
    },
  },
  {
    id: 'arctic', name: 'Arctic', emoji: '❄️', description: 'Cool cyan & ice blue',
    preview: ['#060A12', '#32ADE0', '#7780E2', '#2FC78E'],
    vars: {
      '--accent':'#32ADE0','--accent2':'#6EC4E8','--accent3':'#0D94CC','--accent4':'#D97AAA','--accent5':'#EAB634',
      '--bg':'#060A12','--surface':'#0D1420','--surface2':'#121D2C','--surface3':'#1A2638',
      '--border':'#1C3048','--border2':'#243E5C',
      '--text':'#DCE8F4','--dim':'#6EAED0','--muted':'#285882',
    },
  },
  {
    id: 'rose', name: 'Rose', emoji: '🌸', description: 'Soft pink & coral',
    preview: ['#0B060E', '#D97AAA', '#E5842C', '#9980D6'],
    vars: {
      '--accent':'#D97AAA','--accent2':'#E4A0C0','--accent3':'#CC4A88','--accent4':'#32ADE0','--accent5':'#2FC78E',
      '--bg':'#0B060E','--surface':'#140E18','--surface2':'#1D1624','--surface3':'#261E30',
      '--border':'#361E32','--border2':'#4A2C42',
      '--text':'#F0E2EA','--dim':'#C090B0','--muted':'#743C64',
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
  minimax:   { label: 'MiniMax',   icon: '⚡', color: '#7B6FE8', placeholder: 'sk-api-...',    docsUrl: 'https://www.minimax.io' },
  openai:    { label: 'OpenAI',    icon: '🤖', color: '#0F9474', placeholder: 'sk-...',         docsUrl: 'https://platform.openai.com' },
  groq:      { label: 'Groq',      icon: '🔥', color: '#E04A30', placeholder: 'gsk_...',        docsUrl: 'https://console.groq.com' },
  anthropic: { label: 'Anthropic', icon: '🧠', color: '#B86C50', placeholder: 'sk-ant-...',     docsUrl: 'https://console.anthropic.com' },
};
