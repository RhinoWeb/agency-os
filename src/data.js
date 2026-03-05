import { C } from './theme.js';

export const seedAgents = [
  { id:1, name:'Content Writer',  status:'active', tasks:12, efficiency:94, icon:'✍️', schedule:'Daily 9AM-5PM',   lastRun:'2m ago',  queue:['Blog post — AI Tools pt.3','Landing page copy'], logs:['Completed blog draft','Submitted for review','Fetched topic research'], automations:3, weeklyData:[82,88,90,87,94,91,94] },
  { id:2, name:'SEO Optimizer',   status:'active', tasks:8,  efficiency:89, icon:'🔍', schedule:'Every 6 hours',   lastRun:'1h ago',  queue:['Keyword gap analysis','Meta tag audit'],          logs:['Ran site crawl','Updated keyword map','Flagged 3 broken links'],  automations:2, weeklyData:[78,80,85,82,87,88,89] },
  { id:3, name:'Social Media Bot',status:'idle',   tasks:5,  efficiency:91, icon:'📱', schedule:'Mon-Fri 10AM',    lastRun:'3h ago',  queue:['Schedule week 11 posts'],                          logs:['Published 5 posts','Engaged 12 comments'],                         automations:4, weeklyData:[85,88,86,90,89,91,91] },
  { id:4, name:'Email Outreach',  status:'active', tasks:15, efficiency:97, icon:'📧', schedule:'Tue/Thu 2PM',     lastRun:'30m ago', queue:['March promo blast','Follow-up sequence B','Welcome drip'], logs:['Sent 240 emails','12% open rate spike','Cleaned bounce list'], automations:5, weeklyData:[90,92,93,95,94,96,97] },
  { id:5, name:'Data Scraper',    status:'paused', tasks:3,  efficiency:85, icon:'🕷️', schedule:'On demand',        lastRun:'1d ago',  queue:['Competitor pricing scan'],                         logs:['Scraped 120 listings','Export to CSV'],                            automations:1, weeklyData:[80,82,78,83,85,84,85] },
  { id:6, name:'Report Generator',status:'active', tasks:7,  efficiency:92, icon:'📊', schedule:'Fri 6PM',          lastRun:'15m ago', queue:['Weekly KPI deck','Client report — Acme'],           logs:['Generated 3 charts','Compiled metrics','PDF exported'],           automations:2, weeklyData:[84,87,88,90,89,91,92] },
];

export const seedColumns = {
  backlog: { title:'BACKLOG',     color:C.muted,   items:[
    { id:'t1',  title:'Redesign client portal UI',          priority:'high',   agent:'Content Writer',   due:'Today',    tags:['design','urgent'], subtasks:[{t:'Wireframe',d:true},{t:'Mockup',d:false},{t:'Dev handoff',d:false}], notes:'Client wants modern look', time:0 },
    { id:'t2',  title:'Q1 analytics report',                priority:'medium', agent:'Report Generator', due:'Tomorrow', tags:['analytics'],       subtasks:[{t:'Pull data',d:true},{t:'Build charts',d:false},{t:'Write insights',d:false}], notes:'', time:45 },
    { id:'t9',  title:'Update pricing page',                priority:'low',    agent:'Content Writer',   due:'Fri',      tags:['website'],          subtasks:[], notes:'Add enterprise tier', time:0 },
    { id:'t11', title:'Competitor landing page teardown',   priority:'medium', agent:'SEO Optimizer',    due:'Next Mon', tags:['research'],         subtasks:[{t:'Screenshot pages',d:false},{t:'Analyze CTAs',d:false}], notes:'Focus on top 3', time:0 },
  ]},
  inProgress: { title:'IN PROGRESS', color:C.accent3, items:[
    { id:'t3',  title:'Blog post series — AI Tools pt.3',   priority:'high',   agent:'Content Writer',  due:'Today', tags:['content','series'], subtasks:[{t:'Outline',d:true},{t:'Draft',d:true},{t:'Edit & images',d:false}], notes:'Part 3 of 5', time:120 },
    { id:'t4',  title:'Competitor keyword analysis',         priority:'medium', agent:'SEO Optimizer',   due:'Today', tags:['seo'],              subtasks:[{t:'Run crawl',d:true},{t:'Gap report',d:false}], notes:'', time:60 },
    { id:'t5',  title:'Email campaign — March promo',        priority:'high',   agent:'Email Outreach',  due:'Wed',   tags:['email','promo'],    subtasks:[{t:'Segment list',d:true},{t:'Write copy',d:true},{t:'Design template',d:false},{t:'A/B test',d:false}], notes:'20% off annual plans', time:90 },
  ]},
  review: { title:'REVIEW', color:C.accent2, items:[
    { id:'t6',  title:'Social calendar — week 10',          priority:'low',    agent:'Social Media Bot', due:'Thu',   tags:['social'],      subtasks:[{t:'Create posts',d:true},{t:'Get approval',d:false}], notes:'LinkedIn focus', time:30 },
    { id:'t10', title:'New client onboarding flow',         priority:'high',   agent:'Email Outreach',   due:'Today', tags:['onboarding'],  subtasks:[{t:'Welcome email',d:true},{t:'Kickoff template',d:true},{t:'Checklist',d:true}], notes:'Test before rollout', time:180 },
  ]},
  done: { title:'DONE', color:C.accent, items:[
    { id:'t7',  title:'Website audit complete',             priority:'low',    agent:'SEO Optimizer',    due:'Done', tags:['audit'],   subtasks:[{t:'Technical SEO',d:true},{t:'Content audit',d:true}], notes:'', time:240 },
    { id:'t8',  title:'Newsletter — Feb edition',           priority:'medium', agent:'Email Outreach',   due:'Done', tags:['email'],   subtasks:[{t:'Write',d:true},{t:'Design',d:true},{t:'Send',d:true}], notes:'28% open rate!', time:150 },
    { id:'t12', title:'Case study — TechFlow',             priority:'medium', agent:'Content Writer',   due:'Done', tags:['content'], subtasks:[{t:'Interview',d:true},{t:'Draft',d:true},{t:'Design',d:true}], notes:'Published to blog', time:300 },
  ]},
};

export const seedSchedule = [
  { time:'08:00', title:'Morning standup',              type:'meeting',   dur:30,  cl:C.yellow  },
  { time:'09:00', title:'Content Writer — Blog batch',  type:'agent',     dur:120, cl:C.accent3 },
  { time:'09:30', title:'Client call — Acme Corp',      type:'meeting',   dur:60,  cl:C.yellow  },
  { time:'11:00', title:'SEO audit review',              type:'task',      dur:45,  cl:C.accent  },
  { time:'12:00', title:'Lunch break',                  type:'break',     dur:60,  cl:C.muted   },
  { time:'13:00', title:'Email Outreach — Campaign',    type:'agent',     dur:30,  cl:C.accent3 },
  { time:'14:00', title:'Strategy & deep work',          type:'deep-work', dur:120, cl:C.accent2 },
  { time:'16:00', title:'Social Bot — Schedule posts',  type:'agent',     dur:45,  cl:C.accent3 },
  { time:'17:00', title:'End-of-day review',            type:'task',      dur:30,  cl:C.accent  },
  { time:'17:30', title:'Report Generator — Weekly',    type:'agent',     dur:30,  cl:C.accent3 },
];

export const seedWorkflows = [
  { id:'w1', name:'Blog → Social → Email Pipeline', status:'active', steps:['Content Writer drafts blog','SEO Optimizer reviews keywords','Social Bot creates posts','Email Outreach adds to newsletter'], trigger:'Manual',                lastRun:'Today 9AM', runs:23,  successRate:96  },
  { id:'w2', name:'Weekly Client Report',            status:'active', steps:['Data Scraper pulls metrics','Report Generator compiles deck','Email Outreach sends to clients'],                            trigger:'Every Friday 5PM',        lastRun:'Last Fri',  runs:12,  successRate:100 },
  { id:'w3', name:'Lead Nurture Sequence',           status:'active', steps:['New lead detected','Welcome email','Wait 3 days — case study','Wait 7 days — offer email'],                              trigger:'New lead signup',          lastRun:'2h ago',    runs:156, successRate:89  },
  { id:'w4', name:'Competitor Monitor',              status:'paused', steps:['Data Scraper checks sites','SEO Optimizer compares keywords','Report Generator creates diff'],                            trigger:'Daily 6AM',               lastRun:'3d ago',    runs:45,  successRate:92  },
  { id:'w5', name:'Content Repurpose Engine',        status:'active', steps:['Blog published trigger','Extract key quotes','Social Bot creates carousel','Social Bot creates thread','Email Outreach adds snippet'], trigger:'On blog publish', lastRun:'Yesterday', runs:8,   successRate:100 },
];

export const seedClients = [
  { id:'c1', name:'Acme Corp',     status:'active',   mrr:12000, health:95, contact:'Sarah Chen',     email:'sarah@acme.io',           since:'Jan 2024', services:['SEO','Content','Email'],          nextMeeting:'Today 9:30AM', notes:'Q2 strategy — wants more video',                     color:C.accent  },
  { id:'c2', name:'TechFlow',      status:'active',   mrr:8500,  health:88, contact:'James Park',     email:'james@techflow.com',      since:'Mar 2024', services:['Content','Social'],               nextMeeting:'Thu 2PM',      notes:'Case study published, upsell social ads',            color:C.accent3 },
  { id:'c3', name:'GreenLeaf',     status:'active',   mrr:6000,  health:72, contact:'Maya Rodriguez', email:'maya@greenleaf.co',       since:'Jun 2024', services:['SEO','Email'],                    nextMeeting:'Fri 11AM',     notes:'Concerned about organic traffic dip',                color:C.green   },
  { id:'c4', name:'Quantum Labs',  status:'active',   mrr:9200,  health:91, contact:'Alex Kim',       email:'alex@quantumlabs.io',     since:'Feb 2024', services:['Content','SEO','Social','Email'], nextMeeting:'Next Tue',     notes:'Full service — very happy, potential referral',      color:C.accent4 },
  { id:'c5', name:'Nova Digital',  status:'pipeline', mrr:0,     health:0,  contact:'Ryan Foster',    email:'ryan@novadigital.co',     since:'—',        services:['Content','SEO'],                  nextMeeting:'Wed 3PM',      notes:'Discovery call scheduled, $7k/mo potential',        color:C.accent5 },
  { id:'c6', name:'UrbanPulse',    status:'pipeline', mrr:0,     health:0,  contact:'Leila Torres',   email:'leila@urbanpulse.com',    since:'—',        services:['Social','Email'],                 nextMeeting:'Next Mon',     notes:'Referred by Acme Corp, warm lead',                  color:C.yellow  },
];

export const seedPages = [
  { id:'p1', title:'Agency SOPs',       icon:'📋', updated:'2h ago', type:'doc',      starred:true,  content:'# Standard Operating Procedures\n\n## Client Onboarding\n1. Discovery call & needs assessment\n2. Proposal & SOW creation\n3. Contract signing\n4. Kickoff meeting\n5. Asset collection\n6. Strategy document\n\n## Content Pipeline\n- Topic research → Outline → Draft → Edit → Publish → Distribute\n- Turnaround: 5 business days per piece\n- QA checklist applied to every piece\n\n## Reporting\n- Weekly KPI snapshots every Friday\n- Monthly deep-dive reports on 1st of month\n- Quarterly strategy reviews with clients' },
  { id:'p2', title:'Client Database',   icon:'🏢', updated:'Today',  type:'database', starred:true,  content:'Active clients: 4 | Pipeline: 2 | Churned Q1: 0\n\nMRR Breakdown:\n- Acme Corp: $12,000/mo (SEO, Content, Email)\n- Quantum Labs: $9,200/mo (Full service)\n- TechFlow: $8,500/mo (Content, Social)\n- GreenLeaf: $6,000/mo (SEO, Email)\n\nPipeline:\n- Nova Digital: ~$7,000/mo potential\n- UrbanPulse: ~$4,500/mo potential' },
  { id:'p3', title:'Content Calendar',  icon:'📅', updated:'1h ago', type:'calendar', starred:false, content:'## March Themes\n- Week 1: AI Productivity Tools (Blog series pt.1-3)\n- Week 2: SaaS Growth Strategies\n- Week 3: Remote Work Culture\n- Week 4: Q1 Wrap-up & Q2 Preview\n\n## Cadence\n- Blog: 3/week (Mon, Wed, Fri)\n- Social: 5 posts/day across platforms\n- Newsletter: Weekly (Thursday)\n- Case study: 1/month' },
  { id:'p4', title:'Brand Guidelines',  icon:'🎨', updated:'3d ago', type:'doc',      starred:false, content:'## Colors\nPrimary: #00FFB2 (Neon Green)\nSecondary: #7B61FF (Electric Purple)\nAccent: #FF6B35 (Warm Orange)\n\n## Typography\nHeadings: DM Sans Bold\nBody: DM Sans Regular\nCode/Data: JetBrains Mono\n\n## Voice & Tone\n- Professional but approachable\n- Data-driven, never fluffy\n- Confident without being arrogant\n- Use concrete examples over abstractions' },
  { id:'p5', title:'Meeting Notes',     icon:'📝', updated:'30m ago',type:'doc',      starred:false, content:'## Acme Corp Sync — Today\n- Discussed Q2 content strategy\n- They want more video content (YouTube + short-form)\n- Budget increase approved: +$2,000/mo for video\n- Action items:\n  • Video proposal by Friday\n  • Demo reel by next Wednesday\n  • Update SOW with new deliverables\n\n## TechFlow Check-in — Yesterday\n- Case study live, they loved it\n- Exploring social ads management\n- Sent proposal for $2,500/mo add-on' },
  { id:'p6', title:'Financial Tracker', icon:'💰', updated:'Today',  type:'database', starred:true,  content:'## Revenue\nMRR: $35,700\nGrowth: +8% MoM\nARR projection: $428,400\n\n## Expenses\nSoftware & tools: $2,800/mo\nAgent compute: $1,200/mo\nContract labor: $4,500/mo\nTotal: $8,500/mo\n\n## Margins\nGross margin: 76%\nNet margin: 54%\nCash reserves: $42,000\n\n## Outstanding\nInvoices pending: $6,400\nOverdue: $0' },
  { id:'p7', title:'Automation Playbook',icon:'⚡', updated:'2d ago', type:'doc',      starred:false, content:'## Active Automations\n\n### Blog Pipeline\nTrigger: New topic approved\nFlow: Content Writer → SEO review → Publish → Social distribution → Email snippet\n\n### Lead Nurture\nTrigger: Form submission\nFlow: Welcome email (instant) → Case study (day 3) → Offer (day 7) → Follow-up (day 14)\n\n### Reporting\nTrigger: Every Friday 5PM\nFlow: Data pull → Chart generation → PDF compile → Client email\n\n## Planned Automations\n- Auto-fix broken links (SEO Optimizer)\n- Competitor alert system (Data Scraper → Slack)\n- Content repurpose engine (Blog → Social → Email)' },
];

export const seedNotifications = [
  { id:1, text:'Email Outreach completed March promo — 240 emails delivered', time:'5m',  type:'success', read:false },
  { id:2, text:'Content Writer finished blog draft — ready for review',        time:'12m', type:'info',    read:false },
  { id:3, text:'SEO Optimizer flagged 3 broken backlinks on /pricing',          time:'30m', type:'warning', read:false },
  { id:4, text:'Lead Nurture workflow triggered for 4 new signups',             time:'1h',  type:'info',    read:false },
  { id:5, text:'Data Scraper paused — rate limit on target',                   time:'2h',  type:'error',   read:true  },
  { id:6, text:'Weekly report auto-sent to 4 clients',                         time:'3h',  type:'success', read:true  },
  { id:7, text:'Acme Corp invoice paid — $12,000',                             time:'4h',  type:'success', read:true  },
  { id:8, text:'Blog post series pt.2 hit 1,200 views',                        time:'6h',  type:'info',    read:true  },
];

export const seedActivity = [
  { time:'17:32', agent:'Report Generator', action:'Exported weekly KPI PDF',              type:'complete' },
  { time:'17:15', agent:'Email Outreach',   action:'Sent 240 emails — March promo campaign', type:'complete' },
  { time:'16:45', agent:'Social Media Bot', action:'Scheduled 15 posts for week 11',       type:'complete' },
  { time:'16:00', agent:'SEO Optimizer',    action:'Flagged 3 broken backlinks',            type:'alert'    },
  { time:'14:30', agent:'Content Writer',   action:'Submitted blog draft for review',       type:'complete' },
  { time:'13:00', agent:'Email Outreach',   action:'Started campaign send sequence',        type:'start'    },
  { time:'11:20', agent:'Data Scraper',     action:'Paused — rate limit reached',           type:'error'    },
  { time:'09:15', agent:'Content Writer',   action:'Started blog post series pt.3',         type:'start'    },
  { time:'09:00', agent:'SEO Optimizer',    action:'Began scheduled site crawl',            type:'start'    },
];

export const revenueData = [
  { month:'Oct', revenue:28400, expenses:7200, profit:21200 },
  { month:'Nov', revenue:30100, expenses:7800, profit:22300 },
  { month:'Dec', revenue:31500, expenses:8000, profit:23500 },
  { month:'Jan', revenue:33000, expenses:8200, profit:24800 },
  { month:'Feb', revenue:34200, expenses:8400, profit:25800 },
  { month:'Mar', revenue:35700, expenses:8500, profit:27200 },
];

export const taskCompletionData = [
  { day:'Mon', completed:6,  created:4 },
  { day:'Tue', completed:8,  created:5 },
  { day:'Wed', completed:5,  created:7 },
  { day:'Thu', completed:9,  created:3 },
  { day:'Fri', completed:11, created:6 },
  { day:'Sat', completed:2,  created:1 },
  { day:'Sun', completed:1,  created:0 },
];
