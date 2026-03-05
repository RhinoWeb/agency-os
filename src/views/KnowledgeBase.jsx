import { useState } from 'react';
import { Badge } from '../components/ui/index.jsx';
import { C } from '../theme.js';

const TYPE_COLOR = { database: C.accent3, calendar: C.accent2 };

export default function KnowledgeBase({ pages, setPages }) {
  const [selectedId, setSelectedId] = useState(null);
  const [editId,     setEditId]     = useState(null);
  const [search,     setSearch]     = useState('');

  function toggleStar(id) {
    setPages(p => p.map(x => x.id===id ? { ...x, starred: !x.starred } : x));
  }

  function updateContent(id, content) {
    setPages(p => p.map(x => x.id===id ? { ...x, content, updated:'Just now' } : x));
  }

  if (selectedId) {
    const pg = pages.find(p => p.id === selectedId);
    if (!pg) return null;

    return (
      <section className="view view--mid" aria-labelledby="kb-page-title">
        <div className="flex-between mb-14">
          <div className="flex-center gap-8">
            <button className="btn btn--ghost btn--sm" onClick={() => { setSelectedId(null); setEditId(null); }}>
              ← Back
            </button>
            <span aria-hidden="true" style={{ fontSize:22 }}>{pg.icon}</span>
            <h1 id="kb-page-title" style={{ fontFamily:'var(--sans)', fontSize:18, fontWeight:700 }}>{pg.title}</h1>
            <Badge label={pg.type} color={TYPE_COLOR[pg.type] ?? C.muted}/>
          </div>
          <div className="flex-center gap-6">
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => toggleStar(pg.id)}
              aria-label={pg.starred ? 'Unstar page' : 'Star page'}
              aria-pressed={pg.starred}
              style={{ color: pg.starred ? C.yellow : 'var(--muted)' }}
            >
              {pg.starred ? '★ Starred' : '☆ Star'}
            </button>
            <button
              className="btn btn--sm"
              style={{
                background:  editId === pg.id ? `${C.accent}12` : 'var(--surface2)',
                borderColor: editId === pg.id ? C.accent : 'var(--border)',
                color:       editId === pg.id ? C.accent : 'var(--muted)',
              }}
              onClick={() => setEditId(editId === pg.id ? null : pg.id)}
              aria-pressed={editId === pg.id}
              aria-label={editId === pg.id ? 'Save changes' : 'Edit page'}
            >
              {editId === pg.id ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-muted mb-14">Updated {pg.updated}</div>
          {editId === pg.id ? (
            <textarea
              className="input"
              value={pg.content}
              onChange={e => updateContent(pg.id, e.target.value)}
              style={{ minHeight:320, resize:'vertical', lineHeight:1.7, fontSize:14, fontFamily:'var(--sans)' }}
              aria-label="Page content editor"
            />
          ) : (
            <div className="page-content">{pg.content}</div>
          )}
        </div>
      </section>
    );
  }

  const starred  = pages.filter(p => p.starred);
  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="view view--mid" aria-labelledby="kb-title">
      <header style={{ marginBottom:14 }}>
        <h1 id="kb-title" className="view-title">Knowledge Base</h1>
        <p className="view-subtitle">Internal docs, databases, and templates</p>
      </header>

      {/* Search */}
      <div className="kb-search" role="search">
        <span aria-hidden="true">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search docs..."
          aria-label="Search knowledge base"
        />
        <kbd style={{ fontSize:10, color:'var(--muted)', padding:'3px 8px', background:'var(--surface2)', borderRadius:5, fontFamily:'var(--mono)' }}>
          ⌘K
        </kbd>
      </div>

      {/* Starred */}
      {!search && starred.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div className="section-label mb-8">⭐ Starred</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {starred.map(pg => <PageRow key={pg.id} pg={pg} onSelect={setSelectedId}/>)}
          </div>
        </div>
      )}

      {/* All / filtered */}
      <div>
        <div className="section-label mb-8">{search ? `Results (${filtered.length})` : 'All Pages'}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {filtered.map(pg => <PageRow key={pg.id} pg={pg} onSelect={setSelectedId}/>)}
          {filtered.length === 0 && (
            <div style={{ padding:'20px', textAlign:'center', color:'var(--muted)', fontSize:12 }}>
              No pages match "{search}"
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PageRow({ pg, onSelect }) {
  return (
    <button
      className="page-item"
      onClick={() => onSelect(pg.id)}
      aria-label={`Open ${pg.title}`}
      style={{ textAlign:'left', width:'100%', border:'1px solid var(--border)' }}
    >
      <span style={{ fontSize:18 }} aria-hidden="true">{pg.icon}</span>
      <div style={{ flex:1 }}>
        <div className="page-title">{pg.title}</div>
        <div className="page-meta">Updated {pg.updated}</div>
      </div>
      {pg.starred && <span style={{ color:'var(--yellow)' }} aria-label="Starred">★</span>}
      <Badge label={pg.type} color={TYPE_COLOR[pg.type] ?? 'var(--muted)'}/>
    </button>
  );
}
