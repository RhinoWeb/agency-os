import { Badge, Dot } from '../components/ui/index.jsx';
import { C } from '../theme.js';

export default function Workflows({ workflows, setWorkflows }) {
  function toggleWorkflow(id) {
    setWorkflows(p => p.map(w =>
      w.id === id ? { ...w, status: w.status==='active' ? 'paused' : 'active' } : w
    ));
  }

  return (
    <section className="view view--mid" aria-labelledby="wf-title">
      <header className="view-header">
        <div>
          <h1 id="wf-title" className="view-title">Automation Workflows</h1>
          <p className="view-subtitle">Chain agents into automated pipelines</p>
        </div>
        <button className="btn btn--outline-accent" aria-label="Create new workflow">
          + New Workflow
        </button>
      </header>

      <div role="list" aria-label="Workflows">
        {workflows.map(w => (
          <article
            key={w.id}
            className="card workflow-card"
            style={{ borderLeftColor: w.status==='active' ? C.accent : C.muted }}
            role="listitem"
            aria-label={`${w.name}, ${w.status}, ${w.successRate}% success rate`}
          >
            <div className="flex-between mb-14">
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <h2 style={{ fontFamily:'var(--sans)', fontSize:16, fontWeight:700 }}>⚡ {w.name}</h2>
                  <Badge label={w.status}                     color={w.status==='active' ? C.accent : C.muted}/>
                  <Badge label={`${w.successRate}% success`}  color={w.successRate>=95  ? C.green  : C.yellow}/>
                </div>
                <div className="text-xs text-muted">
                  {w.trigger} · {w.runs} runs · Last: {w.lastRun}
                </div>
              </div>
              <button
                className="btn btn--sm"
                style={{
                  background:  w.status==='active' ? `${C.accent2}12` : `${C.accent}12`,
                  borderColor: w.status==='active' ? C.accent2 : C.accent,
                  color:       w.status==='active' ? C.accent2 : C.accent,
                }}
                onClick={() => toggleWorkflow(w.id)}
                aria-pressed={w.status==='active'}
                aria-label={w.status==='active' ? `Pause ${w.name}` : `Activate ${w.name}`}
              >
                {w.status==='active' ? '⏸ Pause' : '▶ Activate'}
              </button>
            </div>

            {/* Pipeline steps */}
            <div className="workflow-steps" role="list" aria-label="Pipeline steps">
              {w.steps.map((step, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center' }}>
                  <div className="workflow-step" role="listitem">
                    <span className="workflow-step__num">0{i+1}</span>
                    {step}
                  </div>
                  {i < w.steps.length - 1 && (
                    <div className="workflow-arrow" aria-hidden="true"/>
                  )}
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
