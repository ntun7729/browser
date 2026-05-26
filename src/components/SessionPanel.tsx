interface SessionPanelProps {
  platform: string;
  engine: string;
  activeTitle: string;
}

const shortcuts = [
  { keys: "Ctrl/Cmd + L", label: "Focus address bar" },
  { keys: "Ctrl/Cmd + T", label: "Open tab" },
  { keys: "Ctrl/Cmd + W", label: "Close tab" },
  { keys: "Ctrl/Cmd + R", label: "Reload page" }
];

export function SessionPanel({
  platform,
  engine,
  activeTitle
}: SessionPanelProps) {
  return (
    <section className="session-panel">
      <header className="session-panel__header">
        <div>
          <p className="eyebrow">Session</p>
          <h3>{activeTitle}</h3>
        </div>
        <span>{platform}</span>
      </header>

      <div className="session-panel__stats">
        <div>
          <span>Shell</span>
          <strong>{engine}</strong>
        </div>
        <div>
          <span>Delivery</span>
          <strong>{platform}</strong>
        </div>
      </div>

      <div className="shortcut-list">
        {shortcuts.map((shortcut) => (
          <div className="shortcut-row" key={shortcut.keys}>
            <strong>{shortcut.keys}</strong>
            <span>{shortcut.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
