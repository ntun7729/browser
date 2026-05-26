import { useEffect, useMemo, useRef } from "react";
import { CommandBar } from "./components/CommandBar";
import { SessionPanel } from "./components/SessionPanel";
import { Sidebar } from "./components/Sidebar";
import { TabStrip } from "./components/TabStrip";
import { WelcomePanel } from "./components/WelcomePanel";
import { getDomainLabel, normalizeUrl } from "./lib/browser";
import { DEFAULT_HOME_URL } from "./lib/constants";
import { useBrowserState } from "./hooks/useBrowserState";

function App() {
  const { state, activeTab, dispatch } = useBrowserState();
  const webviewRefs = useRef<Record<string, Electron.WebviewTag | null>>({});
  const omnibarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    state.tabs.forEach((tab) => {
      const webview = webviewRefs.current[tab.id];

      if (!webview || webview.dataset.bound === "true") {
        return;
      }

      webview.dataset.bound = "true";

      webview.addEventListener("did-start-loading", () => {
        dispatch({
          type: "update",
          id: tab.id,
          patch: { status: "loading" }
        });
      });

      webview.addEventListener("did-stop-loading", () => {
        dispatch({
          type: "update",
          id: tab.id,
          patch: {
            status: "ready",
            url: webview.getURL() || tab.url,
            title: webview.getTitle() || getDomainLabel(webview.getURL() || tab.url),
            canGoBack: webview.canGoBack(),
            canGoForward: webview.canGoForward()
          }
        });
      });

      webview.addEventListener("page-title-updated", () => {
        dispatch({
          type: "update",
          id: tab.id,
          patch: {
            title: webview.getTitle() || getDomainLabel(webview.getURL() || tab.url)
          }
        });
      });

      webview.addEventListener("did-fail-load", () => {
        dispatch({
          type: "update",
          id: tab.id,
          patch: { status: "error" }
        });
      });
    });
  }, [dispatch, state.tabs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.ctrlKey || event.metaKey;

      if (!isMeta) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "l") {
        event.preventDefault();
        omnibarRef.current?.focus();
        omnibarRef.current?.select();
        return;
      }

      if (key === "t") {
        event.preventDefault();
        dispatch({ type: "open" });
        return;
      }

      if (key === "w" && !activeTab.isPinned && state.tabs.length > 1) {
        event.preventDefault();
        dispatch({ type: "close", id: activeTab.id });
        return;
      }

      if (key === "r") {
        event.preventDefault();
        withActiveWebview((webview) => webview.reload());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTab.id, activeTab.isPinned, dispatch, state.tabs.length]);

  const metrics = useMemo(
    () => [
      { label: "Tabs", value: String(state.tabs.length) },
      { label: "Runtime", value: window.prismDesktop?.version ? "Electron" : "Shell" },
      { label: "Focus", value: activeTab.status }
    ],
    [activeTab.status, state.tabs.length]
  );

  const navigateActiveTab = (input: string) => {
    const url = normalizeUrl(input);
    dispatch({ type: "navigate", id: activeTab.id, url });
    const webview = webviewRefs.current[activeTab.id];
    webview?.loadURL(url);
  };

  const withActiveWebview = (callback: (webview: Electron.WebviewTag) => void) => {
    const webview = webviewRefs.current[activeTab.id];
    if (webview) {
      callback(webview);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeTabId={state.activeTabId}
        onActivate={(id) => dispatch({ type: "activate", id })}
        onOpenTab={() => dispatch({ type: "open" })}
        tabs={state.tabs}
      />

      <main className="workspace">
        <header className="workspace-header">
          <TabStrip
            activeTabId={state.activeTabId}
            onActivate={(id) => dispatch({ type: "activate", id })}
            onCloseTab={(id) => dispatch({ type: "close", id })}
            onOpenTab={() => dispatch({ type: "open" })}
            tabs={state.tabs}
          />

          <CommandBar
            canGoBack={activeTab.canGoBack}
            canGoForward={activeTab.canGoForward}
            draftUrl={state.draftUrl}
            inputRef={omnibarRef}
            isLoading={activeTab.status === "loading"}
            onDraftChange={(value) => dispatch({ type: "set-draft", value })}
            onGoBack={() =>
              withActiveWebview((webview) => {
                webview.goBack();
              })
            }
            onGoForward={() =>
              withActiveWebview((webview) => {
                webview.goForward();
              })
            }
            onHome={() => navigateActiveTab(DEFAULT_HOME_URL)}
            onReload={() =>
              withActiveWebview((webview) => {
                if (activeTab.status === "loading") {
                  webview.stop();
                  return;
                }
                webview.reload();
              })
            }
            onSubmit={() => navigateActiveTab(state.draftUrl)}
          />

          <section className="hero-strip">
            <div>
              <p className="eyebrow">Focused session</p>
              <h2>{activeTab.title}</h2>
              <span>{activeTab.url}</span>
            </div>
            <div className="metric-row">
              {metrics.map((metric) => (
                <div className="metric-chip" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </header>

        <section className="canvas">
          <div className="canvas-sidecar">
            <WelcomePanel onLaunch={navigateActiveTab} />
            <SessionPanel
              activeTitle={activeTab.title}
              engine={window.prismDesktop?.version ?? "webview"}
              platform={window.prismDesktop?.platform ?? "linux"}
            />
          </div>

          <div className="webview-stack">
            {state.tabs.map((tab) => (
              <div
                className={`webview-frame${tab.id === state.activeTabId ? " is-active" : ""}`}
                key={tab.id}
              >
                <div className="webview-frame__header">
                  <span className={`status-dot status-${tab.status}`} />
                  <div>
                    <strong>{tab.title}</strong>
                    <span>{tab.url}</span>
                  </div>
                  {!tab.isPinned && (
                    <button
                      onClick={() => dispatch({ type: "close", id: tab.id })}
                      type="button"
                    >
                      Close
                    </button>
                  )}
                </div>

                <webview
                  className="browser-webview"
                  partition="persist:prism"
                  ref={(node) => {
                    webviewRefs.current[tab.id] = node;
                  }}
                  src={tab.url}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
