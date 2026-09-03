import "server-only";

function asRootUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * QR payloads always use the public root. Deployments can pin that origin with
 * SITE_URL; development and preview environments fall back to this request.
 */
export function getCanonicalPublicMenuUrl(requestOrigin: string): string {
  return (
    (process.env.SITE_URL ? asRootUrl(process.env.SITE_URL) : null) ??
    asRootUrl(requestOrigin) ??
    "http://localhost:3000/"
  );
}
