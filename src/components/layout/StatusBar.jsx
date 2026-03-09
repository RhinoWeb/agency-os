import { Dot } from '../ui/index.jsx';

export default function StatusBar({ actAgents, serverOnline, timer, fmtTimer, clock, setShowCmd }) {
  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className="status-bar__item">
          <Dot status={serverOnline ? 'active' : 'paused'} />
          {actAgents.length} agent{actAgents.length !== 1 ? 's' : ''}
        </span>
        <div className="status-bar__separator" />
        <span className="status-bar__item">
          API {serverOnline ? 'OK' : 'DOWN'}
        </span>
        {timer.on && (
          <>
            <div className="status-bar__separator" />
            <span className="status-bar__item status-bar__timer">
              {fmtTimer(timer.sec)}
            </span>
          </>
        )}
      </div>
      <div className="status-bar__right">
        <button
          className="status-bar__hint"
          onClick={() => setShowCmd(p => !p)}
          style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
          aria-label="Open command palette"
        >
          Ctrl+K
        </button>
        <span className="status-bar__hint">? Help</span>
        {clock && <span className="status-bar__clock">{clock}</span>}
      </div>
    </div>
  );
}
