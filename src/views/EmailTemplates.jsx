import { useState } from 'react';
import { Badge } from '../components/ui/index.jsx';
import { C, MONO } from '../theme.js';

const MERGE_FIELDS = [
  { token:'{{firstName}}',   label:'First Name',    example:'Sarah' },
  { token:'{{lastName}}',    label:'Last Name',     example:'Chen' },
  { token:'{{company}}',     label:'Company',       example:'Acme Corp' },
  { token:'{{industry}}',    label:'Industry',      example:'SaaS' },
  { token:'{{dealValue}}',   label:'Deal Value',    example:'$7,000' },
  { token:'{{services}}',    label:'Services',      example:'SEO, Content' },
  { token:'{{senderName}}',  label:'Sender Name',   example:'You' },
  { token:'{{meetingNotes}}', label:'Meeting Notes', example:'…' },
  { token:'{{proposalDate}}',label:'Proposal Date', example:'Mar 15' },
  { token:'{{renewalDate}}', label:'Renewal Date',  example:'Apr 1' },
  { token:'{{months}}',      label:'Months Active', example:'6' },
  { token:'{{results}}',     label:'Results',       example:'240% traffic growth' },
];

function Preview({ subject, body, profile }) {
  function fill(text) {
    return (text ?? '')
      .replace(/\{\{firstName\}\}/g, 'Sarah')
      .replace(/\{\{lastName\}\}/g, 'Chen')
      .replace(/\{\{company\}\}/g, 'Acme Corp')
      .replace(/\{\{industry\}\}/g, 'SaaS')
      .replace(/\{\{dealValue\}\}/g, '$7,000')
      .replace(/\{\{services\}\}/g, 'SEO, Content')
      .replace(/\{\{senderName\}\}/g, profile?.name ?? 'You')
      .replace(/\{\{meetingNotes\}\}/g, 'Discussed Q2 content strategy, video production add-on approved.')
      .replace(/\{\{proposalDate\}\}/g, 'March 15')
      .replace(/\{\{renewalDate\}\}/g, 'April 1')
      .replace(/\{\{months\}\}/g, '6')
      .replace(/\{\{results\}\}/g, '240% organic traffic growth, 3x lead volume');
  }

  return (
    <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 9, fontFamily: MONO, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Preview</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        {fill(subject) || '(No subject)'}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--dim)', whiteSpace: 'pre-wrap' }}>
        {fill(body) || '(Empty body)'}
      </div>
    </div>
  );
}

function TemplateEditor({ template, onSave, onClose, onDelete, profile }) {
  const isNew = !template;
  const [form, setForm] = useState(template ? { ...template } : {
    name: '', subject: '', body: '', tags: '',
  });
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function insertMerge(token, field) {
    // Insert into body at cursor (or append)
    const el = document.getElementById('tpl-body');
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newBody = form.body.slice(0, start) + token + form.body.slice(end);
      set('body', newBody);
      setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + token.length; }, 0);
    } else {
      set(field ?? 'body', (form[field ?? 'body'] ?? '') + token);
    }
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      id: form.id || crypto.randomUUID(),
      name: form.name.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : (form.tags ?? []),
      usageCount: form.usageCount ?? 0,
    });
    onClose();
  }

  const tagStr = typeof form.tags === 'string' ? form.tags : (form.tags ?? []).join(', ');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(6px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', margin: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--sans)' }}>{isNew ? 'New Template' : 'Edit Template'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: editor */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="settings-label" style={{ display: 'block', marginBottom: 4 }}>Template Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Follow-Up After Call" autoFocus required />
            </div>
            <div>
              <label className="settings-label" style={{ display: 'block', marginBottom: 4 }}>Subject Line</label>
              <input className="input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Great chatting, {{firstName}}!" />
            </div>
            <div>
              <label className="settings-label" style={{ display: 'block', marginBottom: 4 }}>Body</label>
              <textarea
                id="tpl-body"
                className="input"
                rows={10}
                value={form.body}
                onChange={e => set('body', e.target.value)}
                placeholder="Hi {{firstName}},&#10;&#10;..."
                style={{ resize: 'vertical', fontSize: 12, lineHeight: 1.6 }}
              />
            </div>

            {/* Merge field chips */}
            <div>
              <div className="section-label mb-6">Insert Merge Field</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {MERGE_FIELDS.map(f => (
                  <button
                    key={f.token}
                    type="button"
                    onClick={() => insertMerge(f.token)}
                    style={{
                      fontSize: 9, fontFamily: MONO, padding: '3px 8px', borderRadius: 4,
                      background: `${C.accent}08`, border: `1px solid ${C.accent}20`, color: C.accent,
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="settings-label" style={{ display: 'block', marginBottom: 4 }}>Tags (comma-separated)</label>
              <input className="input" value={tagStr} onChange={e => set('tags', e.target.value)} placeholder="outreach, follow-up" />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              {!isNew && onDelete && (
                <button type="button" className="btn btn--ghost btn--sm" style={{ color: C.red, borderColor: `${C.red}30` }} onClick={() => { onDelete(form.id); onClose(); }}>
                  Delete
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn--primary">{isNew ? 'Create' : 'Save'}</button>
            </div>
          </form>

          {/* Right: preview */}
          <div>
            <Preview subject={form.subject} body={form.body} profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplates({ emailTemplates, setEmailTemplates, profile }) {
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null); // null | 'new' | template object

  const safeTemplates = emailTemplates ?? [];

  const filtered = safeTemplates.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.tags ?? []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  function saveTemplate(data) {
    if (safeTemplates.find(t => t.id === data.id)) {
      setEmailTemplates(p => (p ?? []).map(t => t.id === data.id ? data : t));
    } else {
      setEmailTemplates(p => [data, ...(p ?? [])]);
    }
  }

  function deleteTemplate(id) {
    setEmailTemplates(p => (p ?? []).filter(t => t.id !== id));
  }

  function duplicateTemplate(tpl) {
    const dup = { ...tpl, id: crypto.randomUUID(), name: `${tpl.name} (copy)`, usageCount: 0 };
    setEmailTemplates(p => [dup, ...(p ?? [])]);
  }

  return (
    <section className="view" aria-labelledby="templates-title">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 id="templates-title" className="view-title">Email Templates</h1>
          <p className="view-subtitle">Reusable templates with merge fields for outreach and follow-ups</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditor('new')}>+ New Template</button>
      </header>

      {/* KPIs */}
      <div className="grid-4 mb-18">
        {[
          { l: 'Templates', v: safeTemplates.length, c: C.accent },
          { l: 'Total Uses', v: safeTemplates.reduce((s, t) => s + (t.usageCount ?? 0), 0), c: C.accent3 },
          { l: 'Merge Fields', v: MERGE_FIELDS.length, c: C.accent4 },
          { l: 'Categories', v: [...new Set(safeTemplates.flatMap(t => t.tags ?? []))].length, c: C.accent2 },
        ].map((k, i) => (
          <div key={i} className="card card--sm">
            <div className="kpi-label">{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.c, fontFamily: MONO }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          style={{ width: 280 }}
          placeholder="Search templates…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Template grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--muted)', fontSize: 13 }}>
            No templates found.{' '}
            <button onClick={() => setEditor('new')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13 }}>Create one</button>
          </div>
        )}
        {filtered.map(tpl => (
          <div key={tpl.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{tpl.name}</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: MONO }}>{tpl.subject || '(No subject)'}</div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn--sm btn--ghost" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => duplicateTemplate(tpl)} title="Duplicate">⧉</button>
                <button className="btn btn--sm btn--ghost" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => setEditor(tpl)} title="Edit">✎</button>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12, maxHeight: 60, overflow: 'hidden' }}>
              {tpl.body?.slice(0, 150)}{tpl.body?.length > 150 ? '…' : ''}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(tpl.tags ?? []).map(t => (
                  <Badge key={t} label={t} color={C.accent4} />
                ))}
              </div>
              <span style={{ fontSize: 10, fontFamily: MONO, color: 'var(--muted)' }}>
                {tpl.usageCount ?? 0} uses
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Editor modal */}
      {editor && (
        <TemplateEditor
          template={editor === 'new' ? null : editor}
          onSave={saveTemplate}
          onClose={() => setEditor(null)}
          onDelete={deleteTemplate}
          profile={profile}
        />
      )}
    </section>
  );
}
