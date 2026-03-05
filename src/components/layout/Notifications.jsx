const TYPE_ICON = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };

export default function Notifications({ notifs }) {
  return (
    <aside
      className="notif-panel"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <header className="notif-header section-label">Notifications</header>
      {notifs.map(n => (
        <div key={n.id} className="notif-item" style={{ opacity: n.read ? 0.6 : 1 }}>
          <span aria-hidden="true">{TYPE_ICON[n.type]}</span>
          <div>
            <div>{n.text}</div>
            <div className="notif-time">{n.time} ago</div>
          </div>
        </div>
      ))}
    </aside>
  );
}
