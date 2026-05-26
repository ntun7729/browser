const HOP_BY_HOP_HEADERS = [
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
  "frame-options",
  "report-to",
  "nel",
  "cross-origin-opener-policy",
  "cross-origin-embedder-policy",
  "permissions-policy"
];

const HTML_ATTRIBUTES = [
  ["a", "href"],
  ["link", "href"],
  ["img", "src"],
  ["script", "src"],
  ["iframe", "src"],
  ["source", "src"],
  ["video", "src"],
  ["audio", "src"],
  ["track", "src"],
  ["form", "action"]
];

function normalizeTarget(urlParam) {
  if (!urlParam) {
    return null;
  }

  try {
    const target = new URL(urlParam);
    if (!["http:", "https:"].includes(target.protocol)) {
      return null;
    }
    return target;
  } catch {
    return null;
  }
}

function toProxyUrl(target, requestUrl) {
  const proxyUrl = new URL("/api/proxy", requestUrl);
  proxyUrl.searchParams.set("url", target.toString());
  return proxyUrl.toString();
}

function resolveAttribute(value, origin) {
  if (!value || value.startsWith("data:") || value.startsWith("javascript:") || value.startsWith("#")) {
    return null;
  }

  try {
    return new URL(value, origin);
  } catch {
    return null;
  }
}

function rewriteCssUrls(cssText, origin, requestUrl) {
  const rewriteMatch = (value) => {
    const cleaned = value.trim().replace(/^["']|["']$/g, "");
    const resolved = resolveAttribute(cleaned, origin);
    if (!resolved) {
      return value;
    }

    return `"${toProxyUrl(resolved, requestUrl)}"`;
  };

  return cssText
    .replace(/url\(([^)]+)\)/g, (full, value) => `url(${rewriteMatch(value)})`)
    .replace(/@import\s+(?:url\()?([^);]+)\)?/g, (full, value) => `@import url(${rewriteMatch(value)})`);
}

class RewriteAttributeHandler {
  constructor(attribute, origin, requestUrl) {
    this.attribute = attribute;
    this.origin = origin;
    this.requestUrl = requestUrl;
  }

  element(element) {
    const current = element.getAttribute(this.attribute);
    const resolved = resolveAttribute(current, this.origin);
    if (!resolved) {
      return;
    }

    element.setAttribute(this.attribute, toProxyUrl(resolved, this.requestUrl));
  }
}

class InjectBaseHandler {
  constructor(origin) {
    this.origin = origin;
  }

  element(element) {
    element.prepend(`<base href="${this.origin}">`, { html: true });
  }
}

async function proxyRequest(request) {
  const requestUrl = new URL(request.url);
  const target = normalizeTarget(requestUrl.searchParams.get("url"));

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing or invalid url query parameter." }), {
      status: 400,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*"
      }
    });
  }

  if (target.hostname === requestUrl.hostname && target.pathname.startsWith("/api/proxy")) {
    return new Response(JSON.stringify({ error: "Recursive proxy requests are not allowed." }), {
      status: 400,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*"
      }
    });
  }

  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.set("origin", target.origin);
  upstreamHeaders.set("referer", target.origin);

  const upstreamResponse = await fetch(target, {
    method: request.method,
    headers: upstreamHeaders,
    redirect: "follow",
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body
  });

  const headers = new Headers(upstreamResponse.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  headers.set("access-control-allow-origin", "*");
  headers.set("x-prism-proxied-by", "cloudflare-worker");

  const contentType = headers.get("content-type") || "";
  if (contentType.includes("text/css")) {
    const cssText = await upstreamResponse.text();
    return new Response(rewriteCssUrls(cssText, target, request.url), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers
    });
  }

  if (!contentType.includes("text/html")) {
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers
    });
  }

  const htmlRewriter = new HTMLRewriter().on("head", new InjectBaseHandler(target.origin));

  HTML_ATTRIBUTES.forEach(([selector, attribute]) => {
    htmlRewriter.on(selector, new RewriteAttributeHandler(attribute, target, request.url));
  });

  return htmlRewriter.transform(
    new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers
    })
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS",
          "access-control-allow-headers": request.headers.get("access-control-request-headers") || "*"
        }
      });
    }

    if (url.pathname === "/api/proxy") {
      return proxyRequest(request);
    }

    return env.ASSETS.fetch(request);
  }
};
