export type TabStatus = "idle" | "loading" | "ready" | "error";

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  accent: string;
  status: TabStatus;
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
