import { useState } from 'react';

const TYPE_ICON = {
  success: '✅',
  info:    'ℹ️',
  warning: '⚠️',
  error:   '❌',
};

const TYPE_COLOR = {
  success: 'var(--green)',
  info:    'var(--accent)',
  warning: 'var(--yellow)',
  error:   'var(--red)',
};

const TYPE_BG = {
  success: 'rgba(47,199,142,0.06)',
  info:    'rgba(123,111,232,0.06)',
  warning: 'rgba(234,182,52,0.06)',
  error:   'rgba(239,107,107,0.06)',
};

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Notifications({ notifs, setNotifs, setTab, onClose }) {
  const [filter, setFilter] = useState('all');

  const unread = notifs.filter(n => !n.read).length;

  const visible = filter === 'all'
    ? notifs
    : notifs.filter(n => n.type === filter);

  function markAll() {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
  }

  function markOne(id) {
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function dismiss(id) {
    setNotifs(p => p.filter(n => n.id !== id));
  }

  function clearAll() {
    setNotifs([]);
  }

  function handleItemClick(n) {
    markOne(n.id);
    if (n.tab && setTab) {
      setTab(n.tab);
      onClose?.();
    }
  }

  const FILTERS = [
    { id: 'all',     label: 'All' },
    { id: 'success', label: '✅ Success' },
    { id: 'info',    label: 'ℹ️ Info' },
    { id: 'warning', label: '⚠️ Warn' },
    { id: 'error',   label: '❌ Error' },
  ];

  return (
    <aside
      className="notif-panel"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 54,
        right: 16,
        width: 380,
        maxHeight: 520,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: '0 16px 56px rgba(0,0,0,0.55)',
        zIndex: 500,
        animation: 'slideDown 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--sans)', flex: 1 }}>
          Notifications
          {unread > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 9, fontFamily: 'var(--mono)',
              background: 'var(--red)', color: '#fff',
              padding: '1px 6px', borderRadius: 10, fontWeight: 600,
            }}>
              {unread} new
            </span>
          )}
        </span>
        {unread > 0 && (
          <button
            onClick={markAll}
            style={{ fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', padding: '2px 4px' }}
          >
            Mark all read
          </button>
        )}
        {notifs.length > 0 && (
          <button
            onClick={clearAll}
            style={{ fontSize: 10, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--mono)', padding: '2px 4px' }}
          >
            Clear all
          </button>
        )}
        <button
          onClick={onClose}
          style={{ fontSize: 14, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}
          aria-label="Close notifications"
        >
          ✕
        </button>
      </div>

      {/* Filter tabs */}
      {notifs.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 4,
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '3px 10px',
                borderRadius: 20,
                border: '1px solid',
                cursor: 'pointer',
                fontSize: 10,
                fontFamily: 'var(--mono)',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s',
                borderColor: filter === f.id ? 'var(--accent)' : 'var(--border)',
                color:       filter === f.id ? 'var(--accent)' : 'var(--muted)',
                background:  filter === f.id ? 'rgba(123,111,232,0.1)' : 'transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {visible.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--dim)', marginBottom: 4 }}>
              {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications`}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {filter === 'all' ? 'New activity will appear here' : 'Try a different filter'}
            </div>
          </div>
        )}

        {visible.map(n => (
          <div
            key={n.id}
            onClick={() => handleItemClick(n)}
            style={{
              padding: '11px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              cursor: n.tab ? 'pointer' : 'default',
              background: n.read ? 'transparent' : TYPE_BG[n.type] ?? 'transparent',
              transition: 'background 0.12s',
              position: 'relative',
            }}
            onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = 'var(--surface2)'; else e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : (TYPE_BG[n.type] ?? 'transparent'); }}
          >
            {/* Unread dot */}
            {!n.read && (
              <div style={{
                position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                width: 5, height: 5, borderRadius: '50%',
                background: TYPE_COLOR[n.type] ?? 'var(--accent)',
              }} />
            )}

            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
              {TYPE_ICON[n.type] ?? 'ℹ️'}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, lineHeight: 1.5,
                color: n.read ? 'var(--dim)' : 'var(--text)',
                fontWeight: n.read ? 400 : 500,
              }}>
                {n.text}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, fontFamily: 'var(--mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {n.timestamp ? timeAgo(n.timestamp) : (n.time ? `${n.time} ago` : '')}
                {n.tab && <span style={{ color: 'var(--accent)', fontSize: 9 }}>→ View</span>}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); dismiss(n.id); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', fontSize: 12, padding: '2px 4px',
                lineHeight: 1, flexShrink: 0, opacity: 0,
                transition: 'opacity 0.1s',
              }}
              aria-label="Dismiss notification"
              className="notif-dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      {notifs.length > 0 && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 10,
          color: 'var(--muted)',
          fontFamily: 'var(--mono)',
          flexShrink: 0,
          textAlign: 'center',
        }}>
          {notifs.length} notification{notifs.length !== 1 ? 's' : ''} · {unread} unread
        </div>
      )}
    </aside>
  );
}
