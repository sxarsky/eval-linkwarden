/**
 * normalizeUrl: canonicalize a URL for deduplication and storage.
 *
 * Transformations applied (in order):
 *   1. Lowercases the host
 *   2. Removes trailing slashes from the path
 *   3. Removes utm_* query parameters
 *   4. Sorts remaining query parameters for deterministic output
 *
 * Returns the original string if parsing fails (e.g. relative URLs).
 */
export function normalizeUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }

  url.hostname = url.hostname.toLowerCase();

  // Remove trailing slashes from pathname
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";

  // Remove UTM params
  const keysToDelete: string[] = [];
  url.searchParams.forEach((_val, key) => {
    if (key.startsWith("utm_")) keysToDelete.push(key);
  });
  keysToDelete.forEach((k) => url.searchParams.delete(k));

  // Sort remaining params for deterministic output
  url.searchParams.sort();

  return url.toString();
}
