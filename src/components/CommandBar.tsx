import type { FormEvent, RefObject } from "react";

interface CommandBarProps {
  draftUrl: string;
  inputRef: RefObject<HTMLInputElement>;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  onDraftChange: (value: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onSubmit: () => void;
  onHome: () => void;
}

export function CommandBar({
  draftUrl,
  inputRef,
  canGoBack,
  canGoForward,
  isLoading,
  onDraftChange,
  onGoBack,
  onGoForward,
  onReload,
  onSubmit,
  onHome
}: CommandBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="command-surface">
      <div className="window-controls" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="toolbar-cluster">
        <button disabled={!canGoBack} onClick={onGoBack} type="button">
          ←
        </button>
        <button disabled={!canGoForward} onClick={onGoForward} type="button">
          →
        </button>
        <button onClick={onReload} type="button">
          {isLoading ? "Stop" : "Reload"}
        </button>
        <button onClick={onHome} type="button">
          Home
        </button>
      </div>

      <form className="omnibar" onSubmit={handleSubmit}>
        <span className="omnibar__hint">Search or enter address</span>
        <input
          aria-label="Search or enter address"
          onChange={(event) => onDraftChange(event.target.value)}
          ref={inputRef}
          spellCheck={false}
          type="text"
          value={draftUrl}
        />
      </form>

      <div className="toolbar-cluster toolbar-cluster--secondary">
        <button type="button">Split view</button>
        <button type="button">Library</button>
      </div>
    </div>
  );
}
