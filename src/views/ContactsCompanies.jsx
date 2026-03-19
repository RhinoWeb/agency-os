import { useState, useMemo } from 'react';
import { Badge } from '../components/ui/index.jsx';
import ViewSwitcher from '../components/ui/ViewSwitcher.jsx';
import { C, MONO } from '../theme.js';
import { Users, Building2 } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' }); }
function fmtCurrency(n) { return n >= 1000 ? `$${(n/1000).toFixed(n%1000===0?0:1)}k` : `$${n}`; }

const SOURCES = ['all','referral','outbound','website','linkedin','cold','other'];
const ACTIVITY_ICONS = { call:'📞', email:'📧', meeting:'🤝', note:'📝' };

// ── Contact Form Modal ──────────────────────────────────────────
function ContactModal({ contact, companies, onSave, onClose }) {
  const isEdit = !!contact;
  const [form, setForm] = useState(contact ? { ...contact } : {
    name:'', email:'', phone:'', title:'', companyId:'', tags:'', source:'referral', avatar:'👤', notes:'',
  });
  function set(k,v) { setForm(p => ({ ...p, [k]:v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      id: form.id || crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email?.trim() ?? '',
      phone: form.phone?.trim() ?? '',
      title: form.title?.trim() ?? '',
      companyId: form.companyId || null,
      ownerId: form.ownerId ?? null,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : (form.tags ?? []),
      source: form.source || 'other',
      avatar: form.avatar || '👤',
      notes: form.notes?.trim() ?? '',
      interactions: form.interactions ?? [],
    });
    onClose();
  }

  const tagStr = typeof form.tags === 'string' ? form.tags : (form.tags ?? []).join(', ');

  return (
    <div className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex-between" style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:700, fontFamily:'var(--sans)' }}>{isEdit ? 'Edit Contact' : 'New Contact'}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <div className="form-grid">
            <div>
              <label className="settings-label form-label">Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus required />
            </div>
            <div>
              <label className="settings-label form-label">Title</label>
              <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="VP of Marketing" />
            </div>
            <div>
              <label className="settings-label form-label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="settings-label form-label">Phone</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="settings-label form-label">Company</label>
              <select className="input" value={form.companyId ?? ''} onChange={e => set('companyId', e.target.value)}>
                <option value="">None</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.logo} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="settings-label form-label">Source</label>
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.filter(s => s !== 'all').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="settings-label form-label">Tags (comma-separated)</label>
            <input className="input" value={tagStr} onChange={e => set('tags', e.target.value)} placeholder="decision-maker, champion" />
          </div>
          <div>
            <label className="settings-label form-label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize:'vertical' }} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:2 }}>{isEdit ? 'Save' : 'Create Contact'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Company Form Modal ──────────────────────────────────────────
function CompanyModal({ company, onSave, onClose }) {
  const isEdit = !!company;
  const [form, setForm] = useState(company ? { ...company } : {
    name:'', domain:'', industry:'', employees:'', location:'', website:'', mrr:0, status:'prospect', notes:'', logo:'🏢', color:C.accent,
  });
  function set(k,v) { setForm(p => ({ ...p, [k]:v })); }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      id: form.id || crypto.randomUUID(),
      name: form.name.trim(),
      domain: form.domain?.trim() ?? '',
      industry: form.industry?.trim() ?? '',
      employees: form.employees?.trim() ?? '',
      location: form.location?.trim() ?? '',
      website: form.website?.trim() ?? '',
      mrr: Number(form.mrr) || 0,
      status: form.status || 'prospect',
      health: form.health ?? 0,
      since: form.since ?? null,
      color: form.color || C.accent,
      notes: form.notes?.trim() ?? '',
      logo: form.logo || '🏢',
    });
    onClose();
  }

  return (
    <div className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex-between" style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:18, fontWeight:700, fontFamily:'var(--sans)' }}>{isEdit ? 'Edit Company' : 'New Company'}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <div className="form-grid">
            <div>
              <label className="settings-label form-label">Company Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} autoFocus required />
            </div>
            <div>
              <label className="settings-label form-label">Domain</label>
              <input className="input" value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="acme.io" />
            </div>
            <div>
              <label className="settings-label form-label">Industry</label>
              <input className="input" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="SaaS" />
            </div>
            <div>
              <label className="settings-label form-label">Employees</label>
              <input className="input" value={form.employees} onChange={e => set('employees', e.target.value)} placeholder="50-200" />
            </div>
            <div>
              <label className="settings-label form-label">Location</label>
              <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Austin, TX" />
            </div>
            <div>
              <label className="settings-label form-label">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            <div>
              <label className="settings-label form-label">MRR ($)</label>
              <input className="input" type="number" min={0} value={form.mrr} onChange={e => set('mrr', e.target.value)} />
            </div>
            <div>
              <label className="settings-label form-label">Website</label>
              <input className="input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className="settings-label form-label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize:'vertical' }} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} style={{ flex:1 }}>Cancel</button>
            <button type="submit" className="btn btn--primary" style={{ flex:2 }}>{isEdit ? 'Save' : 'Create Company'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Activity Log (inline on detail) ─────────────────────────────
function ActivityLog({ interactions, onAdd }) {
  const [type, setType] = useState('call');
  const [note, setNote] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    onAdd({ id: crypto.randomUUID(), date:new Date().toISOString().split('T')[0], type, note:note.trim() });
    setNote('');
  }
  return (
    <div>
      <form onSubmit={submit} style={{ display:'flex', gap:6, marginBottom:12 }}>
        <select className="input" style={{ width:90, fontSize:10 }} value={type} onChange={e => setType(e.target.value)}>
          {Object.entries(ACTIVITY_ICONS).map(([k,v]) => <option key={k} value={k}>{v} {k}</option>)}
        </select>
        <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Log an activity…" style={{ flex:1, fontSize:11 }} />
        <button type="submit" className="btn btn--sm btn--primary">Log</button>
      </form>
      {(interactions ?? []).length === 0 && (
        <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center', padding:'12px 0' }}>No activity yet</div>
      )}
      {(interactions ?? []).map(i => (
        <div key={i.id} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'8px 10px', background:'var(--surface2)', borderRadius:8, fontSize:11, marginBottom:4 }}>
          <span style={{ fontSize:12, flexShrink:0 }}>{ACTIVITY_ICONS[i.type] ?? '📌'}</span>
          <div style={{ flex:1 }}>
            <div>{i.note}</div>
            <div style={{ fontSize:9, color:'var(--muted)', fontFamily:MONO, marginTop:2 }}>{fmtDate(i.date)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Contact Detail Panel ────────────────────────────────────────
function ContactDetail({ contact, companies, deals, onUpdateContact, onClose, onEdit }) {
  const company = companies.find(c => c.id === contact.companyId);
  const contactDeals = (deals ?? []).filter(d => d.contactId === contact.id);
  const lastInteraction = (contact.interactions ?? []).length > 0
    ? [...contact.interactions].sort((a,b) => b.date.localeCompare(a.date))[0]
    : null;

  function addInteraction(interaction) {
    onUpdateContact(contact.id, {
      interactions: [interaction, ...(contact.interactions ?? [])],
    });
  }

  return (
    <div className="panel-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        <div className="flex-between" style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--surface2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
              {contact.avatar}
            </div>
            <div>
              <h2 style={{ fontSize:18, fontWeight:700, fontFamily:'var(--sans)' }}>{contact.name}</h2>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{contact.title}{company ? ` at ${company.name}` : ''}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button className="btn btn--sm btn--ghost" onClick={() => onEdit(contact)}>Edit</button>
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
        </div>

        {/* Contact info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          <div className="card" style={{ padding:12 }}>
            <div className="section-label mb-4">Email</div>
            {contact.email ? <a href={`mailto:${contact.email}`} style={{ fontSize:12, color:C.accent }}>{contact.email}</a> : <span style={{ color:'var(--muted)', fontSize:12 }}>—</span>}
          </div>
          <div className="card" style={{ padding:12 }}>
            <div className="section-label mb-4">Phone</div>
            <div style={{ fontSize:12 }}>{contact.phone || '—'}</div>
          </div>
          <div className="card" style={{ padding:12 }}>
            <div className="section-label mb-4">Source</div>
            <Badge label={contact.source ?? 'unknown'} color={C.accent4} />
          </div>
          <div className="card" style={{ padding:12 }}>
            <div className="section-label mb-4">Last Interaction</div>
            <div style={{ fontSize:12, color: lastInteraction ? 'var(--text)' : 'var(--muted)' }}>
              {lastInteraction ? `${ACTIVITY_ICONS[lastInteraction.type] ?? ''} ${fmtDate(lastInteraction.date)}` : '—'}
            </div>
          </div>
        </div>

        {/* Tags */}
        {(contact.tags ?? []).length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div className="section-label mb-8">Tags</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {contact.tags.map(t => (
                <span key={t} style={{ fontSize:10, fontFamily:MONO, color:C.accent, background:`${C.accent}10`, border:`1px solid ${C.accent}25`, borderRadius:4, padding:'2px 8px' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Company */}
        {company && (
          <div style={{ marginBottom:20 }}>
            <div className="section-label mb-8">Company</div>
            <div className="card" style={{ padding:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:22 }}>{company.logo}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{company.name}</div>
                  <div style={{ fontSize:10, color:'var(--muted)' }}>{company.industry} · {company.employees} · {company.location}</div>
                  {company.mrr > 0 && <div style={{ fontSize:11, color:C.accent, fontFamily:MONO, marginTop:2 }}>{fmtCurrency(company.mrr)}/mo</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related deals */}
        {contactDeals.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div className="section-label mb-8">Deals ({contactDeals.length})</div>
            {contactDeals.map(d => (
              <div key={d.id} className="card" style={{ padding:12, marginBottom:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{d.title}</div>
                    <div style={{ fontSize:10, color:'var(--muted)', fontFamily:MONO, marginTop:2 }}>{d.stage} · Close: {fmtDate(d.expectedClose)}</div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, fontFamily:MONO, color:C.accent }}>{fmtCurrency(d.value)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div style={{ marginBottom:20 }}>
            <div className="section-label mb-8">Notes</div>
            <div style={{ fontSize:12, color:'var(--dim)', lineHeight:1.6, padding:'10px 14px', background:'var(--surface2)', borderRadius:8 }}>
              {contact.notes}
            </div>
          </div>
        )}

        {/* Activity timeline */}
        <div>
          <div className="section-label mb-8">Activity Timeline</div>
          <ActivityLog interactions={contact.interactions} onAdd={addInteraction} />
        </div>
      </div>
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────
export default function ContactsCompanies({ contacts, setContacts, companies, setCompanies, deals, openConfirm }) {
  const [viewTab, setViewTab]       = useState('contacts'); // contacts | companies
  const [search, setSearch]         = useState('');
  const [sourceFilter, setSource]   = useState('all');
  const [selectedContact, setSelCt] = useState(null);
  const [showModal, setShowModal]   = useState(null); // 'newContact' | 'newCompany' | {type:'editContact', data:...} | {type:'editCompany', data:...}

  const safeContacts  = contacts ?? [];
  const safeCompanies = companies ?? [];

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return safeContacts
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? '').toLowerCase().includes(search.toLowerCase()) || (c.title ?? '').toLowerCase().includes(search.toLowerCase()))
      .filter(c => sourceFilter === 'all' || c.source === sourceFilter);
  }, [safeContacts, search, sourceFilter]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return safeCompanies
      .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.industry ?? '').toLowerCase().includes(search.toLowerCase()));
  }, [safeCompanies, search]);

  // Duplicate detection
  const dupEmails = useMemo(() => {
    const emails = safeContacts.map(c => c.email?.toLowerCase()).filter(Boolean);
    const seen = {};
    const dups = new Set();
    emails.forEach(e => { if (seen[e]) dups.add(e); seen[e] = true; });
    return dups;
  }, [safeContacts]);

  function saveContact(data) {
    if (safeContacts.find(c => c.id === data.id)) {
      setContacts(p => (p ?? []).map(c => c.id === data.id ? data : c));
    } else {
      setContacts(p => [data, ...(p ?? [])]);
    }
  }

  function updateContact(id, patch) {
    setContacts(p => (p ?? []).map(c => c.id === id ? { ...c, ...patch } : c));
    // Update selected contact view
    if (selectedContact?.id === id) setSelCt(prev => ({ ...prev, ...patch }));
  }

  function deleteContact(id) {
    openConfirm({
      title: 'Delete this contact?',
      message: 'This action is permanent.',
      confirmLabel: 'Delete Contact',
      danger: true,
      onConfirm: () => {
        setContacts(p => (p ?? []).filter(c => c.id !== id));
        if (selectedContact?.id === id) setSelCt(null);
      },
    });
  }

  function saveCompany(data) {
    if (safeCompanies.find(c => c.id === data.id)) {
      setCompanies(p => (p ?? []).map(c => c.id === data.id ? data : c));
    } else {
      setCompanies(p => [data, ...(p ?? [])]);
    }
  }

  function deleteCompany(id) {
    openConfirm({
      title: 'Delete this company?',
      message: 'This action is permanent.',
      confirmLabel: 'Delete Company',
      danger: true,
      onConfirm: () => {
        setCompanies(p => (p ?? []).filter(c => c.id !== id));
      },
    });
  }

  // KPIs
  const totalContacts  = safeContacts.length;
  const totalCompanies = safeCompanies.length;
  const clientCompanies = safeCompanies.filter(c => c.status === 'client').length;
  const totalMRR = safeCompanies.reduce((s, c) => s + (c.mrr ?? 0), 0);

  return (
    <section className="view" aria-labelledby="contacts-title">
      <header className="view-header">
        <div>
          <h1 id="contacts-title" className="view-title">Contacts & Companies</h1>
          <p className="view-subtitle">Manage relationships across your CRM</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn--ghost" onClick={() => setShowModal('newCompany')}>+ Company</button>
          <button className="btn btn--primary" onClick={() => setShowModal('newContact')}>+ Contact</button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid-4 mb-18">
        {[
          { l:'Contacts',  v:totalContacts,  c:C.accent  },
          { l:'Companies', v:totalCompanies, c:C.accent3 },
          { l:'Active Clients', v:clientCompanies, c:C.green },
          { l:'Total MRR', v:fmtCurrency(totalMRR), c:C.accent4 },
        ].map((k,i) => (
          <div key={i} className="card card--sm">
            <div className="kpi-label">{k.l}</div>
            <div className="kpi-value-lg" style={{ color:k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Duplicate warning */}
      {dupEmails.size > 0 && (
        <div style={{ marginBottom:16, padding:'10px 14px', background:`${C.yellow}08`, border:`1px solid ${C.yellow}25`, borderRadius:8, fontSize:11, color:C.yellow, fontFamily:MONO }}>
          ⚠ {dupEmails.size} duplicate email{dupEmails.size > 1 ? 's' : ''} detected: {[...dupEmails].slice(0,3).join(', ')}{dupEmails.size > 3 ? '…' : ''}
        </div>
      )}

      {/* Tabs + toolbar */}
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap', justifyContent:'space-between' }}>
        <ViewSwitcher
          views={[
            { id: 'contacts', label: 'Contacts', icon: Users },
            { id: 'companies', label: 'Companies', icon: Building2 },
          ]}
          active={viewTab}
          onChange={setViewTab}
        />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input
            className="input"
            style={{ width:200 }}
            placeholder={`Search ${viewTab}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {viewTab === 'contacts' && (
            <div style={{ display:'flex', gap:4 }}>
              {SOURCES.map(s => (
                <button
                  key={s}
                  className={`btn btn--sm${sourceFilter === s ? '' : ' btn--ghost'}`}
                  style={sourceFilter === s ? { background:`${C.accent}15`, borderColor:C.accent, color:C.accent } : {}}
                  onClick={() => setSource(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Contacts Table ──────────────────────────────────── */}
      {viewTab === 'contacts' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  {['','Name','Title','Company','Email','Source','Last Activity',''].map((h,i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign:'center', padding:'32px 0', color:'var(--muted)' }}>No contacts found</td></tr>
                )}
                {filteredContacts.map(ct => {
                  const company = safeCompanies.find(c => c.id === ct.companyId);
                  const lastInt = (ct.interactions ?? []).length > 0 ? [...ct.interactions].sort((a,b) => b.date.localeCompare(a.date))[0] : null;
                  const isDup = ct.email && dupEmails.has(ct.email.toLowerCase());
                  return (
                    <tr
                      key={ct.id}
                      onClick={() => setSelCt(ct)}
                      style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 0.1s', ...(isDup ? { background:`${C.yellow}06` } : {}) }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = isDup ? `${C.yellow}06` : ''}
                    >
                      <td style={{ fontSize:18 }}>{ct.avatar}</td>
                      <td style={{ fontWeight:600 }}>
                        {ct.name}
                        {isDup && <span style={{ fontSize:8, color:C.yellow, marginLeft:6 }}>DUP</span>}
                      </td>
                      <td style={{ color:'var(--muted)' }}>{ct.title || '—'}</td>
                      <td>{company ? `${company.logo} ${company.name}` : '—'}</td>
                      <td style={{ color:C.accent }}>{ct.email || '—'}</td>
                      <td><Badge label={ct.source ?? '—'} color={C.accent4} /></td>
                      <td style={{ fontSize:10, color:'var(--muted)', fontFamily:MONO }}>
                        {lastInt ? `${ACTIVITY_ICONS[lastInt.type] ?? ''} ${fmtDate(lastInt.date)}` : '—'}
                      </td>
                      <td>
                        <button className="btn btn--sm btn--ghost" style={{ fontSize:10, padding:'2px 6px', color:C.red }} onClick={e => { e.stopPropagation(); deleteContact(ct.id); }}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Companies Grid ──────────────────────────────────── */}
      {viewTab === 'companies' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
          {filteredCompanies.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 0', color:'var(--muted)', fontSize:13 }}>No companies found</div>
          )}
          {filteredCompanies.map(co => {
            const coContacts = safeContacts.filter(c => c.companyId === co.id);
            const coDeals    = (deals ?? []).filter(d => d.companyId === co.id);
            const statusColor = co.status === 'client' ? C.accent : co.status === 'churned' ? C.red : C.muted;
            return (
              <div key={co.id} className="card" style={{ padding:18, borderLeft:`3px solid ${statusColor}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontSize:26 }}>{co.logo}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700 }}>{co.name}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>{co.industry} · {co.location}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="btn btn--sm btn--ghost" style={{ fontSize:10, padding:'2px 6px' }} onClick={() => setShowModal({ type:'editCompany', data:co })}>✎</button>
                    <button className="btn btn--sm btn--ghost" style={{ fontSize:10, padding:'2px 6px', color:C.red }} onClick={() => deleteCompany(co.id)}>✕</button>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:8, fontFamily:MONO, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>MRR</div>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:MONO, color:co.mrr > 0 ? C.accent : 'var(--muted)' }}>{co.mrr > 0 ? fmtCurrency(co.mrr) : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:8, fontFamily:MONO, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>Contacts</div>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:MONO }}>{coContacts.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:8, fontFamily:MONO, color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>Deals</div>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:MONO }}>{coDeals.length}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Badge label={co.status} color={statusColor} />
                  {co.employees && <span style={{ fontSize:10, color:'var(--muted)', fontFamily:MONO }}>{co.employees} employees</span>}
                </div>
                {coContacts.length > 0 && (
                  <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {coContacts.slice(0, 4).map(c => (
                        <span key={c.id} onClick={() => setSelCt(c)} style={{ fontSize:10, padding:'3px 8px', background:'var(--surface2)', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                          {c.avatar} {c.name.split(' ')[0]}
                        </span>
                      ))}
                      {coContacts.length > 4 && <span style={{ fontSize:10, color:'var(--muted)' }}>+{coContacts.length - 4}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail panel ──────────────────────────────────── */}
      {selectedContact && (
        <ContactDetail
          contact={safeContacts.find(c => c.id === selectedContact.id) ?? selectedContact}
          companies={safeCompanies}
          deals={deals}
          onUpdateContact={updateContact}
          onClose={() => setSelCt(null)}
          onEdit={ct => { setSelCt(null); setShowModal({ type:'editContact', data:ct }); }}
        />
      )}

      {/* ── Modals ────────────────────────────────────────── */}
      {showModal === 'newContact' && (
        <ContactModal companies={safeCompanies} onSave={saveContact} onClose={() => setShowModal(null)} />
      )}
      {showModal === 'newCompany' && (
        <CompanyModal onSave={saveCompany} onClose={() => setShowModal(null)} />
      )}
      {showModal?.type === 'editContact' && (
        <ContactModal contact={showModal.data} companies={safeCompanies} onSave={saveContact} onClose={() => setShowModal(null)} />
      )}
      {showModal?.type === 'editCompany' && (
        <CompanyModal company={showModal.data} onSave={saveCompany} onClose={() => setShowModal(null)} />
      )}
    </section>
  );
}
