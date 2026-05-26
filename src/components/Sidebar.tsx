import type { BrowserTab } from "../types";
import { compactUrl } from "../lib/browser";

interface SidebarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onActivate: (id: string) => void;
  onOpenTab: () => void;
}

const workspaces = [
  { label: "Explore", helper: "Tab cockpit" },
  { label: "Focus", helper: "Reading mode soon" },
  { label: "Bridge", helper: "Device handoff soon" }
];

export function Sidebar({
  tabs,
  activeTabId,
  onActivate,
  onOpenTab
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="eyebrow">Prism Browser</p>
          <h1>Calm browsing, tuned for real work.</h1>
        </div>
      </div>

      <button className="primary-cta" onClick={onOpenTab} type="button">
        <span className="primary-cta__icon">+</span>
        New tab
      </button>

      <section className="workspace-panel">
        <header>
          <p>Workspaces</p>
          <span>{workspaces.length}</span>
        </header>
        <div className="workspace-list">
          {workspaces.map((item) => (
            <button className="workspace-item" key={item.label} type="button">
              <strong>{item.label}</strong>
              <span>{item.helper}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar-tabs">
        <header>
          <p>Open tabs</p>
          <span>{tabs.length}</span>
        </header>
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              className={`tab-list-item${tab.id === activeTabId ? " is-active" : ""}`}
              key={tab.id}
              onClick={() => onActivate(tab.id)}
              type="button"
            >
              <span className="tab-list-item__accent" style={{ background: tab.accent }} />
              <span className="tab-list-item__content">
                <strong>{tab.title}</strong>
                <span>{compactUrl(tab.url)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
