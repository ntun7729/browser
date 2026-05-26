/// <reference types="vite/client" />

declare global {
  interface Window {
    prismDesktop?: {
      platform: string;
      version: string;
    };
  }

  namespace Electron {
    interface WebviewTag extends HTMLElement {
      canGoBack(): boolean;
      canGoForward(): boolean;
      getTitle(): string;
      getURL(): string;
      goBack(): void;
      goForward(): void;
      loadURL(url: string): void;
      reload(): void;
      stop(): void;
      dataset: DOMStringMap;
      addEventListener(
        type:
          | "did-start-loading"
          | "did-stop-loading"
          | "page-title-updated"
          | "did-fail-load",
        listener: EventListenerOrEventListenerObject
      ): void;
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<
        React.HTMLAttributes<Electron.WebviewTag>,
        Electron.WebviewTag
      > & {
        partition?: string;
        src?: string;
      };
    }
  }
}

export {};
