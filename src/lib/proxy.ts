import { isDesktopRuntime } from "./runtime";

export function getViewportSrc(url: string) {
  if (isDesktopRuntime()) {
    return url;
  }

  const proxyUrl = new URL("/api/proxy", window.location.origin);
  proxyUrl.searchParams.set("url", url);
  return proxyUrl.toString();
}
