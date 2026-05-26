import type { BrowserTab } from "../types";

interface TabStripProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onActivate: (id: string) => void;
  onOpenTab: () => void;
  onCloseTab: (id: string) => void;
}

export function TabStrip({
  tabs,
  activeTabId,
  onActivate,
  onOpenTab,
  onCloseTab
}: TabStripProps) {
  return (
    <div className="tab-strip" role="tablist" aria-label="Open tabs">
      <div className="tab-strip__scroll">
        {tabs.map((tab) => (
          <div
            className={`tab-pill${tab.id === activeTabId ? " is-active" : ""}`}
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTabId}
          >
            <button className="tab-pill__main" onClick={() => onActivate(tab.id)} type="button">
              <span className="tab-pill__accent" style={{ background: tab.accent }} />
              <span className="tab-pill__content">
                <strong>{tab.title}</strong>
                <span>{tab.status}</span>
              </span>
            </button>

            {!tab.isPinned && (
              <button
                aria-label={`Close ${tab.title}`}
                className="tab-pill__close"
                onClick={() => onCloseTab(tab.id)}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      <button className="tab-strip__add" onClick={onOpenTab} type="button">
        New
      </button>
    </div>
  );
}
