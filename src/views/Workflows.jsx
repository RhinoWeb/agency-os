import { useState, useEffect, useRef } from 'react';
import { Badge, Dot } from '../components/ui/index.jsx';
import { C } from '../theme.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import EmptyState from '../components/ui/EmptyState.jsx';

function WorkflowModal({ onAdd, onClose }) {
  const [name,    setName]    = useState('');
  const [trigger, setTrigger] = useState('');
  const [steps,   setSteps]   = useState(['']);
  const inputRef = useRef(null);
  const trapRef = useFocusTrap();

  useEffect(() => { inputRef.current?.focus(); }, []);

  function addStep() { setSteps(p => [...p, '']); }
  function removeStep(i) { setSteps(p => p.filter((_, idx) => idx !== i)); }
  function updateStep(i, v) { setSteps(p => p.map((s, idx) => idx === i ? v : s)); }

  function handleSubmit(e) {
    e.preventDefault();
    const validSteps = steps.map(s => s.trim()).filter(Boolean);
    if (!name.trim() || validSteps.length === 0) return;
    onAdd({
      id:          crypto.randomUUID(),
      name:        name.trim(),
      trigger:     trigger.trim() || 'Manual trigger',
      steps:       validSteps,
      status:      'paused',
      runs:        0,
      lastRun:     'Never',
      successRate: 100,
      isTemplate:  false,
    });
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wf-modal-title"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose()}
      ref={trapRef}
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 id="wf-modal-title" className="modal-title">New Workflow</h2>
        <form onSubmit={handleSubmit} className="form-stack">
          <input
            ref={inputRef}
            className="input"
            placeholder="Workflow name…"
            value={name}
            onChange={e => setName(e.target.value)}
            aria-label="Workflow name"
            required
          />
          <input
            className="input"
            placeholder="Trigger (e.g. Every Monday 9AM, New lead in CRM…)"
            value={trigger}
            onChange={e => setTrigger(e.target.value)}
            aria-label="Trigger"
          />

          <div>
            <div className="text-xs text-muted text-upper" style={{ marginBottom:8 }}>Pipeline Steps</div>
            <div className="form-stack" style={{ gap:6 }}>
              {steps.map((step, i) => (
                <div key={i} className="flex-center gap-6">
                  <span style={{ fontSize:10, fontFamily:'var(--mono)', color:'var(--muted)', minWidth:22, textAlign:'center' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    className="input"
                    style={{ flex:1 }}
                    placeholder={`Step ${i + 1}…`}
                    value={step}
                    onChange={e => updateStep(i, e.target.value)}
                    aria-label={`Step ${i + 1}`}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      className="close-btn"
                      style={{ padding:'0 4px' }}
                      onClick={() => removeStep(i)}
                      aria-label={`Remove step ${i + 1}`}
                    >×</button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ marginTop:8 }}
              onClick={addStep}
            >
              + Add Step
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:1 }}>Create Workflow</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Workflows({ workflows, setWorkflows, openConfirm }) {
  const [showModal, setShowModal] = useState(false);

  function addWorkflow(wf) {
    setWorkflows(p => [...p, wf]);
    setShowModal(false);
  }

  function toggleWorkflow(id) {
    setWorkflows(p => p.map(w =>
      w.id === id && !w.isTemplate
        ? { ...w, status: w.status==='active' ? 'paused' : 'active' }
        : w
    ));
  }

  function useTemplate(id) {
    setWorkflows(p => p.map(w =>
      w.id === id ? { ...w, status: 'active', isTemplate: false, runs: 0, lastRun: 'Never', successRate: 100 } : w
    ));
  }

  function deleteWorkflow(id) {
    setWorkflows(p => p.filter(w => w.id !== id));
  }

  const activeWorkflows   = workflows.filter(w => !w.isTemplate);
  const templateWorkflows = workflows.filter(w => w.isTemplate);

  function WorkflowCard({ w }) {
    return (
      <article
        key={w.id}
        className="card workflow-card"
        style={{ borderLeftColor: w.isTemplate ? C.accent5 : w.status==='active' ? C.accent : C.muted }}
        role="listitem"
        aria-label={`${w.name}, ${w.status}`}
      >
        <div className="flex-between mb-14">
          <div>
            <div className="flex-center" style={{ gap:8, marginBottom:3, flexWrap:'wrap' }}>
              <h2 className="heading-md">
                {w.isTemplate ? '📋' : '⚡'} {w.name}
              </h2>
              {w.isTemplate ? (
                <Badge label="Template" color={C.accent5}/>
              ) : (
                <>
                  <Badge label={w.status}                     color={w.status==='active' ? C.accent : C.muted}/>
                  <Badge label={`${w.successRate}% success`}  color={w.successRate>=95  ? C.green  : C.yellow}/>
                </>
              )}
            </div>
            <div className="text-xs text-muted">
              {w.trigger}{!w.isTemplate && ` · ${w.runs} runs · Last: ${w.lastRun}`}
            </div>
          </div>
          <div className="flex-center gap-6">
            {w.isTemplate ? (
              <button
                className="btn btn--sm"
                style={{ background:`${C.accent5}12`, borderColor:C.accent5, color:C.accent5 }}
                onClick={() => useTemplate(w.id)}
                aria-label={`Use template: ${w.name}`}
              >
                ▶ Use Template
              </button>
            ) : (
              <>
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
                <button
                  className="btn btn--sm"
                  style={{ background:`${C.red}12`, borderColor:C.red, color:C.red }}
                  onClick={() => openConfirm({
                    title: `Delete "${w.name}"?`,
                    message: 'This workflow will be permanently deleted.',
                    confirmLabel: 'Delete Workflow',
                    danger: true,
                    onConfirm: () => deleteWorkflow(w.id),
                  })}
                  aria-label={`Delete workflow: ${w.name}`}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>

        <div className="workflow-steps" role="list" aria-label="Pipeline steps">
          {w.steps.map((step, i) => (
            <div key={i} className="flex-center">
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
    );
  }

  return (
    <section className="view view--mid" aria-labelledby="wf-title">
      <header className="view-header">
        <div>
          <h1 id="wf-title" className="view-title">Automation Workflows</h1>
          <p className="view-subtitle">Chain agents into automated pipelines</p>
        </div>
        <button className="btn btn--outline-accent" onClick={() => setShowModal(true)} aria-label="Create new workflow">
          + New Workflow
        </button>
      </header>

      {workflows.length === 0 && (
        <EmptyState icon="⚡" title="No workflows created" subtitle="Build automated multi-step workflows to save time" action="+ New Workflow" onAction={() => setShowModal(true)} />
      )}

      <div role="list" aria-label="Active workflows">
        {activeWorkflows.map(w => <WorkflowCard key={w.id} w={w}/>)}
      </div>

      {templateWorkflows.length > 0 && (
        <>
          <div className="section-label mb-12" style={{ marginTop:28 }}>
            Campaign Templates
            <span style={{ marginLeft:8, fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>
              — click "Use Template" to activate
            </span>
          </div>
          <div role="list" aria-label="Workflow templates">
            {templateWorkflows.map(w => <WorkflowCard key={w.id} w={w}/>)}
          </div>
        </>
      )}

      {showModal && <WorkflowModal onAdd={addWorkflow} onClose={() => setShowModal(false)}/>}
    </section>
  );
}
