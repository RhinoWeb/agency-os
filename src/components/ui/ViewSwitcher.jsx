export default function ViewSwitcher({ views, active, onChange }) {
  return (
    <div className="view-switcher">
      {views.map(v => (
        <button
          key={v.id}
          className={`view-switcher__tab${active === v.id ? ' view-switcher__tab--active' : ''}`}
          onClick={() => onChange(v.id)}
        >
          {v.icon && <v.icon size={14} />}
          {v.label}
        </button>
      ))}
    </div>
  );
}
