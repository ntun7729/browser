export function isDesktopRuntime() {
  return Boolean(window.prismDesktop?.version);
}

export function getRuntimeLabel() {
  return isDesktopRuntime() ? "Electron" : "Cloudflare";
}

export function getRuntimeEngine() {
  return window.prismDesktop?.version ?? "worker-proxy";
}

export function getPlatformLabel() {
  return window.prismDesktop?.platform ?? "web";
}
