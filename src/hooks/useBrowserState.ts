import { useMemo, useReducer } from "react";
import type { BrowserTab } from "../types";
import { getDomainLabel, normalizeUrl } from "../lib/browser";
import { DEFAULT_HOME_URL } from "../lib/constants";

interface BrowserState {
  activeTabId: string;
  tabs: BrowserTab[];
  draftUrl: string;
}

type BrowserAction =
  | { type: "set-draft"; value: string }
  | { type: "activate"; id: string }
  | { type: "open"; payload?: Partial<BrowserTab> }
  | { type: "close"; id: string }
  | { type: "navigate"; id: string; url: string }
  | { type: "update"; id: string; patch: Partial<BrowserTab> };

const starterTabs: BrowserTab[] = [
  {
    id: crypto.randomUUID(),
    title: "OpenAI",
    url: "https://openai.com",
    accent: "#67e8f9",
    status: "idle",
    canGoBack: false,
    canGoForward: false,
    isPinned: true
  },
  {
    id: crypto.randomUUID(),
    title: "Wikipedia",
    url: "https://www.wikipedia.org",
    accent: "#f59e0b",
    status: "idle",
    canGoBack: false,
    canGoForward: false
  },
  {
    id: crypto.randomUUID(),
    title: "Termux Wiki",
    url: "https://wiki.termux.com",
    accent: "#34d399",
    status: "idle",
    canGoBack: false,
    canGoForward: false
  }
];

const initialState: BrowserState = {
  activeTabId: starterTabs[0].id,
  tabs: starterTabs,
  draftUrl: starterTabs[0].url
};

function createTab(payload?: Partial<BrowserTab>): BrowserTab {
  const url = payload?.url ? normalizeUrl(payload.url) : DEFAULT_HOME_URL;
  return {
    id: crypto.randomUUID(),
    title: payload?.title ?? getDomainLabel(url),
    url,
    accent: payload?.accent ?? "#a78bfa",
    status: payload?.status ?? "idle",
    canGoBack: false,
    canGoForward: false,
    isPinned: payload?.isPinned
  };
}

function reducer(state: BrowserState, action: BrowserAction): BrowserState {
  switch (action.type) {
    case "set-draft":
      return { ...state, draftUrl: action.value };
    case "activate": {
      const tab = state.tabs.find((entry) => entry.id === action.id);
      return tab
        ? { ...state, activeTabId: action.id, draftUrl: tab.url }
        : state;
    }
    case "open": {
      const tab = createTab(action.payload);
      return {
        ...state,
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        draftUrl: tab.url
      };
    }
    case "close": {
      if (state.tabs.length === 1) {
        return state;
      }

      const tabs = state.tabs.filter((entry) => entry.id !== action.id);
      const activeTabId =
        state.activeTabId === action.id ? tabs[Math.max(tabs.length - 1, 0)].id : state.activeTabId;
      const activeTab = tabs.find((entry) => entry.id === activeTabId) ?? tabs[0];

      return {
        ...state,
        tabs,
        activeTabId: activeTab.id,
        draftUrl: activeTab.url
      };
    }
    case "navigate": {
      const url = normalizeUrl(action.url);
      return {
        ...state,
        tabs: state.tabs.map((entry) =>
          entry.id === action.id
            ? {
                ...entry,
                url,
                title: entry.title === "New tab" ? getDomainLabel(url) : entry.title,
                status: "loading"
              }
            : entry
        ),
        draftUrl: state.activeTabId === action.id ? url : state.draftUrl
      };
    }
    case "update": {
      const tabs = state.tabs.map((entry) =>
        entry.id === action.id ? { ...entry, ...action.patch } : entry
      );
      const activeTab = tabs.find((entry) => entry.id === state.activeTabId);

      return {
        ...state,
        tabs,
        draftUrl: activeTab ? activeTab.url : state.draftUrl
      };
    }
    default:
      return state;
  }
}

export function useBrowserState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const activeTab = useMemo(
    () => state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0],
    [state.activeTabId, state.tabs]
  );

  return {
    state,
    activeTab,
    dispatch
  };
}
