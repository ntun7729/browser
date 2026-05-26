export type TabStatus = "idle" | "loading" | "ready" | "error";

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  accent: string;
  status: TabStatus;
  history: string[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isPinned?: boolean;
}

export interface SuggestionGroup {
  title: string;
  items: Array<{
    label: string;
    value: string;
    helper: string;
  }>;
}
