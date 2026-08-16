// Keeps church JWTs out of WebView URLs (address bar, history, server logs, Referer headers).
// The token is handed to first-party pages as a short-lived cookie instead.
//
// Deliberately hand-rolled string parsing: React Native's URL polyfill appends the serialized
// searchParams to the original url instead of replacing the query, so `searchParams.delete("jwt")`
// followed by `toString()` leaves the jwt in place.

const SSO_HOSTS = ["lessons.church", "b1.church"];

// Base64url plus the separators a signed token can carry. Anything else (";", quotes, whitespace)
// could break out of the cookie value, so we refuse to inject it.
const SAFE_JWT = /^[A-Za-z0-9._~-]+$/;

const isSsoHost = (hostname: string) => SSO_HOSTS.some(host => hostname === host || hostname.endsWith("." + host));

const splitUrl = (url: string) => {
  const hashAt = url.indexOf("#");
  const hash = hashAt === -1 ? "" : url.slice(hashAt);
  const withoutHash = hashAt === -1 ? url : url.slice(0, hashAt);
  const queryAt = withoutHash.indexOf("?");
  return {
    base: queryAt === -1 ? withoutHash : withoutHash.slice(0, queryAt),
    query: queryAt === -1 ? "" : withoutHash.slice(queryAt + 1),
    hash
  };
};

// Only https first-party hosts may receive the cookie.
const canReceiveJwt = (base: string) => {
  const origin = /^(https?):\/\/(?:[^@/]*@)?([^:/?#]+)/i.exec(base);
  if (!origin) return false;
  return origin[1].toLowerCase() === "https" && isSsoHost(origin[2].toLowerCase());
};

export interface WebViewAuth {
  /** The url to load, with any `jwt` query parameter removed. */
  uri: string;
  /** Cookie-setting script for `injectedJavaScriptBeforeContentLoaded`, or undefined when no token applies. */
  script?: string;
}

export function prepareWebViewAuth(pageUrl: string, sessionJwt?: string): WebViewAuth {
  if (!pageUrl) return { uri: pageUrl };

  const { base, query, hash } = splitUrl(pageUrl);

  let urlJwt: string | undefined;
  let strippedJwt = false;
  const kept = (query ? query.split("&") : []).filter(pair => {
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    if (key.toLowerCase() !== "jwt") return true;
    strippedJwt = true;
    const value = eq === -1 ? "" : pair.slice(eq + 1);
    if (value) urlJwt = value;
    return false;
  });

  // Leave the url byte-for-byte alone unless we actually removed something.
  const uri = strippedJwt ? base + (kept.length ? "?" + kept.join("&") : "") + hash : pageUrl;

  const jwt = sessionJwt || urlJwt;
  if (!jwt || !SAFE_JWT.test(jwt) || !canReceiveJwt(base)) return { uri };

  const cookie = "jwt=" + jwt + "; path=/; Secure; SameSite=Lax; max-age=120";
  return { uri, script: `document.cookie = ${JSON.stringify(cookie)}; true;` };
}
