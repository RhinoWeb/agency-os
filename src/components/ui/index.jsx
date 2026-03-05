import { C } from '../../theme.js';

// ── Status Dot ─────────────────────────────────────────────
export function Dot({ status }) {
  const cls = { active: 'dot dot--active', idle: 'dot dot--idle', paused: 'dot dot--paused' }[status] ?? 'dot';
  return <span className={cls} aria-label={`Status: ${status}`} />;
}

// ── Badge ──────────────────────────────────────────────────
export function Badge({ label, color }) {
  return (
    <span
      className="badge"
      style={{ color, borderColor: `${color}30`, background: `${color}10` }}
    >
      {label}
    </span>
  );
}

// ── Progress Bar ───────────────────────────────────────────
export function ProgressBar({ value, color = C.accent, height = 4 }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="pbar" style={{ height }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="pbar__fill" style={{ width: `${pct}%`, background: color, height: '100%' }} />
    </div>
  );
}

// ── Chart Tooltip ──────────────────────────────────────────
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip__row" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? `$${(p.value / 1000).toFixed(1)}k` : p.value}
        </div>
      ))}
    </div>
  );
}
