import { useEffect, useRef } from 'react';

/**
 * ConfirmModal — branded replacement for window.confirm()
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *   // trigger:
 *   setConfirm({ title: 'Delete lead?', message: 'This cannot be undone.', danger: true, onConfirm: () => deleteLead(id) });
 *   // in JSX:
 *   {confirm && <ConfirmModal {...confirm} onClose={() => setConfirm(null)} />}
 */
export default function ConfirmModal({
  title        = 'Are you sure?',
  message      = '',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  danger       = false,
  onConfirm,
  onClose,
}) {
  const confirmRef = useRef(null);

  // Focus the confirm button on mount, handle Escape
  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleConfirm() {
    onConfirm?.();
    onClose?.();
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{ zIndex: 2000 }}
    >
      <div
        className="modal"
        style={{
          maxWidth: 400,
          gap: 0,
          padding: 0,
          overflow: 'hidden',
          borderColor: danger ? 'rgba(239,107,107,0.25)' : 'var(--border)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              background: danger ? 'rgba(239,107,107,0.12)' : 'rgba(123,111,232,0.12)',
              color: danger ? 'var(--red)' : 'var(--accent)',
            }}
          >
            {danger ? '⚠' : '?'}
          </span>
          <h2
            id="confirm-title"
            style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700, margin: 0 }}
          >
            {title}
          </h2>
        </div>

        {/* Body */}
        {message && (
          <div style={{
            padding: '14px 24px',
            fontSize: 13,
            color: 'var(--dim)',
            lineHeight: 1.6,
          }}>
            {message}
          </div>
        )}

        {/* Actions */}
        <div style={{
          padding: '12px 24px 20px',
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
        }}>
          <button
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            style={{ minWidth: 80 }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            className={`btn btn--sm${danger ? '' : ' btn--primary'}`}
            onClick={handleConfirm}
            style={danger ? {
              background: 'rgba(239,107,107,0.12)',
              borderColor: 'rgba(239,107,107,0.35)',
              color: 'var(--red)',
              minWidth: 80,
            } : { minWidth: 80 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
