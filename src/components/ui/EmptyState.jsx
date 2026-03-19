export default function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center', minHeight: 200,
    }}>
      {icon && <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>{icon}</div>}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dim)', fontFamily: 'var(--sans)', marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--sans)', maxWidth: 320, lineHeight: 1.5 }}>{subtitle}</div>}
      {action && onAction && (
        <button className="btn btn--primary" style={{ marginTop: 16, fontSize: 11 }} onClick={onAction}>{action}</button>
      )}
    </div>
  );
}
