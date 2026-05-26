import { DEFAULT_HOME_URL } from "./constants";

const SEARCH_PREFIX = "https://duckduckgo.com/?q=";

export function normalizeUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return DEFAULT_HOME_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes(" ") || !trimmed.includes(".")) {
    return `${SEARCH_PREFIX}${encodeURIComponent(trimmed)}`;
  }

  return `https://${trimmed}`;
}

export function getDomainLabel(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname || "New tab";
  } catch {
    return "New tab";
  }
}

export function compactUrl(url: string) {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return url;
  }
}
