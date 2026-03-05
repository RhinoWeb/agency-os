import { useState, useRef, useEffect } from 'react';

// ── 50 Prompt Library ──────────────────────────────────────
const CATEGORIES = [
  {
    id: 'growth', label: 'Growth', icon: '🚀', color: '#00FFB2',
    prompts: [
      { icon:'🎯', title:'Top upsell opportunities',   desc:'Find hidden revenue in existing accounts',      text:'Looking at our active clients and their current services, identify the top 3 upsell opportunities right now. Which clients are underserved, what additional services would deliver the most value, and what is the potential MRR increase for each?' },
      { icon:'📞', title:'Who to call today',           desc:'Prioritize your pipeline outreach',             text:'Based on our pipeline clients and their scheduled meetings, which prospect should I prioritize contacting today? Give me their background, likely objections, and 5 talking points I should prepare.' },
      { icon:'✉️', title:'Discovery call follow-up',   desc:'Write a winning follow-up email',               text:'Write a compelling follow-up email for Nova Digital ahead of our Wednesday discovery call. Reference their interest in Content and SEO, position our AI-powered workflow as a differentiator over hiring in-house, and include a clear next step.' },
      { icon:'🏆', title:'Case study pitch match',      desc:'Match our proof to prospect pain points',       text:'Which of our completed case studies would be most compelling for closing UrbanPulse? Write a 3-bullet pitch using our specific results, and explain why this proof point will resonate with their situation.' },
      { icon:'📋', title:'New client proposal',         desc:'Draft a $10k/mo engagement outline',            text:'Create a professional agency proposal outline for a new $10,000/mo full-service client. Include scope, deliverables, which agents handle what, and clear 30/60/90 day milestones with measurable outcomes.' },
      { icon:'⚠️', title:'Churn risk deep dive',        desc:'Save at-risk clients before it is too late',   text:'GreenLeaf is at 72% health and expressed concern about organic traffic. Give me a full diagnosis: what likely caused the dip, what are the warning signs of churn, and give me a concrete 3-step re-engagement plan to execute this week.' },
      { icon:'🤝', title:'Referral ask strategy',       desc:'Turn happy clients into a lead source',         text:'Acme Corp is at 95% health and just approved a budget increase. Write me a natural, non-pushy referral ask I can make on our next call, plus a referral incentive idea that feels generous without cutting into margins.' },
      { icon:'🌱', title:'New niche targets',           desc:'Expand into high-value verticals',              text:'Based on our current service mix (SEO, Content, Social, Email) and existing client types, identify 5 new industry niches we should target next quarter. For each, explain our competitive edge and what the first outreach move should be.' },
      { icon:'⚔️', title:'Handle the in-house objection', desc:'Win the "we could just hire someone" debate', text:'Write 5 sharp, confident responses to the objection: "We are thinking of hiring someone in-house instead." Frame our AI-powered agency model as faster, more scalable, and more cost-effective than a single full-time hire.' },
      { icon:'🌊', title:'Cold outreach sequence',      desc:'3-email campaign for SaaS prospects',           text:'Write a cold outreach email sequence (3 emails: intro, value follow-up, breakup) targeting SaaS companies between $1M-$10M ARR who need content and SEO. Keep each email under 150 words, specific, and focused on measurable ROI.' },
    ],
  },
  {
    id: 'ops', label: 'Operations', icon: '⚙️', color: '#7B61FF',
    prompts: [
      { icon:'🚧', title:'Scaling bottlenecks',         desc:'What is blocking $50k MRR',                    text:'What are the top 3 operational bottlenecks preventing us from scaling from $35.7k to $50k MRR? For each bottleneck, give a specific, actionable fix I can implement within the next 30 days.' },
      { icon:'🤖', title:'Agent vs human audit',        desc:'Optimize what gets automated',                  text:'Looking at our current agents and task board, which tasks are still handled manually that should be automated? Prioritize 5 automations to build next, with an estimate of weekly hours saved per automation.' },
      { icon:'📖', title:'Client onboarding SOP',       desc:'Build a repeatable intake process',             text:'Create a detailed Standard Operating Procedure for onboarding a new client. Include every step from contract signing to first deliverable, which agent or human handles each step, and the expected timeline for each milestone.' },
      { icon:'👥', title:'First hire decision',         desc:'Who to bring on and when',                      text:'Based on our current revenue ($35.7k MRR), net margin (54%), and operational load, advise me on when and who to hire first. What role delivers the highest leverage? Include a sample job description and what success looks like in 90 days.' },
      { icon:'📊', title:'Backlog by revenue impact',   desc:'Rank tasks by what moves the needle most',      text:'Review every task in our backlog and re-rank them by business impact. For each of the top 5, explain the revenue or retention risk if it is delayed, and which agent should own it.' },
      { icon:'⚡', title:'Underutilized agent audit',   desc:'Get more from your AI workforce',               text:'Analyze each agent\'s efficiency score and queue depth. Which agents have capacity? For each underutilized agent, suggest 3 specific new tasks or automations it should take on immediately to increase its contribution.' },
      { icon:'🗺️', title:'Full delivery workflow map', desc:'Visualize the entire client journey',           text:'Map the complete end-to-end workflow for our blog → social → email pipeline. Include every handoff point between agents, quality checkpoints, client approval gates, and how long each stage should take.' },
      { icon:'🔍', title:'Find the #1 constraint',      desc:'Theory of Constraints applied to your agency', text:'Apply the Theory of Constraints to our agency operations. Identify the single bottleneck that is limiting our total output right now. How is it affecting throughput? Give me a focused 30-day plan to eliminate it.' },
      { icon:'🛣️', title:'90-day ops roadmap',         desc:'Systems, people, and processes',                text:'Build a 90-day operations improvement roadmap. Break it into weekly sprints: which systems to build, which processes to document, and which automations to activate. Prioritize by leverage and effort required.' },
      { icon:'📏', title:'Agency health scorecard',     desc:'Build your weekly ops review framework',        text:'Design a weekly agency health scorecard with 10 KPIs I should review every Monday. Include agent performance metrics, client health indicators, revenue signals, and operational efficiency measures. Give me thresholds for green/yellow/red.' },
    ],
  },
  {
    id: 'daily', label: 'Daily', icon: '📅', color: '#00B4D8',
    prompts: [
      { icon:'☀️', title:'Ideal weekly schedule',       desc:'Design your perfect agency week',               text:'Design my ideal weekly schedule as an agency owner at our current stage ($35.7k MRR, 4 active clients, 6 agents). Balance sales activities, client delivery oversight, deep work, and strategic thinking. Be specific with time blocks.' },
      { icon:'🚫', title:'Cut calendar waste',          desc:'Reclaim hours from low-value commitments',      text:'Looking at our schedule (standups, client calls, agent runs), which recurring meetings or events could be eliminated, shortened, or made async? Calculate the total hours per week I could reclaim and what I should do with that time.' },
      { icon:'🧠', title:'Deep work system',            desc:'Protect your most creative hours',              text:'Help me design a deep work system for the next 30 days. Identify the best time slots based on my schedule, what I should work on during deep work, and specific tactics to protect those blocks from interruptions.' },
      { icon:'❌', title:'Stop-doing list',             desc:'Identify your biggest time drains',             text:'Based on our task board and current schedule, what should I completely stop doing as the agency owner? Give me a "stop-doing list" with 7 specific activities, and for each, assign it to an agent, delegate it to a future hire, or eliminate it entirely.' },
      { icon:'🌅', title:'Monday morning ritual',       desc:'Start every week with momentum',                text:'Design a 60-minute Monday morning ritual that sets up my whole week for success. Include: agent status check, client health review, top 3 priority selection, and a mental preparation practice. Make it a repeatable system.' },
      { icon:'📞', title:'This week\'s client calls',   desc:'Know who needs attention and why',              text:'Based on client health scores and next scheduled meetings, which clients need a proactive check-in this week? For each, give me the key agenda item, what outcome I want, and one piece of data I should pull from our agents before the call.' },
      { icon:'🎯', title:'The one thing today',         desc:'Your single highest-leverage move',             text:'Based on our full task board, agent status, client health scores, and pipeline, what is the single most important thing I should accomplish today? Give me one clear outcome with your reasoning and how long it should take.' },
      { icon:'⏱️', title:'5-day time block plan',       desc:'Map every hour of your work week',              text:'Create a detailed time-blocked plan for my work week (Monday to Friday). Allocate specific hours for: client work, agent oversight, sales outreach, content creation, strategy, admin, and recovery. Be realistic about energy levels.' },
      { icon:'⚖️', title:'Sales vs delivery balance',  desc:'Split your time for maximum growth',            text:'How should I divide my time between sales/business development and client delivery oversight at our current stage? Give me specific percentages, weekly hour targets, and what happens to growth if I get this ratio wrong.' },
      { icon:'🔋', title:'Energy management plan',      desc:'Peak performance every day',                   text:'Design an energy management plan for my work week that aligns high-energy periods with my most important work (sales calls, creative strategy, client calls) and protects recovery time. Include morning, afternoon, and evening routines.' },
    ],
  },
  {
    id: 'marketing', label: 'Marketing', icon: '📣', color: '#FF6B35',
    prompts: [
      { icon:'💼', title:'LinkedIn post ideas',         desc:'Showcase wins to attract dream clients',        text:'Write 5 LinkedIn post ideas based on our recent client wins and our AI-powered agency model. Each post should attract SaaS founders and marketing directors. Include a strong hook, the core insight, and a CTA that starts a conversation.' },
      { icon:'🗓️', title:'30-day content calendar',    desc:'Plan a full month of agency brand content',     text:'Build a complete 30-day content calendar for our agency brand. Include post topics, content types (carousel, text post, short video), publishing platforms, and how each piece drives awareness with our ideal clients. Root it in our real case studies.' },
      { icon:'📈', title:'Best content analysis',       desc:'Double down on what actually works',            text:'We publish 3 blogs/week, 5 social posts/day, and a weekly newsletter. Which content types are most likely to drive inbound leads for an agency like ours at this stage? What should we produce more of, and what should we scale back or cut?' },
      { icon:'📰', title:'This week\'s newsletter',     desc:'Draft an edition that wins replies',            text:'Draft this week\'s agency newsletter. Use our recent work as source material: TechFlow case study, AI Tools blog series, March email campaign results. Make it valuable enough that a cold prospect would want to reply. End with one clear CTA.' },
      { icon:'✍️', title:'10 blog post ideas',          desc:'SEO content that attracts ideal clients',       text:'Generate 10 blog post ideas that would attract our ideal clients (SaaS companies, growth-stage startups). Each idea should showcase our AI-powered workflow, include a keyword angle, and position us as thought leaders in our space.' },
      { icon:'🏅', title:'TechFlow case study',         desc:'Turn results into your best sales asset',       text:'Write a detailed case study outline using TechFlow as the subject, structured to maximize sales impact. Include: the before state, our AI-powered solution, specific results achieved, client quote placeholder, and a strong CTA for prospects.' },
      { icon:'🥊', title:'Agency vs in-house content',  desc:'The definitive comparison piece',               text:'Create a compelling, detailed comparison of "hire our agency vs hire in-house." Address cost, speed, capability breadth, scalability, and risk. Make our AI-powered model the obvious winner for companies between $1M-$20M in revenue.' },
      { icon:'🐦', title:'AI workflow Twitter thread',  desc:'Go viral with your behind-the-scenes story',   text:'Write a Twitter/X thread (10-12 tweets) revealing how we use AI agents to run an entire marketing agency. Make it educational and specific with real numbers. Build tension through the story and end with a soft pitch and clear follow CTA.' },
      { icon:'🧲', title:'Lead magnet concept',         desc:'Your best top-of-funnel asset idea',            text:'What is the single best lead magnet we could create right now to attract potential clients? Describe the concept in detail, what it would contain, how we distribute it, and what the follow-up email sequence looks like after someone downloads it.' },
      { icon:'📢', title:'Ad headline pack',            desc:'10 copy variations ready to test',              text:'Write 10 compelling ad headlines for our content marketing retainer package targeting SaaS companies. Cover angles: ROI, speed to results, AI differentiation, and social proof. Format each for Google Search and Meta Feed ads, with a matching description.' },
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: '💰', color: '#FBBF24',
    prompts: [
      { icon:'🏔️', title:'Path to $100k MRR',          desc:'Map the exact route to 6-figure revenue',      text:'Map our exact path from $35.7k MRR to $100k MRR. How many clients do we need, at what price points, in what timeframe? What are the critical milestones, what changes operationally at each stage, and what is the #1 risk to this plan?' },
      { icon:'💎', title:'Highest-margin service',       desc:'Find your most profitable offering',            text:'Analyze our service mix (SEO, Content, Social, Email) and current client contracts. Which service or package combination delivers the highest gross margin? What should we prioritize selling, and what should we quietly phase out or raise the price on?' },
      { icon:'💲', title:'Raise prices now?',            desc:'Strategic pricing analysis and rollout plan',   text:'Given our client health scores (avg 86.5%), 8% MoM growth, and strong case studies, should I raise prices? If yes, by how much, on which services, and for which clients? Give me a specific rollout plan that minimizes churn risk.' },
      { icon:'📉', title:'GreenLeaf ROI report',        desc:'Prove value before Friday\'s call',             text:'Build a clear ROI report I can present to GreenLeaf (72% health, $6k/mo, SEO + Email services) before our Friday call. Quantify what our services are worth to them, reframe the relationship around business outcomes, and come with a retention offer.' },
      { icon:'📦', title:'Grow ACV by 30%',             desc:'More revenue without any new clients',          text:'Give me a concrete strategy to increase our average contract value by 30% within 90 days without signing new clients. Include bundling ideas, specific add-on services for each active client, and word-for-word upsell conversation starters.' },
      { icon:'🔮', title:'Q2 revenue forecast',         desc:'Best, base, and worst case scenarios',          text:'Build a Q2 revenue forecast with three scenarios. Base: current trajectory. Best: Nova Digital + UrbanPulse both close. Worst: GreenLeaf churns. For each scenario show the MRR impact, cash position, and the one leading indicator I should track weekly.' },
      { icon:'🧾', title:'True cost per client',        desc:'Know exactly what each account really costs',   text:'Break down what it costs to service each of our 4 active clients per month. Allocate our expenses (agent compute $1,200, software $2,800, labor $4,500) proportionally. Which client is most profitable? Which is barely worth it?' },
      { icon:'✂️', title:'Expense optimization audit',  desc:'Find cash without cutting quality',             text:'Review our monthly expenses (software $2,800, agent compute $1,200, labor $4,500). For each category, give me 3 specific questions to audit whether we are getting full value. What is the likely saving opportunity across all three categories?' },
      { icon:'📝', title:'Retainer vs project pricing', desc:'Structure deals for max recurring revenue',     text:'When should I offer retainer pricing vs project-based pricing? How do I convert a project client into a retainer relationship? Include sample pricing tiers for our service mix and a script for the pricing conversation.' },
      { icon:'🤝', title:'Partner or investor pitch',   desc:'1-page financial summary for a strategic partner', text:'Create a compelling 1-page financial summary of our agency for a potential strategic partner or investor conversation. Include MRR, growth rate, margins, client concentration risk, agent infrastructure value, and the 12-month opportunity.' },
    ],
  },
];

const ALL_PROMPTS = CATEGORIES.flatMap(c => c.prompts.map(p => ({ ...p, catId: c.id })));

// ── Prompt Library Component ───────────────────────────────
function PromptLibrary({ onSelect, disabled }) {
  const [open,   setOpen]   = useState(false);
  const [catId,  setCatId]  = useState('growth');
  const [search, setSearch] = useState('');

  const activeCat = CATEGORIES.find(c => c.id === catId);

  const visible = search.trim()
    ? ALL_PROMPTS.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.desc.toLowerCase().includes(search.toLowerCase())
      )
    : activeCat.prompts;

  function handleSelect(p) {
    onSelect(p.text);
    setOpen(false);
    setSearch('');
  }

  function shuffle() {
    const p = ALL_PROMPTS[Math.floor(Math.random() * ALL_PROMPTS.length)];
    onSelect(p.text);
    setOpen(false);
  }

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Toggle bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button
          className="prompt-lib-toggle"
          onClick={() => setOpen(p => !p)}
          aria-expanded={open}
          aria-controls="prompt-library"
          disabled={disabled}
        >
          <span aria-hidden="true" style={{ fontSize:14 }}>✦</span>
          50 Prompts
          <span style={{ marginLeft:'auto', fontSize:11, opacity:0.6 }}>{open ? '▲' : '▼'}</span>
        </button>
        <button
          className="btn btn--ghost btn--sm prompt-shuffle"
          onClick={shuffle}
          disabled={disabled}
          title="Random prompt"
          aria-label="Send a random prompt"
        >
          ⟳ Shuffle
        </button>
      </div>

      {/* Library panel */}
      {open && (
        <div id="prompt-library" className="prompt-library" role="region" aria-label="Prompt library">
          {/* Search */}
          <div className="prompt-search-wrap">
            <span aria-hidden="true" style={{ color:'var(--muted)' }}>🔍</span>
            <input
              className="prompt-search"
              placeholder="Search 50 prompts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search prompts"
            />
            {search && (
              <button
                style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:14 }}
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >×</button>
            )}
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="prompt-cats" role="tablist" aria-label="Prompt categories">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className="prompt-cat-tab"
                  role="tab"
                  aria-selected={catId === c.id}
                  style={catId === c.id ? { borderColor: c.color, color: c.color, background: `${c.color}10` } : {}}
                  onClick={() => setCatId(c.id)}
                >
                  <span aria-hidden="true">{c.icon}</span>
                  {c.label}
                  <span className="prompt-cat-count">{c.prompts.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Prompt grid */}
          <div
            className="prompt-grid"
            role="tabpanel"
            aria-label={search ? 'Search results' : activeCat.label}
          >
            {visible.map((p, i) => {
              const cat = search ? CATEGORIES.find(c => c.id === p.catId) : activeCat;
              return (
                <button
                  key={i}
                  className="prompt-card"
                  onClick={() => handleSelect(p)}
                  disabled={disabled}
                  aria-label={`Send prompt: ${p.title}`}
                  title={p.text.slice(0, 120) + '…'}
                >
                  <div className="prompt-card__icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                    {p.icon}
                  </div>
                  <div className="prompt-card__body">
                    <div className="prompt-card__title">{p.title}</div>
                    <div className="prompt-card__desc">{p.desc}</div>
                  </div>
                  {search && (
                    <span className="prompt-card__cat" style={{ color: cat.color }}>
                      {cat.icon}
                    </span>
                  )}
                  <div className="prompt-card__arrow">→</div>
                </button>
              );
            })}
            {visible.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:20, color:'var(--muted)', fontSize:12 }}>
                No prompts match "{search}"
              </div>
            )}
          </div>

          {/* Footer count */}
          <div style={{ textAlign:'right', fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:8, letterSpacing:1 }}>
            {search ? `${visible.length} RESULTS` : `${visible.length} OF 50 PROMPTS`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── System context builder ─────────────────────────────────
function buildSystemContext(agents, columns, workflows, clients) {
  const allTasks  = Object.values(columns).flatMap(c => c.items);
  const actAgents = agents.filter(a => a.status === 'active');
  const mrr       = clients.filter(c => c.status === 'active').reduce((s, c) => s + c.mrr, 0);

  return `You are Agency OS AI — an intelligent assistant with full context of a digital marketing agency's operations. Be concise, actionable, and data-driven. Use markdown formatting (bold, bullets, headers) for clarity.

## Current Agency State

### Tasks (${allTasks.length} total)
${Object.entries(columns).map(([k, col]) =>
  `**${col.title}** (${col.items.length}): ${col.items.slice(0,3).map(t => t.title).join(', ')}${col.items.length > 3 ? '...' : ''}`
).join('\n')}

High priority: ${allTasks.filter(t => t.priority === 'high').map(t => t.title).join(', ')}
Due today: ${allTasks.filter(t => t.due === 'Today').map(t => t.title).join(', ')}

### Agent Fleet (${actAgents.length}/${agents.length} active)
${agents.map(a => `- **${a.name}**: ${a.status.toUpperCase()} | ${a.efficiency}% efficiency | ${a.queue.length} queued`).join('\n')}
Fleet avg efficiency: ${Math.round(agents.reduce((s,a) => s+a.efficiency, 0)/agents.length)}%

### Workflows
${workflows.map(w => `- **${w.name}**: ${w.status} | ${w.successRate}% success | ${w.runs} runs`).join('\n')}

### Clients
MRR: $${(mrr/1000).toFixed(1)}k | Active: ${clients.filter(c=>c.status==='active').length} | Pipeline: ${clients.filter(c=>c.status==='pipeline').length}
${clients.filter(c=>c.status==='active').map(c => `- **${c.name}**: $${(c.mrr/1000).toFixed(1)}k/mo | ${c.health}% health`).join('\n')}
Pipeline: ${clients.filter(c=>c.status==='pipeline').map(c => `${c.name} (${c.notes})`).join(', ')}

### Financials
MRR: $${(mrr/1000).toFixed(1)}k | Gross margin: 76% | Net margin: 54% | Cash: $42k | Growth: +8% MoM`;
}

// ── Main Component ─────────────────────────────────────────
export default function AIBrain({ agents, columns, workflows, clients, aiMsgs, setAiMsgs, settings }) {
  const [input,     setInput]     = useState('');
  const [streaming, setStreaming] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);
  const chatRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiMsgs]);

  async function sendMessage(text) {
    const q = (text || input).trim();
    if (!q || streaming) return;
    setInput('');

    const userMsg = { role: 'user', text: q };
    setAiMsgs(p => [...p, userMsg, { role: 'ai', text: '' }]);
    setStreaming(true);

    const systemContext = buildSystemContext(agents, columns, workflows, clients);
    const history       = [...aiMsgs.filter(m => m.role === 'user' || m.role === 'ai'), userMsg];

    const provider = settings?.provider ?? 'minimax';
    const apiKey   = settings?.apiKeys?.[provider] ?? '';
    const model    = settings?.models?.[provider]  ?? '';

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history, systemContext, provider, apiKey, model }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        if (res.status === 503) setHasApiKey(false);
        setAiMsgs(p => { const c=[...p]; c[c.length-1]={ role:'ai', text:`⚠️ ${err.error}` }; return c; });
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buffer   = '';
      let full     = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              full += parsed.text;
              const snap = full;
              setAiMsgs(p => { const c=[...p]; c[c.length-1]={ role:'ai', text:snap }; return c; });
            }
          } catch (e) {
            if (e.message && e.message !== 'SyntaxError') {
              setAiMsgs(p => { const c=[...p]; c[c.length-1]={ role:'ai', text:`⚠️ ${e.message}` }; return c; });
            }
          }
        }
      }
    } catch (err) {
      setAiMsgs(p => { const c=[...p]; c[c.length-1]={ role:'ai', text:`⚠️ Network error: ${err.message}` }; return c; });
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function clearHistory() {
    setAiMsgs([{ role:'system', text:'Conversation cleared. Choose a prompt or ask me anything about your agency.' }]);
  }

  return (
    <section className="ai-view" aria-labelledby="ai-title">
      {/* Header */}
      <div style={{ marginBottom:12 }}>
        <div className="flex-between">
          <div>
            <h1 id="ai-title" className="view-title">🧠 Agency AI Brain</h1>
            <p className="view-subtitle">Full-context assistant — {settings?.provider ?? 'minimax'} powered</p>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={clearHistory} aria-label="Clear conversation">
            Clear
          </button>
        </div>
      </div>

      {/* No API key */}
      {!hasApiKey && (
        <div className="ai-no-key" role="alert">
          <div style={{ fontSize:32, marginBottom:8 }}>🔑</div>
          <div>
            <strong>API key not configured.</strong><br/>
            Go to <strong>Settings → AI Integrations</strong> to add your API key,<br/>
            or add it to your <code>.env</code> file and restart the server.
          </div>
        </div>
      )}

      {/* Prompt Library */}
      <PromptLibrary onSelect={sendMessage} disabled={streaming} />

      {/* Messages */}
      <div ref={chatRef} className="ai-messages" role="log" aria-live="polite" aria-label="Conversation" aria-atomic="false">
        {aiMsgs.map((m, i) => {
          const isLast      = i === aiMsgs.length - 1;
          const isStreaming = streaming && isLast && m.role === 'ai';
          return (
            <div key={i} className={`ai-msg ai-msg--${m.role}`}>
              {m.role === 'ai' && <div className="ai-msg__label" aria-hidden="true">🧠 AI — {settings?.provider ?? 'minimax'}</div>}
              <span>{m.text || (isStreaming ? '' : '…')}</span>
              {isStreaming && m.text  && <span className="ai-msg__cursor" aria-hidden="true"/>}
              {isStreaming && !m.text && <span style={{ color:'var(--muted)', fontStyle:'italic' }}>Thinking…</span>}
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="ai-input-row">
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={streaming ? 'AI is responding…' : 'Ask anything or pick a prompt above…'}
          disabled={streaming}
          aria-label="Message input"
        />
        <button
          className="btn btn--primary"
          onClick={() => sendMessage()}
          disabled={streaming || !input.trim()}
          style={{ padding:'10px 22px' }}
        >
          {streaming ? '…' : 'Send'}
        </button>
      </div>
    </section>
  );
}
